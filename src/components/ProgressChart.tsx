import React from 'react';
import { motion } from 'framer-motion';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useDSA } from '../context/DSAContext';
import { useTheme } from '../context/ThemeContext';
import { format, subDays, parseISO } from 'date-fns';
import SkeletonLoader from './common/SkeletonLoader';
import Card from './common/Card';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, GridComponent, LineChart, CanvasRenderer]);

const ProgressChart = () => {
  const { dailyProgress, loading } = useDSA();
  const { isDark } = useTheme();

  // Generate last 30 days of data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const progress = dailyProgress[dateStr];
    
    return {
      date: dateStr,
      solved: progress?.solved || 0,
      achieved: progress?.achieved || false
    };
  });

  // Calculate cumulative progress
  let cumulative = 0;
  const chartData = last30Days.map(day => {
    cumulative += day.solved;
    return {
      date: day.date,
      daily: day.solved,
      cumulative: cumulative,
      achieved: day.achieved
    };
  });

  const option = {
    title: {
      text: 'Progress Over Time',
      left: 'center',
      textStyle: {
        color: isDark ? '#fff' : '#374151',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      backgroundColor: isDark ? '#374151' : '#fff',
      borderColor: isDark ? '#4b5563' : '#e5e7eb',
      textStyle: {
        color: isDark ? '#fff' : '#374151'
      }
    },
    legend: {
      data: ['Daily Problems', 'Cumulative Total'],
      bottom: 0,
      textStyle: {
        color: isDark ? '#d1d5db' : '#6b7280'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.map(item => format(parseISO(item.date), 'MMM d')),
      axisLabel: {
        color: isDark ? '#9ca3af' : '#6b7280',
        rotate: 45
      },
      axisLine: {
        lineStyle: {
          color: isDark ? '#4b5563' : '#e5e7eb'
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Daily Problems',
        position: 'left',
        axisLabel: {
          color: isDark ? '#9ca3af' : '#6b7280'
        },
        axisLine: {
          lineStyle: {
            color: isDark ? '#4b5563' : '#e5e7eb'
          }
        },
        splitLine: {
          lineStyle: {
            color: isDark ? '#374151' : '#f3f4f6'
          }
        }
      },
      {
        type: 'value',
        name: 'Cumulative',
        position: 'right',
        axisLabel: {
          color: isDark ? '#9ca3af' : '#6b7280'
        },
        axisLine: {
          lineStyle: {
            color: isDark ? '#4b5563' : '#e5e7eb'
          }
        }
      }
    ],
    series: [
      {
        name: 'Daily Problems',
        type: 'line',
        yAxisIndex: 0,
        data: chartData.map(item => item.daily),
        itemStyle: {
          color: '#0ea5e9'
        },
        lineStyle: {
          color: '#0ea5e9',
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(14, 165, 233, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(14, 165, 233, 0.1)'
            }
          ])
        },
        smooth: true
      },
      {
        name: 'Cumulative Total',
        type: 'line',
        yAxisIndex: 1,
        data: chartData.map(item => item.cumulative),
        itemStyle: {
          color: '#22c55e'
        },
        lineStyle: {
          color: '#22c55e',
          width: 2
        },
        smooth: true
      }
    ]
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <SkeletonLoader width="100%" height={256} borderRadius={16} />
      </div>
    );
  }

  return (
    <Card className="p-6 shadow-sm border border-gray-200 dark:border-gray-700" padding="p-6">
      <div className="h-80">
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </Card>
  );
};

export default ProgressChart;