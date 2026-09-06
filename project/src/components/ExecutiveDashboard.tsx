import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  Cpu, 
  HardDrive, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowUpRight,
  Sparkles,
  Zap,
  Layers,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { FinOpsKPIs, ComputeAsset, StorageAsset, BudgetConfig } from '../types/finops';

interface DashboardProps {
  kpis: FinOpsKPIs;
  computeAssets: ComputeAsset[];
  storageAssets: StorageAsset[];
  budgets: BudgetConfig[];
  onNavigateTab: (tab: string) => void;
}

export const ExecutiveDashboard: React.FC<DashboardProps> = ({
  kpis,
  computeAssets,
  storageAssets,
  budgets,
  onNavigateTab
}) => {
  // Monthly Spend Trend Data (Multi-Cloud)
  const spendTrendData = [
    { month: 'Apr', AWS: 59200, Azure: 32400, GCP: 14800, K8s: 2100 },
    { month: 'May', AWS: 61400, Azure: 34100, GCP: 15600, K8s: 2200 },
    { month: 'Jun', AWS: 63800, Azure: 35800, GCP: 16900, K8s: 2300 },
    { month: 'Jul', AWS: 66100, Azure: 37200, GCP: 17400, K8s: 2400 },
    { month: 'Aug', AWS: 68400, Azure: 38200, GCP: 18100, K8s: 2500 },
    { month: 'Sep (Est)', AWS: 67100, Azure: 37500, GCP: 17800, K8s: 2450 }
  ];

  // Department Allocation Data
  const departmentData = Object.entries(kpis.departmentBreakdown).map(([name, value]) => ({
    name,
    value
  }));

  const DEPT_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];
  const CLOUD_COLORS = {
    AWS: '#FF9900',
    Azure: '#0089D6',
    GCP: '#4285F4',
    Kubernetes: '#326CE5'
  };

  // Waste Breakdown by Category
  const wasteBreakdownData = [
    {
      category: 'Idle Compute (<5% CPU)',
      amount: computeAssets
        .filter(c => c.recommendation.status === 'IDLE' && !c.recommendation.isExempt)
        .reduce((sum, c) => sum + c.recommendation.monthlySavings, 0),
      count: computeAssets.filter(c => c.recommendation.status === 'IDLE' && !c.recommendation.isExempt).length,
      tab: 'compute'
    },
    {
      category: 'Oversized Compute (5-15%)',
      amount: computeAssets
        .filter(c => c.recommendation.status === 'UNDERUTILIZED')
        .reduce((sum, c) => sum + c.recommendation.monthlySavings, 0),
      count: computeAssets.filter(c => c.recommendation.status === 'UNDERUTILIZED').length,
      tab: 'compute'
    },
    {
      category: 'Unattached Disks (>7d)',
      amount: storageAssets
        .filter(s => s.status === 'unattached')
        .reduce((sum, s) => sum + s.recommendation.monthlySavings, 0),
      count: storageAssets.filter(s => s.status === 'unattached').length,
      tab: 'storage'
    },
    {
      category: 'Legacy gp2 Volumes',
      amount: storageAssets
        .filter(s => s.status === 'attached' && s.recommendation.action === 'Downgrade-Tier')
        .reduce((sum, s) => sum + s.recommendation.monthlySavings, 0),
      count: storageAssets.filter(s => s.status === 'attached' && s.recommendation.action === 'Downgrade-Tier').length,
      tab: 'storage'
    }
  ];

  const totalMonthlyWaste = wasteBreakdownData.reduce((acc, w) => acc + w.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Notification Highlight */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-slate-900/80 to-purple-950/30 p-6 rounded-2xl border border-blue-500/20">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Multi-Cloud FinOps Executive Center</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Active Optimization Mode</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Aggregated telemetry and billing governance across <span className="text-amber-400 font-semibold">AWS</span>, <span className="text-blue-400 font-semibold">Azure</span>, <span className="text-indigo-400 font-semibold">GCP</span>, and <span className="text-sky-400 font-semibold">Kubernetes</span>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('remediation')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Remediate ${totalMonthlyWaste.toLocaleString()}/mo Waste</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Monthly Cloud Spend */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Monthly Spend</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ${kpis.totalMonthlySpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center space-x-1.5 text-xs mt-2 text-slate-400">
            <span className="text-rose-400 font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +3.4%
            </span>
            <span>vs previous month ($123,000)</span>
          </div>
        </div>

        {/* Card 2: Potential Monthly Savings */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">Actionable Waste Pool</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            ${totalMonthlyWaste.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span className="text-xs font-normal text-slate-400 ml-1">/mo</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs mt-2 text-slate-400">
            <span className="text-emerald-400 font-semibold">
              ${(totalMonthlyWaste * 12).toLocaleString()}/yr
            </span>
            <span>annualized cost recovery</span>
          </div>
        </div>

        {/* Card 3: Realized Savings */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Realized Savings</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-300 tracking-tight">
            ${kpis.realizedMonthlySavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span className="text-xs font-normal text-slate-400 ml-1">/mo</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs mt-2 text-slate-400">
            <span className="text-indigo-400 font-semibold">5 actions executed</span>
            <span>via 1-Click Remediations</span>
          </div>
        </div>

        {/* Card 4: FinOps Maturity Score */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">FinOps Maturity Index</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-purple-400">{kpis.finOpsMaturityScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded">
              Advanced (Walk)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
              style={{ width: `${kpis.finOpsMaturityScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Visuals Row: Spend Trends & Department Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Trend Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Multi-Cloud Spend Trajectory (6-Month Trend)</h2>
              <p className="text-xs text-slate-400">Monthly gross spend by cloud provider in USD</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9900]"></span>
                <span className="text-slate-300">AWS</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0089D6]"></span>
                <span className="text-slate-300">Azure</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]"></span>
                <span className="text-slate-300">GCP</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendTrendData}>
                <defs>
                  <linearGradient id="colorAWS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9900" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF9900" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorAzure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0089D6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0089D6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorGCP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4285F4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4285F4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="AWS" stroke="#FF9900" fillOpacity={1} fill="url(#colorAWS)" strokeWidth={2} />
                <Area type="monotone" dataKey="Azure" stroke="#0089D6" fillOpacity={1} fill="url(#colorAzure)" strokeWidth={2} />
                <Area type="monotone" dataKey="GCP" stroke="#4285F4" fillOpacity={1} fill="url(#colorGCP)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Allocation Breakdown (1 Col) */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Department Cost Allocation</h2>
            <p className="text-xs text-slate-400">Tag-based cost distribution (FR-001)</p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Spend']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {departmentData.map((dept, i) => (
              <div key={dept.name} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }}></span>
                  <span className="text-slate-300 font-medium">{dept.name}</span>
                </div>
                <span className="font-mono text-slate-200">${dept.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Financial Waste Breakdown Row */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>High-Priority Optimization Opportunities</span>
              <span className="px-2 py-0.5 text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-semibold">
                ${totalMonthlyWaste.toLocaleString()}/mo recoverable
              </span>
            </h2>
            <p className="text-xs text-slate-400">Idle compute, orphaned storage, and storage tier downgrade recommendations</p>
          </div>
          <button
            onClick={() => onNavigateTab('remediation')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
          >
            <span>Open Remediation Hub</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {wasteBreakdownData.map((item) => (
            <div
              key={item.category}
              onClick={() => onNavigateTab(item.tab)}
              className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 p-4 rounded-xl cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">{item.category}</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-700 text-slate-300 rounded">
                  {item.count} items
                </span>
              </div>
              <div className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                <span className="text-xs font-normal text-slate-400 ml-1">/mo</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>Action: Review & Fix</span>
                <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
