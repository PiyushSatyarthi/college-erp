import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function AlertDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  isDestructive = false
}: AlertDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex gap-4 mb-4">
             {isDestructive && (
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                   <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
             )}
             <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h2>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {description}
                </div>
             </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl flex items-center justify-end gap-2">
           <Button variant="outline" onClick={onClose}>{cancelText}</Button>
           <Button 
             className={isDestructive ? 'bg-red-600 hover:bg-red-700 text-white' : ''} 
             onClick={() => { onConfirm(); onClose(); }}
           >
             {confirmText}
           </Button>
        </div>
      </div>
    </div>
  );
}
