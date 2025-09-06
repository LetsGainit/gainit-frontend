import React from 'react';
import { Brain, Sparkles, TrendingUp, Users, Target } from 'lucide-react';
import './AIInsight.css';

const AIInsight = () => {
  return (
    <div className="ai-insight-page">
      {/* Header */}
      <div className="ai-insight-header">
        <div className="header-content">
          <div className="header-icon">
            <Brain className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="header-text">
            <h1 className="page-title">AI Insight</h1>
            <p className="page-subtitle">
              Your personalized AI-powered project insights and recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="coming-soon-section">
        <div className="coming-soon-content">
          <div className="sparkles-icon">
            <Sparkles className="w-16 h-16 text-indigo-500" />
          </div>
          <h2 className="coming-soon-title">Coming Soon</h2>
          <p className="coming-soon-description">
            We're working on bringing you powerful AI-driven insights to help you make better decisions and optimize your project performance.
          </p>
        </div>
      </div>

      {/* Feature Preview Cards */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="feature-title">Performance Analytics</h3>
          <p className="feature-description">
            Get AI-powered insights into your project performance, productivity trends, and areas for improvement.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="feature-title">Team Insights</h3>
          <p className="feature-description">
            Understand team dynamics, collaboration patterns, and identify opportunities to enhance team efficiency.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="feature-title">Smart Recommendations</h3>
          <p className="feature-description">
            Receive personalized recommendations for project optimization, resource allocation, and strategic planning.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <div className="cta-content">
          <h3 className="cta-title">Stay Updated</h3>
          <p className="cta-description">
            We'll notify you when AI Insight features are ready. In the meantime, continue working on your projects and building amazing things!
          </p>
          <button className="cta-button">
            <Brain className="w-4 h-4 mr-2" />
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsight;
