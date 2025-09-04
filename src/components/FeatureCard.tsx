'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FeatureCardProps {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  children?: React.ReactNode;
  className?: string;
  onHover?: () => void;
  isExpanded?: boolean;
}

export default function FeatureCard({
  title,
  description,
  image,
  imageAlt,
  children,
  className = '',
  onHover,
  isExpanded = false
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const shouldExpand = isHovered || isExpanded;

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg transition-all duration-500 ease-out overflow-hidden ${
        shouldExpand ? 'w-full shadow-2xl' : 'w-11/12'
      } ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-8 h-full flex flex-col">
        <h3 className={`text-2xl font-bold text-gray-900 mb-4 transition-all duration-500 ${
          shouldExpand ? 'opacity-100' : 'opacity-0'
        }`}>{title}</h3>
        
        {image && (
          <div className={`mb-6 flex-shrink-0 transition-all duration-500 ${
            shouldExpand ? 'opacity-100' : 'opacity-0'
          }`}>
            <Image
              src={image}
              alt={imageAlt || title}
              width={400}
              height={300}
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        )}
        
        <p className={`text-gray-600 mb-6 flex-grow transition-all duration-500 ${
          shouldExpand ? 'opacity-100' : 'opacity-0'
        }`}>{description}</p>
        
        {children && (
          <div className={`mt-auto transition-all duration-500 ${
            shouldExpand ? 'opacity-100' : 'opacity-0'
          }`}>
            {children}
          </div>
        )}
        
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
