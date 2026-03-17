"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { UK_UNIVERSITIES } from "@/lib/constants";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();
  const { showToast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
        data: { university },
      },
    });

    if (error) {
      showToast(error.message, "error");
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <span className="text-4xl block mb-4">📧</span>
          <h1 className="text-xl font-bold text-text-primary mb-2">Check your email</h1>
          <p className="text-sm text-text-secondary">
            We sent a magic link to <strong>{email}</strong>. Click it to finish signing up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <span className="text-3xl block mb-3">📍</span>
          <h1 className="text-2xl font-bold text-text-primary">Join Where&apos;s Open?</h1>
          <p className="text-sm text-text-secondary mt-1">Find what&apos;s actually open near you</p>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full py-3 border border-border-subtle rounded-xl text-sm font-medium text-text-primary
            hover:border-border-hover transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border-subtle" />
          <span className="text-xs text-text-muted">or</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.ac.uk"
            required
            className="w-full h-12 px-4 rounded-xl bg-bg-input border border-border-subtle
              text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50"
          />
          <select
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-bg-input border border-border-subtle text-text-primary"
          >
            <option value="">Select your university</option>
            {UK_UNIVERSITIES.map((uni) => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-primary text-bg-primary rounded-xl text-sm font-semibold
              hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Sending..." : "Sign Up with Magic Link"}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
