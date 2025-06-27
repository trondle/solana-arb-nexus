
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  deposit: (amount: string, tokenSymbol: string) => Promise<void>;
  withdraw: (amount: string, tokenSymbol: string, toAddress: string) => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Low-fee network configurations
const SUPPORTED_NETWORKS = {
  8453: { // Base
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    avgFee: 0.002,
    tokens: {
      ETH: '0x0000000000000000000000000000000000000000',
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    }
  },
  137: { // Polygon
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    avgFee: 0.001,
    tokens: {
      MATIC: '0x0000000000000000000000000000000000000000',
      USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
    }
  },
  42161: { // Arbitrum
    name: 'Arbitrum',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    avgFee: 0.003,
    tokens: {
      ETH: '0x0000000000000000000000000000000000000000',
      USDC: '0xA0b86a33E6417fB1fC21b98a5c291D0679cBf6c2'
    }
  },
  10: { // Optimism
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    avgFee: 0.002,
    tokens: {
      ETH: '0x0000000000000000000000000000000000000000',
      USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'
    }
  },
  250: { // Fantom
    name: 'Fantom',
    symbol: 'FTM',
    rpcUrl: 'https://rpc.ftm.tools',
    explorerUrl: 'https://ftmscan.com',
    avgFee: 0.0005,
    tokens: {
      FTM: '0x0000000000000000000000000000000000000000',
      USDC: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75'
    }
  }
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, logAction } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const address = accounts[0].address;
          setIsConnected(true);
          setAddress(address);
          await updateBalance(address);
          await updateChainId();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const setupEventListeners = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAddress(accounts[0]);
      await updateBalance(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    const newChainId = parseInt(chainId, 16);
    setChainId(newChainId);
    
    // Check if it's a supported low-fee network
    if (!SUPPORTED_NETWORKS[newChainId as keyof typeof SUPPORTED_NETWORKS]) {
      toast({
        title: "High Fee Network Detected",
        description: "Consider switching to Base, Polygon, Arbitrum, Optimism, or Fantom for lower fees.",
        variant: "destructive",
      });
    }
    
    // Update balance for new network
    if (address) {
      updateBalance(address);
    }
  };

  const updateBalance = async (walletAddress: string) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(walletAddress);
        setBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const updateChainId = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
      }
    } catch (error) {
      console.error('Error getting chain ID:', error);
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask extension to connect your wallet.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      setIsConnected(true);
      setAddress(address);
      setChainId(chainId);
      await updateBalance(address);

      // Save wallet connection to database
      if (user) {
        await supabase
          .from('wallet_connections')
          .upsert({
            user_id: user.id,
            wallet_address: address,
            wallet_type: 'metamask',
            is_active: true,
            updated_at: new Date().toISOString()
          });

        await logAction('wallet_connected', { wallet_address: address, chain_id: chainId });
      }

      // Check if connected to a low-fee network
      if (SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]) {
        const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS];
        toast({
          title: "Wallet Connected",
          description: `Connected to ${network.name} - Low fee network optimal for flash loans!`,
        });
      } else {
        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}. Consider switching to a low-fee network.`,
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance(null);
    setChainId(null);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const deposit = async (amount: string, tokenSymbol: string = 'ETH') => {
    if (!isConnected || !address || !user || !window.ethereum || !chainId) {
      toast({
        title: "Wallet Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS];
    if (!network) {
      toast({
        title: "Unsupported Network",
        description: "Please switch to Base, Polygon, Arbitrum, Optimism, or Fantom for deposits.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Validate amount
      const depositAmount = parseFloat(amount);
      if (isNaN(depositAmount) || depositAmount <= 0) {
        throw new Error('Invalid deposit amount');
      }

      // Check balance
      const currentBalance = parseFloat(balance || '0');
      const estimatedFee = network.avgFee;
      if (depositAmount + estimatedFee > currentBalance) {
        throw new Error(`Insufficient balance. You need ${(depositAmount + estimatedFee).toFixed(6)} ${network.symbol} (including network fees)`);
      }

      // Create platform deposit address (in real implementation, this would be your platform's hot wallet)
      const platformDepositAddress = "0x742d35Cc6C4D7FAF6B8eAc95C16d73De14b74db0"; // Replace with actual platform address
      
      const tx = await signer.sendTransaction({
        to: platformDepositAddress,
        value: ethers.parseEther(amount),
        gasLimit: 21000
      });

      toast({
        title: "Deposit Transaction Sent",
        description: `Depositing ${amount} ${network.symbol} on ${network.name}. TX: ${tx.hash.slice(0, 10)}...`,
      });

      // Save transaction to database
      await supabase
        .from('crypto_transactions')
        .insert({
          user_id: user.id,
          wallet_address: address,
          transaction_hash: tx.hash,
          transaction_type: 'deposit',
          chain_name: network.name,
          token_symbol: network.symbol,
          amount: depositAmount,
          status: 'pending',
          from_address: address,
          to_address: platformDepositAddress
        });

      await logAction('crypto_deposit_initiated', { 
        amount: depositAmount, 
        token: network.symbol, 
        tx_hash: tx.hash,
        network: network.name,
        estimated_fee: estimatedFee
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt) {
        // Update transaction status
        await supabase
          .from('crypto_transactions')
          .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
            block_number: receipt.blockNumber,
            gas_fee: parseFloat(ethers.formatEther(receipt.gasUsed * receipt.gasPrice))
          })
          .eq('transaction_hash', tx.hash);

        await updateBalance(address);
        
        toast({
          title: "Deposit Confirmed",
          description: `Successfully deposited ${amount} ${network.symbol} on ${network.name}`,
        });
      }
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to process deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (amount: string, tokenSymbol: string = 'ETH', toAddress: string) => {
    if (!isConnected || !address || !user || !chainId) {
      toast({
        title: "Wallet Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS];
    if (!network) {
      toast({
        title: "Unsupported Network",
        description: "Please switch to a supported low-fee network for withdrawals.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Validate inputs
      const withdrawAmount = parseFloat(amount);
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        throw new Error('Invalid withdrawal amount');
      }

      if (!toAddress || !ethers.isAddress(toAddress)) {
        throw new Error('Invalid withdrawal address');
      }

      // Check minimum withdrawal amount
      if (withdrawAmount < 0.001) {
        throw new Error('Minimum withdrawal amount is 0.001');
      }

      // In a real implementation, this would trigger a withdrawal from your platform's hot wallet
      // For now, we'll record the withdrawal request for manual processing
      await supabase
        .from('crypto_transactions')
        .insert({
          user_id: user.id,
          wallet_address: address,
          transaction_type: 'withdrawal',
          chain_name: network.name,
          token_symbol: network.symbol,
          amount: withdrawAmount,
          status: 'pending',
          from_address: address, // Platform's address would go here in real implementation
          to_address: toAddress
        });

      await logAction('crypto_withdrawal_requested', { 
        amount: withdrawAmount, 
        token: network.symbol, 
        to_address: toAddress,
        network: network.name,
        estimated_fee: network.avgFee
      });

      toast({
        title: "Withdrawal Request Submitted",
        description: `Withdrawal of ${amount} ${network.symbol} on ${network.name} has been submitted. Processing time: 1-24 hours.`,
      });
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    const network = SUPPORTED_NETWORKS[targetChainId as keyof typeof SUPPORTED_NETWORKS];
    if (!network) {
      toast({
        title: "Unsupported Network",
        description: "This network is not supported for low-fee operations.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
        
        toast({
          title: "Network Switched",
          description: `Switched to ${network.name} - Optimized for low-fee transactions!`,
        });
      }
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to MetaMask, try to add it
        try {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: {
                name: network.symbol,
                symbol: network.symbol,
                decimals: 18
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.explorerUrl]
            }]
          });
        } catch (addError) {
          toast({
            title: "Network Add Failed",
            description: "Please add this network to MetaMask manually.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Network Switch Failed",
          description: "Failed to switch network. Please try manually in MetaMask.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <WalletContext.Provider value={{
      isConnected,
      address,
      balance,
      chainId,
      connectWallet,
      disconnectWallet,
      deposit,
      withdraw,
      switchNetwork,
      loading
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
