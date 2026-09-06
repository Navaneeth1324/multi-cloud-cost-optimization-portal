import React, { useState } from 'react';
import { 
  Wrench, 
  Play, 
  CheckCircle2, 
  RotateCcw, 
  Code, 
  Terminal, 
  Camera, 
  ShieldCheck, 
  Lock, 
  AlertOctagon, 
  FileText, 
  Sparkles,
  Copy,
  Check,
  X,
  History
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RemediationAction, UserRole } from '../types/finops';

interface RemediationHubProps {
  actions: RemediationAction[];
  userRole: UserRole;
  onExecuteAction: (actionId: string) => void;
  onRollbackAction: (actionId: string) => void;
}

export const RemediationHub: React.FC<RemediationHubProps> = ({
  actions,
  userRole,
  onExecuteAction,
  onRollbackAction
}) => {
  const [selectedCodeAction, setSelectedCodeAction] = useState<RemediationAction | null>(null);
  const [copiedType, setCopiedType] = useState<'tf' | 'cli' | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const pendingActions = actions.filter(a => a.status === 'Pending Approval');
  const completedActions = actions.filter(a => a.status === 'Completed');
  const totalRealizedSavings = completedActions.reduce((sum, a) => sum + (a.actualMonthlySavingsRealized || a.estimatedMonthlySavings), 0);

  const handleExecuteWithAnimation = (actionId: string) => {
    setExecutingId(actionId);
    setTimeout(() => {
      onExecuteAction(actionId);
      setExecutingId(null);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    }, 1200);
  };

  const handleCopy = (text: string, type: 'tf' | 'cli') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              <span>Remediation & Governance Hub (FR-005 / UC-08, UC-10)</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
              Audit-Ready IaC & 1-Click Enforcement
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Execute safe cloud provider API remediations with automated pre-action point-in-time snapshots and audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Accumulated Monthly Savings</div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              ${totalRealizedSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Notice if Analyst */}
      {userRole !== 'Cloud Administrator' && (
        <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-200">Read-Only Analytics Mode Active (FinOps Analyst)</div>
              <div className="text-[11px] text-amber-300/80">
                To trigger live cloud remediations, switch to <strong>Cloud Administrator</strong> role in the navigation bar.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Pending Remediation Queue */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Play className="w-4 h-4 text-blue-400 fill-blue-400" />
              <span>Pending Action Queue ({pendingActions.length})</span>
            </h2>
            <p className="text-xs text-slate-400">Approved recommendations ready for cloud provider dispatch</p>
          </div>
        </div>

        {pendingActions.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-500 text-xs">
            No pending remediations in queue. Navigate to Compute or Storage modules to queue actions.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingActions.map((action) => (
              <div
                key={action.id}
                className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                      {action.provider}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded">
                      {action.assetType}
                    </span>
                    <span className="font-bold text-white text-xs">{action.assetName}</span>
                    <span className="font-mono text-[11px] text-slate-500">({action.assetId})</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Action: <span className="font-semibold text-amber-400">{action.actionType}</span>
                    {action.targetSkuOrTier && <span> &rarr; {action.targetSkuOrTier}</span>}
                    <span className="text-slate-500 ml-2">• {action.auditDetails}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end lg:self-auto">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Estimated Recovery</div>
                    <div className="font-mono font-bold text-emerald-400 text-xs">
                      +${action.estimatedMonthlySavings.toFixed(2)}/mo
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCodeAction(action)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center space-x-1"
                  >
                    <Code className="w-3.5 h-3.5 text-blue-400" />
                    <span>View IaC</span>
                  </button>

                  <button
                    disabled={userRole !== 'Cloud Administrator' || executingId === action.id}
                    onClick={() => handleExecuteWithAnimation(action.id)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-xl shadow-lg transition-all flex items-center space-x-1.5 ${
                      userRole === 'Cloud Administrator'
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {executingId === action.id ? (
                      <>
                        <Camera className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                        <span>Snapshotting & Executing...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                        <span>1-Click Remediate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Immutable Audit Log & Verification (UC-08 / NFR-002) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Remediation Audit Trail & Execution History</span>
            </h2>
            <p className="text-xs text-slate-400">Cryptographically verifiable log of all executed cloud state transitions</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Target Asset</th>
                <th className="py-3 px-4 font-semibold">Remediation</th>
                <th className="py-3 px-4 font-semibold">Pre-Action Snapshot ID</th>
                <th className="py-3 px-4 font-semibold">Operator</th>
                <th className="py-3 px-4 font-semibold text-emerald-400">Savings Realized</th>
                <th className="py-3 px-4 font-semibold text-right">State / Rollback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {completedActions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500">
                    No completed remediations logged yet.
                  </td>
                </tr>
              ) : (
                completedActions.map((action) => (
                  <tr key={action.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {action.executedAt || '2026-09-01 11:20:00 UTC'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{action.assetName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{action.assetId}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-amber-400">
                      {action.actionType}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-indigo-400">
                      {action.snapshotId || `snap-${action.assetId.substring(0,8)}`}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {action.executedBy || 'admin@enterprise.internal'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      +${(action.actualMonthlySavingsRealized || action.estimatedMonthlySavings).toFixed(2)}/mo
                    </td>
                    <td className="py-3 px-4 text-right">
                      {action.status === 'Completed' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Enforced</span>
                          </span>
                          {userRole === 'Cloud Administrator' && (
                            <button
                              onClick={() => onRollbackAction(action.id)}
                              className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center space-x-1"
                              title="Simulate point-in-time rollback"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>Rollback</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-400 rounded">
                          {action.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* IaC & CLI Code Modal */}
      {selectedCodeAction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Infrastructure as Code & CLI Plan ({selectedCodeAction.assetName})
                </h3>
              </div>
              <button
                onClick={() => setSelectedCodeAction(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Terraform Code Tab */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Terraform / OpenTofu Configuration (.tf)</span>
                <button
                  onClick={() => handleCopy(selectedCodeAction.terraformCode, 'tf')}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  {copiedType === 'tf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'tf' ? 'Copied' : 'Copy HCL'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-blue-300 font-mono text-xs overflow-x-auto max-h-48">
                {selectedCodeAction.terraformCode}
              </pre>
            </div>

            {/* CLI Command Tab */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Cloud Provider CLI Command</span>
                <button
                  onClick={() => handleCopy(selectedCodeAction.cliCommand, 'cli')}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  {copiedType === 'cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'cli' ? 'Copied' : 'Copy CLI'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto max-h-24">
                {selectedCodeAction.cliCommand}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCodeAction(null)}
                className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
