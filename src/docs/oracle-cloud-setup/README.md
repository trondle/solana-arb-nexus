# Oracle Cloud Solana Infrastructure Setup Guide

## Phase 2: Solana Infrastructure Implementation

This guide provides detailed steps for implementing Solana infrastructure on Oracle Cloud Free Tier.

### Prerequisites
- Oracle Cloud account with 2 ARM VMs provisioned
- Ubuntu 22.04 LTS installed on both VMs
- Root access to both instances

## VM Configuration Overview
- **VM1 (Validator):** 4 vCPU, 24GB RAM, 100GB storage - Solana Validator + Geyser Plugin
- **VM2 (RPC Node):** 4 vCPU, 24GB RAM, 100GB storage - RPC Node + API Services

---

## Step 11: Install Solana Validator (VM1)

### Connect to VM1
```bash
ssh -i ~/.ssh/oracle_cloud_key ubuntu@<VM1_PUBLIC_IP>
```

### System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl wget git build-essential pkg-config libudev-dev llvm libclang-dev protobuf-compiler

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
rustup component add rustfmt
rustup update

# Increase system limits
echo "* soft nofile 1000000" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 1000000" | sudo tee -a /etc/security/limits.conf

# Configure swap
sudo fallocate -l 32G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Install Solana CLI
```bash
# Download and install Solana
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
solana --version
solana config set --url mainnet-beta
```

### Create Validator Identity
```bash
# Create validator keypair
solana-keygen new --no-bip39-passphrase -o ~/validator-keypair.json

# Create vote account
solana-keygen new --no-bip39-passphrase -o ~/vote-account-keypair.json

# Create withdrawer account
solana-keygen new --no-bip39-passphrase -o ~/withdrawer-keypair.json

# Set permissions
chmod 600 ~/*.json
```

---

## Step 12: Configure RPC Node (VM2)

### Connect to VM2
```bash
ssh -i ~/.ssh/oracle_cloud_key ubuntu@<VM2_PUBLIC_IP>
```

### Install Solana on VM2
```bash
# Repeat system preparation from Step 11
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential pkg-config libudev-dev llvm libclang-dev protobuf-compiler nginx redis-server

# Install Rust and Solana (same as VM1)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Configure RPC Node
```bash
# Create RPC configuration
mkdir -p ~/solana-rpc
cat > ~/solana-rpc/rpc-config.json << 'EOF'
{
  "json_rpc_url": "0.0.0.0:8899",
  "websocket_url": "0.0.0.0:8900",
  "rpc_port": 8899,
  "rpc_bind_address": "0.0.0.0",
  "full_rpc_api": true,
  "limit_ledger_size": 200000000,
  "accounts_db_caching_enabled": true,
  "account_indexes": ["program-id", "spl-token-owner", "spl-token-mint"]
}
EOF
```

---

## Step 13: Sync Solana Ledger

### Start Initial Sync on VM1 (Validator)
```bash
# Create systemd service for validator
sudo tee /etc/systemd/system/solana-validator.service > /dev/null << 'EOF'
[Unit]
Description=Solana Validator
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=ubuntu
LimitNOFILE=1000000
LogRateLimitIntervalSec=0
Environment="PATH=/home/ubuntu/.local/share/solana/install/active_release/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/ubuntu/.local/share/solana/install/active_release/bin/solana-validator \
    --identity /home/ubuntu/validator-keypair.json \
    --vote-account /home/ubuntu/vote-account-keypair.json \
    --ledger /home/ubuntu/ledger \
    --accounts /home/ubuntu/accounts \
    --log /home/ubuntu/solana-validator.log \
    --rpc-port 8899 \
    --rpc-bind-address 0.0.0.0 \
    --full-rpc-api \
    --no-voting \
    --enable-rpc-transaction-history \
    --enable-extended-tx-metadata-storage \
    --limit-ledger-size 200000000

[Install]
WantedBy=multi-user.target
EOF

# Start validator service
sudo systemd daemon-reload
sudo systemctl enable solana-validator
sudo systemctl start solana-validator

# Monitor sync progress
tail -f ~/solana-validator.log
```

### Start RPC Node on VM2
```bash
# Create RPC service
sudo tee /etc/systemd/system/solana-rpc.service > /dev/null << 'EOF'
[Unit]
Description=Solana RPC Node
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=ubuntu
LimitNOFILE=1000000
LogRateLimitIntervalSec=0
Environment="PATH=/home/ubuntu/.local/share/solana/install/active_release/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/ubuntu/.local/share/solana/install/active_release/bin/solana-validator \
    --ledger /home/ubuntu/ledger \
    --accounts /home/ubuntu/accounts \
    --rpc-port 8899 \
    --rpc-bind-address 0.0.0.0 \
    --full-rpc-api \
    --no-voting \
    --no-genesis-fetch \
    --no-snapshot-fetch \
    --enable-rpc-transaction-history \
    --enable-extended-tx-metadata-storage

[Install]
WantedBy=multi-user.target
EOF

sudo systemd daemon-reload
sudo systemctl enable solana-rpc
sudo systemctl start solana-rpc
```

---

Continue to the next file for Steps 14-20...