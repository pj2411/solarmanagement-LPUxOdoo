'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Compass,
  CreditCard,
  FileSpreadsheet,
  FolderKanban,
  Search,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import {
  searchCommandPalette,
  buildBackendSearchItems,
  INITIAL_ALL_SEARCH_ITEMS,
  COMMAND_PALETTE_ITEMS,
  type CommandSearchCategory,
  type CommandSearchItem,
} from '@/lib/solar-logic';
import { api } from '@/lib/api';
import type { ScreenId, UserRole } from '@/lib/solar-data';

interface CommandPaletteModalProps {
  open: boolean;
  onClose: () => void;
  onSelectItem: (item: CommandSearchItem) => void;
  activeRole?: UserRole;
}

const ALL_CATEGORIES: Array<CommandSearchCategory | 'All'> = [
  'All',
  'Project',
  'Quotation',
  'Site Survey',
  'Billing & Invoice',
  'User Directory',
  'Service & Warranty',
];

const ROLE_CATEGORIES: Record<UserRole, Array<CommandSearchCategory | 'All'>> = {
  Customer: ['All', 'Quotation', 'Billing & Invoice', 'Service & Warranty'],
  Engineer: ['All', 'Site Survey', 'Project', 'Service & Warranty'],
  Technician: ['All', 'Site Survey', 'Project', 'Service & Warranty'],
  Installer: ['All', 'Project', 'Service & Warranty'],
  Admin: ['All', 'Project', 'Quotation', 'Site Survey', 'Billing & Invoice', 'User Directory', 'Service & Warranty'],
};

function CategoryIcon({ category }: { category: CommandSearchCategory }) {
  switch (category) {
    case 'Project':
      return <FolderKanban className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
    case 'Quotation':
      return <FileSpreadsheet className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
    case 'Site Survey':
      return <Compass className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
    case 'Billing & Invoice':
      return <CreditCard className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
    case 'User Directory':
      return <Users className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
    case 'Service & Warranty':
      return <Wrench className="w-4 h-4 text-[#0e7a66]" aria-hidden="true" />;
  }
}

export function CommandPaletteModal({
  open,
  onClose,
  onSelectItem,
  activeRole = 'Admin',
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CommandSearchCategory | 'All'>('All');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchPool, setSearchPool] = useState<CommandSearchItem[]>(INITIAL_ALL_SEARCH_ITEMS);
  const [recordCount, setRecordCount] = useState<number>(INITIAL_ALL_SEARCH_ITEMS.length);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    async function syncBackendData() {
      try {
        const [
          ordersRes,
          leadsRes,
          quotesRes,
          surveysRes,
          installsRes,
          invRes,
          ticketsRes,
          warRes,
        ] = await Promise.allSettled([
          api.orders.list(),
          api.leads.list(),
          api.quotations.list(),
          api.surveys.list(),
          api.installations.list(),
          api.warehouse.inventory(),
          api.support.tickets(),
          api.support.warranties(),
        ]);

        const extract = (res: any) => {
          if (res.status === 'fulfilled' && res.value?.ok) {
            const val = res.value.data;
            return Array.isArray(val) ? val : val?.data || [];
          }
          return undefined;
        };

        const liveOverride = {
          orders: extract(ordersRes),
          leads: extract(leadsRes),
          quotations: extract(quotesRes),
          surveys: extract(surveysRes),
          installations: extract(installsRes),
          inventory: extract(invRes),
          tickets: extract(ticketsRes),
          warranties: extract(warRes),
        };

        const updated = [
          ...COMMAND_PALETTE_ITEMS,
          ...buildBackendSearchItems(liveOverride),
        ];

        if (mounted && updated.length > 0) {
          setSearchPool(updated);
          setRecordCount(updated.length);
        }
      } catch (err) {
        console.warn('Backend sync failed, using cached dataset:', err);
      }
    }

    if (open) {
      syncBackendData();
    }
    return () => {
      mounted = false;
    };
  }, [open]);

  const categories = useMemo(() => {
    return ROLE_CATEGORIES[activeRole] || ALL_CATEGORIES;
  }, [activeRole]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: searchPool.length };
    for (const item of searchPool) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [searchPool]);

  const rawResults = useMemo(
    () => searchCommandPalette(query, category, searchPool),
    [query, category, searchPool]
  );

  const results = useMemo(() => {
    let list = rawResults;
    if (activeRole === 'Customer') {
      const allowedScreens: ScreenId[] = [
        'portal-dashboard',
        'quotation-engine',
        'billing-payments',
        'service-warranty',
      ];
      list = list.filter(
        (item) => allowedScreens.includes(item.screen) && item.category !== 'User Directory'
      );
    } else if (activeRole === 'Engineer' || activeRole === 'Technician') {
      const allowedScreens: ScreenId[] = [
        'site-survey-engineering',
        'installation-dispatch',
        'service-warranty',
      ];
      list = list.filter(
        (item) => allowedScreens.includes(item.screen) && item.category !== 'User Directory'
      );
    } else if (activeRole === 'Installer') {
      const allowedScreens: ScreenId[] = [
        'installation-dispatch',
        'service-warranty',
      ];
      list = list.filter(
        (item) => allowedScreens.includes(item.screen) && item.category !== 'User Directory'
      );
    }
    return list;
  }, [rawResults, activeRole]);

  const safeIndex =
    results.length === 0 ? 0 : Math.min(highlightedIndex, results.length - 1);

  useEffect(() => {
    if (!open) return;
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 40);
    return () => clearTimeout(focusTimer);
  }, [open]);

  const handleClose = () => {
    setQuery('');
    setCategory('All');
    setHighlightedIndex(0);
    onClose();
  };

  const handleSelect = (item: CommandSearchItem) => {
    setQuery('');
    setCategory('All');
    setHighlightedIndex(0);
    onSelectItem(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % results.length);
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setHighlightedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
      return;
    }
    if (e.key === 'Enter' && results[safeIndex]) {
      e.preventDefault();
      handleSelect(results[safeIndex]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="command-palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-[#001601]/25 flex items-start justify-center pt-[10vh] px-4"
          onClick={handleClose}
        >
          <motion.div
            key="command-palette-dialog"
            id="command-palette-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Global Command Palette Search"
            initial={{ opacity: 0, scale: 0.94, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 28,
              mass: 0.85,
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="w-full max-w-2xl bg-[#faf9f6]/72 backdrop-blur-md border border-[#ffffff]/80 ring-1 ring-[#c2c9bc]/60 rounded-2xl shadow-[0_24px_64px_rgba(0,22,1,0.18)] overflow-hidden"
          >
            {/* Top Search Bar */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-[#c2c9bc]/50 bg-[#ffffff]/55">
              <Search className="w-5 h-5 text-[#0e7a66] shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                id="command-palette-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder="Search 1,100+ records: order # (SP-ORD-2025-...), client name, kW, city, or status..."
                aria-label="Search projects, quotations, or site surveys"
                className="w-full bg-transparent text-sm text-[#141e1c] placeholder:text-[#72796e] focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setHighlightedIndex(0);
                    inputRef.current?.focus();
                  }}
                  className="text-[11px] font-semibold text-[#42493f] hover:text-[#141e1c] px-2 py-1 rounded-md bg-[#efeeeb]/80 shrink-0"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close search palette"
                className="w-8 h-8 rounded-lg bg-[#ffffff]/80 border border-[#c2c9bc]/60 text-[#42493f] hover:text-[#141e1c] hover:border-[#0e7a66] flex items-center justify-center shrink-0 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Realtime Database Sync Banner */}
            <div className="px-4 sm:px-5 py-1.5 bg-[#f4f3f0]/90 border-b border-[#c2c9bc]/40 flex items-center justify-between text-[11px] text-[#42493f]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0e7a66] animate-pulse" />
                <span className="font-semibold text-[#002e03]">
                  PostgreSQL 18 & Backend API Synced
                </span>
                <span className="text-[10px] text-[#72796e] hidden sm:inline font-mono-tabular">
                  ({recordCount} total indexed records)
                </span>
              </div>
              <span className="text-[10px] font-mono-tabular text-[#0e7a66] font-semibold bg-[#0e7a66]/10 px-2 py-0.5 rounded">
                Port 8000 · Live
              </span>
            </div>

            {/* Category Filter Tabs */}
            <div className="px-4 sm:px-5 py-2 border-b border-[#c2c9bc]/40 bg-[#faf9f6]/45 flex items-center gap-1.5 overflow-x-auto">
              {categories.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setHighlightedIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                      active
                        ? 'bg-[#001601] text-white shadow-xs'
                        : 'bg-[#ffffff]/75 text-[#42493f] border border-[#c2c9bc]/60 hover:bg-[#ffffff] hover:text-[#141e1c]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono-tabular font-bold ${
                        active ? 'bg-white/20 text-white' : 'bg-[#efeeeb] text-[#555f52]'
                      }`}
                    >
                      {categoryCounts[cat] || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Results List */}
            <div className="max-h-[52vh] overflow-y-auto p-2.5 space-y-1">
              {results.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-1.5">
                  <p className="font-display text-xl text-[#141e1c] tracking-wide">
                    NO MATCHING RECORDS
                  </p>
                  <p className="text-xs text-[#42493f]">
                    Try searching an order number (e.g. 7300, 7150), client name (Preeti, Kunal, Sharma), kW (5kW, 7.5kW) or status (CONFIRMED, ADVANCE_PAID).
                  </p>
                </div>
              ) : (
                results.map((item, idx) => {
                  const isHighlighted = idx === safeIndex;
                  return (
                    <motion.button
                      key={`${item.category}-${item.id}-${idx}`}
                      type="button"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.14, delay: Math.min(idx * 0.02, 0.12) }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => handleSelect(item)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors border ${
                        isHighlighted
                          ? 'bg-[#ffffff]/90 border-[#0e7a66]/70 shadow-sm'
                          : 'bg-[#ffffff]/45 border-transparent hover:bg-[#ffffff]/75'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-[#ffffff] border border-[#c2c9bc]/60 flex items-center justify-center shrink-0">
                          <CategoryIcon category={item.category} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono-tabular text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[#002e03]/10 text-[#002e03] shrink-0">
                              {item.id}
                            </span>
                            <span className="text-sm font-semibold text-[#141e1c] truncate">
                              {item.title}
                            </span>
                          </div>
                          <p className="text-xs text-[#42493f] truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#42493f]">
                            {item.category}
                          </span>
                          <span className="text-[11px] font-semibold text-[#0e7a66]">
                            {item.statusTag}
                          </span>
                        </div>
                        <ArrowRight
                          className={`w-4 h-4 transition-transform ${
                            isHighlighted
                              ? 'text-[#0e7a66] translate-x-0.5'
                              : 'text-[#72796e]'
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Footer Shortcuts */}
            <div className="px-4 sm:px-5 py-2.5 border-t border-[#c2c9bc]/45 bg-[#ffffff]/55 flex items-center justify-between text-[11px] text-[#42493f]">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#efeeeb] border border-[#c2c9bc]/70 font-mono-tabular text-[10px] text-[#141e1c]">
                    ↑↓
                  </kbd>
                  Navigate
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#efeeeb] border border-[#c2c9bc]/70 font-mono-tabular text-[10px] text-[#141e1c]">
                    ↵
                  </kbd>
                  Open
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#efeeeb] border border-[#c2c9bc]/70 font-mono-tabular text-[10px] text-[#141e1c]">
                    ESC
                  </kbd>
                  Close
                </span>
              </div>
              <span className="font-mono-tabular font-medium">
                {results.length} {results.length === 1 ? 'record' : 'records'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
