'use client';

import { useState } from 'react';
import Link from 'next/link';

interface UnifiedFeatureCardProps {
  title: string;
  description: string;
  backgroundImage: string;
  type: 'mentor' | 'student';
  onHover?: () => void;
  isExpanded?: boolean;
  position: 'left' | 'right';
  link: string;
  isMobile?: boolean;
}

export default function UnifiedFeatureCard({
  title,
  description,
  backgroundImage,
  type,
  onHover,
  isExpanded = false,
  position,
  link,
  isMobile = false
}: UnifiedFeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
      onHover?.();
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false);
    }
  };

  const shouldExpand = isHovered || isExpanded;

  // Mobile layout - full width, no positioning
  if (isMobile) {
    return (
      <Link href={link} className="block">
        <div className="relative h-48 rounded-lg overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center rounded-lg"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          
          {/* Overlay for readability */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${
            type === 'student' 
              ? 'bg-gradient-to-br from-blue-600/80 via-blue-500/80 to-gray-700/80' 
              : 'bg-black/60'
          } opacity-100`} />

          {/* Content */}
          <div className="relative z-10 p-4 h-full flex flex-col">
            <h3 className="text-lg font-bold mb-2 text-white">
              {title}
            </h3>
            
            {/* Spacer to push subtext to bottom */}
            <div className="flex-grow" />
            
            <p className="text-sm text-white/90">
              {description}
            </p>
            
            {/* Arrow Button */}
            <div className="absolute bottom-3 right-3">
              <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Desktop layout - animated cards
  const cardWidthClass = shouldExpand ? 'w-4/5 sm:w-3/5' : 'w-[calc(40%+4%)] sm:w-[calc(33.333%+4%)]';
  const cardPositionClass = position === 'left' ? 'left-2 mr-2 sm:mr-4' : 'right-2 ml-2 sm:ml-4';
  const titleOpacityClass = 'opacity-100'; // Title always visible
  const subtextOpacityClass = shouldExpand ? 'opacity-100' : 'opacity-0'; // Only subtext fades

  return (
    <Link href={link} className="block">
      <div
        className={`absolute top-0 bottom-0 w- transition-all rounded-lg duration-500 ease-out overflow-hidden p-2 cursor-pointer ${cardWidthClass} ${cardPositionClass}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center rounded-lg"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        
        {/* Overlay for readability */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${
          type === 'student' 
            ? 'bg-gradient-to-br from-blue-600/80 via-blue-500/80 to-gray-700/80' 
            : 'bg-black/60'
        } ${shouldExpand ? 'opacity-100' : 'opacity-70'}`} />

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-6 lg:p-8 h-full flex flex-col">
          <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 transition-all duration-500 ${titleOpacityClass} ${type === 'student' ? 'text-white' : 'text-white'}`}>
            {title}
          </h3>
          
          {/* Spacer to push subtext to bottom */}
          <div className="flex-grow" />
          
          <p className={`mt-auto pt-6 sm:pt-8 lg:pt-10 text-sm sm:text-base transition-all duration-500 ${subtextOpacityClass} ${type === 'student' ? 'text-white/90 pl-8 sm:pl-12 lg:pl-16' : 'text-white/90'}`}>
            {description}
          </p>
          
          {/* Arrow Button */}
          <div className={`absolute bottom-2 sm:bottom-4 ${position === 'left' ? 'right-2 sm:right-4' : 'left-2 sm:left-4'}`}>
            <button className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
              shouldExpand
                ? 'bg-white hover:bg-gray-100'
                : 'bg-white/20 hover:bg-white/30'
            }`}>
              <svg className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 transition-colors duration-500 ${
                shouldExpand ? 'text-gray-900' : 'text-white'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
