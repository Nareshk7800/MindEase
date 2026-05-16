import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Phone, MessageCircle, Globe, AlertCircle } from 'lucide-react';

const CrisisPage: React.FC = () => {
  const helplines = [
    {
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      description: '24/7 crisis support',
      icon: Phone,
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Text-based crisis support',
      icon: MessageCircle,
    },
    {
      name: 'International Association for Suicide Prevention',
      number: 'Visit IASP.info',
      description: 'Global crisis resources',
      icon: Globe,
    },
  ];

  const copingStrategies = [
    'Reach out to someone you trust',
    'Practice deep breathing exercises',
    'Focus on the present moment',
    'Engage in a calming activity',
    'Remember that this feeling will pass',
  ];

  return (
    <Layout>
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Alert Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border-2 border-red-300 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-red-900 mb-2">
                  If you're in immediate danger, please call emergency services
                </h2>
                <p className="text-red-800">
                  In the US: 911 | UK: 999 | India: 112 | Australia: 000
                </p>
              </div>
            </div>
          </motion.div>

          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Crisis Support
            </h1>
            <p className="text-lg text-gray-600">
              You're not alone. Help is available 24/7. These resources can provide immediate support.
            </p>
          </div>

          {/* Helplines */}
          <div className="space-y-4 mb-8">
            {helplines.map((helpline, index) => {
              const Icon = helpline.icon;
              return (
                <motion.a
                  key={index}
                  href={
                    helpline.number.includes('988')
                      ? 'tel:988'
                      : helpline.number.includes('741741')
                      ? 'sms:741741'
                      : 'https://www.iasp.info/resources/Crisis_Centres/'
                  }
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {helpline.name}
                      </h3>
                      <p className="text-primary-600 font-semibold text-lg mb-1">
                        {helpline.number}
                      </p>
                      <p className="text-gray-600 text-sm">{helpline.description}</p>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>

          {/* Coping Strategies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl shadow-lg p-6 lg:p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Immediate Coping Strategies
            </h2>
            <p className="text-gray-600 mb-6">
              While waiting for support, these techniques may help:
            </p>
            <div className="space-y-3">
              {copingStrategies.map((strategy, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-white rounded-xl"
                >
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 font-medium">{strategy}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center text-gray-600"
          >
            <p className="mb-4">
              Remember: Seeking help is a sign of strength, not weakness.
            </p>
            <p className="text-sm">
              If you need ongoing support, consider talking to a mental health professional
              or reaching out to our AI companion for additional resources.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CrisisPage;
