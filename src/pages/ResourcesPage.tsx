import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { BookOpen, Video, FileText, Headphones, Search, Filter } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide' | 'audio';
  category: string;
  duration?: string;
}

const ResourcesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Understanding Anxiety in Young Adults',
      description: 'Learn about common anxiety triggers and coping mechanisms tailored for your age group.',
      type: 'article',
      category: 'anxiety',
      duration: '5 min read',
    },
    {
      id: '2',
      title: 'Guided Meditation for Stress Relief',
      description: 'A 10-minute guided meditation to help reduce stress and promote relaxation.',
      type: 'audio',
      category: 'stress',
      duration: '10 min',
    },
    {
      id: '3',
      title: 'Building Healthy Relationships',
      description: 'Tips and strategies for maintaining positive connections with friends and family.',
      type: 'video',
      category: 'relationships',
      duration: '15 min',
    },
    {
      id: '4',
      title: 'Self-Care Guide for Students',
      description: 'A comprehensive guide to balancing academic pressure with mental well-being.',
      type: 'guide',
      category: 'self-care',
      duration: '8 min read',
    },
    {
      id: '5',
      title: 'Managing Depression: You\'re Not Alone',
      description: 'Understanding depression and finding support in your community.',
      type: 'article',
      category: 'depression',
      duration: '7 min read',
    },
    {
      id: '6',
      title: 'Breathing Exercises for Panic Attacks',
      description: 'Quick and effective breathing techniques to manage panic attacks.',
      type: 'video',
      category: 'anxiety',
      duration: '5 min',
    },
  ];

  const categories = [
    { value: 'all', label: 'All Resources' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'stress', label: 'Stress' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'self-care', label: 'Self-Care' },
  ];

  const getIcon = (type: Resource['type']) => {
    switch (type) {
      case 'article':
        return FileText;
      case 'video':
        return Video;
      case 'guide':
        return BookOpen;
      case 'audio':
        return Headphones;
    }
  };

  const getTypeColor = (type: Resource['type']) => {
    switch (type) {
      case 'article':
        return 'from-blue-500 to-cyan-500';
      case 'video':
        return 'from-red-500 to-pink-500';
      case 'guide':
        return 'from-green-500 to-teal-500';
      case 'audio':
        return 'from-purple-500 to-indigo-500';
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Mental Health Resources
            </h1>
            <p className="text-gray-600">
              Explore curated, culturally relevant content to support your mental well-being
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.value
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => {
              const Icon = getIcon(resource.type);
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group cursor-pointer"
                >
                  <div className={`h-2 bg-gradient-to-r ${getTypeColor(resource.type)}`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(resource.type)} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm text-gray-500">{resource.duration}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {resource.type}
                      </span>
                      <button className="text-primary-600 font-medium text-sm hover:text-primary-700">
                        View →
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No resources found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResourcesPage;
