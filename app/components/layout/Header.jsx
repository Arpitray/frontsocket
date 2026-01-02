'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MembersPanelInline } from "../room/MembersPanel";
import { useAuth } from "../../context/AuthContext";

/**
 * Header Component
 * Main header with logo, theme toggle, live indicator and members panel
 */
export function Header({
  isStreaming,
  darkMode,
  onToggleDarkMode,
  members
}) {
  const { token, user, logout } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  const displayName = user?.name || user?.email || (token ? `${token.slice(0,6)}...${token.slice(-4)}` : null);
  return (
    <header className="relative z-50 w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
      <div className="relative">
        <h1 className="text-6xl md:text-7xl font-bold transform -rotate-2 hover:rotate-0 transition-transform duration-300">
          <span className="bg-[var(--color-panel-bg)] px-8 py-4 inline-block border-4 border-ink rounded-2xl shadow-[8px_8px_0px_var(--color-ink)]">
            NewStream
          </span>
        </h1>
      </div>
      
      <div className="flex flex-wrap justify-center md:justify-end items-center gap-4">
        {/* Live indicator when streaming */}
        {isStreaming && (
          <div className="live-indicator animate-fade-in-up mr-2">
            LIVE
          </div>
        )}

        <button 
          onClick={onToggleDarkMode}
          className="btn-comic secondary py-2 px-4 text-sm flex items-center gap-2 hover-lift"
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* Auth status */}
        {displayName ? (
          <div className="relative">
            <button
              onClick={() => setShowDetails(s => !s)}
              className="btn-comic py-2 px-4 text-sm flex items-center gap-2"
              title="Account"
            >
              Signed in • {displayName}
            </button>

            {showDetails && (
              <div className="absolute right-0 mt-2 w-64 comic-panel p-3 text-sm z-50" style={{ position: 'absolute' }}>
                <p className="font-comic text-ink text-sm">Signed in as <strong>{user?.name || user?.email}</strong></p>
                {user?.email && <p className="font-comic text-ink text-sm truncate">{user.email}</p>}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => { if (confirm('Logout?')) logout(); }}
                    className="btn-comic py-1 px-3 text-sm"
                  >Logout</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/">
            <a className="btn-comic py-2 px-4 text-sm">Login</a>
          </Link>
        )}

        <div className="comic-panel p-4 backdrop-blur-sm speech-bubble hover-lift mr-2 hidden sm:block">
          <p className="text-lg font-bold opacity-80">
            Watch together
          </p>
        </div>

        {/* Inline Members Panel (aligned with header) */}
        <MembersPanelInline members={members} maxVisible={5} />
      </div>
    </header>
  );
}