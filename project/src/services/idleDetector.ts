import { ComputeAsset } from '../types/finops';

export interface EvaluationOptions {
  cpuThresholdPct?: number; // default: 5%
  networkIoMbThreshold?: number; // default: 100 MB/day
  underutilizedCpuThreshold?: number; // default: 15%
}

export function evaluateComputeAsset(
  asset: ComputeAsset,
  options: EvaluationOptions = {}
): ComputeAsset {
  const cpuThreshold = options.cpuThresholdPct ?? 5;
  const netThreshold = options.networkIoMbThreshold ?? 100;
  const underutilizedThreshold = options.underutilizedCpuThreshold ?? 15;

  const { avgCpu14d, avgNetworkIoMbDay, p95Cpu14d } = asset.metrics;
  const tags = asset.tags || {};

  // Check for FinOps exemption tags (Alternate Flow 1 in Spec)
  const isExempt =
    tags['Environment']?.toLowerCase() === 'disasterrecovery' ||
    tags['FinOps-Exempt']?.toLowerCase() === 'true' ||
    tags['Schedule']?.toLowerCase() === 'seasonal' ||
    tags['Role']?.toLowerCase() === 'hot-standby';

  if (isExempt) {
    return {
      ...asset,
      state: 'idle',
      recommendation: {
        status: 'EXEMPT_IDLE',
        action: 'None',
        monthlySavings: 0,
        confidenceScore: 100,
        isExempt: true,
        exemptionReason: `Exempted from waste calculation via tag policy [${
          tags['Environment'] === 'DisasterRecovery' ? 'Environment=DisasterRecovery' : 'FinOps-Exempt=true'
        }]. Workload required for failover SLA.`,
        reason: 'Instance exhibits low utilization but is explicitly protected by governance exemption tag.'
      }
    };
  }

  // Rule 1: Idle Instance (< 5% CPU average and low network I/O)
  if (avgCpu14d < cpuThreshold && avgNetworkIoMbDay < netThreshold) {
    const isDevelopment = tags['Environment']?.toLowerCase() === 'development' || tags['Environment']?.toLowerCase() === 'sandbox';
    const suggestedAction = isDevelopment ? 'Schedule-Stop' : 'Terminate';
    
    // If schedule stop, savings is ~70% (nights and weekends)
    const monthlySavings = suggestedAction === 'Schedule-Stop' 
      ? parseFloat((asset.currentMonthlyCost * 0.70).toFixed(2))
      : asset.currentMonthlyCost;

    return {
      ...asset,
      state: 'idle',
      recommendation: {
        status: 'IDLE',
        action: suggestedAction,
        targetMonthlyCost: suggestedAction === 'Schedule-Stop' ? parseFloat((asset.currentMonthlyCost * 0.30).toFixed(2)) : 0,
        monthlySavings,
        confidenceScore: Math.min(99, Math.round(90 + (5 - avgCpu14d) * 2)),
        reason: `Avg CPU is ${avgCpu14d}% (< ${cpuThreshold}%) and Network I/O is ${avgNetworkIoMbDay} MB/day (< ${netThreshold} MB) over 14 rolling days. No active workload detected.`
      }
    };
  }

  // Rule 2: Underutilized Instance (5% <= CPU < 15%) -> Downsize (Alternate Flow 2 in Spec)
  if (avgCpu14d >= cpuThreshold && avgCpu14d < underutilizedThreshold && p95Cpu14d < 30) {
    const downsizedSku = getDownsizedSku(asset.instanceType, asset.provider);
    const savingsRatio = 0.50; // Downsizing typically cuts cost by 50%
    const monthlySavings = parseFloat((asset.currentMonthlyCost * savingsRatio).toFixed(2));
    const targetMonthlyCost = parseFloat((asset.currentMonthlyCost * (1 - savingsRatio)).toFixed(2));

    return {
      ...asset,
      state: 'underutilized',
      recommendation: {
        status: 'UNDERUTILIZED',
        action: 'Right-Size',
        targetType: downsizedSku,
        targetMonthlyCost,
        monthlySavings,
        confidenceScore: 92,
        reason: `Over-provisioned capacity: 14-day Avg CPU is ${avgCpu14d}% with p95 peak at ${p95Cpu14d}%. Downsizing to ${downsizedSku} saves $${monthlySavings}/mo without performance degradation.`
      }
    };
  }

  // Rule 3: Optimal Workload
  return {
    ...asset,
    state: 'running',
    recommendation: {
      status: 'OPTIMAL',
      action: 'None',
      monthlySavings: 0,
      confidenceScore: 95,
      reason: `Workload operates within healthy operational envelope (Avg CPU: ${avgCpu14d}%, p95: ${p95Cpu14d}%).`
    }
  };
}

function getDownsizedSku(currentSku: string, provider: string): string {
  if (provider === 'AWS') {
    if (currentSku.includes('4xlarge')) return currentSku.replace('4xlarge', '2xlarge');
    if (currentSku.includes('2xlarge')) return currentSku.replace('2xlarge', 'xlarge');
    if (currentSku.includes('xlarge')) return currentSku.replace('xlarge', 'large');
    return 't4g.large (ARM Graviton3)';
  }
  if (provider === 'Azure') {
    if (currentSku.includes('D8s')) return currentSku.replace('D8s', 'D4s');
    if (currentSku.includes('E8s')) return currentSku.replace('E8s', 'E4s');
    if (currentSku.includes('D4s')) return currentSku.replace('D4s', 'D2s');
    return 'Standard_B2s (Burstable)';
  }
  if (provider === 'GCP') {
    if (currentSku.includes('standard-8')) return currentSku.replace('standard-8', 'standard-4');
    if (currentSku.includes('standard-4')) return currentSku.replace('standard-4', 'standard-2');
    return 'e2-medium';
  }
  return 'c6i.2xlarge';
}
