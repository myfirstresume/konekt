'use client';

import React from 'react';
import PlatformStepsContainer from './PlatformStepsContainer';

interface DynamicContentCardProps {
  activeSection: string;
  className?: string;
}

export default function DynamicContentCard({ activeSection, className = '' }: DynamicContentCardProps) {
  return (
    <div className={`${className}`}>
      <PlatformStepsContainer />
    </div>
  );
}
