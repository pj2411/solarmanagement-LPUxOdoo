'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlobeProps {
  className?: string;
}

const EARTH_TEXTURE_URL =
  'https://cdn.21st.dev/assets/mirror/f2/f2fe23d0c6a8406962e4c5ef969e13dc9de3faf37d3e7258a1067173325b254f.jpg';

export const Globe: React.FC<GlobeProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center select-none pointer-events-none',
        className
      )}
      aria-hidden="true"
    >
      {/* Subtle solar orbital rings framing the planet */}
      <div className="relative flex items-center justify-center w-[320px] h-[320px] sm:w-[360px] sm:h-[360px]">
        <div className="absolute inset-0 rounded-full border border-dashed border-[#0e7a66]/30" />
        <div className="absolute inset-5 rounded-full border border-[#002e03]/15" />

        {/* Rotating Earth Sphere */}
        <div className="relative w-[240px] h-[240px] sm:w-[270px] sm:h-[270px] rounded-full overflow-hidden border border-[#002e03]/30 bg-[#0b3329]">
          {/* Compositor-accelerated seamless horizontal map strip (alternating mirrored tiles eliminate seams) */}
          <div
            className="flex h-full w-[400%]"
            style={{ animation: 'earthSlide 42s linear infinite' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={EARTH_TEXTURE_URL}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-1/4 object-cover shrink-0"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={EARTH_TEXTURE_URL}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-1/4 object-cover shrink-0 -scale-x-100"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={EARTH_TEXTURE_URL}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-1/4 object-cover shrink-0"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={EARTH_TEXTURE_URL}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-1/4 object-cover shrink-0 -scale-x-100"
            />
          </div>

          {/* Spherical Shading & Day-Night Terminator Overlay */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow:
                'inset -22px -6px 32px rgba(0, 22, 1, 0.72), inset 14px 4px 20px rgba(188, 235, 192, 0.42)',
            }}
          />
        </div>

        {/* Orbital Telemetry Nodes (visible on light #faf9f6 canvas) */}
        <div
          className="absolute -left-3 top-14 w-1.5 h-1.5 rounded-full bg-[#0e7a66]"
          style={{ animation: 'twinkling 3s ease-in-out infinite' }}
        />
        <div
          className="absolute left-6 -top-2 w-1.5 h-1.5 rounded-full bg-[#002e03]"
          style={{ animation: 'twinkling 2.2s ease-in-out infinite 0.4s' }}
        />
        <div
          className="absolute -right-2 top-24 w-2 h-2 rounded-full bg-[#e5a00d]"
          style={{ animation: 'twinkling 3.8s ease-in-out infinite 0.8s' }}
        />
        <div
          className="absolute right-8 bottom-3 w-1.5 h-1.5 rounded-full bg-[#0e7a66]"
          style={{ animation: 'twinkling 2.8s ease-in-out infinite 1.1s' }}
        />
        <div
          className="absolute left-10 -bottom-2 w-1.5 h-1.5 rounded-full bg-[#002e03]"
          style={{ animation: 'twinkling 1.8s ease-in-out infinite 0.2s' }}
        />
      </div>
    </div>
  );
};

export default Globe;
