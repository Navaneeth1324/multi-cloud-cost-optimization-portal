import React, { useState } from 'react';
import { 
  HardDrive, 
  Search, 
  Trash2, 
  Camera, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Clock, 
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import { StorageAsset, CloudProvider, UserRole } from '../types/finops';

interface StorageOptimizationProps {
  assets: StorageAsset[];
  selectedProvider: 'All' | CloudProvider;
  userRole: UserRole;
  onRemediate: (asset: StorageAsset, actionType: string) => void;
}

export const StorageOptimization: React.FC<StorageOptimizationProps> = ({
  assets,
  selectedProvider,
  userRole,
  onRemediate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'UNATTACHED' | 'TIER_MIGRATION'>('ALL');
  const [snapshotTargetAsset, setSnapshotTargetAsset] = useState<StorageAsset | null>(null);

  const filteredAssets = assets.filter(asset => {
    const matchesProvider = selectedProvider === 'All' || asset.provider === selectedProvider;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (asset.tags?.Project && asset.tags.Project.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'ALL' ||
                          (filterType === 'UNATTACHED' && asset.status === 'unattached') ||
                          (filterType === 'TIER_MIGRATION' && asset.recommendation.action === 'Downgrade-Tier');
    return matchesProvider && matchesSearch && matchesFilter;
  });

  const unattachedVolumes = assets.filter(a => a.status === 'unattached');
  const totalUnattachedWaste = unattachedVolumes.reduce((sum, a) => sum + a.recommendation.monthlySavings, 0);
  const totalUnattachedGb = unattachedVolumes.reduce((sum, a) => sum + a.sizeGb, 0);
  const tierOptimizationSavings = assets
    .filter(a => a.recommendation.action === 'Downgrade-Tier')
    .reduce((sum, a) => sum + a.recommendation.monthlySavings, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Module Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-indigo-400" />
              <span>Storage & Unattached Volume Intelligence (FR-003 / UC-04)</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
              &gt; 7 Days Idle Detector
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detects orphaned AWS EBS, Azure Managed Disks, and GCP Persistent Disks left billable after instance termination.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">Total Storage Waste</div>
            <div className="text-lg font-black text-rose-400 font-mono">
              ${(totalUnattachedWaste + tierOptimizationSavings).toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Orphaned Volumes</div>
            <div className="text-lg font-black text-amber-400 font-mono">
              {unattachedVolumes.length} <span className="text-xs font-normal text-slate-400">({totalUnattachedGb} GB)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search volume ID, disk name, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {[
            { id: 'ALL', label: 'All Storage Volumes' },
            { id: 'UNATTACHED', label: 'Unattached (>7 Days)' },
            { id: 'TIER_MIGRATION', label: 'gp2 → gp3 Tier Migrations' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Storage Assets Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Volume Details</th>
                <th className="py-3.5 px-4 font-semibold">Cloud & Region</th>
                <th className="py-3.5 px-4 font-semibold">Volume Type & Tier</th>
                <th className="py-3.5 px-4 font-semibold">Size & IOPS</th>
                <th className="py-3.5 px-4 font-semibold">Attachment Status</th>
                <th className="py-3.5 px-4 font-semibold">Monthly Spend</th>
                <th className="py-3.5 px-4 font-semibold text-emerald-400">Est. Savings</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No storage volumes matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const isUnattached = asset.status === 'unattached';
                  const isDeleted = asset.status === 'deleted';

                  return (
                    <tr 
                      key={asset.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isDeleted ? 'opacity-40 line-through' : ''
                      }`}
                    >
                      {/* Volume Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{asset.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{asset.id}</div>
                        {asset.tags?.Environment && (
                          <span className="inline-block mt-1 px-1.5 py-0.2 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700">
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
                                asset.provider === 'Azure' ? '#0089D6' : '#4285F4'
                            }}
                          ></span>
                          <span className="font-semibold text-slate-200">{asset.provider}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{asset.region}</div>
                      </td>

                      {/* Volume Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-200 font-medium">{asset.volumeType}</div>
                      </td>

                      {/* Size & IOPS */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{asset.sizeGb} GB</div>
                        {asset.iops && <div className="text-[11px] text-slate-400">{asset.iops.toLocaleString()} IOPS</div>}
                      </td>

                      {/* Attachment Status */}
                      <td className="py-3.5 px-4">
                        {isUnattached ? (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded inline-flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              <span>UNATTACHED</span>
                            </span>
                            <div className="text-[10px] font-semibold text-rose-400">
                              Idle for {asset.daysUnattached} days
                            </div>
                          </div>
                        ) : isDeleted ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-400 rounded">
                            PURGED / DELETED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Attached</span>
                          </span>
                        )}
                      </td>

                      {/* Monthly Spend */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                        ${asset.monthlyCost.toFixed(2)}
                      </td>

                      {/* Est Savings */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {asset.recommendation.monthlySavings > 0 ? (
                          <span>+${asset.recommendation.monthlySavings.toFixed(2)}/mo</span>
                        ) : (
                          <span className="text-slate-500">$0.00</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {!isDeleted && asset.recommendation.action !== 'None' && (
                          <button
                            onClick={() => {
                              if (asset.recommendation.action === 'Snapshot-and-Delete') {
                                setSnapshotTargetAsset(asset);
                              } else {
                                onRemediate(asset, asset.recommendation.action);
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-sm"
                          >
                            {asset.recommendation.action === 'Snapshot-and-Delete' ? 'Snapshot & Purge' : 'Upgrade to gp3'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot Safety Modal (UC-10 / FR-005) */}
      {snapshotTargetAsset && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pre-Deletion Snapshot Verification (UC-10)</h3>
                  <p className="text-xs text-slate-400">FinOps Safety Policy & Audit Protocol</p>
                </div>
              </div>
              <button
                onClick={() => setSnapshotTargetAsset(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Volume ID:</span>
                <span className="font-mono text-white font-semibold">{snapshotTargetAsset.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capacity & Tier:</span>
                <span className="text-slate-200">{snapshotTargetAsset.sizeGb} GB ({snapshotTargetAsset.volumeType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Idle Duration:</span>
                <span className="text-rose-400 font-bold">{snapshotTargetAsset.daysUnattached} Days Unattached</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-2">
                <span className="text-emerald-400 font-semibold">Net Realized Monthly Savings:</span>
                <span className="font-mono text-emerald-400 font-bold">+${snapshotTargetAsset.recommendation.monthlySavings.toFixed(2)}/mo</span>
              </div>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-lg text-xs text-amber-200/90 flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Safety Rule: An immutable point-in-time snapshot (<code className="text-amber-300 font-mono">snap-{snapshotTargetAsset.id.substring(0,8)}</code>) will be created in cold storage with a 90-day retention lock prior to disk deletion.
              </span>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setSnapshotTargetAsset(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = snapshotTargetAsset;
                  setSnapshotTargetAsset(null);
                  onRemediate(target, 'Snapshot-and-Delete');
                }}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center space-x-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Create Snapshot & Purge Volume</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
