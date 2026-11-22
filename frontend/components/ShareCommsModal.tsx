'use client';

import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Mail,
  MessageSquare,
  X,
} from 'lucide-react';
import {
  buildGmailComposeUrl,
  buildMailtoUrl,
  buildWhatsAppShareUrl,
  isSafeExternalHref,
} from '@/lib/pdf-qr-comms';
import { QrCodeDisplay } from '@/components/QrCodeDisplay';

export interface ShareCommsPayload {
  title: string;
  recipientName: string;
  defaultPhone: string;
  defaultEmail: string;
  subject: string;
  message: string;
  qrValue?: string;
  qrLabel?: string;
}

interface ShareCommsModalProps {
  open: boolean;
  payload: ShareCommsPayload | null;
  onClose: () => void;
  onShowToast?: (message: string) => void;
}

export function ShareCommsModal({
  open,
  payload,
  onClose,
  onShowToast,
}: ShareCommsModalProps) {
  if (!open || !payload) return null;
  return (
    <ShareCommsDialog
      key={`${payload.title}-${payload.defaultPhone}-${payload.defaultEmail}-${payload.subject}`}
      payload={payload}
      onClose={onClose}
      onShowToast={onShowToast}
    />
  );
}

function ShareCommsDialog({
  payload,
  onClose,
  onShowToast,
}: {
  payload: ShareCommsPayload;
  onClose: () => void;
  onShowToast?: (message: string) => void;
}) {
  const [phone, setPhone] = useState(payload.defaultPhone);
  const [email, setEmail] = useState(payload.defaultEmail);
  const [subject, setSubject] = useState(payload.subject);
  const [message, setMessage] = useState(payload.message);
  const [copied, setCopied] = useState(false);

  const whatsappUrl = buildWhatsAppShareUrl(phone, message);
  const gmailUrl = buildGmailComposeUrl({ to: email, subject, body: message });
  const mailtoUrl = buildMailtoUrl({ to: email, subject, body: message });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${message}`);
      setCopied(true);
      onShowToast?.('Message copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast?.('Unable to copy automatically — select message text manually.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001601]/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Dispatch ${payload.title} via WhatsApp or Gmail`}
    >
      <div
        className="w-full max-w-2xl bg-[#ffffff] border border-[#c2c9bc] rounded-3xl p-6 sm:p-7 shadow-xl max-h-[92vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#e3e2df]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0e7a66]">
              Integrated Communication Dispatch · WhatsApp &amp; Gmail
            </p>
            <h3 className="font-display text-2xl sm:text-3xl text-[#001601] uppercase leading-none mt-1">
              {payload.title}
            </h3>
            <p className="text-xs text-[#42493f] mt-1">
              Recipient: <strong className="text-[#1a1c1a]">{payload.recipientName}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="w-9 h-9 rounded-xl bg-[#f4f3f0] hover:bg-[#e9e8e5] flex items-center justify-center text-[#1a1c1a] shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
          <div className="sm:col-span-8 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="comms-phone"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#42493f] mb-1"
                >
                  WhatsApp Mobile (+91)
                </label>
                <input
                  id="comms-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98100 10001"
                  className="w-full px-3 py-2 rounded-xl bg-[#f4f3f0] border border-[#c2c9bc] text-xs font-mono-tabular text-[#1a1c1a] focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                />
              </div>
              <div>
                <label
                  htmlFor="comms-email"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#42493f] mb-1"
                >
                  Gmail / Email Recipient
                </label>
                <input
                  id="comms-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#f4f3f0] border border-[#c2c9bc] text-xs text-[#1a1c1a] focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="comms-subject"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#42493f] mb-1"
              >
                Email Subject
              </label>
              <input
                id="comms-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#f4f3f0] border border-[#c2c9bc] text-xs text-[#1a1c1a] focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
              />
            </div>

            <div>
              <label
                htmlFor="comms-message"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#42493f] mb-1"
              >
                Message Body Preview
              </label>
              <textarea
                id="comms-message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#f4f3f0] border border-[#c2c9bc] text-xs leading-relaxed text-[#1a1c1a] focus:outline-none focus:ring-2 focus:ring-[#0e7a66]"
              />
            </div>
          </div>

          <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#faf9f6] border border-[#e3e2df]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0e7a66] mb-2">
              Verification QR Code
            </span>
            <QrCodeDisplay
              value={payload.qrValue || `${subject} | ${phone}`}
              size={132}
              caption={payload.qrLabel || 'Scan to Verify Record'}
              downloadName="sunpower-verification-qr.png"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#e3e2df] flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2.5 rounded-xl bg-[#efeeeb] hover:bg-[#e3e2df] text-[#1a1c1a] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{copied ? 'Copied' : 'Copy Message'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {isSafeExternalHref(mailtoUrl) && (
              <a
                href={mailtoUrl}
                onClick={() =>
                  onShowToast?.(`Opened system mail composer for ${email}.`)
                }
                className="px-3.5 py-2.5 rounded-xl bg-[#f4f3f0] hover:bg-[#e9e8e5] border border-[#c2c9bc] text-[#1a1c1a] text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Mail className="w-4 h-4 text-[#42493f]" aria-hidden="true" />
                <span>Mail App</span>
              </a>
            )}
            {isSafeExternalHref(gmailUrl) && (
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  onShowToast?.(`Opened Gmail compose window for ${email}.`)
                }
                className="px-4 py-2.5 rounded-xl bg-[#001601] hover:bg-[#002e03] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Mail className="w-4 h-4 text-[#bcebc0]" aria-hidden="true" />
                <span>Send via Gmail</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
              </a>
            )}
            {isSafeExternalHref(whatsappUrl) && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  onShowToast?.(`Opened WhatsApp dispatch for ${phone}.`)
                }
                className="px-4 py-2.5 rounded-xl bg-[#0e7a66] hover:bg-[#085244] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                <span>Send via WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
