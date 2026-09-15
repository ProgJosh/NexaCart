'use client';

/* oxlint-disable next/no-img-element, jsx-a11y/label-has-associated-control */

import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  Edit3,
  Gift,
  Headphones,
  Heart,
  Home,
  LayoutDashboard,
  LoaderCircle,
  LogIn,
  LogOut,
  Menu,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  addCartItem,
  calculateTotals,
  currency,
  filterCatalog,
  generateEntityId,
  generateOrderId,
  productStatus,
  resolveMockRole,
  sanitizeText,
  setOrderStatus,
  LEGACY_STORE_KEY,
  PHP_RATE,
  STORE_KEY,
  validateAddress,
  validateStock,
  wait,
} from '@/lib/ecommerce-service';
import {
  initialCustomers,
  initialOrders,
  initialProducts,
  initialPromotions,
  monthlySales,
  reviews,
} from '@/lib/mock-data';
import type {
  Address,
  CartItem,
  Customer,
  Order,
  OrderStatus,
  PersistedStore,
  Product,
  Promotion,
  UserProfile,
} from '@/types/ecommerce';

type StoreView =
  | 'home'
  | 'catalog'
  | 'product'
  | 'wishlist'
  | 'checkout'
  | 'confirmation'
  | 'login'
  | 'profile'
  | 'orders'
  | 'admin';

type AdminView =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'promotions'
  | 'reports';
type Notice = { type: 'success' | 'error'; message: string } | null;
type ConfirmAction = {
  title: string;
  description: string;
  action: () => void;
} | null;
type CatalogRequest = {
  search: string;
  category: string;
  sort: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  saleOnly: boolean;
  title: string;
};

const defaultCatalogRequest: CatalogRequest = {
  search: '',
  category: 'All',
  sort: 'featured',
  saleOnly: false,
  title: 'Discover your next great find',
};

const seedStore: PersistedStore = {
  cart: [],
  wishlist: [],
  orders: initialOrders,
  products: initialProducts,
  promotions: initialPromotions,
  customers: initialCustomers,
  categories: ['Audio', 'Home', 'Travel', 'Wellness', 'Workspace'],
  brands: ['Aster', 'Hearth', 'Keystone', 'North & Field', 'Sonora', 'Still'],
  user: null,
};

const emptyAddress: Address = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Philippines',
};

const fieldClass =
  'h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20';

const salesConfig = {
  sales: { label: 'Sales', color: 'var(--chart-1)' },
  orders: { label: 'Orders', color: 'var(--chart-2)' },
} satisfies ChartConfig;

function statusTone(status: OrderStatus) {
  if (status === 'Delivered') return 'bg-emerald-100 text-emerald-800';
  if (status === 'Shipped') return 'bg-sky-100 text-sky-800';
  if (status === 'Processing') return 'bg-amber-100 text-amber-800';
  if (status === 'Cancelled') return 'bg-red-100 text-red-700';
  return 'bg-stone-100 text-stone-700';
}

function ProductCard({
  product,
  wished,
  onOpen,
  onWishlist,
  onAdd,
}: {
  product: Product;
  wished: boolean;
  onOpen: () => void;
  onWishlist: () => void;
  onAdd: () => void;
}) {
  const status = productStatus(product);
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;
  const sold = Math.max(24, product.reviewCount * 11);
  return (
    <Card
      className="group overflow-hidden border bg-card py-0 shadow-sm ring-0 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      data-testid={`product-${product.id}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <button className="h-full w-full" onClick={onOpen} type="button">
          <img
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.035]"
            loading="lazy"
            src={product.images[0]}
          />
        </button>
        {product.compareAt && (
          <Badge className="absolute left-0 top-3 rounded-l-none bg-destructive px-2.5 text-white">
            -{discount}%
          </Badge>
        )}
        {!product.compareAt && product.featured && (
          <Badge className="absolute left-0 top-3 rounded-l-none bg-secondary text-secondary-foreground">
            Top pick
          </Badge>
        )}
        <Button
          aria-label={`${wished ? 'Remove' : 'Add'} ${product.name} ${wished ? 'from' : 'to'} wishlist`}
          className="absolute right-2 top-2 rounded-full bg-background/95 shadow-sm"
          onClick={onWishlist}
          size="icon"
          variant="ghost"
        >
          <Heart className={wished ? 'fill-current text-destructive' : ''} />
        </Button>
      </div>
      <CardContent className="flex min-h-48 flex-col px-3 py-3 sm:px-4">
        <button
          className="line-clamp-2 min-h-10 text-left text-sm font-medium leading-5 hover:text-primary"
          onClick={onOpen}
          type="button"
        >
          {product.name}
        </button>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold text-primary">
            {currency(product.price)}
          </span>
          {product.compareAt && (
            <span className="text-xs text-muted-foreground line-through">
              {currency(product.compareAt)}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="size-3 fill-current text-amber-500" />{' '}
            {product.rating}
          </span>
          <span>{sold.toLocaleString('en-PH')} sold</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
          <Badge
            className="h-5 border-primary/20 bg-primary/5 px-1.5 text-primary"
            variant="outline"
          >
            Free shipping
          </Badge>
          <span className="text-muted-foreground">Metro Manila</span>
        </div>
        {status === 'Low stock' && (
          <p className="mt-2 text-xs font-semibold text-amber-700">
            Only {product.stock} left
          </p>
        )}
        <Button
          className="mt-auto h-9 w-full rounded-lg"
          disabled={product.stock === 0}
          onClick={onAdd}
          size="sm"
        >
          <ShoppingCart />{' '}
          {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
        </Button>
      </CardContent>
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-xs text-destructive">{message}</p>
  ) : null;
}

export function EcommerceApp() {
  const [store, setStore] = useState<PersistedStore>(seedStore);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<StoreView>('home');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [selectedProductId, setSelectedProductId] = useState('P-1001');
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [catalogRequest, setCatalogRequest] = useState<CatalogRequest>(
    defaultCatalogRequest,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved =
          window.localStorage.getItem(STORE_KEY) ??
          window.localStorage.getItem(LEGACY_STORE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<PersistedStore>;
          setStore({ ...seedStore, ...parsed });
        }
      } catch {
        setNotice({
          type: 'error',
          message:
            'Saved shopping data could not be loaded. A fresh session was started.',
        });
      }
      setLoaded(true);
    }, 420);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      const route = window.location.hash.replace(/^#\/?/, '');
      if (route.startsWith('product/')) {
        setSelectedProductId(route.slice('product/'.length));
        setView('product');
        return;
      }
      const allowed: StoreView[] = [
        'home',
        'catalog',
        'wishlist',
        'checkout',
        'confirmation',
        'login',
        'profile',
        'orders',
        'admin',
      ];
      setView(
        allowed.includes(route as StoreView) ? (route as StoreView) : 'home',
      );
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }, [store, loaded]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const activeProducts = store.products.filter((product) => !product.archived);
  const cartCount = store.cart.reduce((sum, item) => sum + item.quantity, 0);
  const selectedProduct =
    store.products.find((product) => product.id === selectedProductId) ??
    activeProducts[0];

  const navigate = (next: StoreView, productId?: string) => {
    if (productId) setSelectedProductId(productId);
    setView(next);
    setMobileOpen(false);
    const hash =
      next === 'product' && productId ? `#product/${productId}` : `#${next}`;
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCatalog = (request: Partial<CatalogRequest> = {}) => {
    const next = { ...defaultCatalogRequest, ...request };
    setCatalogRequest(next);
    setGlobalSearch(next.search);
    navigate('catalog');
  };

  const submitGlobalSearch = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanSearch = sanitizeText(globalSearch, 80);
    openCatalog({
      search: cleanSearch,
      title: cleanSearch
        ? `Results for “${cleanSearch}”`
        : defaultCatalogRequest.title,
    });
  };

  const toast = (
    message: string,
    type: NonNullable<Notice>['type'] = 'success',
  ) => setNotice({ message, type });

  const toggleWishlist = (productId: string) => {
    const wished = store.wishlist.includes(productId);
    setStore((current) => ({
      ...current,
      wishlist: wished
        ? current.wishlist.filter((id) => id !== productId)
        : [...current.wishlist, productId],
    }));
    toast(wished ? 'Removed from your wishlist.' : 'Saved to your wishlist.');
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    variant: Record<string, string> = {},
  ) => {
    try {
      const cart = addCartItem(store.cart, product, quantity, variant);
      setStore((current) => ({ ...current, cart }));
      toast(`${product.name} added to your bag.`);
      return true;
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : 'This item could not be added.',
        'error',
      );
      return false;
    }
  };

  const updateCart = (index: number, quantity: number) => {
    const item = store.cart[index];
    const product = store.products.find((entry) => entry.id === item.productId);
    if (!product) return;
    if (quantity < 1) {
      setStore((current) => ({
        ...current,
        cart: current.cart.filter((_, itemIndex) => itemIndex !== index),
      }));
      return;
    }
    if (quantity > product.stock) {
      toast(`Only ${product.stock} available.`, 'error');
      return;
    }
    setStore((current) => ({
      ...current,
      cart: current.cart.map((entry, itemIndex) =>
        itemIndex === index ? { ...entry, quantity } : entry,
      ),
    }));
  };

  const renderHeader = () => (
    <>
      <div className="bg-primary px-4 py-2 text-center text-xs font-semibold tracking-wide text-primary-foreground">
        Free standard shipping on orders over {currency(75)} · Easy 30-day
        returns
      </div>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center gap-5 px-4 sm:px-6 lg:px-10">
          <Button
            aria-label="Open menu"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            size="icon"
            variant="ghost"
          >
            <Menu />
          </Button>
          <button
            className="flex items-center gap-2 font-heading text-2xl font-black tracking-[-0.05em]"
            onClick={() => navigate('home')}
            type="button"
          >
            <img
              alt=""
              className="size-9 object-contain"
              src="/nexacart-icon.png"
            />
            Nexa<span className="text-primary">Cart</span>
          </button>
          <nav
            className="ml-8 hidden items-center gap-7 text-sm font-medium lg:flex"
            aria-label="Main navigation"
          >
            <button
              className="hover:text-primary"
              onClick={() =>
                openCatalog({ sort: 'newest', title: 'New arrivals' })
              }
              type="button"
            >
              New arrivals
            </button>
            <button
              className="hover:text-primary"
              onClick={() => openCatalog()}
              type="button"
            >
              Shop
            </button>
            <button
              className="hover:text-primary"
              onClick={() => navigate('wishlist')}
              type="button"
            >
              Wishlist
            </button>
            <button
              className="font-semibold text-destructive"
              onClick={() =>
                openCatalog({
                  saleOnly: true,
                  title: 'Deals worth checking out',
                })
              }
              type="button"
            >
              Sale
            </button>
          </nav>
          <form
            aria-label="Sitewide product search"
            className="ml-auto hidden max-w-md flex-1 items-center overflow-hidden rounded-xl border-2 border-primary bg-background md:flex"
            onSubmit={submitGlobalSearch}
          >
            <Search className="ml-3 size-4 text-muted-foreground" />
            <input
              aria-label="Search products"
              className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search products, brands, categories..."
              value={globalSearch}
            />
            <Button
              aria-label="Submit search"
              className="h-10 rounded-none px-4"
              type="submit"
            >
              <Search />
            </Button>
          </form>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Button
              aria-label="Your account"
              onClick={() => navigate(store.user ? 'profile' : 'login')}
              size="icon"
              variant="ghost"
            >
              <UserRound />
            </Button>
            <Button
              aria-label="Wishlist"
              className="hidden sm:inline-flex"
              onClick={() => navigate('wishlist')}
              size="icon"
              variant="ghost"
            >
              <Heart />
            </Button>
            <Button
              aria-label={`Shopping cart with ${cartCount} items`}
              className="relative"
              onClick={() => setCartOpen(true)}
              size="icon"
              variant="ghost"
            >
              <ShoppingBag />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>
      <form
        aria-label="Sitewide product search"
        className="flex items-center border-b bg-background px-4 py-2 md:hidden"
        onSubmit={submitGlobalSearch}
      >
        <div className="flex flex-1 items-center overflow-hidden rounded-xl border-2 border-primary bg-background">
          <Search className="ml-3 size-4 text-muted-foreground" />
          <input
            aria-label="Search products"
            className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
            onChange={(event) => setGlobalSearch(event.target.value)}
            placeholder="Search NexaCart"
            value={globalSearch}
          />
          <Button
            aria-label="Submit search"
            className="h-10 rounded-none px-4"
            type="submit"
          >
            <Search />
          </Button>
        </div>
      </form>
    </>
  );

  const renderHome = () => {
    const featured = activeProducts
      .filter((product) => product.featured)
      .slice(0, 4);
    const categories = [
      { name: 'Audio', icon: Headphones, tone: 'bg-orange-50 text-orange-900' },
      {
        name: 'Workspace',
        icon: Sparkles,
        tone: 'bg-violet-50 text-violet-900',
      },
      { name: 'Travel', icon: ShoppingBag, tone: 'bg-blue-50 text-blue-900' },
      { name: 'Wellness', icon: Heart, tone: 'bg-rose-50 text-rose-900' },
    ];
    return (
      <>
        <section className="mx-auto max-w-[1440px] px-4 pt-5 sm:px-6 lg:px-10">
          <div className="relative min-h-[500px] overflow-hidden rounded-3xl bg-[#171342] text-white lg:min-h-[560px]">
            <img
              alt="Refined everyday essentials arranged in a warm modern living space"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
              src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1800&q=90"
            />
            <div className="absolute inset-0 bg-[#171342]/72" />
            <div className="relative flex min-h-[500px] max-w-2xl flex-col justify-center px-7 py-16 sm:px-12 lg:min-h-[560px] lg:px-20">
              <Badge
                className="mb-6 h-7 border-orange-200/40 bg-orange-500/90 px-3 text-white"
                variant="outline"
              >
                NexaCart Payday Picks · Up to 35% off
              </Badge>
              <h1 className="font-heading text-5xl font-bold leading-[.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Great finds.
                <br />
                <span className="text-orange-300">Better every day.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/85 sm:text-lg">
                Trusted tech, home, travel, and wellness finds—easy to discover,
                securely checked out, and delivered across the Philippines.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  className="h-12 rounded-xl bg-primary px-6 text-white hover:bg-primary/90"
                  onClick={() => openCatalog()}
                  size="lg"
                >
                  Shop now <ArrowRight />
                </Button>
                <Button
                  className="h-12 rounded-xl border-white/40 bg-white/10 px-6 text-white hover:bg-white/20"
                  onClick={() =>
                    openCatalog({ saleOnly: true, title: 'Payday deals' })
                  }
                  size="lg"
                  variant="outline"
                >
                  See today’s deals
                </Button>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-xs font-medium text-white/80">
                <span className="flex items-center gap-2">
                  <Truck className="size-4" /> Fast delivery
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="size-4" /> Secure checkout
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-5">
            {categories.map(({ name, icon: Icon, tone }) => (
              <button
                key={name}
                className={`${tone} group flex items-center justify-between rounded-2xl border border-transparent px-5 py-5 text-left transition hover:-translate-y-0.5 hover:border-current/10 hover:shadow-md`}
                onClick={() =>
                  openCatalog({ category: name, title: `${name} picks` })
                }
                type="button"
              >
                <span className="flex items-center gap-3 font-semibold">
                  <Icon className="size-5" />
                  {name}
                </span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-10">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                NexaCart recommends
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                Flash finds
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fast-moving favorites with trusted ratings and local delivery.
              </p>
            </div>
            <Button
              className="hidden rounded-xl sm:inline-flex"
              onClick={() => openCatalog()}
              variant="outline"
            >
              View all <ArrowRight />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 lg:gap-6">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wished={store.wishlist.includes(product.id)}
                onAdd={() => addToCart(product)}
                onOpen={() => navigate('product', product.id)}
                onWishlist={() => toggleWishlist(product.id)}
              />
            ))}
          </div>
        </section>
        <section className="mx-auto mb-24 grid max-w-[1360px] overflow-hidden rounded-3xl bg-orange-50 md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <Badge className="mb-5 w-fit bg-primary text-primary-foreground">
              Nexa Rewards
            </Badge>
            <h2 className="font-heading text-4xl font-semibold tracking-tight">
              More value in every cart.
            </h2>
            <p className="mt-4 max-w-md leading-7 text-muted-foreground">
              Create a NexaCart account for faster checkout, saved finds, early
              deal access, and 10% off your first order.
            </p>
            <Button
              className="mt-7 w-fit rounded-xl"
              onClick={() => navigate('login')}
            >
              Join Nexa Rewards <ArrowRight />
            </Button>
          </div>
          <img
            alt="A warm minimal room with carefully selected furnishings"
            className="h-full min-h-80 w-full object-cover"
            loading="lazy"
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=88"
          />
        </section>
      </>
    );
  };

  const renderCatalog = () => (
    <CatalogView
      key={JSON.stringify(catalogRequest)}
      initialRequest={catalogRequest}
      products={activeProducts}
      wishlist={store.wishlist}
      onAdd={addToCart}
      onOpen={(id) => navigate('product', id)}
      onWishlist={toggleWishlist}
    />
  );

  const renderProduct = () =>
    selectedProduct ? (
      <ProductDetail
        key={selectedProduct.id}
        product={selectedProduct}
        wished={store.wishlist.includes(selectedProduct.id)}
        onAdd={addToCart}
        onBack={() => navigate('catalog')}
        onWishlist={() => toggleWishlist(selectedProduct.id)}
      />
    ) : null;

  const renderWishlist = () => {
    const wishedProducts = activeProducts.filter((product) =>
      store.wishlist.includes(product.id),
    );
    return (
      <section className="mx-auto min-h-[65vh] max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Saved for later
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">
          My wishlist
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your favorite finds, ready when you are.
        </p>
        {wishedProducts.length ? (
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 lg:gap-6">
            {wishedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wished
                onAdd={() => addToCart(product)}
                onOpen={() => navigate('product', product.id)}
                onWishlist={() => toggleWishlist(product.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Your wishlist is ready for inspiration"
            copy="Save products you love and they’ll appear here."
            action="Explore products"
            onAction={() => navigate('catalog')}
          />
        )}
      </section>
    );
  };

  const renderFooter = () => (
    <footer className="border-t bg-[#171342] text-white">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-5 lg:px-10">
        <div className="lg:col-span-2">
          <p className="flex items-center gap-2 font-heading text-2xl font-black tracking-[-0.05em]">
            <img
              alt=""
              className="size-10 object-contain"
              src="/nexacart-icon.png"
            />
            NexaCart
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
            Great finds for modern Filipino life, backed by secure checkout,
            clear prices, and dependable delivery.
          </p>
          <form
            className="mt-6 flex max-w-sm overflow-hidden rounded-xl bg-white/10 p-1"
            onSubmit={(event) => {
              event.preventDefault();
              toast('You’re subscribed to NexaCart deals.');
              event.currentTarget.reset();
            }}
          >
            <input
              aria-label="Email for newsletter"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-white/50"
              placeholder="Email address"
              required
              type="email"
            />
            <Button
              className="rounded-lg bg-white text-[#171342]"
              type="submit"
            >
              Subscribe
            </Button>
          </form>
        </div>
        <div>
          <h3 className="font-semibold">Shop</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            {['New arrivals', 'Home', 'Workspace', 'Travel'].map((link) => (
              <button
                className="w-fit hover:text-white"
                key={link}
                onClick={() =>
                  openCatalog(
                    link === 'New arrivals'
                      ? { sort: 'newest', title: link }
                      : { category: link, title: `${link} picks` },
                  )
                }
                type="button"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Help</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            <button
              className="w-fit hover:text-white"
              onClick={() =>
                toast(
                  'Standard shipping is free; express delivery is available at checkout.',
                )
              }
              type="button"
            >
              Delivery & returns
            </button>
            <button
              className="w-fit hover:text-white"
              onClick={() => toast('Support: help@nexacart.test')}
              type="button"
            >
              Contact
            </button>
            <button
              className="w-fit hover:text-white"
              onClick={() =>
                toast(
                  'Your cart, payment, delivery, and return details are shown during checkout.',
                )
              }
              type="button"
            >
              FAQs
            </button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Account</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            <button
              className="w-fit hover:text-white"
              onClick={() => navigate(store.user ? 'profile' : 'login')}
              type="button"
            >
              My profile
            </button>
            <button
              className="w-fit hover:text-white"
              onClick={() => navigate('orders')}
              type="button"
            >
              My orders
            </button>
            <button
              className="w-fit hover:text-white"
              onClick={() => navigate('wishlist')}
              type="button"
            >
              My wishlist
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/50">
        © 2026 NexaCart Marketplace. Secure mock commerce experience for
        demonstration.
      </div>
    </footer>
  );

  const goToCheckout = () => {
    if (!store.cart.length) {
      toast('Your bag is empty. Add an item before checkout.', 'error');
      setCartOpen(false);
      navigate('catalog');
      return;
    }
    const stockError = validateStock(store.cart, store.products);
    if (stockError) {
      toast(stockError, 'error');
      return;
    }
    setCartOpen(false);
    navigate('checkout');
  };

  let content;
  if (view === 'home') content = renderHome();
  else if (view === 'catalog') content = renderCatalog();
  else if (view === 'product') content = renderProduct();
  else if (view === 'wishlist') content = renderWishlist();
  else if (view === 'checkout')
    content = (
      <CheckoutView
        store={store}
        setStore={setStore}
        onBack={() => navigate('catalog')}
        onComplete={(order) => {
          setLastOrder(order);
          navigate('confirmation');
        }}
        toast={toast}
      />
    );
  else if (view === 'confirmation')
    content = (
      <ConfirmationView
        order={lastOrder}
        onOrders={() => navigate('orders')}
        onShop={() => navigate('catalog')}
      />
    );
  else if (view === 'login')
    content = (
      <AuthView
        store={store}
        setStore={setStore}
        onAuthenticated={(user) =>
          navigate(user.role === 'admin' ? 'admin' : 'profile')
        }
        toast={toast}
      />
    );
  else if (view === 'profile' || view === 'orders')
    content = (
      <AccountView
        initialTab={view === 'orders' ? 'orders' : 'profile'}
        store={store}
        setStore={setStore}
        onLogin={() => navigate('login')}
        onShop={() => navigate('catalog')}
        toast={toast}
      />
    );
  else
    content = (
      <AdminPanel
        adminView={adminView}
        setAdminView={setAdminView}
        store={store}
        setStore={setStore}
        onLogin={() => navigate('login')}
        onStorefront={() => navigate('home')}
        setConfirmAction={setConfirmAction}
        toast={toast}
      />
    );

  return (
    <main className="min-h-screen bg-background text-foreground">
      {view !== 'admin' && renderHeader()}
      {content}
      {view !== 'admin' &&
        view !== 'checkout' &&
        view !== 'confirmation' &&
        renderFooter()}
      <CartDrawer
        open={cartOpen}
        setOpen={setCartOpen}
        cart={store.cart}
        products={store.products}
        promotions={store.promotions}
        updateCart={updateCart}
        onCheckout={goToCheckout}
      />
      <MobileMenu
        open={mobileOpen}
        setOpen={setMobileOpen}
        user={store.user}
        navigate={(next) =>
          next === 'catalog' ? openCatalog() : navigate(next)
        }
      />
      {notice && (
        <div
          aria-live="polite"
          className={`fixed bottom-5 left-1/2 z-[80] flex w-[min(92%,420px)] -translate-x-1/2 items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-800'}`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="size-5 shrink-0" />
          ) : (
            <AlertTriangle className="size-5 shrink-0" />
          )}
          <span className="font-medium">{notice.message}</span>
          <button
            aria-label="Dismiss notification"
            className="ml-auto"
            onClick={() => setNotice(null)}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      {!loaded && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-background">
          <div className="text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <ShoppingBag />
            </div>
            <LoaderCircle className="mx-auto mt-5 size-5 animate-spin text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Preparing your shop…</p>
          </div>
        </div>
      )}
      <AlertDialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                confirmAction?.action();
                setConfirmAction(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function EmptyState({
  icon: Icon,
  title,
  copy,
  action,
  onAction,
}: {
  icon: typeof Heart;
  title: string;
  copy: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="mx-auto mt-16 flex max-w-lg flex-col items-center rounded-3xl border border-dashed bg-card px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </span>
      <h2 className="mt-5 font-heading text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
      <Button className="mt-6 rounded-full" onClick={onAction}>
        {action} <ArrowRight />
      </Button>
    </div>
  );
}

function MobileMenu({
  open,
  setOpen,
  user,
  navigate,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: UserProfile | null;
  navigate: (view: StoreView) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-[88%] max-w-sm" side="left">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2 font-heading text-xl font-black">
            <img
              alt=""
              className="size-8 object-contain"
              src="/nexacart-icon.png"
            />
            NexaCart
          </SheetTitle>
          <SheetDescription>Explore the marketplace</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col p-3">
          {[
            { label: 'Home', icon: Home, view: 'home' },
            { label: 'Shop all', icon: Store, view: 'catalog' },
            { label: 'Wishlist', icon: Heart, view: 'wishlist' },
            { label: 'My orders', icon: Package, view: 'orders' },
            {
              label: 'Account',
              icon: UserRound,
              view: user ? 'profile' : 'login',
            },
            { label: 'Admin demo', icon: LayoutDashboard, view: 'admin' },
          ].map(({ label, icon: Icon, view }) => (
            <button
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left font-medium hover:bg-muted"
              key={label}
              onClick={() => navigate(view as StoreView)}
              type="button"
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function CartDrawer({
  open,
  setOpen,
  cart,
  products,
  promotions,
  updateCart,
  onCheckout,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  cart: CartItem[];
  products: Product[];
  promotions: Promotion[];
  updateCart: (index: number, quantity: number) => void;
  onCheckout: () => void;
}) {
  const totals = calculateTotals(cart, products, 'Standard', '', promotions);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="border-b px-5 py-5">
          <SheetTitle className="text-lg">Your bag</SheetTitle>
          <SheetDescription>
            {cart.length
              ? `${cart.reduce((sum, item) => sum + item.quantity, 0)} item${cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? '' : 's'} reserved for checkout`
              : 'Your bag is currently empty'}
          </SheetDescription>
        </SheetHeader>
        {cart.length ? (
          <>
            <div className="flex-1 space-y-1 overflow-y-auto p-5">
              {cart.map((item, index) => {
                const product = products.find(
                  (entry) => entry.id === item.productId,
                );
                if (!product) return null;
                return (
                  <div
                    className="flex gap-4 border-b py-5"
                    key={`${product.id}-${JSON.stringify(item.variant)}-${index}`}
                  >
                    <img
                      alt={product.name}
                      className="size-24 rounded-xl object-cover"
                      src={product.images[0]}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {Object.values(item.variant ?? {}).join(' · ') ||
                              product.category}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {currency(product.price * item.quantity)}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center rounded-full border">
                          <Button
                            aria-label={`Decrease ${product.name} quantity`}
                            onClick={() => updateCart(index, item.quantity - 1)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <Minus />
                          </Button>
                          <span className="w-7 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            aria-label={`Increase ${product.name} quantity`}
                            onClick={() => updateCart(index, item.quantity + 1)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <Plus />
                          </Button>
                        </div>
                        <Button
                          aria-label={`Remove ${product.name}`}
                          onClick={() => updateCart(index, 0)}
                          size="icon-sm"
                          variant="ghost"
                        >
                          <Trash2 className="text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <SheetFooter className="border-t bg-muted/30 p-5">
              <div className="mb-1 flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">
                  {currency(totals.subtotal)}
                </span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Taxes and delivery are calculated at checkout.
              </p>
              <Button className="h-12 w-full rounded-full" onClick={onCheckout}>
                Secure checkout <ArrowRight />
              </Button>
              <Button
                className="w-full"
                onClick={() => setOpen(false)}
                variant="ghost"
              >
                Continue shopping
              </Button>
            </SheetFooter>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-muted">
                <ShoppingCart className="size-7 text-muted-foreground" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-semibold">
                Your bag is waiting
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add something considered and useful.
              </p>
              <Button
                className="mt-6 rounded-full"
                onClick={() => setOpen(false)}
              >
                Continue shopping
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CatalogView({
  initialRequest,
  products,
  wishlist,
  onAdd,
  onOpen,
  onWishlist,
}: {
  initialRequest: CatalogRequest;
  products: Product[];
  wishlist: string[];
  onAdd: (product: Product) => void;
  onOpen: (id: string) => void;
  onWishlist: (id: string) => void;
}) {
  const [search, setSearch] = useState(initialRequest.search);
  const [category, setCategory] = useState(initialRequest.category);
  const [price, setPrice] = useState('all');
  const [sort, setSort] = useState(initialRequest.sort);
  const [inStock, setInStock] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 8;
  const categories = [
    'All',
    ...Array.from(new Set(products.map((product) => product.category))),
  ];
  const filtered = useMemo(() => {
    const result = filterCatalog(products, {
      search,
      category,
      price: price as 'all' | 'under75' | '75to125' | 'over125',
      inStock,
      sort,
    });
    return initialRequest.saleOnly
      ? result.filter((product) => Boolean(product.compareAt))
      : result;
  }, [
    products,
    search,
    category,
    price,
    sort,
    inStock,
    initialRequest.saleOnly,
  ]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );
  const changeFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };
  const clear = () => {
    setSearch('');
    setCategory('All');
    setPrice('all');
    setInStock(false);
    setSort('featured');
    setPage(1);
  };
  return (
    <section className="mx-auto min-h-[70vh] max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            NexaCart marketplace
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {initialRequest.title}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Compare trusted finds, check real-time stock, and shop confidently
            in Philippine pesos.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {filtered.length} products
        </p>
      </div>
      <div className="mt-9 flex items-center rounded-2xl border bg-card px-4 shadow-sm md:hidden">
        <Search className="size-4 text-muted-foreground" />
        <input
          aria-label="Search catalog"
          className="h-12 w-full bg-transparent px-3 text-sm outline-none"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search products..."
          value={search}
        />
      </div>
      <div className="mt-8 grid gap-9 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block">
          <div className="flex items-center gap-2 border-b pb-4 font-semibold">
            <SlidersHorizontal className="size-4" /> Filters
          </div>
          <div className="border-b py-6">
            <h2 className="text-sm font-semibold">Category</h2>
            <div className="mt-3 space-y-1">
              {categories.map((item) => (
                <button
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm ${category === item ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  key={item}
                  onClick={() => changeFilter(setCategory, item)}
                  type="button"
                >
                  <span>{item}</span>
                  <span className="text-xs opacity-60">
                    {item === 'All'
                      ? products.length
                      : products.filter((product) => product.category === item)
                          .length}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="border-b py-6">
            <label className="text-sm font-semibold" htmlFor="price-filter">
              Price
            </label>
            <select
              className={`${fieldClass} mt-3`}
              id="price-filter"
              onChange={(event) => changeFilter(setPrice, event.target.value)}
              value={price}
            >
              <option value="all">All prices</option>
              <option value="under75">Under {currency(75)}</option>
              <option value="75to125">
                {currency(75)}–{currency(125)}
              </option>
              <option value="over125">Over {currency(125)}</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-3 border-b py-6 text-sm font-medium">
            <input
              checked={inStock}
              className="size-4 accent-[var(--primary)]"
              onChange={(event) => {
                setInStock(event.target.checked);
                setPage(1);
              }}
              type="checkbox"
            />{' '}
            In stock only
          </label>
          <Button className="mt-5 px-0" onClick={clear} variant="link">
            Clear all filters
          </Button>
        </aside>
        <div>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="hidden max-w-md flex-1 items-center rounded-xl border bg-card px-3 md:flex">
              <Search className="size-4 text-muted-foreground" />
              <input
                aria-label="Search catalog"
                className="h-11 w-full bg-transparent px-3 text-sm outline-none"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by product, brand, or category"
                value={search}
              />
            </div>
            <div className="flex gap-2 lg:hidden">
              <select
                aria-label="Filter category"
                className={`${fieldClass} min-w-0 flex-1`}
                onChange={(event) =>
                  changeFilter(setCategory, event.target.value)
                }
                value={category}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <label className="flex shrink-0 items-center gap-2 rounded-xl border px-3 text-xs">
                <input
                  checked={inStock}
                  onChange={(event) => setInStock(event.target.checked)}
                  type="checkbox"
                />{' '}
                In stock
              </label>
            </div>
            <select
              aria-label="Sort products"
              className={`${fieldClass} sm:w-48`}
              onChange={(event) =>
                setSort(event.target.value as CatalogRequest['sort'])
              }
              value={sort}
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="rating">Top rated</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </div>
          {visible.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 xl:grid-cols-4 lg:gap-x-5">
              {visible.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wished={wishlist.includes(product.id)}
                  onAdd={() => onAdd(product)}
                  onOpen={() => onOpen(product.id)}
                  onWishlist={() => onWishlist(product.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="No products found"
              copy="Try a broader search or clear one of your filters."
              action="Clear filters"
              onAction={clear}
            />
          )}
          {filtered.length > perPage && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                size="icon"
                variant="outline"
              >
                <ChevronLeft />
              </Button>
              {Array.from({ length: pages }, (_, index) => index + 1).map(
                (number) => (
                  <Button
                    aria-label={`Page ${number}`}
                    className="rounded-full"
                    key={number}
                    onClick={() => setPage(number)}
                    size="icon"
                    variant={currentPage === number ? 'default' : 'ghost'}
                  >
                    {number}
                  </Button>
                ),
              )}
              <Button
                aria-label="Next page"
                disabled={currentPage === pages}
                onClick={() => setPage((value) => Math.min(pages, value + 1))}
                size="icon"
                variant="outline"
              >
                <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductDetail({
  product,
  wished,
  onBack,
  onWishlist,
  onAdd,
}: {
  product: Product;
  wished: boolean;
  onBack: () => void;
  onWishlist: () => void;
  onAdd: (
    product: Product,
    quantity: number,
    variant: Record<string, string>,
  ) => boolean;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      product.variants.map((item) => [item.name, item.values[0]]),
    ),
  );
  const productReviews = reviews[product.slug] ?? [
    {
      id: 'fallback',
      author: 'Avery K.',
      rating: 5,
      title: 'A considered everyday upgrade',
      body: 'Beautifully made, thoughtfully packaged, and exactly as described. It has quickly become part of my daily routine.',
      date: 'Jul 24, 2026',
      verified: true,
    },
  ];
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <button
        className="mb-7 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft className="size-4" /> Back to shop
      </button>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)] lg:gap-16">
        <div className="grid gap-3 sm:grid-cols-[88px_1fr]">
          <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">
            {product.images.map((image, index) => (
              <button
                aria-label={`View image ${index + 1}`}
                className={`size-20 shrink-0 overflow-hidden rounded-xl border-2 ${imageIndex === index ? 'border-primary' : 'border-transparent'}`}
                key={image}
                onClick={() => setImageIndex(index)}
                type="button"
              >
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={image}
                />
              </button>
            ))}
          </div>
          <div className="order-1 aspect-square overflow-hidden rounded-3xl bg-muted sm:order-2">
            <img
              alt={product.name}
              className="h-full w-full object-cover"
              src={product.images[imageIndex]}
            />
          </div>
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{product.brand}</Badge>
            <Button
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              className="rounded-full"
              onClick={onWishlist}
              size="icon"
              variant="outline"
            >
              <Heart
                className={wished ? 'fill-current text-destructive' : ''}
              />
            </Button>
          </div>
          <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center text-amber-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star className="size-4 fill-current" key={index} />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">
              {product.reviewCount} reviews
            </span>
          </div>
          <div className="mt-6 flex items-end gap-3">
            <span className="text-2xl font-semibold">
              {currency(product.price)}
            </span>
            {product.compareAt && (
              <span className="pb-0.5 text-muted-foreground line-through">
                {currency(product.compareAt)}
              </span>
            )}
          </div>
          <p className="mt-6 leading-7 text-muted-foreground">
            {product.description}
          </p>
          {product.variants.map((option) => (
            <div className="mt-7" key={option.name}>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{option.name}</span>
                <span className="text-muted-foreground">
                  {variant[option.name]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {option.values.map((value) => (
                  <Button
                    className="min-w-20 rounded-full"
                    key={value}
                    onClick={() =>
                      setVariant((current) => ({
                        ...current,
                        [option.name]: value,
                      }))
                    }
                    variant={
                      variant[option.name] === value ? 'default' : 'outline'
                    }
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-8 flex gap-3">
            <div className="flex items-center rounded-full border">
              <Button
                aria-label="Decrease quantity"
                disabled={quantity === 1}
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                size="icon"
                variant="ghost"
              >
                <Minus />
              </Button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <Button
                aria-label="Increase quantity"
                disabled={quantity >= product.stock}
                onClick={() =>
                  setQuantity((value) => Math.min(product.stock, value + 1))
                }
                size="icon"
                variant="ghost"
              >
                <Plus />
              </Button>
            </div>
            <Button
              className="h-12 flex-1 rounded-full"
              disabled={product.stock === 0}
              onClick={() => onAdd(product, quantity, variant)}
            >
              {product.stock === 0 ? 'Currently unavailable' : 'Add to bag'}{' '}
              <ShoppingBag />
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium">
            {product.stock > 7 ? (
              <>
                <span className="size-2 rounded-full bg-emerald-500" /> In stock
                and ready to ship
              </>
            ) : product.stock > 0 ? (
              <>
                <span className="size-2 rounded-full bg-amber-500" /> Only{' '}
                {product.stock} left in stock
              </>
            ) : (
              <>
                <span className="size-2 rounded-full bg-red-500" /> Out of stock
              </>
            )}
          </div>
          <div className="mt-8 divide-y rounded-2xl border px-5">
            {product.details.map((detail) => (
              <div
                className="flex items-center gap-3 py-3 text-sm"
                key={detail}
              >
                <Check className="size-4 text-emerald-600" />
                {detail}
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-muted p-4">
              <Truck className="mb-2 size-5" />
              <strong>Free standard delivery</strong>
              <p className="mt-1 text-muted-foreground">On this item</p>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <RotateCcw className="mb-2 size-5" />
              <strong>30-day returns</strong>
              <p className="mt-1 text-muted-foreground">Simple and prepaid</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20 border-t pt-12">
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <div>
            <p className="text-sm font-semibold">Customer reviews</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="font-heading text-5xl font-semibold">
                {product.rating}
              </span>
              <span className="pb-1 text-muted-foreground">out of 5</span>
            </div>
            <div className="mt-3 flex text-amber-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star className="size-5 fill-current" key={index} />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Based on {product.reviewCount} reviews
            </p>
          </div>
          <div className="divide-y">
            {productReviews.map((review) => (
              <article className="py-6 first:pt-0" key={review.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex text-amber-500">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star className="size-3.5 fill-current" key={index} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {review.date}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold">{review.title}</h3>
                <p className="mt-2 leading-6 text-muted-foreground">
                  {review.body}
                </p>
                <p className="mt-3 text-xs font-medium">
                  {review.author}{' '}
                  {review.verified && (
                    <span className="ml-2 text-emerald-700">
                      ✓ Verified buyer
                    </span>
                  )}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckoutView({
  store,
  setStore,
  onBack,
  onComplete,
  toast,
}: {
  store: PersistedStore;
  setStore: React.Dispatch<React.SetStateAction<PersistedStore>>;
  onBack: () => void;
  onComplete: (order: Order) => void;
  toast: (message: string, type?: NonNullable<Notice>['type']) => void;
}) {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<Address>(() =>
    store.user
      ? {
          ...emptyAddress,
          firstName: store.user.name.split(' ')[0] ?? '',
          lastName: store.user.name.split(' ').slice(1).join(' '),
          email: store.user.email,
          phone: store.user.phone ?? '',
        }
      : emptyAddress,
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>(
    {},
  );
  const [delivery, setDelivery] = useState<'Standard' | 'Express'>('Standard');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState('');
  const [card, setCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [paymentError, setPaymentError] = useState('');
  const [processing, setProcessing] = useState(false);
  const totals = calculateTotals(
    store.cart,
    store.products,
    delivery,
    promoApplied,
    store.promotions,
  );
  const cartProducts = store.cart
    .map((item) => ({
      item,
      product: store.products.find((product) => product.id === item.productId),
    }))
    .filter((entry): entry is { item: CartItem; product: Product } =>
      Boolean(entry.product),
    );
  const updateAddress = (key: keyof Address, value: string) => {
    setAddress((current) => ({ ...current, [key]: value.slice(0, 120) }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const continueFromAddress = () => {
    const result = validateAddress(address);
    setErrors(result);
    if (Object.keys(result).length) {
      toast('Please review the highlighted address fields.', 'error');
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };
  const applyPromo = () => {
    const promotion = store.promotions.find(
      (entry) =>
        entry.active &&
        entry.code.toLowerCase() === promoCode.trim().toLowerCase(),
    );
    if (!promotion) {
      toast('That promotion code is not active.', 'error');
      setPromoApplied('');
      return;
    }
    setPromoApplied(promotion.code);
    toast(`${promotion.code} has been applied.`);
  };
  const submitPayment = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const stockError = validateStock(store.cart, store.products);
    if (!store.cart.length) {
      toast('Checkout cannot continue with an empty bag.', 'error');
      onBack();
      return;
    }
    if (stockError) {
      toast(stockError, 'error');
      return;
    }
    const digits = card.number.replace(/\D/g, '');
    if (
      sanitizeText(card.name).length < 3 ||
      digits.length !== 16 ||
      !/^\d{2}\/\d{2}$/.test(card.expiry) ||
      !/^\d{3,4}$/.test(card.cvc)
    ) {
      setPaymentError(
        'Enter the cardholder name, a 16-digit card number, MM/YY, and CVC.',
      );
      return;
    }
    setPaymentError('');
    setProcessing(true);
    await wait(900);
    const customer = store.user ?? {
      id: generateEntityId('C'),
      name: `${address.firstName} ${address.lastName}`,
      email: address.email,
      role: 'customer' as const,
      phone: address.phone,
    };
    const order: Order = {
      id: generateOrderId(),
      customerId: customer.id,
      customerName: `${address.firstName} ${address.lastName}`,
      email: address.email,
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      items: cartProducts.map(({ item, product }) => ({
        ...item,
        name: product.name,
        price: product.price,
        image: product.images[0],
      })),
      ...totals,
      delivery,
      address: Object.fromEntries(
        Object.entries(address).map(([key, value]) => [
          key,
          sanitizeText(value),
        ]),
      ) as unknown as Address,
      paymentMethod: `Visa •••• ${digits.slice(-4)}`,
    };
    setStore((current) => ({
      ...current,
      cart: [],
      orders: [order, ...current.orders],
      products: current.products.map((product) => {
        const ordered = current.cart
          .filter((item) => item.productId === product.id)
          .reduce((sum, item) => sum + item.quantity, 0);
        return ordered
          ? { ...product, stock: Math.max(0, product.stock - ordered) }
          : product;
      }),
      customers: current.customers.some(
        (entry) => entry.email === address.email,
      )
        ? current.customers.map((entry) =>
            entry.email === address.email
              ? {
                  ...entry,
                  orders: entry.orders + 1,
                  spent: entry.spent + totals.total,
                }
              : entry,
          )
        : [
            ...current.customers,
            {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              joined: new Date().toISOString().slice(0, 10),
              orders: 1,
              spent: totals.total,
              status: 'Active',
              avatar:
                `${address.firstName[0] ?? ''}${address.lastName[0] ?? ''}`.toUpperCase(),
            },
          ],
    }));
    setProcessing(false);
    onComplete(order);
  };
  if (!store.cart.length && !processing)
    return (
      <section className="mx-auto min-h-[70vh] max-w-3xl px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          copy="Add at least one in-stock item before beginning checkout."
          action="Return to shop"
          onAction={onBack}
        />
      </section>
    );
  const addressFields: {
    key: keyof Address;
    label: string;
    type?: string;
    span?: string;
  }[] = [
    { key: 'firstName', label: 'First name' },
    { key: 'lastName', label: 'Last name' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'address', label: 'Street address', span: 'sm:col-span-2' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State / region' },
    { key: 'postalCode', label: 'Postal code' },
    { key: 'country', label: 'Country' },
  ];
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            className="flex items-center gap-2 font-heading text-2xl font-black tracking-[-0.05em]"
            onClick={onBack}
            type="button"
          >
            <img
              alt=""
              className="size-9 object-contain"
              src="/nexacart-icon.png"
            />
            NexaCart
          </button>
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-700" /> Secure checkout
          </span>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_390px] lg:py-12">
        <div>
          <button
            className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground"
            onClick={step === 1 ? onBack : () => setStep((value) => value - 1)}
            type="button"
          >
            <ArrowLeft className="size-4" />{' '}
            {step === 1 ? 'Back to shop' : 'Previous step'}
          </button>
          <div className="mb-9 flex items-center gap-2">
            {['Details', 'Delivery', 'Payment'].map((label, index) => (
              <div className="flex flex-1 items-center gap-2" key={label}>
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${step >= index + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  {step > index + 1 ? <Check className="size-3" /> : index + 1}
                </span>
                <span
                  className={`hidden text-xs font-medium sm:inline ${step >= index + 1 ? '' : 'text-muted-foreground'}`}
                >
                  {label}
                </span>
                {index < 2 && <span className="h-px flex-1 bg-border" />}
              </div>
            ))}
          </div>
          <Card className="bg-background p-2 ring-black/5">
            <CardContent className="p-4 sm:p-6">
              {step === 1 && (
                <div>
                  <h1 className="font-heading text-2xl font-semibold">
                    Delivery details
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Where should we send your order?
                  </p>
                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    {addressFields.map((field) => (
                      <label className={field.span ?? ''} key={field.key}>
                        <span className="mb-2 block text-sm font-medium">
                          {field.label}
                        </span>
                        <input
                          aria-invalid={Boolean(errors[field.key])}
                          className={fieldClass}
                          onChange={(event) =>
                            updateAddress(field.key, event.target.value)
                          }
                          type={field.type ?? 'text'}
                          value={address[field.key]}
                        />
                        <FieldError message={errors[field.key]} />
                      </label>
                    ))}
                  </div>
                  <Button
                    className="mt-8 h-11 w-full rounded-full"
                    onClick={continueFromAddress}
                  >
                    Continue to delivery <ArrowRight />
                  </Button>
                </div>
              )}
              {step === 2 && (
                <div>
                  <h1 className="font-heading text-2xl font-semibold">
                    Delivery option
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose the speed that works for you.
                  </p>
                  <div className="mt-7 space-y-3">
                    {[
                      {
                        value: 'Standard' as const,
                        title: 'Standard delivery',
                        detail: 'Arrives in 3–5 business days',
                        price: 'Free',
                      },
                      {
                        value: 'Express' as const,
                        title: 'Express delivery',
                        detail: 'Arrives in 1–2 business days',
                        price: currency(14),
                      },
                    ].map((option) => (
                      <button
                        className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left ${delivery === option.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                        key={option.value}
                        onClick={() => setDelivery(option.value)}
                        type="button"
                      >
                        <span
                          className={`grid size-5 place-items-center rounded-full border ${delivery === option.value ? 'border-primary' : ''}`}
                        >
                          {delivery === option.value && (
                            <span className="size-2.5 rounded-full bg-primary" />
                          )}
                        </span>
                        <Truck className="size-5" />
                        <span>
                          <strong className="block text-sm">
                            {option.title}
                          </strong>
                          <span className="mt-1 text-xs text-muted-foreground">
                            {option.detail}
                          </span>
                        </span>
                        <strong className="ml-auto text-sm">
                          {option.price}
                        </strong>
                      </button>
                    ))}
                  </div>
                  <div className="mt-7">
                    <label className="text-sm font-medium" htmlFor="promo">
                      Promotion code
                    </label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="promo"
                        maxLength={24}
                        onChange={(event) =>
                          setPromoCode(event.target.value.toUpperCase())
                        }
                        placeholder="Try WELCOME10"
                        value={promoCode}
                      />
                      <Button onClick={applyPromo} variant="outline">
                        Apply
                      </Button>
                    </div>
                    {promoApplied && (
                      <p className="mt-2 text-xs font-medium text-emerald-700">
                        <Check className="mr-1 inline size-3" />
                        {promoApplied} applied
                      </p>
                    )}
                  </div>
                  <Button
                    className="mt-8 h-11 w-full rounded-full"
                    onClick={() => setStep(3)}
                  >
                    Continue to payment <ArrowRight />
                  </Button>
                </div>
              )}
              {step === 3 && (
                <form onSubmit={submitPayment}>
                  <h1 className="font-heading text-2xl font-semibold">
                    Payment
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This demo uses a secure mock payment processor. No real
                    charge is made.
                  </p>
                  <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <ShieldCheck className="mr-2 inline size-4" />
                    Use test card <strong>4242 4242 4242 4242</strong>, any
                    future MM/YY and CVC.
                  </div>
                  <div className="mt-7 space-y-5">
                    <label>
                      <span className="mb-2 block text-sm font-medium">
                        Name on card
                      </span>
                      <input
                        autoComplete="cc-name"
                        className={fieldClass}
                        maxLength={80}
                        onChange={(event) =>
                          setCard((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        value={card.name}
                      />
                    </label>
                    <label>
                      <span className="mb-2 block text-sm font-medium">
                        Card number
                      </span>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
                        <input
                          autoComplete="cc-number"
                          className={`${fieldClass} pl-10`}
                          inputMode="numeric"
                          maxLength={19}
                          onChange={(event) =>
                            setCard((current) => ({
                              ...current,
                              number: event.target.value
                                .replace(/[^\d ]/g, '')
                                .replace(/(\d{4})(?=\d)/g, '$1 ')
                                .slice(0, 19),
                            }))
                          }
                          placeholder="4242 4242 4242 4242"
                          value={card.number}
                        />
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label>
                        <span className="mb-2 block text-sm font-medium">
                          Expiry
                        </span>
                        <input
                          autoComplete="cc-exp"
                          className={fieldClass}
                          maxLength={5}
                          onChange={(event) =>
                            setCard((current) => ({
                              ...current,
                              expiry: event.target.value
                                .replace(/[^\d/]/g, '')
                                .slice(0, 5),
                            }))
                          }
                          placeholder="MM/YY"
                          value={card.expiry}
                        />
                      </label>
                      <label>
                        <span className="mb-2 block text-sm font-medium">
                          CVC
                        </span>
                        <input
                          autoComplete="cc-csc"
                          className={fieldClass}
                          inputMode="numeric"
                          maxLength={4}
                          onChange={(event) =>
                            setCard((current) => ({
                              ...current,
                              cvc: event.target.value.replace(/\D/g, ''),
                            }))
                          }
                          placeholder="123"
                          type="password"
                          value={card.cvc}
                        />
                      </label>
                    </div>
                    {paymentError && (
                      <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                        {paymentError}
                      </p>
                    )}
                  </div>
                  <Button
                    className="mt-8 h-12 w-full rounded-full"
                    disabled={processing}
                    type="submit"
                  >
                    {processing ? (
                      <>
                        <LoaderCircle className="animate-spin" /> Processing
                        payment…
                      </>
                    ) : (
                      <>
                        Pay {currency(totals.total)} <ShieldCheck />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
        <aside className="h-fit rounded-3xl bg-background p-6 shadow-sm lg:sticky lg:top-8">
          <h2 className="font-heading text-lg font-semibold">Order summary</h2>
          <div className="mt-5 max-h-72 space-y-4 overflow-y-auto">
            {cartProducts.map(({ item, product }, index) => (
              <div className="flex gap-3" key={`${product.id}-${index}`}>
                <div className="relative">
                  <img
                    alt={product.name}
                    className="size-16 rounded-xl object-cover"
                    src={product.images[0]}
                  />
                  <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-[10px] text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {Object.values(item.variant ?? {}).join(' · ')}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {currency(product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 border-t pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{currency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>
                {totals.shipping ? currency(totals.shipping) : 'Free'}
              </span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span>−{currency(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated tax</span>
              <span>{currency(totals.tax)}</span>
            </div>
            <div className="flex justify-between border-t pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{currency(totals.total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ConfirmationView({
  order,
  onOrders,
  onShop,
}: {
  order: Order | null;
  onOrders: () => void;
  onShop: () => void;
}) {
  if (!order)
    return (
      <section className="min-h-screen bg-background px-4 py-20">
        <EmptyState
          icon={Package}
          title="No recent order"
          copy="Your confirmed order will appear here after checkout."
          action="Continue shopping"
          onAction={onShop}
        />
      </section>
    );
  return (
    <section className="min-h-screen bg-[#f6f3ed] px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-2xl rounded-3xl bg-background p-6 text-center shadow-sm sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-8" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
          Order confirmed
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">
          Thank you, {order.address.firstName}.
        </h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-muted-foreground">
          We received your order and sent a confirmation to{' '}
          <strong>{order.email}</strong>. We’ll let you know when it ships.
        </p>
        <div className="mt-8 grid gap-3 rounded-2xl bg-muted/60 p-5 text-left sm:grid-cols-3">
          <div>
            <span className="text-xs text-muted-foreground">Order number</span>
            <strong className="mt-1 block">{order.id}</strong>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Total</span>
            <strong className="mt-1 block">{currency(order.total)}</strong>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Status</span>
            <Badge className={`mt-1 ${statusTone(order.status)}`}>
              {order.status}
            </Badge>
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button className="rounded-full" onClick={onOrders}>
            View my orders <Package />
          </Button>
          <Button className="rounded-full" onClick={onShop} variant="outline">
            Continue shopping
          </Button>
        </div>
      </div>
    </section>
  );
}

function AuthView({
  store,
  setStore,
  onAuthenticated,
  toast,
}: {
  store: PersistedStore;
  setStore: React.Dispatch<React.SetStateAction<PersistedStore>>;
  onAuthenticated: (user: UserProfile) => void;
  toast: (message: string, type?: NonNullable<Notice>['type']) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const email = sanitizeText(form.email, 120).toLowerCase();
    const name = sanitizeText(form.name, 80);
    if (mode === 'register' && name.length < 2)
      nextErrors.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      nextErrors.email = 'Enter a valid email.';
    if (form.password.length < 6)
      nextErrors.password = 'Password must be at least 6 characters.';
    if (mode === 'register' && form.password !== form.confirm)
      nextErrors.confirm = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    await wait(550);
    const isAdmin = resolveMockRole(email) === 'admin';
    const existingCustomer = store.customers.find(
      (customer) => customer.email.toLowerCase() === email,
    );
    const user: UserProfile = {
      id: isAdmin ? 'A-001' : (existingCustomer?.id ?? generateEntityId('C')),
      name: isAdmin
        ? 'Olivia Chen'
        : mode === 'register'
          ? name
          : (existingCustomer?.name ??
            email
              .split('@')[0]
              .replace(/[._-]/g, ' ')
              .replace(/\b\w/g, (letter) => letter.toUpperCase())),
      email,
      role: isAdmin ? 'admin' : 'customer',
    };
    setStore((current) => ({
      ...current,
      user,
      customers:
        isAdmin || existingCustomer
          ? current.customers
          : [
              ...current.customers,
              {
                id: user.id,
                name: user.name,
                email: user.email,
                joined: new Date().toISOString().slice(0, 10),
                orders: 0,
                spent: 0,
                status: 'Active',
                avatar: user.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase(),
              },
            ],
    }));
    setSubmitting(false);
    toast(
      mode === 'register'
        ? 'Your account is ready.'
        : `Welcome back, ${user.name.split(' ')[0]}.`,
    );
    onAuthenticated(user);
  };
  const fillDemo = (kind: 'customer' | 'admin') =>
    setForm({
      name: '',
      email: kind === 'admin' ? 'admin@nexacart.test' : 'maya@example.com',
      password: 'demo123',
      confirm: '',
    });
  return (
    <section className="grid min-h-[calc(100vh-104px)] lg:grid-cols-2">
      <div className="hidden min-h-[720px] lg:block">
        <img
          alt="A calm, considered modern interior"
          className="h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=88"
        />
      </div>
      <div className="flex items-center justify-center px-4 py-14 sm:px-10">
        <div className="w-full max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-foreground">
            Nexa Rewards
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {mode === 'login'
              ? 'Sign in to see your orders and saved pieces.'
              : 'Save favorites, checkout faster, and track every order.'}
          </p>
          <div className="mt-7 grid grid-cols-2 rounded-xl bg-muted p-1">
            <button
              className={`rounded-lg py-2 text-sm font-medium ${mode === 'login' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => {
                setMode('login');
                setErrors({});
              }}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`rounded-lg py-2 text-sm font-medium ${mode === 'register' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => {
                setMode('register');
                setErrors({});
              }}
              type="button"
            >
              Register
            </button>
          </div>
          <form className="mt-7 space-y-5" onSubmit={submit}>
            {mode === 'register' && (
              <label>
                <span className="mb-2 block text-sm font-medium">
                  Full name
                </span>
                <input
                  autoComplete="name"
                  className={fieldClass}
                  maxLength={80}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  value={form.name}
                />
                <FieldError message={errors.name} />
              </label>
            )}
            <label>
              <span className="mb-2 block text-sm font-medium">
                Email address
              </span>
              <input
                autoComplete="email"
                className={fieldClass}
                maxLength={120}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                type="email"
                value={form.email}
              />
              <FieldError message={errors.email} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">Password</span>
              <input
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
                className={fieldClass}
                maxLength={80}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                type="password"
                value={form.password}
              />
              <FieldError message={errors.password} />
            </label>
            {mode === 'register' && (
              <label>
                <span className="mb-2 block text-sm font-medium">
                  Confirm password
                </span>
                <input
                  autoComplete="new-password"
                  className={fieldClass}
                  maxLength={80}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      confirm: event.target.value,
                    }))
                  }
                  type="password"
                  value={form.confirm}
                />
                <FieldError message={errors.confirm} />
              </label>
            )}
            <Button
              className="h-12 w-full rounded-full"
              disabled={submitting}
              type="submit"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="animate-spin" /> Signing in…
                </>
              ) : mode === 'login' ? (
                <>
                  Sign in <ArrowRight />
                </>
              ) : (
                <>
                  Create account <ArrowRight />
                </>
              )}
            </Button>
          </form>
          <div className="mt-8 rounded-2xl border border-dashed bg-card p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Demo access
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Password for both demo accounts: <strong>demo123</strong>
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                className="flex-1"
                onClick={() => fillDemo('customer')}
                size="sm"
                variant="outline"
              >
                Customer demo
              </Button>
              <Button
                className="flex-1"
                onClick={() => fillDemo('admin')}
                size="sm"
                variant="outline"
              >
                Admin demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AccountView({
  initialTab,
  store,
  setStore,
  onLogin,
  onShop,
  toast,
}: {
  initialTab: 'profile' | 'orders';
  store: PersistedStore;
  setStore: React.Dispatch<React.SetStateAction<PersistedStore>>;
  onLogin: () => void;
  onShop: () => void;
  toast: (message: string, type?: NonNullable<Notice>['type']) => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: store.user?.name ?? '',
    phone: store.user?.phone ?? '',
  });
  if (!store.user || store.user.role !== 'customer')
    return (
      <section className="mx-auto min-h-[70vh] max-w-3xl px-4 py-16">
        <EmptyState
          icon={LogIn}
          title="Sign in to see your account"
          copy="Your profile, saved details, and order history are waiting."
          action="Sign in"
          onAction={onLogin}
        />
      </section>
    );
  const userOrders = store.orders.filter(
    (order) => order.email.toLowerCase() === store.user?.email.toLowerCase(),
  );
  const saveProfile = () => {
    const name = sanitizeText(profile.name, 80);
    const phone = sanitizeText(profile.phone, 30);
    if (name.length < 2) {
      toast('Please enter your full name.', 'error');
      return;
    }
    setStore((current) => ({
      ...current,
      user: current.user ? { ...current.user, name, phone } : null,
      customers: current.customers.map((customer) =>
        customer.email === current.user?.email
          ? { ...customer, name }
          : customer,
      ),
    }));
    setEditing(false);
    toast('Profile updated.');
  };
  const logout = () => {
    setStore((current) => ({ ...current, user: null }));
    toast('You have been signed out.');
    onShop();
  };
  return (
    <section className="mx-auto min-h-[70vh] max-w-6xl px-4 py-12 sm:px-6 lg:px-10">
      <div className="flex flex-col justify-between gap-5 border-b pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-foreground">
            Nexa Rewards
          </p>
          <h1 className="mt-2 font-heading text-4xl font-semibold">
            Hello, {store.user.name.split(' ')[0]}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your profile and follow your orders.
          </p>
        </div>
        <Button className="w-fit" onClick={logout} variant="outline">
          <LogOut /> Sign out
        </Button>
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex gap-2 overflow-x-auto md:flex-col">
            {[
              { id: 'profile', label: 'Profile', icon: UserRound },
              { id: 'orders', label: 'Order history', icon: Package },
            ].map(({ id, label, icon: Icon }) => (
              <button
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ${tab === id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                key={id}
                onClick={() => setTab(id as typeof tab)}
                type="button"
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>
        <div>
          {tab === 'profile' ? (
            <Card className="bg-card">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-2xl font-semibold">
                      Personal information
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Used for confirmations and delivery updates.
                    </p>
                  </div>
                  <Button
                    onClick={() => setEditing((value) => !value)}
                    variant="outline"
                  >
                    <Edit3 /> {editing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-medium">
                      Full name
                    </span>
                    <input
                      className={fieldClass}
                      disabled={!editing}
                      maxLength={80}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      value={profile.name}
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-medium">
                      Email address
                    </span>
                    <input
                      className={fieldClass}
                      disabled
                      value={store.user.email}
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-medium">
                      Phone
                    </span>
                    <input
                      className={fieldClass}
                      disabled={!editing}
                      maxLength={30}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      value={profile.phone}
                    />
                  </label>
                </div>
                {editing && (
                  <Button className="mt-7 rounded-full" onClick={saveProfile}>
                    Save changes
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h2 className="font-heading text-2xl font-semibold">
                    Order history
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {userOrders.length} order
                    {userOrders.length === 1 ? '' : 's'} associated with{' '}
                    {store.user.email}.
                  </p>
                </div>
              </div>
              {userOrders.length ? (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <Card className="bg-card" key={order.id}>
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Order {order.id}
                            </span>
                            <p className="mt-1 text-sm font-semibold">
                              Placed{' '}
                              {new Date(
                                `${order.date}T12:00:00`,
                              ).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <Badge className={statusTone(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                          {order.items.map((item, index) => (
                            <img
                              alt={item.name}
                              className="size-16 rounded-xl object-cover"
                              key={`${item.productId}-${index}`}
                              src={item.image}
                            />
                          ))}
                        </div>
                        <div className="mt-5 flex items-end justify-between gap-4">
                          <div className="text-xs text-muted-foreground">
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            )}{' '}
                            items · {order.delivery} delivery
                            {order.trackingNumber && (
                              <span className="block pt-1">
                                Tracking: {order.trackingNumber}
                              </span>
                            )}
                          </div>
                          <strong>{currency(order.total)}</strong>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Package}
                  title="No orders yet"
                  copy="When you place an order, its progress and details will appear here."
                  action="Start shopping"
                  onAction={onShop}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AdminPanel({
  adminView,
  setAdminView,
  store,
  setStore,
  onLogin,
  onStorefront,
  setConfirmAction,
  toast,
}: {
  adminView: AdminView;
  setAdminView: (view: AdminView) => void;
  store: PersistedStore;
  setStore: React.Dispatch<React.SetStateAction<PersistedStore>>;
  onLogin: () => void;
  onStorefront: () => void;
  setConfirmAction: (action: ConfirmAction) => void;
  toast: (message: string, type?: NonNullable<Notice>['type']) => void;
}) {
  if (store.user?.role !== 'admin')
    return (
      <section className="grid min-h-screen place-items-center bg-[#f4f6f4] px-4">
        <div className="w-full max-w-md rounded-3xl bg-background p-8 text-center shadow-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-accent-foreground">
            Protected area
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold">
            Administrator access
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Sign in with the admin demo account to manage products, orders,
            customers, and reporting.
          </p>
          <Button className="mt-7 h-11 w-full rounded-full" onClick={onLogin}>
            Open admin sign in <LogIn />
          </Button>
          <Button
            className="mt-2 w-full"
            onClick={onStorefront}
            variant="ghost"
          >
            Return to storefront
          </Button>
        </div>
      </section>
    );
  const navigation = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];
  const titles: Record<AdminView, [string, string]> = {
    dashboard: [
      'Good morning, Olivia',
      'Here’s what’s happening with your store today.',
    ],
    products: [
      'Products & inventory',
      'Manage products, categories, brands, and stock.',
    ],
    orders: [
      'Order management',
      'Review fulfillment and update customer orders.',
    ],
    customers: ['Customers', 'Understand and manage your customer community.'],
    promotions: [
      'Discounts & promotions',
      'Create and control offers across the store.',
    ],
    reports: ['Reports', 'Monitor sales performance and inventory health.'],
  };
  const [title, subtitle] = titles[adminView];
  return (
    <div className="min-h-screen bg-muted/50 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden bg-[#171342] px-4 py-6 text-white lg:flex lg:flex-col">
        <button
          className="px-3 text-left font-heading text-2xl font-bold tracking-[-0.05em]"
          onClick={onStorefront}
          type="button"
        >
          NexaCart
        </button>
        <p className="mt-1 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
          Commerce admin
        </p>
        <nav className="mt-10 space-y-1">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${adminView === id ? 'bg-white text-[#171342]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              key={id}
              onClick={() => setAdminView(id as AdminView)}
              type="button"
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-white/8 p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-white">
              OC
            </span>
            <div>
              <p className="text-sm font-semibold">Olivia Chen</p>
              <p className="text-xs text-white/50">Store administrator</p>
            </div>
          </div>
          <button
            className="mt-4 flex items-center gap-2 text-xs text-white/60 hover:text-white"
            onClick={onStorefront}
            type="button"
          >
            <Store className="size-3.5" /> View storefront
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="border-b bg-background">
          <div className="flex min-h-20 items-center gap-4 px-4 sm:px-7 lg:px-10">
            <button
              className="font-heading text-xl font-bold lg:hidden"
              onClick={onStorefront}
              type="button"
            >
              NexaCart
            </button>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
              <Store className="size-4" /> NexaCart commerce operations
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Badge className="hidden bg-emerald-100 text-emerald-800 sm:flex">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Mock
                data live
              </Badge>
              <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                OC
              </span>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:hidden">
            {navigation.map(({ id, label, icon: Icon }) => (
              <button
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${adminView === id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                key={id}
                onClick={() => setAdminView(id as AdminView)}
                type="button"
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </nav>
        </header>
        <main className="p-4 sm:p-7 lg:p-10">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {adminView === 'dashboard' && (
            <AdminDashboard store={store} setAdminView={setAdminView} />
          )}
          {adminView === 'products' && (
            <AdminProducts
              store={store}
              setStore={setStore}
              setConfirmAction={setConfirmAction}
              toast={toast}
            />
          )}
          {adminView === 'orders' && (
            <AdminOrders store={store} setStore={setStore} toast={toast} />
          )}
          {adminView === 'customers' && (
            <AdminCustomers
              store={store}
              setStore={setStore}
              setConfirmAction={setConfirmAction}
              toast={toast}
            />
          )}
          {adminView === 'promotions' && (
            <AdminPromotions
              store={store}
              setStore={setStore}
              setConfirmAction={setConfirmAction}
              toast={toast}
            />
          )}
          {adminView === 'reports' && (
            <AdminReports store={store} toast={toast} />
          )}
        </main>
      </div>
    </div>
  );
}

function AdminDashboard({
  store,
  setAdminView,
}: {
  store: PersistedStore;
  setAdminView: (view: AdminView) => void;
}) {
  const revenue =
    store.orders
      .filter((order) => order.status !== 'Cancelled')
      .reduce((sum, order) => sum + order.total, 0) + 28394;
  const lowStock = store.products.filter(
    (product) => !product.archived && product.stock <= 7,
  );
  const stats = [
    {
      label: 'Net sales',
      value: currency(revenue),
      change: '+12.8%',
      icon: CircleDollarSign,
      tone: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Orders',
      value: String(store.orders.length + 217),
      change: '+8.2%',
      icon: ShoppingCart,
      tone: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'Customers',
      value: String(store.customers.length + 1279),
      change: '+5.4%',
      icon: Users,
      tone: 'bg-violet-100 text-violet-700',
    },
    {
      label: 'Products',
      value: String(
        store.products.filter((product) => !product.archived).length,
      ),
      change: `${lowStock.length} alerts`,
      icon: Package,
      tone: 'bg-amber-100 text-amber-700',
    },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, change, icon: Icon, tone }) => (
          <Card className="bg-background ring-black/5" key={label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <span
                  className={`grid size-10 place-items-center rounded-xl ${tone}`}
                >
                  <Icon className="size-5" />
                </span>
                <Badge
                  className="bg-muted text-muted-foreground"
                  variant="secondary"
                >
                  {change}
                </Badge>
              </div>
              <p className="mt-5 text-xs font-medium text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 font-heading text-2xl font-semibold">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Card className="bg-background ring-black/5">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold">
                  Sales overview
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Revenue over the last six months
                </p>
              </div>
              <Badge variant="outline">Apr–Sep</Badge>
            </div>
            <ChartContainer
              className="mt-6 h-[270px] w-full"
              config={salesConfig}
            >
              <AreaChart data={monthlySales} margin={{ left: 4, right: 4 }}>
                <defs>
                  <linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-sales)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-sales)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis axisLine={false} dataKey="month" tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickFormatter={(value) =>
                    `₱${Math.round((Number(value) * PHP_RATE) / 1000)}k`
                  }
                  tickLine={false}
                  width={58}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => currency(Number(value))}
                    />
                  }
                />
                <Area
                  dataKey="sales"
                  fill="url(#sales-fill)"
                  stroke="var(--color-sales)"
                  strokeWidth={2.5}
                  type="monotone"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="bg-background ring-black/5">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold">
                  Low-stock alerts
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Products needing attention
                </p>
              </div>
              <Badge className="bg-amber-100 text-amber-800">
                {lowStock.length}
              </Badge>
            </div>
            <div className="mt-5 space-y-2">
              {lowStock.slice(0, 4).map((product) => (
                <div
                  className="flex items-center gap-3 rounded-xl bg-muted/60 p-3"
                  key={product.id}
                >
                  <img
                    alt=""
                    className="size-10 rounded-lg object-cover"
                    src={product.images[0]}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.sku}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold ${product.stock === 0 ? 'text-red-700' : 'text-amber-700'}`}
                  >
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => setAdminView('products')}
              variant="outline"
            >
              Review inventory <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-background ring-black/5">
        <CardContent className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold">
                Recent orders
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Latest customer activity
              </p>
            </div>
            <Button onClick={() => setAdminView('orders')} variant="ghost">
              View all <ArrowRight />
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {store.orders.slice(0, 5).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-semibold">{order.id}</TableCell>
                  <TableCell>
                    <span className="block font-medium">
                      {order.customerName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusTone(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {currency(order.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

type ProductDraft = {
  id?: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: string;
  stock: string;
  description: string;
};
const blankProduct: ProductDraft = {
  name: '',
  sku: '',
  category: 'Home',
  brand: 'Hearth',
  price: '',
  stock: '',
  description: '',
};

function AdminProducts({
  store,
  setStore,
  setConfirmAction,
  toast,
}: {
  store: PersistedStore;
  setStore: React.Dispatch<React.SetStateAction<PersistedStore>>;
  setConfirmAction: (action: ConfirmAction) => void;
  toast: (message: string, type?: NonNullable<Notice>['type']) => void;
}) {
  const [tab, setTab] = useState<'products' | 'taxonomy' | 'inventory'>(
    'products',
  );
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>(blankProduct);
  const [formError, setFormError] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const visibleProducts = store.products.filter(
    (product) =>
      (showArchived ? product.archived : !product.archived) &&
      `${product.name} ${product.sku}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const openProductDialog = (product?: Product) => {
    setDraft(
      product
        ? {
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            brand: product.brand,
            price: String(product.price * PHP_RATE),
            stock: String(product.stock),
            description: product.description,
          }
        : {
            ...blankProduct,
            category: store.categories[0] ?? 'Home',
            brand: store.brands[0] ?? 'Hearth',
          },
    );
    setFormError('');
    setDialogOpen(true);
  };
  const saveProduct = () => {
    const name = sanitizeText(draft.name, 100);
    const sku = sanitizeText(draft.sku, 30).toUpperCase();
    const priceInPesos = Number(draft.price);
    const price = priceInPesos / PHP_RATE;
    const stock = Number(draft.stock);
    if (
      name.length < 3 ||
      sku.length < 3 ||
      !Number.isFinite(priceInPesos) ||
      priceInPesos <= 0 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      sanitizeText(draft.description, 500).length < 10
    ) {
      setFormError(
        'Complete every field with a valid name, SKU, positive price, stock quantity, and description.',
      );
      return;
    }
    const original = store.products.find((product) => product.id === draft.id);
    const next: Product = original
      ? {
          ...original,
          name,
          sku,
          category: draft.category,
          brand: draft.brand,
          price,
          stock,
          description: sanitizeText(draft.description, 500),
        }
      : {
          id: generateEntityId('P'),
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name,
          sku,
          category: draft.category,
          brand: draft.brand,
          price,
          stock,
          description: sanitizeText(draft.description, 500),
          details: [
            'Quality materials',
            'Easy 30-day returns',
            'Responsibly packaged',
          ],
          images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=88',
          ],
          featured: false,
          archived: false,
          rating: 0,
          reviewCount: 0,
          variants: [],
          createdAt: new Date().toISOString().slice(0, 10),
        };
    setStore((current) => ({
      ...current,
      products: original
        ? current.products.map((product) =>
            product.id === original.id ? next : product,
          )
        : [next, ...current.products],
    }));
    setDialogOpen(false);
    toast(original ? 'Product updated.' : 'Product added to the catalog.');
  };
  const archive = (product: Product) =>
    setConfirmAction({
      title: product.archived
        ? `Restore ${product.name}?`
        : `Archive ${product.name}?`,
      description: product.archived
        ? 'The product will return to the customer catalog immediately.'
        : 'It will be hidden from customers but kept in your records.',
      action: () => {
        setStore((current) => ({
          ...current,
          products: current.products.map((entry) =>
            entry.id === product.id
              ? { ...entry, archived: !entry.archived }
              : entry,
          ),
        }));
        toast(product.archived ? 'Product restored.' : 'Product archived.');
      },
    });
  const updateStock = (id: string, amount: number) =>
    setStore((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === id
          ? { ...product, stock: Math.max(0, product.stock + amount) }
          : product,
      ),
    }));
  const addEntity = (
    kind: 'categories' | 'brands',
    raw: string,
    clear: () => void,
  ) => {
    const value = sanitizeText(raw, 40);
    if (
      value.length < 2 ||
      store[kind].some((entry) => entry.toLowerCase() === value.toLowerCase())
    ) {
      toast(
        `Enter a unique ${kind === 'categories' ? 'category' : 'brand'} name.`,
        'error',
      );
      return;
    }
    setStore((current) => ({
      ...current,
      [kind]: [...current[kind], value].sort(),
    }));
    clear();
    toast(`${kind === 'categories' ? 'Category' : 'Brand'} added.`);
  };
  const removeEntity = (kind: 'categories' | 'brands', value: string) => {
    const used = store.products.some(
      (product) =>
        (kind === 'categories' ? product.category : product.brand) === value,
    );
    if (used) {
      toast(`Reassign products before removing ${value}.`, 'error');
      return;
    }
    setConfirmAction({
      title: `Remove ${value}?`,
      description: `This will permanently remove the ${kind === 'categories' ? 'category' : 'brand'} from available product options.`,
      action: () => {
        setStore((current) => ({
          ...current,
          [kind]: current[kind].filter((entry) => entry !== value),
        }));
        toast(`${kind === 'categories' ? 'Category' : 'Brand'} removed.`);
      },
    });
  };
  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-background p-1 shadow-sm">
          {[
            { id: 'products', label: 'Products' },
            { id: 'taxonomy', label: 'Categories & brands' },
            { id: 'inventory', label: 'Inventory' },
          ].map((item) => (
            <button
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium ${tab === item.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              key={item.id}
              onClick={() => setTab(item.id as typeof tab)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        {tab === 'products' && (
          <Button className="rounded-full" onClick={() => openProductDialog()}>
            <Plus /> Add product
          </Button>
        )}
      </div>
      {tab === 'products' && (
        <Card className="bg-background ring-black/5">
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
              <div className="flex max-w-sm flex-1 items-center rounded-xl border px-3">
                <Search className="size-4 text-muted-foreground" />
                <input
                  className="h-10 w-full bg-transparent px-3 text-sm outline-none"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products or SKU"
                  value={search}
                />
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                <Button
                  onClick={() => setShowArchived(false)}
                  variant={!showArchived ? 'default' : 'ghost'}
                >
                  Active
                </Button>
                <Button
                  onClick={() => setShowArchived(true)}
                  variant={showArchived ? 'default' : 'ghost'}
                >
                  Archived
                </Button>
              </div>
            </div>
            {visibleProducts.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            alt=""
                            className="size-12 rounded-lg object-cover"
                            src={product.images[0]}
                          />
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.sku} · {product.category}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.stock} units</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            productStatus(product) === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : productStatus(product) === 'Low stock'
                                ? 'bg-amber-100 text-amber-800'
                                : productStatus(product) === 'Archived'
                                  ? 'bg-stone-100 text-stone-700'
                                  : 'bg-red-100 text-red-700'
                          }
                        >
                          {productStatus(product)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {currency(product.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            aria-label={`Edit ${product.name}`}
                            onClick={() => openProductDialog(product)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <Edit3 />
                          </Button>
                          <Button
                            aria-label={`${product.archived ? 'Restore' : 'Archive'} ${product.name}`}
                            onClick={() => archive(product)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            {product.archived ? (
                              <RotateCcw />
                            ) : (
                              <Trash2 className="text-destructive" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={Package}
                title="No matching products"
                copy="Try another search or switch between active and archived products."
                action="Add product"
                onAction={() => openProductDialog()}
              />
            )}
          </CardContent>
        </Card>
      )}
      {tab === 'taxonomy' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            {
              kind: 'categories' as const,
              title: 'Categories',
              value: newCategory,
              setValue: setNewCategory,
            },
            {
              kind: 'brands' as const,
              title: 'Brands',
              value: newBrand,
              setValue: setNewBrand,
            },
          ].map((section) => (
            <Card className="bg-background ring-black/5" key={section.kind}>
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-muted">
                    {section.kind === 'categories' ? (
                      <Boxes className="size-4" />
                    ) : (
                      <Tag className="size-4" />
                    )}
                  </span>
                  <div>
                    <h2 className="font-heading text-lg font-semibold">
                      {section.title}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Used to organize and filter products
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <Input
                    maxLength={40}
                    onChange={(event) => section.setValue(event.target.value)}
                    placeholder={`New ${section.title.toLowerCase().slice(0, -1)} name`}
                    value={section.value}
                  />
                  <Button
                    onClick={() =>
                      addEntity(section.kind, section.value, () =>
                        section.setValue(''),
                      )
                    }
                  >
                    <Plus /> Add
                  </Button>
                </div>
                <div className="mt-5 divide-y">
                  {store[section.kind].map((value) => (
                    <div
                      className="flex items-center justify-between py-3"
                      key={value}
                    >
                      <span className="text-sm font-medium">{value}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {
                            store.products.filter(
                              (product) =>
                                (section.kind === 'categories'
                                  ? product.category
                                  : product.brand) === value,
                            ).length
                          }{' '}
                          products
                        </span>
                        <Button
                          aria-label={`Remove ${value}`}
                          onClick={() => removeEntity(section.kind, value)}
                          size="icon-sm"
                          variant="ghost"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {tab === 'inventory' && (
        <Card className="bg-background ring-black/5">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="font-heading text-lg font-semibold">
                  Inventory levels
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Adjust on-hand stock. Changes are saved instantly.
                </p>
              </div>
              <Badge className="bg-amber-100 text-amber-800">
                {
                  store.products.filter(
                    (product) => !product.archived && product.stock <= 7,
                  ).length
                }{' '}
                alerts
              </Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>On hand</TableHead>
                  <TableHead className="text-right">Adjust</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {store.products
                  .filter((product) => !product.archived)
                  .map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <span className="font-semibold">{product.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {product.sku}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            product.stock === 0
                              ? 'bg-red-100 text-red-700'
                              : product.stock <= 7
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                          }
                        >
                          {product.stock === 0
                            ? 'Out of stock'
                            : product.stock <= 7
                              ? 'Low stock'
                              : 'Healthy'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {product.stock}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            aria-label={`Decrease ${product.name} stock`}
                            disabled={product.stock === 0}
                            onClick={() => updateStock(product.id, -1)}
                            size="icon-sm"
                            variant="outline"
                          >
                            <Minus />
                          </Button>
                          <Button
                            aria-label={`Increase ${product.name} stock`}
                            onClick={() => updateStock(product.id, 1)}
                            size="icon-sm"
                            variant="outline"
                          >
                            <Plus />
                          </Button>
                          <Button
                            onClick={() => updateStock(product.id, 10)}
                            size="sm"
                            variant="outline"
                          >
                            +10
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {draft.id ? 'Edit product' : 'Add a product'}
            </DialogTitle>
            <DialogDescription>
              {draft.id
                ? 'Update catalog and inventory details.'
                : 'Create a product ready for the customer catalog.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">
                Product name
              </span>
              <Input
                maxLength={100}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                value={draft.name}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">SKU</span>
              <Input
                maxLength={30}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    sku: event.target.value,
                  }))
                }
                value={draft.sku}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">
                Price (PHP)
              </span>
              <Input
                min="1"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                step="1"
                type="number"
                value={draft.price}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">Category</span>
              <select
                className={fieldClass}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                value={draft.category}
              >
                {store.categories.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">Brand</span>
              <select
                className={fieldClass}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    brand: event.target.value,
                  }))
                }
                value={draft.brand}
              >
                {store.brands.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">Stock</span>
              <Input
                min="0"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    stock: event.target.value,
                  }))
                }
                step="1"
                type="number"
                value={draft.stock}
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">
                Description
              </span>
              <Textarea
                maxLength={500}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={4}
                value={draft.description}
              />
            </label>
          </div>
          {formError && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </p>
          )}
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={saveProduct}>
              {draft.id ? 'Save changes' : 'Add product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminOrders({
  store,
  setStore,
  toast,
}: {
  store: PersistedStore;
  setStore: React.Dispatch<React.SetStateAction<PersistedStore>>;
  toast: (message: string, type?: NonNullable<Notice>['type']) => void;
}) {
  const [filter, setFilter] = useState<'All' | OrderStatus>('All');
  const [search, setSearch] = useState('');
  const statuses: OrderStatus[] = [
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];
  const orders = store.orders.filter(
    (order) =>
      (filter === 'All' || order.status === filter) &&
      `${order.id} ${order.customerName} ${order.email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const updateStatus = (id: string, status: OrderStatus) => {
    setStore((current) => ({
      ...current,
      orders: setOrderStatus(current.orders, id, status),
    }));
    toast(`Order ${id} updated to ${status}.`);
  };
  return (
    <Card className="bg-background ring-black/5">
      <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <div className="flex max-w-sm flex-1 items-center rounded-xl border px-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              className="h-10 w-full bg-transparent px-3 text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Order, customer, or email"
              value={search}
            />
          </div>
          <select
            className={`${fieldClass} sm:ml-auto sm:w-44`}
            onChange={(event) => setFilter(event.target.value as typeof filter)}
            value={filter}
          >
            <option>All</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        {orders.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <span className="font-semibold">{order.id}</span>
                    {order.trackingNumber && (
                      <span className="block text-[10px] text-muted-foreground">
                        {order.trackingNumber}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="block font-medium">
                      {order.customerName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(`${order.date}T12:00:00`).toLocaleDateString(
                      'en-US',
                      { month: 'short', day: 'numeric' },
                    )}
                  </TableCell>
                  <TableCell>
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {currency(order.total)}
                  </TableCell>
                  <TableCell>
                    <select
                      aria-label={`Status for order ${order.id}`}
                      className="h-9 rounded-lg border bg-background px-2 text-xs font-semibold"
                      onChange={(event) =>
                        updateStatus(
                          order.id,
                          event.target.value as OrderStatus,
                        )
                      }
                      value={order.status}
                    >
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            icon={Package}
            title="No orders found"
            copy="Try another status or a broader customer search."
            action="Show all orders"
            onAction={() => {
              setFilter('All');
              setSearch('');
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

function AdminCustomers({
  store,
  setStore,
  setConfirmAction,
  toast,
}: {
  store: PersistedStore;
  setStore: React.Dispatch<React.SetStateAction<PersistedStore>>;
  setConfirmAction: (action: ConfirmAction) => void;
  toast: (message: string, type?: NonNullable<Notice>['type']) => void;
}) {
  const [search, setSearch] = useState('');
  const customers = store.customers.filter((customer) =>
    `${customer.name} ${customer.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const changeStatus = (customer: Customer) =>
    setConfirmAction({
      title: `${customer.status === 'Active' ? 'Block' : 'Reactivate'} ${customer.name}?`,
      description:
        customer.status === 'Active'
          ? 'This customer will be unable to place new orders until reactivated.'
          : 'This customer will regain the ability to place orders.',
      action: () => {
        setStore((current) => ({
          ...current,
          customers: current.customers.map((entry) =>
            entry.id === customer.id
              ? {
                  ...entry,
                  status: entry.status === 'Active' ? 'Blocked' : 'Active',
                }
              : entry,
          ),
        }));
        toast(
          customer.status === 'Active'
            ? 'Customer blocked.'
            : 'Customer reactivated.',
        );
      },
    });
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Total customers',
            value: store.customers.length + 1279,
            icon: Users,
          },
          { label: 'Repeat purchase rate', value: '38.4%', icon: RotateCcw },
          {
            label: 'Average order value',
            value: currency(148.62),
            icon: TrendingUp,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card className="bg-background ring-black/5" key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-muted">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 font-heading text-xl font-semibold">
                  {value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-background ring-black/5">
        <CardContent className="p-0">
          <div className="border-b p-4">
            <div className="flex max-w-sm items-center rounded-xl border px-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                className="h-10 w-full bg-transparent px-3 text-sm outline-none"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customers"
                value={search}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {customer.avatar}
                      </span>
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(`${customer.joined}T12:00:00`).toLocaleDateString(
                      'en-US',
                      { month: 'short', day: 'numeric', year: 'numeric' },
                    )}
                  </TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell className="font-semibold">
                    {currency(customer.spent)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        customer.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-700'
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => changeStatus(customer)}
                      size="sm"
                      variant="outline"
                    >
                      {customer.status === 'Active' ? 'Block' : 'Reactivate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

type PromotionDraft = {
  name: string;
  code: string;
  type: 'Percentage' | 'Fixed';
  value: string;
  start: string;
  end: string;
};
const blankPromotion: PromotionDraft = {
  name: '',
  code: '',
  type: 'Percentage',
  value: '',
  start: new Date().toISOString().slice(0, 10),
  end: '2026-12-31',
};

function AdminPromotions({
  store,
  setStore,
  setConfirmAction,
  toast,
}: {
  store: PersistedStore;
  setStore: React.Dispatch<React.SetStateAction<PersistedStore>>;
  setConfirmAction: (action: ConfirmAction) => void;
  toast: (message: string, type?: NonNullable<Notice>['type']) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<PromotionDraft>(blankPromotion);
  const [error, setError] = useState('');
  const save = () => {
    const name = sanitizeText(draft.name, 80);
    const code = sanitizeText(draft.code, 24).toUpperCase().replace(/\s/g, '');
    const value = Number(draft.value);
    if (
      name.length < 3 ||
      code.length < 3 ||
      !Number.isFinite(value) ||
      value <= 0 ||
      (draft.type === 'Percentage' && value > 100) ||
      !draft.start ||
      !draft.end ||
      draft.end < draft.start ||
      store.promotions.some((promotion) => promotion.code === code)
    ) {
      setError(
        'Enter a unique code, valid value, and an end date after the start date.',
      );
      return;
    }
    const promotion: Promotion = {
      id: generateEntityId('PR'),
      name,
      code,
      type: draft.type,
      value: draft.type === 'Fixed' ? value / PHP_RATE : value,
      start: draft.start,
      end: draft.end,
      usage: 0,
      active: true,
    };
    setStore((current) => ({
      ...current,
      promotions: [promotion, ...current.promotions],
    }));
    setDialogOpen(false);
    setDraft(blankPromotion);
    toast('Promotion created and activated.');
  };
  const remove = (promotion: Promotion) =>
    setConfirmAction({
      title: `Delete ${promotion.code}?`,
      description:
        'This promotion will be permanently removed and can no longer be applied at checkout.',
      action: () => {
        setStore((current) => ({
          ...current,
          promotions: current.promotions.filter(
            (entry) => entry.id !== promotion.id,
          ),
        }));
        toast('Promotion removed.');
      },
    });
  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button
          className="rounded-full"
          onClick={() => {
            setDraft(blankPromotion);
            setError('');
            setDialogOpen(true);
          }}
        >
          <Plus /> Create promotion
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {store.promotions.map((promotion) => (
          <Card className="bg-background ring-black/5" key={promotion.id}>
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Gift className="size-5" />
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      promotion.active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-700'
                    }
                  >
                    {promotion.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    aria-label={`Delete ${promotion.code}`}
                    onClick={() => remove(promotion)}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </div>
              <h2 className="mt-5 font-heading text-xl font-semibold">
                {promotion.name}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <code className="rounded-lg bg-muted px-2 py-1 text-xs font-bold tracking-wider">
                  {promotion.code}
                </code>
                <span className="text-sm font-semibold">
                  {promotion.type === 'Percentage'
                    ? `${promotion.value}% off`
                    : `${currency(promotion.value)} off`}
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t pt-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Valid dates</span>
                  <p className="mt-1 font-medium">
                    {promotion.start} – {promotion.end}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Redemptions</span>
                  <p className="mt-1 font-medium">{promotion.usage}</p>
                </div>
              </div>
              <Button
                className="mt-5 w-full"
                onClick={() => {
                  setStore((current) => ({
                    ...current,
                    promotions: current.promotions.map((entry) =>
                      entry.id === promotion.id
                        ? { ...entry, active: !entry.active }
                        : entry,
                    ),
                  }));
                  toast(
                    promotion.active
                      ? 'Promotion paused.'
                      : 'Promotion activated.',
                  );
                }}
                variant="outline"
              >
                {promotion.active ? 'Pause promotion' : 'Activate promotion'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create promotion</DialogTitle>
            <DialogDescription>
              Configure a checkout-ready discount code.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium">
                Promotion name
              </span>
              <Input
                maxLength={80}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                value={draft.name}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">Code</span>
              <Input
                maxLength={24}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    code: event.target.value.toUpperCase(),
                  }))
                }
                value={draft.code}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">Type</span>
              <select
                className={fieldClass}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    type: event.target.value as PromotionDraft['type'],
                  }))
                }
                value={draft.type}
              >
                <option>Percentage</option>
                <option>Fixed</option>
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">
                {draft.type === 'Percentage' ? 'Value (%)' : 'Value (PHP)'}
              </span>
              <Input
                min="0"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    value: event.target.value,
                  }))
                }
                step={draft.type === 'Percentage' ? '0.01' : '1'}
                type="number"
                value={draft.value}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">Starts</span>
              <Input
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    start: event.target.value,
                  }))
                }
                type="date"
                value={draft.start}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium">Ends</span>
              <Input
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    end: event.target.value,
                  }))
                }
                type="date"
                value={draft.end}
              />
            </label>
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={save}>Create promotion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminReports({
  store,
  toast,
}: {
  store: PersistedStore;
  toast: (message: string, type?: NonNullable<Notice>['type']) => void;
}) {
  const inventoryByCategory = store.categories.map((category) => ({
    category,
    units: store.products
      .filter((product) => product.category === category && !product.archived)
      .reduce((sum, product) => sum + product.stock, 0),
  }));
  const exportReport = () => {
    const rows = [
      ['SKU', 'Product', 'Category', 'Brand', 'Stock', 'Price (PHP)'],
      ...store.products.map((product) => [
        product.sku,
        product.name,
        product.category,
        product.brand,
        String(product.stock),
        String(product.price * PHP_RATE),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((value) => `"${value.replace(/"/g, '""')}"`).join(','),
      )
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `nexacart-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast('Inventory report downloaded.');
  };
  const sellThrough = Math.round(
    (store.products.reduce(
      (sum, product) => sum + Math.max(0, 40 - product.stock),
      0,
    ) /
      (store.products.length * 40)) *
      100,
  );
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          className="rounded-full"
          onClick={exportReport}
          variant="outline"
        >
          <Download /> Export inventory CSV
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Gross sales',
            value: currency(32840),
            note: '+12.8% vs. last month',
          },
          {
            label: 'Average order value',
            value: currency(148.62),
            note: '+4.1% vs. last month',
          },
          {
            label: 'Sell-through rate',
            value: `${sellThrough}%`,
            note: 'Across active inventory',
          },
        ].map((item) => (
          <Card className="bg-background ring-black/5" key={item.label}>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-2 font-heading text-2xl font-semibold">
                {item.value}
              </p>
              <p className="mt-2 text-xs font-medium text-emerald-700">
                {item.note}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="bg-background ring-black/5">
          <CardContent className="p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold">
              Monthly sales
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Revenue and growth trend
            </p>
            <ChartContainer
              className="mt-6 h-[280px] w-full"
              config={salesConfig}
            >
              <AreaChart data={monthlySales}>
                <defs>
                  <linearGradient id="report-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-sales)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-sales)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis axisLine={false} dataKey="month" tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickFormatter={(value) =>
                    `₱${Math.round((Number(value) * PHP_RATE) / 1000)}k`
                  }
                  tickLine={false}
                  width={58}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => currency(Number(value))}
                    />
                  }
                />
                <Area
                  dataKey="sales"
                  fill="url(#report-fill)"
                  stroke="var(--color-sales)"
                  strokeWidth={2.5}
                  type="monotone"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="bg-background ring-black/5">
          <CardContent className="p-5 sm:p-6">
            <h2 className="font-heading text-lg font-semibold">
              Inventory by category
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Current units available
            </p>
            <ChartContainer
              className="mt-6 h-[280px] w-full"
              config={salesConfig}
            >
              <BarChart data={inventoryByCategory}>
                <CartesianGrid vertical={false} />
                <XAxis axisLine={false} dataKey="category" tickLine={false} />
                <YAxis axisLine={false} tickLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="units"
                  fill="var(--color-orders)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-background ring-black/5">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-semibold">
                Inventory health
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Actionable stock overview
              </p>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-emerald-100 text-emerald-800">
                {
                  store.products.filter(
                    (product) => !product.archived && product.stock > 7,
                  ).length
                }{' '}
                healthy
              </Badge>
              <Badge className="bg-amber-100 text-amber-800">
                {
                  store.products.filter(
                    (product) =>
                      !product.archived &&
                      product.stock > 0 &&
                      product.stock <= 7,
                  ).length
                }{' '}
                low
              </Badge>
              <Badge className="bg-red-100 text-red-700">
                {
                  store.products.filter(
                    (product) => !product.archived && product.stock === 0,
                  ).length
                }{' '}
                out
              </Badge>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {store.products
              .filter((product) => !product.archived && product.stock <= 7)
              .slice(0, 6)
              .map((product) => (
                <div
                  className="flex items-center gap-3 rounded-xl border p-3"
                  key={product.id}
                >
                  <span
                    className={`grid size-9 place-items-center rounded-lg ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                  >
                    <AlertTriangle className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.stock} units remaining
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
