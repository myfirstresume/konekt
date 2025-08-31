'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadBox from "@/components/UploadBox";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const { userId, isLoading } = useAuth();
  const router = useRouter();
  const LOGO_SCALING = 2;

  const handleUploadSuccess = (fileUrl: string, filename: string) => {
    // Handle successful upload - could redirect to AI review page
    console.log('Upload successful:', { filename });
    // Here you would typically redirect to the AI review page
    // or trigger the AI processing
  };

  const handleUploadError = (error: string) => {
    // Handle upload error - could show additional error handling
    console.error('Upload error:', error);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          {!userId && !isLoading ? (
            // Landing page for non-authenticated users
            <div className="space-y-16">
              {/* Hero Section */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Column - Value Proposition */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                      Resumes and mock interviews{' '}
                      <span className="text-mfr-primary">to get you hired</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                      Only 2% of resumes win. Make sure yours is one of them.
                    </p>
                  </div>

                  {/* Call to Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => router.push('/login')}
                      className="bg-mfr-primary hover:bg-mfr-primary/80 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                    >
                      Upload my resume
                    </button>
                    <button 
                      onClick={() => router.push('/login')}
                      className="border-2 border-mfr-primary text-mfr-primary hover:bg-mfr-primary/10 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                      Set up a mock interview
                    </button>
                  </div>
                </div>

                {/* Right Column - Resume Preview */}
                <div className="relative">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-8 max-w-lg mx-auto">
                    {/* Resume Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Resume Review</h3>
                        <p className="text-sm text-gray-500 mt-1">Example.docx</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">DOCX</span>
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Resume Content */}
                    <div className="space-y-6">
                      {/* Employment Section */}
                      <div>
                        <h4 className="font-bold text-gray-900 uppercase tracking-wide text-xs mb-4">Employment Experience</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-semibold text-gray-900">Big Consulting Company</h5>
                              <span className="text-xs text-gray-500">Fall 2027</span>
                            </div>
                            <p className="text-gray-600 text-sm">Incoming Business Analyst • New York, NY</p>
                          </div>
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-semibold text-gray-900">Big Consulting Company</h5>
                              <span className="text-xs text-gray-500">Summer 2026</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">Summer Business Analyst • New York, NY</p>
                            <ul className="space-y-2">
                              <li className="text-sm text-gray-700 flex items-start">
                                <span className="text-gray-400 mr-3 mt-0.5">•</span>
                                <span>Coached clients through agile transformation, <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded">lead to greater efficiency in project delivery, cost savings, and a greater sense of ownership across business units</span></span>
                              </li>
                              <li className="text-sm text-gray-700 flex items-start">
                                <span className="text-gray-400 mr-3 mt-0.5">•</span>
                                <span>Worked with <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded">higher-ups</span></span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Extracurricular Section */}
                      <div>
                        <h4 className="font-bold text-gray-900 uppercase tracking-wide text-xs mb-4">Extra-Curricular Activities</h4>
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-semibold text-gray-900">Harvard Rowing Team</h5>
                            <span className="text-xs text-gray-500">Spring 2023 - Present</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">Captain • Cambridge, MA</p>
                          <p className="text-sm text-gray-700">Led the team to 2x mens D1 championships</p>
                        </div>
                      </div>
                    </div>

                    {/* Apply Changes Button */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <button className="w-full bg-mfr-primary hover:bg-mfr-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-sm">
                        ✓ Apply Changes
                      </button>
                    </div>
                  </div>

                  {/* AI Suggestions Overlay */}
                  <div className="absolute -right-8 top-20 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm">Review Suggestions</h4>
                      <span className="text-xs text-gray-500">8 pending</span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-700 leading-relaxed">Quantify the impact</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-700 leading-relaxed">Be specific about who you worked with. VPs? C-suite executives?</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">Chat with AI</span>
                        <span className="text-xs text-gray-500">6/100</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">Ask questions about your resume suggestions</p>
                      <div className="flex space-x-2">
                        <input 
                          type="text" 
                          placeholder="Ask a question..." 
                          className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded"
                        />
                        <button className="bg-mfr-primary text-white p-1 rounded">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrolling Logos Section */}
              <div className="text-center">
                <p className="text-lg text-gray-600 mb-4">We&apos;ve helped candidates get hired at:</p>
                <div className="relative overflow-hidden max-w-4xl mx-auto">
                  <div className="flex animate-scroll space-x-8">
                    <div className="flex space-x-16 min-w-max">
                      <Image src="/logos/google.png" alt="Google" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-8 w-auto grayscale opacity-50" />
                      {/* <Image src="/logos/bain.jpg" alt="Bain" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-8 w-auto grayscale opacity-50" /> */}
                      <Image src="/logos/ey.png" alt="EY" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/mck.png" alt="McKinsey" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/mstanley.png" alt="Morgan Stanley" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/otpp.png" alt="OTPP" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-8 w-auto grayscale opacity-50" />
                    </div>
                    {/* Duplicate logos for seamless scrolling */}
                    <div className="flex space-x-16 min-w-max">
                      <Image src="/logos/google.png" alt="Google" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-8 w-auto grayscale opacity-50" />
                      {/* <Image src="/logos/bain.jpg" alt="Bain" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-8 w-auto grayscale opacity-50" /> */}
                      <Image src="/logos/ey.png" alt="EY" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/mck.png" alt="McKinsey" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/mstanley.png" alt="Morgan Stanley" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/otpp.png" alt="OTPP" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-8 w-auto grayscale opacity-50" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="text-center space-y-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  Professional Resume Builder + Mock Interview Service
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Get a professionally crafted resume that passes ATS systems and prepare for your interviews 
                  with our AI-powered mock interview service.
                </p>
                
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">ATS-Optimized Resumes</h3>
                    <p className="text-gray-600">Our resumes are designed to pass Applicant Tracking Systems and get you noticed by recruiters.</p>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">AI Mock Interviews</h3>
                    <p className="text-gray-600">Practice with our AI interviewer to build confidence and improve your interview skills.</p>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Instant Results</h3>
                    <p className="text-gray-600">Get your professionally crafted resume in minutes, not days. Start applying immediately.</p>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            // Simple upload interface for authenticated users
            <div className={`flex flex-col items-center justify-center py-32`}>
              <UploadBox 
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
              
              {/* Additional content to push footer down - only show when signed in */}
              <div className="py-8">
                <div className="text-center text-gray-500 text-sm">
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
