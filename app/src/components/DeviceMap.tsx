import { useMemo } from 'react';
import { motion } from 'motion/react';
import { IoTDevice } from '../useIoTData';

interface DeviceMapProps {
  devices: IoTDevice[];
  activeDeviceId: string | null;
  onSelectDevice: (id: string) => void;
}

export function DeviceMap({ devices, activeDeviceId, onSelectDevice }: DeviceMapProps) {
  // Translate lat/lng to SVG viewbox (0,0 to 1000, 600)
  // Simplified projection just for visual mapping
  const normalizeCoordinates = (lat: number, lng: number) => {
    // Map -90..90 to 600..0
    const y = ((90 - lat) / 180) * 600;
    // Map -180..180 to 0..1000
    const x = ((lng + 180) / 360) * 1000;
    return { x, y };
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-800 rounded-2xl border border-slate-700 shadow-xl">
      <div className="absolute inset-0 bg-[#111827] flex items-center justify-center">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#94a3b8 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      </div>
      
      {/* Decorative Radar Sweep */}
      <div className="absolute inset-0 top-1/2 left-1/2 w-[800px] h-[800px] -mt-[400px] -ml-[400px] border border-[rgba(79,70,229,0.1)] rounded-full animate-ping opacity-20" style={{ animationDuration: '4s' }} />

      <svg viewBox="0 0 1000 600" className="w-full h-full relative z-10" preserveAspectRatio="xMidYMid meet">
        <path d="M230,100 L300,100 L320,150 L280,200 L200,180 Z M600,50 L750,80 L800,250 L700,400 L550,300 Z M400,300 L500,400 L450,480 L350,450 Z" className="text-slate-500 opacity-20 drop-shadow-md" fill="currentColor" style={{ transform: 'scale(1.2)' }} />
        {devices.map(device => {
          const { x, y } = normalizeCoordinates(device.lat, device.lng);
          const isActive = device.id === activeDeviceId;
          
          let color = '#94a3b8'; // default slate-400
          if (device.status === 'online') color = '#10b981'; // emerald-500
          if (device.status === 'warning') color = '#f59e0b'; // amber-500
          if (device.status === 'offline') color = '#f43f5e'; // rose-500
          if (device.status === 'maintenance') color = '#4f46e5'; // indigo-600

          return (
            <g 
              key={device.id} 
              className="cursor-pointer" 
              onClick={() => onSelectDevice(device.id)}
              style={{ transformOrigin: `${x}px ${y}px` }}
            >
              {isActive && (
                <motion.circle
                  initial={{ r: 10, opacity: 0.5 }}
                  animate={{ r: 25, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  cx={x}
                  cy={y}
                  fill={color}
                />
              )}
              <motion.circle
                animate={{ cx: x, cy: y }}
                transition={{ duration: 1, ease: 'linear' }}
                r={isActive ? 8 : 4}
                fill={color}
                stroke={isActive ? '#fff' : '#ffffff80'}
                strokeWidth={2}
                className="transition-all duration-300 drop-shadow-md"
              />
              {isActive && (
                <text x={x + 12} y={y + 4} fill="#fff" fontSize="12" fontFamily="monospace" className="font-bold drop-shadow-lg">
                  {device.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Map Key overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-2 border border-slate-200 rounded-lg shadow-lg flex gap-4 text-xs font-bold text-slate-800 z-20 uppercase tracking-wider">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span> Online</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span> Warning</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span> Offline</div>
      </div>
    </div>
  );
}
