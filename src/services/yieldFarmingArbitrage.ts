
export interface YieldOpportunity {
  id: string;
  protocol: string;
  chain: string;
  token: string;
  apy: number;
  tvl: number;
  arbitrageBonus: number;
  combinedYield: number;
  risk: 'low' | 'medium' | 'high';
  lockPeriod: number;
  autoCompound: boolean;
}

export class YieldFarmingArbitrage {
  private static yieldPools = {
    'solana': [
      { protocol: 'Raydium', token: 'SOL-USDC', apy: 8.5, tvl: 45000000, risk: 'low', lockPeriod: 0, autoCompound: true },
      { protocol: 'Orca', token: 'ETH-SOL', apy: 12.3, tvl: 12000000, risk: 'medium', lockPeriod: 7, autoCompound: false },
      { protocol: 'Mango', token: 'USDC', apy: 6.8, tvl: 25000000, risk: 'low', lockPeriod: 0, autoCompound: true },
      { protocol: 'Solend', token: 'SOL', apy: 4.2, tvl: 80000000, risk: 'low', lockPeriod: 0, autoCompound: true }
    ],
    'base': [
      { protocol: 'Aave V3', token: 'ETH', apy: 3.8, tvl: 120000000, risk: 'low', lockPeriod: 0, autoCompound: true },
      { protocol: 'Compound', token: 'USDC', apy: 5.2, tvl: 95000000, risk: 'low', lockPeriod: 0, autoCompound: false },
      { protocol: 'Uniswap V3', token: 'ETH-USDC', apy: 15.6, tvl: 8000000, risk: 'high', lockPeriod: 0, autoCompound: false }
    ],
    'fantom': [
      { protocol: 'Geist', token: 'FTM', apy: 9.8, tvl: 15000000, risk: 'medium', lockPeriod: 14, autoCompound: true },
      { protocol: 'SpookySwap', token: 'BOO-FTM', apy: 45.2, tvl: 2000000, risk: 'high', lockPeriod: 30, autoCompound: false },
      { protocol: 'SpiritSwap', token: 'SPIRIT-FTM', apy: 38.7, tvl: 3500000, risk: 'high', lockPeriod: 21, autoCompound: true }
    ]
  };

  static findYieldArbitrageOpportunities(): YieldOpportunity[] {
    const opportunities: YieldOpportunity[] = [];
    let oppId = 0;

    Object.entries(this.yieldPools).forEach(([chain, pools]) => {
      pools.forEach(pool => {
        // Calculate arbitrage bonus based on yield farming + price arbitrage
        const arbitrageBonus = this.calculateArbitrageBonus(chain, pool.token);
        const combinedYield = pool.apy + arbitrageBonus;
        
        // Only include if combined yield is attractive
        if (combinedYield > 8 || arbitrageBonus > 2) {
          opportunities.push({
            id: `yield-arb-${oppId++}`,
            protocol: pool.protocol,
            chain,
            token: pool.token,
            apy: pool.apy,
            tvl: pool.tvl,
            arbitrageBonus,
            combinedYield,
            risk: pool.risk as 'low' | 'medium' | 'high',
            lockPeriod: pool.lockPeriod,
            autoCompound: pool.autoCompound
          });
        }
      });
    });

    return opportunities.sort((a, b) => b.combinedYield - a.combinedYield);
  }

  private static calculateArbitrageBonus(chain: string, token: string): number {
    // Simulate arbitrage opportunities within yield farming
    const baseBonus = Math.random() * 3; // 0-3% base arbitrage bonus
    
    // Chain-specific bonuses
    const chainMultiplier = {
      'solana': 1.3, // Higher DeFi activity
      'base': 1.1,   // Moderate activity
      'fantom': 1.5  // Higher volatility, more opportunities
    };
    
    // Token-specific bonuses
    let tokenMultiplier = 1.0;
    if (token.includes('-')) {
      tokenMultiplier = 1.2; // LP tokens have more arbitrage potential
    }
    if (token.includes('ETH') || token.includes('SOL')) {
      tokenMultiplier += 0.1; // Major tokens have more liquidity
    }
    
    const multiplier = (chainMultiplier[chain as keyof typeof chainMultiplier] || 1.0) * tokenMultiplier;
    
    return baseBonus * multiplier;
  }

  static getOptimalYieldStrategy(maxRisk: 'low' | 'medium' | 'high' = 'medium'): YieldOpportunity[] {
    const opportunities = this.findYieldArbitrageOpportunities();
    
    const riskLevels = { 'low': 1, 'medium': 2, 'high': 3 };
    const maxRiskLevel = riskLevels[maxRisk];
    
    return opportunities
      .filter(opp => riskLevels[opp.risk] <= maxRiskLevel)
      .slice(0, 8) // Top 8 opportunities
      .map(opp => ({
        ...opp,
        // Add recommended allocation
        recommendedAllocation: this.calculateAllocation(opp, opportunities.length)
      })) as any;
  }

  private static calculateAllocation(opportunity: YieldOpportunity, totalOpps: number): number {
    const baseAllocation = 100 / totalOpps;
    const yieldMultiplier = opportunity.combinedYield / 10; // Higher yield = higher allocation
    const riskPenalty = opportunity.risk === 'high' ? 0.7 : opportunity.risk === 'medium' ? 0.85 : 1.0;
    
    return Math.round(baseAllocation * yieldMultiplier * riskPenalty);
  }
}
