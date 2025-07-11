import React from 'react';
import { motion } from 'framer-motion';
import { useDSA } from '../context/DSAContext';
import { format, subDays, isToday, parseISO } from 'date-fns';

const CalendarHeatmap = () => {
  const { dailyProgress } = useDSA();

  // Generate last 12 weeks of data
  const weeks = [];
  const today = new Date();
  
  for (let week = 0; week < 12; week++) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      const date = subDays(today, (week * 7) + day);
      const dateStr = format(date, 'yyyy-MM-dd');
      const progress = dailyProgress[dateStr];
      
      days.unshift({
        date: dateStr,
        achieved: progress?.achieved || false,
        solved: progress?.solved || 0,
        isToday: isToday(date)
      });
    }
    weeks.unshift(days);
  }

  const getIntensity = (solved) => {
    if (solved === 0) return 0;
    if (solved <= 2) return 1;
    if (solved <= 4) return 2;
    if (solved <= 6) return 3;
    return 4;
  };

  const getColor = (intensity, achieved) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (achieved) {
      const colors = [
        'bg-success-200 dark:bg-success-800',
        'bg-success-300 dark:bg-success-700',
        'bg-success-400 dark:bg-success-600',
        'bg-success-500 dark:bg-success-500'
      ];
      return colors[intensity - 1];
    } else {
      const colors = [
        'bg-orange-200 dark:bg-orange-800',
        'bg-orange-300 dark:bg-orange-700',
        'bg-orange-400 dark:bg-orange-600',
        'bg-orange-500 dark:bg-orange-500'
      ];
      return colors[intensity - 1];
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activity Calendar
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((intensity) => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded-sm ${getColor(intensity, intensity > 0)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 ${
                    getColor(getIntensity(day.solved), day.achieved)
                  } ${
                    day.isToday ? 'ring-2 ring-primary-500' : ''
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                  whileHover={{ scale: 1.2 }}
                  title={`${format(parseISO(day.date), 'MMM d, yyyy')}: ${day.solved} problems solved${day.achieved ? ' ✅' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-success-400 rounded-sm" />
            <span>Goal achieved</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-400 rounded-sm" />
            <span>Progress made</span>
          </div>
        </div>
        <div>
          Last 12 weeks
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarHeatmap;