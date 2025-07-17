import React from 'react';
import { motion } from 'framer-motion';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useDSA } from '../context/DSAContext';
import { useTheme } from '../context/ThemeContext';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

// Add types for accumulators:
interface TopicStats {
  total: number;
  solved: number;
  inProgress: number;
}

const TopicBreakdown = () => {
  const { problems } = useDSA();
  const { isDark } = useTheme();

  // Calculate topic breakdown
  const topicStats = problems.reduce((acc: { [topic: string]: TopicStats }, problem) => {
    if (!acc[problem.topic]) {
      acc[problem.topic] = { total: 0, solved: 0, inProgress: 0 };
    }
    acc[problem.topic].total++;
    if (problem.status === 'Done') acc[problem.topic].solved++;
    if (problem.status === 'In Progress') acc[problem.topic].inProgress++;
    return acc;
  }, {} as { [topic: string]: TopicStats });

  const chartData = Object.entries(topicStats).map(([topic, stats]) => ({
    name: topic,
    value: stats.solved,
    total: stats.total,
    inProgress: stats.inProgress,
    percentage: Math.round((stats.solved / stats.total) * 100)
  }));

  const colors = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

  const option = {
    title: {
      text: 'Topic Mastery',
      left: 'center',
      textStyle: {
        color: isDark ? '#fff' : '#374151',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? '#374151' : '#fff',
      borderColor: isDark ? '#4b5563' : '#e5e7eb',
      textStyle: {
        color: isDark ? '#fff' : '#374151'
      },
      formatter: function(params: any) {
        const data = params.data;
        return `${data.name}<br/>
                Solved: ${data.value}/${data.total}<br/>
                In Progress: ${data.inProgress}<br/>
                Completion: ${data.percentage}%`;
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: isDark ? '#d1d5db' : '#6b7280'
      }
    },
    series: [
      {
        name: 'Topic Mastery',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold',
            color: isDark ? '#fff' : '#374151',
            formatter: function(params: any) {
              return `${params.data.percentage}%\n${params.name}`;
            }
          }
        },
        labelLine: {
          show: false
        },
        data: chartData.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors[index % colors.length]
          }
        }))
      }
    ]
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="h-80">
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="mt-6 space-y-3">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.name}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.value}/{item.total}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.percentage}% complete
                </div>
              </div>
              <div className="w-20">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: colors[index % colors.length]
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TopicBreakdown;