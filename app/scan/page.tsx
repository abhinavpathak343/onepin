'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Gift, Zap, Target, Trophy, ShieldAlert, LockKeyhole } from 'lucide-react';

type Step = 'login' | 'scanning' | 'result';
type ScannerState = 'idle' | 'requesting-permission' | 'permission-denied' | 'ready' | 'error';

const SCAN_DEMO_USERNAME = 'abhinav';
const SCAN_DEMO_PASSWORD = 'onepin';
const SCAN_DEMO_PHONE = '9548625856';
const SCAN_DEMO_NAME = 'Abhinav';
const SCAN_LOGIN_STORAGE_KEY = 'scan-demo-authenticated';

interface QRData {
  academyId: string;
  token: string;
  window: number;
  expiresAt: number;
}

interface CheckInResult {
  success: boolean;
  alreadyCheckedIn?: boolean;
  needName?: boolean;
  message?: string;
  error?: string;
  student?: {
    name: string;
    points: number;
    currentStreak: number;
    longestStreak: number;
    pointsEarned?: number;
    streakBonus?: number;
  };
  newCoupons?: { code: string; rewardDescription: string }[];
  academy?: { name: string };
}

export default function ScanPage() {
  const searchParams = useSearchParams();
  const prefillAcademyId = searchParams?.get('academyId');

  const [step, setStep] = useState<Step>('login');
  const [scannerState, setScannerState] = useState<ScannerState>('idle');
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerInitializedRef = useRef(false);

  const cleanupScanner = useCallback(() => {
    if (scannerRef.current) {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      scanner.stop().catch(() => {}).finally(() => {
        scanner.clear();
      });
    }
    scannerInitializedRef.current = false;
  }, []);

  const submitCheckIn = useCallback(async (payload: QRData) => {
    setChecking(true);
    setError(null);

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrData: payload,
          phone: SCAN_DEMO_PHONE,
          name: SCAN_DEMO_NAME,
        }),
      });

      const data = await res.json();
      setResult(data);

      if (data.success) {
        setStep('result');
      } else if (data.error) {
        setError(data.error);
        setStep('result');
      }
    } catch (err) {
      setError('Check-in failed. Please try again.');
      setStep('result');
    } finally {
      setChecking(false);
    }
  }, []);

  const handleScanSuccess = useCallback((decodedText: string) => {
    try {
      const data: QRData = JSON.parse(decodedText);
      setQrData(data);
      cleanupScanner();
      void submitCheckIn(data);
    } catch (e) {
      setError('Invalid QR code. Please scan the kiosk screen.');
    }
  }, [cleanupScanner, submitCheckIn]);

  const initializeScanner = useCallback(async () => {
    if (scannerInitializedRef.current) return;

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      scannerInitializedRef.current = true;

      const cameras = await Html5Qrcode.getCameras();
      const preferredCamera =
        cameras.find((camera) => /back|rear|environment/i.test(camera.label)) ||
        cameras[0];

      if (!preferredCamera) {
        throw new Error('No camera found on this device.');
      }

      await scanner.start(
        preferredCamera.id,
        {
        fps: 10,
        qrbox: { width: 280, height: 280 },
          aspectRatio: 1,
        },
        handleScanSuccess,
        (errorMessage: string) => {
          if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission denied')) {
            setScannerState('permission-denied');
            setScannerError('Camera permission was denied. Please allow access in your browser settings.');
            cleanupScanner();
          } else if (errorMessage.includes('No camera found')) {
            setScannerState('error');
            setScannerError('No camera found on this device.');
          }
        }
      );

      setScannerState('ready');
      setScannerError(null);
    } catch (err) {
      console.error('Scanner error:', err);
      scannerInitializedRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      const message = err instanceof Error ? err.message : 'Unable to start the QR scanner on this device.';
      setScannerState('error');
      setScannerError(message);
    }
  }, [cleanupScanner, handleScanSuccess]);

  const requestCameraAccess = useCallback(async () => {
    setScannerState('requesting-permission');
    setScannerError(null);

    try {
      if (!window.isSecureContext) {
        throw new Error('Camera access requires a secure context. Open this on localhost or HTTPS.');
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('This browser does not support camera access.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      });

      stream.getTracks().forEach((track) => track.stop());
      await initializeScanner();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to access camera.';
      const denied =
        message.includes('denied') ||
        message.includes('NotAllowedError') ||
        message.includes('Permission');

      setScannerState(denied ? 'permission-denied' : 'error');
      setScannerError(message);
      cleanupScanner();
    }
  }, [cleanupScanner, initializeScanner]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const authenticated = window.sessionStorage.getItem(SCAN_LOGIN_STORAGE_KEY) === 'true';
    setStep(authenticated ? 'scanning' : 'login');
  }, []);

  useEffect(() => {
    if (prefillAcademyId) {
      setError(null);
    }

    return () => {
      cleanupScanner();
    };
  }, [cleanupScanner, prefillAcademyId]);

  useEffect(() => {
    if (step !== 'scanning') {
      cleanupScanner();
    }
  }, [cleanupScanner, step]);

  const handleLogin = () => {
    if (username.trim() !== SCAN_DEMO_USERNAME || password !== SCAN_DEMO_PASSWORD) {
      setError('Invalid credentials. Use the demo scan login provided.');
      return;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(SCAN_LOGIN_STORAGE_KEY, 'true');
    }

    setError(null);
    setUsername('');
    setPassword('');
    setResult(null);
    setStep('scanning');
  };

  const renderScanning = () => (
    <div className="min-h-screen bg-[#0B1220] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <Camera className="w-12 h-12 text-[#FF6B35] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#F7F6F2] mb-2 font-['Space_Grotesk',sans-serif]">
          Check In
        </h1>
        <p className="text-[#F7F6F2]/60 text-sm">
          Point your camera at the kiosk QR code
        </p>
      </motion.div>

      {checking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-5 w-full max-w-sm rounded-2xl border border-[#2a3542] bg-[#1a2332] p-4 text-center"
        >
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#FF6B35]/25 border-t-[#FF6B35]" />
          <p className="text-sm text-[#F7F6F2]/75">Processing your check-in...</p>
        </motion.div>
      )}

      {scannerState === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#1a2332] border border-[#2a3542] rounded-2xl p-6 max-w-sm w-full text-center"
        >
          <Camera className="w-10 h-10 text-[#FF6B35] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#F7F6F2] mb-2">
            Enable Camera
          </h2>
          <p className="text-[#F7F6F2]/70 text-sm mb-5">
            Tap below to allow camera access and start scanning the kiosk QR code.
          </p>
          <button
            onClick={requestCameraAccess}
            className="bg-[#FF6B35] text-white px-6 py-3 rounded-full font-medium"
          >
            Allow Camera Access
          </button>
        </motion.div>
      )}

      <div className="relative w-full max-w-sm">
        <div
          id="qr-reader"
          className={`overflow-hidden rounded-2xl border border-[#2a3542] bg-black/25 shadow-2xl ${
            scannerState === 'idle' || scannerState === 'permission-denied' || scannerState === 'error'
              ? 'hidden'
              : 'block'
          } [&_video]:h-full [&_video]:w-full [&_video]:object-cover [&>div]:[border-radius:1rem!important]`}
          style={{ minHeight: 360 }}
        />

        {scannerState === 'requesting-permission' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[#1a2332]/78 p-6 text-center backdrop-blur-sm"
          >
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#FF6B35]/25 border-t-[#FF6B35]" />
            <h2 className="text-lg font-semibold text-[#F7F6F2] mb-2">
              Waiting For Permission
            </h2>
            <p className="text-[#F7F6F2]/70 text-sm">
              Approve the browser prompt to continue.
            </p>
          </motion.div>
        )}

        {scannerState === 'ready' && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
            <div className="rounded-full bg-black/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#F7F6F2]/85 backdrop-blur-sm">
              Live Camera
            </div>
          </div>
        )}
      </div>

      {scannerState === 'permission-denied' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-2xl p-6 max-w-sm w-full text-center"
        >
          <ShieldAlert className="w-10 h-10 text-[#FF6B35] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#F7F6F2] mb-2">
            Camera Access Required
          </h2>
          <p className="text-[#F7F6F2]/70 text-sm mb-4">
            {scannerError || 'To scan the check-in code, we need access to your camera. Please enable camera permissions and try again.'}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={requestCameraAccess}
              className="bg-[#FF6B35] text-white px-6 py-3 rounded-full font-medium"
            >
              Try Again
            </button>
            <p className="text-xs text-[#F7F6F2]/55">
              If you blocked it earlier, unlock camera access from the browser site settings first.
            </p>
          </div>
        </motion.div>
      )}

      {scannerState === 'error' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-2xl p-6 max-w-sm w-full text-center"
        >
          <p className="text-[#F7F6F2]">{scannerError || 'Unable to access camera'}</p>
          <button
            onClick={requestCameraAccess}
            className="mt-4 bg-[#FF6B35] text-white px-6 py-3 rounded-full font-medium"
          >
            Retry Camera
          </button>
        </motion.div>
      )}
    </div>
  );

  const renderLogin = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#0B1220] flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#121927] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6B35]/12">
            <LockKeyhole className="h-7 w-7 text-[#FF6B35]" />
          </div>
          <h1 className="text-2xl font-bold text-[#F7F6F2] font-['Space_Grotesk',sans-serif]">
            Scan Login
          </h1>
          <p className="mt-2 text-sm text-[#F7F6F2]/60">
            Sign in before opening the academy scanner flow.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-4 mb-4 text-center"
          >
            <p className="text-[#ef4444] text-sm">{error}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full bg-[#1a2332] border border-[#2a3542] rounded-xl px-4 py-4 text-base text-center text-[#F7F6F2] placeholder-[#F7F6F2]/40 focus:outline-none focus:border-[#FF6B35] transition-colors"
            autoFocus
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-[#1a2332] border border-[#2a3542] rounded-xl px-4 py-4 text-base text-center text-[#F7F6F2] placeholder-[#F7F6F2]/40 focus:outline-none focus:border-[#FF6B35] transition-colors"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={!username || !password}
            className="w-full bg-[#FF6B35] disabled:bg-[#FF6B35]/50 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Continue To Scan
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  const renderResult = () => {
    if (!result || !result.success) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-[#0B1220] flex flex-col items-center justify-center p-6"
        >
          <div className="text-center">
            <p className="text-[#ef4444] text-lg">{result?.error || error || 'Check-in failed'}</p>
            <button
              onClick={() => {
                setQrData(null);
                setResult(null);
                setError(null);
                setStep('scanning');
              }}
              className="mt-4 bg-[#FF6B35] text-white px-6 py-2 rounded-full font-medium"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      );
    }

    const { student, newCoupons, academy } = result;
    const { alreadyCheckedIn } = result;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#0B1220] flex flex-col items-center justify-center p-6"
      >
        <div className="w-full max-w-sm text-center">
          {alreadyCheckedIn ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-[#FFB238]/20 flex items-center justify-center mx-auto">
                  <Zap className="w-12 h-12 text-[#FFB238]" />
                </div>
              </motion.div>
              <h1 className="text-2xl font-bold text-[#F7F6F2] mb-2 font-['Space_Grotesk',sans-serif]">
                Already Checked In!
              </h1>
              <p className="text-[#F7F6F2]/70 mb-6">
                {student?.name}, you've already checked in today.
              </p>
            </>
          ) : (
            <>
              {/* Streak Ring */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="relative w-48 h-48 mx-auto mb-6"
              >
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#1a2332"
                    strokeWidth="12"
                  />
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#FF6B35"
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 2 * Math.PI * 90 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - Math.min(student?.currentStreak || 1, 7) / 7) }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ strokeDasharray: 2 * Math.PI * 90 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="text-5xl font-bold text-[#FF6B35] font-['Space_Grotesk',sans-serif]"
                  >
                    {student?.currentStreak}
                  </motion.span>
                  <span className="text-[#F7F6F2]/60 text-sm">day streak</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-[#F7F6F2] mb-1 font-['Space_Grotesk',sans-serif]"
              >
                Nice work, {student?.name}!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[#F7F6F2]/70 mb-6"
              >
                {academy?.name}
              </motion.p>

              {/* Points earned */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB238]/10 rounded-2xl p-4 mb-4"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Target className="w-5 h-5 text-[#FFB238]" />
                  <span className="text-3xl font-bold text-[#FFB238] font-['Space_Grotesk',sans-serif]">
                    +{student?.pointsEarned}
                  </span>
                </div>
                <p className="text-[#F7F6F2]/60 text-sm">
                  {student?.streakBonus ? `Includes ${student.streakBonus} streak bonus!` : 'Points earned'}
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-3 mb-6"
              >
                <div className="bg-[#1a2332] rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-[#F7F6F2] font-['Space_Grotesk',sans-serif]">
                    {student?.points}
                  </p>
                  <p className="text-[#F7F6F2]/50 text-xs">Total Points</p>
                </div>
                <div className="bg-[#1a2332] rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Trophy className="w-4 h-4 text-[#22C55E]" />
                    <p className="text-2xl font-bold text-[#22C55E] font-['Space_Grotesk',sans-serif]">
                      {student?.longestStreak}
                    </p>
                  </div>
                  <p className="text-[#F7F6F2]/50 text-xs">Best Streak</p>
                </div>
              </motion.div>

              {/* New coupons */}
              {newCoupons && newCoupons.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3 mb-6"
                >
                  <div className="flex items-center justify-center gap-2 text-[#22C55E]">
                    <Gift className="w-5 h-5" />
                    <span className="font-semibold">New Reward Unlocked!</span>
                  </div>
                  {newCoupons.map((coupon, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-r from-[#22C55E]/10 to-[#22C55E]/5 border border-[#22C55E]/30 rounded-xl p-4"
                    >
                      <p className="text-[#22C55E] font-bold text-lg mb-1">{coupon.code}</p>
                      <p className="text-[#F7F6F2]/70 text-sm">{coupon.rewardDescription}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </>
          )}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setQrData(null);
              setResult(null);
              setError(null);
              setStep('scanning');
            }}
            className="w-full bg-[#1a2332] text-[#F7F6F2] py-3 rounded-xl font-medium"
          >
            Scan Another
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'login' && <div key="login">{renderLogin()}</div>}
      {step === 'scanning' && <div key="scanning">{renderScanning()}</div>}
      {step === 'result' && <div key="result">{renderResult()}</div>}
    </AnimatePresence>
  );
}
