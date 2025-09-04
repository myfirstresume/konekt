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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="relative h-96 rounded-2xl overflow-hidden">
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
