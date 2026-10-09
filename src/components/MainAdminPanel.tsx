import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Trash2, Truck, AlertTriangle, CheckCircle, BarChart2, Bell, Shield,
  Globe, LogOut, Plus, Edit3, Trash, Search, Download, RefreshCw,
  Users, MapPin, Flame, Wind, X, ChevronRight, Eye, Save, Package,
  Navigation, ExternalLink, ClipboardList
} from "lucide-react";
import { wards, bins, tracks, type Ward, type Bin, type Track } from "../data/cityData";

interface MainAdminPanelProps {
  onLogout: () => void;
}

const SIDEBAR = [
  { id: "overview",    icon: BarChart2, label: "City Overview" },
  { id: "wards",       icon: Globe,     label: "Ward Management" },
  { id: "bins",        icon: Trash2,    label: "All Bins" },
  { id: "tracks",      icon: Truck,     label: "All Tracks" },
  { id: "subadmins",   icon: Users,     label: "Sub-Admins" },
  { id: "waste",       icon: ClipboardList, label: "Waste Reports" },
  { id: "alerts",      icon: Bell,      label: "Alerts",    badge: 3 },
  { id: "compliance",  icon: Shield,    label: "Compliance" },
];

const weeklyData = [
  { day: "Mon", collected: 12.4, sorted: 10.8 },
  { day: "Tue", collected: 15.1, sorted: 13.4 },
  { day: "Wed", collected: 13.8, sorted: 11.9 },
  { day: "Thu", collected: 18.2, sorted: 16.5 },
  { day: "Fri", collected: 16.7, sorted: 14.3 },
  { day: "Sat", collected: 21.3, sorted: 19.1 },
  { day: "Sun", collected: 9.5,  sorted: 8.2 },
];

const outputBreakdown = [
  { name: "Organic",    value: 32, color: "#4ade80" },
  { name: "Plastic",    value: 22, color: "#60a5fa" },
  { name: "Paper",      value: 14, color: "#fde68a" },
  { name: "Metal",      value: 12, color: "#94a3b8" },
  { name: "Glass",      value: 8,  color: "#7dd3fc" },
  { name: "Hazardous",  value: 5,  color: "#fca5a5" },
  { name: "Residual",   value: 7,  color: "#9ca3af" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    normal:      "bg-green-500/20 text-green-400",
    warning:     "bg-yellow-500/20 text-yellow-400",
    critical:    "bg-orange-500/20 text-orange-400",
    fire:        "bg-red-500/20 text-red-400",
    active:      "bg-green-500/20 text-green-400",
    idle:        "bg-yellow-500/20 text-yellow-400",
    maintenance: "bg-orange-500/20 text-orange-400",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${map[status] ?? "bg-[#1a3d22] text-[#4b7a5a]"}`}>
      {status.toUpperCase()}
    </span>
  );
}

// ── Shared input style ─────────────────────────────────────────────────
const inp = "w-full bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#4ade80] placeholder-[#4b7a5a]";
const sel = "w-full bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-2.5 text-[#86efac] text-sm outline-none focus:border-[#4ade80]";

// ── Add / Edit Bin Modal ───────────────────────────────────────────────
function BinModal({
  initial, onClose, onSave, title
}: {
  initial?: Partial<Bin>;
  onClose: () => void;
  onSave: (b: Partial<Bin>) => void;
  title: string;
}) {
  const [form, setForm] = useState({
    wardId:   initial?.wardId   ?? 1,
    location: initial?.location ?? "",
    capacity: initial?.capacity ?? "120L",
    lat:      initial?.lat      ?? 23.78,
    lng:      initial?.lng      ?? 90.40,
  });

  const mapsLink = `https://maps.google.com/?q=${form.lat},${form.lng}`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d2414] border border-[#1a3d22] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="font-display font-700 text-white">{title}</div>
          <button onClick={onClose}><X size={16} className="text-[#4b7a5a]" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[#4b7a5a] text-xs font-mono mb-1">WARD</label>
            <select value={form.wardId} onChange={e => setForm(f => ({ ...f, wardId: Number(e.target.value) }))} className={sel}>
              {wards.map(w => <option key={w.id} value={w.id}>{w.name} — {w.area}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[#4b7a5a] text-xs font-mono mb-1">LOCATION / ADDRESS</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Road 5, House 12, Gulshan-2" className={inp} />
          </div>
          <div>
            <label className="block text-[#4b7a5a] text-xs font-mono mb-1">CAPACITY</label>
            <select value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} className={sel}>
              {["120L","240L","360L","500L"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* GPS coordinates */}
          <div className="bg-[#061309] border border-[#1a3d22] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[#4ade80] font-mono text-xs">📍 GPS LOCATION</div>
              <a href={mapsLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-[#60a5fa] hover:underline">
                <ExternalLink size={11} /> Preview on Maps
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#4b7a5a] text-xs mb-1">Latitude</label>
                <input type="number" step="0.0001" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: Number(e.target.value) }))} className={inp} />
              </div>
              <div>
                <label className="block text-[#4b7a5a] text-xs mb-1">Longitude</label>
                <input type="number" step="0.0001" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: Number(e.target.value) }))} className={inp} />
              </div>
            </div>
            <div className="mt-2 text-[#4b7a5a] text-xs">
              Tip: paste Google Maps coordinates or click "Preview on Maps" to verify placement.
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-[#1a3d22] text-[#4b7a5a] rounded-xl py-2.5 text-sm hover:border-[#4ade80]/30 transition-colors">Cancel</button>
          <button
            onClick={() => {
              onSave({ ...form, fill: initial?.fill ?? 0, weight: initial?.weight ?? 0, temp: initial?.temp ?? "Normal", gas: initial?.gas ?? "Normal", fire: initial?.fire ?? false, status: initial?.status ?? "normal" });
              onClose();
            }}
            className="flex-1 bg-[#16a34a] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#15803d] flex items-center justify-center gap-2"
          >
            <Save size={14} /> Save Bin
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit Track Modal ─────────────────────────────────────────────
function TrackModal({
  initial, onClose, onSave, title
}: {
  initial?: Track;
  onClose: () => void;
  onSave: (t: Track) => void;
  title: string;
}) {
  const [form, setForm] = useState({
    wardId:       initial?.wardId       ?? 1,
    truckId:      initial?.truckId      ?? "",
    driver:       initial?.driver       ?? "",
    phone:        initial?.phone        ?? "",
    username:     initial?.username     ?? "",
    email:        initial?.email        ?? "",
    nid:          initial?.nid          ?? "",
    address:      initial?.address      ?? "",
    route:        initial?.route        ?? "",
    stops:        initial?.stops        ?? 6,
    status:       initial?.status       ?? "idle" as Track["status"],
    gpsLat:       initial?.gpsLat       ?? 23.78,
    gpsLng:       initial?.gpsLng       ?? 90.40,
    mapsRouteUrl: initial?.mapsRouteUrl ?? "",
    startTime:    initial?.startTime    ?? "07:00 AM",
    fuel:         initial?.fuel         ?? 100,
  });

  const liveGpsLink = `https://maps.google.com/?q=${form.gpsLat},${form.gpsLng}`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d2414] border border-[#1a3d22] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="font-display font-700 text-white">{title}</div>
          <button onClick={onClose}><X size={16} className="text-[#4b7a5a]" /></button>
        </div>
        <div className="space-y-4">
          {/* Ward */}
          <div>
            <label className="block text-[#4b7a5a] text-xs font-mono mb-1">WARD</label>
            <select value={form.wardId} onChange={e => setForm(f => ({ ...f, wardId: Number(e.target.value) }))} className={sel}>
              {wards.map(w => <option key={w.id} value={w.id}>{w.name} — {w.area}</option>)}
            </select>
          </div>

          {/* Truck + Stops */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#4b7a5a] text-xs font-mono mb-1">TRUCK ID</label>
              <input value={form.truckId} onChange={e => setForm(f => ({ ...f, truckId: e.target.value }))} placeholder="DNCC-T00" className={inp} />
            </div>
            <div>
              <label className="block text-[#4b7a5a] text-xs font-mono mb-1">TOTAL STOPS</label>
              <input type="number" value={form.stops} onChange={e => setForm(f => ({ ...f, stops: Number(e.target.value) }))} className={inp} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#4b7a5a] text-xs font-mono mb-1">DRIVER USERNAME</label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="driver.username" className={inp} />
            </div>
            <div>
              <label className="block text-[#4b7a5a] text-xs font-mono mb-1">EMAIL ADDRESS</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="driver@example.com" className={inp} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#4b7a5a] text-xs font-mono mb-1">NID NUMBER</label>
              <input value={form.nid} onChange={e => setForm(f => ({ ...f, nid: e.target.value }))} placeholder="National ID" className={inp} />
            </div>
            <div>
              <label className="block text-[#4b7a5a] text-xs font-mono mb-1">FULL ADDRESS</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Driver address" className={inp} />
            </div>
          </div>

          {/* Driver */}
          <div>
            <label className="block text-[#4b7a5a] text-xs font-mono mb-1">DRIVER NAME</label>
            <input value={form.driver} onChange={e => setForm(f => ({ ...f, driver: e.target.value }))} placeholder="Driver full name" className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#4b7a5a] text-xs font-mono mb-1">DRIVER PHONE</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="017XX-XXXXXX" className={inp} />
            </div>
            <div>
              <label className="block text-[#4b7a5a] text-xs font-mono mb-1">START TIME</label>
              <input value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} placeholder="07:00 AM" className={inp} />
            </div>
          </div>

          {/* Route */}
          <div>
            <label className="block text-[#4b7a5a] text-xs font-mono mb-1">ROUTE DESCRIPTION</label>
            <input value={form.route} onChange={e => setForm(f => ({ ...f, route: e.target.value }))} placeholder="Road 1 → Road 7 → Depot" className={inp} />
          </div>

          {/* Status + Fuel */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#4b7a5a] text-xs font-mono mb-1">STATUS</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Track["status"] }))} className={sel}>
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-[#4b7a5a] text-xs font-mono mb-1">FUEL %</label>
              <input type="number" min={0} max={100} value={form.fuel} onChange={e => setForm(f => ({ ...f, fuel: Number(e.target.value) }))} className={inp} />
            </div>
          </div>

          {/* GPS section */}
          <div className="bg-[#061309] border border-[#4ade80]/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[#4ade80] font-mono text-xs">🛰 GPS TRACKING</div>
              <a href={liveGpsLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-[#60a5fa] hover:underline">
                <ExternalLink size={11} /> Live Location
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[#4b7a5a] text-xs mb-1">Current Lat</label>
                <input type="number" step="0.0001" value={form.gpsLat} onChange={e => setForm(f => ({ ...f, gpsLat: Number(e.target.value) }))} className={inp} />
              </div>
              <div>
                <label className="block text-[#4b7a5a] text-xs mb-1">Current Lng</label>
                <input type="number" step="0.0001" value={form.gpsLng} onChange={e => setForm(f => ({ ...f, gpsLng: Number(e.target.value) }))} className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-[#4b7a5a] text-xs mb-1">Google Maps Route URL (optional)</label>
              <input
                value={form.mapsRouteUrl}
                onChange={e => setForm(f => ({ ...f, mapsRouteUrl: e.target.value }))}
                placeholder="https://maps.google.com/?q=..."
                className={inp}
              />
            </div>
            <div className="mt-2 text-[#4b7a5a] text-xs">
              Paste a Google Maps directions link to embed the full route. Coordinates are used for live truck pin on map.
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-[#1a3d22] text-[#4b7a5a] rounded-xl py-2.5 text-sm hover:border-[#4ade80]/30 transition-colors">Cancel</button>
          <button
            onClick={() => {
              onSave({
                id: initial?.id ?? `TR-NEW-${Date.now()}`,
                progress: initial?.progress ?? 0,
                load: initial?.load ?? "0t",
                ...form,
              } as Track);
              onClose();
            }}
            className="flex-1 bg-[#16a34a] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#15803d] flex items-center justify-center gap-2"
          >
            <Save size={14} /> Save Track
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Sub-Admin Modal ────────────────────────────────────────────────
type SubAdminForm = {
  id?: number;
  wardId: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  nid: string;
  address: string;
  active: boolean;
};

function AddSubAdminModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (form: SubAdminForm) => void;
  initial?: SubAdminForm;
}) {
  const [form, setForm] = useState<SubAdminForm>(initial ?? {
    wardId: 3, name: "", username: "", email: "", phone: "", nid: "", address: "", active: true,
  });
  const [error, setError] = useState("");
  const save = () => {
    if (!form.name || !form.username || !form.email || !form.phone || !form.nid || !form.address) {
      setError("Please complete every account field.");
      return;
    }
    onSave(form);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d2414] border border-[#1a3d22] rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="font-display font-700 text-white">{initial ? "Edit Ward Sub-Admin" : "Create Ward Sub-Admin"}</div>
          <button onClick={onClose}><X size={16} className="text-[#4b7a5a]" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[#4b7a5a] text-xs font-mono mb-1">ASSIGN TO WARD</label>
            <select value={form.wardId} onChange={e => setForm(f => ({ ...f, wardId: Number(e.target.value) }))} className={sel}>
              {wards.map(w => <option key={w.id} value={w.id}>{w.name} — {w.area}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[#4b7a5a] text-xs font-mono mb-1">FULL NAME</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sub-admin full name" className={inp} />
          </div>
          <div>
            <label className="block text-[#4b7a5a] text-xs font-mono mb-1">USERNAME</label>
            <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="e.g. ward03.admin" className={inp} />
          </div>
          <div>
            <label className="block text-[#4b7a5a] text-xs font-mono mb-1">EMAIL</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="wardXX@dcc.gov.bd" className={inp} />
          </div>
          <div>
            <label className="block text-[#4b7a5a] text-xs font-mono mb-1">PHONE</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="017XX-XXXXXX" className={inp} />
          </div>
          <div>
            <label className="block text-[#4b7a5a] text-xs font-mono mb-1">NID NUMBER</label>
            <input value={form.nid} onChange={e => setForm(f => ({ ...f, nid: e.target.value }))} placeholder="National ID number" className={inp} />
          </div>
          <div>
            <label className="block text-[#4b7a5a] text-xs font-mono mb-1">FULL ADDRESS</label>
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="House, road, area, city" className={inp} />
          </div>
          <div className="bg-[#061309] border border-[#1a3d22] rounded-xl p-3 text-xs text-[#4b7a5a]">
            Default login password will be: <span className="font-mono text-[#4ade80]">ward123</span>. Sub-admin should change on first login.
          </div>
        </div>
        {error && <div className="mt-3 text-xs text-red-400">{error}</div>}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-[#1a3d22] text-[#4b7a5a] rounded-xl py-2.5 text-sm">Cancel</button>
          <button onClick={save} className="flex-1 bg-[#16a34a] text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
            <Save size={14} /> {initial ? "Save Changes" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Ward Detail Modal ──────────────────────────────────────────────────
function WardDetailModal({ ward, onClose }: { ward: Ward; onClose: () => void }) {
  const wardBins = bins.filter(b => b.wardId === ward.id);
  const wardTracks = tracks.filter(t => t.wardId === ward.id);
  const critical = wardBins.filter(b => b.status === "critical" || b.status === "fire");
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d2414] border border-[#1a3d22] rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="font-display font-700 text-white text-lg">{ward.name} — {ward.area}</div>
            <div className="text-[#4b7a5a] text-xs">Councilor: {ward.councilor}</div>
          </div>
          <button onClick={onClose}><X size={16} className="text-[#4b7a5a]" /></button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Population", value: ward.population.toLocaleString() },
            { label: "Total Bins", value: ward.totalBins },
            { label: "Active Tracks", value: ward.activeTracks },
            { label: "Critical Bins", value: critical.length },
          ].map(k => (
            <div key={k.label} className="bg-[#061309] border border-[#1a3d22] rounded-xl p-3 text-center">
              <div className="font-mono font-bold text-[#4ade80] text-xl">{k.value}</div>
              <div className="text-[#4b7a5a] text-xs mt-1">{k.label}</div>
            </div>
          ))}
        </div>
        <div className="mb-5">
          <div className="text-[#4ade80] font-mono text-xs mb-2">SUB-ADMIN STATUS</div>
          {ward.subAdmin ? (
            <div className="bg-[#061309] border border-[#1a3d22] rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#16a34a] rounded-full flex items-center justify-center font-bold text-white">{ward.subAdmin.name[0]}</div>
              <div className="flex-1">
                <div className="text-white font-semibold text-sm">{ward.subAdmin.name}</div>
                <div className="text-[#4b7a5a] text-xs">{ward.subAdmin.email} · {ward.subAdmin.phone}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-mono ${ward.subAdmin.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{ward.subAdmin.active ? "ACTIVE" : "INACTIVE"}</span>
            </div>
          ) : (
            <div className="bg-[#061309] border border-yellow-500/30 rounded-xl p-4 text-center text-yellow-400 text-sm">⚠️ No sub-admin assigned to this ward</div>
          )}
        </div>
        <div className="mb-4">
          <div className="text-[#4ade80] font-mono text-xs mb-2">BINS IN THIS WARD ({wardBins.length})</div>
          <div className="space-y-2">
            {wardBins.map(b => (
              <div key={b.id} className="bg-[#061309] border border-[#1a3d22] rounded-lg p-3 flex items-center gap-3">
                <span className="font-mono text-xs text-[#4b7a5a] w-12">{b.id}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[#86efac] text-xs truncate">{b.location}</div>
                </div>
                <div className="w-24 bg-[#0d2414] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${b.fill}%`, background: b.fill > 80 ? "#ef4444" : b.fill > 60 ? "#f59e0b" : "#4ade80" }} />
                </div>
                <span className="font-mono text-xs w-8 text-right" style={{ color: b.fill > 80 ? "#ef4444" : b.fill > 60 ? "#f59e0b" : "#4ade80" }}>{b.fill}%</span>
                <StatusBadge status={b.status} />
              </div>
            ))}
            {wardBins.length === 0 && <div className="text-[#4b7a5a] text-xs text-center py-3">No bins assigned yet</div>}
          </div>
        </div>
        <div>
          <div className="text-[#4ade80] font-mono text-xs mb-2">TRACKS IN THIS WARD ({wardTracks.length})</div>
          <div className="space-y-2">
            {wardTracks.map(t => (
              <div key={t.id} className="bg-[#061309] border border-[#1a3d22] rounded-lg p-3 flex items-center gap-3">
                <span className="font-mono text-xs text-[#4b7a5a] w-16">{t.truckId}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[#86efac] text-xs truncate">{t.driver}</div>
                  <div className="text-[#4b7a5a] text-xs truncate">{t.route}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
            {wardTracks.length === 0 && <div className="text-[#4b7a5a] text-xs text-center py-3">No tracks assigned yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function MainAdminPanel({ onLogout }: MainAdminPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [showAddBin, setShowAddBin] = useState(false);
  const [editBin, setEditBin] = useState<Bin | null>(null);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [editTrack, setEditTrack] = useState<Track | null>(null);
  const [showAddSubAdmin, setShowAddSubAdmin] = useState(false);
  const [editSubAdmin, setEditSubAdmin] = useState<SubAdminForm | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [localBins, setLocalBins] = useState<Bin[]>(bins);
  const [localTracks, setLocalTracks] = useState<Track[]>(tracks);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subAdmins, setSubAdmins] = useState<SubAdminForm[]>(
    wards.flatMap(w => w.subAdmin ? [{
      id: w.subAdmin.id,
      wardId: w.id,
      name: w.subAdmin.name,
      username: w.subAdmin.username ?? `ward${String(w.id).padStart(2, "0")}.admin`,
      email: w.subAdmin.email,
      phone: w.subAdmin.phone,
      nid: w.subAdmin.nid ?? `1990${String(w.id).padStart(9, "0")}`,
      address: w.subAdmin.address ?? `${w.area}, Dhaka`,
      active: w.subAdmin.active,
    }] : [])
  );

  const saveBin = (updated: Partial<Bin>) => {
    setLocalBins(prev => {
      const idx = prev.findIndex(b => b.id === (updated as Bin).id);
      if (idx >= 0) { const n = [...prev]; n[idx] = { ...n[idx], ...updated }; return n; }
      const newId = `B-${String(prev.length + 1).padStart(3, "0")}`;
      return [...prev, { ...updated, id: newId, qr: `QR-${newId}`, lastCollected: "Never", status: "normal", fill: 0, weight: 0, temp: "Normal", gas: "Normal", fire: false } as Bin];
    });
  };

  const saveTrack = (updated: Track) => {
    setLocalTracks(prev => {
      const idx = prev.findIndex(t => t.id === updated.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = updated; return n; }
      return [...prev, updated];
    });
  };

  const totalCritical = localBins.filter(b => b.status === "critical" || b.status === "fire").length;
  const activeTrucks = localTracks.filter(t => t.status === "active").length;
  const totalBins = localBins.length;
  const wardsWithAdmin = new Set(subAdmins.map(a => a.wardId)).size;
  const saveSubAdmin = (form: SubAdminForm) => {
    setSubAdmins(prev => {
      if (form.id) return prev.map(a => a.id === form.id ? form : a);
      return [...prev, { ...form, id: Date.now() }];
    });
  };

  const filteredBins = localBins.filter(b =>
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase()) ||
    b.area.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTracks = localTracks.filter(t =>
    t.truckId.toLowerCase().includes(search.toLowerCase()) ||
    t.driver.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen dark-theme overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-[#0a1f0e] border-r border-[#1a3d22] flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 border-b border-[#1a3d22]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-[#16a34a] rounded-lg flex items-center justify-center"><Trash2 size={14} className="text-white" /></div>
            <div>
              <div className="font-display font-700 text-sm text-white">IntelliWaste</div>
              <div className="text-[#4ade80] text-xs font-mono">CITY CORPORATION</div>
            </div>
          </div>
          <div className="text-[#4b7a5a] text-xs mt-1">Dhaka City Corporation</div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {SIDEBAR.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? "bg-[#16a34a] text-white" : "text-[#4b7a5a] hover:bg-[#0d2414] hover:text-[#86efac]"}`}
            >
              <item.icon size={16} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#1a3d22]">
          <button onClick={onLogout} className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors">
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-[#0a1f0e] border-b border-[#1a3d22] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#4b7a5a]"><Package size={18} /></button>
            <div>
              <div className="font-display font-700 text-white capitalize">
                {SIDEBAR.find(s => s.id === activeTab)?.label ?? "City Overview"}
              </div>
              <div className="text-[#4b7a5a] text-xs font-mono">City Corporation Account · All {wards.length} Wards</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalCritical > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 rounded-lg px-3 py-1.5">
                <Flame size={12} className="text-red-400" />
                <span className="text-red-400 text-xs font-mono">{totalCritical} Critical</span>
              </div>
            )}
            <div className="w-8 h-8 bg-[#16a34a] rounded-full flex items-center justify-center text-xs font-bold text-white">MA</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">

          {/* ── CITY OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Wards",        value: wards.length,       sub: `${wardsWithAdmin} with sub-admin`,    icon: Globe,    color: "#4ade80" },
                  { label: "Total Smart Bins",   value: totalBins,          sub: `${totalCritical} critical / fire`,    icon: Trash2,   color: "#60a5fa" },
                  { label: "Active Trucks",       value: `${activeTrucks}/${localTracks.length}`, sub: "Fleet across all wards", icon: Truck, color: "#facc15" },
                  { label: "Wards Without Admin", value: wards.length - wardsWithAdmin, sub: "Need sub-admin assignment", icon: Users, color: "#f472b6" },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-[#0d2414] border border-[#1a3d22] rounded-xl p-5 hover:border-[#4ade80]/30 transition-all">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: kpi.color + "22" }}>
                      <kpi.icon size={18} style={{ color: kpi.color }} />
                    </div>
                    <div className="font-display font-800 text-2xl text-white mb-0.5">{kpi.value}</div>
                    <div className="text-xs font-mono" style={{ color: kpi.color }}>{kpi.label}</div>
                    <div className="text-[#4b7a5a] text-xs mt-0.5">{kpi.sub}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-[#0d2414] border border-[#1a3d22] rounded-xl p-5">
                  <div className="font-display font-600 text-white mb-4">City-wide Weekly Collection (tons)</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} /><stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} /><stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a3d22" />
                      <XAxis dataKey="day" stroke="#4b7a5a" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                      <YAxis stroke="#4b7a5a" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                      <Tooltip contentStyle={{ background: "#0d2414", border: "1px solid #1a3d22", borderRadius: 8, color: "#e2f5e9", fontSize: 12 }} />
                      <Area type="monotone" dataKey="collected" stroke="#4ade80" fill="url(#cg1)" strokeWidth={2} name="Collected" />
                      <Area type="monotone" dataKey="sorted" stroke="#60a5fa" fill="url(#cg2)" strokeWidth={2} name="Sorted" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-[#0d2414] border border-[#1a3d22] rounded-xl p-5">
                  <div className="font-display font-600 text-white mb-1">Sorting Machine Output</div>
                  <div className="text-[#4b7a5a] text-xs mb-3">Categories after facility sorting</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={outputBreakdown} cx="50%" cy="50%" innerRadius={38} outerRadius={65} dataKey="value" paddingAngle={2}>
                        {outputBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0d2414", border: "1px solid #1a3d22", borderRadius: 8, color: "#e2f5e9", fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {outputBreakdown.map(w => (
                      <div key={w.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: w.color }} />
                        <span className="text-[#4b7a5a] text-xs">{w.name} {w.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ward overview table */}
              <div className="bg-[#0d2414] border border-[#1a3d22] rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[#1a3d22] flex items-center justify-between">
                  <div className="font-display font-600 text-white">All Wards — Quick Overview</div>
                  <button onClick={() => setActiveTab("wards")} className="text-xs text-[#4ade80] hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1a3d22]">
                        {["Ward", "Area", "Population", "Bins", "Tracks", "Sub-Admin", "Critical Bins"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-mono text-[#4b7a5a]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {wards.slice(0, 8).map(w => {
                        const crit = localBins.filter(b => b.wardId === w.id && (b.status === "critical" || b.status === "fire")).length;
                        return (
                          <tr key={w.id} className="border-b border-[#1a3d22] hover:bg-[#061309] transition-colors cursor-pointer" onClick={() => setSelectedWard(w)}>
                            <td className="px-4 py-3 font-mono text-[#4ade80] text-xs">{w.name}</td>
                            <td className="px-4 py-3 text-[#86efac] text-xs">{w.area}</td>
                            <td className="px-4 py-3 text-[#4b7a5a] text-xs font-mono">{w.population.toLocaleString()}</td>
                            <td className="px-4 py-3 text-[#86efac] font-mono text-xs">{w.totalBins}</td>
                            <td className="px-4 py-3 text-[#86efac] font-mono text-xs">{w.activeTracks}</td>
                            <td className="px-4 py-3">
                              {w.subAdmin ? (
                                <span className="text-xs text-[#4ade80]">✓ {w.subAdmin.name.split(" ")[0]}</span>
                              ) : (
                                <span className="text-xs text-yellow-400">⚠ None</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {crit > 0 ? <span className="text-xs text-red-400 font-mono">{crit} critical</span> : <span className="text-xs text-[#4ade80]">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── WARD MANAGEMENT ── */}
          {activeTab === "wards" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b7a5a]" />
                  <input onChange={e => setSearch(e.target.value)} className="w-full bg-[#0d2414] border border-[#1a3d22] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#4b7a5a] focus:border-[#4ade80] outline-none" placeholder="Search ward or area..." />
                </div>
                <button onClick={() => setShowAddSubAdmin(true)} className="bg-[#16a34a] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#15803d] flex items-center gap-2">
                  <Plus size={14} /> Add Sub-Admin
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wards.filter(w => w.area.toLowerCase().includes(search.toLowerCase()) || w.name.toLowerCase().includes(search.toLowerCase())).map(w => {
                  const critBins = localBins.filter(b => b.wardId === w.id && (b.status === "critical" || b.status === "fire")).length;
                  return (
                    <div key={w.id} className="bg-[#0d2414] border border-[#1a3d22] rounded-xl p-5 hover:border-[#4ade80]/30 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-mono font-bold text-[#4ade80] text-sm">{w.name}</div>
                          <div className="font-display font-600 text-white">{w.area}</div>
                          <div className="text-[#4b7a5a] text-xs mt-0.5">Councilor: {w.councilor}</div>
                        </div>
                        {critBins > 0 && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{critBins} critical</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {[
                          { label: "Population", value: (w.population / 1000).toFixed(0) + "K" },
                          { label: "Bins", value: w.totalBins },
                          { label: "Tracks", value: w.activeTracks },
                        ].map(k => (
                          <div key={k.label} className="bg-[#061309] rounded-lg p-2 text-center">
                            <div className="font-mono text-sm font-bold text-[#4ade80]">{k.value}</div>
                            <div className="text-[#4b7a5a] text-xs">{k.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mb-3">
                        {w.subAdmin ? (
                          <div className="flex items-center gap-2 bg-[#061309] border border-[#1a3d22] rounded-lg p-2">
                            <div className="w-7 h-7 bg-[#16a34a] rounded-full flex items-center justify-center text-xs font-bold text-white">{w.subAdmin.name[0]}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-xs font-semibold truncate">{w.subAdmin.name}</div>
                              <div className="text-[#4b7a5a] text-xs">{w.subAdmin.email}</div>
                            </div>
                            <span className={`text-xs font-mono ${w.subAdmin.active ? "text-[#4ade80]" : "text-red-400"}`}>{w.subAdmin.active ? "ACTIVE" : "OFF"}</span>
                          </div>
                        ) : (
                          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-center text-xs text-yellow-400">⚠ No sub-admin assigned</div>
                        )}
                      </div>
                      <button onClick={() => setSelectedWard(w)} className="w-full border border-[#1a3d22] text-[#86efac] text-xs py-2 rounded-lg hover:border-[#4ade80]/40 flex items-center justify-center gap-1.5 transition-colors">
                        <Eye size={12} /> View Ward Details
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ALL BINS ── */}
          {activeTab === "bins" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b7a5a]" />
                  <input onChange={e => setSearch(e.target.value)} className="w-full bg-[#0d2414] border border-[#1a3d22] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#4b7a5a] focus:border-[#4ade80] outline-none" placeholder="Search bin ID, location, area..." />
                </div>
                <button onClick={() => setShowAddBin(true)} className="bg-[#16a34a] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#15803d] flex items-center gap-2">
                  <Plus size={14} /> Add Bin
                </button>
                <button className="border border-[#1a3d22] text-[#86efac] text-sm px-4 py-2 rounded-lg hover:border-[#4ade80]/30 flex items-center gap-2">
                  <Download size={14} /> Export
                </button>
              </div>
              <div className="bg-[#0d2414] border border-[#1a3d22] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1a3d22]">
                        {["Bin ID", "Ward", "Location", "Fill %", "Weight", "Temp", "Gas", "Fire", "Last Collected", "Status", "Actions"].map(h => (
                          <th key={h} className="px-3 py-3 text-left text-xs font-mono text-[#4b7a5a] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBins.map(b => (
                        <tr key={b.id} className="border-b border-[#1a3d22] hover:bg-[#061309] transition-colors">
                          <td className="px-3 py-3 font-mono text-[#4ade80] text-xs whitespace-nowrap">{b.id}</td>
                          <td className="px-3 py-3 text-[#4b7a5a] text-xs whitespace-nowrap">
                            {wards.find(w => w.id === b.wardId)?.name}
                          </td>
                          <td className="px-3 py-3 text-[#86efac] text-xs max-w-[160px] truncate">{b.location}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-[#061309] rounded-full h-1.5">
                                <div className="h-1.5 rounded-full" style={{ width: `${b.fill}%`, background: b.fill > 80 ? "#ef4444" : b.fill > 60 ? "#f59e0b" : "#4ade80" }} />
                              </div>
                              <span className="font-mono text-xs" style={{ color: b.fill > 80 ? "#ef4444" : b.fill > 60 ? "#f59e0b" : "#4ade80" }}>{b.fill}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-[#86efac] whitespace-nowrap">{b.weight} kg</td>
                          <td className="px-3 py-3 font-mono text-xs whitespace-nowrap" style={{ color: b.temp !== "Normal" ? "#ef4444" : "#4ade80" }}>{b.temp}</td>
                          <td className="px-3 py-3 font-mono text-xs whitespace-nowrap" style={{ color: b.gas !== "Normal" ? "#f59e0b" : "#4ade80" }}>{b.gas}</td>
                          <td className="px-3 py-3 font-mono text-xs whitespace-nowrap" style={{ color: b.fire ? "#ef4444" : "#4ade80" }}>{b.fire ? "⚠ YES" : "Clear"}</td>
                          <td className="px-3 py-3 text-[#4b7a5a] text-xs whitespace-nowrap">{b.lastCollected}</td>
                          <td className="px-3 py-3"><StatusBadge status={b.status} /></td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <a href={`https://maps.google.com/?q=${b.lat},${b.lng}`} target="_blank" rel="noreferrer" title="View on Google Maps" className="text-[#4b7a5a] hover:text-[#60a5fa] transition-colors"><Navigation size={13} /></a>
                              <button onClick={() => setEditBin(b)} title="Edit bin" className="text-[#4b7a5a] hover:text-[#4ade80] transition-colors"><Edit3 size={13} /></button>
                              <button onClick={() => setLocalBins(p => p.filter(x => x.id !== b.id))} title="Delete" className="text-[#4b7a5a] hover:text-red-400 transition-colors"><Trash size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── ALL TRACKS ── */}
          {activeTab === "tracks" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b7a5a]" />
                  <input onChange={e => setSearch(e.target.value)} className="w-full bg-[#0d2414] border border-[#1a3d22] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#4b7a5a] focus:border-[#4ade80] outline-none" placeholder="Search truck ID or driver..." />
                </div>
                <button onClick={() => setShowAddTrack(true)} className="bg-[#16a34a] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#15803d] flex items-center gap-2">
                  <Plus size={14} /> Add Track
                </button>
              </div>
              <div className="space-y-3">
                {filteredTracks.map(t => (
                  <div key={t.id} className="bg-[#0d2414] border border-[#1a3d22] rounded-xl p-5 hover:border-[#4ade80]/30 transition-all">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.status === "active" ? "#4ade8022" : t.status === "idle" ? "#facc1522" : "#f59e0b22" }}>
                        <Truck size={20} style={{ color: t.status === "active" ? "#4ade80" : t.status === "idle" ? "#facc15" : "#f59e0b" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="font-mono font-bold text-white">{t.truckId}</span>
                          <StatusBadge status={t.status} />
                          <span className="text-xs text-[#4b7a5a]">{wards.find(w => w.id === t.wardId)?.name} — {wards.find(w => w.id === t.wardId)?.area}</span>
                        </div>
                        <div className="text-[#86efac] text-sm">{t.driver}</div>
                        <div className="text-[#4b7a5a] text-xs mt-0.5 truncate">{t.route}</div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs shrink-0">
                        <div>
                          <div className="text-[#4b7a5a] mb-1">Progress</div>
                          <div className="w-24 bg-[#061309] rounded-full h-1.5 mb-1">
                            <div className="h-1.5 rounded-full bg-[#4ade80]" style={{ width: `${t.progress}%` }} />
                          </div>
                          <div className="font-mono text-[#4ade80]">{t.progress}%</div>
                        </div>
                        <div><div className="text-[#4b7a5a] mb-1">Stops</div><div className="font-mono text-[#86efac]">{t.stops}</div></div>
                        <div><div className="text-[#4b7a5a] mb-1">Load</div><div className="font-mono text-[#86efac]">{t.load}</div></div>
                        <div>
                          <div className="text-[#4b7a5a] mb-1">Fuel</div>
                          <div className="font-mono" style={{ color: t.fuel < 40 ? "#ef4444" : t.fuel < 60 ? "#f59e0b" : "#4ade80" }}>{t.fuel}%</div>
                        </div>
                        <div><div className="text-[#4b7a5a] mb-1">Phone</div><div className="font-mono text-[#86efac] text-xs">{t.phone}</div></div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <a href={t.mapsRouteUrl || `https://maps.google.com/?q=${t.gpsLat},${t.gpsLng}`} target="_blank" rel="noreferrer" title="Track on Google Maps" className="text-[#4b7a5a] hover:text-[#60a5fa] transition-colors"><Navigation size={14} /></a>
                        <button onClick={() => setEditTrack(t)} title="Edit track" className="text-[#4b7a5a] hover:text-[#4ade80] transition-colors"><Edit3 size={14} /></button>
                        <button onClick={() => setLocalTracks(p => p.filter(x => x.id !== t.id))} className="text-[#4b7a5a] hover:text-red-400 transition-colors"><Trash size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SUB-ADMINS ── */}
          {activeTab === "subadmins" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[#4b7a5a] text-sm">{wardsWithAdmin} of {wards.length} wards have sub-admins</div>
                <button onClick={() => setShowAddSubAdmin(true)} className="self-start bg-[#16a34a] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#15803d] flex items-center gap-2">
                  <Plus size={14} /> Create Sub-Admin
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wards.map(w => {
                  const account = subAdmins.find(a => a.wardId === w.id);
                  return (
                  <div key={w.id} className={`bg-[#0d2414] border rounded-xl p-5 ${w.subAdmin ? "border-[#1a3d22]" : "border-yellow-500/20"}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-xs text-[#4ade80]">{w.name}</span>
                      <span className="text-[#4b7a5a] text-xs">—</span>
                      <span className="text-[#86efac] text-xs">{w.area}</span>
                    </div>
                    {account ? (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-[#16a34a] rounded-full flex items-center justify-center font-bold text-white">{account.name[0]}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold text-sm truncate">{account.name}</div>
                            <div className="text-[#4b7a5a] text-xs truncate">@{account.username}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="bg-[#061309] rounded-lg p-2">
                            <div className="text-[#4b7a5a]">Phone</div>
                            <div className="font-mono text-[#86efac] text-xs">{account.phone}</div>
                          </div>
                          <div className="bg-[#061309] rounded-lg p-2">
                            <div className="text-[#4b7a5a]">NID</div>
                            <div className="font-mono text-[#86efac] text-xs truncate">{account.nid}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full font-mono ${account.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{account.active ? "ACTIVE" : "INACTIVE"}</span>
                          <div className="flex gap-2">
                            <button onClick={() => setEditSubAdmin(account)} title="Edit sub-admin" className="text-[#4b7a5a] hover:text-[#4ade80] transition-colors"><Edit3 size={13} /></button>
                            <button onClick={() => setSubAdmins(p => p.filter(a => a.id !== account.id))} title="Delete sub-admin" className="text-[#4b7a5a] hover:text-red-400 transition-colors"><Trash size={13} /></button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-yellow-400 text-xs mb-3">No sub-admin assigned</div>
                        <button onClick={() => setShowAddSubAdmin(true)} className="text-xs text-[#4ade80] border border-[#4ade80]/40 px-4 py-2 rounded-lg hover:bg-[#4ade80]/10 transition-colors flex items-center gap-1.5 mx-auto">
                          <Plus size={12} /> Assign Sub-Admin
                        </button>
                      </div>
                    )}
                  </div>
                )})}
              </div>
            </div>
          )}

          {activeTab === "waste" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-white font-display font-700 text-lg">Ward Waste Collection Ranking</div>
                  <div className="text-[#4b7a5a] text-sm">Verified submissions from ward sub-admins</div>
                </div>
                <button className="self-start border border-[#1a3d22] text-[#86efac] text-sm px-4 py-2 rounded-lg flex items-center gap-2"><Download size={14} /> Export report</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  ["Total collected", "128.4 t", "This month"],
                  ["Top ward", "Ward 13", "18.7 t"],
                  ["Reports received", "142", "15 pending review"],
                ].map(([label, value, sub]) => (
                  <div key={label} className="bg-[#0d2414] border border-[#1a3d22] rounded-xl p-5">
                    <div className="text-[#4b7a5a] text-xs">{label}</div>
                    <div className="text-white text-2xl font-display font-800 mt-1">{value}</div>
                    <div className="text-[#4ade80] text-xs mt-1">{sub}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#0d2414] border border-[#1a3d22] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead><tr className="border-b border-[#1a3d22]">
                      {["Rank", "Ward", "Area", "Collected", "Recycled", "Last submitted", "Status"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-mono text-[#4b7a5a]">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {[13, 9, 11, 6, 1, 5, 15].map((id, index) => {
                        const w = wards.find(item => item.id === id)!;
                        const total = (18.7 - index * 1.35).toFixed(1);
                        return <tr key={id} className="border-b border-[#1a3d22]">
                          <td className="px-4 py-4 font-mono text-[#4ade80]">#{index + 1}</td>
                          <td className="px-4 py-4 text-white">{w.name}</td>
                          <td className="px-4 py-4 text-[#86efac]">{w.area}</td>
                          <td className="px-4 py-4 font-mono text-white">{total} t</td>
                          <td className="px-4 py-4 font-mono text-[#60a5fa]">{(Number(total) * .71).toFixed(1)} t</td>
                          <td className="px-4 py-4 text-[#4b7a5a]">Today, {9 + index}:20</td>
                          <td className="px-4 py-4"><span className="bg-green-500/20 text-green-400 rounded-full px-2 py-1 text-xs">VERIFIED</span></td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── ALERTS ── */}
          {activeTab === "alerts" && (
            <div className="space-y-3">
              {[
                { type: "fire",     msg: "Bin B-012 — Fire/Smoke detected · Mohammadpur Bus Stand",       ward: "Ward 13", time: "3 min ago",  priority: "critical" },
                { type: "overflow", msg: "Bin B-007 — Fill 95% · Gulshan-2, Road 79",                    ward: "Ward 06", time: "11 min ago", priority: "critical" },
                { type: "gas",      msg: "Bin B-004 — Elevated methane · Badda Link Road",                ward: "Ward 05", time: "18 min ago", priority: "high" },
                { type: "overflow", msg: "Bin B-003 — Fill 88% · Uttara Sector 3",                       ward: "Ward 02", time: "25 min ago", priority: "high" },
                { type: "overflow", msg: "Bin B-010 — Fill 87% · Mirpur-10 Roundabout",                  ward: "Ward 11", time: "32 min ago", priority: "high" },
                { type: "maint",    msg: "Track TR-008 — Truck DNCC-T30 maintenance overdue · Kamrangi", ward: "Ward 15", time: "1 hr ago",   priority: "medium" },
              ].map((a, i) => (
                <div key={i} className={`bg-[#0d2414] border rounded-xl p-4 flex items-start gap-3 ${a.priority === "critical" ? "border-red-500/40" : a.priority === "high" ? "border-orange-500/30" : "border-yellow-500/20"}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.type === "fire" ? "bg-red-500/20" : a.type === "gas" ? "bg-yellow-500/20" : "bg-orange-500/20"}`}>
                    {a.type === "fire" ? <Flame size={16} className="text-red-400" /> :
                     a.type === "gas" ? <Wind size={16} className="text-yellow-400" /> :
                     <AlertTriangle size={16} className="text-orange-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm mb-0.5">{a.msg}</div>
                    <div className="flex items-center gap-3 text-xs text-[#4b7a5a]">
                      <span className="font-mono text-[#4ade80]">{a.ward}</span>
                      <span>{a.time}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-mono shrink-0 ${a.priority === "critical" ? "bg-red-500/20 text-red-400" : a.priority === "high" ? "bg-orange-500/20 text-orange-400" : "bg-yellow-500/20 text-yellow-400"}`}>{a.priority.toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── COMPLIANCE ── */}
          {activeTab === "compliance" && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Audit Reports", value: "184", color: "#4ade80" },
                  { label: "CoD Certificates", value: "63", color: "#60a5fa" },
                  { label: "Hazardous Chain-of-Custody", value: "421", color: "#a78bfa" },
                ].map(k => (
                  <div key={k.label} className="bg-[#0d2414] border border-[#1a3d22] rounded-xl p-5 text-center">
                    <div className="font-mono text-3xl font-bold mb-1" style={{ color: k.color }}>{k.value}</div>
                    <div className="text-[#4b7a5a] text-sm">{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#0d2414] border border-[#1a3d22] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-display font-600 text-white">City-wide Compliance Log</div>
                  <button className="flex items-center gap-1.5 text-xs text-[#4ade80] border border-[#4ade80]/30 px-3 py-1.5 rounded-lg hover:bg-[#4ade80]/10">
                    <Download size={12} /> Export CSV
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { action: "Certificate of Destruction", item: "Medical waste — Ward 06 Clinic", ward: "Ward 06", time: "Today 09:14" },
                    { action: "Hazardous chain-of-custody logged", item: "Battery waste — Ward 11 industrial", ward: "Ward 11", time: "Today 08:52" },
                    { action: "Monthly audit report generated", item: "All wards — Zone A + B", ward: "All Wards", time: "Yesterday 17:30" },
                    { action: "EPA Bangladesh quarterly report submitted", item: "Q3 2026 environmental compliance", ward: "City Corp", time: "Sep 01, 2026" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-start gap-3 py-3 border-b border-[#1a3d22] last:border-0">
                      <Shield size={14} className="text-[#4ade80] mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm">{log.action}</div>
                        <div className="text-[#4b7a5a] text-xs">{log.item}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-xs text-[#4ade80]">{log.ward}</div>
                        <div className="text-[#4b7a5a] text-xs">{log.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showAddBin && <BinModal title="Add New Bin" onClose={() => setShowAddBin(false)} onSave={saveBin} />}
      {editBin && <BinModal title="Edit Bin" initial={editBin} onClose={() => setEditBin(null)} onSave={saveBin} />}
      {showAddTrack && <TrackModal title="Add New Track" onClose={() => setShowAddTrack(false)} onSave={saveTrack} />}
      {editTrack && <TrackModal title="Edit Track" initial={editTrack} onClose={() => setEditTrack(null)} onSave={saveTrack} />}
      {showAddSubAdmin && <AddSubAdminModal onClose={() => setShowAddSubAdmin(false)} onSave={saveSubAdmin} />}
      {editSubAdmin && <AddSubAdminModal initial={editSubAdmin} onClose={() => setEditSubAdmin(null)} onSave={saveSubAdmin} />}
      {selectedWard && <WardDetailModal ward={selectedWard} onClose={() => setSelectedWard(null)} />}
    </div>
  );
}
