import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  User,
  BookOpen,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("Student");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg || "Login failed");

      localStorage.setItem("token", data.token);

      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "Professor") navigate("/professor-dashboard");
      else navigate("/student-dashboard");
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600 blur-3xl"></div>

          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-blue-600 blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap size={32} strokeWidth={2.5} />
            </div>

            <span className="text-3xl font-black text-white tracking-tight">
              Campus<span className="text-indigo-400">Connect</span>
            </span>
          </div>

          <div className="space-y-6 max-w-lg mt-20">
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              Empowering the <span className="text-indigo-400">academic</span>{" "}
              community.
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              Join thousands of students and professors collaborating on
              cutting-edge projects, discussing coursework, and shaping the
              future of education.
            </p>
          </div>

          <div className="flex items-center gap-4 mt-auto pt-10">
            <div className="flex -space-x-4">
              <img
                className="w-12 h-12 rounded-full border-4 border-slate-900"
                src="https://ui-avatars.com/api/?name=Alex&background=4f46e5&color=fff"
                alt="User"
              />

              <img
                className="w-12 h-12 rounded-full border-4 border-slate-900"
                src="https://ui-avatars.com/api/?name=Sarah&background=10b981&color=fff"
                alt="User"
              />

              <img
                className="w-12 h-12 rounded-full border-4 border-slate-900"
                src="https://ui-avatars.com/api/?name=David&background=f59e0b&color=fff"
                alt="User"
              />
            </div>

            <div className="text-sm font-bold text-slate-300">
              Join <span className="text-white">5,000+</span> active members
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-slate-50 relative">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h2>

            <p className="text-slate-500 mt-2 font-medium">
              Please enter your details to sign in.
            </p>
          </div>

          <div className="bg-slate-200/50 p-1 rounded-xl flex">
            <button
              type="button"
              onClick={() => setRole("Student")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${role === "Student" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <User size={18} /> Student
            </button>

            <button
              type="button"
              onClick={() => setRole("Professor")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${role === "Professor" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <BookOpen size={18} /> Professor
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                Email Address
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                  Password
                </label>

                <Link
                  to="/forgot"
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative group overflow-hidden rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all font-medium text-slate-700 pb-4"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-2xl hover:scale-110 transition-transform focus:outline-none pb-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🐵" : "🙈"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group mt-2"
            >
              Sign In to Dashboard{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>

          <p className="text-center text-slate-500 font-medium">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 font-bold hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
