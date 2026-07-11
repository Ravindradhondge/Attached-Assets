import React from "react";
import {
  LogOut,
  Users,
  Droplet,
  IndianRupee,
  Clock,
  LayoutDashboard,
  FileText,
  PieChart,
  Settings,
  ChevronRight,
  TrendingUp,
  FileClock
} from "lucide-react";

export function SlateClean() {
  return (
    <div
      style={{
        width: 390,
        minHeight: 844,
        margin: "0 auto",
        overflowY: "auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#FFFFFF",
        position: "relative",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.1)",
        borderRadius: 40, // To look like a phone screen boundary
      }}
      className="text-slate-700 flex flex-col"
    >
      {/* Status Bar Mockup */}
      <div className="h-12 flex items-end justify-between px-6 pb-2 text-[13px] font-medium text-slate-900">
        <span>9:41</span>
        <div className="flex gap-1.5 items-center">
          <div className="w-4 h-3 bg-slate-900 rounded-sm" />
          <div className="w-3 h-3 bg-slate-900 rounded-full" />
          <div className="w-4 h-3 bg-slate-900 rounded-sm" />
        </div>
      </div>

      {/* Header */}
      <header className="px-6 pt-4 pb-6">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Water Billing
          </h1>
          <button className="p-2 -mr-2 text-slate-400 hover:text-slate-600 transition-colors">
            <LogOut size={20} strokeWidth={2} />
          </button>
        </div>
        <p className="text-sm text-slate-500">Good morning, Admin</p>
      </header>

      <main className="flex-1 px-6 pb-24 flex flex-col gap-8">
        {/* Monthly Revenue Banner */}
        <div className="bg-[#10B981]/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#10B981] mb-1">
              Current Month Revenue
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">₹0</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Quick Stats */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
              Quick Stats
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Users size={16} />
                <span className="text-xs font-medium">Total Customers</span>
              </div>
              <p className="text-xl font-semibold text-slate-900">0</p>
            </div>
            
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Droplet size={16} />
                <span className="text-xs font-medium">Today's Entries</span>
              </div>
              <p className="text-xl font-semibold text-slate-900">0</p>
            </div>
            
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <IndianRupee size={16} />
                <span className="text-xs font-medium">Today's Collection</span>
              </div>
              <p className="text-xl font-semibold text-slate-900">₹0</p>
            </div>
            
            <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Clock size={16} />
                <span className="text-xs font-medium">Pending Entries</span>
              </div>
              <p className="text-xl font-semibold text-slate-900">0</p>
            </div>
          </div>
        </section>

        {/* Billing Overview */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
              Billing Overview
            </h2>
            <button className="text-xs font-medium text-[#10B981] flex items-center">
              View All <ChevronRight size={14} className="ml-0.5" />
            </button>
          </div>
          
          <div className="py-8 px-4 rounded-2xl border border-slate-100 border-dashed bg-slate-50/50 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm mb-3">
              <FileClock size={24} />
            </div>
            <p className="text-sm font-medium text-slate-900 mb-1">No bills generated yet</p>
            <p className="text-xs text-slate-500 max-w-[200px]">
              Generate your first bill to see the overview here.
            </p>
          </div>
        </section>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="absolute bottom-0 left-0 right-0 h-[84px] bg-white border-t border-slate-100 pb-safe flex justify-between items-center px-2 rounded-b-[40px]">
        <button className="flex-1 flex flex-col items-center justify-center gap-1 h-full pt-2 pb-1">
          <LayoutDashboard size={22} className="text-[#10B981]" strokeWidth={2.5} />
          <span className="text-[10px] font-medium text-[#10B981]">Home</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1 h-full pt-2 pb-1 text-slate-400 hover:text-slate-600 transition-colors">
          <Users size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Customers</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1 h-full pt-2 pb-1 text-slate-400 hover:text-slate-600 transition-colors">
          <Droplet size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Entries</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1 h-full pt-2 pb-1 text-slate-400 hover:text-slate-600 transition-colors">
          <FileText size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Bills</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1 h-full pt-2 pb-1 text-slate-400 hover:text-slate-600 transition-colors">
          <PieChart size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Reports</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center gap-1 h-full pt-2 pb-1 text-slate-400 hover:text-slate-600 transition-colors">
          <Settings size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>
    </div>
  );
}
