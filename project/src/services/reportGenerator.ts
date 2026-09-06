import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ComputeAsset, StorageAsset, BudgetConfig, FinOpsKPIs } from '../types/finops';

export function exportFinOpsPdfReport(
  kpis: FinOpsKPIs,
  computeAssets: ComputeAsset[],
  storageAssets: StorageAsset[],
  budgets: BudgetConfig[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(11, 15, 25);
  doc.rect(0, 0, 595.28, 90, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CloudCost IQ | FinOps Executive Report', 40, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text(`Generated on: ${new Date().toUTCString()} | Multi-Cloud Governance Audit`, 40, 62);

  // Executive Summary Box
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(40, 105, 515, 75, 4, 4, 'F');

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Cost & Savings Summary', 55, 125);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Monthly Cloud Spend: $${kpis.totalMonthlySpend.toLocaleString()}`, 55, 145);
  doc.text(`Annualized Run-Rate: $${kpis.projectedRunRate.toLocaleString()}`, 55, 162);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Green
  doc.text(`Potential Monthly Savings: $${kpis.totalPotentialMonthlySavings.toLocaleString()}`, 310, 145);
  doc.setTextColor(59, 130, 246); // Blue
  doc.text(`FinOps Maturity Score: ${kpis.finOpsMaturityScore}/100 (Advanced)`, 310, 162);

  let currentY = 195;

  // Compute Waste Table
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Idle & Underutilized Compute Instances (14-Day Rolling Window)', 40, currentY);

  const computeRows = computeAssets
    .filter(a => a.recommendation.status !== 'OPTIMAL')
    .map(a => [
      a.id,
      a.name,
      a.provider,
      a.instanceType,
      `${a.metrics.avgCpu14d}%`,
      a.recommendation.action,
      `$${a.currentMonthlyCost.toFixed(2)}`,
      `$${a.recommendation.monthlySavings.toFixed(2)}`
    ]);

  autoTable(doc, {
    startY: currentY + 10,
    head: [['ID', 'Name', 'Cloud', 'Type', 'Avg CPU', 'Recommended Action', 'Cost/Mo', 'Est. Savings']],
    body: computeRows.length > 0 ? computeRows : [['-', 'No idle compute found', '-', '-', '-', '-', '-', '$0']],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] }
  });

  currentY = (doc as any).lastAutoTable.finalY + 25;

  // Storage Waste Table
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Unattached Block Storage & Tier Migrations (> 7 Days Idle)', 40, currentY);

  const storageRows = storageAssets
    .filter(s => s.status === 'unattached' || s.recommendation.action !== 'None')
    .map(s => [
      s.id,
      s.name,
      s.provider,
      `${s.sizeGb} GB`,
      s.daysUnattached > 0 ? `${s.daysUnattached} days` : 'Attached',
      s.recommendation.action,
      `$${s.monthlyCost.toFixed(2)}`,
      `$${s.recommendation.monthlySavings.toFixed(2)}`
    ]);

  autoTable(doc, {
    startY: currentY + 10,
    head: [['Volume ID', 'Name', 'Cloud', 'Size', 'Unattached For', 'Action', 'Cost/Mo', 'Est. Savings']],
    body: storageRows.length > 0 ? storageRows : [['-', 'No unattached storage', '-', '-', '-', '-', '-', '$0']],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] }
  });

  currentY = (doc as any).lastAutoTable.finalY + 25;

  // Budget Status Table
  if (currentY > 700) {
    doc.addPage();
    currentY = 40;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Budget & Threshold Governance Status', 40, currentY);

  const budgetRows = budgets.map(b => [
    b.name,
    b.department,
    b.provider,
    `$${b.monthlyLimit.toLocaleString()}`,
    `$${b.currentSpend.toLocaleString()}`,
    `${((b.currentSpend / b.monthlyLimit) * 100).toFixed(1)}%`,
    b.alertsTriggered.breach ? 'BREACHED' : b.alertsTriggered.critical ? 'CRITICAL (>90%)' : b.alertsTriggered.warning ? 'WARNING (>80%)' : 'HEALTHY'
  ]);

  autoTable(doc, {
    startY: currentY + 10,
    head: [['Budget Name', 'Department', 'Provider', 'Limit', 'Current Spend', 'Burn %', 'Status']],
    body: budgetRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`CloudCost IQ FinOps Executive Report | Page ${i} of ${pageCount}`, 40, 820);
  }

  doc.save(`CloudCost_IQ_FinOps_Report_${new Date().toISOString().substring(0, 10)}.pdf`);
}

export function exportFinOpsCsvReport(
  computeAssets: ComputeAsset[],
  storageAssets: StorageAsset[]
) {
  let csv = 'AssetID,AssetName,Provider,AssetType,Category,CurrentMonthlyCost,ProjectedSavings,Recommendation,Reason\n';

  computeAssets.forEach(c => {
    csv += `"${c.id}","${c.name}","${c.provider}","Compute","${c.recommendation.status}",${c.currentMonthlyCost},${c.recommendation.monthlySavings},"${c.recommendation.action}","${c.recommendation.reason.replace(/"/g, '""')}"\n`;
  });

  storageAssets.forEach(s => {
    csv += `"${s.id}","${s.name}","${s.provider}","Storage","${s.status}",${s.monthlyCost},${s.recommendation.monthlySavings},"${s.recommendation.action}","${s.recommendation.reason.replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `FinOps_Asset_Waste_Export_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
