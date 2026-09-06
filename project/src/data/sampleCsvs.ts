export const SAMPLE_AWS_CUR_CSV = `identity/LineItemId,identity/TimeInterval,lineItem/ProductCode,lineItem/ResourceId,lineItem/UnblendedCost,lineItem/UsageAccountId,lineItem/AvailabilityZone,resourceTags/user:Environment,resourceTags/user:Department,resourceTags/user:Owner,pricing/publicOnDemandCost
item-aws-001,2026-08-01T00:00:00Z/2026-08-31T23:59:59Z,AmazonEC2,i-0a8b9c7d1e2f3a401,348.60,112233445566,us-east-1a,Production,Engineering,alex.k,348.60
item-aws-002,2026-08-01T00:00:00Z/2026-08-31T23:59:59Z,AmazonEC2,i-0f9e8d7c6b5a402,186.20,112233445566,us-east-1b,Development,Data Science,priya.m,186.20
item-aws-003,2026-08-01T00:00:00Z/2026-08-31T23:59:59Z,AmazonEC2,i-0123456789abcdef3,512.40,112233445566,us-west-2a,Staging,Engineering,devops-team,512.40
item-aws-004,2026-08-01T00:00:00Z/2026-08-31T23:59:59Z,AmazonEC2,i-0987654321fedcba4,98.50,112233445566,us-east-1c,DisasterRecovery,Security & IT,infra-lead,98.50
item-aws-005,2026-08-01T00:00:00Z/2026-08-31T23:59:59Z,AmazonEBS,vol-01a2b3c4d5e6f701,128.00,112233445566,us-east-1a,Staging,Engineering,alex.k,128.00
item-aws-006,2026-08-01T00:00:00Z/2026-08-31T23:59:59Z,AmazonEBS,vol-09z8y7x6w5v4u302,96.00,112233445566,us-west-2b,Development,Data Science,priya.m,96.00
item-aws-007,2026-08-01T00:00:00Z/2026-08-31T23:59:59Z,AmazonRDS,db-analytics-dw01,745.00,112233445566,us-east-1a,Production,Data Science,sanjay.r,745.00
item-aws-008,2026-08-01T00:00:00Z/2026-08-31T23:59:59Z,AmazonS3,arn:aws:s3:::corp-analytics-archive-2026,380.00,112233445566,us-east-1,Production,Engineering,cloud-admin,380.00`;

export const SAMPLE_AZURE_COST_CSV = `SubscriptionId,SubscriptionName,ResourceGroup,ResourceId,ConsumedService,MeterCategory,ResourceLocation,CostInBillingCurrency,BillingCurrency,Tag_Environment,Tag_Department,Tag_Owner
sub-azure-corp-01,Azure-Enterprise-Prod,rg-microservices-eastus,/subscriptions/sub-azure-corp-01/resourceGroups/rg-microservices-eastus/providers/Microsoft.Compute/virtualMachines/vm-payment-api-01,Microsoft.Compute,Virtual Machines,eastus,420.50,USD,Production,Engineering,sarah.t
sub-azure-corp-01,Azure-Enterprise-Prod,rg-ml-training,/subscriptions/sub-azure-corp-01/resourceGroups/rg-ml-training/providers/Microsoft.Compute/virtualMachines/vm-gpu-trainer-02,Microsoft.Compute,Virtual Machines,eastus2,890.00,USD,Development,Data Science,chen.w
sub-azure-corp-01,Azure-Enterprise-Prod,rg-legacy-apps,/subscriptions/sub-azure-corp-01/resourceGroups/rg-legacy-apps/providers/Microsoft.Compute/disks/disk-orphaned-sql-log,Microsoft.Compute,Disks,centralus,145.00,USD,Staging,Engineering,legacy-team
sub-azure-corp-01,Azure-Enterprise-Prod,rg-db-prod,/subscriptions/sub-azure-corp-01/resourceGroups/rg-db-prod/providers/Microsoft.Sql/servers/sql-core-prod,Microsoft.Sql,SQL Database,eastus,680.00,USD,Production,Engineering,db-admin
sub-azure-corp-01,Azure-Enterprise-Prod,rg-k8s-cluster,/subscriptions/sub-azure-corp-01/resourceGroups/rg-k8s-cluster/providers/Microsoft.ContainerService/managedClusters/aks-cluster-prod,Microsoft.ContainerService,Azure Kubernetes Service,eastus,1150.00,USD,Production,Engineering,devops-lead`;

export const SAMPLE_GCP_BILLING_CSV = `billing_account_id,service.description,sku.description,usage_start_time,usage_end_time,project.id,project.name,location.region,cost,currency,labels.environment,labels.department,labels.owner,resource.name
01A2B3-4C5D6E-7F8A9B,Compute Engine,N2 Instance Core running in Americas,2026-08-01 00:00:00,2026-08-31 23:59:59,gcp-prod-analytics,Analytics Platform,us-central1,390.80,USD,Production,Data Science,vikram.s,inst-spark-worker-01
01A2B3-4C5D6E-7F8A9B,Compute Engine,E2 Instance Core running in Americas,2026-08-01 00:00:00,2026-08-31 23:59:59,gcp-dev-sandbox,Developer Sandbox,us-east4,142.30,USD,Development,Engineering,test-user,inst-sandbox-dev-vm
01A2B3-4C5D6E-7F8A9B,Compute Engine,SSD formatted PD Capacity,2026-08-01 00:00:00,2026-08-31 23:59:59,gcp-staging-qa,Staging Cluster,us-central1,110.00,USD,Staging,Engineering,qa-lead,disk-qa-unattached-pd1
01A2B3-4C5D6E-7F8A9B,BigQuery,Analysis,2026-08-01 00:00:00,2026-08-31 23:59:59,gcp-prod-analytics,Analytics Platform,us-central1,850.00,USD,Production,Data Science,vikram.s,dataset-customer-events
01A2B3-4C5D6E-7F8A9B,Cloud Storage,Standard Storage US,2026-08-01 00:00:00,2026-08-31 23:59:59,gcp-prod-backups,Disaster Recovery,us-central1,230.00,USD,DisasterRecovery,Security & IT,backup-bot,bucket-daily-snapshots`;

export const SAMPLE_FOCUS_CSV = `ChargePeriodStart,ChargePeriodEnd,ProviderName,AccountId,AccountName,RegionId,ServiceCategory,ServiceName,ResourceId,ResourceName,BilledCost,EffectiveCost,PricingUnit,UsageQuantity,Tag_Environment,Tag_Department,Tag_Owner
2026-08-01T00:00:00Z,2026-08-31T23:59:59Z,AWS,112233445566,AWS-Enterprise-Prod,us-east-1,Compute,AmazonEC2,i-0a8b9c7d1e2f3a401,prod-api-gateway-01,348.60,348.60,Hours,744,Production,Engineering,alex.k
2026-08-01T00:00:00Z,2026-08-31T23:59:59Z,AWS,112233445566,AWS-Enterprise-Prod,us-east-1,Compute,AmazonEC2,i-0f9e8d7c6b5a402,dev-ml-feature-builder,186.20,186.20,Hours,744,Development,Data Science,priya.m
2026-08-01T00:00:00Z,2026-08-31T23:59:59Z,Azure,sub-azure-corp-01,Azure-Enterprise-Prod,eastus,Compute,Virtual Machines,vm-payment-api-01,vm-payment-api-01,420.50,420.50,Hours,744,Production,Engineering,sarah.t
2026-08-01T00:00:00Z,2026-08-31T23:59:59Z,GCP,gcp-prod-analytics,Analytics Platform,us-central1,Compute,Compute Engine,inst-spark-worker-01,inst-spark-worker-01,390.80,390.80,Hours,744,Production,Data Science,vikram.s`;
