// frontend/src/pages/adminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Plus, CheckCircle2, AlertCircle, Loader2, LogOut } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Status Banner State
  const [status, setStatus] = useState({ type: "", message: "" });

  const token = localStorage.getItem("adminToken");
  
  useEffect(() => {
    if (!token) navigate("/admin-login");
  }, [token, navigate]);

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 4000);
  };

  const addProf = async (e) => {
    e.preventDefault();
    if (!email || !email.toLowerCase().endsWith("@iitk.ac.in")) {
      return showStatus("error", "Professor email must end with @iitk.ac.in");
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/add-professor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || data.msg || "Failed to add professor.");
      
      showStatus("success", `${email} has been authorized.`);
      setEmail("");
      setName("");
    } catch (err) {
      showStatus("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {/* Top Nav */}
      <div className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center px-8">
        <div className="flex items-center gap-2 font-black text-xl">
          <ShieldCheck className="text-indigo-400" /> Admin Console
        </div>
        <button 
          onClick={() => { localStorage.removeItem("adminToken"); navigate("/admin-login"); }}
          className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="p-8 max-w-4xl mx-auto mt-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="mb-8 border-b border-slate-100 pb-6">
            <h2 className="text-2xl font-extrabold">Professor Directory Control</h2>
            <p className="text-slate-500 font-medium mt-1">
              Authorize faculty emails. Only emails added to this list can register as a Professor.
            </p>
          </div>

          {status.message && (
            <div className={`flex items-center gap-2 p-4 rounded-xl font-bold text-sm mb-6 animate-in fade-in slide-in-from-top-2 ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
              {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              {status.message}
            </div>
          )}

          <form onSubmit={addProf} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                placeholder="faculty@iitk.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name (Optional)</label>
              <input
                type="text"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                placeholder="Dr. Example"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="sm:w-32 flex items-end">
              <button disabled={loading} className="w-full h-[52px] bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Add</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}