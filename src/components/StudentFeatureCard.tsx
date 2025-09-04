'use client';

import React from 'react';
import Image from 'next/image';

interface StudentFeatureCardProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  features: string[];
  className?: string;
}

export default function StudentFeatureCard({
  title,
  description,
  image,
  imageAlt,
  features,
  className = ''
}: StudentFeatureCardProps) {
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <div className="p-8 h-full flex flex-col">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        
        <div className="mb-6 flex-shrink-0">
          <Image
            src={image}
            alt={imageAlt}
            width={400}
            height={300}
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>
        
        <p className="text-gray-600 mb-6 flex-grow">{description}</p>
        
        <div className="mt-auto space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-mfr-primary rounded-full"></div>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-4 right-4">
          <button className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
