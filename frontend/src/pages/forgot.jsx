import { useState } from "react";

import { Mail, Lock, ArrowRight } from "lucide-react";

import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Forgot() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: request OTP, 2: reset

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [newPass, setNewPass] = useState("");

  const [sending, setSending] = useState(false);

  const requestOtp = async (e) => {
    e?.preventDefault();

    if (!email) return alert("Enter your IITK email");

    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg || "Error sending OTP");

      alert("OTP sent to your email.");

      setStep(2);
    } catch (err) {
      alert(err.message || "Error");
    } finally {
      setSending(false);
    }
  };

  const resetPassword = async (e) => {
    e?.preventDefault();

    if (!otp || !newPass) return alert("Enter OTP and new password");

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email, otp, newPassword: newPass }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg || "Reset failed");

      alert("Password reset successful. Please login.");

      navigate("/login");
    } catch (err) {
      alert(err.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-2">Forgot password</h2>

        <p className="text-sm text-slate-500 mb-6">
          Enter your IITK email to receive an OTP for resetting your password.
        </p>

        {step === 1 && (
          <form onSubmit={requestOtp} className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase mb-1">
                Email
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="your@iitk.ac.in"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold"
            >
              {sending ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase mb-1">
                OTP
              </label>

              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="6 digit OTP"
                className="w-full pl-3 py-2 border rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase mb-1">
                New password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>

                <input
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  type="password"
                  required
                  placeholder="New password"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2"
              >
                Reset <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border rounded-lg py-2"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
