'use client';

import React, { useState } from 'react';
import { Sun } from 'lucide-react';

interface SolarImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function SolarImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel,
}: SolarImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className="w-full h-full bg-[#efeeeb] flex flex-col items-center justify-center p-3 text-center border border-[#c2c9bc]/40"
        role="img"
        aria-label={alt}
      >
        <Sun className="w-6 h-6 text-[#0e7a66] mb-1.5" aria-hidden="true" />
        <span className="text-[11px] font-medium text-[#42493f] leading-tight">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
