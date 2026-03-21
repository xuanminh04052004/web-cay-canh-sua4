import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { getAccessStats } from '@/lib/access-analytics';

const baseMockData = [
  { date: '14 thg 2, 2026', clicks: 0, impressions: 0 },
  { date: '16 thg 2, 2026', clicks: 0, impressions: 0 },
  { date: '18 thg 2, 2026', clicks: 0, impressions: 0 },
  { date: '20 thg 2, 2026', clicks: 0, impressions: 0 },
  { date: '22 thg 2, 2026', clicks: 0, impressions: 0 },
  { date: '24 thg 2, 2026', clicks: 0, impressions: 0 },
  { date: '28 thg 2, 2026', clicks: 0, impressions: 0 },
  { date: '1 thg 3, 2026', clicks: 100, impressions: 1500 },
  { date: '3 thg 3, 2026', clicks: 130, impressions: 2200 },
  { date: '5 thg 3, 2026', clicks: 250, impressions: 3800 },
  { date: '7 thg 3, 2026', clicks: 10, impressions: 100 },
  { date: '9 thg 3, 2026', clicks: 5, impressions: 50 },
  { date: '11 thg 3, 2026', clicks: 80, impressions: 1700 },
  { date: '12 thg 3, 2026', clicks: 0, impressions: 0 },
  { date: '15 thg 3, 2026', clicks: 0, impressions: 0 },
];

const AccessChart = () => {
  const [stats, setStats] = useState({ clicks: 158, impressions: 473 });

  useEffect(() => {
    const loadStats = () => {
      setStats(getAccessStats());
    };

    loadStats();

    window.addEventListener('access_stats_updated', loadStats);
    return () => window.removeEventListener('access_stats_updated', loadStats);
  }, []);

  const chartData = [...baseMockData];
  const lastIndex = chartData.length - 1;
  chartData[lastIndex] = {
    ...chartData[lastIndex],
    clicks: stats.clicks,
    impressions: stats.impressions,
    date: 'Hôm nay'
  };

  const totalClicksStr = new Intl.NumberFormat('vi-VN').format(stats.clicks);
  const totalImpressionsStr = stats.impressions >= 1000 
    ? (stats.impressions / 1000).toFixed(2).replace('.', ',') + ' N' 
    : new Intl.NumberFormat('vi-VN').format(stats.impressions);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.name}: {entry.value > 1000 ? (entry.value / 1000).toFixed(2).replace('.', ',') + ' N' : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border overflow-hidden" style={{ borderRadius: '0' }}>
      {/* Header Stats */}
      <div className="flex border-b border-border border-t-4 border-t-[#8ab4f8]">
        <div className="w-[180px] p-4 bg-[#1a73e8] text-white shrink-0">
          <div className="text-xs mb-1 opacity-90 font-medium">▾ Lần nhấp</div>
          <div className="text-3xl font-normal">{totalClicksStr}</div>
        </div>
        <div className="w-[180px] p-4 bg-[#d93025] text-white shrink-0">
          <div className="text-xs mb-1 opacity-90 font-medium">▾ Lượt hiển thị</div>
          <div className="text-3xl font-normal">{totalImpressionsStr}</div>
        </div>
        {/* Fill the rest with white/card background to match Google Ads style */}
        <div className="flex-1 bg-card flex items-center justify-end px-6 border-l border-border">
          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <button className="flex flex-col items-center gap-1 hover:text-foreground">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-semibold">Chi số</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:text-foreground">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="text-xs font-semibold">Điều chỉnh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-0 pt-4 pb-2 bg-card relative">
        <div className="h-[250px] w-full pr-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 0, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} horizontal={true} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                minTickGap={30}
              />
              <YAxis 
                yAxisId="left"
                tickFormatter={(value) => value}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 400]}
                tickCount={3}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000)} N` : value}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 4000]}
                tickCount={3}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                yAxisId="left"
                type="linear" 
                dataKey="clicks" 
                name="Lần nhấp"
                stroke="#1a73e8" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#1a73e8', strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <Line 
                yAxisId="right"
                type="linear" 
                dataKey="impressions" 
                name="Lượt hiển thị"
                stroke="#d93025" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#d93025', strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Grey highlight regions in background (mocking the image pattern) */}
        <div className="absolute top-4 bottom-8 left-[6%] right-[8%] pointer-events-none flex justify-between z-0 opacity-10">
           <div className="w-[5%] h-full bg-slate-400"></div>
           <div className="w-[5%] h-full bg-slate-400"></div>
           <div className="w-[5%] h-full bg-slate-400"></div>
           <div className="w-[5%] h-full bg-slate-400"></div>
        </div>
      </div>
    </div>
  );
};

export default AccessChart;
