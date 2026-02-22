'use client';

import { FormEvent, useState } from 'react';
import { hasSupabase, supabase } from '@/lib/supabase';

export function AuthCard() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!hasSupabase || !supabase) {
      setMessage('Supabase is not configured. Running in local dev mode.');
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    setMessage(error ? error.message : 'Check your inbox for the magic link.');
  };

  return (
    <section className="card">
      <h3>Sign in</h3>
      <p>Email magic-link authentication.</p>
      <form onSubmit={signIn}>
        <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        <button className="btn" type="submit" style={{ marginTop: 8 }}>Send magic link</button>
      </form>
      {message && <p>{message}</p>}
    </section>
  );
}
