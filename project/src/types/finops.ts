export type CloudProvider = 'AWS' | 'Azure' | 'GCP' | 'Kubernetes';

export type UserRole = 'FinOps Analyst' | 'Cloud Administrator';

export interface ResourceTag {
  key: string;
  value: string;
}

export interface MetricTimeSeriesPoint {
  day: string;
  cpu: number;
  networkMb: number;
}

export interface ComputeAsset {
  id: string;
  name: string;
  provider: CloudProvider;
  accountId: string;
  accountName: string;
  region: string;
  zone?: string;
  instanceType: string;
  vCPU: number;
  memoryGb: number;
  os: string;
  state: 'running' | 'stopped' | 'idle' | 'underutilized' | 'terminated';
  currentMonthlyCost: number;
  tags: Record<string, string>;
  launchDate: string;
  metrics: {
    cpuTimeSeries: MetricTimeSeriesPoint[];
    avgCpu14d: number;
    p95Cpu14d: number;
    avgNetworkIoMbDay: number;
    diskIops: number;
  };
  recommendation: {
    status: 'OPTIMAL' | 'IDLE' | 'UNDERUTILIZED' | 'EXEMPT_IDLE';
    action: 'None' | 'Right-Size' | 'Terminate' | 'Schedule-Stop' | 'Graviton-Migrate';
    targetType?: string;
    targetMonthlyCost?: number;
    monthlySavings: number;
    confidenceScore: number; // 0-100%
    reason: string;
    isExempt?: boolean;
    exemptionReason?: string;
  };
}

export interface StorageAsset {
  id: string;
  name: string;
  provider: CloudProvider;
  accountId: string;
  accountName: string;
  region: string;
  volumeType: string; // e.g. gp2, gp3, Premium_LRS, pd-ssd, pd-standard
  sizeGb: number;
  iops?: number;
  status: 'attached' | 'unattached' | 'deleted' | 'snapshot_created';
  daysUnattached: number;
  monthlyCost: number;
  attachedInstanceId?: string;
  lastDetachDate?: string;
  tags: Record<string, string>;
  recommendation: {
    action: 'None' | 'Snapshot-and-Delete' | 'Downgrade-Tier' | 'Apply-Lifecycle-Policy';
    targetTier?: string;
    targetMonthlyCost?: number;
    monthlySavings: number;
    reason: string;
  };
}

export interface BudgetConfig {
  id: string;
  name: string;
  provider: 'All' | CloudProvider;
  department: 'Engineering' | 'Data Science' | 'Product & Ops' | 'Security & IT' | 'Global';
  monthlyLimit: number;
  currentSpend: number;
  forecastSpend: number;
  thresholds: {
    warningPercent: number; // e.g., 80
    criticalPercent: number; // e.g., 90
    breachPercent: number; // e.g., 100
  };
  notificationChannels: ('Slack' | 'Email' | 'Webhook' | 'PagerDuty')[];
  alertsTriggered: {
    warning: boolean;
    critical: boolean;
    breach: boolean;
  };
}

export interface FinOpsAlert {
  id: string;
  timestamp: string;
  budgetId?: string;
  budgetName?: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  channel: 'Slack' | 'Email' | 'Webhook' | 'PagerDuty';
  provider: CloudProvider | 'All';
  title: string;
  message: string;
  payloadPreview: Record<string, any>;
  acknowledged: boolean;
  resolvedAt?: string;
}

export interface RemediationAction {
  id: string;
  assetId: string;
  assetName: string;
  provider: CloudProvider;
  assetType: 'Compute' | 'Storage';
  actionType: 'Terminate' | 'Stop' | 'Right-Size' | 'Snapshot-and-Delete' | 'Downgrade-Tier';
  targetSkuOrTier?: string;
  status: 'Pending Approval' | 'Snapshotting' | 'Executing' | 'Completed' | 'Rolled Back' | 'Failed';
  estimatedMonthlySavings: number;
  actualMonthlySavingsRealized?: number;
  executedBy?: string;
  executedAt?: string;
  snapshotId?: string;
  terraformCode: string;
  cliCommand: string;
  auditDetails: string;
  error?: string;
}

export interface FOCUSRecord {
  ChargePeriodStart: string;
  ChargePeriodEnd: string;
  ProviderName: string;
  AccountId: string;
  AccountName: string;
  RegionId: string;
  ServiceCategory: string;
  ServiceName: string;
  ResourceId: string;
  ResourceName: string;
  BilledCost: number;
  EffectiveCost: number;
  PricingUnit: string;
  UsageQuantity: number;
  Tags: Record<string, string>;
}

export interface FinOpsKPIs {
  totalMonthlySpend: number;
  projectedRunRate: number;
  totalPotentialMonthlySavings: number;
  realizedMonthlySavings: number;
  finOpsMaturityScore: number; // 0-100
  activeAnomaliesCount: number;
  idleComputeCount: number;
  unattachedStorageCount: number;
  cloudBreakdown: {
    AWS: number;
    Azure: number;
    GCP: number;
    Kubernetes: number;
  };
  departmentBreakdown: Record<string, number>;
}
