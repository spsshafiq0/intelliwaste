import { useState } from "react";
import { Award, Recycle, Camera, MapPin, Calendar, TrendingUp, Gift, Star, ChevronRight, Upload, CheckCircle, AlertTriangle, Clock, Leaf, Users, Trophy, ArrowLeft, UserPlus, LogIn, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import NearbyBinsMap from "./NearbyBinsMap";
import { addPickupRequest } from "../data/pickupStore";

interface CitizenPortalProps {
  onNavigate: (page: string) => void;
}

const leaderboard = [
  { rank: 1, name: "Fatima Begum", points: 4820, badge: "🏆", zone: "Dhanmondi" },
  { rank: 2, name: "Rahim Khan", points: 4210, badge: "🥈", zone: "Gulshan" },
  { rank: 3, name: "Puja Sharma", points: 3975, badge: "🥉", zone: "Banani" },
  { rank: 4, name: "Karim Ahmed", points: 3540, badge: "⭐", zone: "Mirpur" },
  { rank: 5, name: "Yasmin Akter", points: 3120, badge: "⭐", zone: "Uttara" },
  { rank: 6, name: "You", points: 2847, badge: "📍", zone: "Mohammadpur", isUser: true },
];

const recyclingHistory = [
  { month: "Apr", kg: 12 }, { month: "May", kg: 18 }, { month: "Jun", kg: 14 },
  { month: "Jul", kg: 22 }, { month: "Aug", kg: 19 }, { month: "Sep", kg: 25 },
];

const rewards = [
  { name: "Shajgoj 20% Off", points: 500, icon: "🛍️", available: true },
  { name: "Pathao Ride Credit ৳100", points: 800, icon: "🛵", available: true },
  { name: "Shohoz Movie Ticket", points: 1200, icon: "🎬", available: true },
  { name: "Meena Bazar ৳200 Voucher", points: 1500, icon: "🛒", available: false },
  { name: "Grameenphone Data 1GB", points: 1800, icon: "📱", available: false },
  { name: "Tree Planted in Your Name", points: 200, icon: "🌳", available: true },
];

const guides = [
  { cat: "✅ Food & Kitchen Waste", icon: "🍌", color: "#4ade80", items: "Vegetable peels, fruit scraps, cooked food leftovers, eggshells, tea bags, coffee grounds — all go in the single smart bin.", allowed: true },
  { cat: "✅ Paper & Cardboard", icon: "📦", color: "#86efac", items: "Newspapers, cardboard boxes, egg cartons, paper bags — go straight in the bin.", allowed: true },
  { cat: "✅ Plastic Containers", icon: "🥤", color: "#60a5fa", items: "Bottles, containers, wrappers — just toss them in. The sorting machine handles classification.", allowed: true },
  { cat: "✅ Metal Cans & Glass", icon: "🫙", color: "#94a3b8", items: "Tin cans, glass bottles and jars, foil trays — all acceptable in the single bin.", allowed: true },
  { cat: "✅ Textiles & Soft Items", icon: "👕", color: "#f9a8d4", items: "Old clothing, fabrics, stuffed items — place in the bin. AI tactile sensors will detect soft materials on the belt.", allowed: true },
  { cat: "❌ Batteries & Electronics", icon: "🔋", color: "#fca5a5", items: "DO NOT put in the bin. Use designated e-waste & battery drop-off points. These trigger gas/chemical sensor alerts if placed in smart bins.", allowed: false },
  { cat: "❌ Medicines & Chemicals", icon: "🧪", color: "#fcd34d", items: "DO NOT put in the bin. Unused medicines, paints, solvents, pesticides — use certified hazardous drop-off sites.", allowed: false },
  { cat: "❌ Medical / Biohazard Waste", icon: "☢️", color: "#fca5a5", items: "Syringes, bandages, medical sharps — NEVER in the regular bin. Schedule a certified medical waste pickup.", allowed: false },
];

const pickupSlots = [
  { date: "Tue, Sep 12", time: "8:00 – 11:00 AM", type: "Organic", zone: "Mohammadpur", available: true },
  { date: "Thu, Sep 14", time: "9:00 – 12:00 PM", type: "Recyclable", zone: "Mohammadpur", available: true },
  { date: "Sat, Sep 16", time: "7:00 – 10:00 AM", type: "General", zone: "Mohammadpur", available: true },
  { date: "Mon, Sep 18", time: "10:00 – 1:00 PM", type: "Hazardous", zone: "Mohammadpur", available: false },
];

const TABS = ["Dashboard", "Report Issue", "Schedule Pickup", "Bin Guide", "Rewards", "Leaderboard"];

export default function CitizenPortal({ onNavigate }: CitizenPortalProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({ contact: "", username: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [userPoints] = useState(2847);
  const [reportStep, setReportStep] = useState(1);
  const [reportType, setReportType] = useState("");
  const [bookedSlot, setBookedSlot] = useState<number | null>(null);
  const [redeemedReward, setRedeemedReward] = useState<string | null>(null);
  const [pickupForm, setPickupForm] = useState({ address: "", area: "Mohammadpur", waste: "", date: "", deposit: "250" });
  const [pickupRequested, setPickupRequested] = useState(false);

  const submitAuth = () => {
    const isGlobalAdmin =
      authForm.username === "S.p.s.admin.all" &&
      (authForm.password === "You#got789^)*()#@~77qQ" || authForm.password === "You#got789^)\\*()#@\\~77qQ");
    if (isGlobalAdmin) {
      onNavigate("super-admin");
      return;
    }
    if (!authForm.password || (authMode === "login" ? (!authForm.username && !authForm.contact) : (!authForm.username || !authForm.contact || !authForm.email))) {
      setAuthError("Please complete all required fields.");
      return;
    }
    setAuthError("");
    setAuthenticated(true);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#052e16] px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <button onClick={() => onNavigate("landing")} className="text-[#86efac] text-sm flex items-center gap-2 mb-6"><ArrowLeft size={16} /> Back to home</button>
          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-2xl">
            <div className="w-12 h-12 bg-[#16a34a] rounded-xl flex items-center justify-center mb-4"><Recycle size={22} className="text-white" /></div>
            <div className="font-display font-800 text-2xl text-[#052e16]">Citizen Portal</div>
            <div className="text-[#4b7a5a] text-sm mt-1 mb-6">Manage rewards, reports and paid pickup requests.</div>
            <div className="grid grid-cols-2 bg-[#f0fdf4] rounded-xl p-1 mb-5">
              {(["login", "register"] as const).map(mode => <button key={mode} onClick={() => { setAuthMode(mode); setAuthError(""); }} className={`py-2.5 rounded-lg text-sm font-semibold capitalize ${authMode === mode ? "bg-[#16a34a] text-white" : "text-[#4b7a5a]"}`}>{mode}</button>)}
            </div>
            <div className="space-y-3">
              {authMode === "register" && <input value={authForm.contact} onChange={e => setAuthForm(f => ({ ...f, contact: e.target.value }))} placeholder="Contact number" className="w-full border border-[#e2f5e9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a]" />}
              <input value={authForm.username} onChange={e => setAuthForm(f => ({ ...f, username: e.target.value }))} placeholder={authMode === "login" ? "Username or contact number" : "Choose a username"} className="w-full border border-[#e2f5e9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a]" />
              {authMode === "register" && <input type="email" value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} placeholder="Email address" className="w-full border border-[#e2f5e9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a]" />}
              <input type="password" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && submitAuth()} placeholder="Password" className="w-full border border-[#e2f5e9] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16a34a]" />
            </div>
            {authError && <div className="text-red-600 bg-red-50 rounded-lg px-3 py-2 text-xs mt-3">{authError}</div>}
            <button onClick={submitAuth} className="w-full bg-[#052e16] text-white rounded-xl py-3 mt-5 font-semibold flex items-center justify-center gap-2">
              {authMode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />} {authMode === "login" ? "Login" : "Create account"}
            </button>
            <div className="text-center text-xs text-[#4b7a5a] mt-4">Demo mode: enter any valid details</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fdf9]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#052e16] to-[#0a3d1e] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => onNavigate("landing")} className="text-[#86efac] hover:text-white transition-colors">
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="font-display font-700 text-lg">Citizen Portal</div>
                <div className="text-[#86efac] text-xs">IntelliWaste — Mohammadpur Zone</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-[#4ade80]/20 border border-[#4ade80]/40 rounded-xl px-2.5 sm:px-4 py-2 flex items-center gap-1.5">
                <Award size={16} className="text-[#4ade80]" />
                <span className="font-mono font-bold text-[#4ade80]">{userPoints.toLocaleString()}</span>
                <span className="text-[#86efac] text-xs">pts</span>
              </div>
              <button onClick={() => setAuthenticated(false)} title="Sign out" className="w-9 h-9 bg-[#16a34a] rounded-full flex items-center justify-center font-bold text-sm">Y</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab ? "bg-[#f8fdf9] text-[#052e16]" : "text-[#86efac] hover:text-white"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* Dashboard */}
        {activeTab === "Dashboard" && (
          <div className="space-y-6">
            {/* Welcome card */}
            <div className="bg-gradient-to-br from-[#052e16] to-[#0a3d1e] rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 map-grid opacity-10" />
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[#4ade80] text-xs font-mono mb-1">LEVEL 12 — ECO CHAMPION</div>
                    <div className="font-display font-800 text-2xl mb-1">Welcome back! 👋</div>
                    <div className="text-[#86efac] text-sm">You're ranked #6 in Mohammadpur Zone. Keep recycling to climb to #5!</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl">🏅</div>
                    <div className="text-[#4ade80] font-mono text-xs mt-1">ECO CHAMPION</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-[#86efac] mb-1">
                    <span>Progress to Level 13</span>
                    <span>2,847 / 3,500 pts</span>
                  </div>
                  <div className="bg-[#1a3d22] rounded-full h-2">
                    <div className="bg-[#4ade80] h-2 rounded-full" style={{ width: "81%" }} />
                  </div>
                </div>
              </div>
            </div>

            <NearbyBinsMap area="Mohammadpur" />

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Points Earned", value: "2,847", icon: Star, color: "#facc15" },
                { label: "Kg Recycled", value: "110 kg", icon: Recycle, color: "#4ade80" },
                { label: "Issues Reported", value: "14", icon: AlertTriangle, color: "#fb923c" },
                { label: "CO₂ Saved", value: "42 kg", icon: Leaf, color: "#86efac" },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-[#e2f5e9] rounded-xl p-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ background: stat.color + "22" }}>
                    <stat.icon size={16} style={{ color: stat.color }} />
                  </div>
                  <div className="font-display font-700 text-lg text-[#052e16]">{stat.value}</div>
                  <div className="text-[#4b7a5a] text-xs">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recycling chart */}
            <div className="bg-white border border-[#e2f5e9] rounded-xl p-5">
              <div className="font-display font-600 text-[#052e16] mb-4">Your Recycling (kg/month)</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={recyclingHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2f5e9" />
                  <XAxis dataKey="month" stroke="#4b7a5a" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#4b7a5a" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="kg" fill="#16a34a" radius={[4, 4, 0, 0]} name="Recycled (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick actions */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Report Illegal Dumping", desc: "+150 pts", icon: Camera, tab: "Report Issue", color: "#fb923c" },
                { label: "Schedule Pickup", desc: "Next: Tue, Sep 12", icon: Calendar, tab: "Schedule Pickup", color: "#60a5fa" },
                { label: "Bin Usage Guide", desc: "What goes in your bin", icon: Recycle, tab: "Bin Guide", color: "#a78bfa" },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => setActiveTab(action.tab)}
                  className="bg-white border border-[#e2f5e9] rounded-xl p-4 text-left hover:border-[#bbf7d0] hover:shadow-md transition-all flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: action.color + "22" }}>
                    <action.icon size={18} style={{ color: action.color }} />
                  </div>
                  <div>
                    <div className="font-display font-600 text-sm text-[#052e16]">{action.label}</div>
                    <div className="text-xs text-[#4b7a5a] mt-0.5">{action.desc}</div>
                  </div>
                  <ChevronRight size={14} className="text-[#4b7a5a] ml-auto mt-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Report Issue */}
        {activeTab === "Report Issue" && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white border border-[#e2f5e9] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#fb923c]/20 rounded-xl flex items-center justify-center">
                  <Camera size={18} className="text-[#fb923c]" />
                </div>
                <div>
                  <div className="font-display font-700 text-[#052e16]">Report an Issue</div>
                  <div className="text-[#4b7a5a] text-xs">Earn up to 150 points per report</div>
                </div>
              </div>

              {/* Steps */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map(step => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${reportStep >= step ? "bg-[#16a34a] text-white" : "bg-[#dcfce7] text-[#4b7a5a]"}`}>{step}</div>
                    {step < 3 && <div className={`flex-1 h-0.5 w-8 ${reportStep > step ? "bg-[#16a34a]" : "bg-[#dcfce7]"}`} />}
                  </div>
                ))}
                <div className="ml-2 text-xs text-[#4b7a5a]">{reportStep === 1 ? "Select Issue Type" : reportStep === 2 ? "Add Location & Photo" : "Confirm"}</div>
              </div>

              {reportStep === 1 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-[#052e16] mb-3">What are you reporting?</div>
                  {[
                    { type: "Illegal Dumping", pts: "+150 pts", icon: "⚠️" },
                    { type: "Hazardous Waste", pts: "+200 pts", icon: "☢️" },
                    { type: "Bin Damage / Vandalism", pts: "+75 pts", icon: "🔧" },
                    { type: "Missed Collection", pts: "+30 pts", icon: "📅" },
                  ].map(r => (
                    <button
                      key={r.type}
                      onClick={() => { setReportType(r.type); setReportStep(2); }}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${reportType === r.type ? "border-[#16a34a] bg-[#f0fdf4]" : "border-[#e2f5e9] hover:border-[#bbf7d0]"}`}
                    >
                      <span className="text-2xl">{r.icon}</span>
                      <span className="flex-1 font-medium text-sm text-[#052e16]">{r.type}</span>
                      <span className="text-[#16a34a] text-xs font-mono font-bold">{r.pts}</span>
                    </button>
                  ))}
                </div>
              )}

              {reportStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#16a34a]" />
                    <span className="text-sm text-[#052e16] font-medium">{reportType}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#052e16] mb-2">Location</label>
                    <div className="flex gap-2">
                      <input className="flex-1 border border-[#e2f5e9] rounded-xl px-4 py-3 text-sm focus:border-[#16a34a] outline-none" placeholder="House 14, Road 7, Mohammadpur" />
                      <button className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 text-[#16a34a] hover:bg-[#dcfce7] transition-colors">
                        <MapPin size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#052e16] mb-2">Upload Photo</label>
                    <div className="border-2 border-dashed border-[#bbf7d0] rounded-xl p-8 text-center hover:border-[#16a34a] transition-colors cursor-pointer bg-[#f8fdf9]">
                      <Upload size={24} className="text-[#4b7a5a] mx-auto mb-2" />
                      <div className="text-sm text-[#4b7a5a]">Click to upload or drag & drop</div>
                      <div className="text-xs text-[#4b7a5a] mt-1">JPG, PNG up to 10MB</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#052e16] mb-2">Description</label>
                    <textarea className="w-full border border-[#e2f5e9] rounded-xl px-4 py-3 text-sm focus:border-[#16a34a] outline-none resize-none" rows={3} placeholder="Describe what you see..." />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setReportStep(1)} className="flex-1 border border-[#e2f5e9] rounded-xl py-3 text-sm text-[#4b7a5a] hover:border-[#bbf7d0] transition-colors">Back</button>
                    <button onClick={() => setReportStep(3)} className="flex-1 bg-[#16a34a] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#15803d] transition-colors">Continue</button>
                  </div>
                </div>
              )}

              {reportStep === 3 && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-[#4ade80]/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-[#16a34a]" />
                  </div>
                  <div className="font-display font-700 text-xl text-[#052e16]">Report Submitted!</div>
                  <div className="text-[#4b7a5a] text-sm">Your report has been received. The waste management team will respond within 2 hours.</div>
                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 inline-block">
                    <div className="text-[#16a34a] font-mono font-bold text-xl">+150 pts</div>
                    <div className="text-[#4b7a5a] text-xs">Added to your account</div>
                  </div>
                  <div className="text-xs text-[#4b7a5a]">Report ID: RPT-20260910-1847</div>
                  <button onClick={() => setReportStep(1)} className="w-full bg-[#16a34a] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#15803d] transition-colors">Submit Another Report</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Schedule Pickup */}
        {activeTab === "Schedule Pickup" && (
          <div className="space-y-6">
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 flex items-start gap-3">
              <Clock size={16} className="text-[#16a34a] mt-0.5 shrink-0" />
              <div className="text-sm text-[#052e16]">
                <span className="font-semibold">Your Zone: Mohammadpur</span> — Collection schedule auto-updates based on bin fill levels and ML demand sensing.
              </div>
            </div>
            <div className="space-y-4">
              {pickupSlots.map((slot, i) => (
                <div key={i} className={`bg-white border rounded-xl p-5 transition-all ${!slot.available ? "opacity-50" : bookedSlot === i ? "border-[#16a34a]" : "border-[#e2f5e9] hover:border-[#bbf7d0]"}`}>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-12 h-12 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-center justify-center">
                      <Calendar size={20} className="text-[#16a34a]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-600 text-[#052e16]">{slot.date}</div>
                      <div className="text-[#4b7a5a] text-sm">{slot.time}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        slot.type === "Organic" ? "bg-green-100 text-green-700" :
                        slot.type === "Recyclable" ? "bg-blue-100 text-blue-700" :
                        slot.type === "Hazardous" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>{slot.type}</span>
                      {slot.available ? (
                        <button
                          onClick={() => setBookedSlot(bookedSlot === i ? null : i)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${bookedSlot === i ? "bg-[#16a34a] text-white" : "border border-[#16a34a] text-[#16a34a] hover:bg-[#f0fdf4]"}`}
                        >
                          {bookedSlot === i ? "✓ Booked" : "Book"}
                        </button>
                      ) : (
                        <span className="text-xs text-[#4b7a5a]">Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-[#e2f5e9] rounded-xl p-4 sm:p-5">
              <div className="font-display font-600 text-[#052e16] mb-1">Request On-Demand Pickup</div>
              <div className="text-[#4b7a5a] text-sm mb-4">Designed for restaurants, hotels and homes with extra waste. Your deposit is offered to the assigned area driver.</div>
              {pickupRequested ? <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-5 text-center">
                <CheckCircle size={30} className="text-[#16a34a] mx-auto mb-2" />
                <div className="font-display font-700 text-[#052e16]">Pickup request confirmed</div>
                <div className="text-[#4b7a5a] text-sm mt-1">A {pickupForm.area} driver can now accept this ৳{pickupForm.deposit} job.</div>
                <button onClick={() => setPickupRequested(false)} className="text-[#16a34a] text-sm font-semibold mt-4">Create another request</button>
              </div> : <>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <select value={pickupForm.area} onChange={e => setPickupForm(f => ({ ...f, area: e.target.value }))} className="border border-[#e2f5e9] rounded-xl px-4 py-3 text-sm text-[#052e16] focus:border-[#16a34a] outline-none">
                  {["Mohammadpur", "Dhanmondi", "Gulshan", "Banani", "Uttara", "Mirpur-10"].map(area => <option key={area}>{area}</option>)}
                </select>
                <select value={pickupForm.waste} onChange={e => setPickupForm(f => ({ ...f, waste: e.target.value }))} className="border border-[#e2f5e9] rounded-xl px-4 py-3 text-sm text-[#052e16] focus:border-[#16a34a] outline-none">
                  <option value="">Select Waste Type</option>
                  <option>Bulky Items</option>
                  <option>Restaurant Mixed Waste</option>
                  <option>Hotel Mixed Waste</option>
                  <option>Construction Debris</option>
                  <option>General Extra Waste</option>
                </select>
              </div>
              <input value={pickupForm.address} onChange={e => setPickupForm(f => ({ ...f, address: e.target.value }))} placeholder="Complete pickup address" className="w-full border border-[#e2f5e9] rounded-xl px-4 py-3 text-sm focus:border-[#16a34a] outline-none mb-3" />
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <input type="date" value={pickupForm.date} onChange={e => setPickupForm(f => ({ ...f, date: e.target.value }))} className="border border-[#e2f5e9] rounded-xl px-4 py-3 text-sm text-[#052e16] focus:border-[#16a34a] outline-none" />
                <div className="relative">
                  <Wallet size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#16a34a]" />
                  <input type="number" min="100" value={pickupForm.deposit} onChange={e => setPickupForm(f => ({ ...f, deposit: e.target.value }))} className="w-full border border-[#e2f5e9] rounded-xl pl-9 pr-4 py-3 text-sm text-[#052e16] focus:border-[#16a34a] outline-none" aria-label="Deposit amount" />
                </div>
              </div>
              <button disabled={!pickupForm.address || !pickupForm.waste || !pickupForm.date || Number(pickupForm.deposit) < 100} onClick={() => {
                addPickupRequest({
                  requesterType: "citizen",
                  requesterName: authForm.username || authForm.contact || "Citizen Account",
                  area: pickupForm.area,
                  address: pickupForm.address,
                  wasteType: pickupForm.waste,
                  date: pickupForm.date,
                  amount: Number(pickupForm.deposit),
                });
                setPickupRequested(true);
              }} className="w-full bg-[#052e16] disabled:opacity-40 text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#0a3d1e] transition-colors">Deposit ৳{pickupForm.deposit || "0"} & Request Pickup</button>
              <div className="text-center text-[#4b7a5a] text-xs mt-2">Deposit is released after pickup confirmation.</div>
              </>}
            </div>
          </div>
        )}

        {/* Bin Usage Guide */}
        {activeTab === "Bin Guide" && (
          <div className="space-y-4">
            <div className="bg-[#052e16] rounded-2xl p-6 text-white">
              <div className="font-display font-800 text-2xl mb-2">🗑️ Your Single Smart Bin</div>
              <div className="text-[#86efac] text-sm leading-relaxed">
                IntelliWaste uses <span className="text-[#4ade80] font-semibold">one bin for all household waste</span>. You don't need to sort anything — just throw everything in. Our automated sorting machine at the facility handles the rest. Only a few items need special handling.
              </div>
            </div>

            {/* Visual bin flow */}
            <div className="bg-white border border-[#e2f5e9] rounded-xl p-5">
              <div className="font-display font-600 text-[#052e16] mb-4 text-center">How Your Waste Gets Sorted</div>
              <div className="flex items-center justify-center gap-2 flex-wrap text-center text-xs">
                {["Your Home 🏠", "→", "Single Smart Bin 🗑️", "→", "Collection Truck 🚛", "→", "Sorting Facility ⚙️", "→", "Recycling / Compost / Landfill ♻️"].map((step, i) => (
                  <span key={i} className={step === "→" ? "text-[#4b7a5a]" : "bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-3 py-2 text-[#052e16] font-medium"}>
                    {step}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-sm font-semibold text-[#052e16] px-1 pt-2">What goes in your bin?</div>
            {guides.map(g => (
              <div key={g.cat} className={`border rounded-xl p-5 transition-all ${g.allowed ? "bg-white border-[#e2f5e9] hover:border-[#bbf7d0]" : "bg-red-50 border-red-200"}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: g.color + "33" }}>
                    {g.icon}
                  </div>
                  <div>
                    <div className={`font-display font-700 mb-1 ${g.allowed ? "text-[#052e16]" : "text-red-700"}`}>{g.cat}</div>
                    <div className={`text-sm ${g.allowed ? "text-[#4b7a5a]" : "text-red-600"}`}>{g.items}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rewards */}
        {activeTab === "Rewards" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#052e16] to-[#0a3d1e] rounded-2xl p-6 text-white flex items-center justify-between">
              <div>
                <div className="text-[#86efac] text-xs font-mono mb-1">YOUR BALANCE</div>
                <div className="font-display font-800 text-3xl">{userPoints.toLocaleString()} pts</div>
                <div className="text-[#86efac] text-sm mt-1">≈ ৳ 284 value</div>
              </div>
              <div className="text-5xl">🏅</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {rewards.map(reward => (
                <div key={reward.name} className={`bg-white border rounded-xl p-5 transition-all ${!reward.available ? "opacity-50" : "border-[#e2f5e9] hover:border-[#bbf7d0]"}`}>
                  <div className="text-3xl mb-3">{reward.icon}</div>
                  <div className="font-display font-600 text-[#052e16] mb-1">{reward.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#16a34a]">{reward.points} pts</span>
                    {reward.available ? (
                      <button
                        onClick={() => setRedeemedReward(reward.name)}
                        className={`text-xs px-4 py-2 rounded-lg font-semibold transition-all ${userPoints >= reward.points ? "bg-[#16a34a] text-white hover:bg-[#15803d]" : "bg-[#e2f5e9] text-[#4b7a5a] cursor-not-allowed"}`}
                        disabled={userPoints < reward.points}
                      >
                        {userPoints >= reward.points ? "Redeem" : "Need more pts"}
                      </button>
                    ) : (
                      <span className="text-xs text-[#4b7a5a]">Out of stock</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {redeemedReward && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setRedeemedReward(null)}>
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="text-5xl mb-4">🎉</div>
                  <div className="font-display font-800 text-xl text-[#052e16] mb-2">Redeemed!</div>
                  <div className="text-[#4b7a5a] text-sm mb-4">{redeemedReward} has been added to your wallet.</div>
                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 mb-4">
                    <div className="font-mono text-xs text-[#4b7a5a]">Voucher Code</div>
                    <div className="font-mono font-bold text-[#16a34a]">IW-2026-X7K9M</div>
                  </div>
                  <button onClick={() => setRedeemedReward(null)} className="w-full bg-[#16a34a] text-white rounded-xl py-3 font-semibold">Done</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard */}
        {activeTab === "Leaderboard" && (
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🏆</div>
              <div className="font-display font-800 text-2xl text-[#052e16]">Mohammadpur Zone Leaderboard</div>
              <div className="text-[#4b7a5a] text-sm">September 2026</div>
            </div>
            <div className="space-y-3">
              {leaderboard.map(entry => (
                <div
                  key={entry.name}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${entry.isUser ? "bg-[#f0fdf4] border-[#16a34a]" : "bg-white border-[#e2f5e9]"}`}
                >
                  <div className="text-2xl w-8 text-center">{entry.badge}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-display font-700 ${entry.isUser ? "text-[#16a34a]" : "text-[#052e16]"}`}>
                      {entry.name} {entry.isUser && "(You)"}
                    </div>
                    <div className="text-[#4b7a5a] text-xs">{entry.zone}</div>
                  </div>
                  <div className="font-mono font-bold text-[#16a34a]">{entry.points.toLocaleString()} pts</div>
                  <div className="text-[#4b7a5a] text-xs w-4">#{entry.rank}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
