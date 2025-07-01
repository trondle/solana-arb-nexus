# Geyser Plugin Development Guide

## Step 14: Build Custom Geyser Plugin (Rust)

### Project Structure Setup (VM1)
```bash
# Create plugin project
cd ~/
cargo new --lib solana-mev-geyser-plugin
cd solana-mev-geyser-plugin

# Add dependencies to Cargo.toml
cat > Cargo.toml << 'EOF'
[package]
name = "solana-mev-geyser-plugin"
version = "1.0.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
solana-geyser-plugin-interface = "1.17"
solana-program = "1.17"
solana-sdk = "1.17"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.0", features = ["full"] }
redis = "0.23"
uuid = { version = "1.0", features = ["v4"] }
log = "0.4"
env_logger = "0.10"
reqwest = { version = "0.11", features = ["json"] }
chrono = { version = "0.4", features = ["serde"] }
anyhow = "1.0"
thiserror = "1.0"
EOF
```

### Implement Geyser Plugin
```rust
# Create src/lib.rs
cat > src/lib.rs << 'EOF'
use {
    anyhow::Result,
    log::*,
    serde::{Deserialize, Serialize},
    solana_geyser_plugin_interface::geyser_plugin_interface::{
        GeyserPlugin, GeyserPluginError, ReplicaAccountInfo, ReplicaAccountInfoVersions,
        ReplicaBlockInfo, ReplicaBlockInfoVersions, ReplicaTransactionInfo,
        ReplicaTransactionInfoVersions, Result as PluginResult, SlotStatus,
    },
    solana_program::pubkey::Pubkey,
    solana_sdk::{signature::Signature, transaction::Transaction},
    std::{
        collections::HashMap,
        fs::File,
        io::Read,
        sync::{Arc, Mutex},
    },
    tokio::runtime::Runtime,
};

#[derive(Debug, Deserialize)]
pub struct PluginConfig {
    pub redis_url: String,
    pub api_endpoint: String,
    pub mev_programs: Vec<String>,
    pub arbitrage_threshold: f64,
    pub max_transactions_per_second: u64,
}

#[derive(Debug, Clone, Serialize)]
pub struct MevOpportunity {
    pub signature: String,
    pub slot: u64,
    pub programs: Vec<String>,
    pub accounts: Vec<String>,
    pub potential_profit: f64,
    pub opportunity_type: String,
    pub timestamp: i64,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize)]
pub struct ArbitrageTransaction {
    pub signature: String,
    pub slot: u64,
    pub token_mint: String,
    pub price_before: f64,
    pub price_after: f64,
    pub volume: f64,
    pub profit_estimate: f64,
    pub dex_programs: Vec<String>,
}

pub struct MevGeyserPlugin {
    runtime: Arc<Mutex<Runtime>>,
    config: PluginConfig,
    redis_client: Arc<Mutex<Option<redis::Client>>>,
    mev_programs: HashMap<Pubkey, String>,
    transaction_count: Arc<Mutex<u64>>,
}

impl MevGeyserPlugin {
    fn new() -> Self {
        let runtime = Arc::new(Mutex::new(
            Runtime::new().expect("Failed to create Tokio runtime"),
        ));

        Self {
            runtime,
            config: PluginConfig {
                redis_url: "redis://127.0.0.1:6379".to_string(),
                api_endpoint: "http://localhost:3001/api/mev".to_string(),
                mev_programs: vec![],
                arbitrage_threshold: 0.01,
                max_transactions_per_second: 1000,
            },
            redis_client: Arc::new(Mutex::new(None)),
            mev_programs: HashMap::new(),
            transaction_count: Arc::new(Mutex::new(0)),
        }
    }

    fn detect_arbitrage_opportunity(&self, transaction: &Transaction, slot: u64) -> Option<MevOpportunity> {
        // Analyze transaction for MEV opportunities
        let signature = transaction.signatures[0].to_string();
        
        // Check if transaction involves known DEX programs
        let programs: Vec<String> = transaction
            .message
            .account_keys
            .iter()
            .filter_map(|key| self.mev_programs.get(key))
            .cloned()
            .collect();

        if programs.len() >= 2 {
            // Potential arbitrage between DEXs
            Some(MevOpportunity {
                signature: signature.clone(),
                slot,
                programs,
                accounts: transaction.message.account_keys.iter().map(|k| k.to_string()).collect(),
                potential_profit: self.calculate_profit_estimate(&transaction),
                opportunity_type: "arbitrage".to_string(),
                timestamp: chrono::Utc::now().timestamp(),
                confidence: self.calculate_confidence_score(&transaction),
            })
        } else {
            None
        }
    }

    fn calculate_profit_estimate(&self, _transaction: &Transaction) -> f64 {
        // Simplified profit calculation
        // In production, this would analyze:
        // - Token amounts
        // - Price differences between DEXs
        // - Gas costs
        // - Slippage
        (rand::random::<f64>() * 100.0).max(0.1)
    }

    fn calculate_confidence_score(&self, transaction: &Transaction) -> f64 {
        // Score based on:
        // - Number of instructions
        // - Program interactions
        // - Account patterns
        let instruction_count = transaction.message.instructions.len() as f64;
        (instruction_count / 10.0).min(1.0).max(0.1)
    }

    async fn send_to_redis(&self, opportunity: &MevOpportunity) -> Result<()> {
        if let Ok(redis_guard) = self.redis_client.lock() {
            if let Some(ref client) = *redis_guard {
                let mut conn = client.get_connection()?;
                let json_data = serde_json::to_string(opportunity)?;
                
                redis::cmd("LPUSH")
                    .arg("mev_opportunities")
                    .arg(&json_data)
                    .execute(&mut conn);
                
                // Keep only last 1000 opportunities
                redis::cmd("LTRIM")
                    .arg("mev_opportunities")
                    .arg(0)
                    .arg(999)
                    .execute(&mut conn);
            }
        }
        Ok(())
    }

    async fn send_to_api(&self, opportunity: &MevOpportunity) -> Result<()> {
        let client = reqwest::Client::new();
        let _response = client
            .post(&format!("{}/opportunities", self.config.api_endpoint))
            .json(opportunity)
            .send()
            .await?;
        Ok(())
    }
}

impl GeyserPlugin for MevGeyserPlugin {
    fn name(&self) -> &'static str {
        "MevGeyserPlugin"
    }

    fn on_load(&mut self, config_file: &str) -> PluginResult<()> {
        info!("Loading MEV Geyser Plugin from config: {}", config_file);
        
        // Load configuration
        let mut file = File::open(config_file)
            .map_err(|e| GeyserPluginError::ConfigFileReadError { msg: e.to_string() })?;
        
        let mut contents = String::new();
        file.read_to_string(&mut contents)
            .map_err(|e| GeyserPluginError::ConfigFileReadError { msg: e.to_string() })?;
        
        self.config = serde_json::from_str(&contents)
            .map_err(|e| GeyserPluginError::ConfigFileReadError { msg: e.to_string() })?;

        // Initialize Redis connection
        let redis_client = redis::Client::open(self.config.redis_url.clone())
            .map_err(|e| GeyserPluginError::Custom(Box::new(e)))?;
        
        *self.redis_client.lock().unwrap() = Some(redis_client);

        // Load MEV program addresses
        let known_programs = vec![
            ("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", "Raydium"),
            ("whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", "Whirlpool"),
            ("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", "Jupiter"),
            ("So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo", "Solend"),
        ];

        for (address, name) in known_programs {
            if let Ok(pubkey) = address.parse::<Pubkey>() {
                self.mev_programs.insert(pubkey, name.to_string());
            }
        }

        info!("MEV Geyser Plugin loaded successfully");
        Ok(())
    }

    fn on_unload(&mut self) {
        info!("Unloading MEV Geyser Plugin");
    }

    fn update_account(
        &mut self,
        account: ReplicaAccountInfoVersions,
        slot: u64,
        is_startup: bool,
    ) -> PluginResult<()> {
        // Monitor account changes for MEV opportunities
        if !is_startup {
            if let ReplicaAccountInfoVersions::V0_0_1(account_info) = account {
                // Log significant account changes
                debug!("Account {} updated at slot {}", account_info.pubkey, slot);
            }
        }
        Ok(())
    }

    fn notify_transaction(
        &mut self,
        transaction: ReplicaTransactionInfoVersions,
        slot: u64,
    ) -> PluginResult<()> {
        if let ReplicaTransactionInfoVersions::V0_0_1(tx_info) = transaction {
            // Rate limiting
            {
                let mut count = self.transaction_count.lock().unwrap();
                *count += 1;
                if *count > self.config.max_transactions_per_second {
                    return Ok(());
                }
            }

            // Parse and analyze transaction
            if let Ok(transaction) = bincode::deserialize::<Transaction>(tx_info.transaction_data) {
                if let Some(opportunity) = self.detect_arbitrage_opportunity(&transaction, slot) {
                    // Send to Redis and API asynchronously
                    let runtime = self.runtime.clone();
                    let redis_client = self.redis_client.clone();
                    let api_endpoint = self.config.api_endpoint.clone();
                    
                    runtime.lock().unwrap().spawn(async move {
                        // This would be implemented with proper async handling
                        info!("MEV Opportunity detected: {:?}", opportunity);
                    });
                }
            }
        }
        Ok(())
    }

    fn notify_block_metadata(&mut self, _blockinfo: ReplicaBlockInfoVersions) -> PluginResult<()> {
        // Reset transaction counter for rate limiting
        *self.transaction_count.lock().unwrap() = 0;
        Ok(())
    }

    fn account_data_notifications_enabled(&self) -> bool {
        true
    }

    fn transaction_notifications_enabled(&self) -> bool {
        true
    }
}

#[no_mangle]
#[allow(improper_ctypes_definitions)]
pub unsafe extern "C" fn _create_plugin() -> *mut dyn GeyserPlugin {
    let plugin = MevGeyserPlugin::new();
    let plugin: Box<dyn GeyserPlugin> = Box::new(plugin);
    Box::into_raw(plugin)
}
EOF
```

### Build and Configure Plugin
```bash
# Build the plugin
cargo build --release

# Create plugin configuration
mkdir -p ~/geyser-config
cat > ~/geyser-config/mev-plugin.json << 'EOF'
{
  "redis_url": "redis://127.0.0.1:6379",
  "api_endpoint": "http://localhost:3001/api/mev",
  "mev_programs": [
    "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
    "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"
  ],
  "arbitrage_threshold": 0.01,
  "max_transactions_per_second": 1000
}
EOF

# Update validator service to use geyser plugin
sudo systemctl stop solana-validator

# Add plugin configuration to validator startup
sudo tee -a /etc/systemd/system/solana-validator.service > /dev/null << 'EOF'
    --geyser-plugin-config /home/ubuntu/geyser-config/mev-plugin.json \
EOF

sudo systemctl daemon-reload
sudo systemctl start solana-validator
```

Continue to data pipeline implementation...
