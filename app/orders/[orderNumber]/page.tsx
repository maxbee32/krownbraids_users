// app/orders/[orderNumber]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface OrderItem {
  productId: string;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface OrderDetail {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  fulfilledAt: string | null;
  deliveredAt?: string | null;
  paymentReference: string | null;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingNotes?: string;
  items: OrderItem[];
  trackingNumber?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const formatCurrency = (amount: number, currency = 'GBP') =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
  }).format(amount);

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

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

function trackingUrl(trackingNumber: string | null | undefined): string | null {
  if (!trackingNumber) return null;
  const t = trackingNumber.toUpperCase().trim();

  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(t))
    return `https://www.royalmail.com/track-your-item#/tracking-results/${t}`;
  if (/^\d{14}$/.test(t)) return `https://track.dpd.co.uk/parcels/${t}`;
  if (/^\d{16}$/.test(t)) return `https://www.evri.com/track/parcel/${t}`;
  if (/^1Z[A-Z0-9]{16}$/.test(t)) return `https://www.ups.com/track?tracknum=${t}`;
  if (/^\d{12}$/.test(t)) return `https://www.fedex.com/fedextrack/?trknbr=${t}`;

  return null;
}

function statusLabel(status: string): string {
  switch (status?.toUpperCase()) {
    case 'PENDING_PAYMENT': return 'Awaiting payment';
    case 'PAID':            return 'Paid';
    case 'FULFILLED':       return 'Shipped';
    case 'DELIVERED':       return 'Delivered';
    case 'CANCELLED':       return 'Cancelled';
    case 'REFUNDED':        return 'Refunded';
    default:                return status ?? '—';
  }
}

function statusStyle(status: string): string {
  switch (status?.toUpperCase()) {
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'FULFILLED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'PAID':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PENDING_PAYMENT':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CANCELLED':
    case 'REFUNDED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-cream-50 text-ink-600 border-cream-200';
  }
}

function StatusIcon({ status }: { status: string }) {
  const cls = 'w-3.5 h-3.5';
  switch (status?.toUpperCase()) {
    case 'DELIVERED': return <CheckCircle2 className={cls} />;
    case 'FULFILLED': return <Truck className={cls} />;
    case 'PAID':
    case 'PENDING_PAYMENT': return <Clock className={cls} />;
    case 'CANCELLED':
    case 'REFUNDED': return <XCircle className={cls} />;
    default: return <Clock className={cls} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  /* Load order */
  useEffect(() => {
    if (!orderNumber) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token =
          localStorage.getItem('authToken') ||
          localStorage.getItem('adminToken');
        if (!token) {
          router.push(`/login?redirect=/orders/${orderNumber}`);
          return;
        }

        const res = await fetch(
          `/api/auth/marketplace/orders/${encodeURIComponent(orderNumber)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }
        );

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || 'Order not found');
        }
        setOrder(await res.json());
      } catch (err: any) {
        setError(err.message || 'Could not load order');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderNumber, router]);

  /* Confirm receipt */
  const handleConfirmReceived = async () => {
    if (!order) return;
    setConfirming(true);
    setConfirmError(null);

    try {
      const token =
        localStorage.getItem('authToken') || localStorage.getItem('adminToken');

      const res = await fetch(
        `/api/auth/marketplace/orders/${encodeURIComponent(
          order.orderNumber
        )}/confirm-received`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token ?? ''}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed to confirm receipt (${res.status})`);
      }

      // Refetch
      const refreshed = await fetch(
        `/api/auth/marketplace/orders/${encodeURIComponent(order.orderNumber)}`,
        {
          headers: { Authorization: `Bearer ${token ?? ''}` },
          cache: 'no-store',
        }
      );
      if (refreshed.ok) setOrder(await refreshed.json());
    } catch (err: any) {
      setConfirmError(err.message ?? 'Could not confirm receipt');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cream-50 pt-8 pb-20">
          <div className="container-custom max-w-4xl text-center py-20">
            <Loader2 className="w-8 h-8 text-plum-700 animate-spin mx-auto mb-3" />
            <p className="text-ink-500 text-sm">Loading order…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cream-50 pt-8 pb-20">
          <div className="container-custom max-w-4xl">
            <button
              onClick={() => router.push('/orders')}
              className="inline-flex items-center gap-2 text-plum-700 hover:text-plum-900 mb-6 font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              All orders
            </button>
            <div className="text-center py-16 bg-white rounded-2xl border border-cream-200">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-ink-900 font-semibold mb-1">
                {error ?? 'Order not found'}
              </p>
              <Link
                href="/orders"
                className="text-plum-700 text-sm font-medium hover:underline mt-3 inline-block"
              >
                Back to orders
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const shipped = !!order.fulfilledAt;
  const delivered =
    order.status?.toUpperCase() === 'DELIVERED' || !!order.deliveredAt;
  const courierLink = trackingUrl(order.trackingNumber);
  const canConfirm =
    !delivered && order.status?.toUpperCase() === 'FULFILLED';

  return (
    <>
      <Header />

      <main className="min-h-screen bg-cream-50 pt-8 pb-20">
        <div className="container-custom max-w-4xl">
          <button
            onClick={() => router.push('/orders')}
            className="inline-flex items-center gap-2 text-plum-700 hover:text-plum-900 mb-6 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All orders
          </button>

          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-ink-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-ink-500 text-sm mt-1">
                Placed {formatDate(order.createdAt)}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border self-start sm:self-auto ${statusStyle(
                order.status
              )}`}
            >
              <StatusIcon status={order.status} />
              {statusLabel(order.status)}
            </span>
          </div>

          {/* On the way / Delivered banner */}
          {shipped && (
            <div
              className={`mb-6 rounded-2xl border p-5 ${
                delivered
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    delivered
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {delivered ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Truck className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-ink-900">
                    {delivered ? 'Order delivered' : 'Your order is on the way'}
                  </h2>
                  <p className="text-sm text-ink-600 mt-1">
                    Dispatched {formatDate(order.fulfilledAt)}
                  </p>
                  {delivered && (
                    <p className="text-sm text-ink-600 mt-0.5">
                      Confirmed received {formatDate(order.deliveredAt)}
                    </p>
                  )}
                  {order.trackingNumber && (
                    <p className="text-sm text-ink-600 mt-1">
                      Tracking:{' '}
                      {courierLink ? (
                        <a
                          href={courierLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-plum-700 font-mono font-semibold hover:underline"
                        >
                          {order.trackingNumber}
                        </a>
                      ) : (
                        <span className="text-plum-700 font-mono font-semibold">
                          {order.trackingNumber}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Confirm receipt CTA */}
          {canConfirm && (
            <div className="mb-6 p-5 rounded-2xl bg-white border border-cream-200">
              <h2 className="text-sm font-semibold text-ink-900 mb-2">
                Received your order?
              </h2>
              <p className="text-xs text-ink-500 mb-3">
                Confirming receipt lets the supplier know the goods arrived safely
                and releases their payout.
              </p>
              {confirmError && (
                <p className="text-xs text-red-600 mb-2">{confirmError}</p>
              )}
              <button
                onClick={handleConfirmReceived}
                disabled={confirming}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold bg-plum-700 text-white hover:bg-plum-800 disabled:opacity-60"
              >
                {confirming ? 'Confirming…' : 'Confirm Receipt'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left column: items + shipping */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl bg-white border border-cream-200 p-5">
                <h2 className="text-sm font-semibold text-ink-900 mb-4">Items</h2>
                <div className="space-y-3">
                  {order.items.map((item, i) => {
                    const src = proxyImageUrl(item.imageUrl);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg bg-cream-100 flex-shrink-0 overflow-hidden">
                          {src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={src}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-ink-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-900 truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-ink-500">
                            {item.quantity} × {formatCurrency(item.unitPrice, order.currency)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-ink-900 tabular-nums">
                          {formatCurrency(item.lineTotal, order.currency)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-cream-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-plum-700" />
                  <h2 className="text-sm font-semibold text-ink-900">Shipping to</h2>
                </div>
                <p className="text-sm font-medium text-ink-900">{order.shippingName}</p>
                <p className="text-sm text-ink-600 mt-1">{order.shippingAddress}</p>
                <p className="text-sm text-ink-600">
                  {order.shippingCity}, {order.shippingPostalCode}
                </p>
                <p className="text-sm text-ink-600">{order.shippingCountry}</p>
                {order.shippingNotes && (
                  <p className="text-xs text-ink-500 mt-2 italic">
                    Note: {order.shippingNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Right column: summary + timeline */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-cream-200 p-5">
                <h2 className="text-sm font-semibold text-ink-900 mb-3">Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-500">Subtotal</span>
                    <span className="text-ink-900">
                      {formatCurrency(order.subtotal, order.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-500">Shipping</span>
                    <span className="text-ink-900">
                      {formatCurrency(order.shipping, order.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-cream-200">
                    <span className="font-semibold text-ink-900">Total</span>
                    <span className="font-bold text-plum-700">
                      {formatCurrency(order.total, order.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-cream-200 p-5">
                <h2 className="text-sm font-semibold text-ink-900 mb-3">Timeline</h2>
                <div className="space-y-3 text-xs">
                  <TimelineStep
                    label="Order placed"
                    date={formatDate(order.createdAt)}
                    done
                  />
                  {order.paidAt && (
                    <TimelineStep
                      label="Payment confirmed"
                      date={formatDate(order.paidAt)}
                      done
                    />
                  )}
                  {order.fulfilledAt && (
                    <TimelineStep
                      label="Shipped"
                      date={formatDate(order.fulfilledAt)}
                      done
                    />
                  )}
                  {delivered && (
                    <TimelineStep
                      label="Delivered"
                      date={formatDate(order.deliveredAt)}
                      done
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline step                                                      */
/* ------------------------------------------------------------------ */
function TimelineStep({
  label,
  date,
  done,
}: {
  label: string;
  date: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <div
        className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
          done ? 'bg-emerald-500' : 'bg-ink-200'
        }`}
      />
      <div>
        <p className="text-ink-900 font-medium">{label}</p>
        <p className="text-ink-500 mt-0.5">{date}</p>
      </div>
    </div>
  );
}