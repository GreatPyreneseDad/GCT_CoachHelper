import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface CoherenceProgressChartProps {
  data: Array<{
    date: Date;
    score: number;
    dimensions: Record<string, number>;
  }>;
  period?: string;
}

export function CoherenceProgressChart({ data, period = '30d' }: CoherenceProgressChartProps) {
  const chartData = data.map(point => ({
    date: format(point.date, 'MMM dd'),
    coherence: Math.round(point.score),
    ...Object.fromEntries(
      Object.entries(point.dimensions || {}).map(([key, value]) => [key, Math.round(value)])
    ),
  }));

  const colors = {
    coherence: '#8b5cf6',
    physical: '#3b82f6',
    emotional: '#10b981',
    mental: '#f59e0b',
    social: '#ef4444',
    spiritual: '#ec4899',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coherence Progress</CardTitle>
        <CardDescription>
          Your transformation journey over the last {period}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickMargin={10}
              className="text-muted-foreground"
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              tickMargin={10}
              className="text-muted-foreground"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="coherence"
              stroke={colors.coherence}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Overall Coherence"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}