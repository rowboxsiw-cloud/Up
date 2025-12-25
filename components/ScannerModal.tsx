
import React, { useState } from 'react';
import { X, Camera, Image as ImageIcon } from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (upiId: string) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mocking QR scan from image for stability in this environment
    // Real logic would use a QR decoding library on the file
    alert("In a real app, this would decode the QR code from the image. For demo, we'll try a common UPI ID.");
    onScanSuccess("demo@skypay");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
        
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Camera className="w-10 h-10 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-2">Scan QR Code</h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">Point your camera at a SkyPay or any UPI QR code to make an instant payment.</p>
        
        <div className="space-y-4">
          <button 
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all"
            onClick={() => {
              alert("Starting camera... (Permissions required)");
            }}
          >
            <Camera className="w-5 h-5" /> Open Camera
          </button>
          
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <button className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-200 transition-all">
              <ImageIcon className="w-5 h-5" /> Upload from Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
