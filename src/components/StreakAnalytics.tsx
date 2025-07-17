import React from 'react';
import { motion } from 'framer-motion';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useDSA } from '../context/DSAContext';
import { useTheme } from '../context/ThemeContext';
import { format, subDays, parseISO } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import Card from './common/Card';

const { FiAward, FiTrendingUp, FiCalendar } = FiIcons;

echarts.use([TitleComponent, TooltipComponent, GridComponent, LineChart, CanvasRenderer]);

const StreakAnalytics = () => {
  const { dailyProgress, streak } = useDSA();
  const { isDark } = useTheme();

  // Generate last 30 days of streak data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const progress = dailyProgress[dateStr];
    
    return {
      date: dateStr,
      achieved: progress?.achieved || false,
      solved: progress?.solved || 0
    };
  });

  // Calculate streak progression
  let currentStreak = 0;
  const streakData = last30Days.map(day => {
    if (day.achieved) {
      currentStreak++;
    } else {
      currentStreak = 0;
    }
    return {
      date: day.date,
      streak: currentStreak,
      achieved: day.achieved
    };
  });

  const option = {
    title: {
      text: 'Streak Progression',
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
        const dayData = streakData[data.dataIndex];
        return `${format(parseISO(dayData.date), 'MMM d, yyyy')}<br/>
                Streak: ${data.value} days<br/>
                Status: ${dayData.achieved ? '✅ Goal achieved' : '❌ Goal missed'}`;
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
      data: streakData.map(item => format(parseISO(item.date), 'MMM d')),
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
      name: 'Streak Days',
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
        name: 'Streak',
        type: 'line',
        data: streakData.map(item => item.streak),
        itemStyle: {
          color: '#f59e0b'
        },
        lineStyle: {
          color: '#f59e0b',
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(245, 158, 11, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(245, 158, 11, 0.1)'
            }
          ])
        },
        smooth: true,
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="h-80">
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      {/* Streak Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Card className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <SafeIcon icon={FiAward} className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {streak.current}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">
            Current Streak
          </div>
        </Card>

        <Card className="text-center p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
            {streak.longest}
          </div>
          <div className="text-sm text-primary-600 dark:text-primary-400">
            Longest Streak
          </div>
        </Card>

        <Card className="text-center p-4 bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900 dark:to-success-800 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <SafeIcon icon={FiCalendar} className="w-6 h-6 text-success-600 dark:text-success-400" />
          </div>
          <div className="text-2xl font-bold text-success-700 dark:text-success-300">
            {last30Days.filter(d => d.achieved).length}
          </div>
          <div className="text-sm text-success-600 dark:text-success-400">
            Goals This Month
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default StreakAnalytics;