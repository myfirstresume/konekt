import { InterviewCard as InterviewCardType } from '@/types/interview';
import Image from 'next/image';

interface InterviewCardProps {
  interviewer: InterviewCardType;
}

export default function InterviewCard({ interviewer }: InterviewCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {interviewer.thumbnail ? (
            <Image
              src={interviewer.thumbnail}
              alt={`${interviewer.company} logo`}
              width={60}
              height={60}
              className="w-15 h-15 object-contain rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-15 h-15 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {interviewer.position}
            </h3>
            <p className="text-gray-600 text-sm">
              {interviewer.company}
            </p>
            <p className="text-gray-500 text-sm">
              {interviewer.tenure} year{interviewer.tenure !== 1 ? 's' : ''} of experience
            </p>
          </div>

          {/* Sign up button */}
          <a
            href={interviewer.signUpLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-mfr-primary text-white text-sm font-medium rounded-md hover:bg-mfr-primary/80 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule Interview
          </a>
        </div>
      </div>
    </div>
  );
}
