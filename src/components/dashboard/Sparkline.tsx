
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useMemo } from 'react';

interface SparklineProps {
    data: number[];
    color?: string;
    height?: number;
    showTooltip?: boolean;
}

export function Sparkline({ data, color = "hsl(var(--primary))", height = 50, showTooltip = true }: SparklineProps) {
    const chartData = useMemo(() => {
        return data.map((val, index) => ({ index, value: val }));
    }, [data]);

    if (!data || data.length === 0) return null;

    return (
        <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        fill={`url(#gradient-${color})`}
                        strokeWidth={2}
                        dot={false}
                        animationDuration={1000}
                    />
                    {showTooltip && (
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                    Value
                                                </span>
                                                <span className="font-bold text-muted-foreground">
                                                    {payload[0].value}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
