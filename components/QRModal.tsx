
import React from 'react';
import { X, Share2, Download } from 'lucide-react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  upiId: string;
  name: string;
}

const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, upiId, name }) => {
  if (!isOpen) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-[3rem] overflow-hidden p-8 shadow-2xl text-center">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-slate-100 rounded-full">
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <div className="mb-8 mt-4">
          <h3 className="text-2xl font-black text-slate-900 leading-none mb-2">My QR Code</h3>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Share to receive money</p>
        </div>

        <div className="bg-slate-50 p-6 rounded-[2.5rem] mb-8 flex justify-center border-2 border-slate-100">
          <img src={qrUrl} alt="UPI QR" className="w-48 h-48 rounded-2xl shadow-inner" />
        </div>

        <div className="mb-8">
          <p className="text-lg font-black text-slate-800 tracking-tight">{name}</p>
          <p className="text-xs font-bold text-slate-400">{upiId}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">
            <Download className="w-4 h-4" /> Save
          </button>
          <button className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
