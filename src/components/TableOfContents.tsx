'use client';

import React, { useState, useEffect } from 'react';

interface TableOfContentsProps {
  sections: Array<{
    id: string;
    label: string;
  }>;
  className?: string;
  onSectionChange?: (sectionId: string) => void;
}

export default function TableOfContents({ 
  sections, 
  className = '', 
  onSectionChange 
}: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          const newSection = sections[i].id;
          if (newSection !== activeSection) {
            setActiveSection(newSection);
            onSectionChange?.(newSection);
          }
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, activeSection, onSectionChange]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`bg-white rounded-lg p-4 text-black ${className}`}>
      <div className="space-y-0">
        {sections.map((section, index) => (
          <React.Fragment key={section.id}>
            <div 
              className={`flex items-center justify-between py-2 cursor-pointer transition-colors ${
                activeSection === section.id ? 'text-black' : 'text-gray-600'
              }`}
              onClick={() => scrollToSection(section.id)}
            >
              <span className="font-medium">{section.label}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${
                activeSection === section.id ? 'bg-black' : 'bg-gray-400'
              }`}></div>
            </div>
            {index < sections.length - 1 && (
              <div className="border-t border-gray-300"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
