// app/account/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
  ArrowLeft,
  User,
  Package,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AccountPage() {
  const router = useRouter();
  const [dangerOpen, setDangerOpen] = useState(false);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-espresso-50 pt-12 pb-20">
        <div className="container-custom max-w-2xl">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-espresso-500 hover:text-espresso-950 mb-6 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>

          <div className="mb-10">
            <h1 className="text-3xl font-display font-bold text-espresso-950 mb-2">
              Account Settings
            </h1>
            <p className="text-espresso-500">Manage your account and preferences.</p>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => router.push('/orders')}
              className="group bg-white rounded-2xl border border-espresso-100 p-6 text-left hover:border-primary-300 hover:shadow-[0_20px_40px_-20px_rgba(42,34,31,0.15)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-espresso-50 group-hover:bg-primary-50 flex items-center justify-center mb-4 transition-colors">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <p className="font-display font-bold text-espresso-950 text-lg">
                My Orders
              </p>
              <p className="text-sm text-espresso-500 mt-1">
                View your purchase history
              </p>
            </button>

            <button
              onClick={() => router.push('/marketplace')}
              className="group bg-white rounded-2xl border border-espresso-100 p-6 text-left hover:border-primary-300 hover:shadow-[0_20px_40px_-20px_rgba(42,34,31,0.15)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-espresso-50 group-hover:bg-primary-50 flex items-center justify-center mb-4 transition-colors">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <p className="font-display font-bold text-espresso-950 text-lg">
                Marketplace
              </p>
              <p className="text-sm text-espresso-500 mt-1">
                Browse wigs and accessories
              </p>
            </button>
          </div>

          {/* Danger zone */}
          <div className="bg-white rounded-2xl border border-red-200 p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-espresso-950">
                  Delete Account
                </h2>
                <p className="text-sm text-espresso-500 mt-1 leading-relaxed">
                  Permanently delete your account and remove your personal data.
                  Your past orders will be anonymized but retained for legal and
                  accounting purposes. This action cannot be undone.
                </p>
              </div>
            </div>

            <button
              onClick={() => setDangerOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete my account
            </button>
          </div>

          {dangerOpen && (
            <DeleteAccountModal
              onClose={() => setDangerOpen(false)}
              onDeleted={() => {
                setDangerOpen(false);
                router.push('/?deleted=1');
              }}
            />
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete Account Confirmation Modal                                  */
/* ------------------------------------------------------------------ */
function DeleteAccountModal({
  onClose,
  onDeleted,
}: {
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText === 'DELETE';

  const handleDelete = async () => {
    if (!canDelete) return;

    setLoading(true);
    setError(null);

    try {
      const token =
        localStorage.getItem('authToken') ||
        localStorage.getItem('adminToken');
      if (!token) throw new Error('Not signed in');

      const res = await fetch('/api/auth/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirm: 'DELETE' }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Could not delete account');
      }

      localStorage.removeItem('authToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('marketplaceCart');

      onDeleted();
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-espresso-950">
                Delete your account?
              </h3>
              <p className="text-sm text-espresso-500 mt-1 leading-relaxed">
                This will permanently delete your account, cancel any active
                sessions, and anonymize your personal data. Your order history
                will be retained for legal purposes but will no longer be
                linked to your personal information.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-espresso-50 rounded-lg flex-shrink-0 transition-colors"
          >
            <X className="w-5 h-5 text-espresso-500" />
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
          <p className="text-sm text-red-700 leading-relaxed">
            <strong>This cannot be undone.</strong> You will be signed out and
            lose access to your order history immediately.
          </p>
        </div>

        <label className="block text-sm font-semibold text-espresso-900 mb-2">
          Type{' '}
          <code className="px-1.5 py-0.5 bg-espresso-50 border border-espresso-200 rounded text-red-600 font-bold">
            DELETE
          </code>{' '}
          to confirm
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
          placeholder="DELETE"
          disabled={loading}
          className="w-full border border-espresso-200 bg-espresso-50 rounded-lg p-3.5 mb-5 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 disabled:opacity-50 font-mono text-espresso-950 placeholder-espresso-400 transition-all"
          autoFocus
        />

        {error && (
          <div className="p-3.5 mb-5 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3.5 border border-espresso-200 rounded-xl font-bold text-espresso-700 hover:bg-espresso-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || loading}
            className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete forever
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}