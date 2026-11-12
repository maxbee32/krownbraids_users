// app/marketplace/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  ArrowLeftIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  status: string;
  createdAt: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
}

interface CheckoutSession {
  clientSecret: string;
  sessionId: string;
  orderId: number;
  orderNumber: string;
  total: number;
  currency: string;
}

interface AddressOption {
  line_1: string;
  line_2: string;
  post_town: string;
  postcode: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A–Z" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);

const proxyImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("/api/uploads/")) return url;
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("data:")) return url;

  const suppliersIdx = url.indexOf("/images/suppliers/");
  if (suppliersIdx !== -1) {
    const rest = url.substring(suppliersIdx + "/images/suppliers/".length);
    const clean = rest.startsWith("products/")
      ? rest.slice("products/".length)
      : rest;
    return `/api/uploads/${clean}`;
  }

  const uploadsProductsIdx = url.indexOf("/uploads/products/");
  if (uploadsProductsIdx !== -1) {
    return `/api/uploads/${url.substring(
      uploadsProductsIdx + "/uploads/products/".length
    )}`;
  }

  if (url.startsWith("/uploads/")) return `/api${url}`;
  if (url.startsWith("uploads/")) return `/api/${url}`;

  const bareMatch = url.match(
    /^\/?([a-zA-Z0-9_-]+)\/([^/]+\.(?:jpe?g|png|webp|gif|avif|svg))$/i
  );
  if (bareMatch) {
    return `/api/uploads/${bareMatch[1]}/${bareMatch[2]}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  return url;
};

function extractItems(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

/* ------------------------------------------------------------------ */
/*  Postcode lookup (Ideal Postcodes)                                  */
/* ------------------------------------------------------------------ */
function PostcodeLookup({
  postalCode,
  disabled,
  onApply,
}: {
  postalCode: string;
  disabled?: boolean;
  onApply: (patch: {
    address: string;
    city: string;
    postalCode: string;
  }) => void;
}) {
  const [addresses, setAddresses] = useState<AddressOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async () => {
    const cleaned = postalCode.trim().replace(/\s+/g, "");
    if (!cleaned) {
      setError("Enter a postcode first");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_IDEAL_POSTCODES_API_KEY;
    if (!apiKey) {
      setError("Address lookup is not configured — please enter manually.");
      return;
    }

    setLoading(true);
    setError(null);
    setAddresses([]);

    try {
      const res = await fetch(
        `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(
          cleaned
        )}?api_key=${apiKey}`
      );

      if (!res.ok) {
        setError("Could not find addresses for that postcode");
        return;
      }

      const json = await res.json();
      const results = json?.result ?? [];

      if (!results.length) {
        setError("No addresses found for that postcode");
        return;
      }

      const options: AddressOption[] = results.map((r: any) => ({
        line_1: r.line_1 || "",
        line_2: r.line_2 || "",
        post_town: r.post_town || "",
        postcode: r.postcode || "",
      }));

      setAddresses(options);

      if (options.length === 1) {
        applyAddress(options[0]);
      }
    } catch (err) {
      console.error("Postcode lookup failed:", err);
      setError("Address lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyAddress = (addr: AddressOption) => {
    onApply({
      address: [addr.line_1, addr.line_2].filter(Boolean).join(", "),
      city: addr.post_town,
      postalCode: addr.postcode,
    });
    setAddresses([]);
    setError(null);
  };

  return (
    <>
      <div className="mb-3">
        <label className="block text-sm font-medium text-espresso-900 mb-1.5">
          Postcode
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={postalCode}
            onChange={(e) =>
              onApply({ address: "", city: "", postalCode: e.target.value })
            }
            onBlur={lookup}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                lookup();
              }
            }}
            placeholder="e.g. AB1 2CD"
            disabled={disabled || loading}
            autoComplete="postal-code"
            className="flex-1 border border-espresso-200 rounded-lg p-3 outline-none focus:border-primary-400 disabled:opacity-50 text-espresso-950"
          />
          <button
            type="button"
            onClick={lookup}
            disabled={disabled || loading}
            className="px-4 py-3 bg-espresso-50 border border-espresso-200 rounded-lg text-sm font-medium hover:bg-espresso-100 disabled:opacity-50 whitespace-nowrap text-espresso-900"
          >
            {loading ? "Searching…" : "Find address"}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      </div>

      {addresses.length > 1 && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-espresso-900 mb-1.5">
            Select address ({addresses.length} found)
          </label>
          <select
            onChange={(e) => {
              const idx = parseInt(e.target.value, 10);
              if (!isNaN(idx)) applyAddress(addresses[idx]);
            }}
            defaultValue=""
            className="w-full border border-espresso-200 rounded-lg p-3 outline-none focus:border-primary-400 text-espresso-950"
          >
            <option value="" disabled>
              Choose an address…
            </option>
            {addresses.map((a, i) => (
              <option key={i} value={i}>
                {[a.line_1, a.line_2].filter(Boolean).join(", ")} — {a.post_town}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function MarketplacePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Checkout state
  const [shippingOpen, setShippingOpen] = useState(false);
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [shipping, setShipping] = useState<ShippingAddress>({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "United Kingdom",
    notes: "",
  });

  /* ---------- Load products ---------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        const pRes = await fetch("/api/auth/marketplace/products", { cache: "no-store" });
        
        const pJson = await pRes.json();
        const rawP = extractItems(pJson);

        setProducts(
          rawP.map((p: any) => ({
            id: String(p.id ?? p.productId),
            name: p.name ?? p.title ?? "",
            description: p.description ?? "",
            category: p.category ?? p.categoryName ?? "",
            price: Number(p.price ?? p.unitPrice ?? 0),
            stockQuantity: p.stockQuantity ?? 100,
            imageUrl: proxyImageUrl(p.imageUrl ?? p.image),
            status: p.status ?? "ACTIVE",
            createdAt: p.createdAt ?? "",
          }))
        );

        try {
          const cRes = await fetch("/api/auth/cat", { cache: "no-store" });
          if (cRes.ok) {
            const cJson = await cRes.json();
            const rawC = extractItems(cJson);
            setCategories(
              rawC.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            );
          }
        } catch (catErr) {
          console.warn("[marketplace] categories failed (non-critical):", catErr);
        }
      } catch (err: any) {
        console.error("[marketplace] load failed:", err);
        setProductsError(err.message || "Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };
    loadData();
  }, []);

  /* ---------- Persist cart ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("marketplaceCart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("marketplaceCart", JSON.stringify(cart));
  }, [cart]);

  /* ---------- Filter & sort ---------- */
  const filtered = useMemo(() => {
    let result = [...products];
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          p.category.toLowerCase().includes(t)
      );
    }
    if (selectedCategory !== "all") {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    return result;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const addToCart = (product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      return [...prev, { product, quantity: qty }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === id
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== id));
  };

  /* ---------- Checkout ---------- */
  const startCheckout = async () => {
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("adminToken");
    if (!token) {
      router.push("/login?redirect=/marketplace");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/auth/marketplace/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((c) => ({
            productId: c.product.id,
            quantity: c.quantity,
          })),
          shippingName: shipping.name,
          shippingPhone: shipping.phone,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingPostalCode: shipping.postalCode,
          shippingCountry: shipping.country,
          shippingNotes: shipping.notes || null,
        }),
      });

      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || json.message || "Checkout failed");

      setShippingOpen(false);
      setCheckoutSession({
        clientSecret: json.clientSecret,
        sessionId: json.sessionId,
        orderId: json.orderId,
        orderNumber: json.orderNumber,
        total: Number(json.total),
        currency: json.currency ?? "GBP",
      });
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  /* ============================================================ */
  return (
    <main className="min-h-screen bg-espresso-50 pb-24">
      
      {/* ─── Page Header ─── */}
      <section className="bg-espresso-950 pt-12 pb-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.08]">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-espresso-600 rounded-full blur-3xl" />
        </div>

        <div className="relative container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 font-medium transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to home
              </button>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight mb-3">
                Hair & Beauty <span className="text-primary-400">Shop</span>
              </h1>
              <p className="text-base text-espresso-200/70 leading-relaxed max-w-xl">
                Trade prices from vetted UK wholesalers. Browse our full
                collection of wigs, tools, and accessories.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/orders")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-white font-semibold text-sm hover:bg-white/20 transition-all"
              >
                <ArchiveBoxIcon className="w-5 h-5" />
                My Orders
              </button>
              <button
                onClick={() => setCartOpen(true)}
                className="relative bg-primary-500 hover:bg-primary-400 text-espresso-950 px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary-500/20"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                Cart
                {cartCount > 0 && (
                  <span className="bg-espresso-950 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Search & Filters (Overlapping the header) ─── */}
      <section className="relative -mt-12 z-10 container-custom">
        <div className="bg-white rounded-2xl shadow-xl shadow-espresso-950/5 border border-espresso-100 p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-400" />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-espresso-50 rounded-xl border-none focus:ring-2 focus:ring-primary-500/20 outline-none text-espresso-950 placeholder-espresso-500 font-medium transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-espresso-50 rounded-xl border-none outline-none text-espresso-950 font-medium focus:ring-2 focus:ring-primary-500/20 cursor-pointer min-w-[200px]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ─── Categories ─── */}
      {categories.length > 0 && (
        <section className="container-custom pt-8 pb-4">
          <div className="flex overflow-x-auto gap-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all ${
                selectedCategory === "all"
                  ? "bg-espresso-950 text-white border-espresso-950 shadow-md"
                  : "bg-white text-espresso-600 border-espresso-200 hover:border-primary-300"
              }`}
            >
              All Products
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-all ${
                  selectedCategory === c.name
                    ? "bg-espresso-950 text-white border-espresso-950 shadow-md"
                    : "bg-white text-espresso-600 border-espresso-200 hover:border-primary-300"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ─── Product Grid ─── */}
      <section className="container-custom pt-6">
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-3xl bg-espresso-100/50 animate-pulse aspect-[4/5]"
              />
            ))}
          </div>
        ) : productsError ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-espresso-100">
            <p className="text-red-500 mb-2">{productsError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary-600 font-medium hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-espresso-100 max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-espresso-50 flex items-center justify-center">
              <ShoppingBagIcon className="w-10 h-10 text-espresso-300" />
            </div>
            <h3 className="text-xl font-display font-bold text-espresso-950 mb-2">
              No products found
            </h3>
            <p className="text-espresso-500 mb-6">
              We couldn't find any products matching your current filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="px-6 py-2.5 bg-espresso-950 text-white font-semibold rounded-xl hover:bg-primary-500 hover:text-espresso-950 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-3xl border border-espresso-100 overflow-hidden hover:border-primary-300 hover:shadow-[0_20px_40px_-20px_rgba(42,34,31,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/3] bg-espresso-50 overflow-hidden">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                </div>

                {/* Product Content */}
                <div className="p-5 flex-1 flex flex-col">
                  {product.category && (
                    <p className="text-[10px] font-bold text-primary-600 mb-1.5 uppercase tracking-wider">
                      {product.category}
                    </p>
                  )}
                  <h3 className="font-display font-bold text-espresso-950 line-clamp-2 leading-tight text-lg group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xl font-bold text-espresso-950 mt-2">
                    {formatCurrency(product.price)}
                  </p>
                  
                  <div className="mt-auto pt-5">
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-espresso-50 hover:bg-espresso-950 hover:text-white border border-espresso-100 text-espresso-900 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 
        ============================================================
        CART DRAWER
        ============================================================
      */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-espresso-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-espresso-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-display font-bold text-espresso-950">Your Cart</h2>
                <p className="text-xs text-espresso-500 mt-1">{cartCount} items</p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 bg-espresso-50 hover:bg-espresso-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-espresso-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBagIcon className="w-12 h-12 text-espresso-200 mx-auto mb-4" />
                  <p className="text-espresso-950 font-semibold">Your cart is empty</p>
                  <p className="text-sm text-espresso-500 mt-1">Add some products to get started.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 items-center border-b border-espresso-50 pb-4"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-espresso-50 flex-shrink-0 relative">
                      <Image
                        src={item.product.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-espresso-950 line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-primary-600 font-bold mt-1">
                        {formatCurrency(item.product.price)}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-espresso-200 rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1.5 text-espresso-600 hover:bg-espresso-50 hover:text-espresso-950 transition-colors"
                          >
                            <MinusIcon className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs px-3 font-semibold text-espresso-950">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1.5 text-espresso-600 hover:bg-espresso-50 hover:text-espresso-950 transition-colors"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-espresso-100 bg-espresso-50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-semibold text-espresso-500 uppercase tracking-wider">Subtotal</span>
                  <span className="text-2xl font-display font-bold text-espresso-950">{formatCurrency(cartSubtotal)}</span>
                </div>
                <button
                  onClick={() => setShippingOpen(true)}
                  className="w-full bg-espresso-950 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-500 hover:text-espresso-950 transition-colors shadow-lg shadow-espresso-950/10"
                >
                  Checkout
                </button>
                <p className="text-center text-xs text-espresso-400 mt-4 flex items-center justify-center gap-1.5">
                  Secure checkout powered by Stripe
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 
        ============================================================
        SHIPPING MODAL
        ============================================================
      */}
      {shippingOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-espresso-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl my-8">
            <h2 className="text-2xl font-display font-bold text-espresso-950 mb-6">Shipping Details</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={shipping.name}
                onChange={(e) =>
                  setShipping({ ...shipping, name: e.target.value })
                }
                className="w-full border border-espresso-200 rounded-xl p-3.5 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all text-espresso-950 placeholder-espresso-400"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={shipping.phone}
                onChange={(e) =>
                  setShipping({ ...shipping, phone: e.target.value })
                }
                className="w-full border border-espresso-200 rounded-xl p-3.5 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all text-espresso-950 placeholder-espresso-400"
              />

              <PostcodeLookup
                postalCode={shipping.postalCode}
                disabled={checkoutLoading}
                onApply={(patch) => {
                  if (patch.address) {
                    setShipping((prev) => ({
                      ...prev,
                      address: patch.address,
                      city: patch.city,
                      postalCode: patch.postalCode,
                    }));
                  } else {
                    setShipping((prev) => ({
                      ...prev,
                      postalCode: patch.postalCode,
                    }));
                  }
                }}
              />

              <input
                type="text"
                placeholder="Address"
                value={shipping.address}
                onChange={(e) =>
                  setShipping({ ...shipping, address: e.target.value })
                }
                className="w-full border border-espresso-200 rounded-xl p-3.5 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all text-espresso-950 placeholder-espresso-400"
              />
              <input
                type="text"
                placeholder="City"
                value={shipping.city}
                onChange={(e) =>
                  setShipping({ ...shipping, city: e.target.value })
                }
                className="w-full border border-espresso-200 rounded-xl p-3.5 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all text-espresso-950 placeholder-espresso-400"
              />

              <textarea
                placeholder="Delivery notes (optional)"
                value={shipping.notes}
                onChange={(e) =>
                  setShipping({ ...shipping, notes: e.target.value })
                }
                rows={2}
                className="w-full border border-espresso-200 rounded-xl p-3.5 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all resize-none text-espresso-950 placeholder-espresso-400"
              />
            </div>

            {checkoutError && (
              <div className="p-3 mt-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">{checkoutError}</p>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShippingOpen(false)}
                className="flex-1 py-3.5 border border-espresso-200 rounded-xl font-bold text-espresso-600 hover:bg-espresso-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startCheckout}
                disabled={checkoutLoading}
                className="flex-1 py-3.5 bg-espresso-950 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-primary-500 hover:text-espresso-950 transition-colors"
              >
                {checkoutLoading ? "Processing..." : "Continue to Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ============================================================
        STRIPE CHECKOUT MODAL
        ============================================================
      */}
      {checkoutSession && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-espresso-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg my-8 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-espresso-100 flex justify-between items-center bg-espresso-50">
              <div>
                <h2 className="text-lg font-display font-bold text-espresso-950">Complete Payment</h2>
                <p className="text-xs text-espresso-500 mt-0.5">
                  Order #{checkoutSession.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setCheckoutSession(null)}
                className="p-2 bg-white hover:bg-espresso-100 rounded-full transition-colors shadow-sm"
              >
                <XMarkIcon className="w-5 h-5 text-espresso-600" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{
                  clientSecret: checkoutSession.clientSecret,
                  onComplete: async () => {
                    setCart([]);
                    setCheckoutSession(null);

                    const sessionId = checkoutSession?.sessionId;
                    if (sessionId) {
                      for (let i = 0; i < 10; i++) {
                        try {
                          const r = await fetch(
                            `/api/auth/stripe/verify/${sessionId}`,
                            { cache: "no-store" }
                          );
                          if (r.ok) {
                            const d = await r.json();
                            if (
                              d.status === "SUCCESS" ||
                              d.status === "PAID"
                            ) {
                              break;
                            }
                          }
                        } catch {}
                        await new Promise((res) => setTimeout(res, 1500));
                      }
                    }

                    router.push("/orders");
                  },
                }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}