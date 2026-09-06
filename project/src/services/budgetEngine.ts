import { BudgetConfig, FinOpsAlert } from '../types/finops';

export interface BudgetEvaluationResult {
  updatedBudgets: BudgetConfig[];
  newAlerts: FinOpsAlert[];
}

export function evaluateBudgets(budgets: BudgetConfig[]): BudgetEvaluationResult {
  const updatedBudgets: BudgetConfig[] = [];
  const newAlerts: FinOpsAlert[] = [];

  budgets.forEach(budget => {
    const pct = (budget.currentSpend / budget.monthlyLimit) * 100;
    const isWarning = pct >= budget.thresholds.warningPercent;
    const isCritical = pct >= budget.thresholds.criticalPercent;
    const isBreach = pct >= budget.thresholds.breachPercent;

    const previouslyBreached = budget.alertsTriggered?.breach;
    const previouslyCritical = budget.alertsTriggered?.critical;
    const previouslyWarning = budget.alertsTriggered?.warning;

    const updated: BudgetConfig = {
      ...budget,
      alertsTriggered: {
        warning: isWarning,
        critical: isCritical,
        breach: isBreach
      }
    };

    updatedBudgets.push(updated);

    // Generate alerts if new condition crossed
    if (isBreach && !previouslyBreached) {
      newAlerts.push({
        id: `alert-breach-${budget.id}-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        budgetId: budget.id,
        budgetName: budget.name,
        severity: 'emergency',
        channel: 'Slack',
        provider: budget.provider,
        title: `🚨 BUDGET BREACH: ${budget.name} (${pct.toFixed(1)}%)`,
        message: `Current spend ($${budget.currentSpend.toLocaleString()}) has breached 100% of the allocated budget limit ($${budget.monthlyLimit.toLocaleString()}).`,
        payloadPreview: {
          event_type: 'BUDGET_BREACH',
          budget_id: budget.id,
          budget_name: budget.name,
          current_spend: budget.currentSpend,
          monthly_limit: budget.monthlyLimit,
          overage_forecast: budget.forecastSpend - budget.monthlyLimit,
          alert_recipients: budget.notificationChannels
        },
        acknowledged: false
      });
    } else if (isCritical && !previouslyCritical && !isBreach) {
      newAlerts.push({
        id: `alert-crit-${budget.id}-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        budgetId: budget.id,
        budgetName: budget.name,
        severity: 'critical',
        channel: 'Webhook',
        provider: budget.provider,
        title: `⚠️ CRITICAL: 90% Threshold Exceeded (${pct.toFixed(1)}%)`,
        message: `Department [${budget.department}] spend has crossed 90% threshold. Forecasted overage: $${(budget.forecastSpend - budget.monthlyLimit).toLocaleString()}.`,
        payloadPreview: {
          event_type: 'THRESHOLD_WARNING_90',
          budget_id: budget.id,
          current_spend: budget.currentSpend,
          monthly_limit: budget.monthlyLimit,
          run_rate_forecast: budget.forecastSpend
        },
        acknowledged: false
      });
    }
  });

  return { updatedBudgets, newAlerts };
}
