import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TelemetryData } from '../useIoTData';

interface TelemetryChartProps {
  data: TelemetryData[];
}

export function TelemetryChart({ data }: TelemetryChartProps) {
  // Only display last 20 ticks
  const chartData = useMemo(() => data.slice(-20), [data]);
  
  return (
    <div className="w-full h-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            stroke="#94a3b8" 
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '12px', fontFamily: 'monospace', borderRadius: '6px', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
            itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
            labelStyle={{ color: '#64748b', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="temperature" 
            stroke="#4f46e5" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#tempGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
