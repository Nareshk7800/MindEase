import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Smile, Meh, Frown, Battery, Users, Zap, CheckCircle, PenTool, ArrowRight, Heart, Activity, MessageCircle, Phone } from 'lucide-react';
import { useCheckIn } from '../context/CheckInContext';

interface MoodOption {
  value: number;
  label: string;
  icon: any;
  color: string;
  gradient: string;
  followUp: string;
  suggestions: { title: string; desc: string; icon: any }[];
}

const CheckInPage: React.FC = () => {
  const navigate = useNavigate();
  const { addCheckIn, checkIns } = useCheckIn();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [backgroundGradient, setBackgroundGradient] = useState('from-primary-50 via-white to-accent-50');
  const [customFollowUp, setCustomFollowUp] = useState<string | null>(null);

  const moodOptions: MoodOption[] = [
    {
      value: 5,
      label: 'Great',
      icon: Smile,
      color: 'text-green-600',
      gradient: 'from-green-100 via-emerald-50 to-teal-100',
      followUp: 'That’s wonderful! What made today awesome?',
      suggestions: [
        { title: 'Gratitude Journaling', desc: 'Capture this feeling.', icon: PenTool },
        { title: 'Goal Tracking', desc: 'Keep the momentum going.', icon: Activity }
      ]
    },
    {
      value: 4,
      label: 'Good',
      icon: Smile,
      color: 'text-teal-600',
      gradient: 'from-teal-100 via-cyan-50 to-blue-100',
      followUp: 'Glad to hear it! What went well today?',
      suggestions: [
        { title: 'Share the Joy', desc: 'Connect with a friend.', icon: Users },
        { title: 'Light Exercise', desc: 'Boost that energy.', icon: Activity }
      ]
    },
    {
      value: 3,
      label: 'Okay',
      icon: Meh,
      color: 'text-yellow-600',
      gradient: 'from-yellow-100 via-orange-50 to-amber-100',
      followUp: 'Just an average day? Anything specific on your mind?',
      suggestions: [
        { title: 'Mindful Break', desc: 'Take 5 minutes to breathe.', icon: Zap },
        { title: 'Reflection', desc: 'Journal your thoughts.', icon: PenTool }
      ]
    },
    {
      value: 2,
      label: 'Not Great',
      icon: Frown,
      color: 'text-orange-600',
      gradient: 'from-orange-100 via-red-50 to-rose-100',
      followUp: 'I’m sorry to hear that. What’s been challenging?',
      suggestions: [
        { title: 'Unwind', desc: 'Listen to calming music.', icon: Heart },
        { title: 'Self Care', desc: 'Take a warm bath or walk.', icon: Activity }
      ]
    },
    {
      value: 1,
      label: 'Struggling',
      icon: Frown,
      color: 'text-red-600',
      gradient: 'from-red-100 via-rose-50 to-pink-100',
      followUp: 'It sounds like a tough day. Would you like to talk about what’s making it hard?',
      suggestions: [
        { title: 'Breathing Exercise', desc: 'Calm your nervous system.', icon: Heart },
        { title: 'Crisis Support', desc: 'Talk to someone now.', icon: Phone }
      ]
    },
  ];

  // Base questions
  const baseQuestions = [
    {
      id: 'mood',
      question: 'How are you feeling today?',
      type: 'mood',
      options: moodOptions,
    },
    // We will dynamically insert the follow-up here
    {
      id: 'energy',
      question: 'What is your energy level?',
      type: 'scale',
      icon: Battery,
      min: 1,
      max: 5,
      labels: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
    },
    {
      id: 'stress',
      question: 'How would you rate your stress level?',
      type: 'scale',
      icon: Zap,
      min: 1,
      max: 5,
      labels: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
    },
    {
      id: 'journal',
      question: 'Anything else on your mind?',
      type: 'text',
      icon: PenTool,
      placeholder: 'Write a brief note about your day... (optional)',
    },
  ];

  const [questions, setQuestions] = useState(baseQuestions);

  const handleResponse = (questionId: string, value: any) => {
    setResponses({ ...responses, [questionId]: value });

    if (questionId === 'mood') {
      const selectedMood = moodOptions.find(opt => opt.value === value);
      if (selectedMood) {
        setBackgroundGradient(selectedMood.gradient);

        // Dynamic Question Insertion
        const newQuestions = [...baseQuestions];
        const followUpQuestion = {
          id: 'followUp',
          question: selectedMood.followUp,
          type: 'text',
          icon: MessageCircle,
          placeholder: 'Type here...'
        };

        // Insert follow-up after mood (index 0)
        newQuestions.splice(1, 0, followUpQuestion);
        setQuestions(newQuestions);
      }
    }

    if (currentStep < questions.length - 1 && questions[currentStep].type !== 'text') {
      setTimeout(() => setCurrentStep(currentStep + 1), 400); // Slightly longer for effect
    }
  };

  const handleComplete = () => {
    addCheckIn({
      mood: responses.mood || 3,
      energy: responses.energy || 3,
      social: responses.social || 3, // Removed from UI but kept in interface if needed, or default
      stress: responses.stress || 3,
      journal: `${responses.followUp ? `[Follow Up: ${responses.followUp}] ` : ''}${responses.journal || ''}`,
    });
    setShowSuccess(true);
  };

  const currentQuestion = questions[currentStep] || questions[0];
  const progress = ((currentStep + 1) / questions.length) * 100;

  // Get selected mood option for success screen
  const selectedMoodOption = moodOptions.find(opt => opt.value === responses.mood);

  // Calculate weekly history for the graph
  const weeklyHistory = React.useMemo(() => {
    // If we have checkIns, use the last 6 + current (which is just added or about to be added)
    // Actually since we haven't re-fetched or if it's instant, let's use checkIns directly.
    // Assuming checkIns is updated. Providing a fallback to mock data if empty.
    if (checkIns.length > 0) {
      const sorted = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const last7 = sorted.slice(-7).map(c => c.mood);
      // Ensure at least 7 items for the graph structure
      while (last7.length < 7) {
        last7.unshift(3);
      }
      return last7;
    }
    return [3, 4, 4, 3, 2, 4, responses.mood || 3];
  }, [checkIns, responses.mood]);

  // Calculate Streak
  const streak = React.useMemo(() => {
    let count = 0;
    // We use the computed weeklyHistory for simplicity as it represents recent days
    // But weeklyHistory contains numbers.
    // Let's iterate backwards.
    // If we want real streak from ALL history, we should use checkIns.
    // But for the "weekly" view context, let's just use the last few days or checkIns.

    // Check if the current mood is positive (>=3)
    if ((responses.mood || 0) >= 3) {
      count = 1;
      const reversedHistory = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      // Skip the current one if it's already in the list? checkIns doesn't have the current one yet when called?
      // actually addCheckIn is called, so it might be there.
      // Let's just look at the most recent checkIns.

      for (const checkIn of reversedHistory) {
        if (new Date(checkIn.date).toDateString() === new Date().toDateString()) continue;
        if (checkIn.mood >= 3) {
          count++;
        } else {
          break;
        }
      }
    }
    return count;
  }, [checkIns, responses.mood]);

  return (
    <Layout>
      <motion.div
        className={`min-h-[calc(100vh-64px)] lg:min-h-screen flex items-center justify-center p-4 transition-colors duration-1000 bg-gradient-to-br ${backgroundGradient}`}
      >
        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-surface-600 mb-2 font-medium">
              <span>Question {currentStep + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-white/50 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-xl p-8 lg:p-12 rounded-3xl shadow-xl border border-white/50"
            >
              <div className="text-center mb-10">
                {currentQuestion.icon && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"
                  >
                    {React.createElement(currentQuestion.icon, {
                      className: 'w-10 h-10 text-primary-600',
                    })}
                  </motion.div>
                )}
                <h2 className="text-3xl lg:text-4xl font-bold text-surface-900 tracking-tight">
                  {currentQuestion.question}
                </h2>
              </div>

              {currentQuestion.type === 'mood' && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {currentQuestion.options?.map((option: any) => {
                    const Icon = option.icon;
                    const isSelected = responses[currentQuestion.id] === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleResponse(currentQuestion.id, option.value)}
                        className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 ${isSelected
                          ? `border-primary-500 bg-primary-50 shadow-lg scale-105 ring-2 ring-primary-200 ring-offset-2`
                          : 'border-surface-200 hover:border-primary-300 hover:shadow-lg'
                          }`}
                      >
                        <motion.div
                          animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ repeat: isSelected ? Infinity : 0, duration: 2 }}
                        >
                          <Icon className={`w-10 h-10 mb-3 ${option.color}`} />
                        </motion.div>
                        <span className={`text-sm font-bold ${isSelected ? 'text-primary-700' : 'text-surface-600'}`}>
                          {option.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === 'scale' && (
                <div className="space-y-8">
                  <div className="flex justify-between gap-3">
                    {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
                      <motion.button
                        key={value}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleResponse(currentQuestion.id, value)}
                        className={`flex-1 h-24 rounded-2xl border-2 transition-all ${responses[currentQuestion.id] === value
                          ? 'border-primary-500 bg-primary-50 shadow-md scale-105'
                          : 'border-surface-200 hover:border-primary-300 hover:shadow-lg'
                          }`}
                      >
                        <span className={`text-3xl font-bold ${responses[currentQuestion.id] === value ? 'text-primary-600' : 'text-surface-500'}`}>
                          {value}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm font-medium text-surface-500 px-2">
                    <span>{currentQuestion.labels?.[0]}</span>
                    <span>{currentQuestion.labels?.[4]}</span>
                  </div>
                </div>
              )}

              {currentQuestion.type === 'text' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <textarea
                    value={responses[currentQuestion.id] || ''}
                    onChange={(e) => setResponses({ ...responses, [currentQuestion.id]: e.target.value })}
                    placeholder={currentQuestion.placeholder}
                    className="w-full h-40 p-6 rounded-2xl border-2 border-surface-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all resize-none text-lg text-surface-700 placeholder:text-surface-400"
                    autoFocus
                  />
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-12">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="px-8 py-3 text-surface-500 hover:text-surface-900 disabled:opacity-30 disabled:cursor-not-allowed font-semibold transition-colors flex items-center gap-2"
                >
                  Back
                </button>

                {currentStep === questions.length - 1 ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleComplete}
                    className="px-10 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-primary-500/30 transition-all flex items-center gap-2"
                  >
                    Complete Check-in <CheckCircle className="w-5 h-5" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!responses[currentQuestion.id] && currentQuestion.id === 'mood'} // Mood is mandatory for the flow logic
                    className="px-8 py-3 bg-surface-900 text-white rounded-xl font-semibold hover:bg-surface-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    Next <ArrowRight className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Check-in Complete!</h3>
                <p className="text-gray-600">Here's a summary of your well-being.</p>
              </div>

              {/* Mood History Graph */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Weekly Mood Trend</h4>
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <div className="flex items-end justify-between h-32 gap-2">
                    {weeklyHistory.map((mood, index) => (
                      <div key={index} className="flex flex-col items-center flex-1 gap-2">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(mood / 5) * 100}%` }}
                          transition={{ delay: 0.2 + (index * 0.1) }}
                          className={`w-full rounded-t-lg ${index === 6 ? 'bg-primary-500' : 'bg-gray-300'
                            }`}
                        />
                        <span className="text-xs font-medium text-gray-400">
                          {['S', 'M', 'T', 'W', 'T', 'F', 'Today'][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    {streak > 1 ? (
                      <p className="text-sm text-gray-600">
                        You've felt <span className="font-bold text-primary-600">Okay</span> or better for {streak} days in a row.
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Logging your mood daily helps you track patterns. Keep it up!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Context Aware Suggestions */}
              {selectedMoodOption && (
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Suggested for You</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {selectedMoodOption.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          {React.createElement(suggestion.icon, { className: 'w-5 h-5 text-primary-600' })}
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 text-sm mb-1">{suggestion.title}</h5>
                          <p className="text-xs text-gray-600">{suggestion.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-4 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default CheckInPage;
