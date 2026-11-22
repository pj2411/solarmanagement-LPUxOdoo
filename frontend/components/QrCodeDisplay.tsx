'use client';

import React, { useEffect, useState } from 'react';
import { Download, QrCode } from 'lucide-react';
import { generateQrDataUrl } from '@/lib/pdf-qr-comms';

interface QrCodeDisplayProps {
  value: string;
  size?: number;
  caption?: string;
  downloadName?: string;
  className?: string;
}

export function QrCodeDisplay({
  value,
  size = 160,
  caption,
  downloadName,
  className = '',
}: QrCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    if (!value) return;
    generateQrDataUrl(value)
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  const effectiveDataUrl = value ? dataUrl : '';

  const handleDownloadQr = () => {
    if (!effectiveDataUrl) return;
    const link = document.createElement('a');
    link.href = effectiveDataUrl;
    link.download = downloadName || 'sunpower-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div
        className="rounded-2xl bg-[#ffffff] border border-[#c2c9bc] p-2.5 flex items-center justify-center shadow-sm"
        style={{ width: size + 20, height: size + 20 }}
      >
        {effectiveDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={effectiveDataUrl}
            alt={caption || 'Scannable QR Code'}
            width={size}
            height={size}
            className="block rounded-lg"
          />
        ) : (
          <QrCode className="w-8 h-8 text-[#72796e]" aria-hidden="true" />
        )}
      </div>
      {caption && (
        <span className="text-[11px] font-mono-tabular text-[#42493f] text-center max-w-[220px] break-all">
          {caption}
        </span>
      )}
      {downloadName && effectiveDataUrl && (
        <button
          type="button"
          onClick={handleDownloadQr}
          className="px-3 py-1.5 rounded-lg bg-[#efeeeb] hover:bg-[#e3e2df] text-[#1a1c1a] text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Download QR PNG</span>
        </button>
      )}
    </div>
  );
}
