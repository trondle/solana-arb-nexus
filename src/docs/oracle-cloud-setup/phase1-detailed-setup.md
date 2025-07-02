# Phase 1: Oracle Cloud Infrastructure Setup - Detailed Manual

## Prerequisites
- Valid email address
- Credit card for verification (won't be charged on Free Tier)
- Phone number for SMS verification

---

## Step 1: Create Oracle Cloud Account

### Manual Setup
1. **Visit Oracle Cloud**: Go to https://cloud.oracle.com/
2. **Click "Start for free"** - This gives you $300 in credits + Always Free resources
3. **Fill Account Information**:
   - Email address (use a permanent email)
   - Password (strong password required)
   - Country/Territory
4. **Verify Email**: Check inbox and click verification link
5. **Phone Verification**: Enter phone number for SMS verification
6. **Credit Card Verification**: 
   - Add credit card (for identity verification only)
   - No charges on Free Tier
7. **Complete Setup**: Wait 10-15 minutes for account provisioning

### Verification Script
```bash
#!/bin/bash
# verify-oracle-account.sh
echo "🔍 Verifying Oracle Cloud account setup..."

# Check if you can access OCI Console
echo "1. Open https://cloud.oracle.com/"
echo "2. Click 'Sign In'"
echo "3. Enter your credentials"
echo "4. You should see the Oracle Cloud Console dashboard"
echo ""
echo "✅ If you see the dashboard, account setup is complete!"
```

---

## Step 2: Set Up Home Region

### Choose Optimal Region for Solana
**Best regions for Solana connectivity:**
- **US East (Ashburn)** - Closest to major Solana validators
- **US West (Phoenix)** - Good latency to West Coast validators  
- **Germany Central (Frankfurt)** - Best for European users
- **Japan East (Tokyo)** - Best for Asian users

### Manual Setup
1. **Login to OCI Console**: https://cloud.oracle.com/
2. **Select Region**: Top-right dropdown → Choose your region
3. **Confirm Selection**: This becomes your permanent home region

### Region Selection Script
```bash
#!/bin/bash
# select-region.sh
echo "🌍 Oracle Cloud Region Selection for Solana"
echo ""
echo "Choose your region based on location:"
echo "1. US East (Ashburn) - us-ashburn-1"
echo "2. US West (Phoenix) - us-phoenix-1" 
echo "3. Europe (Frankfurt) - eu-frankfurt-1"
echo "4. Asia (Tokyo) - ap-tokyo-1"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
  1) region="us-ashburn-1" ;;
  2) region="us-phoenix-1" ;;
  3) region="eu-frankfurt-1" ;;
  4) region="ap-tokyo-1" ;;
  *) echo "Invalid choice"; exit 1 ;;
esac

echo "✅ Selected region: $region"
echo "⚠️  Remember: This cannot be changed later!"
echo ""
echo "Next: Login to OCI Console and select this region from the top-right dropdown"
```

---

## Step 3: Create VCN & Subnets

### Architecture Overview
```
┌─────────────────────────────────────────┐
│              VCN (10.0.0.0/16)          │
├─────────────────────────────────────────┤
│  Public Subnet (10.0.1.0/24)           │
│  ├─ VM1 (Validator) - 10.0.1.10        │
│  ├─ VM2 (RPC Node) - 10.0.1.11         │
│  └─ Load Balancer - 10.0.1.100         │
├─────────────────────────────────────────┤
│  Private Subnet (10.0.2.0/24)          │
│  ├─ Database - 10.0.2.10               │
│  └─ Redis Cache - 10.0.2.11            │
└─────────────────────────────────────────┘
```

### OCI CLI Setup Script
```bash
#!/bin/bash
# setup-vcn.sh

echo "🏗️  Setting up VCN and Subnets for Solana Infrastructure"

# Variables
VCN_NAME="solana-mev-vcn"
COMPARTMENT_ID="your-compartment-ocid"  # Replace with your compartment OCID
DISPLAY_NAME="Solana MEV Infrastructure"

# Create VCN
echo "Creating VCN..."
VCN_OCID=$(oci network vcn create \
  --compartment-id $COMPARTMENT_ID \
  --display-name "$VCN_NAME" \
  --cidr-block "10.0.0.0/16" \
  --query 'data.id' \
  --raw-output)

echo "VCN Created: $VCN_OCID"

# Create Internet Gateway
echo "Creating Internet Gateway..."
IGW_OCID=$(oci network internet-gateway create \
  --compartment-id $COMPARTMENT_ID \
  --vcn-id $VCN_OCID \
  --display-name "solana-igw" \
  --is-enabled true \
  --query 'data.id' \
  --raw-output)

# Create Route Table
echo "Creating Route Table..."
RT_OCID=$(oci network route-table create \
  --compartment-id $COMPARTMENT_ID \
  --vcn-id $VCN_OCID \
  --display-name "solana-public-rt" \
  --route-rules '[{"destination": "0.0.0.0/0", "destinationType": "CIDR_BLOCK", "networkEntityId": "'$IGW_OCID'"}]' \
  --query 'data.id' \
  --raw-output)

# Create Security List (detailed in next step)
echo "Creating Security List..."
SL_OCID=$(oci network security-list create \
  --compartment-id $COMPARTMENT_ID \
  --vcn-id $VCN_OCID \
  --display-name "solana-security-list" \
  --query 'data.id' \
  --raw-output)

# Create Public Subnet
echo "Creating Public Subnet..."
PUBLIC_SUBNET_OCID=$(oci network subnet create \
  --compartment-id $COMPARTMENT_ID \
  --vcn-id $VCN_OCID \
  --display-name "solana-public-subnet" \
  --cidr-block "10.0.1.0/24" \
  --route-table-id $RT_OCID \
  --security-list-ids '["'$SL_OCID'"]' \
  --query 'data.id' \
  --raw-output)

# Create Private Subnet
echo "Creating Private Subnet..."
PRIVATE_SUBNET_OCID=$(oci network subnet create \
  --compartment-id $COMPARTMENT_ID \
  --vcn-id $VCN_OCID \
  --display-name "solana-private-subnet" \
  --cidr-block "10.0.2.0/24" \
  --prohibit-public-ip-on-vnic true \
  --query 'data.id' \
  --raw-output)

echo "✅ VCN Setup Complete!"
echo "VCN OCID: $VCN_OCID"
echo "Public Subnet OCID: $PUBLIC_SUBNET_OCID"
echo "Private Subnet OCID: $PRIVATE_SUBNET_OCID"

# Save OCIDs for later use
cat > network-ocids.env << EOF
VCN_OCID=$VCN_OCID
PUBLIC_SUBNET_OCID=$PUBLIC_SUBNET_OCID
PRIVATE_SUBNET_OCID=$PRIVATE_SUBNET_OCID
IGW_OCID=$IGW_OCID
RT_OCID=$RT_OCID
SL_OCID=$SL_OCID
EOF

echo "📝 Network OCIDs saved to network-ocids.env"
```

### Manual Setup Instructions
1. **Navigate to Networking**: OCI Console → Networking → Virtual Cloud Networks
2. **Create VCN**: 
   - Click "Start VCN Wizard"
   - Select "Create VCN with Internet Connectivity"
   - VCN Name: `solana-mev-vcn`
   - CIDR Block: `10.0.0.0/16`
3. **Configure Subnets**:
   - Public Subnet CIDR: `10.0.1.0/24`
   - Private Subnet CIDR: `10.0.2.0/24`
4. **Review and Create**

---

## Step 4: Configure Security Lists

### Required Ports for Solana Infrastructure
- **SSH**: 22 (administration)
- **HTTP**: 80 (web interface)
- **HTTPS**: 443 (secure web interface)
- **Solana RPC**: 8899 (blockchain queries)
- **Solana WebSocket**: 8900 (real-time updates)
- **Geyser Plugin**: 10000-10010 (custom plugin ports)
- **Redis**: 6379 (internal caching)
- **Custom API**: 3001-3005 (our API services)

### Security Configuration Script
```bash
#!/bin/bash
# configure-security.sh

source network-ocids.env  # Load saved OCIDs

echo "🔒 Configuring Security Lists for Solana Infrastructure"

# Create comprehensive security rules
INGRESS_RULES='[
  {
    "source": "0.0.0.0/0",
    "protocol": "6",
    "isStateless": false,
    "tcpOptions": {
      "destinationPortRange": {
        "min": 22,
        "max": 22
      }
    },
    "description": "SSH Access"
  },
  {
    "source": "0.0.0.0/0", 
    "protocol": "6",
    "isStateless": false,
    "tcpOptions": {
      "destinationPortRange": {
        "min": 80,
        "max": 80
      }
    },
    "description": "HTTP"
  },
  {
    "source": "0.0.0.0/0",
    "protocol": "6", 
    "isStateless": false,
    "tcpOptions": {
      "destinationPortRange": {
        "min": 443,
        "max": 443
      }
    },
    "description": "HTTPS"
  },
  {
    "source": "0.0.0.0/0",
    "protocol": "6",
    "isStateless": false, 
    "tcpOptions": {
      "destinationPortRange": {
        "min": 8899,
        "max": 8899
      }
    },
    "description": "Solana RPC"
  },
  {
    "source": "0.0.0.0/0",
    "protocol": "6",
    "isStateless": false,
    "tcpOptions": {
      "destinationPortRange": {
        "min": 8900,
        "max": 8900
      }
    },
    "description": "Solana WebSocket"
  },
  {
    "source": "0.0.0.0/0",
    "protocol": "6",
    "isStateless": false,
    "tcpOptions": {
      "destinationPortRange": {
        "min": 10000,
        "max": 10010
      }
    },
    "description": "Geyser Plugin Ports"
  },
  {
    "source": "10.0.0.0/16",
    "protocol": "6",
    "isStateless": false,
    "tcpOptions": {
      "destinationPortRange": {
        "min": 6379,
        "max": 6379
      }
    },
    "description": "Redis Internal"
  },
  {
    "source": "0.0.0.0/0",
    "protocol": "6",
    "isStateless": false,
    "tcpOptions": {
      "destinationPortRange": {
        "min": 3001,
        "max": 3005
      }
    },
    "description": "Custom API Services"
  }
]'

# Update security list
echo "Updating security list with Solana-specific rules..."
oci network security-list update \
  --security-list-id $SL_OCID \
  --ingress-security-rules "$INGRESS_RULES" \
  --force

echo "✅ Security rules configured for Solana infrastructure"
echo "📋 Opened ports: 22, 80, 443, 8899, 8900, 10000-10010, 3001-3005"
echo "🔐 Redis (6379) restricted to VCN only"
```

---

## Step 5: Deploy ARM Compute Instances

### Instance Specifications
- **Shape**: VM.Standard.A1.Flex (ARM64)
- **CPU**: 4 OCPUs per instance
- **Memory**: 24 GB per instance
- **OS**: Ubuntu 22.04 LTS (ARM64)
- **Boot Volume**: 50 GB
- **Total**: 2 instances (VM1 + VM2)

### VM Deployment Script
```bash
#!/bin/bash
# deploy-vms.sh

source network-ocids.env

echo "🖥️  Deploying ARM Compute Instances for Solana"

# SSH Key setup
echo "Setting up SSH keys..."
if [ ! -f ~/.ssh/oracle_cloud_key ]; then
  ssh-keygen -t rsa -b 4096 -f ~/.ssh/oracle_cloud_key -N ""
  echo "✅ SSH key generated: ~/.ssh/oracle_cloud_key"
fi

SSH_PUBLIC_KEY=$(cat ~/.ssh/oracle_cloud_key.pub)

# VM1 - Solana Validator
echo "Creating VM1 (Solana Validator)..."
VM1_OCID=$(oci compute instance launch \
  --compartment-id $COMPARTMENT_ID \
  --display-name "solana-validator-vm1" \
  --availability-domain "$(oci iam availability-domain list --compartment-id $COMPARTMENT_ID --query 'data[0].name' --raw-output)" \
  --shape "VM.Standard.A1.Flex" \
  --shape-config '{"ocpus": 4, "memoryInGBs": 24}' \
  --image-id "$(oci compute image list --compartment-id $COMPARTMENT_ID --operating-system Ubuntu --operating-system-version '22.04' --shape 'VM.Standard.A1.Flex' --query 'data[0].id' --raw-output)" \
  --subnet-id $PUBLIC_SUBNET_OCID \
  --assign-public-ip true \
  --ssh-authorized-keys-file ~/.ssh/oracle_cloud_key.pub \
  --user-data-file vm1-cloud-init.sh \
  --query 'data.id' \
  --raw-output)

# VM2 - RPC Node  
echo "Creating VM2 (RPC Node)..."
VM2_OCID=$(oci compute instance launch \
  --compartment-id $COMPARTMENT_ID \
  --display-name "solana-rpc-vm2" \
  --availability-domain "$(oci iam availability-domain list --compartment-id $COMPARTMENT_ID --query 'data[0].name' --raw-output)" \
  --shape "VM.Standard.A1.Flex" \
  --shape-config '{"ocpus": 4, "memoryInGBs": 24}' \
  --image-id "$(oci compute image list --compartment-id $COMPARTMENT_ID --operating-system Ubuntu --operating-system-version '22.04' --shape 'VM.Standard.A1.Flex' --query 'data[0].id' --raw-output)" \
  --subnet-id $PUBLIC_SUBNET_OCID \
  --assign-public-ip true \
  --ssh-authorized-keys-file ~/.ssh/oracle_cloud_key.pub \
  --user-data-file vm2-cloud-init.sh \
  --query 'data.id' \
  --raw-output)

echo "✅ VMs deployment initiated"
echo "VM1 (Validator) OCID: $VM1_OCID"  
echo "VM2 (RPC Node) OCID: $VM2_OCID"

# Wait for instances to be running
echo "⏳ Waiting for instances to start..."
oci compute instance action --instance-id $VM1_OCID --action START --wait-for-state RUNNING
oci compute instance action --instance-id $VM2_OCID --action START --wait-for-state RUNNING

# Get public IPs
VM1_PUBLIC_IP=$(oci compute instance list-vnics --instance-id $VM1_OCID --query 'data[0]."public-ip"' --raw-output)
VM2_PUBLIC_IP=$(oci compute instance list-vnics --instance-id $VM2_OCID --query 'data[0]."public-ip"' --raw-output)

echo "🌐 VM1 Public IP: $VM1_PUBLIC_IP"
echo "🌐 VM2 Public IP: $VM2_PUBLIC_IP"

# Save instance info
cat >> network-ocids.env << EOF
VM1_OCID=$VM1_OCID
VM2_OCID=$VM2_OCID
VM1_PUBLIC_IP=$VM1_PUBLIC_IP
VM2_PUBLIC_IP=$VM2_PUBLIC_IP
EOF

echo "📝 VM information saved to network-ocids.env"
```

### VM Cloud-Init Scripts

**VM1 Cloud-Init (vm1-cloud-init.sh):**
```bash
#!/bin/bash
# vm1-cloud-init.sh - Solana Validator preparation

apt-get update -y
apt-get install -y curl wget git build-essential pkg-config libudev-dev llvm libclang-dev protobuf-compiler htop

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source ~/.cargo/env

# Create solana user
useradd -m -s /bin/bash solana
usermod -aG sudo solana

# Prepare directories
mkdir -p /home/solana/{ledger,accounts,logs}
chown -R solana:solana /home/solana

echo "✅ VM1 (Validator) prepared for Solana installation"
```

**VM2 Cloud-Init (vm2-cloud-init.sh):**
```bash
#!/bin/bash
# vm2-cloud-init.sh - RPC Node preparation

apt-get update -y
apt-get install -y curl wget git build-essential pkg-config libudev-dev llvm libclang-dev protobuf-compiler nginx redis-server htop

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source ~/.cargo/env

# Install Node.js for API services
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Create solana user
useradd -m -s /bin/bash solana
usermod -aG sudo solana

# Prepare directories
mkdir -p /home/solana/{ledger,accounts,logs,api}
chown -R solana:solana /home/solana

# Configure Redis
sed -i 's/bind 127.0.0.1/bind 0.0.0.0/' /etc/redis/redis.conf
systemctl enable redis-server
systemctl start redis-server

echo "✅ VM2 (RPC Node) prepared for Solana and API services"
```

---

## Step 6: Set Up Block Storage

### Storage Configuration
- **VM1**: 100GB for Solana ledger and accounts
- **VM2**: 100GB for RPC data and API storage
- **Type**: Block Volume (high performance)
- **Backup**: Automatic daily backups

### Block Storage Script
```bash
#!/bin/bash
# setup-storage.sh

source network-ocids.env

echo "💾 Setting up Block Storage for Solana data"

# Create Block Volume for VM1
echo "Creating storage for VM1 (Validator)..."
VM1_VOLUME_OCID=$(oci bv volume create \
  --compartment-id $COMPARTMENT_ID \
  --display-name "solana-validator-storage" \
  --size-in-gbs 100 \
  --availability-domain "$(oci iam availability-domain list --compartment-id $COMPARTMENT_ID --query 'data[0].name' --raw-output)" \
  --volume-type "ISCSI" \
  --query 'data.id' \
  --raw-output)

# Create Block Volume for VM2  
echo "Creating storage for VM2 (RPC Node)..."
VM2_VOLUME_OCID=$(oci bv volume create \
  --compartment-id $COMPARTMENT_ID \
  --display-name "solana-rpc-storage" \
  --size-in-gbs 100 \
  --availability-domain "$(oci iam availability-domain list --compartment-id $COMPARTMENT_ID --query 'data[0].name' --raw-output)" \
  --volume-type "ISCSI" \
  --query 'data.id' \
  --raw-output)

# Attach volumes to instances
echo "Attaching storage to VM1..."
oci compute volume-attachment attach \
  --instance-id $VM1_OCID \
  --volume-id $VM1_VOLUME_OCID \
  --type "iscsi"

echo "Attaching storage to VM2..."  
oci compute volume-attachment attach \
  --instance-id $VM2_OCID \
  --volume-id $VM2_VOLUME_OCID \
  --type "iscsi"

echo "✅ Block storage created and attached"
echo "VM1 Volume: $VM1_VOLUME_OCID"
echo "VM2 Volume: $VM2_VOLUME_OCID"

# Save storage info
cat >> network-ocids.env << EOF
VM1_VOLUME_OCID=$VM1_VOLUME_OCID
VM2_VOLUME_OCID=$VM2_VOLUME_OCID
EOF
```

### Storage Mount Script (Run on each VM)
```bash
#!/bin/bash
# mount-storage.sh - Run this on each VM after attachment

echo "🔧 Mounting block storage..."

# Find the new disk
NEW_DISK=$(lsblk | grep "100G" | awk '{print $1}' | head -1)
DEVICE="/dev/$NEW_DISK"

echo "Found storage device: $DEVICE"

# Format the disk
sudo mkfs.ext4 $DEVICE

# Create mount point
sudo mkdir -p /mnt/solana-data

# Mount the disk
sudo mount $DEVICE /mnt/solana-data

# Set permissions
sudo chown -R solana:solana /mnt/solana-data

# Add to fstab for persistent mounting
echo "$DEVICE /mnt/solana-data ext4 defaults 0 0" | sudo tee -a /etc/fstab

# Create directory structure
sudo -u solana mkdir -p /mnt/solana-data/{ledger,accounts,logs}

echo "✅ Storage mounted at /mnt/solana-data"
```

---

## Step 7: Configure Load Balancer

### Load Balancer Configuration
- **Type**: Network Load Balancer (Layer 4)
- **Backends**: VM1:8899, VM2:8899 (RPC endpoints)
- **Health Checks**: HTTP health checks on /health endpoint
- **Distribution**: Round-robin

### Load Balancer Script
```bash
#!/bin/bash
# setup-load-balancer.sh

source network-ocids.env

echo "⚖️  Setting up Network Load Balancer for RPC"

# Create Network Load Balancer
LB_OCID=$(oci nlb network-load-balancer create \
  --compartment-id $COMPARTMENT_ID \
  --display-name "solana-rpc-nlb" \
  --subnet-id $PUBLIC_SUBNET_OCID \
  --is-public true \
  --query 'data.id' \
  --raw-output)

echo "Load Balancer created: $LB_OCID"

# Wait for LB to be active
echo "⏳ Waiting for Load Balancer to become active..."
oci nlb network-load-balancer get --network-load-balancer-id $LB_OCID --wait-for-state ACTIVE

# Create Backend Set
oci nlb backend-set create \
  --network-load-balancer-id $LB_OCID \
  --name "solana-rpc-backend-set" \
  --policy "ROUND_ROBIN" \
  --health-checker '{"protocol": "HTTP", "port": 8899, "url-path": "/health", "interval-in-millis": 30000, "timeout-in-millis": 5000, "retries": 3}' \
  --is-preserve-source true

# Add VM1 as backend
VM1_PRIVATE_IP=$(oci compute instance list-vnics --instance-id $VM1_OCID --query 'data[0]."private-ip"' --raw-output)
oci nlb backend create \
  --network-load-balancer-id $LB_OCID \
  --backend-set-name "solana-rpc-backend-set" \
  --name "vm1-backend" \
  --ip-address $VM1_PRIVATE_IP \
  --port 8899 \
  --weight 50

# Add VM2 as backend  
VM2_PRIVATE_IP=$(oci compute instance list-vnics --instance-id $VM2_OCID --query 'data[0]."private-ip"' --raw-output)
oci nlb backend create \
  --network-load-balancer-id $LB_OCID \
  --backend-set-name "solana-rpc-backend-set" \
  --name "vm2-backend" \
  --ip-address $VM2_PRIVATE_IP \
  --port 8899 \
  --weight 50

# Create Listener
oci nlb listener create \
  --network-load-balancer-id $LB_OCID \
  --name "solana-rpc-listener" \
  --default-backend-set-name "solana-rpc-backend-set" \
  --port 8899 \
  --protocol "TCP"

# Get Load Balancer IP
LB_PUBLIC_IP=$(oci nlb network-load-balancer get --network-load-balancer-id $LB_OCID --query 'data."ip-addresses"[0]."ip-address"' --raw-output)

echo "✅ Load Balancer configured"
echo "🌐 Load Balancer IP: $LB_PUBLIC_IP"
echo "🔗 RPC Endpoint: http://$LB_PUBLIC_IP:8899"

# Save LB info
cat >> network-ocids.env << EOF
LB_OCID=$LB_OCID
LB_PUBLIC_IP=$LB_PUBLIC_IP
VM1_PRIVATE_IP=$VM1_PRIVATE_IP
VM2_PRIVATE_IP=$VM2_PRIVATE_IP
EOF
```

---

## Step 8: Set Up Autonomous Database

### Database Configuration
- **Type**: Autonomous JSON Database (Always Free)
- **Purpose**: Store price data, analytics, user configs
- **CPU**: 1 OCPU (Always Free limit)
- **Storage**: 20 GB (Always Free limit)

### Database Setup Script
```bash
#!/bin/bash
# setup-database.sh

source network-ocids.env

echo "🗃️  Setting up Autonomous JSON Database"

# Create Autonomous Database
DB_OCID=$(oci db autonomous-database create \
  --compartment-id $COMPARTMENT_ID \
  --display-name "solana-mev-db" \
  --db-name "solanamev" \
  --admin-password "SolanaDB123!" \
  --cpu-core-count 1 \
  --data-storage-size-in-tbs 1 \
  --is-free-tier true \
  --auto-scaling-enabled false \
  --query 'data.id' \
  --raw-output)

echo "Database created: $DB_OCID"

# Wait for database to be available
echo "⏳ Waiting for database to become available..."
oci db autonomous-database get --autonomous-database-id $DB_OCID --wait-for-state AVAILABLE

# Get connection details
DB_CONNECTION_URL=$(oci db autonomous-database get --autonomous-database-id $DB_OCID --query 'data."connection-urls"."sql-dev-web-url"' --raw-output)

echo "✅ Autonomous Database ready"
echo "🔗 Database Console: $DB_CONNECTION_URL"
echo "📝 Username: ADMIN"
echo "🔐 Password: SolanaDB123!"

# Save DB info
cat >> network-ocids.env << EOF
DB_OCID=$DB_OCID
DB_CONNECTION_URL=$DB_CONNECTION_URL
EOF
```

### Database Schema Script
```sql
-- database-schema.sql
-- Run this in the SQL Developer Web interface

-- Price data table
CREATE TABLE price_data (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    symbol VARCHAR2(20) NOT NULL,
    price NUMBER(18,8) NOT NULL,
    volume_24h NUMBER(18,2),
    market_cap NUMBER(18,2),
    price_change_24h NUMBER(8,4),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR2(50),
    INDEX idx_symbol_timestamp (symbol, timestamp)
);

-- MEV opportunities table  
CREATE TABLE mev_opportunities (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    signature VARCHAR2(128) NOT NULL,
    slot NUMBER(20) NOT NULL,
    opportunity_type VARCHAR2(50),
    potential_profit NUMBER(18,8),
    confidence_score NUMBER(3,2),
    programs JSON,
    accounts JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed CHAR(1) DEFAULT 'N',
    INDEX idx_slot_type (slot, opportunity_type),
    INDEX idx_timestamp (timestamp)
);

-- User configurations
CREATE TABLE user_configs (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    user_id VARCHAR2(128) NOT NULL,
    config_name VARCHAR2(100),
    api_settings JSON,
    trading_params JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active CHAR(1) DEFAULT 'Y',
    UNIQUE(user_id, config_name)
);

-- Analytics data
CREATE TABLE analytics_data (
    id VARCHAR2(36) DEFAULT SYS_GUID() PRIMARY KEY,
    metric_name VARCHAR2(100) NOT NULL,
    metric_value NUMBER(18,8),
    metadata JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_timestamp (metric_name, timestamp)
);

COMMIT;
```

---

## Step 9: Create OCI CLI Access

### API Key Generation Script
```bash
#!/bin/bash
# setup-cli-access.sh

echo "🔑 Setting up OCI CLI Access"

# Create OCI directory
mkdir -p ~/.oci

# Generate API key pair
openssl genrsa -out ~/.oci/oci_api_key.pem 2048
openssl rsa -pubout -in ~/.oci/oci_api_key.pem -out ~/.oci/oci_api_key_public.pem

# Set proper permissions
chmod 600 ~/.oci/oci_api_key.pem
chmod 644 ~/.oci/oci_api_key_public.pem

echo "✅ API key pair generated:"
echo "Private key: ~/.oci/oci_api_key.pem"
echo "Public key: ~/.oci/oci_api_key_public.pem"

echo ""
echo "📋 Next steps:"
echo "1. Copy the public key content:"
cat ~/.oci/oci_api_key_public.pem
echo ""
echo "2. Add this key to your OCI user profile:"
echo "   - Login to OCI Console"
echo "   - Go to Profile → User Settings → API Keys"
echo "   - Click 'Add API Key'"
echo "   - Paste the public key content"
echo "   - Save the configuration details"

echo ""
echo "3. Create ~/.oci/config file with the configuration from OCI Console"
echo ""
echo "Example config file:"
cat << 'EOF'
[DEFAULT]
user=ocid1.user.oc1..aaaaaaaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
fingerprint=xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx
tenancy=ocid1.tenancy.oc1..aaaaaaaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
region=us-ashburn-1
key_file=~/.oci/oci_api_key.pem
EOF
```

### CLI Installation Script
```bash
#!/bin/bash
# install-oci-cli.sh

echo "📥 Installing OCI CLI"

# For Linux/MacOS
curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh | bash

# Add to PATH
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
oci --version

echo "✅ OCI CLI installed successfully"
echo ""
echo "Next: Run setup-cli-access.sh to configure API access"
```

---

## Step 10: Set Up Monitoring

### Monitoring Configuration Script
```bash
#!/bin/bash
# setup-monitoring.sh

source network-ocids.env

echo "📊 Setting up OCI Monitoring and Alarms"

# Create notification topic
TOPIC_OCID=$(oci ons topic create \
  --compartment-id $COMPARTMENT_ID \
  --name "solana-infrastructure-alerts" \
  --description "Alerts for Solana MEV infrastructure" \
  --query 'data."topic-id"' \
  --raw-output)

echo "Notification topic created: $TOPIC_OCID"

# Add email subscription (replace with your email)
read -p "Enter your email for alerts: " ALERT_EMAIL
oci ons subscription create \
  --topic-id $TOPIC_OCID \
  --compartment-id $COMPARTMENT_ID \
  --protocol "EMAIL" \
  --endpoint "$ALERT_EMAIL"

echo "Email subscription added for: $ALERT_EMAIL"

# Create CPU utilization alarm for VM1
oci monitoring alarm create \
  --compartment-id $COMPARTMENT_ID \
  --display-name "VM1-High-CPU" \
  --metric-compartment-id $COMPARTMENT_ID \
  --namespace "oci_computeagent" \
  --query "CpuUtilization[1m].mean() > 80" \
  --resolution "1m" \
  --pending-duration "PT5M" \
  --severity "WARNING" \
  --destinations "[$TOPIC_OCID]" \
  --is-enabled true

# Create memory alarm for VM1  
oci monitoring alarm create \
  --compartment-id $COMPARTMENT_ID \
  --display-name "VM1-High-Memory" \
  --metric-compartment-id $COMPARTMENT_ID \
  --namespace "oci_computeagent" \
  --query "MemoryUtilization[1m].mean() > 85" \
  --resolution "1m" \
  --pending-duration "PT5M" \
  --severity "WARNING" \
  --destinations "[$TOPIC_OCID]"

# Create similar alarms for VM2
oci monitoring alarm create \
  --compartment-id $COMPARTMENT_ID \
  --display-name "VM2-High-CPU" \
  --metric-compartment-id $COMPARTMENT_ID \
  --namespace "oci_computeagent" \
  --query "CpuUtilization[1m].mean() > 80" \
  --resolution "1m" \
  --pending-duration "PT5M" \
  --severity "WARNING" \
  --destinations "[$TOPIC_OCID]"

# Create disk space alarm
oci monitoring alarm create \
  --compartment-id $COMPARTMENT_ID \
  --display-name "Storage-High-Usage" \
  --metric-compartment-id $COMPARTMENT_ID \
  --namespace "oci_computeagent" \
  --query "DiskUtilization[1m].mean() > 85" \
  --resolution "1m" \
  --pending-duration "PT10M" \
  --severity "CRITICAL" \
  --destinations "[$TOPIC_OCID]"

echo "✅ Monitoring and alerts configured"
echo "📧 Check your email to confirm the subscription"

# Save monitoring info
cat >> network-ocids.env << EOF
TOPIC_OCID=$TOPIC_OCID
ALERT_EMAIL=$ALERT_EMAIL
EOF
```

### Custom Monitoring Dashboard Script
```bash
#!/bin/bash
# create-dashboard.sh

echo "📈 Creating custom monitoring dashboard"

# This creates a simple monitoring script for Solana-specific metrics
cat > solana-monitor.sh << 'EOF'
#!/bin/bash
# solana-monitor.sh - Custom Solana monitoring

source network-ocids.env

echo "🔍 Solana Infrastructure Status Report"
echo "Generated: $(date)"
echo "================================="

# Check VM status
echo "VM Status:"
VM1_STATE=$(oci compute instance get --instance-id $VM1_OCID --query 'data."lifecycle-state"' --raw-output)
VM2_STATE=$(oci compute instance get --instance-id $VM2_OCID --query 'data."lifecycle-state"' --raw-output)
echo "  VM1 (Validator): $VM1_STATE"
echo "  VM2 (RPC Node): $VM2_STATE"

# Check RPC endpoints
echo ""
echo "RPC Health:"
curl -s -X POST http://$VM1_PUBLIC_IP:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  | jq -r '.result // "ERROR"' \
  | sed 's/^/  VM1: /'

curl -s -X POST http://$VM2_PUBLIC_IP:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  | jq -r '.result // "ERROR"' \
  | sed 's/^/  VM2: /'

# Check load balancer
echo ""
echo "Load Balancer:"
curl -s -X POST http://$LB_PUBLIC_IP:8899 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  | jq -r '.result // "ERROR"' \
  | sed 's/^/  LB: /'

echo ""
echo "✅ Infrastructure status check complete"
EOF

chmod +x solana-monitor.sh

echo "✅ Custom monitoring script created: solana-monitor.sh"
echo "Run './solana-monitor.sh' to check infrastructure status"
```

---

## Phase 1 Completion Verification

### Complete Setup Verification Script
```bash
#!/bin/bash
# verify-phase1.sh

echo "🔍 Phase 1 Setup Verification"
echo "=============================="

source network-ocids.env

# Check all components
echo "✅ Checking VCN: $(oci network vcn get --vcn-id $VCN_OCID --query 'data."lifecycle-state"' --raw-output)"
echo "✅ Checking VM1: $(oci compute instance get --instance-id $VM1_OCID --query 'data."lifecycle-state"' --raw-output)"
echo "✅ Checking VM2: $(oci compute instance get --instance-id $VM2_OCID --query 'data."lifecycle-state"' --raw-output)"
echo "✅ Checking Database: $(oci db autonomous-database get --autonomous-database-id $DB_OCID --query 'data."lifecycle-state"' --raw-output)"
echo "✅ Checking Load Balancer: $(oci nlb network-load-balancer get --network-load-balancer-id $LB_OCID --query 'data."lifecycle-state"' --raw-output)"

echo ""
echo "🌐 Access Points:"
echo "  VM1 SSH: ssh -i ~/.ssh/oracle_cloud_key ubuntu@$VM1_PUBLIC_IP"
echo "  VM2 SSH: ssh -i ~/.ssh/oracle_cloud_key ubuntu@$VM2_PUBLIC_IP"
echo "  RPC Load Balancer: http://$LB_PUBLIC_IP:8899"
echo "  Database Console: $DB_CONNECTION_URL"

echo ""
echo "📝 Configuration saved in: network-ocids.env"
echo ""
echo "🎉 Phase 1 Complete! Ready for Phase 2: Solana Installation"
```

### Summary of Phase 1 Resources Created

**Free Tier Resources Used:**
- ✅ 2x ARM Compute Instances (VM.Standard.A1.Flex)
- ✅ 200GB Block Storage (100GB each)
- ✅ 1x VCN with public/private subnets
- ✅ 1x Internet Gateway + Route Table
- ✅ 1x Network Load Balancer
- ✅ 1x Autonomous JSON Database (Always Free)
- ✅ Security Lists + Monitoring Alarms

**Estimated Monthly Cost:** $0 (within Free Tier limits)

**Next Steps:** Ready for Phase 2 - Solana Infrastructure Installation
