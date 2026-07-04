'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Trophy, Target, Zap, Check, Sparkles, Ticket, ShieldCheck } from 'lucide-react';

interface StudentData {
  name: string;
  phone: string;
  points: number;
  currentStreak: number;
  longestStreak: number;
}

interface CouponData {
  code: string;
  brand: string;
  pin?: string | null;
  rewardDescription: string;
  issuedAt: string;
  redeemed: boolean;
  redeemedAt?: string;
}

const brandThemes: Record<string, { card: string; chip: string; accent: string }> = {
  Myntra: {
    card: 'from-[#141317] via-[#23122E] to-[#3D1128]',
    chip: 'bg-[#ff3f87]/20 text-[#ff6aa2]',
    accent: 'text-[#ff6aa2]',
  },
  Asics: {
    card: 'from-[#083f86] via-[#125ab1] to-[#1890d7]',
    chip: 'bg-white/20 text-white',
    accent: 'text-[#d8ff33]',
  },
};

export default function RewardsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [coupons, setCoupons] = useState<CouponData[]>([]);

  useEffect(() => {
    const loadRewards = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/student');
        const data = await res.json();

        if (data.success) {
          setStudent(data.student);
          setCoupons(data.coupons);
        } else {
          setError(data.error || 'Failed to load rewards.');
        }
      } catch {
        setError('Failed to load rewards.');
      } finally {
        setLoading(false);
      }
    };

    loadRewards();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4efe7] text-[#161311]">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[32px] border border-[#12151A]/10 bg-[linear-gradient(135deg,#13151c,#202534_55%,#2d1b16)] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.18)] md:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/75">
                <Sparkles className="h-4 w-4" />
                Rewards Showcase
              </div>
              <h1 className="mt-5 font-display text-4xl font-bold leading-none md:text-6xl">
                Gift cards, streaks, and member perks.
              </h1>
              <p className="mt-4 max-w-xl text-sm text-white/72 md:text-base">
                This demo page opens directly with branded reward cards so the full experience looks polished during a showcase.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:w-[360px]">
              <div className="rounded-2xl bg-white/8 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.28em] text-white/55">Active Cards</div>
                <div className="mt-2 text-3xl font-bold">{coupons.filter((coupon) => !coupon.redeemed).length}</div>
              </div>
              <div className="rounded-2xl bg-white/8 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.28em] text-white/55">Demo Member</div>
                <div className="mt-2 text-lg font-semibold">{student?.name || 'Loading...'}</div>
              </div>
            </div>
          </div>
        </motion.header>

        {loading ? (
          <div className="mt-6 rounded-[28px] border border-[#12151A]/10 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35]" />
            <p className="mt-4 text-sm text-[#12151A]/60">Loading rewards showcase...</p>
          </div>
        ) : error ? (
          <div className="mt-6 rounded-[28px] border border-[#ef4444]/20 bg-white p-10 text-center shadow-sm">
            <p className="text-base font-semibold text-[#b91c1c]">{error}</p>
          </div>
        ) : student ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[30px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#12151A]/45">
                    Member Snapshot
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-bold text-[#12151A]">
                    {student.name}
                  </h2>
                  <p className="mt-2 text-sm text-[#12151A]/58">
                    Loyalty wallet for your academy check-ins and milestone rewards.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#fff0e8] p-3">
                  <Gift className="h-7 w-7 text-[#ff6b35]" />
                </div>
              </div>

              <div className="mt-6 rounded-[28px] bg-[radial-gradient(circle_at_top,#ff8b55_0%,#ff6b35_28%,#281711_100%)] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-white/70">Current Streak</div>
                    <div className="mt-2 text-5xl font-bold">{student.currentStreak}</div>
                    <div className="text-sm text-white/75">days in a row</div>
                  </div>
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/10 text-center backdrop-blur-sm">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-white/60">Best</div>
                      <div className="text-3xl font-bold">{student.longestStreak}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[#f8f3ee] p-4 text-center">
                  <Target className="mx-auto h-5 w-5 text-[#ffb238]" />
                  <div className="mt-2 text-2xl font-bold text-[#12151A]">{student.points}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#12151A]/45">Points</div>
                </div>
                <div className="rounded-2xl bg-[#f8f3ee] p-4 text-center">
                  <Zap className="mx-auto h-5 w-5 text-[#ff6b35]" />
                  <div className="mt-2 text-2xl font-bold text-[#12151A]">{student.currentStreak}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#12151A]/45">Live</div>
                </div>
                <div className="rounded-2xl bg-[#f8f3ee] p-4 text-center">
                  <Trophy className="mx-auto h-5 w-5 text-[#22c55e]" />
                  <div className="mt-2 text-2xl font-bold text-[#12151A]">{student.longestStreak}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#12151A]/45">Best</div>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="space-y-4"
            >
              {coupons.map((coupon, idx) => {
                const theme = brandThemes[coupon.brand] || {
                  card: 'from-[#1f2430] to-[#0f1720]',
                  chip: 'bg-white/15 text-white',
                  accent: 'text-white',
                };

                return (
                  <motion.div
                    key={coupon.code}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`overflow-hidden rounded-[30px] bg-gradient-to-br ${theme.card} p-[1px] shadow-[0_22px_60px_rgba(0,0,0,0.14)]`}
                  >
                    <div className="h-full rounded-[29px] bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))] p-5 text-white backdrop-blur-sm md:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] ${theme.chip}`}>
                            <Ticket className="h-3.5 w-3.5" />
                            {coupon.brand}
                          </div>
                          <h3 className="mt-4 font-display text-3xl font-bold">{coupon.code}</h3>
                          <p className="mt-2 max-w-md text-sm text-white/78">{coupon.rewardDescription}</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-3">
                          {coupon.redeemed ? (
                            <Check className="h-6 w-6 text-white" />
                          ) : (
                            <ShieldCheck className="h-6 w-6 text-white" />
                          )}
                        </div>
                      </div>

                      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                        <div className="rounded-2xl bg-black/20 p-4">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
                            16-Digit Gift Card Pin
                          </div>
                          <div className={`mt-2 break-all font-mono text-2xl font-bold tracking-[0.16em] ${theme.accent}`}>
                            {coupon.pin || 'Not assigned'}
                          </div>
                        </div>
                        <div className="text-right text-xs uppercase tracking-[0.28em] text-white/60">
                          <div>{coupon.redeemed ? 'Redeemed' : 'Ready to use'}</div>
                          <div className="mt-2 text-sm font-semibold tracking-[0.18em] text-white">
                            {new Date(coupon.issuedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
