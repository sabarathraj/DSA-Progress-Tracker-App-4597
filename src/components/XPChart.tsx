import React from 'react';
import { motion } from 'framer-motion';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useDSA } from '../context/DSAContext';
import { useTheme } from '../context/ThemeContext';
import { format, subDays, parseISO } from 'date-fns';
import SkeletonLoader from './common/SkeletonLoader';
import Card from './common/Card';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, GridComponent, BarChart, CanvasRenderer]);

const XPChart = () => {
  const { dailyProgress, problems, loading } = useDSA();
  const { isDark } = useTheme();

  // Generate last 14 days of XP data
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const progress = dailyProgress[dateStr];
    
    // Calculate XP for this day based on problems solved
    let dailyXP = 0;
    if (progress?.solved) {
      // This is a simplified calculation - in a real app, you'd track which specific problems were solved each day
      const avgXP = problems.reduce((sum, p) => sum + p.xp, 0) / problems.length;
      dailyXP = Math.round(avgXP * progress.solved);
    }
    
    return {
      date: dateStr,
      xp: dailyXP,
      achieved: progress?.achieved || false
    };
  });

  const option = {
    title: {
      text: 'XP Gained (Last 14 Days)',
      left: 'center',
      textStyle: {
        color: isDark ? '#fff' : '#374151',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#374151' : '#fff',
      borderColor: isDark ? '#4b5563' : '#e5e7eb',
      textStyle: {
        color: isDark ? '#fff' : '#374151'
      },
      formatter: function(params: any) {
        const data = params[0];
        const dayData = last14Days[data.dataIndex];
        return `${format(parseISO(dayData.date), 'MMM d, yyyy')}<br/>
                XP Gained: ${data.value}<br/>
                Goal: ${dayData.achieved ? '✅ Achieved' : '❌ Missed'}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: last14Days.map(item => format(parseISO(item.date), 'MMM d')),
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
    yAxis: {
      type: 'value',
      name: 'XP',
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
    series: [
      {
        name: 'XP Gained',
        type: 'bar',
        data: last14Days.map((item, index) => ({
          value: item.xp,
          itemStyle: {
            color: item.achieved ? '#22c55e' : item.xp > 0 ? '#f59e0b' : '#e5e7eb'
          }
        })),
        barWidth: '60%',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
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
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-success-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Goal Achieved</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-warning-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Progress Made</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">No Activity</span>
        </div>
      </div>
    </Card>
  );
};

export default XPChart;