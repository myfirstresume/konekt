'use client';

import { useState } from 'react';
import UnifiedFeatureCard from './UnifiedFeatureCard';

export default function FeatureCardsContainer() {
  const [lastHoveredIndex, setLastHoveredIndex] = useState<number>(0);

  const handleCardHover = (index: number) => {
    setLastHoveredIndex(index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="text-center mb-8 sm:mb-12 lg:mb-16">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Two sides, one goal
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
          Find the right fit for your future
        </p>
      </div>
      
      {/* Mobile Layout - Stacked Cards */}
      <div className="block lg:hidden space-y-4">
        <UnifiedFeatureCard
          title="For Students"
          description="We'll connect you with industry professionals to help you get your dream job."
          backgroundImage="/content/student.png"
          type="mentor"
          onHover={() => handleCardHover(0)}
          isExpanded={false}
          position="left"
          link="/students"
          isMobile={true}
        />
        
        <UnifiedFeatureCard
          title="For Professionals"
          description="Talk candidly and earn extra income by helping students."
          backgroundImage="/content/professional.png"
          type="student"
          onHover={() => handleCardHover(1)}
          isExpanded={false}
          position="right"
          link="/professionals"
          isMobile={true}
        />
      </div>

      {/* Desktop Layout - Animated Cards */}
      <div className="hidden lg:block relative h-96 rounded-2xl overflow-hidden">
        <UnifiedFeatureCard
          title="For Students"
          description="We'll connect you with industry professionals to help you get your dream job."
          backgroundImage="/content/student.png"
          type="mentor"
          onHover={() => handleCardHover(0)}
          isExpanded={lastHoveredIndex === 0}
          position="left"
          link="/students"
          isMobile={false}
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
          isMobile={false}
        />
      </div>
    </div>
  );
}
