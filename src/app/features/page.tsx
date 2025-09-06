'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const features = [
  {
    title: "In-line Comments",
    subtitle: "Make your resume stand out",
    description: "Get detailed, actionable feedback directly on your resume with specific suggestions for improvement. Our AI highlights exactly what needs to change and why.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    benefits: [

    ]
  },
  {
    title: "AI-Powered Resume Rewrite",
    subtitle: "Transform your resume with AI",
    description: "Let our advanced AI rewrite your resume using industry best practices.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    benefits: [

    ]
  },
  {
    title: "Speech-to-Text Experience",
    subtitle: "Explain your experience naturally",
    description: "Simply talk about your experiences and let our AI convert your natural speech into compelling resume content.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    benefits: [
      
    ]
  },
  {
    title: "Live Mock Interviews and Feedback",
    subtitle: "Learn from professionals at top companies live",
    description: "Join live, anonymous mock interviews with professionals at top companies. Get feedback on your resume and interview skills.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    benefits: [

    ]
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">

        {/* Features Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                From detailed feedback to AI-powered rewrites, we&apos;ve got you covered at every step of your resume journey.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-mfr-primary/10 rounded-xl flex items-center justify-center text-mfr-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-mfr-primary font-semibold mb-3">
                      {feature.subtitle}
                    </p>
                    <p className="text-gray-600 mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        {/* <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Trusted by Professionals
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See what our users are saying about their career transformations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-mfr-primary/10 rounded-full flex items-center justify-center text-mfr-primary font-bold text-3xl leading-none flex-shrink-0">
                      &ldquo;
                    </div>
                    <div className="ml-4">
                      <p className="text-lg text-gray-600">{testimonial.role} at {testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-lg">{testimonial.quote}</p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of professionals who have already accelerated their careers with Konekt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-mfr-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-mfr-primary/80 transition-colors">
                Get Started Today
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
