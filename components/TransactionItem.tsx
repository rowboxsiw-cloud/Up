
import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Gift, ShoppingBag, Coffee, Car, FileText, Layout } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const isDebit = transaction.type === 'DEBIT';
  const isBonus = transaction.type === 'BONUS';
  
  const formatDate = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' • ' + 
           date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryIcon = () => {
    if (isBonus) return Gift;
    const note = transaction.note?.toLowerCase() || '';
    if (note.includes('food') || note.includes('lunch') || note.includes('dinner')) return Coffee;
    if (note.includes('travel') || note.includes('uber') || note.includes('ride')) return Car;
    if (note.includes('shop') || note.includes('amazon')) return ShoppingBag;
    if (note.includes('bill') || note.includes('rent')) return FileText;
    return isDebit ? ArrowUpRight : ArrowDownLeft;
  };

  const Icon = getCategoryIcon();
  const colorClass = isBonus ? 'bg-orange-50 text-orange-600' : (isDebit ? 'bg-slate-50 text-slate-600' : 'bg-green-50 text-green-600');

  return (
    <div className="flex items-center justify-between p-5 bg-white rounded-[2rem] mb-2 border border-slate-50 hover:border-blue-100 hover:shadow-sm transition-all active:scale-[0.98] group">
      <div className="flex items-center gap-4">
        <div className={`p-3.5 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <p className="font-black text-slate-800 text-[13px] tracking-tight leading-tight">
            {isBonus ? 'Pro Welcome Reward' : (isDebit ? `${transaction.toName}` : `${transaction.fromName}`)}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(transaction.timestamp)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-black text-sm ${isDebit ? 'text-slate-900' : 'text-green-600'}`}>
          {isDebit ? `-₹${transaction.amount.toLocaleString()}` : `+₹${transaction.amount.toLocaleString()}`}
        </p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Settled</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
