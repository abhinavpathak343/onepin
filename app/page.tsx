'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, Gift, Trophy, Zap, Target, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B1220]">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 md:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF6B35]/10 via-transparent to-transparent opacity-50" />

        {/* Animated rings in background */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-10">
          <motion.div
            className="w-[600px] h-[600px] rounded-full border-[40px] border-[#FF6B35]"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full border-[30px] border-[#FFB238]"
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-[#F7F6F2] mb-6 font-['Space_Grotesk',sans-serif]">
              Build Your
              <span className="text-[#FF6B35]"> Streak</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-[#F7F6F2]/70 mb-10 max-w-2xl mx-auto"
          >
            Check in at your sports academy, build daily streaks, earn points, and unlock exclusive rewards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/scan"
              className="flex items-center justify-center gap-2 bg-[#FF6B35] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#e55a28] transition-colors"
            >
              <Camera className="w-5 h-5" />
              Check In Now
            </Link>
            <Link
              href="/rewards"
              className="flex items-center justify-center gap-2 bg-[#1a2332] text-[#F7F6F2] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#2a3542] transition-colors"
            >
              <Gift className="w-5 h-5" />
              View My Rewards
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-[#F7F6F2]">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#12151A] text-center mb-16 font-['Space_Grotesk',sans-serif]"
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#FF6B35]/10 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-[#FF6B35]" />
              </div>
              <h3 className="text-xl font-semibold text-[#12151A] mb-2 font-['Space_Grotesk',sans-serif]">
                Scan
              </h3>
              <p className="text-[#12151A]/60">
                Open /scan and point your camera at the kiosk QR code at your academy entrance.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#FFB238]/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-[#FFB238]" />
              </div>
              <h3 className="text-xl font-semibold text-[#12151A] mb-2 font-['Space_Grotesk',sans-serif]">
                Check In
              </h3>
              <p className="text-[#12151A]/60">
                Enter your phone number and we'll track your progress automatically. No login required.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-[#22C55E]" />
              </div>
              <h3 className="text-xl font-semibold text-[#12151A] mb-2 font-['Space_Grotesk',sans-serif]">
                Earn Rewards
              </h3>
              <p className="text-[#12151A]/60">
                Build streaks, earn points, and unlock coupons at milestones. Stay motivated!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Features */}
      <section className="px-6 py-20 bg-[#0B1220]">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#F7F6F2] text-center mb-16 font-['Space_Grotesk',sans-serif]"
          >
            Stay Motivated
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#1a2332] to-[#0B1220] rounded-2xl p-8 border border-[#2a3542]"
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-[#FFB238]" />
                <h3 className="text-xl font-semibold text-[#F7F6F2] font-['Space_Grotesk',sans-serif]">
                  Daily Streaks
                </h3>
              </div>
              <p className="text-[#F7F6F2]/70 mb-6">
                Each consecutive day builds your streak. Miss a day within 36 hours and you start over.
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="#2a3542" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="36" fill="none" stroke="#FF6B35" strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 36}
                      strokeDashoffset={2 * Math.PI * 36 * 0.3}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#FF6B35] font-['Space_Grotesk',sans-serif]">5</span>
                  </div>
                </div>
                <div className="text-[#F7F6F2]/50 text-sm">5 day streak</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#1a2332] to-[#0B1220] rounded-2xl p-8 border border-[#2a3542]"
            >
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-[#FF6B35]" />
                <h3 className="text-xl font-semibold text-[#F7F6F2] font-['Space_Grotesk',sans-serif]">
                  Earn Points
                </h3>
              </div>
              <p className="text-[#F7F6F2]/70 mb-6">
                Every check-in earns base points. Higher streaks earn bonus points for extra motivation.
              </p>
              <div className="text-center py-4 px-6 bg-[#FFB238]/10 rounded-xl">
                <div className="text-3xl font-bold text-[#FFB238] font-['Space_Grotesk',sans-serif]">
                  +15 pts
                </div>
                <div className="text-[#F7F6F2]/50 text-sm mt-1">With streak bonus</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B1220] border-t border-[#2a3542] px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[#F7F6F2]/50 text-sm">
            StreakIn - Sports Academy Check-in System
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="text-[#F7F6F2]/50 hover:text-[#F7F6F2] text-sm transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
