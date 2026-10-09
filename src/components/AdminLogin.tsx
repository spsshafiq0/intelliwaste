import { useState } from "react";
import { Recycle, Shield, ChevronRight, Eye, EyeOff, AlertCircle, KeyRound, CheckCircle } from "lucide-react";

interface AdminLoginProps {
  onLogin: (role: "city" | "ward", wardId?: number) => void;
  onNavigate: (page: string) => void;
}

const wardList = [
  { id: 1, name: "Ward 01 — Uttara North" },
  { id: 2, name: "Ward 02 — Uttara South" },
  { id: 3, name: "Ward 03 — Khilkhet" },
  { id: 4, name: "Ward 04 — Vatara" },
  { id: 5, name: "Ward 05 — Badda" },
  { id: 6, name: "Ward 06 — Gulshan" },
  { id: 7, name: "Ward 07 — Banani" },
  { id: 8, name: "Ward 08 — Mohakhali" },
  { id: 9, name: "Ward 09 — Tejgaon" },
  { id: 10, name: "Ward 10 — Dhanmondi" },
  { id: 11, name: "Ward 11 — Mirpur-10" },
  { id: 12, name: "Ward 12 — Pallabi" },
  { id: 13, name: "Ward 13 — Mohammadpur" },
  { id: 14, name: "Ward 14 — Hazaribagh" },
  { id: 15, name: "Ward 15 — Kamrangirchar" },
];

export default function AdminLogin({ onLogin, onNavigate }: AdminLoginProps) {
  const [tab, setTab] = useState<"city" | "ward">("city");
  const [ward, setWard] = useState<number>(1);
  const [pass, setPass] = useState("");
  const [username, setUsername] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [resetPhone, setResetPhone] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  const handleLogin = () => {
    if (!username || !pass) { setError("Username and password are required"); return; }
    if (tab === "city" && username !== "city.admin") { setError("Invalid City Corporation username"); return; }
    if (tab === "city" && pass !== "admin123") { setError("Invalid credentials"); return; }
    if (tab === "ward" && pass !== "ward123" && pass !== resetPassword) { setError("Invalid ward password"); return; }
    setError("");
    onLogin(tab, tab === "ward" ? ward : undefined);
  };

  return (
    <div className="min-h-screen bg-[#061309] flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #061309 0%, #0a1f0e 100%)" }}>
      <div className="absolute inset-0 map-grid opacity-20" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#16a34a] rounded-2xl flex items-center justify-center mx-auto mb-4 glow-green">
            <Recycle size={30} className="text-white" />
          </div>
          <div className="font-display font-800 text-2xl text-white">IntelliWaste</div>
          <div className="text-[#4b7a5a] text-sm mt-1">Dhaka City Corporation — Operations Portal</div>
        </div>

        {/* Card */}
        <div className="bg-[#0d2414] border border-[#1a3d22] rounded-2xl p-8">
          {/* Role tabs */}
          <div className="flex gap-2 bg-[#061309] rounded-xl p-1 mb-6">
            <button
              onClick={() => { setTab("city"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === "city" ? "bg-[#16a34a] text-white" : "text-[#4b7a5a] hover:text-[#86efac]"}`}
            >
              <Shield size={15} />
              City Corporation
            </button>
            <button
              onClick={() => { setTab("ward"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === "ward" ? "bg-[#16a34a] text-white" : "text-[#4b7a5a] hover:text-[#86efac]"}`}
            >
              <Recycle size={15} />
              Ward Sub-Admin
            </button>
          </div>

          {/* Role info */}
          <div className="bg-[#061309] border border-[#1a3d22] rounded-xl p-4 mb-6">
            {tab === "city" ? (
              <div>
                <div className="text-[#4ade80] font-mono text-xs mb-2">CITY CORPORATION ACCOUNT</div>
                <div className="text-[#4b7a5a] text-xs leading-relaxed">Full access — all wards, all bins, all trucks. Add bins anywhere, create ward sub-admins, view city-wide analytics and compliance.</div>
              </div>
            ) : (
              <div>
                <div className="text-[#60a5fa] font-mono text-xs mb-2">WARD-LEVEL SUB-ADMIN</div>
                <div className="text-[#4b7a5a] text-xs leading-relaxed">Limited to selected ward only — view & manage own ward bins, add collection tracks, update waste data for assigned ward.</div>
              </div>
            )}
          </div>

          {/* Ward selector */}
          {tab === "ward" && (
            <div className="mb-4">
              <label className="block text-[#4b7a5a] text-xs font-mono mb-2">SELECT YOUR WARD</label>
              <select
                value={ward}
                onChange={e => setWard(Number(e.target.value))}
                className="w-full bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-[#86efac] text-sm focus:border-[#4ade80] outline-none"
              >
                {wardList.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Password */}
          <div className="mb-4">
            <label className="block text-[#4b7a5a] text-xs font-mono mb-2">USERNAME</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={tab === "city" ? "city.admin" : "ward01.admin"}
              autoComplete="username"
              className="w-full bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-white text-sm focus:border-[#4ade80] outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#4b7a5a] text-xs font-mono mb-2">PASSWORD</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder={tab === "city" ? "admin123" : "ward123"}
                autoComplete="current-password"
                className="w-full bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-white text-sm focus:border-[#4ade80] outline-none pr-12"
              />
              <button onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b7a5a] hover:text-[#86efac]">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {tab === "ward" && (
            <button onClick={() => { setForgotOpen(true); setResetStep(1); }} className="text-xs text-[#4ade80] hover:underline mb-4 flex items-center gap-1.5">
              <KeyRound size={12} /> Forgot password?
            </button>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              <AlertCircle size={13} />
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-[#16a34a] text-white font-semibold py-3 rounded-xl hover:bg-[#15803d] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            Login as {tab === "city" ? "City Corporation" : "Ward Sub-Admin"}
            <ChevronRight size={16} />
          </button>

          <div className="text-center mt-4">
            <button onClick={() => onNavigate("landing")} className="text-xs text-[#4b7a5a] hover:text-[#86efac] transition-colors">
              ← Back to landing page
            </button>
          </div>
        </div>

        <div className="text-center mt-4 text-[#4b7a5a] text-xs">
          Demo: <span className="font-mono text-[#4ade80]">city.admin / admin123</span> &nbsp;|&nbsp; <span className="font-mono text-[#60a5fa]">ward01.admin / ward123</span>
        </div>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4" onClick={() => setForgotOpen(false)}>
          <div className="w-full max-w-md bg-[#0d2414] border border-[#1a3d22] rounded-2xl p-5 sm:p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#16a34a]/20 rounded-xl flex items-center justify-center"><KeyRound size={18} className="text-[#4ade80]" /></div>
              <div>
                <div className="font-display font-700 text-white">Reset ward password</div>
                <div className="text-[#4b7a5a] text-xs">Secure mobile verification</div>
              </div>
            </div>
            {resetStep === 1 && <div className="space-y-4">
              <select value={ward} onChange={e => setWard(Number(e.target.value))} className="w-full bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-[#86efac] text-sm outline-none">
                {wardList.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <input value={resetPhone} onChange={e => setResetPhone(e.target.value)} placeholder="Account phone number" className="w-full bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-white text-sm outline-none" />
              <button disabled={!resetPhone} onClick={() => setResetStep(2)} className="w-full bg-[#16a34a] disabled:opacity-40 text-white rounded-xl py-3 text-sm font-semibold">Send verification code</button>
            </div>}
            {resetStep === 2 && <div className="space-y-4">
              <div className="text-[#86efac] text-sm">A 6-digit code was sent to {resetPhone}. For this demo, use <span className="font-mono text-[#4ade80]">123456</span>.</div>
              <input value={resetCode} onChange={e => setResetCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="Enter 6-digit code" className="w-full bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-white text-sm outline-none" />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Create new password" className="w-full bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-white text-sm outline-none" />
              <button disabled={resetCode !== "123456" || newPassword.length < 6} onClick={() => { setPass(newPassword); setResetPassword(newPassword); setResetStep(3); }} className="w-full bg-[#16a34a] disabled:opacity-40 text-white rounded-xl py-3 text-sm font-semibold">Reset password</button>
            </div>}
            {resetStep === 3 && <div className="text-center py-4">
              <CheckCircle size={38} className="text-[#4ade80] mx-auto mb-3" />
              <div className="text-white font-display font-700">Password updated</div>
              <div className="text-[#4b7a5a] text-sm mt-1 mb-5">Your new password is ready to use.</div>
              <button onClick={() => setForgotOpen(false)} className="w-full bg-[#16a34a] text-white rounded-xl py-3 text-sm font-semibold">Return to login</button>
            </div>}
          </div>
        </div>
      )}
    </div>
  );
}
