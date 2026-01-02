'use client';

/**
 * Footer Component
 * Displays tips and information at the bottom of the page
 */
export function Footer() {
  return (
    <footer className="relative z-10 w-full max-w-4xl mx-auto mt-12 mb-8">
      <div className="text-lg text-ink font-comic text-center bg-[var(--color-panel-bg)] p-6 rounded-xl border-3 border-ink border-dashed hover-lift">
        <p className="mb-2"><strong>Tip:</strong> Use Chrome or Edge for best captureStream support.</p>
        <p className="text-sm opacity-70">Host upload must handle #viewers × bitrate. If friends connect over internet, make signalling server reachable.</p>
      </div>
    </footer>
  );
}