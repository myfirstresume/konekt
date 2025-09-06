'use client';

import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";
import TableOfContents from "@/components/TableOfContents";
import DynamicContentCard from "@/components/DynamicContentCard";
import CareerPathCard from "@/components/CareerPathCard";

export default function StudentsPage() {
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
    { id: 'careers', label: 'Career Paths' },
    { id: 'conversation-topics', label: 'Sample Conversation Topics' },
    { id: 'cta', label: 'Get Started' }
  ];

  const platformSteps = [
    {
      title: "Purchase Credits",
      description: "Buy credits to connect with professionals across any industry. Choose from flexible packages that fit your needs.",
      backgroundImage: "/content/credits.png",
      type: "mentor" as const,
      position: "left" as const,
      link: "/pricing"
    },
    {
      title: "Get Matched", 
      description: "We connect you with professionals who match your career goals and interests. Our smart algorithm ensures the perfect fit.",
      backgroundImage: "/content/professional.png",
      type: "student" as const,
      position: "middle" as const,
      link: "/resumes"
    },
    {
      title: "Learn & Grow",
      description: "Have candid conversations and get personalized advice to accelerate your career growth and achieve your goals.",
      backgroundImage: "/content/meeting.png",
      type: "mentor" as const,
      position: "right" as const,
      link: "/features"
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
                Your Career Journey Starts with a{' '}
                <span className="text-mfr-primary">Conversation</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Connect with industry professionals who&apos;ve walked the path you want to take. 
                Get real insights, honest advice, and actionable guidance to accelerate your career.
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
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">Why Choose Our Platform?</h2>
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Any Industry, Any Career Path</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      From investment banking to content creation, we have professionals across all industries. 
                      Whether you&apos;re exploring traditional corporate roles or emerging creative fields, 
                      we&apos;ll connect you with the right people.
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Anonymous & Candid Conversations</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      All meetings are set up anonymously, allowing both students and professionals to speak 
                      candidly without fear of judgment. Get honest insights and real-world perspectives.
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Custom Career Transitions</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Looking for someone who made a career switch? We can connect you with professionals
                      who&apos;ve successfully transitioned between industries, like a banker who became a
                      software engineer.
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">AI-Powered Resume Reviews</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Once you decide on your career path, our AI helps tailor your resume to specific 
                      industries and roles. Get personalized suggestions to make your application stand out.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Examples Section */}
            <div id="careers" className="space-y-6 sm:space-y-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">Career Paths We Support</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {careerPaths.map((career, index) => (
                  <CareerPathCard
                    key={index}
                    title={career.title}
                    description={career.description}
                  />
                ))}
              </div>
            </div>

            {/* Sample Conversation Topics Section */}
            <div id="conversation-topics" className="space-y-6 sm:space-y-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">Sample Conversation Topics</h2>
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Company Culture & Stability</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      &ldquo;How bad is turnover? Are people quitting left and right? Any whispers of layoffs?&rdquo;
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Work-Life Balance</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      &ldquo;What hours are you really working? Weekends too?&rdquo;
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Compensation Reality</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      &ldquo;What&apos;s the bonus like in a good year vs. a bad year?&rdquo;
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Day-to-Day Work</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      &ldquo;What do you actually do every single day? Can you describe the qualitative/quantitative work you do and how you learned to do it?&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div id="cta" className="text-center space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Ready to Start Your Career Journey?</h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Join our waitlist to be among the first students to access our platform and connect 
                with industry professionals.
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
                  <DynamicContentCard activeSection={activeSection} platformSteps={platformSteps} />
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

              {/* Sample Conversation Topics Section */}
              <div id="conversation-topics" className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 text-center">Sample Conversation Topics</h2>
                <div className="max-w-4xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Company Culture & Stability</h3>
                      <p className="text-gray-600">
                        &ldquo;How bad is turnover? Are people quitting left and right? Any whispers of layoffs?&rdquo;
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Work-Life Balance</h3>
                      <p className="text-gray-600">
                        &ldquo;What hours are you really working? Weekends too?&rdquo;
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Compensation Reality</h3>
                      <p className="text-gray-600">
                        &ldquo;What&apos;s the bonus like in a good year vs. a bad year?&rdquo;
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Day-to-Day Work</h3>
                      <p className="text-gray-600">
                        &ldquo;What do you actually do every single day? What are the tasks like? Can you describe all of the qualitative/quantitative work you do and how you learned to do it?&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div id="cta" className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Ready to Start Your Career Journey?</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Join our waitlist to be among the first students to access our platform and connect 
                  with industry professionals.
                </p>
                <div id="waitlist" className="max-w-md mx-auto">
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
