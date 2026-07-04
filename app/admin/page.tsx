'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { signOut } from 'next-auth/react';
import {
  Users,
  Target,
  Calendar,
  Settings,
  Gift,
  Link,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  Check,
  BarChart3,
  Clock,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface DashboardData {
  academy: {
    _id: string;
    name: string;
    bannerText: string;
    bannerColor: string;
    basePoints: number;
  };
  stats: {
    todayCheckins: number;
    todayUniqueStudents: number;
    totalCheckins: number;
    totalUniqueStudents: number;
  };
  todayCheckins: {
    _id: string;
    studentName: string;
    studentPhone: string;
    timestamp: string;
  }[];
  milestones: {
    _id: string;
    type: 'streak' | 'points';
    threshold: number;
    rewardDescription: string;
  }[];
  recentCheckins: {
    _id: string;
    studentName: string;
    studentPhone: string;
    timestamp: string;
  }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  // Editable fields
  const [bannerText, setBannerText] = useState('');
  const [bannerColor, setBannerColor] = useState('');
  const [basePoints, setBasePoints] = useState(10);

  // New milestone form
  const [newMilestoneType, setNewMilestoneType] = useState<'streak' | 'points'>('streak');
  const [newMilestoneThreshold, setNewMilestoneThreshold] = useState('');
  const [newMilestoneReward, setNewMilestoneReward] = useState('');

  const [saving, setSaving] = useState(false);
  const [addingMilestone, setAddingMilestone] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (data) {
      setBannerText(data.academy.bannerText);
      setBannerColor(data.academy.bannerColor);
      setBasePoints(data.academy.basePoints);
    }
  }, [data]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin');
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

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/academy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academyId: data?.academy._id,
          bannerText,
          bannerColor,
          basePoints,
        }),
      });

      if (res.ok) {
        toast.success('Settings saved!');
        setData(prev => prev ? {
          ...prev,
          academy: { ...prev.academy, bannerText, bannerColor, basePoints }
        } : null);
      } else {
        toast.error('Failed to save settings');
      }
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestoneThreshold || !newMilestoneReward) {
      toast.error('Please fill all fields');
      return;
    }

    setAddingMilestone(true);
    try {
      const res = await fetch('/api/admin/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academyId: data?.academy._id,
          type: newMilestoneType,
          threshold: parseInt(newMilestoneThreshold),
          rewardDescription: newMilestoneReward,
        }),
      });

      if (res.ok) {
        toast.success('Milestone added!');
        const json = await res.json();
        setData(prev => prev ? {
          ...prev,
          milestones: [...prev.milestones, json.milestone]
        } : null);
        setNewMilestoneThreshold('');
        setNewMilestoneReward('');
      } else {
        toast.error('Failed to add milestone');
      }
    } catch (err) {
      toast.error('Failed to add milestone');
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      const res = await fetch(`/api/admin/milestones/${milestoneId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Milestone deleted');
        setData(prev => prev ? {
          ...prev,
          milestones: prev.milestones.filter(m => m._id !== milestoneId)
        } : null);
      } else {
        toast.error('Failed to delete milestone');
      }
    } catch (err) {
      toast.error('Failed to delete milestone');
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
              {data.academy.name}
            </h1>
            <p className="text-[#F7F6F2]/60 text-sm">Admin Dashboard</p>
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
        {/* Links */}
        <div className="flex gap-3">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={`/kiosk/${data.academy._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#0B1220] text-[#F7F6F2] px-4 py-2 rounded-lg text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Open Kiosk
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={`/scan?academyId=${data.academy._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#1a2332] text-[#F7F6F2] px-4 py-2 rounded-lg text-sm"
          >
            <Link className="w-4 h-4" />
            Direct Scan Link
          </motion.a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-[#FF6B35]" />
            </div>
            <p className="text-2xl font-bold text-[#12151A] font-['Space_Grotesk',sans-serif]">
              {data.stats.todayCheckins}
            </p>
            <p className="text-[#12151A]/60 text-sm">Today's Check-ins</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-[#FFB238]" />
            </div>
            <p className="text-2xl font-bold text-[#12151A] font-['Space_Grotesk',sans-serif]">
              {data.stats.todayUniqueStudents}
            </p>
            <p className="text-[#12151A]/60 text-sm">Unique Students Today</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-[#22C55E]" />
            </div>
            <p className="text-2xl font-bold text-[#12151A] font-['Space_Grotesk',sans-serif]">
              {data.stats.totalCheckins}
            </p>
            <p className="text-[#12151A]/60 text-sm">Total Check-ins</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-5 h-5 text-[#0B1220]" />
            </div>
            <p className="text-2xl font-bold text-[#12151A] font-['Space_Grotesk',sans-serif]">
              {data.stats.totalUniqueStudents}
            </p>
            <p className="text-[#12151A]/60 text-sm">Total Students</p>
          </motion.div>
        </div>

        {/* Settings Milestones Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Kiosk Settings */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-[#12151A]" />
              <h2 className="text-lg font-semibold text-[#12151A]">Kiosk Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#12151A]/70 mb-1">
                  Banner Text
                </label>
                <input
                  type="text"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  className="w-full bg-[#F7F6F2] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#12151A] focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#12151A]/70 mb-1">
                  Banner Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={bannerColor}
                    onChange={(e) => setBannerColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-[#E5E5E5] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bannerColor}
                    onChange={(e) => setBannerColor(e.target.value)}
                    className="flex-1 bg-[#F7F6F2] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#12151A] focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#12151A]/70 mb-1">
                  Base Points per Check-in
                </label>
                <input
                  type="number"
                  value={basePoints}
                  onChange={(e) => setBasePoints(parseInt(e.target.value) || 10)}
                  className="w-full bg-[#F7F6F2] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#12151A] focus:outline-none focus:border-[#FF6B35]"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full bg-[#0B1220] disabled:bg-[#0B1220]/50 text-[#F7F6F2] py-2 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {saving ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-[#FF6B35]" />
              <h2 className="text-lg font-semibold text-[#12151A]">Milestones</h2>
            </div>

            {/* Existing milestones */}
            <div className="space-y-2 mb-4">
              {data.milestones.map((milestone) => (
                <div
                  key={milestone._id}
                  className="flex items-center justify-between bg-[#F7F6F2] rounded-lg p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        milestone.type === 'streak'
                          ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                          : 'bg-[#FFB238]/10 text-[#FFB238]'
                      }`}>
                        {milestone.type}
                      </span>
                      <span className="font-semibold text-[#12151A]">
                        {milestone.threshold}
                      </span>
                    </div>
                    <p className="text-[#12151A]/70 text-sm mt-1">
                      {milestone.rewardDescription}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteMilestone(milestone._id)}
                    className="text-[#ef4444]/70 hover:text-[#ef4444] transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new milestone */}
            <div className="border-t border-[#E5E5E5] pt-4">
              <p className="text-sm text-[#12151A]/70 mb-3">Add new milestone</p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    value={newMilestoneType}
                    onChange={(e) => setNewMilestoneType(e.target.value as 'streak' | 'points')}
                    className="bg-[#F7F6F2] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#12151A] focus:outline-none focus:border-[#FF6B35]"
                  >
                    <option value="streak">Streak</option>
                    <option value="points">Points</option>
                  </select>
                  <input
                    type="number"
                    value={newMilestoneThreshold}
                    onChange={(e) => setNewMilestoneThreshold(e.target.value)}
                    placeholder="Threshold"
                    className="flex-1 bg-[#F7F6F2] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#12151A] focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
                <input
                  type="text"
                  value={newMilestoneReward}
                  onChange={(e) => setNewMilestoneReward(e.target.value)}
                  placeholder="Reward description"
                  className="w-full bg-[#F7F6F2] border border-[#E5E5E5] rounded-lg px-3 py-2 text-[#12151A] focus:outline-none focus:border-[#FF6B35]"
                />
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleAddMilestone}
                  disabled={addingMilestone}
                  className="w-full bg-[#FF6B35] disabled:bg-[#FF6B35]/50 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {addingMilestone ? 'Adding...' : 'Add Milestone'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Check-ins */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#12151A]" />
            <h2 className="text-lg font-semibold text-[#12151A]">Recent Check-ins</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[#12151A]/60 border-b border-[#E5E5E5]">
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recentCheckins.map((checkin) => (
                  <tr key={checkin._id} className="border-b border-[#F7F6F2]">
                    <td className="py-3 text-[#12151A]">{checkin.studentName}</td>
                    <td className="py-3 text-[#12151A]/70">{checkin.studentPhone}</td>
                    <td className="py-3 text-[#12151A]/70">
                      {format(new Date(checkin.timestamp), 'MMM d, h:mm a')}
                    </td>
                  </tr>
                ))}
                {data.recentCheckins.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-[#12151A]/50">
                      No check-ins yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
