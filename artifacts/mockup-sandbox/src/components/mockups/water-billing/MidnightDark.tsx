import React from "react";
import { 
  LogOut, 
  Users, 
  Droplet, 
  IndianRupee, 
  AlertCircle,
  Home,
  FileText,
  PieChart,
  Settings,
  CreditCard
} from "lucide-react";

export function MidnightDark() {
  return (
    <div 
      style={{
        width: 390, 
        minHeight: 844, 
        margin: '0 auto', 
        overflowY: 'auto', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#0B0F19', // Deep dark slate
        color: '#E2E8F0',
        position: 'relative',
        paddingBottom: 80, // for bottom bar
        boxShadow: '0 0 50px rgba(0,0,0,0.5)'
      }}
      className="antialiased selection:bg-indigo-500/30"
    >
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/20 blur-[100px] pointer-events-none rounded-full -translate-y-1/2"></div>
      
      {/* Header */}
      <header className="px-6 pt-12 pb-6 relative z-10 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-indigo-400 mb-1 tracking-wide uppercase">Water Billing</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Good Morning, Admin</h1>
        </div>
        <button className="p-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-all active:scale-95">
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-6 relative z-10">
        
        {/* Monthly Revenue Banner */}
        <div className="relative overflow-hidden rounded-2xl p-6 border border-indigo-500/20 bg-gradient-to-br from-indigo-900/40 to-slate-900/80 backdrop-blur-md shadow-lg shadow-indigo-900/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <p className="text-indigo-200 text-sm font-medium mb-1">Current Month Revenue</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white tracking-tight">₹0</span>
              <span className="text-slate-400 text-sm">.00</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                On track
              </span>
            </div>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            icon={<Users size={18} className="text-blue-400" />} 
            title="Total Customers" 
            value="0" 
            glowColor="rgba(96, 165, 250, 0.15)"
          />
          <StatCard 
            icon={<Droplet size={18} className="text-cyan-400" />} 
            title="Today's Entries" 
            value="0" 
            glowColor="rgba(34, 211, 238, 0.15)"
          />
          <StatCard 
            icon={<IndianRupee size={18} className="text-emerald-400" />} 
            title="Today's Collection" 
            value="₹0" 
            glowColor="rgba(52, 211, 153, 0.15)"
          />
          <StatCard 
            icon={<AlertCircle size={18} className="text-rose-400" />} 
            title="Pending Entries" 
            value="0" 
            glowColor="rgba(251, 113, 133, 0.15)"
          />
        </div>

        {/* Billing Overview */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-semibold text-white tracking-tight">Billing Overview</h2>
            <button className="text-xs text-indigo-400 font-medium hover:text-indigo-300">View All</button>
          </div>
          
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-8 text-center flex flex-col items-center justify-center min-h-[160px]">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
              <FileText size={20} className="text-slate-500" />
            </div>
            <p className="text-slate-300 font-medium mb-1">No recent activity</p>
            <p className="text-slate-500 text-xs text-center max-w-[200px]">
              Bills generated and payments collected will appear here.
            </p>
          </div>
        </div>

      </main>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 w-[390px] h-[84px] bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 flex justify-between items-center px-6 pb-6 pt-3 z-50">
        <Tab icon={<Home size={22} />} label="Home" active />
        <Tab icon={<Users size={22} />} label="Customers" />
        <Tab icon={<Droplet size={22} />} label="Entries" />
        <Tab icon={<CreditCard size={22} />} label="Bills" />
        <Tab icon={<PieChart size={22} />} label="Reports" />
        <Tab icon={<Settings size={22} />} label="Settings" />
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, glowColor }: { icon: React.ReactNode, title: string, value: string, glowColor: string }) {
  return (
    <div 
      className="rounded-2xl p-4 border border-slate-700/50 bg-slate-800/40 backdrop-blur-md relative overflow-hidden group"
    >
      <div 
        className="absolute inset-0 opacity-50 pointer-events-none transition-opacity duration-300 group-hover:opacity-100" 
        style={{ background: `radial-gradient(circle at top right, ${glowColor}, transparent 70%)` }}
      ></div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700/50">
            {icon}
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-xs font-medium mb-1 truncate">{title}</p>
          <p className="text-xl font-bold text-white tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Tab({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-1.5 transition-colors ${active ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
      <div className="relative">
        {icon}
        {active && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
