
import React, { useState } from 'react';
import { X, Send, Search, User } from 'lucide-react';
import { getUserByUpiId, sendMoney } from '../services/paymentService';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderUid: string;
  initialUpiId?: string;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, senderUid, initialUpiId = '' }) => {
  const [upiId, setUpiId] = useState(initialUpiId);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [recipient, setRecipient] = useState<{ displayName: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!upiId) return;
    setLoading(true);
    setError('');
    try {
      const user = await getUserByUpiId(upiId);
      if (user) {
        setRecipient(user);
      } else {
        setError('Invalid UPI ID. Please check and try again.');
        setRecipient(null);
      }
    } catch (e) {
      setError('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!recipient || !amount) return;
    setLoading(true);
    setError('');
    try {
      const res = await sendMoney(senderUid, upiId, parseFloat(amount), note);
      if (res.success) {
        onClose();
        alert('Payment Successful!');
      } else {
        setError(res.message);
      }
    } catch (e) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transition-all">
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <h3 className="text-xl font-bold text-slate-800">Send Money</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* UPI ID Input */}
            <div className="relative">
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Receiver UPI ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value.toLowerCase());
                    setRecipient(null);
                  }}
                  placeholder="name@skypay"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                />
                {!recipient && (
                  <button 
                    onClick={handleVerify}
                    disabled={!upiId || loading}
                    className="bg-blue-600 text-white px-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Search className="w-4 h-4" /> Verify
                  </button>
                )}
              </div>
            </div>

            {recipient && (
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-green-800 font-bold uppercase tracking-tight">{recipient.displayName}</p>
                  <p className="text-xs text-green-600 font-medium">Verified Payment User</p>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-extrabold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center"
              />
            </div>

            {/* Note Input */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Add Note (Optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Rent, Dinner, Gift..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

            <button
              onClick={handleSend}
              disabled={!recipient || !amount || loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Send className="w-5 h-5" /> Pay Securely</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
