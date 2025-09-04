'use client';

import { useState } from 'react';
import PlatformStepCard from './PlatformStepCard';

export default function PlatformStepsContainer() {
  const [lastHoveredIndex, setLastHoveredIndex] = useState<number>(0);

  const handleCardHover = (index: number) => {
    setLastHoveredIndex(index);
  };

  const handleCardLeave = () => {
    setLastHoveredIndex(lastHoveredIndex);
  };

  const platformSteps = [
    {
      title: "Purchase Credits",
      description: "Buy credits to connect with professionals across any industry. Choose from flexible packages that fit your needs.",
      backgroundImage: "/content/credits.png",
      type: "mentor" as const,
      position: "left" as const,
      link: "/pricing"
    },
    {
      title: "Get Matched", 
      description: "We connect you with professionals who match your career goals and interests. Our smart algorithm ensures the perfect fit.",
      backgroundImage: "/content/professional.png",
      type: "student" as const,
      position: "middle" as const,
      link: "/resumes"
    },
    {
      title: "Learn & Grow",
      description: "Have candid conversations and get personalized advice to accelerate your career growth and achieve your goals.",
      backgroundImage: "/content/meeting.png",
      type: "mentor" as const,
      position: "right" as const,
      link: "/features"
    }
  ];

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
