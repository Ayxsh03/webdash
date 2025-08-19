#!/usr/bin/env python3
import cv2
import asyncio
import asyncpg
import logging
import threading
import queue
import time
import requests
from ultralytics import YOLO
from datetime import datetime
import json
import os
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('multi_camera_detection.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configuration
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres"
API_BASE_URL = "http://localhost:8000/api/v1"
API_KEY = "secure-detection-api-key-2024"  # Set this in environment or config
CONFIDENCE_THRESHOLD = 0.5
DETECTION_RESOLUTION = (640, 480)

class CameraDetector:
    """Individual camera detection handler"""
    
    def __init__(self, camera_id: str, camera_name: str, rtsp_url: str):
        self.camera_id = camera_id
        self.camera_name = camera_name
        self.rtsp_url = rtsp_url
        self.model = YOLO('yolov8n.pt')
        self.frame_queue = queue.Queue(maxsize=10)
        self.stop_event = threading.Event()
        self.is_running = False
        self.last_heartbeat = time.time()
        
    async def update_camera_status(self, status: str):
        """Update camera status in database"""
        try:
            response = requests.put(
                f"{API_BASE_URL}/cameras/{self.camera_id}/status",
                json={"status": status},
                headers={"X-API-Key": API_KEY}
            )
            if response.status_code == 200:
                logger.info(f"Camera {self.camera_name} status updated to {status}")
            else:
                logger.error(f"Failed to update camera status: {response.status_code}")
        except Exception as e:
            logger.error(f"Error updating camera status: {e}")
    
    def frame_grabber(self):
        """Capture frames from RTSP stream"""
        cap = None
        reconnect_delay = 1
        max_reconnect_delay = 30
        
        while not self.stop_event.is_set():
            try:
                if cap is None:
                    logger.info(f"Connecting to camera {self.camera_name} at {self.rtsp_url}")
                    cap = cv2.VideoCapture(self.rtsp_url)
                    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                    cap.set(cv2.CAP_PROP_FPS, 15)
                    
                if not cap.isOpened():
                    logger.warning(f"Failed to open camera {self.camera_name}")
                    cap = None
                    time.sleep(reconnect_delay)
                    reconnect_delay = min(reconnect_delay * 2, max_reconnect_delay)
                    continue
                
                ret, frame = cap.read()
                if ret:
                    # Reset reconnect delay on successful frame
                    reconnect_delay = 1
                    
                    # Update heartbeat
                    self.last_heartbeat = time.time()
                    
                    # Resize frame for detection
                    frame_resized = cv2.resize(frame, DETECTION_RESOLUTION)
                    
                    # Add to queue (non-blocking)
                    try:
                        self.frame_queue.put(frame_resized, block=False)
                    except queue.Full:
                        # Remove oldest frame and add new one
                        try:
                            self.frame_queue.get_nowait()
                            self.frame_queue.put(frame_resized, block=False)
                        except queue.Empty:
                            pass
                else:
                    logger.warning(f"Failed to read frame from camera {self.camera_name}")
                    cap.release()
                    cap = None
                    time.sleep(reconnect_delay)
                    reconnect_delay = min(reconnect_delay * 2, max_reconnect_delay)
                    
            except Exception as e:
                logger.error(f"Error in frame grabber for camera {self.camera_name}: {e}")
                if cap:
                    cap.release()
                    cap = None
                time.sleep(reconnect_delay)
                reconnect_delay = min(reconnect_delay * 2, max_reconnect_delay)
        
        if cap:
            cap.release()
        logger.info(f"Frame grabber stopped for camera {self.camera_name}")
    
    async def log_detection_event(self, person_id: int, confidence: float, bbox: List[float]):
        """Log detection event via API"""
        try:
            event_data = {
                "timestamp": datetime.now().isoformat(),
                "person_id": person_id,
                "confidence": confidence,
                "camera_name": self.camera_name,
                "alert_sent": False,
                "metadata": {
                    "bbox": bbox,
                    "location": self.camera_name
                }
            }
            
            response = requests.post(
                f"{API_BASE_URL}/events",
                json=event_data,
                headers={
                    "X-API-Key": API_KEY,
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                logger.info(f"Detection event logged for camera {self.camera_name}")
            else:
                logger.error(f"Failed to log detection event: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"Error logging detection event: {e}")
    
    def start(self):
        """Start camera detection"""
        if self.is_running:
            return
            
        logger.info(f"Starting detection for camera {self.camera_name}")
        self.is_running = True
        self.stop_event.clear()
        
        # Start frame grabber thread
        self.frame_grabber_thread = threading.Thread(target=self.frame_grabber)
        self.frame_grabber_thread.start()
        
        # Update camera status to online
        asyncio.create_task(self.update_camera_status("online"))
    
    def stop(self):
        """Stop camera detection"""
        if not self.is_running:
            return
            
        logger.info(f"Stopping detection for camera {self.camera_name}")
        self.is_running = False
        self.stop_event.set()
        
        # Wait for frame grabber thread to finish
        if hasattr(self, 'frame_grabber_thread'):
            self.frame_grabber_thread.join(timeout=5)
        
        # Update camera status to offline
        asyncio.create_task(self.update_camera_status("offline"))
    
    async def process_detections(self):
        """Main detection processing loop"""
        while self.is_running:
            try:
                # Get frame from queue (non-blocking)
                try:
                    frame = self.frame_queue.get_nowait()
                except queue.Empty:
                    await asyncio.sleep(0.1)
                    continue
                
                # Run detection
                results = self.model.track(frame, persist=True, verbose=False)
                
                if results[0].boxes is not None:
                    for box in results[0].boxes:
                        # Filter for person class (class 0 in COCO dataset)
                        if int(box.cls) == 0 and float(box.conf) > CONFIDENCE_THRESHOLD:
                            
                            # Get bounding box coordinates
                            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                            confidence = float(box.conf)
                            
                            # Get track ID if available
                            person_id = int(box.id) if box.id is not None else 0
                            
                            # Log detection event
                            await self.log_detection_event(
                                person_id=person_id,
                                confidence=confidence,
                                bbox=[float(x1), float(y1), float(x2), float(y2)]
                            )
                
                # Small delay to prevent excessive CPU usage
                await asyncio.sleep(0.05)
                
            except Exception as e:
                logger.error(f"Error in detection processing for camera {self.camera_name}: {e}")
                await asyncio.sleep(1)

class MultiCameraManager:
    """Manages multiple camera detectors"""
    
    def __init__(self):
        self.cameras: Dict[str, CameraDetector] = {}
        self.is_running = False
    
    async def load_cameras_from_db(self):
        """Load camera configurations from database"""
        try:
            response = requests.get(f"{API_BASE_URL}/cameras")
            if response.status_code == 200:
                cameras_data = response.json()
                logger.info(f"Loaded {len(cameras_data)} cameras from database")
                
                for camera in cameras_data:
                    camera_id = camera['id']
                    camera_name = camera['name']
                    rtsp_url = camera['rtsp_url']
                    
                    detector = CameraDetector(camera_id, camera_name, rtsp_url)
                    self.cameras[camera_id] = detector
                    logger.info(f"Added camera: {camera_name} ({camera_id})")
            else:
                logger.error(f"Failed to load cameras: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error loading cameras from database: {e}")
    
    async def start_all_cameras(self):
        """Start detection for all cameras"""
        self.is_running = True
        
        # Start all camera detectors
        for camera_id, detector in self.cameras.items():
            detector.start()
        
        # Start detection processing for all cameras
        tasks = []
        for camera_id, detector in self.cameras.items():
            task = asyncio.create_task(detector.process_detections())
            tasks.append(task)
        
        # Wait for all tasks to complete
        await asyncio.gather(*tasks)
    
    async def stop_all_cameras(self):
        """Stop detection for all cameras"""
        self.is_running = False
        
        for camera_id, detector in self.cameras.items():
            detector.stop()
        
        logger.info("All cameras stopped")
    
    async def monitor_health(self):
        """Monitor camera health and restart if needed"""
        while self.is_running:
            try:
                current_time = time.time()
                
                for camera_id, detector in self.cameras.items():
                    # Check if camera hasn't received frames recently
                    if current_time - detector.last_heartbeat > 30:  # 30 seconds timeout
                        logger.warning(f"Camera {detector.camera_name} appears to be offline")
                        await detector.update_camera_status("offline")
                    else:
                        await detector.update_camera_status("online")
                
                await asyncio.sleep(15)  # Check every 15 seconds
                
            except Exception as e:
                logger.error(f"Error in health monitoring: {e}")
                await asyncio.sleep(15)

async def main():
    """Main function"""
    logger.info("Starting Multi-Camera Detection System")
    
    # Create manager
    manager = MultiCameraManager()
    
    # Load cameras from database
    await manager.load_cameras_from_db()
    
    if not manager.cameras:
        logger.error("No cameras loaded. Exiting.")
        return
    
    try:
        # Start health monitoring
        health_task = asyncio.create_task(manager.monitor_health())
        
        # Start all cameras
        detection_task = asyncio.create_task(manager.start_all_cameras())
        
        # Wait for tasks to complete
        await asyncio.gather(health_task, detection_task)
        
    except KeyboardInterrupt:
        logger.info("Received interrupt signal, shutting down...")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
    finally:
        await manager.stop_all_cameras()
        logger.info("Multi-Camera Detection System stopped")

if __name__ == "__main__":
    asyncio.run(main())