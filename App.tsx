
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
        try {
          const profile = await createOrUpdateUser(
            fbUser.uid, 
            fbUser.email || 'user@skypay.internal', 
            fbUser.displayName || 'SkyPay User'
          );
          setUser(profile);
          
          // Listen to real-time updates
          const userSub = subscribeToUserProfile(fbUser.uid, setUser);
          const transSub = subscribeToTransactions(fbUser.uid, setTransactions);
          
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
          <div className="w-16 h-16 bg-blue-600 rounded-3xl animate-bounce flex items-center justify-center shadow-lg shadow-blue-200">
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
        <div className="max-w-md w-full">
          <div className="mb-8 flex justify-center">
            <div className="p-6 upi-gradient rounded-[2.5rem] shadow-2xl shadow-blue-300 animate-pulse">
              <CreditCard className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">SkyPay</h1>
          <p className="text-slate-500 text-lg mb-12 leading-relaxed font-medium px-4">
            Experience the future of payments. Join today and get <span className="text-blue-600 font-bold">₹30 bonus</span> instantly in your wallet.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-2xl active:scale-[0.98]"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 rounded-full bg-white p-0.5" />
              Continue with Google
            </button>
            <div className="flex items-center justify-center gap-8 mt-16 text-slate-400">
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-6 h-6 mb-2 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
              </div>
              <div className="flex flex-col items-center">
                <TrendingUp className="w-6 h-6 mb-2 text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Fast</span>
              </div>
              <div className="flex flex-col items-center">
                <QrCode className="w-6 h-6 mb-2 text-purple-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Unified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-[#f8fafc] flex flex-col pb-28 relative">
      {/* Top Header */}
      <header className="p-6 flex items-center justify-between bg-white/70 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 upi-gradient rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">SkyPay</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="User" className="w-8 h-8 rounded-xl" />
          </div>
          <button 
            onClick={handleLogout}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-slate-100"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="px-6 pt-6 overflow-y-auto flex-1">
        <BalanceCard balance={user.balance} upiId={user.upiId} name={user.displayName || 'SkyPay User'} />

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <button 
            onClick={() => { setSelectedUpi(undefined); setIsTransferOpen(true); }}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-blue-200 transition-all duration-300">
              <Send className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Send</span>
          </button>
          
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-200 transition-all duration-300">
              <Scan className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Scan</span>
          </button>

          <button 
            onClick={() => alert("Your QR Code feature coming soon!")}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover:bg-purple-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-purple-200 transition-all duration-300">
              <QrCode className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">QR Code</span>
          </button>

          <button className="flex flex-col items-center gap-3 group">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-[1.5rem] flex items-center justify-center shadow-sm border border-slate-100 transition-all opacity-40 cursor-not-allowed">
              <History className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Activity</span>
          </button>
        </div>

        {/* Recent Transactions Section */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Recent Activity</h3>
          <button className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-blue-100 transition-all">
            See All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-1 mb-8">
            {transactions.slice(0, 5).map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <History className="w-10 h-10 opacity-30" />
            </div>
            <p className="font-bold text-slate-400">Your transaction history is empty</p>
            <p className="text-xs text-slate-300">Make your first payment to see it here</p>
          </div>
        )}
      </main>

      {/* Persistent Bottom Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-effect border border-white/40 p-3 z-40 rounded-[2.5rem] shadow-2xl shadow-blue-500/20">
        <div className="flex items-center justify-around relative">
          <button className="p-3.5 text-blue-600 bg-blue-100/50 rounded-2xl flex flex-col items-center gap-1">
            <Sparkles className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
          </button>
          
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="w-16 h-16 upi-gradient text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-400 border-[6px] border-[#f8fafc] transition-transform hover:scale-105 active:scale-90 absolute left-1/2 -translate-x-1/2 -top-12"
          >
            <Scan className="w-8 h-8" />
          </button>

          <button 
            onClick={() => alert("Profile Settings Coming Soon")}
            className="p-3.5 text-slate-400 hover:text-blue-600 transition-colors flex flex-col items-center gap-1"
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Account</span>
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
