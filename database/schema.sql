-- Person Detection System Database Schema

-- Camera devices table
CREATE TABLE camera_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    rtsp_url VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
    location VARCHAR(200),
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detection events table
CREATE TABLE detection_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    person_id INTEGER NOT NULL,
    confidence DECIMAL(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    camera_id UUID REFERENCES camera_devices(id),
    camera_name VARCHAR(100) NOT NULL,
    image_path VARCHAR(500),
    alert_sent BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert logs table
CREATE TABLE alert_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES detection_events(id),
    camera_id UUID REFERENCES camera_devices(id),
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('telegram', 'siren', 'ip', 'manual')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retry')),
    message TEXT,
    error_details TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_detection_events_timestamp ON detection_events(timestamp DESC);
CREATE INDEX idx_detection_events_camera_id ON detection_events(camera_id);
CREATE INDEX idx_detection_events_person_id ON detection_events(person_id);
CREATE INDEX idx_camera_devices_status ON camera_devices(status);
CREATE INDEX idx_alert_logs_event_id ON alert_logs(event_id);
CREATE INDEX idx_alert_logs_status ON alert_logs(status);

-- Insert sample camera
INSERT INTO camera_devices (name, rtsp_url, status, location) VALUES 
('Office Camera', 'rtsp://admin:4PEL%232025@192.168.29.133:554/h264', 'online', 'Main Office');

-- Function to update camera heartbeat
CREATE OR REPLACE FUNCTION update_camera_heartbeat(camera_name_param VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE camera_devices 
    SET last_heartbeat = NOW(), 
        status = 'online',
        updated_at = NOW()
    WHERE name = camera_name_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_events', (SELECT COUNT(*) FROM detection_events WHERE DATE(timestamp) = CURRENT_DATE),
        'active_devices', (SELECT COUNT(*) FROM camera_devices WHERE status = 'online'),
        'inactive_devices', (SELECT COUNT(*) FROM camera_devices WHERE status = 'offline'),
        'online_devices', (SELECT COUNT(*) FROM camera_devices WHERE status = 'online'),
        'offline_devices', (SELECT COUNT(*) FROM camera_devices WHERE status = 'offline'),
        'people_detected', (SELECT COUNT(DISTINCT person_id) FROM detection_events WHERE DATE(timestamp) = CURRENT_DATE),
        'events_trend', (
            SELECT CASE 
                WHEN prev_count = 0 THEN 0
                ELSE ROUND(((curr_count - prev_count)::DECIMAL / prev_count * 100), 1)
            END
            FROM (
                SELECT 
                    (SELECT COUNT(*) FROM detection_events WHERE DATE(timestamp) = CURRENT_DATE) as curr_count,
                    (SELECT COUNT(*) FROM detection_events WHERE DATE(timestamp) = CURRENT_DATE - INTERVAL '1 day') as prev_count
            ) trend_calc
        ),
        'devices_trend', 0,
        'people_trend', (
            SELECT CASE 
                WHEN prev_count = 0 THEN 0
                ELSE ROUND(((curr_count - prev_count)::DECIMAL / prev_count * 100), 1)
            END
            FROM (
                SELECT 
                    (SELECT COUNT(DISTINCT person_id) FROM detection_events WHERE DATE(timestamp) = CURRENT_DATE) as curr_count,
                    (SELECT COUNT(DISTINCT person_id) FROM detection_events WHERE DATE(timestamp) = CURRENT_DATE - INTERVAL '1 day') as prev_count
            ) trend_calc
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;