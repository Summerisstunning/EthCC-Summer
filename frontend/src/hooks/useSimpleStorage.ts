import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  storeData as storeDataContract,
  addMessage as addMessageContract,
  updateTokenAmount as updateTokenAmountContract,
  getUserData as getUserDataContract,
  getMyData as getMyDataContract,
  getMessageCount as getMessageCountContract
} from '@/lib/contracts/simpleStorage';

// 定义返回数据类型
interface UserData {
  messages: string[];
  tokenAmount: bigint;
  userAddress?: string;
  timestamp: bigint;
}

interface UseSimpleStorageReturn {
  // 状态
  isLoading: boolean;
  error: Error | null;
  userData: UserData | null;
  
  // 操作函数
  storeData: (messages: string[], tokenAmount: bigint) => Promise<void>;
  addMessage: (message: string) => Promise<void>;
  updateTokenAmount: (amount: bigint) => Promise<void>;
  getUserData: (userAddress: string) => Promise<UserData>;
  getMyData: () => Promise<UserData>;
  refreshUserData: () => Promise<void>;
  getMessageCount: (userAddress: string) => Promise<bigint>;
}

export const useSimpleStorage = (
  provider?: ethers.Provider | null,
  signer?: ethers.Signer | null,
  userAddress?: string
): UseSimpleStorageReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  // 存储数据
  const storeData = useCallback(async (messages: string[], tokenAmount: bigint): Promise<void> => {
    if (!signer) {
      throw new Error('需要签名者来执行此操作');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const tx = await storeDataContract(signer, messages, tokenAmount);
      await tx.wait();
      
      // 刷新数据
      const newData = await getMyDataContract(signer);
      setUserData(newData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  // 添加消息
  const addMessage = useCallback(async (message: string): Promise<void> => {
    if (!signer) {
      throw new Error('需要签名者来执行此操作');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const tx = await addMessageContract(signer, message);
      await tx.wait();
      
      // 刷新数据
      const newData = await getMyDataContract(signer);
      setUserData(newData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  // 更新代币数量
  const updateTokenAmount = useCallback(async (amount: bigint): Promise<void> => {
    if (!signer) {
      throw new Error('需要签名者来执行此操作');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const tx = await updateTokenAmountContract(signer, amount);
      await tx.wait();
      
      // 刷新数据
      const newData = await getMyDataContract(signer);
      setUserData(newData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  // 获取用户数据
  const getUserData = useCallback(async (address: string): Promise<UserData> => {
    if (!provider) {
      throw new Error('需要提供者来执行此操作');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getUserDataContract(provider, address);
      return data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  // 获取当前用户数据
  const getMyData = useCallback(async (): Promise<UserData> => {
    if (!signer) {
      throw new Error('需要签名者来执行此操作');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getMyDataContract(signer);
      setUserData(data);
      return data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [signer]);

  // 获取消息数量
  const getMessageCount = useCallback(async (address: string): Promise<bigint> => {
    if (!provider) {
      throw new Error('需要提供者来执行此操作');
    }

    try {
      return await getMessageCountContract(provider, address);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [provider]);

  // 刷新用户数据
  const refreshUserData = useCallback(async (): Promise<void> => {
    if (signer) {
      await getMyData();
    } else if (provider && userAddress) {
      const data = await getUserData(userAddress);
      setUserData(data);
    }
  }, [provider, signer, userAddress, getMyData, getUserData]);

  // 初始加载用户数据
  useEffect(() => {
    if (signer || (provider && userAddress)) {
      refreshUserData().catch(err => {
        console.error('加载用户数据失败:', err);
        setError(err);
      });
    }
  }, [provider, signer, userAddress, refreshUserData]);

  return {
    isLoading,
    error,
    userData,
    storeData,
    addMessage,
    updateTokenAmount,
    getUserData,
    getMyData,
    refreshUserData,
    getMessageCount
  };
};
