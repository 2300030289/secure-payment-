export type TransactionStatus = 'safe' | 'suspicious';

export interface Transaction {
  id: string;
  user_id: string;
  transaction_id: string;
  customer_user_id: string;
  amount: number;
  location: string;
  risk_score: number;
  status: TransactionStatus;
  risk_factors: string[];
  created_at: string;
}

export interface TransactionAlert {
  id: string;
  transaction_id: string;
  user_id: string;
  title: string;
  message: string;
  severity: 'medium' | 'high' | 'critical';
  is_resolved: boolean;
  created_at: string;
}

export interface TransactionWithAlert extends Transaction {
  alert?: TransactionAlert | null;
}

export interface RiskInput {
  transaction_id: string;
  customer_user_id: string;
  amount: number;
  location: string;
}

export interface RiskResult {
  score: number;
  status: TransactionStatus;
  risk_factors: string[];
}

export type UserRole = 'admin' | 'analyst';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface AdminTransaction extends Transaction {
  user_email?: string;
}

export interface AdminAlert extends TransactionAlert {
  user_email?: string;
}
