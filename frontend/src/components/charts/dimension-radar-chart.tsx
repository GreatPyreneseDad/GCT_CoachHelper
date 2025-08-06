import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DimensionRadarChartProps {
  dimensions: Record<string, number>;
  comparisonData?: Record<string, number>;
}

export function DimensionRadarChart({ dimensions, comparisonData }: DimensionRadarChartProps) {
  const data = Object.entries(dimensions).map(([key, value]) => ({
    dimension: key.charAt(0).toUpperCase() + key.slice(1),
    current: Math.round(value),
    previous: comparisonData ? Math.round(comparisonData[key] || 0) : undefined,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dimensional Balance</CardTitle>
        <CardDescription>
          Your coherence across all dimensions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid 
              gridType="polygon"
              className="stroke-muted"
            />
            <PolarAngleAxis 
              dataKey="dimension"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <PolarRadiusAxis 
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              className="text-muted-foreground"
            />
            <Radar
              name="Current"
              dataKey="current"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
            />
            {comparisonData && (
              <Radar
                name="Previous"
                dataKey="previous"
                stroke="#94a3b8"
                fill="#94a3b8"
                fillOpacity={0.3}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}