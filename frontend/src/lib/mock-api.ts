// 模拟后端API服务
export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress: string;
}

export interface GratitudeEntry {
  id: string;
  userId: string;
  content: string;
  amount: number;
  createdAt: string;
}

export interface WalletBalance {
  partnershipId: string;
  balance: number;
  lastUpdated: string;
}

export interface Goal {
  id: string;
  partnershipId: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Transaction {
  id: string;
  userId: string;
  partnershipId: string;
  type: 'gratitude' | 'contribution' | 'split';
  amount: number;
  description: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
}

// 模拟数据存储
let mockData = {
  users: [] as User[],
  gratitudeEntries: [] as GratitudeEntry[],
  walletBalances: [] as WalletBalance[],
  goals: [
    {
      id: '1',
      partnershipId: 'partnership-1',
      name: 'Trip to Bali',
      description: 'Our dream vacation together',
      targetAmount: 2000,
      currentAmount: 215.75,
      status: 'active' as const,
    }
  ] as Goal[],
  transactions: [] as Transaction[],
};

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockAPI {
  // 用户相关
  static async createUser(userData: Omit<User, 'id'>): Promise<User> {
    await delay(500);
    const user: User = {
      id: `user-${Date.now()}`,
      ...userData,
    };
    mockData.users.push(user);
    return user;
  }

  static async getUser(id: string): Promise<User | null> {
    await delay(300);
    return mockData.users.find(u => u.id === id) || null;
  }

  // 感恩记录相关
  static async createGratitude(gratitudeData: Omit<GratitudeEntry, 'id' | 'createdAt'>): Promise<GratitudeEntry> {
    await delay(500);
    const entry: GratitudeEntry = {
      id: `gratitude-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...gratitudeData,
    };
    mockData.gratitudeEntries.push(entry);
    
    // 更新钱包余额
    await this.updateWalletBalance('partnership-1', gratitudeData.amount);
    
    // 创建交易记录
    await this.createTransaction({
      userId: gratitudeData.userId,
      partnershipId: 'partnership-1',
      type: 'gratitude',
      amount: gratitudeData.amount,
      description: `Gratitude: ${gratitudeData.content.slice(0, 50)}...`,
      status: 'confirmed',
    });
    
    return entry;
  }

  static async getUserGratitude(userId: string): Promise<GratitudeEntry[]> {
    await delay(300);
    return mockData.gratitudeEntries.filter(g => g.userId === userId);
  }

  // 钱包相关
  static async getWalletBalance(partnershipId: string): Promise<WalletBalance> {
    await delay(300);
    let balance = mockData.walletBalances.find(w => w.partnershipId === partnershipId);
    if (!balance) {
      balance = {
        partnershipId,
        balance: 150.75,
        lastUpdated: new Date().toISOString(),
      };
      mockData.walletBalances.push(balance);
    }
    return balance;
  }

  static async updateWalletBalance(partnershipId: string, amount: number): Promise<WalletBalance> {
    await delay(500);
    let balance = mockData.walletBalances.find(w => w.partnershipId === partnershipId);
    if (!balance) {
      balance = {
        partnershipId,
        balance: 150.75 + amount,
        lastUpdated: new Date().toISOString(),
      };
      mockData.walletBalances.push(balance);
    } else {
      balance.balance += amount;
      balance.lastUpdated = new Date().toISOString();
    }
    
    // 更新目标进度
    const goal = mockData.goals.find(g => g.partnershipId === partnershipId);
    if (goal) {
      goal.currentAmount = balance.balance;
    }
    
    return balance;
  }

  // 交易相关
  static async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    await delay(500);
    const transaction: Transaction = {
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...transactionData,
    };
    mockData.transactions.push(transaction);
    return transaction;
  }

  static async getTransactions(partnershipId: string): Promise<Transaction[]> {
    await delay(300);
    return mockData.transactions
      .filter(t => t.partnershipId === partnershipId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // 目标相关
  static async getGoals(partnershipId: string): Promise<Goal[]> {
    await delay(300);
    return mockData.goals.filter(g => g.partnershipId === partnershipId);
  }

  static async createGoal(goalData: Omit<Goal, 'id'>): Promise<Goal> {
    await delay(500);
    const goal: Goal = {
      id: `goal-${Date.now()}`,
      ...goalData,
    };
    mockData.goals.push(goal);
    return goal;
  }

  // 重置数据（用于测试）
  static resetData(): void {
    mockData = {
      users: [],
      gratitudeEntries: [],
      walletBalances: [],
      goals: [
        {
          id: '1',
          partnershipId: 'partnership-1',
          name: 'Trip to Bali',
          description: 'Our dream vacation together',
          targetAmount: 2000,
          currentAmount: 215.75,
          status: 'active',
        }
      ],
      transactions: [],
    };
  }

  // 获取所有数据（用于调试）
  static getAllData() {
    return mockData;
  }
}