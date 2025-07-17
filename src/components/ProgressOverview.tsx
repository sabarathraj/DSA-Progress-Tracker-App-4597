import React from 'react';
import { motion } from 'framer-motion';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useDSA } from '../context/DSAContext';
import { useTheme } from '../context/ThemeContext';
import Card from './common/Card';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

// Add types for accumulators:
interface TopicStats {
  total: number;
  solved: number;
}
interface DifficultyStats {
  total: number;
  solved: number;
}

const ProgressOverview = () => {
  const { problems } = useDSA();
  const { isDark } = useTheme();

  // Calculate topic progress
  const topicProgress = problems.reduce((acc, problem) => {
    if (!acc[problem.topic]) {
      acc[problem.topic] = { total: 0, solved: 0 };
    }
    acc[problem.topic].total++;
    if (problem.status === 'Done') {
      acc[problem.topic].solved++;
    }
    return acc;
  }, {} as { [topic: string]: TopicStats });

  // Calculate difficulty progress
  const difficultyProgress = problems.reduce((acc, problem) => {
    if (!acc[problem.difficulty]) {
      acc[problem.difficulty] = { total: 0, solved: 0 };
    }
    acc[problem.difficulty].total++;
    if (problem.status === 'Done') {
      acc[problem.difficulty].solved++;
    }
    return acc;
  }, {} as { [difficulty: string]: DifficultyStats });

  const topicChartData = Object.entries(topicProgress).map(([topic, data]) => ({
    name: topic,
    value: data.solved,
    total: data.total,
    percentage: Math.round((data.solved / data.total) * 100)
  }));

  const difficultyChartData = Object.entries(difficultyProgress).map(([difficulty, data]) => ({
    name: difficulty,
    value: data.solved,
    total: data.total,
    percentage: Math.round((data.solved / data.total) * 100)
  }));

  const getChartOption = (data: any[], title: string) => ({
    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: isDark ? '#fff' : '#374151',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
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
        name: title,
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
            fontSize: '18',
            fontWeight: 'bold',
            color: isDark ? '#fff' : '#374151'
          }
        },
        labelLine: {
          show: false
        },
        data: data.map((item: any, index: number) => ({
          ...item,
          itemStyle: {
            color: [
              '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
            ][index % 6]
          }
        }))
      }
    ]
  });

  return (
    <Card className="p-6 shadow-sm border border-gray-200 dark:border-gray-700" padding="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Progress Overview
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Topic Progress Chart */}
        <div className="h-64">
          <ReactEChartsCore
            echarts={echarts}
            option={getChartOption(topicChartData, 'By Topic')}
            style={{ height: '100%', width: '100%' }}
          />
        </div>

        {/* Difficulty Progress Chart */}
        <div className="h-64">
          <ReactEChartsCore
            echarts={echarts}
            option={getChartOption(difficultyChartData, 'By Difficulty')}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mt-6 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Topic Progress
          </h4>
          <div className="space-y-2">
            {topicChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-24">
                  {item.name}
                </span>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-primary-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16 text-right">
                  {item.value}/{item.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Difficulty Progress
          </h4>
          <div className="space-y-2">
            {difficultyChartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-24">
                  {item.name}
                </span>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        item.name === 'Easy' ? 'bg-success-500' :
                        item.name === 'Medium' ? 'bg-warning-500' : 'bg-danger-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16 text-right">
                  {item.value}/{item.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProgressOverview;