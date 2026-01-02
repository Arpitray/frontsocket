"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import GoogleButton from "./GoogleButton";
import { Button } from "./ui/Button";
import { Panel } from "./ui/Panel";

export default function LoginForm({ onSwitch = () => {} }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setErr(data.msg || "Login failed");
      } else {
        login(data.token);
      }
    } catch (error) {
      setErr("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto animate-fade-in">
      <Panel 
        title="Welcome Back!" 
        variant="default"
        className="transform -rotate-1"
      >
        <div className="relative">
          {/* Decorative Halftone */}
          <div className="absolute -top-10 -right-10 w-20 h-20 opacity-10 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(currentColor 2px, transparent 2px)',
            backgroundSize: '10px 10px'
          }}></div>

          <form onSubmit={submit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-display font-bold text-ink text-lg uppercase tracking-tight">Email Address</label>
              <input 
                className="border-3 border-ink rounded-lg p-3 font-comic text-lg focus:outline-none focus:ring-4 focus:ring-hero-yellow/30 bg-paper transition-all"
                placeholder="hero@newstream.com" 
                value={email}
                onChange={e=>setEmail(e.target.value)} 
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-display font-bold text-ink text-lg uppercase tracking-tight">Secret Password</label>
              <input 
                className="border-3 border-ink rounded-lg p-3 font-comic text-lg focus:outline-none focus:ring-4 focus:ring-hero-yellow/30 bg-paper transition-all"
                placeholder="••••••••" 
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)} 
                required
              />
            </div>

            {err && (
              <div className="bg-hero-red/10 border-2 border-hero-red p-3 rounded-lg">
                <p className="font-comic text-hero-red font-bold text-center">{err}</p>
              </div>
            )}

            <Button 
              type="submit"
              disabled={loading}
              fullWidth
              size="lg"
              variant="primary"
              className="mt-2 text-xl py-4 bg-hero-yellow text-black"
            >
              {loading ? "Logging in..." : "Login Now!"}
            </Button>

            <div className="flex items-center gap-4 my-2">
              <div className="h-px bg-ink/20 flex-1"></div>
              <span className="font-comic text-ink/50 text-sm uppercase font-bold">OR</span>
              <div className="h-px bg-ink/20 flex-1"></div>
            </div>

            <div className="flex justify-center">
              <GoogleButton />
            </div>

            <p className="font-comic text-center mt-4 text-ink text-lg">
              New to the squad?{" "}
              <button 
                type="button"
                onClick={onSwitch} 
                className="text-hero-blue hover:text-blue-800 font-black underline decoration-wavy decoration-2 underline-offset-4"
              >
                Join here!
              </button>
            </p>
          </form>
        </div>
      </Panel>
      
      {/* Bottom Badge */}
      <div className="mt-6 text-center transform rotate-1">
        <span className="inline-block bg-hero-red text-white border-2 border-ink px-4 py-1 font-display font-bold text-sm shadow-[4px_4px_0px_var(--color-ink)]">
          POW! SECURE LOGIN
        </span>
      </div>
    </div>
  );
}
