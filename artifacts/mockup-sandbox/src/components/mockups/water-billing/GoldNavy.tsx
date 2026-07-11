import React from "react";
import { 
  Users, 
  Droplet, 
  Receipt, 
  FileText, 
  Settings, 
  LayoutDashboard, 
  LogOut,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Wallet
} from "lucide-react";

export function GoldNavy() {
  const navy = "#1B2B5E";
  const navyLight = "#263B7A";
  const gold = "#D4A853";
  const goldLight = "#E8C680";
  const surface = "#FFFFFF";
  const textDark = "#1E293B";
  const textMuted = "#64748B";

  return (
    <div style={{
      width: 390,
      minHeight: 844,
      margin: '0 auto',
      backgroundColor: '#F4F6F8',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Area - Navy */}
      <div style={{
        backgroundColor: navy,
        padding: '50px 20px 24px',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 4px 20px rgba(27, 43, 94, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 12, 
              backgroundColor: gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Droplet size={24} color={navy} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>AquaBill</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>Good morning, Admin</p>
            </div>
          </div>
          <button style={{ 
            background: 'rgba(255,255,255,0.1)', 
            border: 'none', 
            width: 36, 
            height: 36, 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <LogOut size={18} color="white" />
          </button>
        </div>

        {/* Monthly Revenue Banner */}
        <div style={{
          backgroundColor: navyLight,
          borderRadius: 16,
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: `1px solid rgba(212, 168, 83, 0.3)`
        }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Month Revenue</p>
            <h2 style={{ color: gold, fontSize: 32, fontWeight: 700, margin: 0, fontFamily: 'Georgia, serif' }}>₹0</h2>
          </div>
          <div style={{
            backgroundColor: 'rgba(212, 168, 83, 0.15)',
            padding: '8px 12px',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <TrendingUp size={14} color={gold} />
            <span style={{ color: gold, fontSize: 12, fontWeight: 600 }}>0.0%</span>
          </div>
        </div>
      </div>

      {/* Main Content Scrollable */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '24px 20px 100px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        
        {/* Quick Stats Grid */}
        <div>
          <h3 style={{ color: navy, fontSize: 16, fontWeight: 600, margin: '0 0 12px 4px' }}>Overview</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 12 
          }}>
            <StatCard title="Total Customers" value="0" icon={<Users size={20} color={navy} />} />
            <StatCard title="Today's Entries" value="0" icon={<FileText size={20} color={navy} />} />
            <StatCard title="Today's Collection" value="₹0" icon={<Wallet size={20} color={navy} />} highlight />
            <StatCard title="Pending Entries" value="0" icon={<AlertCircle size={20} color={navy} />} alert />
          </div>
        </div>

        {/* Billing Overview Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingLeft: 4 }}>
            <h3 style={{ color: navy, fontSize: 16, fontWeight: 600, margin: 0 }}>Recent Bills</h3>
            <button style={{ 
              background: 'none', 
              border: 'none', 
              color: gold, 
              fontSize: 14, 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}>
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          {/* Empty State */}
          <div style={{
            backgroundColor: surface,
            borderRadius: 16,
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: 'rgba(27, 43, 94, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Receipt size={32} color={navy} opacity={0.5} />
            </div>
            <h4 style={{ color: textDark, fontSize: 16, fontWeight: 600, margin: '0 0 8px 0' }}>No bills generated yet</h4>
            <p style={{ color: textMuted, fontSize: 14, margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Generate your first water bill for the current billing cycle.
            </p>
            <button style={{
              backgroundColor: gold,
              color: navy,
              border: 'none',
              padding: '12px 24px',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(212, 168, 83, 0.3)'
            }}>
              <PlusCircle size={18} />
              Generate Bill
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: surface,
        borderTop: '1px solid rgba(0,0,0,0.05)',
        padding: '12px 20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.03)',
        zIndex: 20
      }}>
        <TabItem icon={<LayoutDashboard />} label="Home" active />
        <TabItem icon={<Users />} label="Users" />
        <TabItem icon={<FileText />} label="Entries" />
        <TabItem icon={<Receipt />} label="Bills" />
        <TabItem icon={<TrendingUp />} label="Reports" />
        <TabItem icon={<Settings />} label="Settings" />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, highlight = false, alert = false }: { title: string, value: string, icon: React.ReactNode, highlight?: boolean, alert?: boolean }) {
  const gold = "#D4A853";
  const navy = "#1B2B5E";
  const surface = "#FFFFFF";

  return (
    <div style={{
      backgroundColor: surface,
      padding: '16px',
      borderRadius: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      border: `1px solid ${highlight ? gold : 'rgba(0,0,0,0.03)'}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {highlight && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: gold }} />
      )}
      {alert && (
        <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' }} />
      )}
      <div style={{ 
        width: 36, 
        height: 36, 
        borderRadius: 10, 
        backgroundColor: 'rgba(27, 43, 94, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12
      }}>
        {icon}
      </div>
      <h4 style={{ color: '#64748B', fontSize: 12, fontWeight: 500, margin: '0 0 4px 0' }}>{title}</h4>
      <p style={{ 
        color: highlight ? navy : '#1E293B', 
        fontSize: 22, 
        fontWeight: 700, 
        margin: 0,
        fontFamily: highlight ? 'Georgia, serif' : 'system-ui, -apple-system, sans-serif'
      }}>{value}</p>
    </div>
  );
}

function TabItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  const navy = "#1B2B5E";
  const gold = "#D4A853";
  const textMuted = "#94A3B8";

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      color: active ? navy : textMuted,
      cursor: 'pointer'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        color: active ? navy : textMuted
      }}>
        {React.cloneElement(icon as React.ReactElement, { 
          size: 22, 
          strokeWidth: active ? 2.5 : 2,
          color: active ? navy : textMuted
        })}
        {active && (
          <div style={{
            position: 'absolute',
            bottom: -6,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: gold
          }} />
        )}
      </div>
      <span style={{ 
        fontSize: 10, 
        fontWeight: active ? 600 : 500,
        color: active ? navy : textMuted 
      }}>
        {label}
      </span>
    </div>
  );
}
