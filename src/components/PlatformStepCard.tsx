'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PlatformStepCardProps {
  title: string;
  description: string;
  backgroundImage: string;
  type: 'mentor' | 'student';
  onHover?: () => void;
  onLeave?: () => void;
  isExpanded?: boolean;
  position: 'left' | 'right' | 'middle';
  link?: string;
  lastHoveredIndex?: number;
}

export default function PlatformStepCard({
  title,
  description,
  backgroundImage,
  type,
  onHover,
  onLeave,
  isExpanded = false,
  position,
  link,
  lastHoveredIndex = -1
}: PlatformStepCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onLeave?.();
  };

  const shouldExpand = isHovered || isExpanded;

  const cardWidthClass = shouldExpand ? 'w-3/5' : 'w-[calc(10%+6%)]';
  
  // Dynamic positioning based on which card is expanded
  const getCardPositionClass = () => {
    if (shouldExpand) {
      // When this card is expanded, position others based on this card's position
      if (position === 'left') {
        // Left card expanded - cluster others to the right
        return 'left-2 mr-4';
      } else if (position === 'right') {
        // Right card expanded - cluster others to the left
        return 'right-2 ml-4';
      } else {
        // Middle card expanded - keep normal positioning
        return 'left-1/2 -translate-x-1/2';
      }
    } else {
      // When not expanded, check if another card is expanded to determine clustering
      // We need to check if any other card is expanded, not just this one
      if (lastHoveredIndex !== -1) {
        // Another card is expanded, position based on that card's position
        if (lastHoveredIndex === 0) {
          // Left card is expanded, shift middle card to the right
          if (position === 'middle') {
            return 'left-[64%] mr-2'; // Middle card shifts right but stays visible
          } else if (position === 'right') {
            return 'right-2 ml-2'; // Right card clusters to the right
          }
        } else if (lastHoveredIndex === 2) {
          // Right card is expanded, shift middle card to the left
          if (position === 'middle') {
            return 'left-[20%] mr-2'; // Middle card shifts left but stays visible
          } else if (position === 'left') {
            return 'left-2 mr-2'; // Left card clusters to the left
          }
        }
      }
      // Default positioning
      return position === 'left' ? 'left-2 mr-4' : position === 'right' ? 'right-2 ml-4' : 'left-1/2 -translate-x-1/2';
    }
  };

  const cardPositionClass = getCardPositionClass();
  const titleOpacityClass = 'opacity-100'; // Title always visible
  const subtextOpacityClass = shouldExpand ? 'opacity-100' : 'opacity-0'; // Only subtext fades

  return (
    <Link href={link || ''} className="block">
      <div
        className={`absolute top-0 bottom-0 transition-all rounded-lg duration-500 ease-out overflow-hidden p-2 cursor-pointer ${cardWidthClass} ${cardPositionClass}`}
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
        <div className="relative z-10 p-6 h-full flex flex-col">
          <h3 className={`text-lg font-bold mb-3 transition-all duration-500 ${titleOpacityClass} ${type === 'student' ? 'text-white' : 'text-white'}`}>
            {title}
          </h3>
          
          {/* Spacer to push subtext to bottom */}
          <div className="flex-grow" />
          
          <p className={`mt-auto pt-8 text-sm transition-all duration-500 ${subtextOpacityClass} ${type === 'student' ? 'text-white/90 pl-12' : 'text-white/90'}`}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
