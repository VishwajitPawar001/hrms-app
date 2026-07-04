import React, { useState } from 'react';
import API from '../api/axiosInstance';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    phone: '',
    address: ''
  });
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setMessage(null);

    const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password } 
      : formData;

    try {
      const response = await API.post(endpoint, payload);
      
      if (isLogin) {
        localStorage.setItem('token', response.data.token);
        // Cache user details to populate the dashboard context
        localStorage.setItem('emp_name', response.data.user?.name || 'Personnel');
        localStorage.setItem('emp_role', response.data.user?.role || 'Employee');
        
        setMessage({ text: 'Access authorized. Initializing portal management...', isError: false });
        window.location.reload(); 
      } else {
        setMessage({ text: 'Profile provisioned successfully. You may proceed to authenticate.', isError: false });
        setIsLogin(true);
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const errorMsg = axiosError.response?.data?.error || 'Authentication rejected. Verify matching credentials.';
      setMessage({ text: errorMsg, isError: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main px-4 sm:px-6 lg:px-8 text-zinc-100 animate-fade-in">
      <div className="max-w-md w-full space-y-8 bg-bg-card p-10 rounded-xl shadow-[0_0_50px_rgba(212,175,55,0.05)] border border-zinc-900 transition-all duration-300 transform animate-slide-up">
        <div className="text-center">
          <h2 className="text-3xl font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-brand-accent to-brand-primary">
            {isLogin ? 'HRMS PORTAL' : 'CREATE ACCOUNT'}
          </h2>
          <p className="mt-3 text-[10px] tracking-widest text-zinc-600 uppercase">
            {isLogin ? "Corporate Entry / " : "Registration Pipeline / "}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setMessage(null); }}
              className="text-brand-primary hover:text-brand-accent underline transition duration-200 cursor-pointer font-medium lowercase tracking-normal px-1"
            >
              {isLogin ? 'register profile' : 'access terminal'}
            </button>
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded text-xs tracking-wide font-medium border transition-all duration-300 animate-fade-in ${
            message.isError 
              ? 'bg-status-danger/5 text-status-danger border-status-danger/20' 
              : 'bg-brand-primary/5 text-brand-accent border-brand-primary/20'
          }`}>
            {message.text}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Employee ID</label>
                <input
                  name="employeeId"
                  type="text"
                  required
                  placeholder="EMP1001"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="mt-1.5 w-full px-3 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-primary text-sm transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1.5 w-full px-3 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-primary text-sm transition-all duration-200"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Email Address</label>
            <input
              name="email"
              type="email"
              required
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1.5 w-full px-4 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-primary text-sm transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1.5 w-full px-4 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-primary text-sm transition-all duration-200"
            />
          </div>

          {!isLogin && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">System Assignment</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="mt-1.5 w-full px-3 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-400 focus:outline-none focus:border-brand-primary text-sm transition-all duration-200"
                >
                  <option value="Employee">Standard Personnel</option>
                  <option value="HR">HR Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Contact Number</label>
                <input
                  name="phone"
                  type="text"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1.5 w-full px-4 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-primary text-sm transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Location Address</label>
                <input
                  name="address"
                  type="text"
                  placeholder="City, State"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1.5 w-full px-4 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-brand-primary text-sm transition-all duration-200"
                />
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 px-4 border border-brand-primary bg-gradient-to-r from-brand-accent to-brand-primary text-black font-bold tracking-widest text-xs uppercase hover:brightness-110 active:scale-[0.99] transition-all duration-150 focus:outline-none cursor-pointer rounded shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
            >
              {isLogin ? 'Verify Credentials' : 'Provision Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};