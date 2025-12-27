import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function TimeSeriesChart({
    data,
    title,
    dataKey = "value",
    color = "#3b82f6",
    height = 250,
    yDomain = ['auto', 'auto'],
    threshold
}) {
    return (
        <div className="w-full h-full rounded-lg border border-border bg-card p-4">
            {title && (
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                </div>
            )}
            <div style={{ height: height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                            dataKey="time"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            domain={yDomain}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '0.375rem',
                                color: '#f3f4f6'
                            }}
                            labelStyle={{ color: '#9ca3af' }}
                        />
                        {threshold && (
                            <ReferenceLine y={threshold} stroke="#ef4444" strokeDasharray="3 3" />
                        )}
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                            dot={false}
                            animationDuration={500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
