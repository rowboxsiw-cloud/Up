
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
  Zap,
  Bot,
  Bell,
  PieChart as ChartIcon,
  Home as HomeIcon,
  Plus
} from 'lucide-react';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebaseConfig';
import { createOrUpdateUser, subscribeToUserProfile, subscribeToTransactions } from './services/paymentService';
import { getSpendingInsights, getSpendingBreakdown } from './services/aiService';
import { UserProfile, Transaction } from './types';

// Components
import BalanceCard from './components/BalanceCard';
import TransactionItem from './components/TransactionItem';
import TransferModal from './components/TransferModal';
import ScannerModal from './components/ScannerModal';
import QRModal from './components/QRModal';
import StatsSection from './components/StatsSection';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedUpi, setSelectedUpi] = useState<string | undefined>();
  const [aiInsight, setAiInsight] = useState<string>("Analyzing your wallet...");
  const [spendingBreakdown, setSpendingBreakdown] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'profile'>('home');

  useEffect(() => {
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
            // Deep AI analysis
            getSpendingInsights(txs).then(setAiInsight);
            getSpendingBreakdown(txs).then(setSpendingBreakdown);
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

  const totalDebit = useMemo(() => {
    return transactions
      .filter(t => t.type === 'DEBIT')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const handleLogin = async () => {
    try {
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
          <p className="text-sm text-slate-400 font-black animate-pulse uppercase tracking-widest">SkyPay Pro Sync</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 selection:bg-blue-100">
        <div className="max-w-md w-full text-center">
          <div className="relative mb-12 flex justify-center">
            <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full"></div>
            <div className="p-8 gradient-mesh rounded-[3rem] shadow-2xl relative z-10 transition-transform hover:scale-105 duration-500 border-4 border-white/50">
              <Zap className="w-20 h-20 text-white fill-current" />
            </div>
          </div>
          <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter italic">SkyPay</h1>
          <p className="text-slate-500 text-xl mb-12 font-medium leading-snug">
            Zero Latency. <span className="text-blue-600 font-bold">AI Native.</span> The ultimate payment pro experience.
          </p>
          <button 
            onClick={handleLogin}
            className="w-full py-5 bg-slate-900 text-white rounded-[2.5rem] font-bold flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-2xl active:scale-[0.98] text-lg"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 rounded-full bg-white p-0.5" />
            Start with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-white flex flex-col pb-32 relative selection:bg-blue-100 overflow-x-hidden">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-mesh rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">SkyPay</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all relative">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`p-1 rounded-full transition-all border-2 ${activeTab === 'profile' ? 'border-blue-500 scale-110' : 'border-transparent'}`}
          >
            <img src={user.photoURL || ''} className="w-9 h-9 rounded-full shadow-sm" alt="Profile" />
          </button>
        </div>
      </header>

      <main className="px-6 pt-6 flex-1 space-y-8">
        {activeTab === 'home' && (
          <>
            <div className="animate-in slide-in-from-top-4 duration-500">
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex items-center gap-5">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                    Pro Analysis <Sparkles className="w-3 h-3" />
                  </p>
                  <p className="text-sm font-bold text-slate-700 leading-tight">{aiInsight}</p>
                </div>
              </div>
            </div>

            <BalanceCard balance={user.balance} upiId={user.upiId} name={user.displayName || 'SkyPay User'} />

            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Send, label: 'Pay', color: 'blue', action: () => { setSelectedUpi(undefined); setIsTransferOpen(true); } },
                { icon: Scan, label: 'Scan', color: 'indigo', action: () => setIsScannerOpen(true) },
                { icon: QrCode, label: 'QR', color: 'purple', action: () => setIsQRModalOpen(true) },
                { icon: Plus, label: 'Add', color: 'emerald', action: () => alert("Add money coming soon!") },
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={item.action}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className={`w-16 h-16 bg-${item.color}-50 text-${item.color}-600 rounded-[1.75rem] flex items-center justify-center shadow-sm group-hover:bg-${item.color}-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-${item.color}-100 transition-all duration-300 active:scale-90`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800">Timeline</h3>
                <button className="text-xs font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-2xl">History</button>
              </div>
              {transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.slice(0, 6).map((tx) => (
                    <TransactionItem key={tx.id} transaction={tx} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                  <Zap className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="font-bold text-slate-400">No activity yet</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <StatsSection breakdown={spendingBreakdown} totalDebit={totalDebit} />
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="text-center bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100">
              <img src={user.photoURL || ''} className="w-24 h-24 rounded-[2.5rem] mx-auto mb-6 shadow-2xl border-4 border-white" alt="Big Profile" />
              <h2 className="text-2xl font-black text-slate-900">{user.displayName}</h2>
              <p className="text-blue-600 font-bold text-sm">{user.upiId}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Bank Accounts', icon: CreditCard, color: 'blue' },
                { icon: Fingerprint, label: 'Biometric Lock', color: 'indigo' },
                { icon: ShieldCheck, label: 'Security Lab', color: 'emerald' },
                { icon: LogOut, label: 'Sign Out', color: 'red', action: handleLogout },
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-${item.color || 'slate'}-50 text-${item.color || 'slate'}-600`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-black text-slate-800">{item.label}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Persistent Dock Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass border border-white/50 p-3 z-50 rounded-[2.5rem] shadow-2xl shadow-blue-500/10">
        <div className="flex items-center justify-around">
          <button 
            onClick={() => setActiveTab('home')}
            className={`p-4 rounded-[1.75rem] transition-all flex flex-col items-center ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <HomeIcon className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="w-16 h-16 gradient-mesh text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-400 border-[6px] border-white transition-transform hover:scale-110 active:scale-90 -mt-16"
          >
            <Scan className="w-8 h-8" />
          </button>

          <button 
            onClick={() => setActiveTab('stats')}
            className={`p-4 rounded-[1.75rem] transition-all flex flex-col items-center ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ChartIcon className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <TransferModal isOpen={isTransferOpen} onClose={() => { setIsTransferOpen(false); setSelectedUpi(undefined); }} senderUid={user.uid} initialUpiId={selectedUpi} />
      <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={(upi) => { setSelectedUpi(upi); setIsTransferOpen(true); }} />
      <QRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} upiId={user.upiId} name={user.displayName || ''} />
    </div>
  );
};

// Required Lucide icons not already in scope
import { CreditCard, Fingerprint, ShieldCheck } from 'lucide-react';

export default App;
