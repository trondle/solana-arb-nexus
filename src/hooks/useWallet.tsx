
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
    setChainId(parseInt(chainId, 16));
    window.location.reload();
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
        description: "Please install MetaMask to connect your wallet.",
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
      
      setIsConnected(true);
      setAddress(address);
      await updateBalance(address);
      await updateChainId();

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

        await logAction('wallet_connected', { wallet_address: address });
      }

      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
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
    if (!isConnected || !address || !user || !window.ethereum) {
      toast({
        title: "Wallet Error",
        description: "Please connect your wallet first.",
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
      if (depositAmount > currentBalance) {
        throw new Error('Insufficient balance for deposit');
      }

      // For demo purposes, we'll use a test deposit address
      const depositAddress = "0x742d35Cc6C4D7FAF6B8eAc95C16d73De14b74db0"; // Example address
      
      const tx = await signer.sendTransaction({
        to: depositAddress,
        value: ethers.parseEther(amount),
        gasLimit: 21000
      });

      toast({
        title: "Deposit Initiated",
        description: `Depositing ${amount} ${tokenSymbol}. TX: ${tx.hash.slice(0, 10)}...`,
      });

      // Save transaction to database
      if (user) {
        await supabase
          .from('crypto_transactions')
          .insert({
            user_id: user.id,
            wallet_address: address,
            transaction_hash: tx.hash,
            transaction_type: 'deposit',
            chain_name: getChainName(chainId!),
            token_symbol: tokenSymbol,
            amount: depositAmount,
            status: 'pending',
            from_address: address,
            to_address: depositAddress
          });

        await logAction('crypto_deposit_initiated', { 
          amount: depositAmount, 
          token: tokenSymbol, 
          tx_hash: tx.hash 
        });
      }

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt) {
        // Update transaction status
        if (user) {
          await supabase
            .from('crypto_transactions')
            .update({
              status: 'confirmed',
              confirmed_at: new Date().toISOString(),
              block_number: receipt.blockNumber,
              gas_fee: parseFloat(ethers.formatEther(receipt.gasUsed * receipt.gasPrice))
            })
            .eq('transaction_hash', tx.hash);
        }

        await updateBalance(address);
        
        toast({
          title: "Deposit Confirmed",
          description: `Successfully deposited ${amount} ${tokenSymbol}`,
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
    if (!isConnected || !address || !user) {
      toast({
        title: "Wallet Error",
        description: "Please connect your wallet first.",
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

      // In a real application, this would trigger a withdrawal from your platform's hot wallet
      // For demo purposes, we'll just record the withdrawal request
      await supabase
        .from('crypto_transactions')
        .insert({
          user_id: user.id,
          wallet_address: address,
          transaction_type: 'withdrawal',
          chain_name: getChainName(chainId!),
          token_symbol: tokenSymbol,
          amount: withdrawAmount,
          status: 'pending',
          from_address: address, // Platform's address would go here
          to_address: toAddress
        });

      await logAction('crypto_withdrawal_requested', { 
        amount: withdrawAmount, 
        token: tokenSymbol, 
        to_address: toAddress 
      });

      toast({
        title: "Withdrawal Requested",
        description: `Withdrawal of ${amount} ${tokenSymbol} has been submitted for processing.`,
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
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
      }
    } catch (error: any) {
      if (error.code === 4902) {
        toast({
          title: "Network not found",
          description: "Please add this network to MetaMask manually.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Network Switch Failed",
          description: "Failed to switch network. Please try manually.",
          variant: "destructive",
        });
      }
    }
  };

  const getChainName = (chainId: number): string => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      8453: 'Base',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      250: 'Fantom',
      43114: 'Avalanche'
    };
    return chains[chainId] || 'Unknown';
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
