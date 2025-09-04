'use client';

import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";
import TableOfContents from "@/components/TableOfContents";
import DynamicContentCard from "@/components/DynamicContentCard";
import CareerPathCard from "@/components/CareerPathCard";

export default function ProfessionalsPage() {
  const [activeSection, setActiveSection] = useState('hero');

  // Handle navigation to waitlist section
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we should scroll to waitlist (from sessionStorage flag)
      const shouldScrollToWaitlist = sessionStorage.getItem('scrollToWaitlist');
      if (shouldScrollToWaitlist) {
        sessionStorage.removeItem('scrollToWaitlist');
        const element = document.getElementById('waitlist');
        if (element) {
          // Small delay to ensure the page is fully rendered
          setTimeout(() => {
            // Use a more reliable scrolling method
            const elementRect = element.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const middle = absoluteElementTop - (window.innerHeight / 2);
            
            window.scrollTo({
              top: middle,
              behavior: 'smooth'
            });
            
            // Focus the email input after scrolling
            const emailInput = document.getElementById('waitlist-email');
            if (emailInput) {
              setTimeout(() => {
                emailInput.focus();
              }, 800);
            }
          }, 100);
        }
      }
      // Also handle direct hash navigation
      else if (window.location.hash === '#waitlist') {
        const element = document.getElementById('waitlist');
        if (element) {
          // Small delay to ensure the page is fully rendered
          setTimeout(() => {
            // Use a more reliable scrolling method
            const elementRect = element.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const middle = absoluteElementTop - (window.innerHeight / 2);
            
            window.scrollTo({
              top: middle,
              behavior: 'smooth'
            });
            
            // Focus the email input after scrolling
            const emailInput = document.getElementById('waitlist-email');
            if (emailInput) {
              setTimeout(() => {
                emailInput.focus();
              }, 800);
            }
          }, 100);
        }
      }
    }
  }, []);

  const sections = [
    // { id: 'hero', label: 'Hero' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'cta', label: 'Get Started' }
  ];

  const platformSteps = [
    {
      title: "Set Up Your Profile",
      description: "Create your professional profile, set your expertise areas, and define your mentoring preferences and availability.",
      backgroundImage: "/content/profile.png",
      type: "mentor" as const,
      position: "left" as const,
      link: "/dashboard"
    },
    {
      title: "Get Matched", 
      description: "We connect you with students who match your expertise and career background.",
      backgroundImage: "/content/match.png",
      type: "student" as const,
      position: "middle" as const,
      link: "/resumes"
    },
    {
      title: "Mentor & Earn",
      description: "Conduct mentoring sessions and share your insights. You get compensated 70% of the revenue from each session.",
      backgroundImage: "/content/credits.png",
      type: "mentor" as const,
      position: "right" as const,
      link: "/pricing"
    }
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
      
      {/* Mobile Layout */}
      <div className="block lg:hidden min-h-screen pt-20">
        <main className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">
            {/* Hero Section */}
            <div id="hero" className="text-center space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Share Your Expertise and{' '}
                <span className="text-mfr-primary">Make an Impact</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Connect with ambitious students who want to learn from your experience. 
                Share insights, mentor the next generation, and earn extra income.
              </p>
            </div>

            {/* How It Works Section with Dynamic Card */}
            <div id="how-it-works" className="space-y-8 sm:space-y-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">How It Works</h2>
              <div className="max-w-7xl mx-auto">
                <DynamicContentCard activeSection={activeSection} platformSteps={platformSteps} />
              </div>
            </div>

            {/* Platform Benefits Section */}
            <div id="benefits" className="rounded-lg px-4 sm:px-8">
              <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">Why Join Our Platform?</h2>
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Share Your Knowledge</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Help students navigate their career paths with your real-world experience. 
                      Share insights that textbooks and courses can&apos;t provide.
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Flexible & Anonymous</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      All meetings are set up anonymously, allowing you to speak candidly without 
                      professional concerns at times that are convenient for you.
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Earn While Helping</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Get compensated for your time and expertise. We pay out 70% of the revenue from each session.
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Build Your Network</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Joining our community gives you access to a network of like-minded professionals.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div id="cta" className="text-center space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Ready to Make a Difference?</h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Join our waitlist to be among the first to start mentoring.
              </p>
              <div id="waitlist" className="max-w-md mx-auto">
                <WaitlistForm />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen pt-20">
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
                  Share Your Expertise and{' '}
                  <span className="text-mfr-primary">Make an Impact</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Connect with ambitious students who want to learn from your experience. 
                  Share insights, mentor the next generation, and earn extra income.
                </p>
              </div>

              {/* How It Works Section with Dynamic Card */}
              <div id="how-it-works" className="space-y-12">
                <h2 className="text-3xl font-bold text-gray-900 text-center">How It Works</h2>
                <div className="max-w-7xl mx-auto">
                  <DynamicContentCard activeSection={activeSection} platformSteps={platformSteps} />
                </div>
              </div>

              {/* Platform Benefits Section */}
              <div id="benefits" className="rounded-lg px-8 sm:p-12">
                <div className="max-w-4xl mx-auto space-y-8">
                  <h2 className="text-3xl font-bold text-gray-900 text-center">Why Join Our Platform?</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Share Your Knowledge</h3>
                      <p className="text-gray-600">
                        Help students navigate their career paths with your real-world experience. 
                        Share insights that textbooks and courses can&apos;t provide.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Flexible & Anonymous</h3>
                      <p className="text-gray-600">
                        All meetings are set up anonymously, allowing you to speak candidly without 
                        professional concerns at times that are convenient for you.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Earn While Helping</h3>
                      <p className="text-gray-600">
                        Get compensated for your time and expertise. Set your own rates and 
                        choose which students to mentor based on your interests.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Build Your Network</h3>
                      <p className="text-gray-600">
                        Joining our community gives you access to a network of like-minded professionals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div id="cta" className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Ready to Make a Difference?</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Join our waitlist to be among the first to start mentoring.
                </p>
                <div id="waitlist-email" className="max-w-md mx-auto">
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