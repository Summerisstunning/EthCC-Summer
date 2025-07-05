import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, AA_SHARING_ABI, MOCK_USDC_ABI, BRIDGE_ABI, SIMPLE_STORAGE_ABI, NETWORK_CONFIG, USDC_CONFIG } from '@/config/contracts';

export interface Partnership {
  id: number;
  partner1: string;
  partner2: string;
  balance: bigint;
  goalCount: bigint;
  active: boolean;
}

export interface Goal {
  id: number;
  partnershipId: bigint;
  name: string;
  description: string;
  targetAmount: bigint;
  currentAmount: bigint;
  achieved: boolean;
}

export interface ContractBalances {
  flow: string;
  usdc: string;
}

export function useContracts() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contracts, setContracts] = useState<{
    aaSharing: ethers.Contract | null;
    mockUSDC: ethers.Contract | null;
    bridge: ethers.Contract | null;
    simpleStorage: ethers.Contract | null;
  }>({ aaSharing: null, mockUSDC: null, bridge: null, simpleStorage: null });
  const [balances, setBalances] = useState<ContractBalances>({ flow: '0', usdc: '0' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider and contracts
  useEffect(() => {
    async function initializeContracts() {
      if (!ready || !authenticated || wallets.length === 0) {
        console.log('Waiting for wallet connection...', { ready, authenticated, wallets: wallets.length });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to find embedded wallet, fallback to any available wallet
        let wallet = wallets.find(wallet => wallet.walletClientType === 'privy');
        if (!wallet) {
          wallet = wallets[0]; // Use first available wallet
        }
        if (!wallet) {
          throw new Error('No wallet found');
        }

        // Switch to Flow network if needed
        await wallet.switchChain(NETWORK_CONFIG.chainId);
        
        // Get the provider
        const ethereumProvider = await wallet.getEthereumProvider();
        const ethersProvider = new ethers.BrowserProvider(ethereumProvider);
        const ethersSigner = await ethersProvider.getSigner();

        setProvider(ethersProvider);
        setSigner(ethersSigner);

        // Initialize contracts
        const aaSharingContract = new ethers.Contract(
          CONTRACT_ADDRESSES.AA_SHARING,
          AA_SHARING_ABI,
          ethersSigner
        );

        const mockUSDCContract = new ethers.Contract(
          CONTRACT_ADDRESSES.MOCK_USDC,
          MOCK_USDC_ABI,
          ethersSigner
        );

        const bridgeContract = new ethers.Contract(
          CONTRACT_ADDRESSES.BRIDGE,
          BRIDGE_ABI,
          ethersSigner
        );

        const simpleStorageContract = new ethers.Contract(
          CONTRACT_ADDRESSES.SIMPLE_STORAGE,
          SIMPLE_STORAGE_ABI,
          ethersSigner
        );

        setContracts({
          aaSharing: aaSharingContract,
          mockUSDC: mockUSDCContract,
          bridge: bridgeContract,
          simpleStorage: simpleStorageContract
        });

        console.log('✅ Contracts initialized successfully');

      } catch (err: unknown) {
        console.error('Failed to initialize contracts:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize contracts';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    initializeContracts();
  }, [ready, authenticated, wallets]);

  // Update balances
  const updateBalances = useCallback(async () => {
    if (!signer || !contracts.mockUSDC) return;

    try {
      const address = await signer.getAddress();
      
      // Get FLOW balance
      const flowBalance = await signer.provider.getBalance(address);
      
      // Get USDC balance  
      const usdcBalance = await contracts.mockUSDC.balanceOf(address);

      setBalances({
        flow: ethers.formatEther(flowBalance),
        usdc: ethers.formatUnits(usdcBalance, USDC_CONFIG.decimals)
      });

    } catch (err: unknown) {
      console.error('Failed to update balances:', err);
    }
  }, [signer, contracts.mockUSDC]);

  // Update balances when contracts are ready
  useEffect(() => {
    if (contracts.mockUSDC && signer) {
      updateBalances();
    }
  }, [contracts.mockUSDC, signer, updateBalances]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Contract status:', {
      ready,
      authenticated,
      walletsCount: wallets.length,
      contractsReady: !!contracts.aaSharing,
      signerReady: !!signer,
      error
    });
  }, [ready, authenticated, wallets.length, contracts.aaSharing, signer, error]);

  // Partnership functions
  const createPartnership = useCallback(async (partnerAddress: string, nickname1: string = 'Partner 1', nickname2: string = 'Partner 2') => {
    if (!contracts.aaSharing || !signer) {
      throw new Error('Contracts not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Creating partnership with:', { partnerAddress, nickname1, nickname2 });
      
      const tx = await contracts.aaSharing.createPartnership(partnerAddress, nickname1, nickname2);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Partnership created in block:', receipt.blockNumber);
      
      return receipt;
    } catch (err: unknown) {
      console.error('Failed to create partnership:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create partnership';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contracts.aaSharing, signer]);

  // Gratitude functions
  const addGratitude = useCallback(async (partnershipId: number, gratitudeText: string, usdcAmount: string = '0') => {
    if (!contracts.aaSharing || !signer) {
      throw new Error('Contracts not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      // Convert USDC amount to proper units (6 decimals)
      const usdcAmountBN = ethers.parseUnits(usdcAmount, USDC_CONFIG.decimals);
      
      console.log('Adding gratitude:', { partnershipId, gratitudeText, usdcAmount });
      
      const tx = await contracts.aaSharing.addGratitude(partnershipId, gratitudeText, usdcAmountBN);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Gratitude added in block:', receipt.blockNumber);
      
      await updateBalances();
      return receipt;
    } catch (err: unknown) {
      console.error('Failed to add gratitude:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add gratitude';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contracts.aaSharing, signer, updateBalances]);

  // Goal functions
  const createGoal = useCallback(async (partnershipId: number, name: string, description: string, targetAmountUSDC: string) => {
    if (!contracts.aaSharing || !signer) {
      throw new Error('Contracts not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      const targetAmount = ethers.parseUnits(targetAmountUSDC, USDC_CONFIG.decimals);
      
      console.log('Creating goal:', { partnershipId, name, description, targetAmountUSDC });
      
      const tx = await contracts.aaSharing.createGoal(partnershipId, name, description, targetAmount);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Goal created in block:', receipt.blockNumber);
      
      return receipt;
    } catch (err: unknown) {
      console.error('Failed to create goal:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create goal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contracts.aaSharing, signer]);

  // USDC functions
  const approveUSDC = useCallback(async (amount: string) => {
    if (!contracts.mockUSDC || !signer) {
      throw new Error('Contracts not initialized');
    }

    try {
      setLoading(true);
      setError(null);

      const approvalAmount = ethers.parseUnits(amount, USDC_CONFIG.decimals);
      
      console.log('Approving USDC:', amount);
      
      const tx = await contracts.mockUSDC.approve(CONTRACT_ADDRESSES.AA_SHARING, approvalAmount);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('USDC approved in block:', receipt.blockNumber);
      
      return receipt;
    } catch (err: unknown) {
      console.error('Failed to approve USDC:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve USDC';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contracts.mockUSDC, signer]);

  // Read functions
  const getPartnerships = useCallback(async () => {
    if (!contracts.aaSharing || !signer) return [];

    try {
      const address = await signer.getAddress();
      const totalPartnerships = await contracts.aaSharing.totalPartnerships();
      const partnerships: Partnership[] = [];

      for (let i = 0; i < totalPartnerships; i++) {
        const partnership = await contracts.aaSharing.partnerships(i);
        
        // Check if user is part of this partnership
        if (partnership[0].toLowerCase() === address.toLowerCase() || 
            partnership[1].toLowerCase() === address.toLowerCase()) {
          partnerships.push({
            id: i,
            partner1: partnership[0],
            partner2: partnership[1],
            balance: partnership[2],
            goalCount: partnership[3],
            active: partnership[4]
          });
        }
      }

      return partnerships;
    } catch (err: unknown) {
      console.error('Failed to get partnerships:', err);
      return [];
    }
  }, [contracts.aaSharing, signer]);

  const getPartnershipGoals = useCallback(async (partnershipId: number) => {
    if (!contracts.aaSharing) return [];

    try {
      const goalIds = await contracts.aaSharing.getPartnershipGoals(partnershipId);
      const goals: Goal[] = [];

      for (const goalId of goalIds) {
        const goal = await contracts.aaSharing.goals(goalId);
        goals.push({
          id: Number(goalId),
          partnershipId: goal[0],
          name: goal[1],
          description: goal[2],
          targetAmount: goal[3],
          currentAmount: goal[4],
          achieved: goal[5]
        });
      }

      return goals;
    } catch (err: unknown) {
      console.error('Failed to get partnership goals:', err);
      return [];
    }
  }, [contracts.aaSharing]);

  return {
    // State
    ready: ready && authenticated && !!contracts.aaSharing,
    loading,
    error,
    balances,
    contracts,
    signer,
    provider,

    // Functions
    createPartnership,
    addGratitude,
    createGoal,
    approveUSDC,
    getPartnerships,
    getPartnershipGoals,
    updateBalances,

    // Utilities
    formatFlow: (value: bigint) => ethers.formatEther(value),
    formatUSDC: (value: bigint) => ethers.formatUnits(value, USDC_CONFIG.decimals),
    parseFlow: (value: string) => ethers.parseEther(value),
    parseUSDC: (value: string) => ethers.parseUnits(value, USDC_CONFIG.decimals),
  };
}