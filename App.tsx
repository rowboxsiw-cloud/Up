
import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  User, 
  QrCode, 
  Scan, 
  Send, 
  LogOut, 
  ArrowRight,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Zap,
  Bot,
  Bell,
  Fingerprint
} from 'lucide-react';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebaseConfig';
import { createOrUpdateUser, subscribeToUserProfile, subscribeToTransactions } from './services/paymentService';
import { getSpendingInsights } from './services/aiService';
import { UserProfile, Transaction } from './types';

// Components
import BalanceCard from './components/BalanceCard';
import TransactionItem from './components/TransactionItem';
import TransferModal from './components/TransferModal';
import ScannerModal from './components/ScannerModal';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedUpi, setSelectedUpi] = useState<string | undefined>();
  const [aiInsight, setAiInsight] = useState<string>("Analyzing your wallet...");

  useEffect(() => {
    // Monitor auth state using modular SDK function
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await createOrUpdateUser(
            fbUser.uid, 
            fbUser.email || 'user@skypay.internal', 
            fbUser.displayName || 'SkyPay User'
          );
          setUser(profile);
          
          const userSub = subscribeToUserProfile(fbUser.uid, setUser);
          const transSub = subscribeToTransactions(fbUser.uid, (txs) => {
            setTransactions(txs);
            // Fetch AI insights based on transaction history
            getSpendingInsights(txs).then(setAiInsight);
          });
          
          setAuthLoading(false);
          return () => {
            userSub();
            transSub();
          };
        } catch (err) {
          console.error("Profile sync error:", err);
          setAuthLoading(false);
        }
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      // Use modular SDK for Google Auth popup
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 gradient-mesh rounded-[2.5rem] flex items-center justify-center ai-glow">
            <Zap className="w-10 h-10 text-white fill-current" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">SkyPay Pro</h2>
            <p className="text-sm text-slate-400 font-medium mt-1">Securing Connection...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="relative mb-12 flex justify-center">
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
            <div className="p-8 gradient-mesh rounded-[3rem] shadow-2xl relative z-10 transition-transform hover:scale-105 duration-500">
              <Zap className="w-20 h-20 text-white fill-current" />
            </div>
          </div>
          <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter italic">SkyPay</h1>
          <p className="text-slate-500 text-xl mb-12 font-medium leading-snug">
            The world's fastest <span className="text-blue-600 font-bold">AI-Powered</span> payment experience.
          </p>
          
          <button 
            onClick={handleLogin}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-2xl active:scale-[0.98] text-lg"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 rounded-full bg-white p-0.5" />
            Sign in with Google
          </button>
          
          <div className="grid grid-cols-3 gap-4 mt-16 opacity-60">
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-green-500" />
              <span className="text-[10px] font-bold uppercase">Safe</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Fingerprint className="w-6 h-6 text-blue-500" />
              <span className="text-[10px] font-bold uppercase">Biometric</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Bot className="w-6 h-6 text-purple-500" />
              <span className="text-[10px] font-bold uppercase">AI Check</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-white flex flex-col pb-28 relative selection:bg-blue-100">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-mesh rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-none">SkyPay</h1>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Enterprise Pro</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors relative">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-8 w-[1px] bg-slate-100"></div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 pl-1 pr-3 py-1 bg-slate-50 rounded-full border border-slate-100 hover:bg-red-50 hover:border-red-100 transition-all group"
          >
            <img src={user.photoURL || ''} className="w-7 h-7 rounded-full shadow-sm" alt="Profile" />
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
          </button>
        </div>
      </header>

      <main className="px-6 pt-4 flex-1">
        <div className="mb-6 animate-in slide-in-from-top-4 duration-700">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-3xl flex items-start gap-4">
            <div className="p-2 bg-white rounded-2xl shadow-sm text-blue-600">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                AI Smart Insights <Bot className="w-3 h-3" />
              </p>
              <p className="text-sm font-semibold text-slate-700 leading-snug">{aiInsight}</p>
            </div>
          </div>
        </div>

        <BalanceCard balance={user.balance} upiId={user.upiId} name={user.displayName || 'SkyPay User'} />

        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { icon: Send, label: 'Pay', color: 'blue', action: () => { setSelectedUpi(undefined); setIsTransferOpen(true); } },
            { icon: Scan, label: 'Scan', color: 'indigo', action: () => setIsScannerOpen(true) },
            { icon: QrCode, label: 'Receive', color: 'purple', action: () => alert("QR Received") },
            { icon: History, label: 'Bills', color: 'slate', disabled: true },
          ].map((item, idx) => (
            <button 
              key={idx}
              onClick={item.action}
              disabled={item.disabled}
              className={`flex flex-col items-center gap-3 group transition-all ${item.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <div className={`w-16 h-16 bg-${item.color}-50 text-${item.color}-600 rounded-[1.75rem] flex items-center justify-center shadow-sm group-hover:scale-110 group-active:scale-95 group-hover:bg-${item.color}-600 group-hover:text-white transition-all duration-300`}>
                <item.icon className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-800">Transaction History</h3>
          <button className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-2xl hover:bg-blue-100 transition-all">
            See All
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-1 pb-10">
            {transactions.slice(0, 8).map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <Zap className="w-10 h-10 text-slate-200" />
            </div>
            <p className="font-bold text-slate-400">Ready for your first payment?</p>
            <p className="text-xs text-slate-300 mt-1">AI-backed security active</p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass border border-white/50 p-2 z-50 rounded-[2.5rem] shadow-2xl shadow-indigo-200/50">
        <div className="flex items-center justify-around">
          <button className="p-4 text-blue-600 bg-blue-50 rounded-[1.75rem] flex flex-col items-center gap-1">
            <Zap className="w-6 h-6 fill-current" />
          </button>
          
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="w-16 h-16 gradient-mesh text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-400 border-[6px] border-white/80 transition-transform hover:scale-110 active:scale-90 -mt-12"
          >
            <Scan className="w-8 h-8" />
          </button>

          <button className="p-4 text-slate-400 hover:text-blue-600 transition-all flex flex-col items-center gap-1">
            <User className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <TransferModal 
        isOpen={isTransferOpen} 
        onClose={() => { setIsTransferOpen(false); setSelectedUpi(undefined); }} 
        senderUid={user.uid}
        initialUpiId={selectedUpi}
      />
      <ScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(upi) => {
          setSelectedUpi(upi);
          setIsTransferOpen(true);
        }}
      />
    </div>
  );
};

export default App;
