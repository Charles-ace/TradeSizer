import React from 'react';
import { RotateCcw, Sun, Moon, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onCopyTicket?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  isDark,
  onToggleTheme,
  onCopyTicket,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-page)]/90 backdrop-blur-md">
      {/* Top Neatlogs Launch / Announcement Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-section)]/60 text-center py-1 px-3 text-[11px] font-medium text-[var(--color-ink-secondary)] flex items-center justify-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] inline-block animate-pulse" />
        <span className="font-semibold text-[var(--color-ink)]">TradeSizer v2.4</span>
        <span className="text-[var(--color-ink-muted)]">•</span>
        <span>10/10 Deterministic Math Verified</span>
        <span className="text-[var(--color-ink-muted)]">•</span>
        <span className="hidden sm:inline text-[var(--color-ink)] font-semibold">
          67 Traded Instruments (Forex, Deriv Synthetics, Metals, Crypto)
        </span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        {/* Brandmark (Neatlogs Style lowercase wordmark + glyph) */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {/* Neatlogs style geometric mark */}
            <div className="w-6 h-6 rounded-md bg-[var(--color-ink)] text-[var(--color-page)] flex items-center justify-center font-mono font-bold text-xs select-none">
              ts
            </div>
            <span className="font-bold text-base tracking-tight text-[var(--color-ink)] select-none">
              tradesizer
            </span>
          </div>

          <span className="hidden md:inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-[var(--color-card-subtle)] text-[var(--color-ink-secondary)] border border-[var(--color-border)] font-semibold">
            Institutional
          </span>
        </div>

        {/* Center Nav Links (Neatlogs Navigation) */}
        <nav className="hidden md:flex items-center space-x-5 text-xs font-medium text-[var(--color-ink-secondary)]">
          <span className="text-[var(--color-ink)] font-semibold cursor-pointer">Sizing Engine</span>
          <span className="hover:text-[var(--color-ink)] cursor-pointer transition-colors">Risk Models</span>
          <span className="hover:text-[var(--color-ink)] cursor-pointer transition-colors">67 Instruments</span>
          <span className="hover:text-[var(--color-ink)] cursor-pointer transition-colors">Order Ticket</span>
        </nav>

        {/* Right Nav Actions */}
        <div className="flex items-center space-x-2">
          {/* Theme Switcher (Silver / Carbon) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="neat-press p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-section)] text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] cursor-pointer"
            title={isDark ? 'Switch to Neatlogs Silver Paper' : 'Switch to Neatlogs Dark Carbon'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Setup Button */}
          <button
            type="button"
            onClick={onReset}
            className="neat-press flex items-center space-x-1.5 text-xs font-medium text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)] bg-[var(--color-section)] border border-[var(--color-border)] px-2.5 py-1.5 rounded-lg cursor-pointer"
            title="Reset calculator inputs"
          >
            <RotateCcw className="w-3 h-3 text-[var(--color-ink-muted)]" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Primary Action Button (Neatlogs signature rounded pill with ↗ arrow) */}
          {onCopyTicket && (
            <button
              type="button"
              onClick={onCopyTicket}
              className="neat-press flex items-center space-x-1 text-xs font-semibold bg-[var(--color-ink)] text-[var(--color-page)] px-3 py-1.5 rounded-lg hover:opacity-90 cursor-pointer shadow-xs"
            >
              <span>Copy Ticket</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
