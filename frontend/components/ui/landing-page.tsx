'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Globe from '@/components/ui/globe';
import { cn } from '@/lib/utils';

export interface ScrollGlobeSection {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  description: string;
  align?: 'left' | 'center' | 'right';
  features?: { title: string; description: string }[];
  actions?: {
    label: string;
    variant: 'primary' | 'secondary';
    onClick?: () => void;
  }[];
}

export interface ScrollGlobePosition {
  top: string;
  left: string;
  scale: number;
}

export interface ScrollGlobeProps {
  sections: ScrollGlobeSection[];
  globeConfig?: {
    positions: ScrollGlobePosition[];
  };
  className?: string;
}

const defaultGlobeConfig: { positions: ScrollGlobePosition[] } = {
  positions: [
    { top: '42%', left: '84%', scale: 1.4 },
    { top: '28%', left: '14%', scale: 1.05 },
    { top: '24%', left: '88%', scale: 1.75 },
    { top: '52%', left: '50%', scale: 1.6 },
  ],
};

const parsePercent = (str: string): number => parseFloat(str.replace('%', ''));

/**
 * Scroll-reactive Globe background layer designed to sit behind the application shell
 * without altering interactive page layouts.
 */
export function ScrollGlobeBackdrop({
  positions = defaultGlobeConfig.positions,
  className,
}: {
  positions?: ScrollGlobePosition[];
  className?: string;
}) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeWaypoint, setActiveWaypoint] = useState(0);
  const animationFrameId = useRef<number | undefined>(undefined);

  const calculatedPositions = useMemo(() => {
    return positions.map((pos) => ({
      top: parsePercent(pos.top),
      left: parsePercent(pos.left),
      scale: pos.scale,
    }));
  }, [positions]);

  const updateScroll = useCallback(() => {
    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const docHeight = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
    setScrollProgress(progress);

    const maxIdx = Math.max(calculatedPositions.length - 1, 0);
    const waypoint = Math.min(
      Math.floor(progress * calculatedPositions.length),
      maxIdx
    );
    setActiveWaypoint(waypoint);
  }, [calculatedPositions.length]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        animationFrameId.current = requestAnimationFrame(() => {
          updateScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    const rafInit = requestAnimationFrame(updateScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(rafInit);
      if (animationFrameId.current !== undefined) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [updateScroll]);

  const currentPos = calculatedPositions[activeWaypoint] ?? calculatedPositions[0];
  const globeTransform = `translate3d(${currentPos.left}vw, ${currentPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${currentPos.scale}, ${currentPos.scale}, 1)`;
  const globeOpacity = activeWaypoint === calculatedPositions.length - 1 ? 0.45 : 0.72;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[1] pointer-events-none overflow-hidden',
        className
      )}
      aria-hidden="true"
    >
      {/* Top Scroll Progress Indicator (solid emerald accent, pinned below fixed header) */}
      <div className="absolute top-20 left-0 w-full h-0.5 bg-[#c2c9bc]/30">
        <div
          className="h-full bg-[#0e7a66]"
          style={{
            transform: `scaleX(${scrollProgress})`,
            transformOrigin: 'left center',
            transition: 'transform 0.15s ease-out',
          }}
        />
      </div>

      {/* Smoothly Transitioning Background Rotating Globe */}
      <div
        data-testid="background-scroll-globe"
        className="absolute top-0 left-0 transition-transform duration-1000 ease-out"
        style={{
          transform: globeTransform,
          opacity: globeOpacity,
        }}
      >
        <div className="scale-75 sm:scale-90 lg:scale-100">
          <Globe />
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable ScrollGlobe section-driven layout following shadcn/ui patterns.
 */
export function ScrollGlobe({
  sections,
  globeConfig = defaultGlobeConfig,
  className,
}: ScrollGlobeProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [globeTransform, setGlobeTransform] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const animationFrameId = useRef<number | undefined>(undefined);

  const calculatedPositions = useMemo(() => {
    return globeConfig.positions.map((pos) => ({
      top: parsePercent(pos.top),
      left: parsePercent(pos.left),
      scale: pos.scale,
    }));
  }, [globeConfig.positions]);

  const updateScrollPosition = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
    setScrollProgress(progress);

    const viewportCenter = window.innerHeight / 2;
    let newActiveSection = 0;
    let minDistance = Infinity;

    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < minDistance) {
          minDistance = distance;
          newActiveSection = index;
        }
      }
    });

    const currentPos =
      calculatedPositions[newActiveSection] ?? calculatedPositions[0];
    const transform = `translate3d(${currentPos.left}vw, ${currentPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${currentPos.scale}, ${currentPos.scale}, 1)`;

    setGlobeTransform(transform);
    setActiveSection(newActiveSection);
  }, [calculatedPositions]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        animationFrameId.current = requestAnimationFrame(() => {
          updateScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const rafInit = requestAnimationFrame(updateScrollPosition);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafInit);
      if (animationFrameId.current !== undefined) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [updateScrollPosition]);

  const initialPos = calculatedPositions[0];
  const resolvedTransform =
    globeTransform ||
    `translate3d(${initialPos.left}vw, ${initialPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${initialPos.scale}, ${initialPos.scale}, 1)`;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full max-w-screen overflow-x-hidden min-h-screen bg-[#faf9f6] text-[#1a1c1a]',
        className
      )}
    >
      {/* Solid Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-[#c2c9bc]/30 z-50">
        <div
          className="h-full bg-[#0e7a66] will-change-transform"
          style={{
            transform: `scaleX(${scrollProgress})`,
            transformOrigin: 'left center',
            transition: 'transform 0.15s ease-out',
          }}
        />
      </div>

      {/* Section Navigation Dots */}
      <div className="hidden sm:flex fixed right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40">
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {sections.map((section, index) => (
            <div key={section.id} className="relative group">
              <div
                className={cn(
                  'nav-label absolute right-5 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2',
                  'px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap',
                  'bg-[#ffffff]/95 backdrop-blur-md border border-[#c2c9bc] shadow-sm z-50',
                  activeSection === index ? 'animate-fadeOut' : 'opacity-0'
                )}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0e7a66]" />
                  <span>{section.badge || `Section ${index + 1}`}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sectionRefs.current[index]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  });
                }}
                className={cn(
                  'relative w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 hover:scale-125',
                  activeSection === index
                    ? 'bg-[#002e03] border-[#002e03]'
                    : 'bg-transparent border-[#72796e]/50 hover:border-[#0e7a66]'
                )}
                aria-label={`Go to ${section.badge || `section ${index + 1}`}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Scroll-Driven Background Globe */}
      <div
        className="fixed top-0 left-0 z-10 pointer-events-none will-change-transform transition-all duration-[1400ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          transform: resolvedTransform,
          opacity: activeSection === 3 ? 0.45 : 0.78,
        }}
      >
        <div className="scale-75 sm:scale-90 lg:scale-100">
          <Globe />
        </div>
      </div>

      {/* Content Sections */}
      {sections.map((section, index) => (
        <section
          key={section.id}
          ref={(el) => {
            sectionRefs.current[index] = el;
          }}
          className={cn(
            'relative min-h-screen flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 z-20 py-12 sm:py-16 lg:py-20 w-full max-w-full overflow-hidden',
            section.align === 'center' && 'items-center text-center',
            section.align === 'right' && 'items-end text-right',
            section.align !== 'center' &&
              section.align !== 'right' &&
              'items-start text-left'
          )}
        >
          <div className="w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
            <h1 className="font-display font-bold mb-6 leading-[1.05] tracking-tight text-4xl sm:text-6xl lg:text-7xl text-[#141e1c]">
              {section.title}
              {section.subtitle && (
                <span className="block text-[#0e7a66] text-[0.65em] mt-1">
                  {section.subtitle}
                </span>
              )}
            </h1>

            <p className="text-[#42493f] leading-relaxed mb-8 text-base sm:text-lg lg:text-xl max-w-2xl">
              {section.description}
            </p>

            {section.features && (
              <div className="grid gap-3 sm:gap-4 mb-8">
                {section.features.map((feature) => (
                  <div
                    key={feature.title}
                    className="p-4 sm:p-5 rounded-xl border border-[#c2c9bc]/60 bg-[#ffffff]/80 backdrop-blur-sm"
                  >
                    <h3 className="font-semibold text-[#141e1c] text-base sm:text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-[#42493f] text-sm sm:text-base mt-1">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {section.actions && (
              <div className="flex flex-wrap gap-3">
                {section.actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className={cn(
                      'px-6 py-3 rounded-xl font-semibold text-sm transition-colors',
                      action.variant === 'primary'
                        ? 'bg-[#002e03] text-white hover:bg-[#0e7a66]'
                        : 'bg-[#ffffff] border border-[#c2c9bc] text-[#141e1c] hover:bg-[#efeeeb]'
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export default ScrollGlobe;
