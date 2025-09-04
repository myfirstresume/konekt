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
}

export default function UnifiedFeatureCard({
  title,
  description,
  backgroundImage,
  type,
  onHover,
  isExpanded = false,
  position,
  link
}: UnifiedFeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const shouldExpand = isHovered || isExpanded;

  const cardWidthClass = shouldExpand ? 'w-3/5' : 'w-[calc(33.333%+4%)]';
  const cardPositionClass = position === 'left' ? 'left-2 mr-4' : 'right-2 ml-4';
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
        <div className="relative z-10 p-8 h-full flex flex-col">
          <h3 className={`text-2xl font-bold mb-4 transition-all duration-500 ${titleOpacityClass} ${type === 'student' ? 'text-white' : 'text-white'}`}>
            {title}
          </h3>
          
          {/* Spacer to push subtext to bottom */}
          <div className="flex-grow" />
          
          <p className={`mt-auto pt-10 transition-all duration-500 ${subtextOpacityClass} ${type === 'student' ? 'text-white/90 pl-16' : 'text-white/90'}`}>
            {description}
          </p>
          
          {/* Arrow Button */}
          <div className={`absolute bottom-4 ${position === 'left' ? 'right-4' : 'left-4'}`}>
            <button className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
              shouldExpand
                ? 'bg-white hover:bg-gray-100'
                : 'bg-white/20 hover:bg-white/30'
            }`}>
              <svg className={`w-5 h-5 transition-colors duration-500 ${
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
