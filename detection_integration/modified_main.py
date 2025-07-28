import os
import cv2
import time
import threading
import queue as queue_module
from ultralytics import YOLO
import uuid
import asyncpg
import asyncio
import json
from datetime import datetime
from utils import send_telegram_image_alert, send_telegram_text_alert, send_alert_async, send_ip_alert, _play_siren_blocking

# Configurations
RTSP_URL = "rtsp://admin:4PEL%232025@192.168.29.133:554/h264"
DETECT_RES = (1280, 720)
QUEUE_MAXSIZE = 5
CONF_THRESHOLD = 0.3
EMA_ALPHA = 0.2
RETRY_DELAY = 0.5
RECONNECT_ATTEMPTS = 3
CAMERA_NAME = "Office"

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/detection_db")

# Logger Setup
import logging
LOGS_DIR = os.path.join(os.getcwd(), "logs")
os.makedirs(LOGS_DIR, exist_ok=True)

LOG_FILE = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
LOG_FILE_PATH = os.path.join(LOGS_DIR, LOG_FILE)

logging.basicConfig(
    filename=LOG_FILE_PATH,
    format="%(asctime)s [%(levelname)s] %(message)s",
    level=logging.INFO,
)

logger = logging.getLogger("PersonTracker")
logger.info("Logger initialized.")

model = YOLO("yolov8n.pt")
logger.info("YOLOv8 model loaded.")

# Database Functions
async def create_db_connection():
    """Create database connection"""
    try:
        return await asyncpg.connect(DATABASE_URL)
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return None

async def log_detection_event(person_id, confidence, image_path=None, bbox=None):
    """Log detection event to database"""
    conn = await create_db_connection()
    if not conn:
        return
    
    try:
        # Update camera heartbeat
        await conn.execute(
            "SELECT update_camera_heartbeat($1)",
            CAMERA_NAME
        )
        
        # Insert detection event
        metadata = {"bbox": bbox} if bbox else {}
        
        await conn.execute("""
            INSERT INTO detection_events 
            (timestamp, person_id, confidence, camera_name, image_path, alert_sent, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """, 
            datetime.now(),
            person_id,
            confidence,
            CAMERA_NAME,
            image_path,
            True,  # We're sending alerts
            json.dumps(metadata)
        )
        
        logger.info(f"Logged detection event for person ID {person_id}")
        
    except Exception as e:
        logger.error(f"Failed to log detection event: {e}")
    finally:
        await conn.close()

def run_async_db_operation(coro):
    """Run async database operation in sync context"""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If we're in an async context, schedule the task
            asyncio.create_task(coro)
        else:
            loop.run_until_complete(coro)
    except RuntimeError:
        # No event loop, create a new one
        asyncio.run(coro)

# Frame Grabber Thread
frame_queue = queue_module.Queue(maxsize=QUEUE_MAXSIZE)
stop_event = threading.Event()

def frame_grabber(rtsp_url, frame_queue, stop_event):
    attempts = 0
    os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = (
        "rtsp_transport;tcp;"
        "fflags;genpts+nobuffer;"
        "flags;low_delay;"
        "flags2;showall;"
        "vsync;0;"
        "reset_timestamps;1"
    )

    cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
    if not cap.isOpened():
        logger.error("Unable to open RTSP stream.")
        stop_event.set()
        return

    while not stop_event.is_set():
        ret, frame = cap.read()
        if not ret:
            attempts += 1
            logger.warning(f"Frame read failed ({attempts}/{RECONNECT_ATTEMPTS})")
            time.sleep(RETRY_DELAY)
            if attempts >= RECONNECT_ATTEMPTS:
                logger.warning("Attempting to reconnect to RTSP stream.")
                cap.release()
                cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
                attempts = 0
            continue
        attempts = 0

        try:
            frame_queue.put(frame, timeout=0.5)
        except queue_module.Full:
            _ = frame_queue.get_nowait()
            try:
                frame_queue.put(frame, timeout=0.5)
            except queue_module.Full:
                pass

    cap.release()
    logger.info("Frame grabber thread stopped.")

# Schedule Alert
from datetime import time as dt_time

def is_alert_allowed():
    now = datetime.now().time()
    start = dt_time(7, 0)  # 07:00
    end = dt_time(6, 0)    # 06:00
    return now >= start or now <= end

# Main loop
person_last_alert = {}
person_cooldown = 10

def main():
    grab_thread = threading.Thread(
        target=frame_grabber,
        args=(RTSP_URL, frame_queue, stop_event),
        daemon=True
    )
    grab_thread.start()

    logger.info("Frame grabber thread started.")
    fps_ema = None
    last_log_time = time.time()

    try:
        while not stop_event.is_set():
            try:
                frame = frame_queue.get(timeout=1.0)
                start = time.time()
            except queue_module.Empty:
                continue

            small = cv2.resize(frame, DETECT_RES)
            results = model.track(small, classes=[0], persist=True, verbose=False)

            output = frame.copy()
            if results and results[0].boxes is not None:
                x_scale = frame.shape[1] / DETECT_RES[0]
                y_scale = frame.shape[0] / DETECT_RES[1]
                current_time = time.time()
                
                for box in results[0].boxes:
                    conf = float(box.conf)
                    if conf < CONF_THRESHOLD:
                        continue
                        
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    x1, x2 = int(x1 * x_scale), int(x2 * x_scale)
                    y1, y2 = int(y1 * y_scale), int(y2 * y_scale)

                    person_id = getattr(box, "id", None)
                    if person_id is None:
                        continue
                    person_id = int(person_id.item())

                    # Draw rectangle and label
                    cv2.rectangle(output, (x1, y1), (x2, y2), (255, 0, 0), 2)
                    label = f"ID:{person_id} | {conf:.2f}"
                    cv2.putText(output, label, (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

                    last_alert = person_last_alert.get(person_id, 0)

                    if current_time - last_alert > person_cooldown:
                        # Log to database
                        bbox = [x1, y1, x2, y2]
                        run_async_db_operation(
                            log_detection_event(person_id, conf, None, bbox)
                        )
                        
                        if is_alert_allowed():
                            alert_msg = f"Warning Intruder Detected by Camera {CAMERA_NAME}"
                            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                            message = (
                                f"🚨 Person Detected!\n"
                                f"🧍 ID: {person_id}\n"
                                f"🎯 Confidence: {conf:.2f}\n"
                                f"📍 Camera: {CAMERA_NAME}\n"
                                f"🕒 {timestamp}"
                            )

                            if conf >= 0.6:
                                filename = f"alert_{uuid.uuid4().hex[:8]}.jpg"
                                filepath = os.path.join("logs", filename)
                                cv2.imwrite(filepath, output)

                                send_alert_async(send_telegram_image_alert, filepath, caption=message)
                                logger.info(f"[ALERT] Queued image alert for ID {person_id}")
                                
                                # Update database with image path
                                run_async_db_operation(
                                    log_detection_event(person_id, conf, filepath, bbox)
                                )
                            else:
                                send_alert_async(send_telegram_text_alert, message)
                                logger.info(f"[ALERT] Queued text alert for ID {person_id}")

                        person_last_alert[person_id] = current_time

            # FPS calculation
            fps = 1.0 / max(time.time() - start, 1e-6)
            fps_ema = fps if fps_ema is None else EMA_ALPHA * fps + (1 - EMA_ALPHA) * fps_ema
            cv2.putText(output, f"FPS: {fps_ema:.2f}", (20, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

            if time.time() - last_log_time > 10:
                logger.info(f"Current FPS (EMA): {fps_ema:.2f}")
                last_log_time = time.time()

            cv2.imshow("Person Tracker", output)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                logger.info("Exit key pressed.")
                stop_event.set()
                break

    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received.")
        stop_event.set()

    grab_thread.join()
    cv2.destroyAllWindows()
    logger.info("Application shutdown complete.")

if __name__ == "__main__":
    main()