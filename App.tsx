
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
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
  TrendingUp
} from 'lucide-react';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebaseConfig';
import { createOrUpdateUser, subscribeToUserProfile, subscribeToTransactions } from './services/paymentService';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await createOrUpdateUser(fbUser.uid, fbUser.email!, fbUser.displayName!);
        setUser(profile);
        
        // Listen to real-time updates
        const userSub = subscribeToUserProfile(fbUser.uid, setUser);
        const transSub = subscribeToTransactions(fbUser.uid, setTransactions);
        
        setAuthLoading(false);
        return () => {
          userSub();
          transSub();
        };
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const openPaymentWithUpi = (upi: string) => {
    setSelectedUpi(upi);
    setIsTransferOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl animate-bounce flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-400 font-bold animate-pulse">Initializing Secure Gateway...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <div className="mb-8 flex justify-center">
            <div className="p-5 upi-gradient rounded-[2rem] shadow-2xl shadow-blue-200">
              <CreditCard className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">SkyPay</h1>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">
            Fast, secure, and rewarding UPI payments. Join today and get <span className="text-blue-600 font-bold">₹30 bonus</span> instantly.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98]"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 rounded-full bg-white" />
              Continue with Google
            </button>
            <div className="flex items-center justify-center gap-6 mt-12 text-slate-400">
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure</span>
              </div>
              <div className="flex flex-col items-center">
                <TrendingUp className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Instant</span>
              </div>
              <div className="flex flex-col items-center">
                <QrCode className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest">UPI Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-[#f8fafc] flex flex-col pb-24">
      {/* Top Header */}
      <header className="p-6 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 upi-gradient rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">SkyPay</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
            <img src={user.photoURL || ''} alt="User" className="w-7 h-7 rounded-lg" />
          </div>
          <button 
            onClick={handleLogout}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors border border-slate-100"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-6 pt-2 overflow-y-auto flex-1">
        {/* Balance Area */}
        <BalanceCard balance={user.balance} upiId={user.upiId} name={user.displayName || 'SkyPay User'} />

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => { setSelectedUpi(undefined); setIsTransferOpen(true); }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Send className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-600">Pay</span>
          </button>
          
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Scan className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-600">Scan</span>
          </button>

          <button 
            onClick={() => alert("Your QR Code feature coming soon!")}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all">
              <QrCode className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-600">My QR</span>
          </button>

          <button className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 transition-all opacity-50 cursor-not-allowed">
              <History className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400">History</span>
          </button>
        </div>

        {/* Recent Transactions Section */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Recent Activity</h3>
          <button className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
            See All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-1">
            {transactions.slice(0, 5).map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <History className="w-8 h-8" />
            </div>
            <p className="font-bold text-sm">No transactions yet</p>
          </div>
        )}
      </main>

      {/* Persistent Bottom Nav (Mobile Inspired) */}
      <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-slate-200/50 p-4 max-w-lg mx-auto z-40 rounded-t-[2.5rem] shadow-2xl shadow-blue-500/10">
        <div className="flex items-center justify-around">
          <button className="p-3 text-blue-600 bg-blue-50 rounded-2xl flex flex-col items-center gap-1">
            <Sparkles className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
          </button>
          <div className="relative -top-10">
             <button 
              onClick={() => setIsScannerOpen(true)}
              className="w-16 h-16 upi-gradient text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-400 border-4 border-white transition-transform hover:scale-110 active:scale-95"
            >
              <Scan className="w-8 h-8" />
            </button>
          </div>
          <button 
            onClick={() => alert("Profile Settings Coming Soon")}
            className="p-3 text-slate-400 hover:text-blue-600 transition-colors flex flex-col items-center gap-1"
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Account</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <TransferModal 
        isOpen={isTransferOpen} 
        onClose={() => { setIsTransferOpen(false); setSelectedUpi(undefined); }} 
        senderUid={user.uid}
        initialUpiId={selectedUpi}
      />
      <ScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={openPaymentWithUpi}
      />
    </div>
  );
};

export default App;
