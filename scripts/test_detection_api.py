#!/usr/bin/env python3
"""
Detection API Test Script
This script tests the detection API endpoints
"""

import requests
import json
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000/api/v1"
API_KEY = "secure-detection-api-key-2024"

def test_api_endpoints():
    """Test all API endpoints"""
    print("🧪 Testing Detection API Endpoints")
    print("=" * 50)
    
    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }
    
    # Test 1: Health check
    print("\n1️⃣ Testing health endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL.replace('/api/v1', '')}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test 2: Get cameras
    print("\n2️⃣ Testing get cameras...")
    try:
        response = requests.get(f"{API_BASE_URL}/cameras")
        if response.status_code == 200:
            cameras = response.json()
            print(f"✅ Got {len(cameras)} cameras")
            for camera in cameras:
                print(f"   - {camera['name']} ({camera['status']})")
        else:
            print(f"❌ Get cameras failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Get cameras error: {e}")
    
    # Test 3: Create detection event
    print("\n3️⃣ Testing create detection event...")
    try:
        event_data = {
            "timestamp": datetime.now().isoformat(),
            "person_id": 1,
            "confidence": 0.95,
            "camera_name": "Test Camera",
            "alert_sent": False,
            "metadata": {
                "bbox": [100, 150, 200, 300],
                "location": "Test Location"
            }
        }
        
        response = requests.post(
            f"{API_BASE_URL}/events",
            json=event_data,
            headers=headers
        )
        
        if response.status_code == 200:
            print("✅ Detection event created successfully")
            event = response.json()
            print(f"   Event ID: {event['id']}")
        else:
            print(f"❌ Create event failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Create event error: {e}")
    
    # Test 4: Get detection events
    print("\n4️⃣ Testing get detection events...")
    try:
        response = requests.get(f"{API_BASE_URL}/events?limit=5")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Got {len(data['events'])} events (total: {data['total']})")
            for event in data['events'][:3]:  # Show first 3
                print(f"   - {event['camera_name']}: Person {event['person_id']} ({event['confidence']:.2f})")
        else:
            print(f"❌ Get events failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Get events error: {e}")
    
    # Test 5: Get dashboard stats
    print("\n5️⃣ Testing dashboard stats...")
    try:
        response = requests.get(f"{API_BASE_URL}/events/stats")
        if response.status_code == 200:
            stats = response.json()
            print("✅ Dashboard stats retrieved")
            print(f"   Total events: {stats['total_events']}")
            print(f"   Online devices: {stats['online_devices']}")
            print(f"   People detected: {stats['people_detected']}")
        else:
            print(f"❌ Dashboard stats failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Dashboard stats error: {e}")
    
    # Test 6: Get hourly analytics
    print("\n6️⃣ Testing hourly analytics...")
    try:
        response = requests.get(f"{API_BASE_URL}/analytics/hourly")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Got {len(data)} hourly data points")
        else:
            print(f"❌ Hourly analytics failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Hourly analytics error: {e}")

def test_api_key_protection():
    """Test API key protection"""
    print("\n🔐 Testing API Key Protection")
    print("=" * 50)
    
    # Test without API key
    print("\n1️⃣ Testing without API key...")
    try:
        event_data = {
            "timestamp": datetime.now().isoformat(),
            "person_id": 999,
            "confidence": 0.85,
            "camera_name": "Unauthorized Test",
            "alert_sent": False,
            "metadata": {}
        }
        
        response = requests.post(f"{API_BASE_URL}/events", json=event_data)
        
        if response.status_code == 401:
            print("✅ API key protection working - unauthorized request blocked")
        else:
            print(f"❌ API key protection failed - got status: {response.status_code}")
    except Exception as e:
        print(f"❌ API key test error: {e}")
    
    # Test with wrong API key
    print("\n2️⃣ Testing with wrong API key...")
    try:
        headers = {
            "X-API-Key": "wrong-api-key",
            "Content-Type": "application/json"
        }
        
        response = requests.post(f"{API_BASE_URL}/events", json=event_data, headers=headers)
        
        if response.status_code == 401:
            print("✅ Wrong API key blocked correctly")
        else:
            print(f"❌ Wrong API key not blocked - got status: {response.status_code}")
    except Exception as e:
        print(f"❌ Wrong API key test error: {e}")

def simulate_detection_load():
    """Simulate detection load for testing"""
    print("\n⚡ Simulating Detection Load")
    print("=" * 50)
    
    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }
    
    cameras = ["Front Door", "Parking Lot", "Back Office", "Reception"]
    
    print("Sending 10 test detection events...")
    success_count = 0
    
    for i in range(10):
        try:
            event_data = {
                "timestamp": datetime.now().isoformat(),
                "person_id": i % 5 + 1,  # Person IDs 1-5
                "confidence": 0.7 + (i % 3) * 0.1,  # Confidence 0.7-0.9
                "camera_name": cameras[i % len(cameras)],
                "alert_sent": False,
                "metadata": {
                    "bbox": [100 + i*10, 150 + i*5, 200 + i*10, 300 + i*5],
                    "location": f"Zone {i % 4 + 1}"
                }
            }
            
            response = requests.post(
                f"{API_BASE_URL}/events",
                json=event_data,
                headers=headers
            )
            
            if response.status_code == 200:
                success_count += 1
                print(f"  ✅ Event {i+1}/10")
            else:
                print(f"  ❌ Event {i+1}/10 failed: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Event {i+1}/10 error: {e}")
    
    print(f"\n📊 Results: {success_count}/10 events created successfully")

def main():
    print("🎯 Detection API Test Suite")
    print("=" * 50)
    
    # Run all tests
    test_api_endpoints()
    test_api_key_protection()
    
    # Ask if user wants to run load test
    run_load = input("\n🤔 Run detection load simulation? (y/N): ").strip().lower()
    if run_load == 'y':
        simulate_detection_load()
    
    print("\n✨ Test suite completed!")

if __name__ == "__main__":
    main()