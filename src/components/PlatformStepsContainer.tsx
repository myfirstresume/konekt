'use client';

import { useState } from 'react';
import PlatformStepCard from './PlatformStepCard';
import { PlatformStep } from '@/types/platform';

interface PlatformStepsContainerProps {
  platformSteps: PlatformStep[];
}

export default function PlatformStepsContainer({ platformSteps }: PlatformStepsContainerProps) {
  const [lastHoveredIndex, setLastHoveredIndex] = useState<number>(0);

  const handleCardHover = (index: number) => {
    setLastHoveredIndex(index);
  };

  const handleCardLeave = () => {
    setLastHoveredIndex(lastHoveredIndex);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      {/* Mobile Layout - Stacked Cards */}
      <div className="block lg:hidden space-y-4">
        {platformSteps.map((step, index) => (
          <div
            key={index}
            className="relative h-48 rounded-2xl overflow-hidden"
            style={{ backgroundImage: `url(${step.backgroundImage})` }}
          >
            {/* Overlay for readability */}
            <div className={`absolute inset-0 ${
              step.type === 'student' 
                ? 'bg-gradient-to-br from-blue-600/60 via-blue-500/60 to-gray-700/80' 
                : 'bg-black/60'
            }`} />

            {/* Content */}
            <div className="relative z-10 p-6 h-full flex flex-col">
              <h3 className="text-lg font-bold mb-3 text-white">
                {step.title}
              </h3>
              
              {/* Spacer to push description to bottom */}
              <div className="flex-grow" />
              
              <p className="mt-auto pt-4 text-sm text-white/90">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Layout - Animated Cards */}
      <div className="hidden lg:block relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden">
        {platformSteps.map((step, index) => (
          <PlatformStepCard
            key={index}
            title={step.title}
            description={step.description}
            backgroundImage={step.backgroundImage}
            type={step.type}
            onHover={() => handleCardHover(index)}
            onLeave={handleCardLeave}
            isExpanded={lastHoveredIndex === index}
            position={step.position}
            // link={step.link}
            lastHoveredIndex={lastHoveredIndex}
          />
        ))}
      </div>
    </div>
  );
}
