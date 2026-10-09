import { useState } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  Activity,
  Plus,
  Search,
  Edit3,
  Trash2,
  LogOut,
  X,
  Save,
  Globe2,
  Truck,
  Database,
} from "lucide-react";
import { bins, tracks, wards } from "../data/cityData";

interface SuperAdminPanelProps {
  onLogout: () => void;
}

type AccountRole = "City Corporation" | "Ward Sub-Admin" | "Citizen" | "Track Driver" | "Shop / Restaurant";

interface ManagedAccount {
  id: number;
  role: AccountRole;
  organization: string;
  fullName: string;
  username: string;
  password: string;
  phone: string;
  email: string;
  nid: string;
  address: string;
  area: string;
  active: boolean;
}

const initialAccounts: ManagedAccount[] = [
  {
    id: 1,
    role: "City Corporation",
    organization: "Dhaka North City Corporation",
    fullName: "Operations Director",
    username: "city.admin",
    password: "admin123",
    phone: "01711-100001",
    email: "operations@dncc.gov.bd",
    nid: "1987000000001",
    address: "Nagar Bhaban, Gulshan Centre, Dhaka",
    area: "All 15 wards",
    active: true,
  },
  ...wards.flatMap((ward) =>
    ward.subAdmin
      ? [
          {
            id: ward.subAdmin.id + 10,
            role: "Ward Sub-Admin" as const,
            organization: "Dhaka North City Corporation",
            fullName: ward.subAdmin.name,
            username: `ward${String(ward.id).padStart(2, "0")}.admin`,
            password: "ward123",
            phone: ward.subAdmin.phone,
            email: ward.subAdmin.email,
            nid: `1990${String(ward.id).padStart(9, "0")}`,
            address: `${ward.area}, Dhaka`,
            area: `${ward.name} — ${ward.area}`,
            active: ward.subAdmin.active,
          },
        ]
      : [],
  ),
];

const emptyAccount: Omit<ManagedAccount, "id"> = {
  role: "City Corporation",
  organization: "",
  fullName: "",
  username: "",
  password: "",
  phone: "",
  email: "",
  nid: "",
  address: "",
  area: "",
  active: true,
};

export default function SuperAdminPanel({ onLogout }: SuperAdminPanelProps) {
  const [tab, setTab] = useState<"overview" | "accounts" | "system">("overview");
  const [accounts, setAccounts] = useState(initialAccounts);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<ManagedAccount | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<ManagedAccount, "id">>(emptyAccount);
  const [error, setError] = useState("");

  const openCreate = () => {
    setForm(emptyAccount);
    setEditing(null);
    setError("");
    setCreating(true);
  };

  const openEdit = (account: ManagedAccount) => {
    const { id: _id, ...details } = account;
    setForm(details);
    setEditing(account);
    setError("");
    setCreating(true);
  };

  const saveAccount = () => {
    if (!form.organization || !form.fullName || !form.username || !form.password || !form.phone || !form.email || !form.nid || !form.address || !form.area) {
      setError("Complete every required account field.");
      return;
    }
    if (accounts.some((account) => account.username === form.username && account.id !== editing?.id)) {
      setError("This username is already assigned.");
      return;
    }
    setAccounts((current) =>
      editing
        ? current.map((account) => (account.id === editing.id ? { ...form, id: editing.id } : account))
        : [...current, { ...form, id: Date.now() }],
    );
    setCreating(false);
  };

  const filteredAccounts = accounts.filter((account) =>
    [account.fullName, account.username, account.organization, account.area, account.role]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#061309] text-white">
      <header className="sticky top-0 z-30 bg-[#0a1f0e] border-b border-[#1a3d22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#16a34a] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="min-w-0">
              <div className="font-display font-800 truncate">IntelliWaste Main Admin</div>
              <div className="text-[#4ade80] text-xs font-mono">GLOBAL CONTROL ACCOUNT</div>
            </div>
          </div>
          <button onClick={onLogout} className="text-red-400 text-xs flex items-center gap-2 shrink-0">
            <LogOut size={14} /> <span className="hidden sm:inline">Secure logout</span>
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto scrollbar-hide">
          {[
            { id: "overview", label: "Global Overview", icon: Globe2 },
            { id: "accounts", label: "Account Control", icon: Users },
            { id: "system", label: "System Oversight", icon: Activity },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as typeof tab)}
              className={`py-3 px-4 text-sm whitespace-nowrap flex items-center gap-2 border-b-2 ${tab === item.id ? "border-[#4ade80] text-[#4ade80]" : "border-transparent text-[#4b7a5a]"}`}
            >
              <item.icon size={15} /> {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {tab === "overview" && (
          <div className="space-y-5">
            <div>
              <div className="font-display font-800 text-2xl">Global operations overview</div>
              <div className="text-[#4b7a5a] text-sm mt-1">Full visibility across corporations, wards, bins, tracks and managed accounts.</div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: "Corporation Accounts", value: accounts.filter((account) => account.role === "City Corporation").length, icon: Building2 },
                { label: "All Managed Accounts", value: accounts.length, icon: Users },
                { label: "Smart Bins", value: bins.length, icon: Database },
                { label: "Collection Tracks", value: tracks.length, icon: Truck },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#0d2414] border border-[#1a3d22] rounded-xl p-4 sm:p-5">
                  <stat.icon size={18} className="text-[#4ade80] mb-3" />
                  <div className="font-display font-800 text-2xl">{stat.value}</div>
                  <div className="text-[#4b7a5a] text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-[#0d2414] border border-[#1a3d22] rounded-xl p-5">
                <div className="font-display font-700 mb-4">Account health</div>
                <div className="space-y-3">
                  {accounts.slice(0, 6).map((account) => (
                    <div key={account.id} className="flex items-center gap-3 p-3 bg-[#061309] rounded-xl">
                      <div className="w-9 h-9 bg-[#16a34a]/20 text-[#4ade80] rounded-lg flex items-center justify-center font-bold">{account.fullName[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{account.fullName}</div>
                        <div className="text-[#4b7a5a] text-xs truncate">{account.role} · {account.area}</div>
                      </div>
                      <span className={account.active ? "text-green-400 text-xs" : "text-red-400 text-xs"}>{account.active ? "ACTIVE" : "SUSPENDED"}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0d2414] border border-[#1a3d22] rounded-xl p-5">
                <div className="font-display font-700 mb-4">Global control</div>
                <div className="space-y-3 text-sm">
                  {["Create City Corporation and ward accounts", "Create citizen and driver accounts", "Create shop and restaurant accounts", "Suspend or restore any account", "View all bins, tracks and ward data"].map((permission) => (
                    <div key={permission} className="flex gap-2 text-[#86efac]"><ShieldCheck size={14} className="text-[#4ade80] shrink-0 mt-0.5" /> {permission}</div>
                  ))}
                </div>
                <button onClick={() => setTab("accounts")} className="w-full bg-[#16a34a] rounded-xl py-3 text-sm font-semibold mt-5">Manage accounts</button>
              </div>
            </div>
          </div>
        )}

        {tab === "accounts" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b7a5a]" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search account, username, area..." className="w-full bg-[#0d2414] border border-[#1a3d22] rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#4ade80]" />
              </div>
              <button onClick={openCreate} className="bg-[#16a34a] rounded-xl px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2"><Plus size={15} /> Create account</button>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAccounts.map((account) => (
                <div key={account.id} className="bg-[#0d2414] border border-[#1a3d22] rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[#4ade80] text-xs font-mono">{account.role.toUpperCase()}</div>
                      <div className="font-display font-700 mt-1">{account.fullName}</div>
                      <div className="text-[#4b7a5a] text-xs">@{account.username}</div>
                    </div>
                    <button onClick={() => setAccounts((current) => current.map((item) => item.id === account.id ? { ...item, active: !item.active } : item))} className={`text-xs px-2 py-1 rounded-full ${account.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{account.active ? "ACTIVE" : "SUSPENDED"}</button>
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    <div><span className="text-[#4b7a5a]">Organization:</span> <span className="text-[#86efac]">{account.organization}</span></div>
                    <div><span className="text-[#4b7a5a]">Area:</span> <span className="text-[#86efac]">{account.area}</span></div>
                    <div><span className="text-[#4b7a5a]">Phone:</span> <span className="text-[#86efac]">{account.phone}</span></div>
                    <div><span className="text-[#4b7a5a]">Email:</span> <span className="text-[#86efac]">{account.email}</span></div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-[#1a3d22]">
                    <button onClick={() => openEdit(account)} className="flex-1 border border-[#1a3d22] rounded-lg py-2 text-xs text-[#4ade80] flex items-center justify-center gap-1"><Edit3 size={12} /> Edit</button>
                    <button onClick={() => setAccounts((current) => current.filter((item) => item.id !== account.id))} className="flex-1 border border-red-500/20 rounded-lg py-2 text-xs text-red-400 flex items-center justify-center gap-1"><Trash2 size={12} /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "system" && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-4">
              {[["Platform status", "Operational"], ["Data synchronization", "Live"], ["Account security", "Protected"]].map(([label, value]) => (
                <div key={label} className="bg-[#0d2414] border border-[#1a3d22] rounded-xl p-5">
                  <Activity size={18} className="text-[#4ade80] mb-3" />
                  <div className="text-[#4b7a5a] text-xs">{label}</div>
                  <div className="text-[#4ade80] font-display font-700 mt-1">{value}</div>
                </div>
              ))}
            </div>
            <div className="bg-[#0d2414] border border-[#1a3d22] rounded-xl p-5">
              <div className="font-display font-700 mb-4">System coverage</div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[["Wards", wards.length], ["Bins online", bins.filter((bin) => bin.status !== "fire").length], ["Active tracks", tracks.filter((track) => track.status === "active").length], ["Managed users", accounts.length]].map(([label, value]) => (
                  <div key={label} className="bg-[#061309] rounded-xl p-4"><div className="text-2xl font-display font-800">{value}</div><div className="text-[#4b7a5a] text-xs">{label}</div></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {creating && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center p-4" onClick={() => setCreating(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0d2414] border border-[#1a3d22] rounded-2xl p-5 sm:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div><div className="font-display font-700">{editing ? "Edit managed account" : "Create managed account"}</div><div className="text-[#4b7a5a] text-xs mt-1">Main Admin has full account authority.</div></div>
              <button onClick={() => setCreating(false)} className="text-[#4b7a5a]"><X size={17} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as AccountRole }))} className="bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-[#86efac] text-sm outline-none">
                <option>City Corporation</option><option>Ward Sub-Admin</option><option>Citizen</option><option>Track Driver</option><option>Shop / Restaurant</option>
              </select>
              <input value={form.organization} onChange={(event) => setForm((current) => ({ ...current, organization: event.target.value }))} placeholder="City Corporation / organization" className="bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-sm outline-none" />
              <input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="Full name" className="bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-sm outline-none" />
              <input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} placeholder="Username" className="bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-sm outline-none" />
              <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Account password" className="bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-sm outline-none" />
              <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone number" className="bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-sm outline-none" />
              <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email address" className="bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-sm outline-none" />
              <input value={form.nid} onChange={(event) => setForm((current) => ({ ...current, nid: event.target.value }))} placeholder="NID number" className="bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-sm outline-none" />
              <select value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} className="bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-[#86efac] text-sm outline-none">
                <option value="">Assign area</option>
                <option>All wards</option>
                {wards.map((ward) => <option key={ward.id}>{ward.name} — {ward.area}</option>)}
              </select>
              <input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} placeholder="Full address" className="sm:col-span-2 bg-[#061309] border border-[#1a3d22] rounded-xl px-4 py-3 text-sm outline-none" />
            </div>
            {error && <div className="text-red-400 text-xs mt-3">{error}</div>}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setCreating(false)} className="flex-1 border border-[#1a3d22] rounded-xl py-3 text-sm text-[#4b7a5a]">Cancel</button>
              <button onClick={saveAccount} className="flex-1 bg-[#16a34a] rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2"><Save size={14} /> Save account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
