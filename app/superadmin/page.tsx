'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signOut } from 'next-auth/react';
import {
  Building2,
  Users,
  Calendar,
  Gift,
  Plus,
  Link,
  ExternalLink,
  Trophy,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

interface SuperadminData {
  stats: {
    totalAcademies: number;
    totalAdmins: number;
    totalCheckIns: number;
    totalCoupons: number;
    totalStudents: number;
  };
  academies: {
    _id: string;
    name: string;
    bannerText: string;
    bannerColor: string;
    checkIns: number;
  }[];
  admins: {
    _id: string;
    username: string;
    role: string;
    academyName: string | null;
    createdAt: string;
  }[];
}

export default function SuperadminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SuperadminData | null>(null);

  // New academy form
  const [newAcademyName, setNewAcademyName] = useState('');
  const [addingAcademy, setAddingAcademy] = useState(false);

  // New admin form
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminAcademyId, setNewAdminAcademyId] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/superadmin');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAcademy = async () => {
    if (!newAcademyName.trim()) {
      toast.error('Please enter an academy name');
      return;
    }

    setAddingAcademy(true);
    try {
      const res = await fetch('/api/superadmin/academies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAcademyName }),
      });

      if (res.ok) {
        toast.success('Academy created!');
        const json = await res.json();
        setData(prev => prev ? {
          ...prev,
          academies: [...prev.academies, { ...json.academy, checkIns: 0 }],
          stats: { ...prev.stats, totalAcademies: prev.stats.totalAcademies + 1 }
        } : null);
        setNewAcademyName('');
        fetchDashboard();
      } else {
        const json = await res.json();
        toast.error(json.error || 'Failed to create academy');
      }
    } catch (err) {
      toast.error('Failed to create academy');
    } finally {
      setAddingAcademy(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminUsername.trim() || !newAdminPassword.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setAddingAdmin(true);
    try {
      const res = await fetch('/api/superadmin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newAdminUsername,
          password: newAdminPassword,
          academyId: newAdminAcademyId || undefined,
        }),
      });

      if (res.ok) {
        toast.success('Admin created!');
        setNewAdminUsername('');
        setNewAdminPassword('');
        setNewAdminAcademyId('');
        fetchDashboard();
      } else {
        const json = await res.json();
        toast.error(json.error || 'Failed to create admin');
      }
    } catch (err) {
      toast.error('Failed to create admin');
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-[#12151A]/50"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#12151A]/70">Unable to load dashboard</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 text-[#FF6B35] underline"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      {/* Header */}
      <header className="bg-[#0B1220] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#F7F6F2] font-['Space_Grotesk',sans-serif]">
              StreakIn
            </h1>
            <p className="text-[#F7F6F2]/60 text-sm">Superadmin Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#F7F6F2]/70 hover:text-[#F7F6F2] text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <Building2 className="w-5 h-5 text-[#FF6B35] mb-2" />
            <p className="text-2xl font-bold text-[#12151A] font-['Space_Grotesk',sans-serif]">
              {data.stats.totalAcademies}
            </p>
            <p className="text-[#12151A]/60 text-sm">Academies</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <Users className="w-5 h-5 text-[#FFB238] mb-2" />
            <p className="text-2xl font-bold text-[#12151A] font-['Space_Grotesk',sans-serif]">
              {data.stats.totalAdmins}
            </p>
            <p className="text-[#12151A]/60 text-sm">Admins</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <Calendar className="w-5 h-5 text-[#22C55E] mb-2" />
            <p className="text-2xl font-bold text-[#12151A] font-['Space_Grotesk',sans-serif]">
              {data.stats.totalCheckIns}
            </p>
            <p className="text-[#12151A]/60 text-sm">Total Check-ins</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <Gift className="w-5 h-5 text-[#0B1220] mb-2" />
            <p className="text-2xl font-bold text-[#12151A] font-['Space_Grotesk',sans-serif]">
              {data.stats.totalCoupons}
            </p>
            <p className="text-[#12151A]/60 text-sm">Coupons Issued</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <Trophy className="w-5 h-5 text-[#FF6B35] mb-2" />
            <p className="text-2xl font-bold text-[#12151A] font-['Space_Grotesk',sans-serif]">
              {data.stats.totalStudents}
            </p>
            <p className="text-[#12151A]/60 text-sm">Students</p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Academy */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-[#FF6B35]" />
              <h2 className="text-lg font-semibold text-[#12151A]">Create Academy</h2>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={newAcademyName}
                onChange={(e) => setNewAcademyName(e.target.value)}
                placeholder="Academy name"
                className="w-full bg-[#F7F6F2] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#12151A] focus:outline-none focus:border-[#FF6B35]"
              />
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCreateAcademy}
                disabled={addingAcademy}
                className="w-full bg-[#FF6B35] disabled:bg-[#FF6B35]/50 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {addingAcademy ? 'Creating...' : 'Create Academy'}
              </motion.button>
            </div>
          </motion.div>

          {/* Create Admin */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-[#0B1220]" />
              <h2 className="text-lg font-semibold text-[#12151A]">Create Admin</h2>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={newAdminUsername}
                onChange={(e) => setNewAdminUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-[#F7F6F2] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#12151A] focus:outline-none focus:border-[#FF6B35]"
              />
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#F7F6F2] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#12151A] focus:outline-none focus:border-[#FF6B35]"
              />
              <select
                value={newAdminAcademyId}
                onChange={(e) => setNewAdminAcademyId(e.target.value)}
                className="w-full bg-[#F7F6F2] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#12151A] focus:outline-none focus:border-[#FF6B35]"
              >
                <option value="">Select Academy (optional)</option>
                {data.academies.map((academy) => (
                  <option key={academy._id} value={academy._id}>
                    {academy.name}
                  </option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCreateAdmin}
                disabled={addingAdmin}
                className="w-full bg-[#0B1220] disabled:bg-[#0B1220]/50 text-[#F7F6F2] py-2 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {addingAdmin ? 'Creating...' : 'Create Admin'}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Academies List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-[#12151A]" />
            <h2 className="text-lg font-semibold text-[#12151A]">Academies</h2>
          </div>

          <div className="space-y-3">
            {data.academies.map((academy) => (
              <div
                key={academy._id}
                className="flex items-center justify-between bg-[#F7F6F2] rounded-lg p-4"
              >
                <div>
                  <h3 className="font-semibold text-[#12151A]">{academy.name}</h3>
                  <p className="text-[#12151A]/60 text-sm">{academy.checkIns} check-ins</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/kiosk/${academy._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm bg-[#0B1220] text-[#F7F6F2] px-3 py-1.5 rounded-lg hover:bg-[#1a2332] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Kiosk
                  </a>
                  <a
                    href={`/scan?academyId=${academy._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm bg-[#1a2332] text-[#F7F6F2] px-3 py-1.5 rounded-lg hover:bg-[#2a3542] transition-colors"
                  >
                    <Link className="w-3 h-3" />
                    Scan Link
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Admins List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#12151A]" />
            <h2 className="text-lg font-semibold text-[#12151A]">Admin Accounts</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[#12151A]/60 border-b border-[#E5E5E5]">
                  <th className="pb-3 font-medium">Username</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Academy</th>
                </tr>
              </thead>
              <tbody>
                {data.admins.map((admin) => (
                  <tr key={admin._id} className="border-b border-[#F7F6F2]">
                    <td className="py-3 text-[#12151A]">{admin.username}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        admin.role === 'superadmin'
                          ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                          : 'bg-[#0B1220]/10 text-[#0B1220]'
                      }`}>
                        {admin.role}
                      </span>
                    </td>
                    <td className="py-3 text-[#12151A]/70">
                      {admin.academyName || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
