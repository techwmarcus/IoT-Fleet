import { useState, useMemo } from 'react';
import { useIoTSystem } from './useIoTData';
import { Card, CardHeader, CardContent } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { DeviceMap } from './components/DeviceMap';
import { TelemetryChart } from './components/TelemetryChart';
import { AlertsSidebar } from './components/AlertsSidebar';
import { Activity, Battery, Hash, MapPin, Radio, Thermometer } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function App() {
  const { devices, alerts, activeDeviceId, setActiveDeviceId, telemetryHistory, markAlertRead } = useIoTSystem();
  
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      if (filterRegion !== 'All' && d.region !== filterRegion) return false;
      if (filterStatus !== 'All' && d.status !== filterStatus) return false;
      return true;
    });
  }, [devices, filterRegion, filterStatus]);

  const activeDevice = devices.find(d => d.id === activeDeviceId) || devices[0];
  const activeDeviceTelemetry = activeDevice ? (telemetryHistory[activeDevice.id] || []) : [];

  const stats = useMemo(() => {
    return {
      total: devices.length,
      online: devices.filter(d => d.status === 'online').length,
      offline: devices.filter(d => d.status === 'offline').length,
      warning: devices.filter(d => d.status === 'warning').length,
    }
  }, [devices]);

  return (
    <div className="flex h-screen bg-[#F4F4F7] text-slate-900 overflow-hidden font-sans">
      {/* Main Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shadow-sm">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase">Fleet Command <span className="font-normal text-slate-400">// OP-NORMAL</span></h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest hidden md:block">NODE: OMEGA-7</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-4 font-mono text-xs">
              <div className="flex flex-col">
                <span className="text-text-muted">TOTAL</span>
                <span className="text-lg text-text-primary">{stats.total}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted">ONLINE</span>
                <span className="text-lg text-success">{stats.online}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted">WARNING</span>
                <span className="text-lg text-warn">{stats.warning}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted">OFFLINE</span>
                <span className="text-lg text-alert">{stats.offline}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Filters bar */}
        <div className="px-6 py-2 border-b border-slate-200 flex gap-4 text-sm bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs uppercase font-mono tracking-wider">Region</span>
            <select 
              className="bg-transparent border border-line rounded px-2 py-1 text-xs outline-none focus:border-accent"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
            >
              <option value="All">All Regions</option>
              <option value="NA">North America</option>
              <option value="EU">Europe</option>
              <option value="APAC">Asia Pacific</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs uppercase font-mono tracking-wider">Status</span>
            <select 
              className="bg-transparent border border-line rounded px-2 py-1 text-xs outline-none focus:border-accent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="online">Online</option>
              <option value="warning">Warning</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 p-4 grid grid-cols-1 xl:grid-cols-3 gap-4 overflow-y-auto">
          
          {/* Left Col: Device List & KPI */}
          <div className="xl:col-span-1 flex flex-col gap-4 h-full min-h-0">
            {/* Active Device Inspect Panel */}
            <Card className="shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Hash className="w-24 h-24" />
              </div>
              <CardHeader>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-2">INSPECT <Badge variant={activeDevice?.status}>{activeDevice?.status}</Badge></h3>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-1">{activeDevice?.name}</h2>
                  <p className="font-mono text-xs text-text-secondary">{activeDevice?.id.toUpperCase()} • {activeDevice?.type}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col border-l-2 border-line pl-3">
                    <span className="text-xs text-text-muted font-mono mb-1 flex items-center gap-1.5"><Thermometer className="w-3 h-3"/> TEMP</span>
                    <span className="text-xl">{activeDevice?.temperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex flex-col border-l-2 border-line pl-3">
                    <span className="text-xs text-text-muted font-mono mb-1 flex items-center gap-1.5"><Battery className="w-3 h-3"/> POWER</span>
                    <span className="text-xl">{activeDevice?.battery.toFixed(0)}%</span>
                  </div>
                  <div className="flex flex-col border-l-2 border-line pl-3">
                    <span className="text-xs text-text-muted font-mono mb-1 flex items-center gap-1.5"><Activity className="w-3 h-3"/> UPTIME</span>
                    <span className="text-xl">{activeDevice?.uptime}h</span>
                  </div>
                  <div className="flex flex-col border-l-2 border-line pl-3">
                    <span className="text-xs text-text-muted font-mono mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3"/> LOC</span>
                    <span className="font-mono text-sm">{activeDevice?.lat.toFixed(2)}, {activeDevice?.lng.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-line text-xs font-mono text-text-muted flex justify-between">
                  <span>LAST RX</span>
                  <span>{activeDevice ? formatDistanceToNow(new Date(activeDevice.lastSeen), { addSuffix: true }) : 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Live Chart Panel */}
            <Card className="flex-1 flex flex-col min-h-[300px]">
              <CardHeader>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Core Temp Telemetry (T-20s)</h3>
              </CardHeader>
              <CardContent className="flex-1 p-4 pb-2 relative">
                <div className="absolute top-4 right-4 z-10 flex gap-2 items-center">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                    </span>
                    <span className="text-[10px] font-mono text-accent">LIVE</span>
                </div>
                <TelemetryChart data={activeDeviceTelemetry} />
              </CardContent>
            </Card>

          </div>

          {/* Right Col: Map & Grid */}
          <div className="xl:col-span-2 flex flex-col gap-4 h-[800px] xl:h-auto overflow-hidden">
            <Card className="flex-1 p-1 bg-slate-800">
              <DeviceMap 
                devices={filteredDevices} 
                activeDeviceId={activeDeviceId} 
                onSelectDevice={setActiveDeviceId} 
              />
            </Card>
            
            {/* Asset Roster Grid */}
            <Card className="h-64 flex flex-col shrink-0">
               <CardHeader>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Asset Roster ({filteredDevices.length})</h3>
               </CardHeader>
               <div className="flex-1 overflow-auto">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                     <tr>
                       <th className="font-normal px-4 py-2">ID</th>
                       <th className="font-normal px-4 py-2">Name</th>
                       <th className="font-normal px-4 py-2">Type</th>
                       <th className="font-normal px-4 py-2">Status</th>
                       <th className="font-normal px-4 py-2">Temp</th>
                     </tr>
                   </thead>
                   <tbody>
                      {filteredDevices.map(d => (
                        <tr 
                          key={d.id} 
                          onClick={() => setActiveDeviceId(d.id)}
                          className={`border-b border-slate-100 cursor-pointer transition-colors ${
                            activeDeviceId === d.id ? 'bg-indigo-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{d.id.toUpperCase()}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{d.name}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{d.type}</td>
                          <td className="px-4 py-3"><Badge variant={d.status}>{d.status}</Badge></td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-700">{d.temperature.toFixed(1)}°C</td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
            </Card>
          </div>
        </div>

      </div>

      {/* Alerts Sidebar */}
      <AlertsSidebar alerts={alerts} onMarkRead={markAlertRead} />
    </div>
  );
}

