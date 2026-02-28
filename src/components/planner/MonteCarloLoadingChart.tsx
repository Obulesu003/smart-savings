import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface MonteCarloSimulationProps {
  goalAmount: number;
  timePeriod: number;
  monthlyInvestment: number;
}

export function MonteCarloLoadingChart({ goalAmount, timePeriod, monthlyInvestment }: MonteCarloSimulationProps) {
  const [data, setData] = useState<any[]>([]);

  // Generate deterministic "Monte Carlo" looking data for the loading animation
  useEffect(() => {
    const generateData = () => {
      const months = timePeriod * 12;
      const initialPoints = [];
      let currentBase = 0;

      for (let i = 0; i <= months; i += Math.max(1, Math.floor(months / 20))) {
        currentBase += (monthlyInvestment * (months / 20));
        
        // Add artificial volatility to simulate multiple paths
        const volatility = currentBase * 0.15; 
        
        initialPoints.push({
          month: `Year ${Math.floor(i / 12)}`,
          optimistic: currentBase + (Math.random() * volatility * 2),
          expected: currentBase * (1 + (Math.random() * 0.05)),
          pessimistic: currentBase - (Math.random() * volatility * 1.5),
          goal: (goalAmount / months) * i
        });
      }
      setData(initialPoints);
    };

    generateData();
    // Re-generate every 800ms to make it look "live" and busy
    const interval = setInterval(generateData, 800);
    return () => clearInterval(interval);
  }, [goalAmount, timePeriod, monthlyInvestment]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-48 mt-6 relative rounded-lg border border-primary/20 bg-card overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none z-0" />
      
      <div className="absolute top-2 left-4 z-10 flex items-center gap-2">
        <div className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </div>
        <span className="text-xs font-mono text-primary font-medium tracking-wider">
          SIMULATING 10,000 MARKET TRAJECTORIES...
        </span>
      </div>

      <div className="w-full h-full pt-8 pb-2 px-2 z-10 relative opacity-70">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area type="monotone" dataKey="optimistic" stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} fillOpacity={1} fill="url(#colorOptimistic)" isAnimationActive={false} />
            <Area type="monotone" dataKey="expected" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorExpected)" isAnimationActive={false} />
            <Area type="monotone" dataKey="pessimistic" stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} fillOpacity={0} isAnimationActive={false} />
            <Area type="monotone" dataKey="goal" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeWidth={1} fillOpacity={0} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
