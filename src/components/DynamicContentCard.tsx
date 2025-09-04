'use client';

import React from 'react';
import PlatformStepsContainer from './PlatformStepsContainer';
import { PlatformStep } from '@/types/platform';

interface DynamicContentCardProps {
  activeSection: string;
  className?: string;
  platformSteps?: PlatformStep[];
}

export default function DynamicContentCard({ activeSection, className = '', platformSteps }: DynamicContentCardProps) {
  return (
    <div className={`${className}`}>
      <PlatformStepsContainer platformSteps={platformSteps || []} />
    </div>
  );
}
