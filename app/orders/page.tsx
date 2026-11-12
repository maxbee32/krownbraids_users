// app/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Loader2,
  ChevronRight,
  ShoppingBag,
  AlertCircle,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RotateCw,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface OrderRow {
  id: number;
  orderNumber: string;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt?: string;
  fulfilledAt?: string;
  deliveredAt?: string;
  itemCount: number;
  firstItemName?: string;
  thumbnailUrl?: string;
  shippingCity?: string;
  shippingCountry?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const formatCurrency = (amount: number, currency = 'GBP') =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
  }).format(amount);

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};

const STATUS_META: Record<
  string,
  { label: string; style: string; icon: typeof Clock }
> = {
  PENDING_PAYMENT: {
    label: 'Awaiting payment',
    style: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  PAID: {
    label: 'Paid',
    style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  FULFILLED: {
    label: 'Shipped',
    style: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    style: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Refunded',
    style: 'bg-ink-50 text-ink-600 border-cream-200',
    icon: XCircle,
  },
};

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING_PAYMENT', label: 'Awaiting payment' },
  { value: 'PAID', label: 'Paid' },
  { value: 'FULFILLED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
];

function extractItems(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

const proxyImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (url.startsWith('/api/uploads/')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const prefixed = url.match(
    /(?:products|suppliers)\/([^/]+)\/([^/]+\.(?:jpe?g|png|webp|gif|avif|svg))$/i
  );
  if (prefixed) return `/api/uploads/${prefixed[1]}/${prefixed[2]}`;

  const bare = url.match(
    /^\/([^/]+)\/([^/]+\.(?:jpe?g|png|webp|gif|avif|svg))$/i
  );
  if (bare) return `/api/uploads/${bare[1]}/${bare[2]}`;

  return '';
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const token =
        localStorage.getItem('authToken') || localStorage.getItem('adminToken');

      if (!token) {
        router.push('/login?redirect=/orders');
        return;
      }

      const qs = statusFilter ? `?status=${statusFilter}` : '';
      const res = await fetch(`/api/auth/marketplace/orders${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to load orders (${res.status})`);
      }

      const json = await res.json();
      const raw = extractItems(json);

      setOrders(
        raw.map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          total: Number(o.total ?? 0),
          currency: o.currency ?? 'GBP',
          status: o.status ?? 'PENDING_PAYMENT',
          createdAt: o.createdAt ?? '',
          paidAt: o.paidAt,
          fulfilledAt: o.fulfilledAt,
          deliveredAt: o.deliveredAt,
          itemCount:
            o.itemCount ?? (Array.isArray(o.items) ? o.items.length : 0),
          firstItemName: o.firstItemName,
          thumbnailUrl: proxyImageUrl(o.thumbnailUrl),
          shippingCity: o.shippingCity,
          shippingCountry: o.shippingCountry,
        }))
      );
    } catch (err: any) {
      console.error('[orders] load failed:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, router]);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-cream-50 pt-8 pb-20">
        <div className="container-custom max-w-4xl">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-plum-700 hover:text-plum-900 mb-6 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold text-ink-900 mb-2">
              My Orders
            </h1>
            <p className="text-ink-500">Track your marketplace purchases.</p>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors ${
                  statusFilter === f.value
                    ? 'bg-plum-700 text-white border-plum-700'
                    : 'bg-white text-ink-700 border-cream-200 hover:border-plum-300'
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={loadOrders}
              disabled={loading}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-cream-200 text-ink-700 hover:border-plum-300 disabled:opacity-60"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>

          {/* Body */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-white border border-cream-200 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-cream-200">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-ink-900 font-semibold mb-1">
                Couldn&apos;t load orders
              </p>
              <p className="text-ink-500 text-sm mb-4">{error}</p>
              <button
                onClick={loadOrders}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-plum-700 text-white rounded-xl font-semibold text-sm hover:bg-plum-800"
              >
                Try again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-cream-200">
              <div className="w-16 h-16 rounded-full bg-plum-50 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-plum-300" />
              </div>
              <p className="text-ink-900 font-semibold mb-1">
                {statusFilter ? 'No orders with this status' : 'No orders yet'}
              </p>
              <p className="text-ink-500 text-sm mb-6">
                {statusFilter
                  ? 'Try a different filter or view all orders.'
                  : 'Your purchases will appear here.'}
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-plum-700 text-white rounded-xl font-semibold text-sm hover:bg-plum-800"
              >
                <ShoppingBag className="w-4 h-4" />
                Browse marketplace
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const meta =
                  STATUS_META[order.status] ?? STATUS_META.PENDING_PAYMENT;
                const Icon = meta.icon;

                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.orderNumber}`}
                    className="block bg-white rounded-2xl border border-cream-200 hover:border-plum-300 hover:shadow-sm transition-all overflow-hidden"
                  >
                    <div className="p-5 flex gap-4 items-center">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-xl bg-cream-100 overflow-hidden flex-shrink-0">
                        {order.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={order.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-7 h-7 text-ink-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-xs font-mono text-ink-500">
                            {order.orderNumber}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.style}`}
                          >
                            <Icon className="w-3 h-3" />
                            {meta.label}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-ink-900 truncate">
                          {order.firstItemName
                            ? `${order.firstItemName}${
                                order.itemCount > 1
                                  ? ` + ${order.itemCount - 1} more`
                                  : ''
                              }`
                            : `${order.itemCount} item${
                                order.itemCount !== 1 ? 's' : ''
                              }`}
                        </p>

                        <p className="text-xs text-ink-500 mt-1">
                          {formatDate(order.createdAt)}
                          {order.shippingCity && (
                            <> · Ships to {order.shippingCity}</>
                          )}
                        </p>
                      </div>

                      {/* Total + chevron */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-lg font-bold text-plum-700">
                            {formatCurrency(order.total, order.currency)}
                          </p>
                          {order.paidAt && (
                            <p className="text-[10px] text-ink-400">
                              Paid {formatDate(order.paidAt)}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-ink-300" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}