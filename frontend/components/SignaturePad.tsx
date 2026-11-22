'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
  label: string;
  subtitle?: string;
  metaRight?: string;
  footerLeft?: string;
  footerRight?: string;
  strokeColor?: string;
  defaultSigned?: boolean;
  defaultPath?: 'engineer' | 'customer' | 'handover';
  onSignatureChange?: (hasSignature: boolean) => void;
  heightClass?: string;
}

export function SignaturePad({
  label,
  subtitle,
  metaRight,
  footerLeft,
  footerRight,
  strokeColor = '#001601',
  defaultSigned = true,
  defaultPath = 'customer',
  onSignatureChange,
  heightClass = 'h-32',
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showPresetVector, setShowPresetVector] = useState(defaultSigned);
  const [hasCustomStrokes, setHasCustomStrokes] = useState(false);

  const hasSignature = showPresetVector || hasCustomStrokes;

  useEffect(() => {
    onSignatureChange?.(hasSignature);
  }, [hasSignature, onSignatureChange]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (showPresetVector) {
      setShowPresetVector(false);
    }

    const pt = getPoint(e);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    setIsDrawing(true);
    setHasCustomStrokes(true);
    canvas.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pt = getPoint(e);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setShowPresetVector(false);
    setHasCustomStrokes(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="font-display text-lg text-[#001601] tracking-wide uppercase block leading-tight">
            {label}
          </span>
          {subtitle && (
            <span className="text-xs text-[#42493f]">{subtitle}</span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {metaRight && (
            <span className="text-[11px] font-mono-tabular text-[#42493f] hidden sm:inline">
              {metaRight}
            </span>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-medium text-[#42493f] hover:text-[#1a1c1a] flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#efeeeb] hover:bg-[#e3e2df] transition-colors whitespace-nowrap"
          >
            <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear Pad</span>
          </button>
        </div>
      </div>

      <div
        className={`relative w-full ${heightClass} rounded-xl bg-[#f4f3f0] border border-dashed border-[#72796e]/50 flex items-center justify-center overflow-hidden cursor-crosshair`}
      >
        {showPresetVector && (
          <svg
            className="absolute inset-0 w-full h-full p-4 pointer-events-none"
            viewBox="0 0 400 100"
            aria-hidden="true"
          >
            {defaultPath === 'engineer' && (
              <>
                <path
                  d="M 35 65 Q 75 20, 110 45 T 175 50 T 235 30 Q 270 15, 305 60 T 355 52"
                  fill="none"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
                <path
                  d="M 70 54 Q 145 78, 260 72"
                  fill="none"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
              </>
            )}
            {defaultPath === 'customer' && (
              <>
                <path
                  d="M 40 45 Q 65 75, 95 50 Q 130 20, 165 65 Q 195 82, 240 35 Q 285 15, 350 48"
                  fill="none"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.4"
                />
                <circle cx="355" cy="48" r="2.5" fill={strokeColor} />
              </>
            )}
            {defaultPath === 'handover' && (
              <>
                <path
                  d="M 40,65 Q 70,20 110,50 T 160,35 T 220,70 T 260,30 T 320,60"
                  fill="none"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
                <path
                  d="M 120,40 L 150,80"
                  fill="none"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                <path
                  d="M 270,45 L 340,42"
                  fill="none"
                  stroke={strokeColor}
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
              </>
            )}
          </svg>
        )}

        {!hasSignature && (
          <span className="text-xs text-[#72796e] pointer-events-none select-none">
            Draw signature here with mouse or touch
          </span>
        )}

        <canvas
          ref={canvasRef}
          width={640}
          height={200}
          aria-label={label}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full touch-none relative z-10"
        />

        <div className="absolute bottom-2 right-3 text-[10px] font-mono-tabular text-[#42493f] pointer-events-none">
          {hasSignature ? 'Verified Touch Input · IP: 103.22.41.9' : 'Awaiting Signature'}
        </div>
      </div>

      {(footerLeft || footerRight) && (
        <div className="flex items-center justify-between text-[11px] text-[#42493f]">
          <span>{footerLeft}</span>
          <span>{footerRight}</span>
        </div>
      )}
    </div>
  );
}
