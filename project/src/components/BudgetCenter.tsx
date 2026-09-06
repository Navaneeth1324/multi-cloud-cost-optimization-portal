import React, { useState } from 'react';
import { 
  DollarSign, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Send, 
  Plus, 
  Code, 
  ExternalLink, 
  ShieldAlert,
  Flame,
  Check,
  X,
  Radio,
  Sliders
} from 'lucide-react';
import { BudgetConfig, FinOpsAlert, CloudProvider, UserRole } from '../types/finops';

interface BudgetCenterProps {
  budgets: BudgetConfig[];
  alerts: FinOpsAlert[];
  userRole: UserRole;
  onAddBudget: (budget: BudgetConfig) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onSimulateSpendSpike: (budgetId: string, addedAmount: number) => void;
}

export const BudgetCenter: React.FC<BudgetCenterProps> = ({
  budgets,
  alerts,
  userRole,
  onAddBudget,
  onAcknowledgeAlert,
  onSimulateSpendSpike
}) => {
  const [selectedAlertForPayload, setSelectedAlertForPayload] = useState<FinOpsAlert | null>(null);
  const [showNewBudgetModal, setShowNewBudgetModal] = useState(false);

  // New Budget Form state
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newDepartment, setNewDepartment] = useState<'Engineering' | 'Data Science' | 'Product & Ops' | 'Security & IT'>('Engineering');
  const [newProvider, setNewProvider] = useState<'All' | CloudProvider>('All');
  const [newLimit, setNewLimit] = useState(25000);

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetName) return;
    const newBudget: BudgetConfig = {
      id: `bgt-${Date.now().toString().substring(7)}`,
      name: newBudgetName,
      provider: newProvider,
      department: newDepartment,
      monthlyLimit: Number(newLimit),
      currentSpend: Number(newLimit) * 0.45,
      forecastSpend: Number(newLimit) * 0.95,
      thresholds: { warningPercent: 80, criticalPercent: 90, breachPercent: 100 },
      notificationChannels: ['Slack', 'Email', 'Webhook'],
      alertsTriggered: { warning: false, critical: false, breach: false }
    };
    onAddBudget(newBudget);
    setShowNewBudgetModal(false);
    setNewBudgetName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Budget Thresholds & Multi-Channel Alerting (FR-004 / UC-05, UC-06)</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
              80% • 90% • 100% Breaches
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time burn-rate monitoring and instant webhook dispatches across Slack, OpsGenie, PagerDuty, and Email.
          </p>
        </div>

        <button
          onClick={() => setShowNewBudgetModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget Policy</span>
        </button>
      </div>

      {/* Budget Allocation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((budget) => {
          const percentUsed = (budget.currentSpend / budget.monthlyLimit) * 100;
          const isBreach = percentUsed >= 100;
          const isCritical = percentUsed >= 90 && !isBreach;
          const isWarning = percentUsed >= 80 && !isCritical && !isBreach;

          return (
            <div
              key={budget.id}
              className={`p-5 rounded-2xl border transition-all ${
                isBreach
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : isCritical
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{budget.name}</span>
                    <span className="px-1.5 py-0.2 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {budget.provider}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{budget.department}</span>
                </div>

                {isBreach ? (
                  <span className="px-2.5 py-1 text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full flex items-center space-x-1 animate-pulse">
                    <Flame className="w-3 h-3 text-rose-400" />
                    <span>BREACHED (100%+)</span>
                  </span>
                ) : isCritical ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                    CRITICAL (&gt;90%)
                  </span>
                ) : isWarning ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded-full">
                    WARNING (&gt;80%)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    HEALTHY
                  </span>
                )}
              </div>

              {/* Spend Figures */}
              <div className="flex items-baseline justify-between mt-3 text-xs">
                <div>
                  <span className="text-slate-400">Current Spend: </span>
                  <span className="font-mono font-bold text-white text-sm">
                    ${budget.currentSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Monthly Limit: </span>
                  <span className="font-mono font-semibold text-slate-300">
                    ${budget.monthlyLimit.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar with 80%, 90%, 100% threshold markers */}
              <div className="relative mt-2 mb-3">
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isBreach
                        ? 'bg-rose-500'
                        : isCritical
                        ? 'bg-amber-500'
                        : isWarning
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percentUsed)}%` }}
                  ></div>
                </div>

                {/* Threshold Markers */}
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>0%</span>
                  <span className="text-yellow-400/70">80% Warn</span>
                  <span className="text-amber-400/70">90% Crit</span>
                  <span className="text-rose-400/70">100% Cap</span>
                </div>
              </div>

              {/* Forecast & Simulation Controller */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400">
                  Forecast Month-End: <span className="font-mono font-bold text-slate-200">${budget.forecastSpend.toLocaleString()}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onSimulateSpendSpike(budget.id, 2500)}
                    className="px-2 py-0.8 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded transition-all"
                    title="Simulate a spend spike to test alert threshold triggering"
                  >
                    +Simulate Spike
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Alert Log & Webhook Dispatch Preview (UC-06) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Bell className="w-4 h-4 text-rose-400" />
              <span>Multi-Channel Alert Dispatch Stream</span>
            </h2>
            <p className="text-xs text-slate-400">Live webhook dispatches generated on threshold breaches</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {alerts.filter(a => !a.acknowledged).length} Unacknowledged Alerts
          </span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                alert.severity === 'emergency'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : alert.severity === 'critical'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-950/40 border-slate-800'
              } ${alert.acknowledged ? 'opacity-50' : ''}`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase ${
                    alert.severity === 'emergency' ? 'bg-rose-600 text-white' :
                    alert.severity === 'critical' ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {alert.channel}
                  </span>
                  <span className="font-bold text-white text-xs">{alert.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300">{alert.message}</p>
              </div>

              <div className="flex items-center space-x-2 self-end md:self-auto">
                <button
                  onClick={() => setSelectedAlertForPayload(alert)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center space-x-1"
                >
                  <Code className="w-3 h-3 text-blue-400" />
                  <span>Inspect Payload</span>
                </button>

                {!alert.acknowledged ? (
                  <button
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center space-x-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Acknowledge</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Resolved</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspect Webhook Payload Modal */}
      {selectedAlertForPayload && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Dispatched Alert Payload (JSON)</h3>
              </div>
              <button
                onClick={() => setSelectedAlertForPayload(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Target Channel: <span className="font-bold text-white">{selectedAlertForPayload.channel}</span> • Dispatched at {selectedAlertForPayload.timestamp}
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72">
              {JSON.stringify(selectedAlertForPayload.payloadPreview, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAlertForPayload(null)}
                className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Budget Policy Modal */}
      {showNewBudgetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateBudget} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Budget & Alert Policy</h3>
              <button
                type="button"
                onClick={() => setShowNewBudgetModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Budget Policy Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Training Cluster Q4"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Product & Ops">Product & Ops</option>
                    <option value="Security & IT">Security & IT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cloud Provider</label>
                  <select
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">All Clouds</option>
                    <option value="AWS">AWS</option>
                    <option value="Azure">Azure</option>
                    <option value="GCP">GCP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Monthly Limit (USD)</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={newLimit}
                  onChange={(e) => setNewLimit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowNewBudgetModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30"
              >
                Save Budget Policy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
