"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Wallet, ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';

export default function WalletHistoryPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    async function loadTransactions() {
      try {
        const data = await fetchApi('/users/me/wallet/transactions');
        setTransactions(data);
      } catch (err) {
        console.error('Failed to load wallet history', err);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, []);

  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await api.post('/users/me/redeem-coupon', { code: couponCode.trim().toUpperCase() });
      setCouponSuccess(res.data?.message || '₹500 added to your wallet!');
      setCouponCode('');
      // Reload transactions to show the new credit
      const data = await fetchApi('/users/me/wallet/transactions');
      setTransactions(data);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid or expired coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Wallet History</h1>
          <p className="text-sm text-gray-500 mt-1">Track your earnings and spending.</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-emerald-50 font-bold uppercase tracking-widest text-xs mb-1">Available Balance</p>
            <h2 className="text-4xl md:text-5xl font-black flex items-center">
              <IndianRupee className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
              {(user?.walletBalance ?? 0).toLocaleString('en-IN')}
            </h2>
          </div>
        </div>
        
        <div className="relative z-10 w-full md:w-auto bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <form onSubmit={handleRedeemCoupon} className="flex flex-col gap-2">
            <label className="text-xs font-bold text-emerald-50 uppercase tracking-wider">Have a Coupon?</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full md:w-48 bg-white/20 border border-white/30 rounded-xl px-4 py-2.5 text-white placeholder-emerald-100 font-bold focus:outline-none focus:ring-2 focus:ring-white/50 uppercase"
              />
              <button
                type="submit"
                disabled={couponLoading || !couponCode.trim()}
                className="bg-white text-emerald-600 px-4 py-2.5 rounded-xl font-black hover:bg-emerald-50 transition-colors disabled:opacity-70"
              >
                {couponLoading ? '...' : 'Redeem'}
              </button>
            </div>
            {couponError && <p className="text-red-200 text-xs font-bold mt-1">{couponError}</p>}
            {couponSuccess && <p className="text-white text-xs font-bold mt-1">{couponSuccess}</p>}
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-black text-gray-900">Recent Transactions</h3>
        </div>
        
        {loading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-3 w-24 bg-gray-100 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No transactions yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'CREDIT';
              return (
                <div key={tx._id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      isCredit ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
                    }`}>
                      {isCredit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{tx.description || (isCredit ? 'Wallet Credited' : 'Wallet Debited')}</p>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-black whitespace-nowrap ${isCredit ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {isCredit ? '+' : '-'} ?{tx.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
