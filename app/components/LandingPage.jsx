'use client';
import { Button } from "./ui/Button";
import { Panel } from "./ui/Panel";

export default function LandingPage({ onGetStarted, onLogin, darkMode, onToggleDarkMode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] relative overflow-hidden">
      
      {/* === DRAMATIC BACKGROUND === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 gradient-mesh opacity-30"></div>
        
        {/* Animated Blob Shapes */}
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-[var(--color-hero-blue)] opacity-10 blob-morph"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[var(--color-pastel-pink)] opacity-10 blob-morph" style={{ animationDelay: '-4s' }}></div>
        
        {/* Dot Grid Pattern */}
        <div className="absolute inset-0 dot-grid"></div>
        
        {/* Noise Texture */}
        <div className="absolute inset-0 noise-overlay"></div>
      </div>

      {/* === NAVBAR === */}
      <nav className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center reveal-up reveal-up-1">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            {/* Logo Mark */}
            <div className="w-12 h-12 bg-[var(--color-hero-blue)] border-3 border-ink flex items-center justify-center shadow-brutal magnetic-hover">
              <span className="text-white font-display text-2xl">N</span>
            </div>
          </div>
          <h1 className="font-display text-3xl tracking-wide">
            NewStream
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="font-body font-semibold text-sm uppercase tracking-widest hover:text-[var(--color-hero-blue)] transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-hero-blue)] transition-all group-hover:w-full"></span>
          </a>
          <a href="#about" className="font-body font-semibold text-sm uppercase tracking-widest hover:text-[var(--color-hero-blue)] transition-colors relative group">
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-hero-blue)] transition-all group-hover:w-full"></span>
          </a>
          
          <button 
            onClick={onToggleDarkMode}
            className="w-10 h-10 border-2 border-ink rounded-full flex items-center justify-center hover:bg-[var(--color-wash-grey)] transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <button onClick={onLogin} className="font-body font-semibold text-sm uppercase tracking-widest hover:text-[var(--color-hero-blue)] transition-colors">
            Sign in
          </button>
          
          <button 
            onClick={onGetStarted} 
            className="px-6 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] font-body font-bold text-sm uppercase tracking-widest border-2 border-ink shadow-brutal magnetic-hover"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* === HERO SECTION === */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 md:pt-24 pb-20">
        
        {/* Eyebrow Badge */}
        <div className="reveal-up reveal-up-2 mb-8">
          <span className="inline-flex items-center gap-2 px-5 py-2 border-2 border-ink bg-[var(--color-panel-bg)] font-mono text-sm uppercase tracking-wider shadow-brutal">
            <span className="w-2 h-2 bg-[var(--color-hero-green)] rounded-full animate-pulse"></span>
            Now in Public Beta
          </span>
        </div>

        {/* Main Headline */}
        <h2 className="reveal-up reveal-up-3 font-display text-7xl md:text-[10rem] leading-[0.85] tracking-tight mb-8 max-w-6xl">
          <span className="block">STREAM</span>
          <span className="block gradient-text">TOGETHER</span>
        </h2>

        {/* Subheadline */}
        <p className="reveal-up reveal-up-4 font-body text-lg md:text-xl text-[var(--color-ink)]/70 max-w-xl mx-auto mb-12 leading-relaxed">
          The next-gen video platform built for real-time collaboration. 
          Crystal-clear streams, instant connections, zero friction.
        </p>

        {/* CTA Buttons */}
        <div className="reveal-up reveal-up-5 flex flex-col sm:flex-row gap-4 mb-20">
          <button 
            onClick={onGetStarted} 
            className="group relative px-10 py-5 bg-[var(--color-hero-blue)] text-white font-body font-bold text-lg uppercase tracking-wider border-3 border-ink shadow-brutal-lg magnetic-hover overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Start Free
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          
          <button 
            className="px-10 py-5 bg-transparent text-[var(--color-ink)] font-body font-bold text-lg uppercase tracking-wider border-3 border-ink shadow-brutal magnetic-hover"
          >
            Watch Demo
          </button>
        </div>
        
        {/* Scroll Indicator */}
        <div className="reveal-up reveal-up-6 scroll-indicator">
          <div className="w-8 h-14 border-2 border-ink rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-[var(--color-ink)] rounded-full"></div>
          </div>
        </div>
      </main>

      {/* === FEATURES SECTION === */}
      <section id="features" className="relative z-10 py-32 px-4 bg-[var(--color-panel-bg)] border-t-2 border-ink">
        {/* Section Background */}
        <div className="absolute inset-0 diagonal-lines pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <span className="inline-block px-4 py-2 bg-[var(--color-hero-yellow)] text-[var(--color-ink)] font-mono text-xs uppercase tracking-widest border-2 border-ink shadow-brutal mb-6">
                Features
              </span>
              <h2 className="font-display text-6xl md:text-8xl tracking-tight">
                BUILT FOR<br/>
                <span className="gradient-text">CREATORS</span>
              </h2>
            </div>
            <p className="font-body text-lg text-[var(--color-ink)]/60 max-w-md">
              Everything you need to host incredible video sessions. No compromises, no complexity.
            </p>
          </div>

          {/* Features Grid - Asymmetric Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Feature 1 - Large */}
            <div className="md:col-span-7 group">
              <div className="h-full bg-[var(--color-paper)] border-3 border-ink p-10 shadow-brutal-lg magnetic-hover relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-hero-blue)] opacity-10 blob-morph"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-[var(--color-hero-blue)] border-3 border-ink flex items-center justify-center mb-8 shadow-brutal">
                    <span className="text-3xl">📹</span>
                  </div>
                  <h3 className="font-display text-4xl mb-4">4K STREAMING</h3>
                  <p className="font-body text-[var(--color-ink)]/70 text-lg leading-relaxed">
                    Crystal-clear video at up to 4K resolution with adaptive bitrate. 
                    WebRTC-powered for sub-100ms latency worldwide.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 - Small */}
            <div className="md:col-span-5 group">
              <div className="h-full bg-[var(--color-hero-yellow)] border-3 border-ink p-10 shadow-brutal-lg magnetic-hover">
                <div className="w-16 h-16 bg-[var(--color-paper)] border-3 border-ink flex items-center justify-center mb-8 shadow-brutal">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="font-display text-4xl mb-4 text-[var(--color-ink)]">INSTANT JOIN</h3>
                <p className="font-body text-[var(--color-ink)]/80 text-lg leading-relaxed">
                  One click to create a room. Share the link. Done. No downloads, no sign-ups required.
                </p>
              </div>
            </div>

            {/* Feature 3 - Small */}
            <div className="md:col-span-5 group">
              <div className="h-full bg-[var(--color-pastel-pink)] border-3 border-ink p-10 shadow-brutal-lg magnetic-hover">
                <div className="w-16 h-16 bg-[var(--color-paper)] border-3 border-ink flex items-center justify-center mb-8 shadow-brutal">
                  <span className="text-3xl">🔄</span>
                </div>
                <h3 className="font-display text-4xl mb-4 text-[var(--color-ink)]">SYNC PLAYBACK</h3>
                <p className="font-body text-[var(--color-ink)]/80 text-lg leading-relaxed">
                  Watch videos together in perfect sync. Frame-accurate playback across all participants.
                </p>
              </div>
            </div>

            {/* Feature 4 - Large */}
            <div className="md:col-span-7 group">
              <div className="h-full bg-[var(--color-ink)] text-[var(--color-paper)] border-3 border-ink p-10 shadow-brutal-lg magnetic-hover relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[var(--color-hero-purple)] opacity-20 blob-morph"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-[var(--color-hero-purple)] border-3 border-[var(--color-paper)] flex items-center justify-center mb-8">
                    <span className="text-3xl">🔒</span>
                  </div>
                  <h3 className="font-display text-4xl mb-4">END-TO-END SECURE</h3>
                  <p className="font-body text-[var(--color-paper)]/70 text-lg leading-relaxed">
                    Enterprise-grade encryption. Your streams, your privacy. 
                    SOC2 compliant infrastructure with zero data retention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === MARQUEE SECTION === */}
      <div className="relative z-10 py-6 bg-[var(--color-ink)] text-[var(--color-paper)] border-y-3 border-ink overflow-hidden">
        <div className="flex whitespace-nowrap marquee">
          <span className="font-display text-3xl tracking-wider mx-8">REAL-TIME STREAMING</span>
          <span className="text-[var(--color-hero-yellow)] mx-4">✦</span>
          <span className="font-display text-3xl tracking-wider mx-8">WEBRTC POWERED</span>
          <span className="text-[var(--color-hero-pink)] mx-4">✦</span>
          <span className="font-display text-3xl tracking-wider mx-8">PEER-TO-PEER</span>
          <span className="text-[var(--color-hero-blue)] mx-4">✦</span>
          <span className="font-display text-3xl tracking-wider mx-8">LOW LATENCY</span>
          <span className="text-[var(--color-hero-green)] mx-4">✦</span>
          <span className="font-display text-3xl tracking-wider mx-8">REAL-TIME STREAMING</span>
          <span className="text-[var(--color-hero-yellow)] mx-4">✦</span>
          <span className="font-display text-3xl tracking-wider mx-8">WEBRTC POWERED</span>
          <span className="text-[var(--color-hero-pink)] mx-4">✦</span>
          <span className="font-display text-3xl tracking-wider mx-8">PEER-TO-PEER</span>
          <span className="text-[var(--color-hero-blue)] mx-4">✦</span>
          <span className="font-display text-3xl tracking-wider mx-8">LOW LATENCY</span>
          <span className="text-[var(--color-hero-green)] mx-4">✦</span>
        </div>
      </div>

      {/* === ABOUT SECTION === */}
      <section id="about" className="relative z-10 py-32 px-4 bg-[var(--color-paper)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
            {/* Left - Text Content */}
            <div>
              <span className="inline-block px-4 py-2 bg-[var(--color-hero-red)] text-white font-mono text-xs uppercase tracking-widest border-2 border-ink shadow-brutal mb-6">
                About
              </span>
              <h2 className="font-display text-5xl md:text-7xl tracking-tight mb-8">
                WHY SO<br/>
                <span className="gradient-text">SERIOUS?</span>
              </h2>
              <p className="font-body text-lg text-[var(--color-ink)]/70 leading-relaxed mb-6">
                Video calls don't have to be boring. NewStream was born from a simple idea: 
                <span className="font-bold text-[var(--color-ink)] bg-[var(--color-hero-yellow)] px-2 mx-1">make communication fun again.</span>
              </p>
              <p className="font-body text-lg text-[var(--color-ink)]/70 leading-relaxed mb-10">
                Whether you're brainstorming the next big idea or hanging out with friends, 
                our platform provides the tools you need to connect authentically.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="font-display text-5xl gradient-text">50K+</div>
                  <div className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink)]/50">Active Users</div>
                </div>
                <div>
                  <div className="font-display text-5xl gradient-text">99.9%</div>
                  <div className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink)]/50">Uptime</div>
                </div>
                <div>
                  <div className="font-display text-5xl gradient-text">&lt;50ms</div>
                  <div className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink)]/50">Latency</div>
                </div>
              </div>
            </div>
            
            {/* Right - Visual Element */}
            <div className="relative">
              <div className="aspect-square bg-[var(--color-panel-bg)] border-3 border-ink shadow-brutal-xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 gradient-mesh opacity-50"></div>
                <div className="absolute inset-0 dot-grid"></div>
                
                {/* Central Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[12rem] animate-pulse">🦸‍♂️</div>
                </div>
                
                {/* Floating Labels */}
                <div className="absolute top-6 left-6 px-4 py-2 bg-[var(--color-hero-blue)] text-white font-mono text-sm border-2 border-ink shadow-brutal transform -rotate-6">
                  WebRTC
                </div>
                <div className="absolute bottom-6 right-6 px-4 py-2 bg-[var(--color-hero-yellow)] text-[var(--color-ink)] font-mono text-sm border-2 border-ink shadow-brutal transform rotate-3">
                  Socket.io
                </div>
                <div className="absolute top-1/2 right-6 px-4 py-2 bg-[var(--color-pastel-pink)] text-[var(--color-ink)] font-mono text-sm border-2 border-ink shadow-brutal transform rotate-12">
                  Next.js
                </div>
              </div>
              
              {/* Offset Decorative Box */}
              <div className="absolute -bottom-6 -right-6 w-full h-full border-3 border-ink -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* === CTA SECTION === */}
      <section className="relative z-10 py-32 px-4 bg-[var(--color-ink)] text-[var(--color-paper)]">
        <div className="absolute inset-0 gradient-mesh opacity-10"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="font-display text-6xl md:text-8xl tracking-tight mb-8">
            READY TO<br/>
            <span className="text-[var(--color-hero-yellow)]">STREAM?</span>
          </h2>
          <p className="font-body text-xl text-[var(--color-paper)]/70 mb-12 max-w-xl mx-auto">
            Join thousands of creators who are already using NewStream to connect with their audience.
          </p>
          <button 
            onClick={onGetStarted}
            className="px-12 py-6 bg-[var(--color-hero-yellow)] text-[var(--color-ink)] font-body font-bold text-xl uppercase tracking-wider border-3 border-[var(--color-paper)] shadow-[8px_8px_0_var(--color-paper)] hover:shadow-[4px_4px_0_var(--color-paper)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            Get Started — It's Free
          </button>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="relative z-10 py-12 bg-[var(--color-paper)] border-t-3 border-ink">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--color-ink)] border-2 border-ink flex items-center justify-center">
                <span className="text-[var(--color-paper)] font-display text-xl">N</span>
              </div>
              <span className="font-display text-2xl">NewStream</span>
            </div>
            
            {/* Copyright */}
            <div className="font-mono text-sm text-[var(--color-ink)]/50">
              © 2026 NewStream. All rights reserved.
            </div>
            
            {/* Social Links */}
            <div className="flex gap-6">
              <a href="#" className="font-body font-semibold text-sm uppercase tracking-wider hover:text-[var(--color-hero-blue)] transition-colors">Twitter</a>
              <a href="#" className="font-body font-semibold text-sm uppercase tracking-wider hover:text-[var(--color-hero-blue)] transition-colors">GitHub</a>
              <a href="#" className="font-body font-semibold text-sm uppercase tracking-wider hover:text-[var(--color-hero-blue)] transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
