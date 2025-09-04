'use client';

import React from 'react';

interface CareerPathCardProps {
  title: string;
  description: string;
  className?: string;
}

export default function CareerPathCard({
  title,
  description,
  className = ''
}: CareerPathCardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors cursor-pointer ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
