import { useState, useEffect, useCallback } from 'react';

export type DeviceStatus = 'online' | 'offline' | 'maintenance' | 'warning';
export type DeviceType = 'Drone' | 'Sensor' | 'Vehicle' | 'Gateway';
export type Region = 'NA' | 'EU' | 'APAC';

export interface IoTDevice {
  id: string;
  name: string;
  type: DeviceType;
  region: Region;
  status: DeviceStatus;
  lat: number;
  lng: number;
  temperature: number;
  battery: number;
  uptime: number; // in hours
  lastSeen: string;
}

export interface TelemetryData {
  timestamp: string;
  temperature: number;
}

export interface Alert {
  id: string;
  deviceId: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  read: boolean;
}

const GENERATE_MOCK_DEVICES = (): IoTDevice[] => [
  { id: 'dev-01', name: 'Alpha Drone', type: 'Drone', region: 'NA', status: 'online', lat: 37.7749, lng: -122.4194, temperature: 42, battery: 85, uptime: 120, lastSeen: new Date().toISOString() },
  { id: 'dev-02', name: 'Beta Sensor', type: 'Sensor', region: 'EU', status: 'online', lat: 51.5074, lng: -0.1278, temperature: 28, battery: 92, uptime: 340, lastSeen: new Date().toISOString() },
  { id: 'dev-03', name: 'Gamma Rover', type: 'Vehicle', region: 'APAC', status: 'warning', lat: 35.6895, lng: 139.6917, temperature: 65, battery: 45, uptime: 89, lastSeen: new Date().toISOString() },
  { id: 'dev-04', name: 'Delta Gateway', type: 'Gateway', region: 'NA', status: 'offline', lat: 40.7128, lng: -74.0060, temperature: 0, battery: 0, uptime: 0, lastSeen: new Date(Date.now() - 3600000).toISOString() },
  { id: 'dev-05', name: 'Epsilon Sensor', type: 'Sensor', region: 'EU', status: 'maintenance', lat: 48.8566, lng: 2.3522, temperature: 32, battery: 100, uptime: 12, lastSeen: new Date().toISOString() },
  { id: 'dev-06', name: 'Zeta Drone', type: 'Drone', region: 'APAC', status: 'online', lat: 1.3521, lng: 103.8198, temperature: 38, battery: 78, uptime: 210, lastSeen: new Date().toISOString() },
];

export function useIoTSystem() {
  const [devices, setDevices] = useState<IoTDevice[]>(GENERATE_MOCK_DEVICES());
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 'a1', deviceId: 'dev-04', message: 'Gateway connection lost', severity: 'high', timestamp: new Date(Date.now() - 300000).toISOString(), read: false },
    { id: 'a2', deviceId: 'dev-03', message: 'Temperature exceeding safe levels', severity: 'medium', timestamp: new Date(Date.now() - 100000).toISOString(), read: false },
  ]);
  
  // Keep history for the active device
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>('dev-01');
  const [telemetryHistory, setTelemetryHistory] = useState<Record<string, TelemetryData[]>>({});

  useEffect(() => {
    // Initialize history
    const initialHistory: Record<string, TelemetryData[]> = {};
    devices.forEach(d => {
      initialHistory[d.id] = Array.from({ length: 20 }).map((_, i) => ({
        timestamp: new Date(Date.now() - (20 - i) * 2000).toLocaleTimeString([], { hour12: false }),
        temperature: d.temperature + (Math.random() * 4 - 2)
      }));
    });
    setTelemetryHistory(initialHistory);

    // Simulate real-time websocket/pub-sub data coming in every 2 seconds
    const interval = setInterval(() => {
      setDevices(currentDevices => {
        return currentDevices.map(device => {
          if (device.status === 'offline' || device.status === 'maintenance') return device;
          
          // Slight drifts in telemetry
          const tempChange = (Math.random() - 0.5) * 2.5;
          const newTemp = Math.max(10, Math.min(85, device.temperature + tempChange));
          
          // Randomly trigger alerts
          if (newTemp > 75 && Math.random() > 0.8) {
            setAlerts(prev => [{
               id: Math.random().toString(36).substr(2, 9),
               deviceId: device.id,
               message: `Critical temperature alert: ${newTemp.toFixed(1)}°C`,
               severity: 'high',
               timestamp: new Date().toISOString(),
               read: false
            }, ...prev].slice(0, 50));
          }

          // Move coordinates slightly to simulate wandering
          let newLat = device.lat;
          let newLng = device.lng;
          if (device.type === 'Drone' || device.type === 'Vehicle') {
             newLat += (Math.random() - 0.5) * 0.05;
             newLng += (Math.random() - 0.5) * 0.05;
          }

          // Drain battery slowly
          const currentBattery = Math.max(0, device.battery - 0.1);
          
          let newStatus = device.status;
          if (currentBattery < 15 && device.status === 'online') newStatus = 'warning';
          if (currentBattery === 0) newStatus = 'offline';

          const newTimestamp = new Date();

          setTelemetryHistory(history => {
            const current = history[device.id] || [];
            return {
              ...history,
              [device.id]: [...current.slice(-19), { 
                timestamp: newTimestamp.toLocaleTimeString([], { hour12: false }), 
                temperature: newTemp 
              }]
            };
          });

          return {
            ...device,
            temperature: newTemp,
            battery: currentBattery,
            lat: newLat,
            lng: newLng,
            status: newStatus,
            lastSeen: newTimestamp.toISOString()
          };
        });
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []); // Run once on mount

  const markAlertRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  return { devices, alerts, activeDeviceId, setActiveDeviceId, telemetryHistory, markAlertRead };
}
