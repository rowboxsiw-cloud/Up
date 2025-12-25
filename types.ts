
export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  upiId: string;
  balance: number;
  createdAt: number;
}

export type TransactionType = 'CREDIT' | 'DEBIT' | 'BONUS';

export interface Transaction {
  id: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  amount: number;
  type: TransactionType;
  timestamp: number;
  note?: string;
  upiId?: string;
}

export interface UpiMapping {
  uid: string;
  displayName: string;
}
