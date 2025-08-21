'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InterviewCard from '@/components/InterviewCard';
import AuthGuard from '@/components/AuthGuard';
import { interviewers } from '@/data/interviewers';

export default function Mock() {
  return (
    <AuthGuard requireSubscription={true}>
      <div className="min-h-screen bg-white">
        <Header />
        <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Schedule a Mock Interview</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-76">
              {interviewers.map((interviewer) => (
                <InterviewCard key={interviewer.id} interviewer={interviewer} />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
