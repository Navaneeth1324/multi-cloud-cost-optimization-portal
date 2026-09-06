import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { ComputeOptimization } from './components/ComputeOptimization';
import { StorageOptimization } from './components/StorageOptimization';
import { BudgetCenter } from './components/BudgetCenter';
import { RemediationHub } from './components/RemediationHub';
import {
  INITIAL_COMPUTE_ASSETS,
  INITIAL_STORAGE_ASSETS,
  INITIAL_BUDGETS,
  INITIAL_ALERTS,
  INITIAL_REMEDIATION_ACTIONS,
  INITIAL_KPIS
} from './data/mockCloudData';
import {
  SAMPLE_AWS_CUR_CSV,
  SAMPLE_AZURE_COST_CSV,
  SAMPLE_GCP_BILLING_CSV,
  SAMPLE_FOCUS_CSV
} from './data/sampleCsvs';
import { parseBillingCsv, IngestionResult } from './services/billingParser';
import { exportFinOpsPdfReport } from './services/reportGenerator';
import { generateRemediationCode } from './services/remediationEngine';
import { CloudProvider, UserRole, ComputeAsset, StorageAsset, BudgetConfig, RemediationAction, FinOpsAlert } from './types/finops';
import { 
  UploadCloud, 
  Sparkles, 
  X, 
  SlidersHorizontal, 
  ArrowRight,
  Terminal
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProvider, setSelectedProvider] = useState<'All' | CloudProvider>('All');
  const [userRole, setUserRole] = useState<UserRole>('FinOps Analyst');

  // Core FinOps state
  const [computeAssets] = useState<ComputeAsset[]>(INITIAL_COMPUTE_ASSETS);
  const [storageAssets] = useState<StorageAsset[]>(INITIAL_STORAGE_ASSETS);
  const [budgets, setBudgets] = useState<BudgetConfig[]>(INITIAL_BUDGETS);
  const [alerts, setAlerts] = useState<FinOpsAlert[]>(INITIAL_ALERTS);
  const [remediationActions, setRemediationActions] = useState<RemediationAction[]>(INITIAL_REMEDIATION_ACTIONS);
  const [kpis] = useState(INITIAL_KPIS);

  // Modals state
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [ingestionText, setIngestionText] = useState(SAMPLE_AWS_CUR_CSV);
  const [ingestionResult, setIngestionResult] = useState<IngestionResult | null>(null);

  // Scenario Simulator state
  const [simDecommissionIdle, setSimDecommissionIdle] = useState(true);
  const [simDeleteOrphanedDisks, setSimDeleteOrphanedDisks] = useState(true);
  const [simUpgradeStorageTier, setSimUpgradeStorageTier] = useState(true);

  // Handlers for Remediation
  const handleRemediateCompute = (asset: ComputeAsset, actionType: string) => {
    const validActionType = (actionType as any) || 'Right-Size';
    const code = generateRemediationCode(asset.provider, 'Compute', validActionType, asset.id, asset.name, asset.recommendation.targetType);
    const newAction: RemediationAction = {
      id: `act-comp-${Date.now()}`,
      assetId: asset.id,
      assetName: asset.name,
      assetType: 'Compute',
      provider: asset.provider,
      actionType: validActionType,
      status: 'Pending Approval',
      estimatedMonthlySavings: asset.recommendation.monthlySavings,
      terraformCode: code.terraform,
      cliCommand: code.cli,
      auditDetails: `Automated remediation initiated for ${asset.name} (${asset.id}) via FinOps console.`
    };
    setRemediationActions(prev => [newAction, ...prev]);
    setActiveTab('remediation');
  };

  const handleRemediateStorage = (asset: StorageAsset, actionType: string) => {
    const validActionType = (actionType as any) || 'Snapshot-and-Delete';
    const code = generateRemediationCode(asset.provider, 'Storage', validActionType, asset.id, asset.name, asset.recommendation.targetTier);
    const newAction: RemediationAction = {
      id: `act-store-${Date.now()}`,
      assetId: asset.id,
      assetName: asset.name,
      assetType: 'Storage',
      provider: asset.provider,
      actionType: validActionType,
      status: 'Pending Approval',
      estimatedMonthlySavings: asset.recommendation.monthlySavings,
      terraformCode: code.terraform,
      cliCommand: code.cli,
      auditDetails: `Automated storage remediation initiated for ${asset.name} (${asset.id}) via FinOps console.`
    };
    setRemediationActions(prev => [newAction, ...prev]);
    setActiveTab('remediation');
  };

  const handleExecuteRemediation = (actionId: string) => {
    setRemediationActions(prev =>
      prev.map(a =>
        a.id === actionId
          ? { ...a, status: 'Completed' as const, executedAt: new Date().toISOString(), executedBy: userRole }
          : a
      )
    );
  };

  const handleRollbackRemediation = (actionId: string) => {
    setRemediationActions(prev =>
      prev.map(a =>
        a.id === actionId
          ? { ...a, status: 'Rolled Back' as const, executedAt: undefined, executedBy: undefined }
          : a
      )
    );
  };

  // Handlers for Budgets
  const handleAddBudget = (newBudget: BudgetConfig) => {
    setBudgets(prev => [...prev, newBudget]);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const handleSimulateSpendSpike = (budgetId: string, addedAmount: number) => {
    setBudgets(prev =>
      prev.map(b => {
        if (b.id !== budgetId) return b;
        const newActual = b.currentSpend + addedAmount;
        const pct = (newActual / b.monthlyLimit) * 100;
        return {
          ...b,
          currentSpend: newActual,
          forecastSpend: b.forecastSpend + addedAmount * 1.2,
          alertsTriggered: {
            warning: pct >= b.thresholds.warningPercent,
            critical: pct >= b.thresholds.criticalPercent,
            breach: pct >= b.thresholds.breachPercent
          }
        };
      })
    );
  };

  // Ingestion parsing
  const handleRunIngestion = () => {
    const result = parseBillingCsv(ingestionText);
    setIngestionResult(result);
  };

  // PDF Export
  const handleExportPdf = () => {
    exportFinOpsPdfReport(kpis, computeAssets, storageAssets, budgets);
  };

  // Calculate projected scenario savings
  const idleComputeSavings = computeAssets
    .filter(a => a.state === 'idle' && a.recommendation.status === 'IDLE')
    .reduce((sum, a) => sum + a.recommendation.monthlySavings, 0);

  const orphanedStorageSavings = storageAssets
    .filter(s => s.status === 'unattached')
    .reduce((sum, s) => sum + s.recommendation.monthlySavings, 0);

  const tierUpgradeSavings = storageAssets
    .filter(s => s.recommendation.action === 'Downgrade-Tier')
    .reduce((sum, s) => sum + s.recommendation.monthlySavings, 0);

  const scenarioMonthlySavings =
    (simDecommissionIdle ? idleComputeSavings : 0) +
    (simDeleteOrphanedDisks ? orphanedStorageSavings : 0) +
    (simUpgradeStorageTier ? tierUpgradeSavings : 0);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
        userRole={userRole}
        setUserRole={setUserRole}
        alerts={alerts}
        onOpenIngestion={() => setIsIngestionOpen(true)}
        onOpenReport={handleExportPdf}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        totalSpend={kpis.totalMonthlySpend}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            kpis={kpis}
            computeAssets={computeAssets}
            storageAssets={storageAssets}
            budgets={budgets}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'compute' && (
          <ComputeOptimization
            assets={computeAssets}
            selectedProvider={selectedProvider}
            userRole={userRole}
            onRemediate={handleRemediateCompute}
          />
        )}

        {activeTab === 'storage' && (
          <StorageOptimization
            assets={storageAssets}
            selectedProvider={selectedProvider}
            userRole={userRole}
            onRemediate={handleRemediateStorage}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetCenter
            budgets={budgets}
            alerts={alerts}
            userRole={userRole}
            onAddBudget={handleAddBudget}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onSimulateSpendSpike={handleSimulateSpendSpike}
          />
        )}

        {activeTab === 'remediation' && (
          <RemediationHub
            actions={remediationActions}
            userRole={userRole}
            onExecuteAction={handleExecuteRemediation}
            onRollbackAction={handleRollbackRemediation}
          />
        )}

        {activeTab === 'scenarios' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">FinOps "What-If" Cost Optimization Scenario Simulator</h2>
                  <p className="text-sm text-slate-400">
                    Model potential cost reduction strategies before triggering remediation workflows across AWS, Azure, and GCP.
                  </p>
                </div>
              </div>
            </div>

            {/* Strategy Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-xl border transition-all ${simDecommissionIdle ? 'bg-blue-950/20 border-blue-600/40' : 'bg-slate-900/40 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Compute
                  </span>
                  <input
                    type="checkbox"
                    checked={simDecommissionIdle}
                    onChange={e => setSimDecommissionIdle(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <h3 className="font-semibold text-white mb-1">Decommission Idle VM Instances</h3>
                <p className="text-xs text-slate-400 mb-4">Terminate or right-size compute workloads with &lt; 5% CPU over 14 days.</p>
                <div className="text-lg font-bold text-blue-400 font-mono">
                  +${idleComputeSavings.toLocaleString()}<span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
              </div>

              <div className={`p-6 rounded-xl border transition-all ${simDeleteOrphanedDisks ? 'bg-purple-950/20 border-purple-600/40' : 'bg-slate-900/40 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Storage
                  </span>
                  <input
                    type="checkbox"
                    checked={simDeleteOrphanedDisks}
                    onChange={e => setSimDeleteOrphanedDisks(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>
                <h3 className="font-semibold text-white mb-1">Purge Unattached EBS &amp; Disks</h3>
                <p className="text-xs text-slate-400 mb-4">Snapshot and remove orphaned block volumes detached &gt; 7 days.</p>
                <div className="text-lg font-bold text-purple-400 font-mono">
                  +${orphanedStorageSavings.toLocaleString()}<span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
              </div>

              <div className={`p-6 rounded-xl border transition-all ${simUpgradeStorageTier ? 'bg-emerald-950/20 border-emerald-600/40' : 'bg-slate-900/40 border-slate-800'}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Modernization
                  </span>
                  <input
                    type="checkbox"
                    checked={simUpgradeStorageTier}
                    onChange={e => setSimUpgradeStorageTier(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
                <h3 className="font-semibold text-white mb-1">Modernize gp2 Volumes to gp3</h3>
                <p className="text-xs text-slate-400 mb-4">Migrate legacy AWS gp2 volumes to higher baseline gp3 tiers (20% savings).</p>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  +${tierUpgradeSavings.toLocaleString()}<span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
              </div>
            </div>

            {/* Impact Projection */}
            <div className="bg-gradient-to-r from-blue-900/30 via-slate-900/60 to-purple-900/30 border border-slate-800 rounded-xl p-8 backdrop-blur">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Projected Monthly Savings</div>
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                    ${scenarioMonthlySavings.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {((scenarioMonthlySavings / kpis.totalMonthlySpend) * 100).toFixed(1)}% of total monthly spend
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Projected Annualized ROI</div>
                  <div className="text-3xl font-extrabold text-blue-400 font-mono">
                    ${(scenarioMonthlySavings * 12).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Direct bottom-line cloud waste reduction</div>
                </div>
                <div className="flex items-center justify-center md:justify-end">
                  <button
                    onClick={() => setActiveTab('remediation')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-600/30 transition-all"
                  >
                    <span>Proceed to Remediation Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Ingestion Modal */}
      {isIngestionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Multi-Cloud Billing Ingestion (FR-001)</h3>
              </div>
              <button
                onClick={() => setIsIngestionOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Load Sample Datasets</label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => { setIngestionText(SAMPLE_AWS_CUR_CSV); setIngestionResult(null); }}
                  className="px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 border border-slate-700 font-medium"
                >
                  AWS CUR
                </button>
                <button
                  onClick={() => { setIngestionText(SAMPLE_AZURE_COST_CSV); setIngestionResult(null); }}
                  className="px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 border border-slate-700 font-medium"
                >
                  Azure Cost
                </button>
                <button
                  onClick={() => { setIngestionText(SAMPLE_GCP_BILLING_CSV); setIngestionResult(null); }}
                  className="px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 border border-slate-700 font-medium"
                >
                  GCP Billing
                </button>
                <button
                  onClick={() => { setIngestionText(SAMPLE_FOCUS_CSV); setIngestionResult(null); }}
                  className="px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 border border-slate-700 font-medium"
                >
                  FOCUS Spec
                </button>
              </div>
            </div>

            {/* CSV Editor */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Raw CSV Ingestion Stream</label>
              <textarea
                value={ingestionText}
                onChange={e => setIngestionText(e.target.value)}
                rows={6}
                className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Ingestion Action */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={handleRunIngestion}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <Terminal className="w-4 h-4" />
                Parse &amp; Normalize (FOCUS 1.0)
              </button>
              <button
                onClick={() => setIsIngestionOpen(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Ingestion Parse Results */}
            {ingestionResult && (
              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Detected Format:</span>
                  <span className="font-semibold text-blue-400 font-mono">{ingestionResult.detectedProvider}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Parsed Records:</span>
                  <span className="font-semibold text-emerald-400 font-mono">{ingestionResult.recordCount} items</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tag Allocation Accuracy:</span>
                  <span className="font-semibold text-emerald-400 font-mono">{ingestionResult.tagComplianceRate}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Ingested Cost:</span>
                  <span className="font-semibold text-white font-mono">${ingestionResult.totalCost.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Copilot Drawer */}
      {isCopilotOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white">FinOps AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsCopilotOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 space-y-2">
              <div className="font-semibold text-indigo-300">Top Automated Insights:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><strong>2 Idle EC2/GCP instances</strong> identified ($870/mo potential savings).</li>
                <li><strong>3 Unattached EBS/Managed disks</strong> incurring waste ($360/mo).</li>
                <li><strong>Engineering Cloud budget</strong> at 91% threshold - anomaly alert triggered.</li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-400 font-semibold uppercase tracking-wider">Suggested Prompts</div>
              <button
                onClick={() => { setActiveTab('compute'); setIsCopilotOpen(false); }}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                "Show me compute instances with &lt; 5% CPU over 14 days"
              </button>
              <button
                onClick={() => { setActiveTab('storage'); setIsCopilotOpen(false); }}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                "List unattached block storage volumes ready for snapshot"
              </button>
              <button
                onClick={() => { setActiveTab('scenarios'); setIsCopilotOpen(false); }}
                className="w-full text-left p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                "Simulate right-sizing and annual savings potential"
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 text-center">
            CloudCost IQ &bull; Automated FinOps Intelligence
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
