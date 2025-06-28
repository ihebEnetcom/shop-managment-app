"use client";

import type { Sale } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

type SalesChartProps = {
  sales: Sale[];
};

export function SalesChart({ sales }: SalesChartProps) {
  const salesByDay = sales.reduce((acc, sale) => {
    const day = format(sale.date, 'yyyy-MM-dd');
    if (!acc[day]) {
      acc[day] = 0;
    }
    acc[day] += sale.total;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(salesByDay)
    .map(([date, total]) => ({
      date: format(new Date(date), 'MMM d'),
      total,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent
                formatter={(value) => `$${(value as number).toFixed(2)}`}
                labelClassName="font-semibold"
                indicator="dot"
              />}
            />
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
