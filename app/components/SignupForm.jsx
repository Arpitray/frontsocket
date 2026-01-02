"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SignupForm({ onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    
    if (password !== confirmPassword) {
      return setErr("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setErr(data.msg || "Signup failed");
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
    <div className="comic-panel p-8 max-w-md w-full bg-panel-bg mx-auto">
      <h2 className="text-3xl font-comic font-bold text-ink mb-6 text-center">Join the Fun!</h2>
      
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-comic text-ink text-lg">Email</label>
          <input 
            className="border-3 border-ink rounded-lg p-2 font-comic text-lg focus:outline-none focus:ring-2 focus:ring-pastel-yellow bg-paper"
            placeholder="cool@example.com" 
            value={email}
            onChange={e=>setEmail(e.target.value)} 
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-comic text-ink text-lg">Password</label>
          <input 
            className="border-3 border-ink rounded-lg p-2 font-comic text-lg focus:outline-none focus:ring-2 focus:ring-pastel-yellow bg-paper"
            placeholder="Secret code..." 
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)} 
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-comic text-ink text-lg">Confirm Password</label>
          <input 
            className="border-3 border-ink rounded-lg p-2 font-comic text-lg focus:outline-none focus:ring-2 focus:ring-pastel-yellow bg-paper"
            placeholder="Secret code again..." 
            type="password"
            value={confirmPassword}
            onChange={e=>setConfirmPassword(e.target.value)} 
            required
          />
        </div>

        {err && <p className="font-comic text-red-500 font-bold text-center">{err}</p>}

        <button 
          disabled={loading}
          className="btn-comic mt-4 hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Sign Up!"}
        </button>

        <p className="font-comic text-center mt-4 text-ink">
          Already have an account?{" "}
          <button 
            type="button"
            onClick={onSwitch} 
            className="text-blue-600 hover:text-blue-800 font-bold underline decoration-wavy"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
