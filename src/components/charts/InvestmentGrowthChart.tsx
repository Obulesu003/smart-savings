import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RiskPreference } from '@/types/financial';
import { formatCurrency } from '@/lib/calculations';

interface InvestmentGrowthChartProps {
  monthlyInvestment: number;
  years: number;
  riskPreference: RiskPreference;
  goalAmount: number;
}

const RISK_RETURNS: Record<RiskPreference, number> = {
  low: 0.05,
  medium: 0.08,
  high: 0.12,
};

export function InvestmentGrowthChart({ 
  monthlyInvestment, 
  years, 
  riskPreference,
  goalAmount 
}: InvestmentGrowthChartProps) {
  const annualReturn = RISK_RETURNS[riskPreference];
  const monthlyReturn = annualReturn / 12;
  
  const data = [];
  for (let year = 0; year <= years; year++) {
    const months = year * 12;
    const value = monthlyInvestment * 
      ((Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn) *
      (1 + monthlyReturn);
    
    data.push({
      year: `Year ${year}`,
      value: Math.round(value),
      yearNum: year,
    });
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="yearNum"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => `Y${value}`}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                    <p className="font-medium text-foreground">{data.year}</p>
                    <p className="text-sm text-muted-foreground">
                      Portfolio Value: {formatCurrency(data.value)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine 
            y={goalAmount} 
            stroke="hsl(160, 84%, 39%)" 
            strokeDasharray="5 5"
            label={{ 
              value: 'Goal', 
              position: 'right',
              fill: 'hsl(160, 84%, 39%)',
              fontSize: 12
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(217, 91%, 40%)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: 'hsl(217, 91%, 40%)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}