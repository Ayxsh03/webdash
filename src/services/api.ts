const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface DetectionEvent {
  id: string;
  timestamp: string;
  person_id: number;
  confidence: number;
  camera_name: string;
  image_path?: string;
  alert_sent: boolean;
  metadata: {
    bbox: [number, number, number, number];
    location?: string;
  };
}

export interface CameraDevice {
  id: string;
  name: string;
  rtsp_url: string;
  status: 'online' | 'offline';
  location: string;
  last_heartbeat: string;
}

export interface DashboardStats {
  total_events: number;
  active_devices: number;
  inactive_devices: number;
  online_devices: number;
  offline_devices: number;
  people_detected: number;
  events_trend: number;
  devices_trend: number;
  people_trend: number;
}

export interface HourlyData {
  hour: string;
  events: number;
  footfall: number;
  vehicles: number;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/events/stats');
  }

  // Detection Events
  async getDetectionEvents(page = 1, limit = 10, search?: string): Promise<{
    events: DetectionEvent[];
    total: number;
    page: number;
    pages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    return this.request(`/events?${params}`);
  }

  async getDetectionEvent(id: string): Promise<DetectionEvent> {
    return this.request<DetectionEvent>(`/events/${id}`);
  }

  async createDetectionEvent(event: Omit<DetectionEvent, 'id'>): Promise<DetectionEvent> {
    return this.request<DetectionEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  // Camera Management
  async getCameras(): Promise<CameraDevice[]> {
    return this.request<CameraDevice[]>('/cameras');
  }

  async getCameraStatus(id: string): Promise<{ status: string; last_heartbeat: string }> {
    return this.request(`/cameras/${id}/status`);
  }

  async updateCameraStatus(id: string, status: 'online' | 'offline'): Promise<void> {
    await this.request(`/cameras/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Analytics
  async getHourlyData(): Promise<HourlyData[]> {
    return this.request<HourlyData[]>('/analytics/hourly');
  }

  async getDailyStats(days = 7): Promise<any[]> {
    return this.request(`/analytics/daily?days=${days}`);
  }

  async getTrends(): Promise<{
    events_trend: number;
    devices_trend: number;
    people_trend: number;
  }> {
    return this.request('/analytics/trends');
  }

  // Alert Logs
  async getAlertLogs(page = 1, limit = 10): Promise<{
    alerts: any[];
    total: number;
    page: number;
    pages: number;
  }> {
    return this.request(`/alerts?page=${page}&limit=${limit}`);
  }

  async triggerManualAlert(camera_id: string, message: string): Promise<void> {
    await this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify({ camera_id, message }),
    });
  }
}

export const apiService = new ApiService();