import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { TrendingUp, TrendingDown, Minus, Calendar, Award, Activity } from 'lucide-react';
import { useCheckIn, CheckInData } from '../context/CheckInContext';

const DashboardPage: React.FC = () => {
  const { getRecentCheckIns } = useCheckIn();
  const recentCheckIns = getRecentCheckIns(7);

  // Process data for the chart
  const moodData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return d;
    });

    return last7Days.map(date => {
      const dayStr = days[date.getDay()];
      // Find check-in for this day
      const checkIn = recentCheckIns.find(c => {
        const cDate = new Date(c.date);
        return cDate.getDate() === date.getDate() &&
          cDate.getMonth() === date.getMonth() &&
          cDate.getFullYear() === date.getFullYear();
      });
      return {
        day: dayStr,
        value: checkIn ? checkIn.mood : 0,
        fullDate: date,
      };
    });
  }, [recentCheckIns]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalMood = recentCheckIns.reduce((acc, curr) => acc + curr.mood, 0);
    const avgMood = recentCheckIns.length ? (totalMood / recentCheckIns.length).toFixed(1) : '0.0';

    // Simple streak calculation (consecutive days ending today)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort checkins by date descending
    const sorted = [...recentCheckIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Check if checked in today
    const hasCheckedInToday = sorted.some(c => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (hasCheckedInToday) streak = 1;

    // This is a simplified streak logic for demo purposes
    // In a real app, we'd check consecutive days more robustly

    return [
      {
        label: 'Current Streak',
        value: `${streak} days`,
        trend: 'stable',
        icon: Calendar,
        color: 'from-green-500 to-teal-500',
      },
      {
        label: 'Avg Mood Score',
        value: `${avgMood}/5`,
        trend: parseFloat(avgMood) >= 4 ? 'up' : parseFloat(avgMood) >= 3 ? 'stable' : 'down',
        icon: TrendingUp,
        color: 'from-blue-500 to-cyan-500',
      },
      {
        label: 'Wellness Score',
        value: '85', // Placeholder for a more complex metric
        trend: 'up',
        icon: Activity,
        color: 'from-purple-500 to-indigo-500',
      },
    ];
  }, [recentCheckIns]);

  const insights = [
    'Your mood has been consistent this week.',
    'Great job checking in regularly!',
    'Try a breathing exercise to boost your energy.',
  ];

  return (
    <Layout>
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-surface-900 mb-2">
              Your Progress
            </h1>
            <p className="text-surface-600">Track your mental health journey over time</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const TrendIcon =
                stat.trend === 'up'
                  ? TrendingUp
                  : stat.trend === 'down'
                    ? TrendingDown
                    : Minus;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-sm`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div
                      className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${stat.trend === 'up'
                        ? 'bg-green-100 text-green-600'
                        : stat.trend === 'down'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-surface-100 text-surface-600'
                        }`}
                    >
                      <TrendIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-surface-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-surface-600 font-medium">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Mood Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 lg:p-8 mb-8 rounded-3xl"
          >
            <h2 className="text-2xl font-bold text-surface-900 mb-8">Weekly Mood Tracker</h2>
            <div className="flex items-end justify-between h-64 gap-2 sm:gap-4">
              {moodData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full h-full flex items-end bg-surface-50 rounded-t-2xl overflow-hidden">
                    {data.value > 0 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(data.value / 5) * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5, type: "spring" }}
                        className="w-full bg-gradient-to-t from-primary-500 to-accent-500 rounded-t-xl opacity-80 group-hover:opacity-100 transition-opacity relative"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          Score: {data.value}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-surface-500 mt-3">{data.day}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs font-medium text-surface-400 uppercase tracking-wider">
              <span>Low</span>
              <span>High</span>
            </div>
          </motion.div>

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl shadow-inner p-6 lg:p-8 border border-white/50"
          >
            <h2 className="text-2xl font-bold text-surface-900 mb-6">Personalized Insights</h2>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2.5 flex-shrink-0 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                  <p className="text-surface-700 font-medium text-lg">{insight}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
