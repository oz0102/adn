import React from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export type ChartType = 'line' | 'bar' | 'doughnut' | 'pie';

interface ChartCardProps {
  title: string;
  type: ChartType;
  data: ChartData<'line' | 'bar' | 'doughnut' | 'pie', number[], string>;
  options?: ChartOptions<'line' | 'bar' | 'doughnut' | 'pie'>;
  className?: string;
  height?: number;
}

export function ChartCard({
  title,
  type,
  data,
  options,
  className,
  height = 300,
}: ChartCardProps) {
  const defaultOptions: ChartOptions<'line' | 'bar' | 'doughnut' | 'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={mergedOptions} height={height} />;
      case 'bar':
        return <Bar data={data} options={mergedOptions} height={height} />;
      case 'doughnut':
        return <Doughnut data={data} options={mergedOptions} height={height} />;
      case 'pie':
        return <Pie data={data} options={mergedOptions} height={height} />;
      default:
        return <Line data={data} options={mergedOptions} height={height} />;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div style={{ height: `${height}px` }}>
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
}
