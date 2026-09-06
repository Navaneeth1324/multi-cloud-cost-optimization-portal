import { CloudProvider, FOCUSRecord } from '../types/finops';

export interface IngestionResult {
  detectedProvider: CloudProvider | 'FOCUS' | 'Unknown';
  totalCost: number;
  recordCount: number;
  tagComplianceRate: number; // 0-100%
  records: FOCUSRecord[];
  departmentBreakdown: Record<string, number>;
  serviceBreakdown: Record<string, number>;
  parseErrors: string[];
}

export function parseBillingCsv(csvText: string): IngestionResult {
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return {
      detectedProvider: 'Unknown',
      totalCost: 0,
      recordCount: 0,
      tagComplianceRate: 0,
      records: [],
      departmentBreakdown: {},
      serviceBreakdown: {},
      parseErrors: ['File is empty or contains no header line']
    };
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const headerLookup = new Map<string, number>();
  headers.forEach((h, idx) => headerLookup.set(h.toLowerCase(), idx));

  // Determine provider / format schema
  let detectedProvider: CloudProvider | 'FOCUS' | 'Unknown' = 'Unknown';
  if (headerLookup.has('chargeperiodstart') && headerLookup.has('billedcost')) {
    detectedProvider = 'FOCUS';
  } else if (headerLookup.has('identity/lineitemid') || headerLookup.has('lineitem/productcode')) {
    detectedProvider = 'AWS';
  } else if (headerLookup.has('subscriptionid') || headerLookup.has('consumedservice')) {
    detectedProvider = 'Azure';
  } else if (headerLookup.has('billing_account_id') || headerLookup.has('service.description')) {
    detectedProvider = 'GCP';
  }

  const records: FOCUSRecord[] = [];
  const departmentBreakdown: Record<string, number> = {};
  const serviceBreakdown: Record<string, number> = {};
  let totalCost = 0;
  let taggedCount = 0;
  const parseErrors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const row = parseCsvRow(lines[i]);
      if (row.length === 0) continue;

      let providerName = detectedProvider === 'FOCUS' ? 'AWS' : detectedProvider;
      let accountId = 'default-acct';
      let serviceName = 'General Cloud Service';
      let resourceId = `res-${i}`;
      let billedCost = 0;
      let regionId = 'global';
      const tags: Record<string, string> = {};

      if (detectedProvider === 'AWS') {
        const costIdx = headerLookup.get('lineitem/unblendedcost') ?? headerLookup.get('pricing/publicondemandcost') ?? -1;
        billedCost = costIdx >= 0 ? parseFloat(row[costIdx]) || 0 : 0;
        serviceName = getVal(row, headerLookup, 'lineitem/productcode', 'AWS Service');
        resourceId = getVal(row, headerLookup, 'lineitem/resourceid', `i-${i}`);
        accountId = getVal(row, headerLookup, 'lineitem/usageaccountid', '112233445566');
        regionId = getVal(row, headerLookup, 'lineitem/availabilityzone', 'us-east-1');
        
        headers.forEach((h, idx) => {
          if (h.startsWith('resourceTags/user:')) {
            const tagKey = h.replace('resourceTags/user:', '');
            if (row[idx]) tags[tagKey] = row[idx];
          }
        });
      } else if (detectedProvider === 'Azure') {
        const costIdx = headerLookup.get('costinbillingcurrency') ?? -1;
        billedCost = costIdx >= 0 ? parseFloat(row[costIdx]) || 0 : 0;
        serviceName = getVal(row, headerLookup, 'metercategory', 'Azure Compute');
        resourceId = getVal(row, headerLookup, 'resourceid', `azure-vm-${i}`);
        accountId = getVal(row, headerLookup, 'subscriptionid', 'sub-azure-01');
        regionId = getVal(row, headerLookup, 'resourcelocation', 'eastus');

        headers.forEach((h, idx) => {
          if (h.toLowerCase().startsWith('tag_')) {
            const tagKey = h.substring(4);
            if (row[idx]) tags[tagKey] = row[idx];
          }
        });
      } else if (detectedProvider === 'GCP') {
        const costIdx = headerLookup.get('cost') ?? -1;
        billedCost = costIdx >= 0 ? parseFloat(row[costIdx]) || 0 : 0;
        serviceName = getVal(row, headerLookup, 'service.description', 'Compute Engine');
        resourceId = getVal(row, headerLookup, 'resource.name', `gcp-res-${i}`);
        accountId = getVal(row, headerLookup, 'project.id', 'gcp-project-01');
        regionId = getVal(row, headerLookup, 'location.region', 'us-central1');

        headers.forEach((h, idx) => {
          if (h.toLowerCase().startsWith('labels.')) {
            const tagKey = h.substring(7);
            if (row[idx]) tags[tagKey] = row[idx];
          }
        });
      } else {
        // FOCUS format
        const costIdx = headerLookup.get('billedcost') ?? -1;
        billedCost = costIdx >= 0 ? parseFloat(row[costIdx]) || 0 : 0;
        providerName = getVal(row, headerLookup, 'providername', 'Multi-Cloud') as any;
        serviceName = getVal(row, headerLookup, 'servicename', 'Cloud Engine');
        resourceId = getVal(row, headerLookup, 'resourceid', `res-${i}`);
        accountId = getVal(row, headerLookup, 'accountid', 'acct-01');
        regionId = getVal(row, headerLookup, 'regionid', 'us-east-1');

        headers.forEach((h, idx) => {
          if (h.toLowerCase().startsWith('tag_') || h.toLowerCase().startsWith('tag:')) {
            const tagKey = h.substring(4);
            if (row[idx]) tags[tagKey] = row[idx];
          }
        });
      }

      const dept = tags['Department'] || 'Unallocated';
      departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + billedCost;
      serviceBreakdown[serviceName] = (serviceBreakdown[serviceName] || 0) + billedCost;
      totalCost += billedCost;

      if (Object.keys(tags).length > 0) {
        taggedCount++;
      }

      records.push({
        ChargePeriodStart: '2026-08-01T00:00:00Z',
        ChargePeriodEnd: '2026-08-31T23:59:59Z',
        ProviderName: providerName,
        AccountId: accountId,
        AccountName: accountId,
        RegionId: regionId,
        ServiceCategory: 'Infrastructure',
        ServiceName: serviceName,
        ResourceId: resourceId,
        ResourceName: resourceId.split('/').pop() || resourceId,
        BilledCost: parseFloat(billedCost.toFixed(2)),
        EffectiveCost: parseFloat(billedCost.toFixed(2)),
        PricingUnit: 'UsageHours',
        UsageQuantity: 744,
        Tags: tags
      });
    } catch (err: any) {
      parseErrors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  const tagComplianceRate = records.length > 0 ? Math.round((taggedCount / records.length) * 100) : 0;

  return {
    detectedProvider,
    totalCost: parseFloat(totalCost.toFixed(2)),
    recordCount: records.length,
    tagComplianceRate,
    records,
    departmentBreakdown,
    serviceBreakdown,
    parseErrors
  };
}

function getVal(row: string[], lookup: Map<string, number>, key: string, fallback: string): string {
  const idx = lookup.get(key.toLowerCase());
  if (idx !== undefined && idx >= 0 && row[idx]) {
    return row[idx];
  }
  return fallback;
}

function parseCsvRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
