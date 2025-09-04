'use client';

import React, { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";
import TableOfContents from "@/components/TableOfContents";
import DynamicContentCard from "@/components/DynamicContentCard";
import CareerPathCard from "@/components/CareerPathCard";

export default function StudentsPage() {
  const [activeSection, setActiveSection] = useState('hero');

  const sections = [
    // { id: 'hero', label: 'Hero' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'careers', label: 'Career Paths' },
    { id: 'cta', label: 'Get Started' }
  ];

  const careerPaths = [
    {
      title: 'Finance & Banking',
      description: 'Investment banking, private equity, corporate finance'
    },
    {
      title: 'Technology',
      description: 'Software engineering, product management, data science, cybersecurity'
    },
    {
      title: 'Consulting',
      description: 'Management, tech, strategy, and more'
    },
    {
      title: 'Social Media',
      description: 'Content creation, digital marketing, and more'
    },
    {
      title: 'Entrepreneurship',
      description: 'Startups, small business, social enterprise, innovation'
    },
    {
        title: 'Non-traditional',
        description: 'Want to make a career change? We can help you find people who have done it before.'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Fixed Layout Container */}
      <div className="flex min-h-screen pt-20">
        {/* Fixed Left Sidebar - Table of Contents */}
        <div className="w-80 flex-shrink-0 bg-white border-gray-200 p-6">
          <div className="sticky top-24 ml-8">
            <TableOfContents 
              sections={sections} 
              onSectionChange={setActiveSection}
            />
          </div>
        </div>

        {/* Scrollable Right Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="px-8 py-8">
            <div className="max-w-4xl mx-auto space-y-16">
              {/* Hero Section */}
              <div id="hero" className="text-center space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Your Career Journey Starts with a{' '}
                  <span className="text-mfr-primary">Conversation</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Connect with industry professionals who&apos;ve walked the path you want to take. 
                  Get real insights, honest advice, and actionable guidance to accelerate your career.
                </p>
              </div>

              {/* How It Works Section with Dynamic Card */}
              <div id="how-it-works" className="space-y-12">
                <h2 className="text-3xl font-bold text-gray-900 text-center">How It Works</h2>
                <div className="max-w-7xl mx-auto">
                  <DynamicContentCard activeSection={activeSection} />
                </div>
              </div>

              {/* Platform Benefits Section */}
              <div id="benefits" className="rounded-lg px-8 sm:p-12">
                <div className="max-w-4xl mx-auto space-y-8">
                  <h2 className="text-3xl font-bold text-gray-900 text-center">Why Choose Our Platform?</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Any Industry, Any Career Path</h3>
                      <p className="text-gray-600">
                        From investment banking to content creation, we have professionals across all industries. 
                        Whether you&apos;re exploring traditional corporate roles or emerging creative fields, 
                        we&apos;ll connect you with the right people.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Anonymous & Candid Conversations</h3>
                      <p className="text-gray-600">
                        All meetings are set up anonymously, allowing both students and professionals to speak 
                        candidly without fear of judgment. Get honest insights and real-world perspectives.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Custom Career Transitions</h3>
                      <p className="text-gray-600">
                        Looking for someone who made a career switch? We can connect you with professionals
                        who&apos;ve successfully transitioned between industries, like a banker who became a
                        software engineer.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">AI-Powered Resume Reviews</h3>
                      <p className="text-gray-600">
                        Once you decide on your career path, our AI helps tailor your resume to specific 
                        industries and roles. Get personalized suggestions to make your application stand out.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Career Examples Section */}
              <div id="careers" className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 text-center">Career Paths We Support</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {careerPaths.map((career, index) => (
                    <CareerPathCard
                      key={index}
                      title={career.title}
                      description={career.description}
                    />
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div id="cta" className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Ready to Start Your Career Journey?</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Join our waitlist to be among the first students to access our platform and connect 
                  with industry professionals.
                </p>
                <div className="max-w-md mx-auto">
                  <WaitlistForm />
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
