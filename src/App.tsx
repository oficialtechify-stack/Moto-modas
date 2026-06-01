import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shirt, 
  MapPin, 
  Store, 
  PhoneCall, 
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

import Header from './components/Header';
import CatalogView from './components/CatalogView';
import CartDrawer from './components/CartDrawer';
import MapView from './components/MapView';
import AdminPanel from './components/AdminPanel';
import InteractiveWaveShader from './components/InteractiveWaveShader';
import { GlassFilter } from './components/GlassEffect';

import { Product, Promotion, Order, CartItem } from './types';
import { DataService } from './lib/dataService';
import { auth, isMock } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'catalog' | 'map' | 'admin'>('catalog');
  
  // Real-time collections lists from dataService
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Auth local state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Cart operations
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // App notification toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Manage Firebase Authentication monitoring
  useEffect(() => {
    if (isMock || !auth) {
      setIsAdminUser(true); // In mock mode, permit full administrator simulation by default
      return;
    }
    const unsubAuth = auth.onAuthStateChanged((user: any) => {
      setCurrentUser(user);
      setIsAdminUser(user && user.email === 'aigerakabane81983521523@gmail.com');
    });
    return () => unsubAuth();
  }, []);

  // 2. Load public catalog databases (always available publicly)
  useEffect(() => {
    let unsubProducts = () => {};
    let unsubPromotions = () => {};

    const loadPublicData = async () => {
      unsubProducts = await DataService.getProducts((prodList) => {
        setProducts(prodList);
      });
      unsubPromotions = await DataService.getPromotions((promoList) => {
        setPromotions(promoList);
      });
    };

    loadPublicData();

    // Recover cached shopping cart on boot
    const storedCart = localStorage.getItem('motomodas_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.warn('Could not parse cached shopping cart', e);
      }
    }

    return () => {
      unsubProducts();
      unsubPromotions();
    };
  }, []);

  // 3. Load administrative order database only when logged in as Admin to prevent permission denied errors
  useEffect(() => {
    let unsubOrders = () => {};

    const loadOrdersData = async () => {
      if (isMock || isAdminUser) {
        unsubOrders = await DataService.getOrders((orderList) => {
          setOrders(orderList);
        });
      } else {
        setOrders([]);
      }
    };

    loadOrdersData();

    return () => {
      unsubOrders();
    };
  }, [isAdminUser]);

  // Sync cart selections to cache
  const updateCachedCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem('motomodas_cart', JSON.stringify(updatedCart));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleAddToCart = (item: CartItem) => {
    const nextCart = [...cartItems];
    const matchIdx = nextCart.findIndex(
      (c) => 
        c.product.id === item.product.id && 
        c.chosenSize === item.chosenSize && 
        c.chosenColor === item.chosenColor
    );

    if (matchIdx > -1) {
      // Avoid exceeding current real-time stock
      const newQty = Math.min(item.product.stock, nextCart[matchIdx].quantity + item.quantity);
      nextCart[matchIdx].quantity = newQty;
    } else {
      nextCart.push(item);
    }

    updateCachedCart(nextCart);
    showToast(`Adicionado: ${item.product.name} (${item.chosenSize})`);
  };

  const handleUpdateCartQty = (productId: string, size: string, color: string, newQty: number) => {
    let nextCart = [...cartItems];
    const matchIdx = nextCart.findIndex(
      (c) => c.product.id === productId && c.chosenSize === size && c.chosenColor === color
    );

    if (matchIdx > -1) {
      if (newQty <= 0) {
        nextCart = nextCart.filter((_, i) => i !== matchIdx);
      } else {
        // Enforce stock upper bounds
        const itemStock = nextCart[matchIdx].product.stock;
        nextCart[matchIdx].quantity = Math.min(itemStock, newQty);
      }
    }

    updateCachedCart(nextCart);
  };

  const handleRemoveCartItem = (productId: string, size: string, color: string) => {
    const nextCart = cartItems.filter(
      (c) => !(c.product.id === productId && c.chosenSize === size && c.chosenColor === color)
    );
    updateCachedCart(nextCart);
    showToast('Peça removida do carrinho.');
  };

  const handleClearCart = () => {
    updateCachedCart([]);
  };

  // Metrics configurations
  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartTotal = cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);

  // Administrative mutations
  const handleSaveProduct = async (product: Product) => {
    await DataService.saveProduct(product);
    showToast('Roupa cadastrada/atualizada com sucesso!');
  };

  const handleDeleteProduct = async (productId: string) => {
    await DataService.deleteProduct(productId);
    showToast('Roupa removida do catálogo.');
  };

  const handleSavePromotion = async (promo: Promotion) => {
    await DataService.savePromotion(promo);
    showToast('Campanha promocional salva!');
  };

  const handleDeletePromotion = async (promoId: string) => {
    await DataService.deletePromotion(promoId);
    showToast('Campanha de banner desativada.');
  };

  const handleSaveOrder = async (order: Order) => {
    await DataService.saveOrder(order);
    showToast(`Pedido #${order.id} atualizado.`);
  };

  const handleDeleteOrder = async (orderId: string) => {
    await DataService.deleteOrder(orderId);
    showToast(`Registro de pedido #${orderId} excluído.`);
  };

  const handleGoogleLogin = async (): Promise<void> => {
    if (isMock || !auth) {
      showToast('Autenticação indisponível no ambiente local mock.');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast('Autenticado com Google!');
    } catch (error: any) {
      console.error('Erro de login no Google:', error);
      showToast(`Erro de login: ${error.message || error}`);
    }
  };

  const handleGoogleLogout = async (): Promise<void> => {
    if (isMock || !auth) return;
    try {
      await signOut(auth);
      showToast('Desconectado com sucesso.');
    } catch (error: any) {
      console.error('Erro de logout:', error);
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black antialiased relative">
      {/* HIGH-PERFORMANCE INTERACTIVE NEON WAVE CAUSTICS BG */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <InteractiveWaveShader />
      </div>
      
      {/* HEADER NAVBAR NAV */}
      <div className="relative z-10 w-full">
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          cartCount={cartCount}
          cartTotal={cartTotal}
          onCartOpen={() => setIsCartOpen(true)}
        />
      </div>

      {/* FLOATING ACTION ALERTS TOAST */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-55 bg-zinc-950 border-2 border-[#e6ff00] text-white px-5 py-3 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2.5 text-xs font-black uppercase tracking-wider"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-[#e6ff00]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE WRAPPER SECTION */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 relative z-10">
        
        {/* COMPONENT ROUTER VIEWS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="focus:outline-none"
          >
            {currentTab === 'catalog' && (
              <CatalogView
                products={products}
                promotions={promotions}
                onAddToCart={handleAddToCart}
              />
            )}

            {currentTab === 'map' && (
              <MapView />
            )}

            {currentTab === 'admin' && (
              <AdminPanel
                products={products}
                promotions={promotions}
                orders={orders}
                onSaveProduct={handleSaveProduct}
                onDeleteProduct={handleDeleteProduct}
                onSavePromotion={handleSavePromotion}
                onDeletePromotion={handleDeletePromotion}
                onSaveOrder={handleSaveOrder}
                onDeleteOrder={handleDeleteOrder}
                isAdminUser={isAdminUser}
                currentUser={currentUser}
                onGoogleLogin={handleGoogleLogin}
                onGoogleLogout={handleGoogleLogout}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* FOOTER OUTLINE */}
      <footer className="border-t-2 border-black bg-zinc-950 py-8 px-4 text-center text-xs text-zinc-500 self-stretch mt-12 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-left space-y-1">
            <h4 className="font-extrabold text-sm text-zinc-350">Bomb Street Art Recife</h4>
            <p className="text-[11.5px] text-zinc-400 font-mono">
              Avenida Antonio Jacome Bezerra, N: 9 C, Jaboatão dos Guararapes - PE, CEP: 54220-240
            </p>
          </div>

          <div className="flex items-center gap-4 text-zinc-400 font-bold">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-[#e6ff00]" /> Garantia Bomb Street</span>
            <span className="text-zinc-700 font-normal">|</span>
            <span className="flex items-center gap-1 text-xs text-zinc-400 font-mono">CNPJ: 45.289.479/0001-81</span>
          </div>

          <p className="text-[10px] font-mono text-zinc-650">
            © 2026 Bomb Street Art Ltda. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* FLOATING CART SIDE DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* GLOBAL SVG DISTORTION GLASS FILTER */}
      <GlassFilter />

    </div>
  );
}
