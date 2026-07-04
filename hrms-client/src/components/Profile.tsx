import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axiosInstance';

interface ProfileData {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  role: 'Employee' | 'HR';
  phone?: string;
  address?: string;
  panNo?: string;
  uanNo?: string;
  dateOfJoining?: string;
}

interface ProfileProps {
  employeeId?: string;
  onProfileUpdated?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ employeeId, onProfileUpdated }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    panNo: '',
    uanNo: '',
    role: 'Employee'
  });
  const [myRole, setMyRole] = useState<string>('Employee');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const role = localStorage.getItem('emp_role') || 'Employee';
    setMyRole(role);
  }, []);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const endpoint = employeeId ? `/api/profile/${employeeId}` : '/api/profile/me';
      const response = await API.get(endpoint);
      const data = response.data?.profile || response.data;
      if (data) {
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          panNo: data.panNo || '',
          uanNo: data.uanNo || '',
          role: data.role || 'Employee'
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setMessage({ text: error.response?.data?.error || 'Failed to load profile details.', isError: true });
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const targetId = employeeId || 'me';
      const payload = myRole === 'HR' 
        ? formData 
        : { phone: formData.phone, address: formData.address };

      const response = await API.put(`/api/profile/${targetId}`, payload);
      setMessage({ text: 'Profile updated successfully.', isError: false });
      
      if (!employeeId) {
        if (response.data?.profile?.name) {
          localStorage.setItem('emp_name', response.data.profile.name);
        }
        if (response.data?.profile?.role) {
          localStorage.setItem('emp_role', response.data.profile.role);
        }
      }

      if (onProfileUpdated) {
        onProfileUpdated();
      }
      
      setProfile(response.data?.profile || response.data);
    } catch (error: any) {
      setMessage({ text: error.response?.data?.error || 'Failed to update profile.', isError: true });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 text-center text-zinc-500 font-sans">
        <p className="text-xs uppercase tracking-widest animate-pulse">Syncing profile database record...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 text-center text-zinc-500 font-sans">
        <p className="text-xs uppercase tracking-widest text-status-danger">Profile record not found.</p>
      </div>
    );
  }

  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(' ');
    const f = parts[0]?.substring(0, 1) || '';
    const l = parts[1]?.substring(0, 1) || '';
    return `${f}${l}`.toUpperCase();
  };

  const joinDate = profile.dateOfJoining 
    ? new Date(profile.dateOfJoining).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 space-y-6 shadow-lg animate-slide-up">
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-zinc-900">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-hover to-brand-primary text-black font-black text-2xl flex items-center justify-center tracking-widest shadow-md">
          {getInitials(profile.name)}
        </div>
        <div className="text-center md:text-left space-y-1">
          <h3 className="text-xl font-bold text-zinc-200">{profile.name}</h3>
          <p className="text-[10px] tracking-widest text-brand-primary uppercase font-bold">{profile.role} • {profile.employeeId}</p>
          <p className="text-xs text-zinc-500">{profile.email}</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded text-xs font-sans font-medium border transition-all duration-300 ${
          message.isError ? 'bg-status-danger/5 text-status-danger border-status-danger/20' : 'bg-brand-primary/5 text-brand-accent border-brand-primary/20'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 font-sans text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-500 mb-1.5 uppercase tracking-wider font-bold text-[10px]">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={myRole !== 'HR'}
              className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-300 focus:border-brand-primary outline-none transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-zinc-500 mb-1.5 uppercase tracking-wider font-bold text-[10px]">Email Address</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-500 outline-none opacity-40 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-zinc-500 mb-1.5 uppercase tracking-wider font-bold text-[10px]">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-300 focus:border-brand-primary outline-none transition"
            />
          </div>

          <div>
            <label className="block text-zinc-500 mb-1.5 uppercase tracking-wider font-bold text-[10px]">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="City, State"
              className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-300 focus:border-brand-primary outline-none transition"
            />
          </div>

          <div>
            <label className="block text-zinc-500 mb-1.5 uppercase tracking-wider font-bold text-[10px]">PAN Card Number</label>
            <input
              type="text"
              name="panNo"
              value={formData.panNo}
              onChange={handleInputChange}
              disabled={myRole !== 'HR'}
              placeholder="ABCDE1234F"
              className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-300 focus:border-brand-primary outline-none transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-zinc-500 mb-1.5 uppercase tracking-wider font-bold text-[10px]">UAN Number</label>
            <input
              type="text"
              name="uanNo"
              value={formData.uanNo}
              onChange={handleInputChange}
              disabled={myRole !== 'HR'}
              placeholder="100XXXXXXXXX"
              className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-300 focus:border-brand-primary outline-none transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-zinc-500 mb-1.5 uppercase tracking-wider font-bold text-[10px]">Joining Date</label>
            <input
              type="text"
              value={joinDate}
              disabled
              className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-500 outline-none opacity-40 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-zinc-500 mb-1.5 uppercase tracking-wider font-bold text-[10px]">Organization Role</label>
            {myRole === 'HR' ? (
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-300 focus:border-brand-primary outline-none transition"
              >
                <option value="Employee">Employee</option>
                <option value="HR">HR Admin</option>
              </select>
            ) : (
              <input
                type="text"
                value={profile.role}
                disabled
                className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-500 outline-none opacity-40 cursor-not-allowed"
              />
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-3.5 border border-brand-primary text-black bg-gradient-to-r from-brand-accent to-brand-primary font-bold tracking-widest uppercase rounded hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
