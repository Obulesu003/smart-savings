import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { InvestmentAllocation } from '@/types/financial';

interface AllocationPieChartProps {
  allocation: InvestmentAllocation[];
}

export function AllocationPieChart({ allocation }: AllocationPieChartProps) {
  const data = allocation.map(item => ({
    name: item.name,
    value: item.percentage,
    color: item.color,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                    <p className="font-medium text-foreground">{payload[0].name}</p>
                    <p className="text-sm text-muted-foreground">
                      {payload[0].value}% allocation
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}