
import { useState, useEffect, useMemo } from 'react';
import { SUPPORTED_CHAINS, ChainConfig } from '../config/chainConfigurations';
import { scanCrossChainOpportunities, CrossChainOpportunity } from '../services/opportunityScanner';
import { getBestFlashLoanProvider, getBestDexRoute } from '../utils/flashLoanOptimizer';

export { ChainConfig, CrossChainOpportunity } from '../config/chainConfigurations';
export { CrossChainOpportunity as CrossChainOpportunityType } from '../services/opportunityScanner';

export function useMultiChainManager() {
  const [chains, setChains] = useState<ChainConfig[]>(SUPPORTED_CHAINS);
  const [crossChainOpportunities, setCrossChainOpportunities] = useState<CrossChainOpportunity[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [flashLoanMode, setFlashLoanMode] = useState(false);

  const enabledChains = useMemo(() => chains.filter(chain => chain.enabled), [chains]);

  const toggleChain = (chainId: string) => {
    setChains(prev => prev.map(chain => 
      chain.id === chainId ? { ...chain, enabled: !chain.enabled } : chain
    ));
  };

  const scanOpportunities = async () => {
    if (enabledChains.length <= 1) return;
    
    setIsScanning(true);
    try {
      const opportunities = await scanCrossChainOpportunities(enabledChains, flashLoanMode);
      setCrossChainOpportunities(opportunities);
    } catch (error) {
      console.error('Error scanning opportunities:', error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (enabledChains.length > 1) {
      scanOpportunities();
      const interval = setInterval(scanOpportunities, 12000);
      return () => clearInterval(interval);
    }
  }, [enabledChains.length, flashLoanMode]);

  return {
    chains,
    enabledChains,
    crossChainOpportunities,
    isScanning,
    flashLoanMode,
    toggleChain,
    setFlashLoanMode,
    scanCrossChainOpportunities: scanOpportunities,
    getBestFlashLoanProvider,
    getBestDexRoute
  };
}
