
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Transaction {
  id: string;
  transaction_hash: string | null;
  transaction_type: 'deposit' | 'withdrawal';
  chain_name: string;
  token_symbol: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  gas_fee: number | null;
  created_at: string;
  confirmed_at: string | null;
  from_address: string | null;
  to_address: string | null;
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'deposit' ? 
      <ArrowDownCircle className="w-4 h-4 text-green-500" /> : 
      <ArrowUpCircle className="w-4 h-4 text-blue-500" />;
  };

  const formatAddress = (address: string | null) => {
    if (!address) return '-';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (hash: string | null, chain: string) => {
    if (!hash) return null;
    
    const explorers: Record<string, string> = {
      'Ethereum': 'https://etherscan.io/tx/',
      'Base': 'https://basescan.org/tx/',
      'Polygon': 'https://polygonscan.com/tx/',
      'Arbitrum': 'https://arbiscan.io/tx/',
      'Optimism': 'https://optimistic.etherscan.io/tx/',
      'Fantom': 'https://ftmscan.com/tx/'
    };
    
    return explorers[chain] ? `${explorers[chain]}${hash}` : null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">Loading transactions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Transaction History
          <Button variant="outline" size="sm" onClick={fetchTransactions}>
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No transactions yet. Make your first deposit to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Chain</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(tx.transaction_type)}
                        <span className="capitalize">{tx.transaction_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {tx.amount.toFixed(6)} {tx.token_symbol}
                      </div>
                      {tx.gas_fee && (
                        <div className="text-xs text-muted-foreground">
                          Gas: {tx.gas_fee.toFixed(6)} ETH
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <Badge variant={getStatusColor(tx.status)}>
                          {tx.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.chain_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {tx.transaction_hash ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs">
                            {formatAddress(tx.transaction_hash)}
                          </code>
                          {getExplorerUrl(tx.transaction_hash, tx.chain_name) && (
                            <Button variant="ghost" size="sm" asChild>
                              <a 
                                href={getExplorerUrl(tx.transaction_hash, tx.chain_name)!}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Pending</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
