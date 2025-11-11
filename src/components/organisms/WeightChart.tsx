import React from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@atoms/Button';
import { WeightHistory } from '@/types/analytics';

interface WeightChartProps {
  data: WeightHistory[];
  currentWeight: number;
  targetWeight?: number;
  onUpdate: () => void;
}

export function WeightChart({
  data,
  currentWeight,
  targetWeight,
  onUpdate,
}: WeightChartProps): React.ReactElement {
  const { t } = useTranslation();

  // Calculate trend
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const firstWeight = sortedData[0]?.weight || currentWeight;
  const lastWeight = sortedData[sortedData.length - 1]?.weight || currentWeight;
  const trend = lastWeight - firstWeight;
  const isTrendingUp = trend > 0;

  // Format data for chart
  const chartData = sortedData.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: item.weight,
  }));

  // Calculate Y-axis domain
  const weights = data.map((d) => d.weight);
  const minWeight = Math.min(...weights, targetWeight || Infinity);
  const maxWeight = Math.max(...weights);
  const padding = 5;
  const yMin = Math.floor(minWeight - padding);
  const yMax = Math.ceil(maxWeight + padding);

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm text-muted-foreground">{t('profile.weight')}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-3xl font-bold">{currentWeight.toFixed(1)} kg</h2>
            {trend !== 0 && (
              <span
                className={`flex items-center gap-1 text-sm ${
                  isTrendingUp ? 'text-orange-500' : 'text-green-500'
                }`}
              >
                {isTrendingUp ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(trend).toFixed(1)} kg
              </span>
            )}
          </div>
          {targetWeight && (
            <p className="text-sm text-muted-foreground mt-1">
              {t('weight.target')}: {targetWeight} kg
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onUpdate}>
          {t('common.update')}
        </Button>
      </div>

      {chartData.length > 0 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              {targetWeight && (
                <Line
                  type="monotone"
                  data={chartData.map((d) => ({ ...d, target: targetWeight }))}
                  dataKey="target"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

