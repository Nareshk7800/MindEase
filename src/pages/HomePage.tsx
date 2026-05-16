import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Heart, MessageCircle, BookOpen, TrendingUp, Users, Shield } from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Heart,
      title: 'Daily Check-ins',
      description: 'Track your mental well-being with personalized mood assessments',
      color: 'from-red-500 to-pink-500',
      link: '/check-in',
    },
    {
      icon: MessageCircle,
      title: 'AI Companion',
      description: 'Chat with our supportive AI trained to understand and help',
      color: 'from-primary-500 to-accent-500',
      link: '/chat',
    },
    {
      icon: BookOpen,
      title: 'Resources Hub',
      description: 'Access culturally relevant mental health resources and guides',
      color: 'from-green-500 to-teal-500',
      link: '/resources',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Visualize your mental health journey with insights',
      color: 'from-warm-500 to-orange-500',
      link: '/dashboard',
    },
  ];

  const values = [
    {
      icon: Users,
      title: 'Community-Centric',
      description: 'Built by and for diverse communities',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is secure and confidential',
    },
    {
      icon: Heart,
      title: 'Culturally Relevant',
      description: 'Resources tailored to your background',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-surface-900 mb-6 tracking-tight">
                Your Mental Health,{' '}
                <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Your Way
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-surface-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                EquiMind provides accessible, culturally relevant mental health support for young people.
                Take charge of your well-being with AI-powered tools and community resources.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/check-in"
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-primary-500/30 transition-all transform hover:scale-105 hover:-translate-y-1"
                >
                  Start Your Journey
                </Link>
                <Link
                  to="/resources"
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-surface-700 rounded-2xl font-bold text-lg border border-surface-200 hover:bg-white hover:border-primary-300 transition-all hover:-translate-y-1 shadow-sm"
                >
                  Explore Resources
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
              Everything You Need to Thrive
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={feature.link}
                      className="block p-8 glass-card rounded-3xl group h-full"
                    >
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-surface-900">
                        {feature.title}
                      </h3>
                      <p className="text-surface-600 text-lg leading-relaxed">{feature.description}</p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Values Section */}
        <section className="bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
                Our Commitment to You
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-primary-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl p-8 lg:p-12 text-center text-white"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg lg:text-xl mb-8 opacity-90">
              Join thousands of young people taking control of their mental health
            </p>
            <Link
              to="/check-in"
              className="inline-block px-10 py-5 bg-white text-primary-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1"
            >
              Begin Your First Check-in
            </Link>
          </motion.div>
        </section>
      </div >
    </Layout >
  );
};

export default HomePage;
