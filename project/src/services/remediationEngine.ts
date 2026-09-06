import { RemediationAction, ComputeAsset, StorageAsset } from '../types/finops';

export function generateRemediationCode(
  provider: string,
  assetType: 'Compute' | 'Storage',
  actionType: string,
  assetId: string,
  assetName: string,
  targetSkuOrTier?: string
): { terraform: string; cli: string } {
  if (assetType === 'Storage') {
    if (actionType === 'Snapshot-and-Delete') {
      const snapId = `snap-${assetId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)}-backup`;
      const tf = `# Terraform IaC Remediation Plan
# Step 1: Retain durable safety snapshot (FinOps Governance Rule)
resource "${provider === 'AWS' ? 'aws_ebs_snapshot' : provider === 'Azure' ? 'azurerm_snapshot' : 'google_compute_snapshot'}" "finops_${snapId}" {
  ${provider === 'AWS' ? `volume_id = "${assetId}"` : provider === 'Azure' ? `source_resource_id = "${assetId}"` : `source_disk = "${assetId}"`}
  description = "FinOps automated pre-deletion safety snapshot"
  tags = {
    DecommissionDate = "${new Date().toISOString().substring(0, 10)}"
    ManagedBy        = "CloudCost-IQ-FinOps"
    RetentionPolicy  = "90-days-archive"
  }
}

# Step 2: Remove unattached disk resource definition from terraform state`;

      const cli = provider === 'AWS'
        ? `aws ec2 create-snapshot --volume-id ${assetId} --description "FinOps pre-delete snapshot" && \\\naws ec2 delete-volume --volume-id ${assetId}`
        : provider === 'Azure'
        ? `az snapshot create --resource-group rg-prod --source ${assetId} --name ${snapId} && \\\naz disk delete --ids ${assetId} --yes --no-wait`
        : `gcloud compute disks snapshot ${assetId} --snapshot-names=${snapId} --zone=us-central1-a && \\\ngcloud compute disks delete ${assetId} --zone=us-central1-a --quiet`;

      return { terraform: tf, cli };
    }

    if (actionType === 'Downgrade-Tier') {
      const tf = `# Terraform Storage Tier Migration (gp2 -> gp3)
resource "aws_ebs_volume" "${assetName.replace(/-/g, '_')}" {
  # ... existing config ...
  - type = "gp2"
  + type = "gp3"
  + iops = 3000
  + throughput = 125
}`;
      const cli = `aws ec2 modify-volume --volume-id ${assetId} --volume-type gp3 --iops 3000 --throughput 125`;
      return { terraform: tf, cli };
    }
  }

  // Compute actions
  if (actionType === 'Terminate') {
    const amiName = `ami-finops-safety-${assetId}-${Date.now().toString().substring(6)}`;
    const tf = `# Terraform Decommission Plan for Idle Instance (${assetName})
# Comment out or remove the resource declaration below:
# resource "${provider === 'AWS' ? 'aws_instance' : provider === 'Azure' ? 'azurerm_linux_virtual_machine' : 'google_compute_instance'}" "${assetName.replace(/-/g, '_')}" {
#   count = 0 # FinOps decommissioned
# }`;
    const cli = provider === 'AWS'
      ? `aws ec2 create-image --instance-id ${assetId} --name "${amiName}" --no-reboot && \\\naws ec2 terminate-instances --instance-ids ${assetId}`
      : provider === 'Azure'
      ? `az vm deallocate --ids ${assetId} && \\\naz vm delete --ids ${assetId} --yes`
      : `gcloud compute instances delete ${assetId} --zone=us-central1-a --quiet`;

    return { terraform: tf, cli };
  }

  if (actionType === 'Right-Size') {
    const target = targetSkuOrTier || 't4g.xlarge';
    const tf = `# Terraform Instance Right-Sizing
resource "${provider === 'AWS' ? 'aws_instance' : 'azurerm_linux_virtual_machine'}" "${assetName.replace(/-/g, '_')}" {
  # Updated to right-sized compute SKU
  instance_type = "${target}"
}`;
    const cli = provider === 'AWS'
      ? `aws ec2 stop-instances --instance-ids ${assetId} && \\\naws ec2 modify-instance-attribute --instance-id ${assetId} --instance-type "{\\"Value\\": \\"${target}\\"}" && \\\naws ec2 start-instances --instance-ids ${assetId}`
      : `az vm update --ids ${assetId} --size ${target}`;

    return { terraform: tf, cli };
  }

  if (actionType === 'Schedule-Stop') {
    const tf = `# Scheduled Start/Stop Lambda & EventBridge Rule
resource "aws_cloudwatch_event_rule" "nightly_shutdown" {
  name                = "finops-nightly-shutdown-dev"
  schedule_expression = "cron(0 19 ? * MON-FRI *)"
}`;
    const cli = `aws ec2 stop-instances --instance-ids ${assetId}`;
    return { terraform: tf, cli };
  }

  return { terraform: '# No template', cli: '# No CLI command' };
}
