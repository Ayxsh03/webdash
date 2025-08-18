# CCTV Real Feeds Setup Guide

## Overview
This guide walks you through setting up real CCTV camera feeds with your person detection system.

## Step-by-Step Setup Process

### 1. Camera Network Setup

#### Find Your Camera's IP Address
```bash
# Method 1: Use camera manufacturer's software
# Most cameras come with IP scanner tools

# Method 2: Check your router's admin panel
# Look for connected devices

# Method 3: Network scan
nmap -sn 192.168.1.0/24
```

#### Get RTSP URL Format
Different camera brands use different RTSP URL formats:

**Hikvision:**
```
rtsp://username:password@camera_ip:554/Streaming/Channels/101
rtsp://username:password@camera_ip:554/Streaming/Channels/102  # Lower quality
```

**Dahua:**
```
rtsp://username:password@camera_ip:554/cam/realmonitor?channel=1&subtype=0
rtsp://username:password@camera_ip:554/cam/realmonitor?channel=1&subtype=1  # Lower quality
```

**Axis:**
```
rtsp://username:password@camera_ip:554/axis-media/media.amp
```

**Generic/ONVIF:**
```
rtsp://username:password@camera_ip:554/stream1
rtsp://username:password@camera_ip:554/stream2
```

### 2. Test RTSP Connections

#### Using the Setup Script
```bash
cd scripts
python setup_cameras.py --discover
python setup_cameras.py --test "rtsp://admin:password@192.168.1.100:554/stream1"
```

#### Using VLC Media Player
1. Open VLC
2. Media → Open Network Stream
3. Enter your RTSP URL
4. If it plays, the URL is correct

#### Using FFmpeg
```bash
ffplay "rtsp://admin:password@192.168.1.100:554/stream1"
```

### 3. Configure Cameras in Database

#### Method 1: Update the migration
Edit the camera insert statements in the Supabase migration with your real camera details:

```sql
INSERT INTO public.camera_devices (name, rtsp_url, location, status) VALUES
('Front Door Camera', 'rtsp://admin:yourpassword@192.168.1.100:554/Streaming/Channels/101', 'Front Entrance', 'offline'),
('Parking Camera', 'rtsp://admin:yourpassword@192.168.1.101:554/Streaming/Channels/101', 'Parking Area', 'offline');
```

#### Method 2: Interactive Setup
```bash
cd scripts
python setup_cameras.py --interactive
```

### 4. Start the Detection System

#### Option A: Single Camera
```bash
cd detection_integration
python modified_main.py
```

#### Option B: Multiple Cameras
```bash
cd detection_integration
python multi_camera_detector.py
```

### 5. Network Configuration

#### Port Forwarding (if cameras are remote)
Forward these ports on your router:
- **554** (RTSP)
- **80** (HTTP admin)
- **8000** (API server)

#### VPN Setup (recommended for remote access)
Set up a VPN to securely access cameras over the internet.

#### Firewall Rules
```bash
# Allow RTSP traffic
sudo ufw allow 554
# Allow API traffic
sudo ufw allow 8000
```

### 6. Performance Optimization

#### Camera Settings
- **Resolution**: 640x480 or 1280x720 for detection
- **FPS**: 10-15 fps (higher uses more CPU)
- **Bitrate**: 1-2 Mbps
- **Codec**: H.264

#### System Requirements
- **CPU**: Minimum 4 cores for 4+ cameras
- **RAM**: 8GB+ recommended
- **Network**: 100Mbps+ for multiple high-quality streams
- **Storage**: SSD recommended for logs

#### Multi-Camera Configuration
```python
# In multi_camera_detector.py, adjust these settings:
DETECTION_RESOLUTION = (640, 480)  # Lower for better performance
CONFIDENCE_THRESHOLD = 0.5         # Higher to reduce false positives
```

## Troubleshooting

### Common Issues

#### 1. "Connection refused" or "Network unreachable"
- Check camera IP address
- Verify camera is powered on
- Test network connectivity: `ping camera_ip`

#### 2. "Authentication failed"
- Verify username/password
- Some cameras use 'admin/admin' or 'admin/password'
- Check if camera account is locked

#### 3. "Stream not found" or "404 error"
- Wrong RTSP path - check camera manual
- Try different stream numbers (/stream1, /stream2)
- Use manufacturer's documentation

#### 4. "Connection timeout"
- Camera may be overloaded
- Network congestion
- Try lower quality stream

#### 5. Poor detection performance
```python
# Adjust these settings in the detector:
CONFIDENCE_THRESHOLD = 0.6  # Increase to reduce false positives
DETECTION_RESOLUTION = (416, 416)  # Lower resolution for speed
```

### Testing Commands

#### Test API Connection
```bash
cd scripts
python test_detection_api.py
```

#### Test Single Camera
```bash
python setup_cameras.py --test "your_rtsp_url_here"
```

#### Monitor System Performance
```bash
# Check CPU usage
htop

# Check network usage
iftop

# Check logs
tail -f detection_integration/multi_camera_detection.log
```

## Security Best Practices

### 1. Change Default Passwords
```bash
# Always change default camera passwords
# Use strong passwords (12+ characters)
```

### 2. Network Segmentation
```bash
# Put cameras on separate VLAN
# Restrict camera internet access
```

### 3. API Security
```bash
# Use strong API keys
# Enable HTTPS in production
# Implement rate limiting
```

### 4. Regular Updates
```bash
# Update camera firmware
# Update detection system
# Monitor security advisories
```

## Production Deployment

### 1. Docker Deployment
```bash
# Start the complete system
docker-compose up -d

# View logs
docker-compose logs -f api
```

### 2. Process Management
```bash
# Use systemd for auto-restart
sudo systemctl enable detection-system
sudo systemctl start detection-system
```

### 3. Monitoring Setup
```bash
# Set up log rotation
# Configure alerts for camera offline
# Monitor disk space for logs
```

## Next Steps

1. **Test with one camera first** - Get single camera working before adding more
2. **Monitor performance** - Watch CPU/memory usage as you add cameras  
3. **Tune detection settings** - Adjust confidence thresholds based on your environment
4. **Set up alerts** - Configure notifications for person detection events
5. **Add backup storage** - Set up database backups and log archival

## Support

If you encounter issues:
1. Check the logs: `tail -f *.log`
2. Test API endpoints: `python test_detection_api.py`
3. Verify camera connections: `python setup_cameras.py --test URL`
4. Monitor system resources: `htop`, `free -h`, `df -h`