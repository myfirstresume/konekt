'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface TableOfContentsProps {
  sections: Array<{
    id: string;
    label: string;
  }>;
  className?: string;
  onSectionChange?: (sectionId: string) => void;
  scrollContainer?: HTMLElement | null;
}

export default function TableOfContents({ 
  sections, 
  className = '', 
  onSectionChange,
  scrollContainer
}: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

  useEffect(() => {
    const handleScroll = () => {
      // Find which section is currently in view
      let currentSection = sections[0]?.id || '';
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i].id);
        if (element) {
          const rect = element.getBoundingClientRect();
          
          if (scrollContainer) {
            // For container scrolling, check if element is visible in container
            const containerRect = scrollContainer.getBoundingClientRect();
            const relativeTop = rect.top - containerRect.top;
            
            if (relativeTop <= 100 && rect.bottom > containerRect.top) {
              currentSection = sections[i].id;
              break;
            }
          } else {
            // For window scrolling, check if element is visible in viewport
            if (rect.top <= 100 && rect.bottom >= 0) {
              currentSection = sections[i].id;
              break;
            }
          }
        }
      }
      
      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
        onSectionChange?.(currentSection);
      }
    };

    const target = scrollContainer || window;
    target.addEventListener('scroll', handleScroll);
    
    // Initial call to set active section
    setTimeout(handleScroll, 100);
    
    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [sections, activeSection, onSectionChange, scrollContainer]);

  const scrollToSection = useCallback((sectionId: string) => {
    console.log('=== SCROLL DEBUG ===');
    console.log('Scrolling to section:', sectionId);
    const element = document.getElementById(sectionId);
    console.log('Found element:', element);
    
    if (element) {
      if (scrollContainer) {
        // Scroll within the container
        console.log('Scrolling within container');
        
        // Get the element's position relative to the document
        let offsetTop = 0;
        let currentElement = element as HTMLElement;
        
        // Calculate the total offset from the top of the document
        while (currentElement && currentElement !== scrollContainer) {
          offsetTop += currentElement.offsetTop;
          currentElement = currentElement.offsetParent as HTMLElement;
          if (!currentElement) break;
        }
        
        // Subtract the container's scroll position and add padding
        const targetScrollTop = offsetTop - 100;
        
        console.log('Element total offsetTop:', offsetTop);
        console.log('Calculated scrollTop:', targetScrollTop);
        console.log('Current scroll position:', scrollContainer.scrollTop);
        
        scrollContainer.scrollTo({ 
          top: targetScrollTop, 
          behavior: 'smooth' 
        });
        
      } else {
        // Scroll on window
        console.log('Scrolling on window');
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - 120;
        
        console.log('Window scroll - element rect top:', rect.top);
        console.log('Window scroll - current pageYOffset:', window.pageYOffset);
        console.log('Window scroll - calculated scrollTop:', scrollTop);
        
        window.scrollTo({ 
          top: scrollTop, 
          behavior: 'smooth' 
        });
      }
    } else {
      console.log('Element not found!');
    }
    console.log('=== END SCROLL DEBUG ===');
  }, [scrollContainer]);

  return (
    <div className={`bg-white rounded-lg p-4 text-black ${className}`}>
      <div className="space-y-0">
        {sections.map((section, index) => (
          <React.Fragment key={section.id}>
            <div 
              className={`flex items-center justify-between py-2 cursor-pointer transition-colors hover:text-black ${
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