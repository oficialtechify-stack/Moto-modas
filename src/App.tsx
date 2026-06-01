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
  CheckCircle2,
  Instagram,
  ExternalLink
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-55 bg-zinc-950 border-2 border-white text-white px-5 py-3 rounded-none shadow-[3px_3px_0px_0px_rgba(255,255,255,0.15)] flex items-center gap-2.5 text-xs font-black uppercase tracking-wider"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-white" />
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
      <footer className="border-t-2 border-black bg-zinc-950/90 backdrop-blur-md pt-12 pb-8 px-6 text-xs text-zinc-500 self-stretch mt-12 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 text-left">
          
          {/* LOJA INFO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-white text-black font-black px-2 py-0.5 text-sm uppercase tracking-wider border border-zinc-200 shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.15)]">
                JM
              </div>
              <h4 className="font-extrabold text-sm text-zinc-200 tracking-wider">MOTA MODAS</h4>
            </div>
            
            <p className="text-zinc-400 font-medium leading-relaxed">
              Sua curadoria de marcas famosas do mercado. Vista os estilos mais desejados: casual, social e street com máxima autenticidade e preço justo.
            </p>

            <div className="space-y-2 mt-4 text-[11px] text-zinc-400 font-mono">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>
                  Avenida Antonio Jacome Bezerra, N: 9 C<br />
                  Jaboatão dos Guararapes - PE<br />
                  CEP: 54220-240
                </span>
              </div>
            </div>

            <div className="pt-2">
              <a 
                href="https://api.whatsapp.com/send?l=pt-BR&phone=5581985555951&text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20as%20roupas%20da%20JM%2520Mota%2520Modas."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-zinc-900 text-black hover:text-white font-black uppercase text-[10px] tracking-widest py-2 px-3 border border-zinc-200 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all rounded-none"
              >
                <span>Fale no WhatsApp</span>
                <span className="font-mono text-[9px] bg-black text-white px-1 py-0.2 rounded-none">81 98555-5951</span>
              </a>
            </div>
          </div>

          {/* SOCIALS & CONNECTION */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-xs text-white uppercase tracking-widest border-l-2 border-white pl-2 font-mono">
              Instas Oficiais
            </h4>
            
            <div className="space-y-3">
              <a 
                href="https://www.instagram.com/jm_mmota/" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-white text-zinc-300 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-white" />
                  <span className="font-mono text-xs font-bold">@jm_mmota</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-500 group-hover:text-white transition-colors">
                  <span>Siga a Loja</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>

              <a 
                href="https://www.instagram.com/rickzinx_/" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-white text-zinc-300 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-white" />
                  <span className="font-mono text-xs">@rickzinx_</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-500 group-hover:text-white transition-colors">
                  <span>Criador do Site</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            </div>

            <div className="pt-2 flex items-center gap-3 text-zinc-400 font-bold text-[11px] font-mono">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-white" /> Garantia JM Mota Modas</span>
            </div>
          </div>

          {/* DESENVOLVIDO POR */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-xs text-white uppercase tracking-widest border-l-2 border-white pl-2 font-mono">
              Desenvolvimento
            </h4>
            
            <p className="text-zinc-400 leading-relaxed font-mono text-[11px]">
              Este site de altíssima performance foi desenhado e programado por experts com foco em velocidade e conversão de vendas.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <a 
                href="https://www.instagram.com/ecos__agency/" 
                target="_blank" 
                rel="noreferrer"
                className="flex flex-col p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-white text-zinc-300 hover:text-white transition-all group"
              >
                <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors uppercase font-mono">Ecos Agency</span>
                <span className="text-[9px] text-zinc-500 mt-0.5 flex items-center gap-1">@ecos__agency <ExternalLink className="w-2.5 h-2.5" /></span>
              </a>

              <a 
                href="https://www.instagram.com/techify.oficial/" 
                target="_blank" 
                rel="noreferrer"
                className="flex flex-col p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-white text-zinc-300 hover:text-white transition-all group"
              >
                <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors uppercase font-mono">Techify</span>
                <span className="text-[9px] text-zinc-500 mt-0.5 flex items-center gap-1">@techify.oficial <ExternalLink className="w-2.5 h-2.5" /></span>
              </a>
            </div>
          </div>

        </div>

        {/* BOTTOM RIGHTS BAR */}
        <div className="border-t border-zinc-900 pt-6 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-zinc-650">
          <p className="text-[10px] font-mono uppercase tracking-wider">
            © 2026 JM Mota Modas. Todos os direitos reservados.
          </p>
          <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 flex items-center justify-center sm:justify-start gap-1 flex-wrap">
            <span>PROJETADO POR</span>
            <a href="https://www.instagram.com/rickzinx_/" target="_blank" rel="noreferrer" className="text-white hover:underline font-bold">@rickzinx_</a>
            <span>• PARCERIA</span>
            <span className="text-zinc-400">ECOS & TECHIFY</span>
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
