import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Wind, Book, Music, Heart, Timer } from 'lucide-react';

const WellnessPage: React.FC = () => {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);

  const tools = [
    {
      id: 'breathing',
      title: 'Breathing Exercise',
      description: '4-7-8 breathing technique for instant calm',
      icon: Wind,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'journal',
      title: 'Gratitude Journal',
      description: 'Write down three things you\'re grateful for',
      icon: Book,
      color: 'from-green-500 to-teal-500',
    },
    {
      id: 'meditation',
      title: 'Quick Meditation',
      description: '5-minute mindfulness session',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
    },
    {
      id: 'music',
      title: 'Calming Sounds',
      description: 'Nature sounds and peaceful music',
      icon: Music,
      color: 'from-purple-500 to-indigo-500',
    },
  ];

  const startBreathingExercise = () => {
    setIsBreathing(true);
    setBreathCount(0);
  };

  return (
    <Layout>
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Wellness Tools
            </h1>
            <p className="text-gray-600">
              Quick exercises and activities to support your mental well-being
            </p>
          </div>

          {!activeExercise ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <motion.button
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveExercise(tool.id)}
                    className="text-left bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 group"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600">{tool.description}</p>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => {
                  setActiveExercise(null);
                  setIsBreathing(false);
                }}
                className="mb-6 text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Back to tools
              </button>

              {activeExercise === 'breathing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12"
                >
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      4-7-8 Breathing
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds
                    </p>

                    <div className="relative w-64 h-64 mx-auto mb-8">
                      <motion.div
                        animate={
                          isBreathing
                            ? {
                                scale: [1, 1.5, 1.5, 1],
                                opacity: [0.5, 0.8, 0.8, 0.5],
                              }
                            : {}
                        }
                        transition={{
                          duration: 19,
                          repeat: Infinity,
                          times: [0, 0.21, 0.58, 1],
                        }}
                        className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Timer className="w-12 h-12 text-white mx-auto mb-2" />
                          <p className="text-white text-xl font-semibold">
                            {isBreathing ? 'Breathe...' : 'Ready'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {!isBreathing ? (
                      <button
                        onClick={startBreathingExercise}
                        className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                      >
                        Start Exercise
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsBreathing(false)}
                        className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                      >
                        Stop
                      </button>
                    )}

                    <div className="mt-8 text-sm text-gray-600">
                      <p className="font-medium mb-2">Benefits:</p>
                      <ul className="space-y-1">
                        <li>• Reduces anxiety and stress</li>
                        <li>• Helps you fall asleep</li>
                        <li>• Improves focus and concentration</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeExercise === 'journal' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Gratitude Journal
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Write down three things you're grateful for today:
                  </p>
                  <div className="space-y-4">
                    {[1, 2, 3].map((num) => (
                      <div key={num}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {num}. I'm grateful for...
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 focus:outline-none resize-none"
                          placeholder="Type here..."
                        />
                      </div>
                    ))}
                  </div>
                  <button className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all">
                    Save Entry
                  </button>
                </motion.div>
              )}

              {activeExercise === 'meditation' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 text-center"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    5-Minute Meditation
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Find a comfortable position and focus on your breath
                  </p>
                  <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full mx-auto mb-8 flex items-center justify-center">
                    <Heart className="w-16 h-16 text-white" />
                  </div>
                  <button className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all">
                    Begin Meditation
                  </button>
                </motion.div>
              )}

              {activeExercise === 'music' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Calming Sounds
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Choose a sound to help you relax:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {['Rain', 'Ocean Waves', 'Forest', 'White Noise'].map((sound) => (
                      <button
                        key={sound}
                        className="p-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl hover:shadow-lg transition-all"
                      >
                        <Music className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="font-medium text-gray-900">{sound}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WellnessPage;
