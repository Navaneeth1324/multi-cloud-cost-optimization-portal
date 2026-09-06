import React from 'react';
import { 
  Cloud, 
  ShieldCheck, 
  UserCheck, 
  Bell, 
  UploadCloud, 
  FileDown, 
  Sparkles, 
  Layers, 
  Cpu, 
  HardDrive, 
  DollarSign, 
  Wrench, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { CloudProvider, UserRole, FinOpsAlert } from '../types/finops';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProvider: 'All' | CloudProvider;
  setSelectedProvider: (provider: 'All' | CloudProvider) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  alerts: FinOpsAlert[];
  onOpenIngestion: () => void;
  onOpenReport: () => void;
  onOpenCopilot: () => void;
  totalSpend: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedProvider,
  setSelectedProvider,
  userRole,
  setUserRole,
  alerts,
  onOpenIngestion,
  onOpenReport,
  onOpenCopilot,
  totalSpend
}) => {
  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;

  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: Layers },
    { id: 'compute', label: 'Compute Optimization', icon: Cpu, badge: 'FR-002' },
    { id: 'storage', label: 'Storage & Disks', icon: HardDrive, badge: 'FR-003' },
    { id: 'budgets', label: 'Budgets & Alerts', icon: DollarSign, badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : undefined },
    { id: 'remediation', label: 'Remediation Hub', icon: Wrench, badge: 'FR-005' },
    { id: 'scenarios', label: 'What-If Planner', icon: SlidersHorizontal }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0E1322]/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner / Ticker */}
      <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/30 border-b border-slate-800/80 px-4 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">Live Multi-Cloud Telemetry Ingest:</span>
          <span className="font-semibold text-emerald-400">AWS (112233445566) • Azure (sub-corp-01) • GCP (prod-analytics)</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-slate-300">
            Current Run-Rate: <span className="font-mono font-bold text-white">${totalSpend.toLocaleString()}/mo</span>
          </div>
          <div className="h-3 w-px bg-slate-700"></div>
          <div className="flex items-center space-x-1 text-slate-400">
            <span>FinOps Standard:</span>
            <span className="text-blue-400 font-semibold">FOCUS 1.0 Compliant</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
                  CloudCost IQ
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                  v2.4 FinOps
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">Multi-Cloud Cost Optimization Portal</p>
            </div>
          </div>

          {/* Cloud Provider Filter */}
          <div className="hidden md:flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            {(['All', 'AWS', 'Azure', 'GCP', 'Kubernetes'] as const).map((prov) => (
              <button
                key={prov}
                onClick={() => setSelectedProvider(prov)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedProvider === prov
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {prov === 'All' ? 'All Clouds' : prov}
              </button>
            ))}
          </div>

          {/* Right Action Tools & RBAC */}
          <div className="flex items-center space-x-2.5">
            {/* AI Copilot Button */}
            <button
              onClick={onOpenCopilot}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-300 hover:border-purple-500/60 transition-all shadow-sm"
              title="AI FinOps Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* CSV Ingestion Button (UC-01 / FR-001) */}
            <button
              onClick={onOpenIngestion}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              title="Ingest Multi-Cloud Billing CSV"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Ingest CSV</span>
            </button>

            {/* Report Export Button (UC-07) */}
            <button
              onClick={onOpenReport}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              title="Export FinOps Executive Report"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            {/* Role Switcher (UC-09 / NFR-002) */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setUserRole('FinOps Analyst')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-all ${
                  userRole === 'FinOps Analyst'
                    ? 'bg-slate-800 text-blue-400 font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="FinOps Analyst Role: Analytics, scenario modeling & budgets"
              >
                <UserCheck className="w-3 h-3" />
                <span className="hidden lg:inline">Analyst</span>
              </button>
              <button
                onClick={() => setUserRole('Cloud Administrator')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-all ${
                  userRole === 'Cloud Administrator'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Cloud Administrator Role: Full remediation execution & MFA credentials"
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span className="hidden lg:inline">Admin (MFA)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Links */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                      item.id === 'budgets' && unreadAlertsCount > 0
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
