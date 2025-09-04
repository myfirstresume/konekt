'use client';

import { useState } from 'react';
import UnifiedFeatureCard from './UnifiedFeatureCard';

export default function FeatureCardsContainer() {
  const [lastHoveredIndex, setLastHoveredIndex] = useState<number>(0);

  const handleCardHover = (index: number) => {
    setLastHoveredIndex(index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Two sides, one goal
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Find the right fit for your future
        </p>
      </div>
      
      <div className="relative h-96 rounded-2xl overflow-hidden">
        <UnifiedFeatureCard
          title="For Students"
          description="We'll connect you with industry professionals to help you get your dream job."
          backgroundImage="/content/student.png"
          type="mentor"
          onHover={() => handleCardHover(0)}
          isExpanded={lastHoveredIndex === 0}
          position="left"
          link="/students"
        />
        
        <UnifiedFeatureCard
          title="For Professionals"
          description="Talk candidly and earn extra income by helping students."
          backgroundImage="/content/professional.png"
          type="student"
          onHover={() => handleCardHover(1)}
          isExpanded={lastHoveredIndex === 1}
          position="right"
          link="/professionals"
        />
      </div>
    </div>
  );
}
