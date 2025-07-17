import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import AuthModal from '../components/auth/AuthModal';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const { 
  FiCode, FiTrendingUp, FiTarget, FiZap, FiBookOpen, FiAward, 
  FiUsers, FiCalendar, FiBarChart3, FiStar, FiArrowRight,
  FiCheck, FiPlay, FiGithub, FiLinkedin, FiMail
} = FiIcons;

const Landing = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const { user } = useAuth();

  const features = [
    {
      icon: FiCode,
      title: 'Smart Problem Management',
      description: 'Organize and track your DSA problems with advanced filtering, tagging, and progress monitoring.',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: FiTrendingUp,
      title: 'Progress Analytics',
      description: 'Visualize your learning journey with detailed analytics, streak tracking, and performance insights.',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: FiTarget,
      title: 'Interview Preparation',
      description: 'Mark problems as interview-ready, practice by company, and track confidence levels.',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: FiZap,
      title: 'Real-time Sync',
      description: 'All your progress syncs in real-time across devices with secure cloud storage.',
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      icon: FiBookOpen,
      title: 'Code Snippets',
      description: 'Save and organize your solutions with syntax highlighting for quick revision.',
      color: 'text-red-600 dark:text-red-400'
    },
    {
      icon: FiAward,
      title: 'Achievement System',
      description: 'Stay motivated with badges, streaks, and XP rewards for consistent practice.',
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Problems Tracked', icon: FiCode },
    { number: '50+', label: 'Companies Covered', icon: FiUsers },
    { number: '24/7', label: 'Real-time Sync', icon: FiCalendar },
    { number: '100%', label: 'Interview Ready', icon: FiStar }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at Google',
      content: 'DSA Tracker helped me organize my interview prep perfectly. The confidence tracking feature was a game-changer!',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Senior Developer at Microsoft',
      content: 'The revision hub made it so easy to review problems before interviews. Landed my dream job thanks to this tool!',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Emily Johnson',
      role: 'Tech Lead at Amazon',
      content: 'Best DSA tracking tool I\'ve used. The analytics and progress tracking keep me motivated every day.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  const handleGetStarted = (mode = 'signup') => {
    if (user) {
      // User is already logged in, redirect to dashboard
      window.location.href = '/';
    } else {
      setAuthMode(mode);
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SafeIcon icon={FiCode} className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                DSA Tracker
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => handleGetStarted('signin')}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleGetStarted('signup')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Master DSA with
                <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  {' '}Smart Tracking
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                Your personal DSA revision hub for interview success. Track progress, organize problems, 
                and ace your coding interviews with confidence.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <button
                onClick={() => handleGetStarted('signup')}
                className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center space-x-2 text-lg"
              >
                <span>Start Your Journey</span>
                <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleGetStarted('signin')}
                className="px-8 py-4 border-2 border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-semibold flex items-center space-x-2 text-lg"
              >
                <SafeIcon icon={FiPlay} className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Hero Image/Demo */}
            <motion.div
              className="relative max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">DSA Tracker Dashboard</div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <SafeIcon icon={FiTarget} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-blue-700 dark:text-blue-300">Daily Goal</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3/5</div>
                      <div className="text-sm text-blue-500 dark:text-blue-400">Problems solved</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <SafeIcon icon={FiZap} className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-green-700 dark:text-green-300">Streak</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">12</div>
                      <div className="text-sm text-green-500 dark:text-green-400">Days active</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <SafeIcon icon={FiAward} className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="font-semibold text-purple-700 dark:text-purple-300">Level</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">7</div>
                      <div className="text-sm text-purple-500 dark:text-purple-400">Expert level</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                    <SafeIcon icon={stat.icon} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need for Interview Success
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Comprehensive tools and features designed to accelerate your DSA learning and interview preparation.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <SafeIcon icon={feature.icon} className={`w-6 h-6 ${feature.color}`} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Trusted by Developers Worldwide
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Join thousands of developers who've landed their dream jobs
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of developers who've transformed their interview preparation with DSA Tracker.
            </p>
            <button
              onClick={() => handleGetStarted('signup')}
              className="px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg flex items-center space-x-2 mx-auto"
            >
              <span>Get Started Free</span>
              <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiCode} className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DSA Tracker</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Your personal DSA revision hub for interview success. Track progress, organize problems, 
                and ace your coding interviews with confidence.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <SafeIcon icon={FiGithub} className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <SafeIcon icon={FiLinkedin} className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <SafeIcon icon={FiMail} className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Problem Tracking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Progress Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Code Snippets</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Interview Prep</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DSA Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};

export default Landing;