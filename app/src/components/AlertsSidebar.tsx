import { Alert } from '../useIoTData';
import { Badge } from './ui/Badge';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AlertsSidebarProps {
  alerts: Alert[];
  onMarkRead: (id: string) => void;
}

export function AlertsSidebar({ alerts, onMarkRead }: AlertsSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-sm w-80 flex-shrink-0 z-20">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Live Alerts</h3>
        <Badge variant={alerts.filter(a => !a.read).length > 0 ? 'high' : 'default'}>
          {alerts.filter(a => !a.read).length} Unread
        </Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-sm flex flex-col items-center justify-center h-40">
            <CheckCircle2 strokeWidth={1.5} className="mb-2 w-8 h-8 opacity-50" />
            <p>All systems nominal</p>
          </div>
        ) : (
          alerts.map(alert => {
            let bgClass = "bg-slate-50 border-slate-100";
            let textClass = "text-slate-800";
            let subTextClass = "text-slate-500";
            let headerTextClass = "text-slate-500";
            
            if (!alert.read) {
              if (alert.severity === 'high') {
                bgClass = "bg-rose-50 border-rose-100";
                textClass = "text-rose-900";
                subTextClass = "text-rose-600";
                headerTextClass = "text-rose-700";
              } else if (alert.severity === 'medium') {
                bgClass = "bg-amber-50 border-amber-100";
                textClass = "text-amber-900";
                subTextClass = "text-amber-600";
                headerTextClass = "text-amber-700";
              } else {
                bgClass = "bg-indigo-50 border-indigo-100";
                textClass = "text-indigo-900";
                subTextClass = "text-indigo-600";
                headerTextClass = "text-indigo-700";
              }
            } else {
               bgClass = "bg-white border-slate-100 opacity-70";
            }

            return (
              <div 
                key={alert.id}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${bgClass}`}
                onClick={() => onMarkRead(alert.id)}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-bold ${alert.read ? 'text-slate-400' : headerTextClass}`}>
                     {alert.severity.toUpperCase()}
                  </span>
                  <span className={`text-[10px] font-mono ${alert.read ? 'text-slate-400' : subTextClass}`}>
                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className={`text-xs font-semibold ${textClass}`}>
                  {alert.message}
                </p>
                <p className={`text-[10px] ${subTextClass} mt-0.5`}>
                  Device #{alert.deviceId.toUpperCase()}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
