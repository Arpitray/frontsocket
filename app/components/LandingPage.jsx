'use client';
import { Button } from "./ui/Button";
import { Panel } from "./ui/Panel";

export default function LandingPage({ onGetStarted, onLogin, darkMode, onToggleDarkMode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] font-comic relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Halftone Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        
        {/* Floating Comic Elements - Removed */}
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-display font-bold transform -rotate-2 hover:rotate-0 transition-transform cursor-pointer">
            <span className="bg-hero-yellow text-black px-4 py-1 border-3 border-ink rounded-lg shadow-[4px_4px_0px_var(--color-ink)]">
              NewStream
            </span>
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-bold text-lg">
          <a href="#features" className="hover:text-hero-blue hover:underline decoration-wavy decoration-2 transition-colors">Features</a>
          <a href="#about" className="hover:text-hero-blue hover:underline decoration-wavy decoration-2 transition-colors">About</a>
          
          <button 
            onClick={onToggleDarkMode}
            className="hover:text-hero-blue hover:underline decoration-wavy decoration-2 transition-colors flex items-center gap-2"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>

          <Button onClick={onLogin} variant="ghost" className="font-bold text-lg hover:text-hero-blue">
            Sign in
          </Button>
          <Button onClick={onGetStarted} variant="primary" className="transform rotate-1 hover:rotate-0 bg-hero-blue text-white border-ink">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 mt-10 md:mt-20 mb-20">
        
        {/* Badge */}
        <div className="mb-8 animate-fade-in-up hover:scale-105 transition-transform cursor-default">
          <span className="inline-block bg-[var(--color-panel-bg)] border-3 border-ink rounded-full px-6 py-2 text-sm font-bold shadow-[4px_4px_0px_var(--color-hero-red)] transform -rotate-1">
            🚀 The future of comic streaming is here
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-6xl md:text-8xl font-display font-black mb-6 leading-tight max-w-5xl mx-auto relative">
          <span className="relative inline-block transform -rotate-1">Stream,</span>{' '}
          <span className="relative inline-block transform rotate-1">Connect,</span> <br/>
          <span className="relative inline-block mt-2 px-4 transform -rotate-1">
            <span className="absolute inset-0 bg-hero-blue transform skew-x-[-10deg] border-3 border-ink shadow-[6px_6px_0px_var(--color-ink)] z-0"></span>
            <span className="relative z-10 text-white drop-shadow-md">Together.</span>
          </span>
        </h2>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-ink/90 font-medium max-w-2xl mx-auto mb-10 leading-relaxed bg-[var(--color-panel-bg)]/50 backdrop-blur-sm p-4 rounded-xl border-2 border-ink/10">
          NewStream is the ultimate team video platform. Host high-quality video streams 
          and calls in a unique comic-book style universe. Seamless, fast, and fun.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mb-20">
          <Button 
            onClick={onGetStarted} 
            variant="primary" 
            size="lg" 
            className="text-xl px-10 py-5 shadow-[8px_8px_0px_var(--color-ink)] hover:shadow-[4px_4px_0px_var(--color-ink)] hover:translate-x-[4px] hover:translate-y-[4px] bg-hero-yellow text-black border-3"
          >
            Get Started Free <span className="ml-2 font-bold">→</span>
          </Button>
          <Button 
            variant="secondary" 
            size="lg"
            className="text-xl px-10 py-5 shadow-[8px_8px_0px_var(--color-ink)] hover:shadow-[4px_4px_0px_var(--color-ink)] hover:translate-x-[4px] hover:translate-y-[4px] bg-[var(--color-panel-bg)] border-3"
          >
            Learn more
          </Button>
        </div>

        {/* Hero Image / Mockup */}
        <div className="relative w-full max-w-5xl mx-auto perspective-1000 group">
          <div className="relative bg-[var(--color-panel-bg)] border-4 border-ink rounded-xl shadow-[16px_16px_0px_var(--color-ink)] overflow-hidden transform rotate-x-10 transition-all duration-500 group-hover:shadow-[8px_8px_0px_var(--color-ink)] group-hover:translate-x-[4px] group-hover:translate-y-[4px]">
            {/* Mockup Header */}
            <div className="bg-[var(--color-wash-grey)] border-b-3 border-ink p-3 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-hero-red border-2 border-ink"></div>
                <div className="w-3 h-3 rounded-full bg-hero-yellow border-2 border-ink"></div>
                <div className="w-3 h-3 rounded-full bg-green-400 border-2 border-ink"></div>
              </div>
              <div className="flex-1 text-center">
                <div className="bg-[var(--color-panel-bg)] border-2 border-ink rounded-full px-4 py-1 text-xs font-bold inline-block opacity-70 font-mono">
                  newstream.app
                </div>
              </div>
            </div>
            
            {/* Mockup Content Placeholder */}
            <div className="aspect-video bg-[var(--color-paper)] relative overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 p-8 w-full h-full opacity-50">
                     <div className="border-3 border-dashed border-ink rounded-lg bg-blue-200/30 transform -rotate-1"></div>
                     <div className="border-3 border-dashed border-ink rounded-lg bg-pink-200/30 transform rotate-1"></div>
                     <div className="col-span-2 border-3 border-dashed border-ink rounded-lg bg-yellow-200/30"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-hero-red text-white font-display text-5xl px-8 py-4 transform -rotate-3 border-4 border-ink shadow-[8px_8px_0px_rgba(0,0,0,0.2)] animate-pulse-slow">
                      Join the Room!
                    </div>
                  </div>
               </div>
            </div>
          </div>
          
          {/* Decorative Elements around mockup */}
          <div className="absolute -right-12 -bottom-12 w-28 h-28 bg-hero-yellow border-4 border-ink rounded-full z-20 flex items-center justify-center transform rotate-12 shadow-[6px_6px_0px_var(--color-ink)] animate-bounce-slow hover:scale-110 transition-transform cursor-pointer">
             <span className="font-display text-2xl font-black text-ink">WOW!</span>
          </div>
          <div className="absolute -left-10 top-1/2 w-20 h-20 bg-hero-blue border-4 border-ink rounded-full z-20 flex items-center justify-center transform -rotate-12 shadow-[6px_6px_0px_var(--color-ink)] hover:rotate-12 transition-transform">
             <span className="text-3xl">🎥</span>
          </div>
          
          {/* Speech Bubble */}
          <div className="absolute -top-20 right-20 bg-[var(--color-panel-bg)] border-3 border-ink p-4 rounded-xl shadow-[6px_6px_0px_var(--color-ink)] animate-float hidden md:block">
            <p className="font-comic font-bold text-lg">"Best streaming app ever!"</p>
            <div className="absolute bottom-[-10px] left-8 w-4 h-4 bg-[var(--color-panel-bg)] border-b-3 border-r-3 border-ink transform rotate-45"></div>
          </div>
        </div>

      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-4 bg-[var(--color-panel-bg)] border-t-4 border-ink">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-hero-yellow border-3 border-ink px-4 py-1 rounded-lg font-bold text-sm mb-4 transform rotate-2 shadow-[4px_4px_0px_var(--color-ink)] text-black">
              FEATURES
            </span>
            <h2 className="text-5xl md:text-6xl font-display font-black mb-6">
              Superpowers for your streams
            </h2>
            <p className="text-xl max-w-2xl mx-auto opacity-80">
              Everything you need to host amazing video sessions, wrapped in a fun package.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[var(--color-paper)] p-8 border-3 border-ink rounded-xl shadow-[8px_8px_0px_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_var(--color-ink)] transition-all">
              <div className="w-16 h-16 bg-hero-blue rounded-full border-3 border-ink flex items-center justify-center text-3xl mb-6 shadow-[4px_4px_0px_var(--color-ink)]">
                📹
              </div>
              <h3 className="text-2xl font-bold mb-3">Crystal Clear Video</h3>
              <p className="opacity-80">
                High-definition video streaming with low latency. See every expression and detail in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[var(--color-paper)] p-8 border-3 border-ink rounded-xl shadow-[8px_8px_0px_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_var(--color-ink)] transition-all transform md:-translate-y-4">
              <div className="w-16 h-16 bg-hero-red rounded-full border-3 border-ink flex items-center justify-center text-3xl mb-6 shadow-[4px_4px_0px_var(--color-ink)]">
                ⚡
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Sharing</h3>
              <p className="opacity-80">
                Share your screen, camera, or both with a single click. No complicated setup required.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[var(--color-paper)] p-8 border-3 border-ink rounded-xl shadow-[8px_8px_0px_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_var(--color-ink)] transition-all">
              <div className="w-16 h-16 bg-hero-yellow rounded-full border-3 border-ink flex items-center justify-center text-3xl mb-6 shadow-[4px_4px_0px_var(--color-ink)]">
                🎨
              </div>
              <h3 className="text-2xl font-bold mb-3">Comic Mode</h3>
              <p className="opacity-80">
                Immerse yourself in a unique comic-book aesthetic that makes every meeting feel like a story.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-20 px-4 bg-[var(--color-paper)]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[var(--color-panel-bg)] border-4 border-ink rounded-2xl p-8 md:p-12 shadow-[12px_12px_0px_var(--color-ink)] relative overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-hero-yellow border-l-4 border-b-4 border-ink transform rotate-45 translate-x-16 -translate-y-16"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <span className="inline-block bg-hero-red text-white border-3 border-ink px-4 py-1 rounded-lg font-bold text-sm mb-4 transform -rotate-2 shadow-[4px_4px_0px_var(--color-ink)]">
                  ABOUT US
                </span>
                <h2 className="text-4xl md:text-5xl font-display font-black mb-6">
                  Why so serious?
                </h2>
                <p className="text-lg mb-6 opacity-90 leading-relaxed">
                  We believe video calls shouldn't be boring. NewStream was born from a simple idea: 
                  <span className="font-bold bg-yellow-200 px-1 mx-1 border border-ink rounded text-black">make communication fun again.</span>
                </p>
                <p className="text-lg opacity-90 leading-relaxed">
                  Whether you're brainstorming the next big idea or just hanging out with friends, 
                  our platform provides the tools you need to connect authentically, with a splash of color.
                </p>
              </div>
              
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="w-64 h-64 bg-white border-4 border-ink rounded-full flex items-center justify-center shadow-[8px_8px_0px_var(--color-ink)] relative">
                   <span className="text-8xl animate-bounce-slow">🦸‍♂️</span>
                   <div className="absolute -bottom-4 -right-4 bg-hero-blue text-white px-4 py-2 border-3 border-ink rounded-lg font-bold transform rotate-6">
                     The Team
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 bg-ink text-white border-t-4 border-ink">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-display font-bold">NewStream</div>
          <div className="opacity-60 font-comic">© 2025 NewStream. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-hero-yellow transition-colors">Twitter</a>
            <a href="#" className="hover:text-hero-yellow transition-colors">GitHub</a>
            <a href="#" className="hover:text-hero-yellow transition-colors">Discord</a>
          </div>
        </div>
      </footer>
      </div>
        )
    }
