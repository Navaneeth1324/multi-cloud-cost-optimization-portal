import { ComputeAsset, StorageAsset, BudgetConfig, FinOpsAlert, RemediationAction, FinOpsKPIs } from '../types/finops';

const generate14DayTelemetry = (baseCpu: number, variance: number, baseNetMb: number) => {
  const points = [];
  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14'];
  for (let i = 0; i < 14; i++) {
    const randomVar = (Math.sin(i * 0.8) + (Math.random() * 0.6 - 0.3)) * variance;
    const cpu = Math.max(0.2, Math.min(100, parseFloat((baseCpu + randomVar).toFixed(1))));
    const net = Math.max(5, Math.round(baseNetMb + (Math.random() * 20 - 10)));
    points.push({ day: days[i], cpu, networkMb: net });
  }
  return points;
};

export const INITIAL_COMPUTE_ASSETS: ComputeAsset[] = [
  {
    id: 'i-0a8b9c7d1e2f3a401',
    name: 'prod-api-gateway-node-01',
    provider: 'AWS',
    accountId: '112233445566',
    accountName: 'AWS-Production-Main',
    region: 'us-east-1',
    zone: 'us-east-1a',
    instanceType: 'c5.2xlarge',
    vCPU: 8,
    memoryGb: 16,
    os: 'Linux (Ubuntu 22.04)',
    state: 'running',
    currentMonthlyCost: 248.20,
    tags: { Environment: 'Production', Department: 'Engineering', Owner: 'alex.k', Project: 'Core-API' },
    launchDate: '2026-01-15',
    metrics: {
      cpuTimeSeries: generate14DayTelemetry(68.4, 8.2, 4500),
      avgCpu14d: 68.4,
      p95Cpu14d: 82.1,
      avgNetworkIoMbDay: 4500,
      diskIops: 2400
    },
    recommendation: {
      status: 'OPTIMAL',
      action: 'None',
      monthlySavings: 0,
      confidenceScore: 98,
      reason: 'Instance operates within healthy utilization zone (Avg: 68.4%, p95: 82.1%).'
    }
  },
  {
    id: 'i-0f9e8d7c6b5a402',
    name: 'dev-ml-feature-builder',
    provider: 'AWS',
    accountId: '112233445566',
    accountName: 'AWS-Production-Main',
    region: 'us-east-1',
    zone: 'us-east-1b',
    instanceType: 'm5.4xlarge',
    vCPU: 16,
    memoryGb: 64,
    os: 'Linux (Amazon Linux 2023)',
    state: 'idle',
    currentMonthlyCost: 560.64,
    tags: { Environment: 'Development', Department: 'Data Science', Owner: 'priya.m', Project: 'FeatureStore' },
    launchDate: '2026-03-10',
    metrics: {
      cpuTimeSeries: generate14DayTelemetry(1.8, 0.6, 24),
      avgCpu14d: 1.8,
      p95Cpu14d: 3.4,
      avgNetworkIoMbDay: 24,
      diskIops: 80
    },
    recommendation: {
      status: 'IDLE',
      action: 'Terminate',
      monthlySavings: 560.64,
      confidenceScore: 99,
      reason: 'Avg CPU is 1.8% (< 5%) & Network I/O < 24 MB/day over 14 rolling days. Zero active batch jobs detected.'
    }
  },
  {
    id: 'i-0123456789abcdef3',
    name: 'staging-worker-kafka-consumer',
    provider: 'AWS',
    accountId: '112233445566',
    accountName: 'AWS-Production-Main',
    region: 'us-west-2',
    zone: 'us-west-2a',
    instanceType: 'r5.2xlarge',
    vCPU: 8,
    memoryGb: 64,
    os: 'Linux (Debian 12)',
    state: 'underutilized',
    currentMonthlyCost: 367.92,
    tags: { Environment: 'Staging', Department: 'Engineering', Owner: 'devops-team', Project: 'Streaming' },
    launchDate: '2026-04-20',
    metrics: {
      cpuTimeSeries: generate14DayTelemetry(8.4, 2.1, 840),
      avgCpu14d: 8.4,
      p95Cpu14d: 13.2,
      avgNetworkIoMbDay: 840,
      diskIops: 420
    },
    recommendation: {
      status: 'UNDERUTILIZED',
      action: 'Right-Size',
      targetType: 'r5.large (2 vCPU, 16 GB)',
      targetMonthlyCost: 91.98,
      monthlySavings: 275.94,
      confidenceScore: 94,
      reason: 'Instance is over-provisioned (Avg CPU: 8.4%, memory utilization < 22%). Downsizing to r5.large will save $275.94/mo without performance degradation.'
    }
  },
  {
    id: 'i-0987654321fedcba4',
    name: 'dr-failover-standby-db',
    provider: 'AWS',
    accountId: '112233445566',
    accountName: 'AWS-Production-Main',
    region: 'us-east-1',
    zone: 'us-east-1c',
    instanceType: 'r5.xlarge',
    vCPU: 4,
    memoryGb: 32,
    os: 'Linux (RedHat 9)',
    state: 'idle',
    currentMonthlyCost: 183.96,
    tags: { Environment: 'DisasterRecovery', Department: 'Security & IT', Owner: 'infra-lead', 'FinOps-Exempt': 'true' },
    launchDate: '2026-02-01',
    metrics: {
      cpuTimeSeries: generate14DayTelemetry(0.8, 0.3, 12),
      avgCpu14d: 0.8,
      p95Cpu14d: 1.4,
      avgNetworkIoMbDay: 12,
      diskIops: 40
    },
    recommendation: {
      status: 'EXEMPT_IDLE',
      action: 'None',
      monthlySavings: 0,
      confidenceScore: 100,
      isExempt: true,
      exemptionReason: 'Excluded from waste calculation due to tag [Environment=DisasterRecovery, FinOps-Exempt=true]. Standby warm replica required by SLA.',
      reason: 'Instance CPU < 1%, but marked as DisasterRecovery hot standby.'
    }
  },
  {
    id: 'vm-payment-backend-01',
    name: 'vm-payment-backend-01',
    provider: 'Azure',
    accountId: 'sub-azure-corp-01',
    accountName: 'Azure-Enterprise-Prod',
    region: 'eastus',
    zone: 'Zone 1',
    instanceType: 'Standard_D8s_v5',
    vCPU: 8,
    memoryGb: 32,
    os: 'Windows Server 2022',
    state: 'running',
    currentMonthlyCost: 416.10,
    tags: { Environment: 'Production', Department: 'Engineering', Owner: 'sarah.t', Project: 'FintechCore' },
    launchDate: '2026-01-10',
    metrics: {
      cpuTimeSeries: generate14DayTelemetry(54.2, 7.8, 3800),
      avgCpu14d: 54.2,
      p95Cpu14d: 74.6,
      avgNetworkIoMbDay: 3800,
      diskIops: 3100
    },
    recommendation: {
      status: 'OPTIMAL',
      action: 'None',
      monthlySavings: 0,
      confidenceScore: 96,
      reason: 'Healthy workload distribution and consistent memory utilization.'
    }
  },
  {
    id: 'vm-gpu-trainer-02',
    name: 'vm-gpu-trainer-02',
    provider: 'Azure',
    accountId: 'sub-azure-corp-01',
    accountName: 'Azure-Enterprise-Prod',
    region: 'eastus2',
    zone: 'Zone 2',
    instanceType: 'Standard_NC4as_T4_v3',
    vCPU: 4,
    memoryGb: 28,
    os: 'Linux (Ubuntu 22.04)',
    state: 'idle',
    currentMonthlyCost: 788.40,
    tags: { Environment: 'Development', Department: 'Data Science', Owner: 'chen.w', Project: 'VisionAI' },
    launchDate: '2026-05-12',
    metrics: {
      cpuTimeSeries: generate14DayTelemetry(2.1, 0.7, 45),
      avgCpu14d: 2.1,
      p95Cpu14d: 4.1,
      avgNetworkIoMbDay: 45,
      diskIops: 90
    },
    recommendation: {
      status: 'IDLE',
      action: 'Terminate',
      monthlySavings: 788.40,
      confidenceScore: 98,
      reason: 'GPU training node idle for 14 straight days (Avg CPU 2.1%, GPU utilization 0%). Immediate stop or decommission recommended.'
    }
  },
  {
    id: 'vm-analytics-reporting-03',
    name: 'vm-analytics-reporting-03',
    provider: 'Azure',
    accountId: 'sub-azure-corp-01',
    accountName: 'Azure-Enterprise-Prod',
    region: 'centralus',
    zone: 'Zone 1',
    instanceType: 'Standard_E8s_v5',
    vCPU: 8,
    memoryGb: 64,
    os: 'Linux (RedHat 8.8)',
    state: 'underutilized',
    currentMonthlyCost: 496.40,
    tags: { Environment: 'Production', Department: 'Product & Ops', Owner: 'claire.d', Project: 'Reports' },
    launchDate: '2026-03-01',
    metrics: {
      cpuTimeSeries: generate14DayTelemetry(11.2, 2.5, 950),
      avgCpu14d: 11.2,
      p95Cpu14d: 17.8,
      avgNetworkIoMbDay: 950,
      diskIops: 600
    },
    recommendation: {
      status: 'UNDERUTILIZED',
      action: 'Right-Size',
      targetType: 'Standard_E4s_v5 (4 vCPU, 32 GB)',
      targetMonthlyCost: 248.20,
      monthlySavings: 248.20,
      confidenceScore: 92,
      reason: 'Average CPU utilization is 11.2%. Downsizing to Standard_E4s_v5 cuts monthly expense by 50%.'
    }
  },
  {
    id: 'inst-spark-worker-01',
    name: 'inst-spark-worker-01',
    provider: 'GCP',
    accountId: 'gcp-prod-analytics',
    accountName: 'GCP Analytics Platform',
    region: 'us-central1',
    zone: 'us-central1-a',
    instanceType: 'n2-standard-8',
    vCPU: 8,
    memoryGb: 32,
    os: 'Container-Optimized OS',
    state: 'running',
    currentMonthlyCost: 288.64,
    tags: { Environment: 'Production', Department: 'Data Science', Owner: 'vikram.s', Project: 'ETL-Pipeline' },
    launchDate: '2026-02-18',
    metrics: {
      cpuTimeSeries: generate14DayTelemetry(72.1, 9.4, 6200),
      avgCpu14d: 72.1,
      p95Cpu14d: 89.3,
      avgNetworkIoMbDay: 6200,
      diskIops: 4200
    },
    recommendation: {
      status: 'OPTIMAL',
      action: 'None',
      monthlySavings: 0,
      confidenceScore: 99,
      reason: 'Optimal workload health and stable execution throughput.'
    }
  },
  {
    id: 'inst-sandbox-dev-vm',
    name: 'inst-sandbox-dev-vm',
    provider: 'GCP',
    accountId: 'gcp-dev-sandbox',
    accountName: 'GCP Developer Sandbox',
    region: 'us-east4',
    zone: 'us-east4-b',
    instanceType: 'e2-standard-4',
    vCPU: 4,
    memoryGb: 16,
    os: 'Debian 11',
    state: 'idle',
    currentMonthlyCost: 97.44,
    tags: { Environment: 'Development', Department: 'Engineering', Owner: 'test-user', Project: 'Sandbox' },
    launchDate: '2026-06-01',
    metrics: {
      cpuTimeSeries: generate14DayTelemetry(0.9, 0.4, 18),
      avgCpu14d: 0.9,
      p95Cpu14d: 1.8,
      avgNetworkIoMbDay: 18,
      diskIops: 30
    },
    recommendation: {
      status: 'IDLE',
      action: 'Schedule-Stop',
      targetMonthlyCost: 29.23,
      monthlySavings: 68.21,
      confidenceScore: 97,
      reason: 'Sandbox instance left running 24x7. Applying night & weekend shutdown schedule (7pm-7am) recovers 70% of spend.'
    }
  },
  {
    id: 'k8s-node-burst-pool-04',
    name: 'k8s-node-burst-pool-04',
    provider: 'Kubernetes',
    accountId: 'k8s-cluster-prod',
    accountName: 'EKS Production Cluster',
    region: 'us-east-1',
    instanceType: 'c6i.4xlarge',
    vCPU: 16,
    memoryGb: 32,
    os: 'Amazon Linux 2',
    state: 'underutilized',
    currentMonthlyCost: 496.80,
    tags: { Environment: 'Production', Department: 'Engineering', Owner: 'k8s-admin', Project: 'Microservices' },
    launchDate: '2026-04-11',
    metrics: {
      cpuTimeSeries: generate14DayTelemetry(14.6, 3.2, 1200),
      avgCpu14d: 14.6,
      p95Cpu14d: 21.0,
      avgNetworkIoMbDay: 1200,
      diskIops: 800
    },
    recommendation: {
      status: 'UNDERUTILIZED',
      action: 'Right-Size',
      targetType: 'c6i.2xlarge (8 vCPU, 16 GB)',
      targetMonthlyCost: 248.40,
      monthlySavings: 248.40,
      confidenceScore: 90,
      reason: 'Kubernetes node group over-provisioned; pod density is low (< 35% allocatable).'
    }
  }
];

export const INITIAL_STORAGE_ASSETS: StorageAsset[] = [
  {
    id: 'vol-01a2b3c4d5e6f701',
    name: 'vol-staging-backup-old',
    provider: 'AWS',
    accountId: '112233445566',
    accountName: 'AWS-Production-Main',
    region: 'us-east-1',
    volumeType: 'gp2 (General Purpose SSD)',
    sizeGb: 1000,
    iops: 3000,
    status: 'unattached',
    daysUnattached: 28,
    monthlyCost: 100.00,
    lastDetachDate: '2026-08-04',
    tags: { Environment: 'Staging', Department: 'Engineering', Owner: 'alex.k', Project: 'OldMigration' },
    recommendation: {
      action: 'Snapshot-and-Delete',
      targetMonthlyCost: 5.00,
      monthlySavings: 95.00,
      reason: 'Unattached for 28 consecutive days (> 7 days). Create snapshot safety backup and delete unattached volume.'
    }
  },
  {
    id: 'vol-09z8y7x6w5v4u302',
    name: 'vol-analytics-raw-temp',
    provider: 'AWS',
    accountId: '112233445566',
    accountName: 'AWS-Production-Main',
    region: 'us-west-2',
    volumeType: 'io2 (Provisioned IOPS SSD)',
    sizeGb: 500,
    iops: 10000,
    status: 'unattached',
    daysUnattached: 45,
    monthlyCost: 325.00,
    lastDetachDate: '2026-07-18',
    tags: { Environment: 'Development', Department: 'Data Science', Owner: 'priya.m', Project: 'FeatureStore' },
    recommendation: {
      action: 'Snapshot-and-Delete',
      targetMonthlyCost: 12.50,
      monthlySavings: 312.50,
      reason: 'High-cost Provisioned IOPS volume orphaned for 45 days. Snapshot to S3 archive and purge immediately.'
    }
  },
  {
    id: 'vol-0334455667788990a',
    name: 'vol-prod-postgres-wal',
    provider: 'AWS',
    accountId: '112233445566',
    accountName: 'AWS-Production-Main',
    region: 'us-east-1',
    volumeType: 'gp2',
    sizeGb: 2000,
    iops: 6000,
    status: 'attached',
    attachedInstanceId: 'i-0a8b9c7d1e2f3a401',
    daysUnattached: 0,
    monthlyCost: 200.00,
    tags: { Environment: 'Production', Department: 'Engineering', Owner: 'db-admin', Project: 'Core-API' },
    recommendation: {
      action: 'Downgrade-Tier',
      targetTier: 'gp3 (Next-Gen General Purpose)',
      targetMonthlyCost: 160.00,
      monthlySavings: 40.00,
      reason: 'Migrate legacy gp2 to modern gp3 for instant 20% baseline savings with guaranteed 3,000 IOPS baseline.'
    }
  },
  {
    id: 'disk-orphaned-sql-log',
    name: 'disk-orphaned-sql-log',
    provider: 'Azure',
    accountId: 'sub-azure-corp-01',
    accountName: 'Azure-Enterprise-Prod',
    region: 'centralus',
    volumeType: 'Premium SSD (P30)',
    sizeGb: 1024,
    iops: 5000,
    status: 'unattached',
    daysUnattached: 62,
    monthlyCost: 135.17,
    lastDetachDate: '2026-07-01',
    tags: { Environment: 'Staging', Department: 'Engineering', Owner: 'legacy-team', Project: 'SQLMigration' },
    recommendation: {
      action: 'Snapshot-and-Delete',
      targetMonthlyCost: 6.00,
      monthlySavings: 129.17,
      reason: 'Premium SSD unattached for 62 days following SQL cluster decommissioning.'
    }
  },
  {
    id: 'disk-qa-unattached-pd1',
    name: 'disk-qa-unattached-pd1',
    provider: 'GCP',
    accountId: 'gcp-staging-qa',
    accountName: 'GCP Staging Cluster',
    region: 'us-central1',
    volumeType: 'pd-ssd',
    sizeGb: 500,
    status: 'unattached',
    daysUnattached: 19,
    monthlyCost: 85.00,
    lastDetachDate: '2026-08-13',
    tags: { Environment: 'Staging', Department: 'Engineering', Owner: 'qa-lead', Project: 'QATesting' },
    recommendation: {
      action: 'Snapshot-and-Delete',
      targetMonthlyCost: 4.00,
      monthlySavings: 81.00,
      reason: 'Unattached Persistent Disk left over after automated QA environment tear down.'
    }
  }
];

export const INITIAL_BUDGETS: BudgetConfig[] = [
  {
    id: 'bgt-eng-global',
    name: 'Engineering Cloud Infrastructure',
    provider: 'All',
    department: 'Engineering',
    monthlyLimit: 65000,
    currentSpend: 58800,
    forecastSpend: 69400,
    thresholds: { warningPercent: 80, criticalPercent: 90, breachPercent: 100 },
    notificationChannels: ['Slack', 'Email', 'Webhook'],
    alertsTriggered: { warning: true, critical: true, breach: false }
  },
  {
    id: 'bgt-data-ml',
    name: 'Data Science & ML Training Pool',
    provider: 'AWS',
    department: 'Data Science',
    monthlyLimit: 30000,
    currentSpend: 31800,
    forecastSpend: 36200,
    thresholds: { warningPercent: 80, criticalPercent: 90, breachPercent: 100 },
    notificationChannels: ['Slack', 'PagerDuty', 'Webhook'],
    alertsTriggered: { warning: true, critical: true, breach: true }
  },
  {
    id: 'bgt-azure-core',
    name: 'Azure Enterprise Services',
    provider: 'Azure',
    department: 'Product & Ops',
    monthlyLimit: 25000,
    currentSpend: 19400,
    forecastSpend: 22800,
    thresholds: { warningPercent: 80, criticalPercent: 90, breachPercent: 100 },
    notificationChannels: ['Email', 'Slack'],
    alertsTriggered: { warning: false, critical: false, breach: false }
  },
  {
    id: 'bgt-gcp-analytics',
    name: 'GCP BigQuery & Analytics',
    provider: 'GCP',
    department: 'Data Science',
    monthlyLimit: 20000,
    currentSpend: 17200,
    forecastSpend: 21100,
    thresholds: { warningPercent: 80, criticalPercent: 90, breachPercent: 100 },
    notificationChannels: ['Slack', 'Webhook'],
    alertsTriggered: { warning: true, critical: false, breach: false }
  }
];

export const INITIAL_ALERTS: FinOpsAlert[] = [
  {
    id: 'alt-001',
    timestamp: '2026-09-01 10:14:22 UTC',
    budgetId: 'bgt-data-ml',
    budgetName: 'Data Science & ML Training Pool',
    severity: 'emergency',
    channel: 'Slack',
    provider: 'AWS',
    title: 'CRITICAL: Budget Limit Breached (106.0%)',
    message: 'Current spend ($31,800.00) has exceeded the 100% budget limit ($30,000.00). Forecasted month-end spend is $36,200.00.',
    payloadPreview: {
      alert_id: 'alt-001',
      budget_id: 'bgt-data-ml',
      budget_name: 'Data Science & ML Training Pool',
      current_spend: 31800.00,
      limit: 30000.00,
      percent_utilized: '106.0%',
      forecast_total: 36200.00,
      overage_projected: 6200.00,
      webhook_target: 'https://hooks.slack.com/services/T00/B00/FinOpsAlerts',
      recipients: ['#finops-alerts', 'finops-admin@enterprise.internal']
    },
    acknowledged: false
  },
  {
    id: 'alt-002',
    timestamp: '2026-09-01 08:30:00 UTC',
    budgetId: 'bgt-eng-global',
    budgetName: 'Engineering Cloud Infrastructure',
    severity: 'warning',
    channel: 'Webhook',
    provider: 'All',
    title: 'WARNING: 90% Threshold Exceeded (90.46%)',
    message: 'Engineering Cloud Infrastructure spend has reached $58,800.00 against limit of $65,000.00. Forecast suggests end-of-month overrun of $4,400.00.',
    payloadPreview: {
      alert_id: 'alt-002',
      budget_id: 'bgt-eng-global',
      current_spend: 58800.00,
      limit: 65000.00,
      percent_utilized: '90.46%',
      webhook_target: 'https://api.opsgenie.com/v2/alerts',
      urgency: 'P2-High'
    },
    acknowledged: true,
    resolvedAt: '2026-09-01 09:12:00 UTC'
  },
  {
    id: 'alt-003',
    timestamp: '2026-09-01 04:00:15 UTC',
    severity: 'info',
    channel: 'Email',
    provider: 'AWS',
    title: 'Idle Compute Anomaly Detected (i-0f9e8d7c6b5a402)',
    message: 'Instance dev-ml-feature-builder has run at < 2% CPU utilization for 14 consecutive days. Estimated monthly waste: $560.64.',
    payloadPreview: {
      resource_id: 'i-0f9e8d7c6b5a402',
      instance_type: 'm5.4xlarge',
      avg_cpu_14d: '1.8%',
      waste_per_month: '$560.64',
      suggested_action: 'TERMINATE_OR_SNAPSHOT'
    },
    acknowledged: false
  }
];

export const INITIAL_REMEDIATION_ACTIONS: RemediationAction[] = [
  {
    id: 'rem-001',
    assetId: 'vol-01a2b3c4d5e6f701',
    assetName: 'vol-staging-backup-old',
    provider: 'AWS',
    assetType: 'Storage',
    actionType: 'Snapshot-and-Delete',
    status: 'Pending Approval',
    estimatedMonthlySavings: 95.00,
    terraformCode: `# Terraform Remediation Snippet
# 1. Create safety snapshot
resource "aws_ebs_snapshot" "snapshot_vol_01a2b3c4d5e6f701" {
  volume_id   = "vol-01a2b3c4d5e6f701"
  description = "FinOps safety snapshot prior to orphan volume deletion"
  tags = {
    DecommissionDate = "2026-09-01"
    Reason           = "Orphaned > 28 days"
  }
}

# 2. Volume will be safely removed from state and AWS`,
    cliCommand: `aws ec2 create-snapshot --volume-id vol-01a2b3c4d5e6f701 --description "FinOps pre-delete safety backup" && \\
aws ec2 delete-volume --volume-id vol-01a2b3c4d5e6f701`,
    auditDetails: 'Volume unattached for 28 days. Pre-deletion safety snapshot will be stored with tag [FinOps-Retain=90d].'
  },
  {
    id: 'rem-002',
    assetId: 'i-0f9e8d7c6b5a402',
    assetName: 'dev-ml-feature-builder',
    provider: 'AWS',
    assetType: 'Compute',
    actionType: 'Terminate',
    status: 'Pending Approval',
    estimatedMonthlySavings: 560.64,
    terraformCode: `# Terraform Decommission Plan
# Remove instance declaration or set count = 0
resource "aws_instance" "dev_ml_feature_builder" {
  # count = 0  <-- Set count to zero or remove block
  # Lifecycle prevent_destroy bypassed upon FinOps approval
}`,
    cliCommand: `aws ec2 create-image --instance-id i-0f9e8d7c6b5a402 --name "ami-backup-dev-ml-$(date +%Y%m%d)" --no-reboot && \\
aws ec2 terminate-instances --instance-ids i-0f9e8d7c6b5a402`,
    auditDetails: '14-day average CPU is 1.8%. AMI snapshot created automatically before instance termination.'
  },
  {
    id: 'rem-003',
    assetId: 'i-0123456789abcdef3',
    assetName: 'staging-worker-kafka-consumer',
    provider: 'AWS',
    assetType: 'Compute',
    actionType: 'Right-Size',
    targetSkuOrTier: 'r5.large',
    status: 'Pending Approval',
    estimatedMonthlySavings: 275.94,
    terraformCode: `# Terraform Right-Sizing Snippet
resource "aws_instance" "staging_worker_kafka_consumer" {
  - instance_type = "r5.2xlarge"
  + instance_type = "r5.large"
}`,
    cliCommand: `aws ec2 stop-instances --instance-ids i-0123456789abcdef3 && \\
aws ec2 modify-instance-attribute --instance-id i-0123456789abcdef3 --instance-type "{\"Value\": \"r5.large\"}" && \\
aws ec2 start-instances --instance-ids i-0123456789abcdef3`,
    auditDetails: 'Downsizing from r5.2xlarge (8 vCPU, 64GB) to r5.large (2 vCPU, 16GB). Zero CPU throttling anticipated.'
  }
];

export const INITIAL_KPIS: FinOpsKPIs = {
  totalMonthlySpend: 127200.00,
  projectedRunRate: 1526400.00,
  totalPotentialMonthlySavings: 2487.86,
  realizedMonthlySavings: 840.00,
  finOpsMaturityScore: 78,
  activeAnomaliesCount: 4,
  idleComputeCount: 3,
  unattachedStorageCount: 4,
  cloudBreakdown: {
    AWS: 68400.00,
    Azure: 38200.00,
    GCP: 18100.00,
    Kubernetes: 2500.00
  },
  departmentBreakdown: {
    Engineering: 58800.00,
    'Data Science': 49000.00,
    'Product & Ops': 13400.00,
    'Security & IT': 6000.00
  }
};
