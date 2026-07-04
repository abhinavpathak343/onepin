'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import heroPromo from '../../../94f3cb13-8e67-4fa3-b938-5ae629f438be.png';
import sportPromo from '../../../b06063a7-05e0-477f-9f7b-d2dc5491cc0b.png';

const WINDOW_SECONDS = 15;

interface AcademyData {
  _id: string;
  name: string;
  bannerText: string;
  bannerColor: string;
}

export default function KioskPage() {
  const params = useParams();
  const academyId = params.academyId as string;

  const [academy, setAcademy] = useState<AcademyData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [windowProgress, setWindowProgress] = useState(1);
  const [timeLeft, setTimeLeft] = useState(WINDOW_SECONDS);
  const [now, setNow] = useState(new Date());
  const [activeSlide, setActiveSlide] = useState(0);

  const fetchAcademy = useCallback(async () => {
    try {
      const res = await fetch(`/api/academy/${academyId}`);
      if (res.ok) {
        const data = await res.json();
        setAcademy(data);
      }
    } catch (error) {
      console.error('Failed to fetch academy:', error);
    }
  }, [academyId]);

  const generateQR = useCallback(async () => {
    try {
      const res = await fetch(`/api/qr/${academyId}`);
      if (res.ok) {
        const data = await res.json();
        const qrString = JSON.stringify({
          academyId: data.academyId,
          token: data.token,
          window: data.window,
          expiresAt: data.expiresAt,
        });
        const dataUrl = await QRCode.toDataURL(qrString, {
          width: 400,
          margin: 2,
          color: {
            dark: '#111111',
            light: '#FFFDF7',
          },
        });
        setQrDataUrl(dataUrl);
      }
    } catch (error) {
      console.error('Failed to generate QR:', error);
    }
  }, [academyId]);

  useEffect(() => {
    fetchAcademy();
  }, [fetchAcademy]);

  useEffect(() => {
    generateQR();
    const qrInterval = setInterval(generateQR, WINDOW_SECONDS * 1000);
    return () => clearInterval(qrInterval);
  }, [generateQR]);

  useEffect(() => {
    const updateProgress = () => {
      const current = new Date();
      const windowStart = Math.floor(current.getTime() / 1000 / WINDOW_SECONDS) * WINDOW_SECONDS * 1000;
      const elapsed = (current.getTime() - windowStart) / 1000;
      const progress = 1 - (elapsed % WINDOW_SECONDS) / WINDOW_SECONDS;
      const remaining = Math.ceil(WINDOW_SECONDS - (elapsed % WINDOW_SECONDS));

      setNow(current);
      setWindowProgress(progress);
      setTimeLeft(remaining);
    };

    updateProgress();
    const timer = setInterval(updateProgress, 250);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % 2);
    }, 4500);

    return () => clearInterval(slideTimer);
  }, []);

  const ringDegrees = windowProgress * 360;
  const slides = [
    {
      image: heroPromo,
      eyebrow: 'Introducing',
      title: academy?.name || 'Momentum Sports Academy',
      description: academy?.bannerText || 'Build your streak! Check in daily for rewards.',
      accent: '#e8bc82',
      cta: 'Scan & Check In',
    },
    {
      image: sportPromo,
      eyebrow: 'Partner Highlight',
      title: 'Flat 10% Cashback',
      description: 'Feature sponsor promotions, reward drops, and academy event offers in a rotating hero banner.',
      accent: '#d0fb20',
      cta: 'Rewards In Motion',
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#111111] text-white">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4a120f_0%,#20110e_32%,#111111_68%)] p-3 md:p-5">
        {academy ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto flex min-h-[calc(100vh-24px)] w-full max-w-[1180px] flex-col gap-3 rounded-[30px] border border-white/10 bg-black/30 p-3 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-sm md:min-h-[calc(100vh-40px)] md:gap-4 md:p-4"
          >
            <div className="flex items-center justify-between rounded-[20px] bg-black/65 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85 md:px-5">
              <div>{format(now, 'hh:mm a')}</div>
              <div className="hidden text-white/60 md:block">Live Check-In Display</div>
              <div>{format(now, 'dd MMM yyyy')}</div>
            </div>

            <div className="grid flex-1 gap-3 md:grid-cols-[1.25fr_0.75fr] md:gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05, duration: 0.45 }}
                className="relative min-h-[300px] overflow-hidden rounded-[28px] border border-white/10 bg-[#1c0d0b] md:min-h-[420px]"
              >
                {slides.map((slide, index) => (
                  <motion.div
                    key={slide.title}
                    initial={false}
                    animate={{
                      opacity: activeSlide === index ? 1 : 0,
                      scale: activeSlide === index ? 1 : 1.02,
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                    style={{ pointerEvents: activeSlide === index ? 'auto' : 'none' }}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      priority={index === 0}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/28 to-black/35" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.10),rgba(0,0,0,0.42))]" />
                    <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <div className="max-w-[58%]">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-white/78 md:text-xs">
                            {slide.eyebrow}
                          </p>
                          <h1 className="mt-3 font-display text-3xl font-bold leading-[0.95] text-white md:text-5xl">
                            {slide.title}
                          </h1>
                          <p className="mt-3 max-w-md text-sm text-white/82 md:text-base">
                            {slide.description}
                          </p>
                        </div>
                        <div
                          className="rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]"
                          style={{
                            borderColor: `${slide.accent}88`,
                            backgroundColor: `${slide.accent}22`,
                            color: slide.accent,
                          }}
                        >
                          Live
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div
                          className="rounded-[18px] px-6 py-3 text-lg font-bold shadow-[0_14px_30px_rgba(0,0,0,0.28)]"
                          style={{ backgroundColor: slide.accent, color: '#24140f' }}
                        >
                          {slide.cta}
                        </div>
                        <div className="text-right text-xs uppercase tracking-[0.28em] text-white/72">
                          <div>{index === 0 ? 'Daily streak rewards' : 'Partner campaigns'}</div>
                          <div className="mt-1 text-xl font-bold tracking-[0.18em] text-white">
                            {index === 0 ? 'Full Flow Demo' : 'On Screen Now'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.title}
                      type="button"
                      aria-label={`Show slide ${index + 1}`}
                      onClick={() => setActiveSlide(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        activeSlide === index ? 'w-8 bg-white' : 'w-2.5 bg-white/45'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
                className="grid gap-3 md:gap-4"
              >
                <div className="rounded-[28px] border border-white/10 bg-[#f7f1e6] p-4 text-[#151515] shadow-[0_20px_55px_rgba(0,0,0,0.28)]">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-black/45">
                        Scan Here
                      </p>
                      <h2 className="mt-1 font-display text-2xl font-bold">Instant Check-In</h2>
                    </div>
                    <div className="rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white">
                      {timeLeft}s
                    </div>
                  </div>

                  <div className="flex flex-col items-center rounded-[24px] bg-white p-4 shadow-inner">
                    <div
                      className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                      style={{
                        background: `conic-gradient(${academy.bannerColor} ${ringDegrees}deg, rgba(17,17,17,0.08) 0deg)`,
                      }}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-bold text-[#151515]">
                        {timeLeft}
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-black/10 bg-[#fffdf7] p-3 shadow-sm">
                      {qrDataUrl && (
                        <img
                          src={qrDataUrl}
                          alt="Check-in QR Code"
                          className="h-[220px] w-[220px] md:h-[250px] md:w-[250px]"
                        />
                      )}
                    </div>

                    <div className="mt-4 text-center">
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-black/50">
                        Open camera and scan
                      </p>
                      <p className="mt-2 text-sm text-black/65">
                        New code auto-refreshes every {WINDOW_SECONDS} seconds.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,#1f1f1f,#0e0e0e)] p-5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-white/55">
                    How It Works
                  </p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-[20px] bg-white/5 p-4">
                      <div className="text-2xl font-bold text-[#ffb238]">1</div>
                      <div className="mt-2 text-sm font-semibold">Open Camera</div>
                      <div className="mt-1 text-sm text-white/65">Use your phone camera or scanner app.</div>
                    </div>
                    <div className="rounded-[20px] bg-white/5 p-4">
                      <div className="text-2xl font-bold text-[#ffb238]">2</div>
                      <div className="mt-2 text-sm font-semibold">Scan QR</div>
                      <div className="mt-1 text-sm text-white/65">The code refreshes every 15 seconds automatically.</div>
                    </div>
                    <div className="rounded-[20px] bg-white/5 p-4">
                      <div className="text-2xl font-bold text-[#ffb238]">3</div>
                      <div className="mt-2 text-sm font-semibold">Earn Rewards</div>
                      <div className="mt-1 text-sm text-white/65">Build streaks and unlock milestone offers.</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex min-h-screen items-center justify-center text-xl text-white/60"
          >
            Loading kiosk...
          </motion.div>
        )}
      </div>
    </div>
  );
}
