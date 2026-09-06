import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Cpu, 
  AlertOctagon, 
  ArrowDownRight, 
  CheckCircle, 
  ShieldCheck, 
  ExternalLink, 
  Activity, 
  Clock, 
  Tag, 
  Terminal, 
  Play, 
  Check, 
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { ComputeAsset, CloudProvider, UserRole } from '../types/finops';

interface ComputeOptimizationProps {
  assets: ComputeAsset[];
  selectedProvider: 'All' | CloudProvider;
  userRole: UserRole;
  onRemediate: (asset: ComputeAsset, actionType: string) => void;
}

export const ComputeOptimization: React.FC<ComputeOptimizationProps> = ({
  assets,
  selectedProvider,
  userRole,
  onRemediate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IDLE' | 'UNDERUTILIZED' | 'EXEMPT_IDLE' | 'OPTIMAL'>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<ComputeAsset | null>(null);

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesProvider = selectedProvider === 'All' || asset.provider === selectedProvider;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (asset.tags?.Project && asset.tags.Project.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || asset.recommendation.status === statusFilter;
    return matchesProvider && matchesSearch && matchesStatus;
  });

  const totalComputeSpend = assets.reduce((sum, a) => sum + a.currentMonthlyCost, 0);
  const idleAssets = assets.filter(a => a.recommendation.status === 'IDLE' && !a.recommendation.isExempt);
  const totalIdleWaste = idleAssets.reduce((sum, a) => sum + a.recommendation.monthlySavings, 0);
  const underutilizedAssets = assets.filter(a => a.recommendation.status === 'UNDERUTILIZED');
  const totalRightSizeSavings = underutilizedAssets.reduce((sum, a) => sum + a.recommendation.monthlySavings, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span>Compute Optimization Engine (FR-002 / UC-03)</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
              14-Day Rolling Window
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Telemetry scanning across AWS EC2, Azure Virtual Machines, GCP Compute Engine, and Kubernetes Nodes.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">Actionable Compute Waste</div>
            <div className="text-lg font-black text-rose-400 font-mono">
              ${(totalIdleWaste + totalRightSizeSavings).toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Idle Instances Flagged</div>
            <div className="text-lg font-black text-amber-400 font-mono">
              {idleAssets.length} <span className="text-xs font-normal text-slate-400">instances</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search instance ID, name, or project tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Workloads' },
            { id: 'IDLE', label: 'Idle (<5% CPU)' },
            { id: 'UNDERUTILIZED', label: 'Underutilized (5-15%)' },
            { id: 'EXEMPT_IDLE', label: 'Exempt (DR/Failover)' },
            { id: 'OPTIMAL', label: 'Optimal' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compute Assets Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Instance Details</th>
                <th className="py-3.5 px-4 font-semibold">Cloud & Region</th>
                <th className="py-3.5 px-4 font-semibold">Hardware SKU</th>
                <th className="py-3.5 px-4 font-semibold">14-Day CPU Telemetry</th>
                <th className="py-3.5 px-4 font-semibold">FinOps Classification</th>
                <th className="py-3.5 px-4 font-semibold">Monthly Spend</th>
                <th className="py-3.5 px-4 font-semibold text-emerald-400">Est. Savings</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No compute instances found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const isIdle = asset.recommendation.status === 'IDLE';
                  const isUnderutilized = asset.recommendation.status === 'UNDERUTILIZED';
                  const isExempt = asset.recommendation.status === 'EXEMPT_IDLE';

                  return (
                    <tr 
                      key={asset.id} 
                      className={`hover:bg-slate-800/40 transition-colors ${
                        asset.state === 'terminated' ? 'opacity-40 line-through' : ''
                      }`}
                    >
                      {/* Instance Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white flex items-center space-x-1.5">
                          <span>{asset.name}</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">{asset.id}</div>
                        {asset.tags?.Environment && (
                          <span className="inline-block mt-1 px-1.5 py-0.2 text-[10px] font-medium bg-slate-800 text-slate-300 rounded border border-slate-700">
                            {asset.tags.Environment}
                          </span>
                        )}
                      </td>

                      {/* Cloud & Region */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{
                              backgroundColor: 
                                asset.provider === 'AWS' ? '#FF9900' :
                                asset.provider === 'Azure' ? '#0089D6' :
                                asset.provider === 'GCP' ? '#4285F4' : '#326CE5'
                            }}
                          ></span>
                          <span className="font-semibold text-slate-200">{asset.provider}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{asset.region}</div>
                      </td>

                      {/* Hardware SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-200 font-semibold">{asset.instanceType}</div>
                        <div className="text-[11px] text-slate-400">{asset.vCPU} vCPU • {asset.memoryGb} GB RAM</div>
                      </td>

                      {/* 14-Day CPU Telemetry Sparkline */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-6">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={asset.metrics.cpuTimeSeries}>
                                <Area
                                  type="monotone"
                                  dataKey="cpu"
                                  stroke={isIdle ? '#EF4444' : isUnderutilized ? '#F59E0B' : '#10B981'}
                                  fill={isIdle ? '#EF4444' : isUnderutilized ? '#F59E0B' : '#10B981'}
                                  fillOpacity={0.2}
                                  strokeWidth={1.5}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <div>
                            <div className="font-bold text-white font-mono text-[11px]">
                              {asset.metrics.avgCpu14d}% <span className="text-[10px] text-slate-400 font-normal">avg</span>
                            </div>
                            <div className="text-[10px] text-slate-400">p95: {asset.metrics.p95Cpu14d}%</div>
                          </div>
                        </div>
                      </td>

                      {/* FinOps Classification */}
                      <td className="py-3.5 px-4">
                        {isIdle && (
                          <span className="px-2 py-1 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md inline-flex items-center space-x-1">
                            <AlertOctagon className="w-3 h-3 text-rose-400" />
                            <span>IDLE (&lt;5% CPU)</span>
                          </span>
                        )}
                        {isUnderutilized && (
                          <span className="px-2 py-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md inline-flex items-center space-x-1">
                            <ArrowDownRight className="w-3 h-3 text-amber-400" />
                            <span>OVERSIZED</span>
                          </span>
                        )}
                        {isExempt && (
                          <span className="px-2 py-1 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md inline-flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3 text-purple-400" />
                            <span>EXEMPT (DR)</span>
                          </span>
                        )}
                        {asset.recommendation.status === 'OPTIMAL' && (
                          <span className="px-2 py-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md inline-flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>OPTIMAL</span>
                          </span>
                        )}
                      </td>

                      {/* Monthly Spend */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                        ${asset.currentMonthlyCost.toFixed(2)}
                      </td>

                      {/* Est. Savings */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {asset.recommendation.monthlySavings > 0 ? (
                          <span className="text-emerald-400">
                            +${asset.recommendation.monthlySavings.toFixed(2)}/mo
                          </span>
                        ) : (
                          <span className="text-slate-500">$0.00</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedAsset(asset)}
                            className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"
                            title="Inspect 14-day telemetry & rationale"
                          >
                            Inspect
                          </button>

                          {asset.recommendation.action !== 'None' && asset.state !== 'terminated' && (
                            <button
                              onClick={() => onRemediate(asset, asset.recommendation.action)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-sm flex items-center space-x-1"
                              title={`Queue ${asset.recommendation.action} remediation`}
                            >
                              <span>{asset.recommendation.action}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Telemetry Detail Modal / Drawer (UC-03 Flow) */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                    {selectedAsset.provider}
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedAsset.name}</h3>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedAsset.id} • {selectedAsset.region}</p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 14-Day Detailed Time Series Chart */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>14-Day Rolling CPU Utilization & Network I/O Telemetry</span>
                </span>
                <span className="font-mono text-slate-400">Avg: {selectedAsset.metrics.avgCpu14d}% | p95: {selectedAsset.metrics.p95Cpu14d}%</span>
              </div>
              <div className="h-44 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedAsset.metrics.cpuTimeSeries}>
                    <XAxis dataKey="day" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="cpu" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.25} strokeWidth={2} name="CPU %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* FinOps Rule Evaluation Rationale Box */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>FinOps Intelligence Analysis</span>
                </span>
                <span className="text-xs font-mono font-semibold text-blue-400">
                  Confidence Score: {selectedAsset.recommendation.confidenceScore}%
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedAsset.recommendation.reason}
              </p>
              {selectedAsset.recommendation.isExempt && (
                <div className="p-2.5 bg-purple-950/40 border border-purple-500/30 rounded-lg text-xs text-purple-200 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>{selectedAsset.recommendation.exemptionReason}</span>
                </div>
              )}
            </div>

            {/* Machine Specs & Cost Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400">Current SKU</div>
                <div className="font-bold text-white font-mono mt-1">{selectedAsset.instanceType}</div>
                <div className="text-[10px] text-slate-500">{selectedAsset.vCPU} vCPU / {selectedAsset.memoryGb} GB RAM</div>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400">Current Cost</div>
                <div className="font-bold text-slate-200 font-mono mt-1">${selectedAsset.currentMonthlyCost.toFixed(2)}/mo</div>
                <div className="text-[10px] text-slate-500">${(selectedAsset.currentMonthlyCost * 12).toFixed(2)}/yr</div>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <div className="text-emerald-400 font-medium">Projected Savings</div>
                <div className="font-bold text-emerald-400 font-mono mt-1">
                  +${selectedAsset.recommendation.monthlySavings.toFixed(2)}/mo
                </div>
                <div className="text-[10px] text-emerald-500">
                  +${(selectedAsset.recommendation.monthlySavings * 12).toFixed(2)}/yr
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close
              </button>

              {selectedAsset.recommendation.action !== 'None' && selectedAsset.state !== 'terminated' && (
                <button
                  onClick={() => {
                    const action = selectedAsset.recommendation.action;
                    setSelectedAsset(null);
                    onRemediate(selectedAsset, action);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Execute {selectedAsset.recommendation.action} via Remediation Hub</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
