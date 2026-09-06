import { StorageAsset } from '../types/finops';

export function evaluateStorageAsset(asset: StorageAsset): StorageAsset {
  const { status, daysUnattached, volumeType, monthlyCost, sizeGb } = asset;

  // Unattached > 7 days rule (FR-003)
  if (status === 'unattached' && daysUnattached >= 7) {
    // Snapshot cost is roughly 5% of persistent SSD cost per month
    const snapshotCost = parseFloat((monthlyCost * 0.05).toFixed(2));
    const monthlySavings = parseFloat((monthlyCost - snapshotCost).toFixed(2));

    return {
      ...asset,
      recommendation: {
        action: 'Snapshot-and-Delete',
        targetTier: 'Cold Snapshot Storage',
        targetMonthlyCost: snapshotCost,
        monthlySavings,
        reason: `Volume has remained unattached for ${daysUnattached} consecutive days (> 7 days). Create a durable safety snapshot and delete the unattached volume to stop idle charges.`
      }
    };
  }

  // Attached legacy storage tier optimization (e.g. AWS gp2 -> gp3 saves 20%)
  if (status === 'attached' && volumeType.toLowerCase().includes('gp2')) {
    const savings = parseFloat((monthlyCost * 0.20).toFixed(2));
    return {
      ...asset,
      recommendation: {
        action: 'Downgrade-Tier',
        targetTier: 'gp3 (Next-Gen General Purpose)',
        targetMonthlyCost: parseFloat((monthlyCost - savings).toFixed(2)),
        monthlySavings: savings,
        reason: 'Migrate legacy gp2 to modern gp3. Yields 20% direct cost reduction with independent IOPS scaling and improved throughput baseline.'
      }
    };
  }

  return {
    ...asset,
    recommendation: {
      action: 'None',
      monthlySavings: 0,
      reason: 'Volume is attached and utilizing current generation cost-effective tier.'
    }
  };
}
