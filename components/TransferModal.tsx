
import React, { useState } from 'react';
import { X, Send, Search, User, ShieldCheck, Loader2, Bot } from 'lucide-react';
import { getUserByUpiId, sendMoney } from '../services/paymentService';
import { validatePaymentSecurity } from '../services/aiService';

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
  const [verifyingAI, setVerifyingAI] = useState(false);
  const [error, setError] = useState('');
  const [aiReport, setAiReport] = useState<{ safetyScore: number, reason: string } | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!upiId) return;
    setLoading(true);
    setError('');
    setAiReport(null);
    try {
      const user = await getUserByUpiId(upiId);
      if (user) {
        setRecipient(user);
      } else {
        setError('UPI ID not found');
        setRecipient(null);
      }
    } catch (e) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!recipient || !amount) return;
    
    // AI Pre-check Phase
    setVerifyingAI(true);
    setError('');
    
    const report = await validatePaymentSecurity(parseFloat(amount), note);
    setAiReport(report);
    
    // Brief delay to show AI is working
    await new Promise(r => setTimeout(r, 800));
    setVerifyingAI(false);

    if (report.safetyScore < 30) {
      setError(`AI Warning: ${report.reason}. Payment blocked for your safety.`);
      return;
    }

    setLoading(true);
    try {
      const res = await sendMoney(senderUid, upiId, parseFloat(amount), note);
      if (res.success) {
        onClose();
        // In a real app we'd use a nice success modal
        alert('Payment Success! AI Verified Transaction.');
      } else {
        setError(res.message);
      }
    } catch (e) {
      setError('System failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden transition-all flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-8 border-b border-slate-50">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Send Money</h3>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">AI Secured Tunnel</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-6">
          {/* UPI ID Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receiver Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value.toLowerCase());
                  setRecipient(null);
                  setAiReport(null);
                }}
                placeholder="id@skypay"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-blue-500 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
              />
              {!recipient && upiId && (
                <button 
                  onClick={handleVerify}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 rounded-3xl font-black text-sm shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                </button>
              )}
            </div>
          </div>

          {recipient && (
            <div className="flex items-center gap-4 p-5 bg-green-50 border border-green-100 rounded-3xl animate-in slide-in-from-right-4 duration-500">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-black text-green-800 uppercase tracking-tight">{recipient.displayName}</p>
                <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3" /> Secure Destination
                </div>
              </div>
            </div>
          )}

          {/* Amount Area */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Amount to Transfer</label>
            <div className="relative flex items-center justify-center">
              <span className="absolute left-8 text-3xl font-black text-slate-300">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-12 py-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-5xl font-black text-center focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Purpose</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's this for?"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
              {error}
            </div>
          )}

          {aiReport && !error && (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-[11px] font-bold border border-blue-100 flex items-center gap-3">
              <Bot className="w-5 h-5 flex-shrink-0" />
              <span>AI Trust Score: {aiReport.safetyScore}/100 - {aiReport.reason}</span>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!recipient || !amount || loading || verifyingAI}
            className="w-full py-5 gradient-mesh text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-30 active:scale-95"
          >
            {verifyingAI ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> AI Security Check...</>
            ) : loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <><Send className="w-6 h-6" /> Pay Securely</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
