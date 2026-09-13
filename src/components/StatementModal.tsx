import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Briefcase, 
  Search, 
  Filter, 
  Download,
  Calendar
} from 'lucide-react';
import { WalletTransaction, Language, Currency } from '../types';

interface StatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: WalletTransaction[];
  language: Language;
  currency: Currency;
  darkMode: boolean;
}

export const StatementModal: React.FC<StatementModalProps> = ({
  isOpen,
  onClose,
  transactions,
  language,
  currency,
  darkMode
}) => {
  const isBn = language === 'bn';
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal' | 'earning' | 'campaign_spend'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const safeTransactions = transactions || [];
  const filtered = safeTransactions.filter(trx => {
    if (filterType !== 'all' && trx.type !== filterType) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return trx.title.toLowerCase().includes(q) || (trx.titleBn && trx.titleBn.toLowerCase().includes(q)) || (trx.trxId && trx.trxId.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className={`w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden my-6 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                {isBn ? 'অ্যাকাউন্ট স্টেটমেন্ট ও ট্রানজেকশন হিস্ট্রি' : 'Account Statement & Activity Log'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {filtered.length} {isBn ? 'টি লেনদেন রেকর্ড' : 'transaction records listed'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
          <div className="relative w-full sm:flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isBn ? 'সার্চ করুন (TrxID বা বিবরণ)...' : 'Search by title or TrxID...'}
              className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs outline-hidden ${
                darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap cursor-pointer transition ${
                filterType === 'all' 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('deposit')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap cursor-pointer transition ${
                filterType === 'deposit' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setFilterType('withdrawal')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap cursor-pointer transition ${
                filterType === 'withdrawal' 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Withdraw
            </button>
            <button
              onClick={() => setFilterType('earning')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap cursor-pointer transition ${
                filterType === 'earning' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Earnings
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 sm:p-4">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-xs text-slate-400">
              {isBn ? 'কোনো লেনদেন রেকর্ড পাওয়া যায়নি।' : 'No transactions found matching your criteria.'}
            </p>
          ) : (
            filtered.map((trx) => {
              const isIncome = trx.type === 'deposit' || trx.type === 'earning';
              return (
                <div key={trx.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome 
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600' 
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                    }`}>
                      {trx.type === 'deposit' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : trx.type === 'earning' ? (
                        <Receipt className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {isBn ? trx.titleBn : trx.title}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(trx.timestamp).toLocaleString()}</span>
                        {trx.trxId && (
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-[10px]">
                            Trx: {trx.trxId}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-black text-sm block ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {isIncome ? '+' : '-'} ৳{(trx.amountBDT ?? 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      (${(trx.amountUSD ?? 0).toFixed(2)} USD)
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
