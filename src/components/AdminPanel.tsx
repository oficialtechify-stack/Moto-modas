import React, { useState } from 'react';
import { 
  KeyRound, 
  LayoutDashboard, 
  Package, 
  Megaphone, 
  ShoppingBag, 
  Plus, 
  Minus,
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
  Settings,
  Sparkles,
  LogOut,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Promotion, Order } from '../types';
import { isMock } from '../lib/firebase';
import ImageDropZone from './ImageDropZone';
import { GlassEffect } from './GlassEffect';

interface AdminPanelProps {
  products: Product[];
  promotions: Promotion[];
  orders: Order[];
  onSaveProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onSavePromotion: (promo: Promotion) => Promise<void>;
  onDeletePromotion: (promoId: string) => Promise<void>;
  onSaveOrder: (order: Order) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  isAdminUser: boolean;
  currentUser: any;
  onGoogleLogin: () => Promise<void>;
  onGoogleLogout: () => Promise<void>;
}

export default function AdminPanel({
  products,
  promotions,
  orders,
  onSaveProduct,
  onDeleteProduct,
  onSavePromotion,
  onDeletePromotion,
  onSaveOrder,
  onDeleteOrder,
  isAdminUser,
  currentUser,
  onGoogleLogin,
  onGoogleLogout
}: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passError, setPassError] = useState(false);

  // Consider authorized if either password is correct, or live authenticated admin is present
  const isAuthorized = isAuthenticated || (!isMock && isAdminUser);

  // Admin sub-navigation state
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'promotions' | 'orders'>('inventory');

  // Input states for adding new products
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProd, setNewProd] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: 'Camisetas',
    price: 0,
    stock: 10,
    sizes: ['M', 'G', 'GG'],
    colors: ['Preto Classic', 'Off-White'],
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop',
    isNew: true
  });

  // Input states for editing existing products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Input states for adding new promotions
  const [isAddingPromo, setIsAddingPromo] = useState(false);
  const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
    title: '',
    subtitle: '',
    discount: '15% OFF',
    bannerUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop',
    isActive: true,
    categoryFilter: 'Camisetas'
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'motomodas123') {
      setIsAuthenticated(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  // Quick stat summaries
  const totalRevenue = orders
    .filter(o => o.status === 'finalizado')
    .reduce((acc, curr) => acc + curr.total, 0);
  
  const pendingOrdersCount = orders.filter(o => o.status === 'pendente').length;
  const lowStockProductsCount = products.filter(p => p.stock <= 3 && p.stock > 0).length;
  const outOfStockProductsCount = products.filter(p => p.stock === 0).length;

  const handleUpdateStock = async (product: Product, direction: 'up' | 'down') => {
    const nextStock = direction === 'up' ? product.stock + 1 : Math.max(0, product.stock - 1);
    await onSaveProduct({
      ...product,
      stock: nextStock
    });
  };

  const handleToggleNew = async (product: Product) => {
    await onSaveProduct({
      ...product,
      isNew: !product.isNew
    });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price || newProd.price <= 0) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const uniqueId = `prod-${Date.now()}`;
    const productToCreate: Product = {
      id: uniqueId,
      name: newProd.name,
      description: newProd.description || 'Nenhuma descrição inserida.',
      price: newProd.price,
      stock: newProd.stock || 0,
      imageUrl: newProd.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop',
      category: newProd.category || 'Camisetas',
      sizes: newProd.sizes || ['P', 'M', 'G'],
      colors: newProd.colors || ['Preto'],
      isNew: newProd.isNew !== undefined ? newProd.isNew : true,
      createdAt: new Date().toISOString()
    };

    await onSaveProduct(productToCreate);
    setIsAddingProduct(false);
    // Reset defaults
    setNewProd({
      name: '',
      description: '',
      category: 'Camisetas',
      price: 0,
      stock: 10,
      sizes: ['M', 'G', 'GG'],
      colors: ['Preto Classic', 'Off-White'],
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop',
      isNew: true
    });
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name || !editingProduct.price || editingProduct.price <= 0) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    await onSaveProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.title || !newPromo.discount) {
      alert('Informe título e valor do desconto.');
      return;
    }

    const uniqueId = `promo-${Date.now()}`;
    const promoToCreate: Promotion = {
      id: uniqueId,
      title: newPromo.title,
      subtitle: newPromo.subtitle || '',
      discount: newPromo.discount,
      bannerUrl: newPromo.bannerUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop',
      isActive: true,
      categoryFilter: newPromo.categoryFilter
    };

    await onSavePromotion(promoToCreate);
    setIsAddingPromo(false);
    setNewPromo({
      title: '',
      subtitle: '',
      discount: '15% OFF',
      bannerUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop',
      isActive: true,
      categoryFilter: 'Camisetas'
    });
  };

  const handleUpdateOrderStatus = async (order: Order, newStatus: 'pendente' | 'finalizado' | 'cancelado') => {
    await onSaveOrder({
      ...order,
      status: newStatus
    });
  };

  // DUAL SECURITY GOOGLE/PASSWORD PANEL SCREEN
  if (!isAuthorized) {
    return (
      <div className="bg-zinc-950 min-h-[70vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border-2 border-black p-6 sm:p-8 rounded-none w-full max-w-sm text-center text-white space-y-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="w-14 h-14 bg-white/10 border-2 border-zinc-800 text-white rounded-none flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]">
            <KeyRound className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold font-sans">Acesso Administrativo</h2>
            <p className="text-xs text-zinc-400">
              Gerencie o estoque físico, campanhas promocionais de roupas e listagem de pedidos da MotoModas.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {!isMock && (
              <div className="pt-1 border-b border-zinc-800/60 pb-5 space-y-3">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-left pl-1">Autenticação Google:</p>
                <GlassEffect
                  id="google-login-btn"
                  variant="dark"
                  onClick={onGoogleLogin}
                  className="w-full h-11 rounded-none text-xs font-extrabold gap-2.5 bg-zinc-900 border border-zinc-805"
                >
                  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Entrar com o Google</span>
                </GlassEffect>
                {currentUser ? (
                  <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-none border-2 border-black text-[10px] font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-zinc-400 truncate max-w-[180px]">{currentUser.email}</span>
                    <span className={isAdminUser ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                      {isAdminUser ? "ADMIN" : "SEM PERMISSÃO"}
                    </span>
                  </div>
                ) : (
                  <p className="text-[9px] text-zinc-500 leading-normal text-left pl-1">
                    Nota: O Firebase exige o e-mail do g-mail do proprietário cadastrado para poder ler pedidos ou editar o estoque.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-1">Senha Lojista (Modo Leitura):</label>
              <input
                id="admin-password"
                type="password"
                placeholder="Insira a senha do lojista"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPassError(false);
                }}
                className={`w-full bg-zinc-950 border-2 text-center px-4 py-3 rounded-none text-xs font-semibold tracking-wider text-white focus:outline-none transition-all ${
                  passError ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-white'
                }`}
              />
            </div>

            {passError && (
              <p className="text-red-500 text-[10px] font-bold py-1 bg-red-950/25 rounded-none border-2 border-red-900/35">
                ❌ Senha incorreta. Experimente: <code className="text-zinc-200">motomodas123</code>
              </p>
            )}

            <GlassEffect
              id="admin-login-submit"
              variant="amber"
              onClick={(e) => {
                e.preventDefault();
                const formEl = document.getElementById('admin-login-submit')?.closest('form');
                if (formEl) formEl.requestSubmit();
              }}
              className="w-full h-11 rounded-none text-xs font-black uppercase tracking-wider"
            >
              <span>ENTRAR COM SENHA LOCAL</span>
            </GlassEffect>
          </form>

          <p className="text-[10px] text-zinc-500 font-medium">
            Senha padrão de testes do app: <span className="font-bold text-zinc-400">motomodas123</span>
          </p>
        </motion.div>
      </div>
    );
  }

  // AUTHENTICATED REAL-TIME PANEL
  return (
    <div className="space-y-8 pb-12 text-white">

      {/* Active Database Authentication Banner */}
      {!isMock && (
        <div className="bg-zinc-950 border-2 border-black p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-none flex items-center justify-center ${isAdminUser ? 'bg-emerald-550/10 text-emerald-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-amber-500/10 text-amber-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>
              <ShieldCheck className="w-5.5 h-5.5 animate-pulse" />
            </div>
            <div className="text-left space-y-0.5">
              <p className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                Firebase Firestore Ativo
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              </p>
              <p className="text-[11px] text-zinc-400">
                {currentUser ? (
                  <>Autenticado como: <span className="text-zinc-200 font-semibold">{currentUser.email}</span> &bull; {isAdminUser ? 'Acesso Administrativo Autorizado' : 'Acesso de Leitura (Sem Permissão Master)'}</>
                ) : (
                  <>Modo Local Restrito &bull; Conecte seu e-mail do g-mail do lojista para liberar edição e pedidos</>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!currentUser ? (
              <button
                onClick={onGoogleLogin}
                className="bg-white hover:bg-neutral-100 text-black text-[11px] font-black px-4 py-2 rounded-none flex items-center gap-1.5 transition-colors cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Conectar Conta Google
              </button>
            ) : (
              <button
                onClick={onGoogleLogout}
                className="bg-zinc-850 hover:bg-zinc-800 hover:text-red-400 text-zinc-300 text-[11px] font-black px-4 py-2 rounded-none flex items-center gap-1 transition-all cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair do Google
              </button>
            )}
            {isAuthenticated && (
              <button
                onClick={() => setIsAuthenticated(false)}
                className="bg-zinc-950 hover:bg-zinc-900 text-zinc-400 text-[11px] font-bold px-4 py-2 rounded-none transition-colors cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Trocar de Conta
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. ANALYTICS METRIC CARDS OVERVIEW */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        
        {/* Total revenue */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Faturamento Confirmado</p>
            <p className="text-lg sm:text-2xl font-black text-amber-500">
              R$ {totalRevenue.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="bg-zinc-950 text-emerald-500 p-2.5 rounded-xl border border-emerald-900/30 hidden sm:block">
            <DollarSign className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Pending Orders Count */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Pedidos Pendentes</p>
            <p className="text-lg sm:text-2xl font-black text-zinc-100">{pendingOrdersCount} novos</p>
          </div>
          <div className="bg-zinc-950 text-amber-500 p-2.5 rounded-xl border border-amber-900/30 hidden sm:block">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock count */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Pouco Estoque (&le;3)</p>
            <p className={`text-lg sm:text-2xl font-black ${lowStockProductsCount > 0 ? 'text-amber-500 animate-bounce' : 'text-zinc-100'}`}>
              {lowStockProductsCount} produtos
            </p>
          </div>
          <div className="bg-zinc-950 text-amber-500 p-2.5 rounded-xl border border-amber-900/30 hidden sm:block">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Out of Stock count */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Produtos Esgotados</p>
            <p className={`text-lg sm:text-2xl font-black ${outOfStockProductsCount > 0 ? 'text-red-500 font-black' : 'text-zinc-100'}`}>
              {outOfStockProductsCount} produtos
            </p>
          </div>
          <div className="bg-zinc-950 text-red-500 p-2.5 rounded-xl border border-red-900/30 hidden sm:block">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

      </section>

      {/* 2. SUB-NAVIGATION MANAGEMENT BAR */}
      <section className="bg-zinc-900/80 border border-zinc-800 p-2 rounded-2xl flex flex-wrap gap-2 justify-between items-center shadow-lg">
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
          <GlassEffect
            variant={activeSubTab === 'inventory' ? 'amber' : 'dark'}
            onClick={() => { setActiveSubTab('inventory'); setIsAddingProduct(false); }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold shrink-0"
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Gerenciar Estoque</span>
          </GlassEffect>

          <GlassEffect
            variant={activeSubTab === 'promotions' ? 'amber' : 'dark'}
            onClick={() => { setActiveSubTab('promotions'); setIsAddingPromo(false); }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold shrink-0"
          >
            <Megaphone className="w-4 h-4 shrink-0" />
            <span>Promoções Sazonais</span>
          </GlassEffect>

          <GlassEffect
            variant={activeSubTab === 'orders' ? 'amber' : 'dark'}
            onClick={() => { setActiveSubTab('orders'); }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold shrink-0"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Pedidos WhatsApp ({orders.length})</span>
          </GlassEffect>
        </div>

        {/* Right side custom actions */}
        <div className="w-full sm:w-auto pt-2 sm:pt-0 pr-1 select-none">
          {activeSubTab === 'inventory' && !isAddingProduct && (
            <GlassEffect
              variant="amber"
              onClick={() => setIsAddingProduct(true)}
              className="px-3.5 py-1.5 text-xs font-extrabold rounded-xl"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Nova Roupa</span>
            </GlassEffect>
          )}

          {activeSubTab === 'promotions' && !isAddingPromo && (
            <GlassEffect
              variant="amber"
              onClick={() => setIsAddingPromo(true)}
              className="px-3.5 py-1.5 text-xs font-extrabold rounded-xl"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Criar Banner</span>
            </GlassEffect>
          )}

          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-zinc-500 hover:text-zinc-300 text-[10px] font-mono leading-none tracking-wider underline cursor-pointer ml-3 sm:ml-0"
          >
            Sair do Painel
          </button>
        </div>
      </section>

      {/* 3. SUB TAB PANELS RENDERS */}
      <section className="bg-zinc-900/40 border border-zinc-805 rounded-3xl p-4 sm:p-6 shadow-inner">
        
        {/* TAB A: INVENTORY STOCK MANAGEMENT */}
        {activeSubTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* Adding Product Form overlay */}
            <AnimatePresence>
              {isAddingProduct && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateProduct}
                  className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl space-y-4 shadow-xl overflow-hidden text-left"
                >
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-amber-500" /> Cadastrar Nova Roupa no Catálogo
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingProduct(false)}
                      className="text-zinc-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Nome do Produto:</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Camiseta Linha Algodão"
                        value={newProd.name}
                        onChange={(e) => setNewProd({...newProd, name: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Categoria:</label>
                      <select
                        value={newProd.category}
                        onChange={(e) => setNewProd({...newProd, category: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      >
                        <option value="Camisetas">Camisetas</option>
                        <option value="Calças">Calças</option>
                        <option value="Polos">Polos</option>
                        <option value="Bermudas">Bermudas</option>
                        <option value="Casacos">Casacos</option>
                        <option value="Acessórios">Acessórios</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Preço de Venda (R$):</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        placeholder="Ex: 89,90"
                        value={newProd.price || ''}
                        onChange={(e) => setNewProd({...newProd, price: parseFloat(e.target.value) || 0})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-zinc-400 font-bold">Descrição Detalhada:</label>
                      <input 
                        type="text" 
                        placeholder="Tecido, corte, detalhes adicionais ou caimento..."
                        value={newProd.description}
                        onChange={(e) => setNewProd({...newProd, description: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Estoque Inicial:</label>
                      <input 
                        type="number" 
                        required
                        placeholder="Ex: 15"
                        value={newProd.stock || ''}
                        onChange={(e) => setNewProd({...newProd, stock: parseInt(e.target.value) || 0})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <ImageDropZone
                        label="Imagem do Produto (Anexar, Arrastar ou Pressionar Ctrl+V para Colar):"
                        value={newProd.imageUrl || ''}
                        onChange={(val) => setNewProd({...newProd, imageUrl: val})}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Tamanhos (separados por vírgula):</label>
                      <input 
                        type="text" 
                        placeholder="P, M, G, GG"
                        value={newProd.sizes?.join(', ')}
                        onChange={(e) => setNewProd({...newProd, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-zinc-350 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Cores (separadas por vírgula):</label>
                      <input 
                        type="text" 
                        placeholder="Preto, Branco, Azul"
                        value={newProd.colors?.join(', ')}
                        onChange={(e) => setNewProd({...newProd, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-zinc-350 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-zinc-850">
                    <button 
                      type="button" 
                      onClick={() => setIsAddingProduct(false)}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2 rounded-xl text-xs hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Salvar no Estoque
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Editing Product Form overlay */}
            <AnimatePresence>
              {editingProduct && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleEditProductSubmit}
                  className="bg-zinc-950 border border-amber-500/35 p-5 rounded-3xl space-y-4 shadow-xl overflow-hidden text-left"
                >
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Edit2 className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> Editar Roupa no Catálogo: <span className="text-amber-400 font-extrabold">{editingProduct.name}</span>
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setEditingProduct(null)}
                      className="text-zinc-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Nome do Produto:</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Camiseta Linha Algodão"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Categoria:</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      >
                        <option value="Camisetas">Camisetas</option>
                        <option value="Calças">Calças</option>
                        <option value="Polos">Polos</option>
                        <option value="Bermudas">Bermudas</option>
                        <option value="Casacos">Casacos</option>
                        <option value="Acessórios">Acessórios</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Preço de Venda (R$):</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        placeholder="Ex: 89,90"
                        value={editingProduct.price || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-zinc-400 font-bold">Descrição Detalhada:</label>
                      <input 
                        type="text" 
                        placeholder="Tecido, corte, detalhes adicionais ou caimento..."
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Estoque Inicial:</label>
                      <input 
                        type="number" 
                        required
                        placeholder="Ex: 15"
                        value={editingProduct.stock || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <ImageDropZone
                        label="Imagem do Produto (Anexar, Arrastar ou Pressionar Ctrl+V para Colar):"
                        value={editingProduct.imageUrl || ''}
                        onChange={(val) => setEditingProduct({...editingProduct, imageUrl: val})}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Tamanhos (separados por vírgula):</label>
                      <input 
                        type="text" 
                        placeholder="P, M, G, GG"
                        value={editingProduct.sizes?.join(', ')}
                        onChange={(e) => setEditingProduct({...editingProduct, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-zinc-350 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Cores (separadas por vírgula):</label>
                      <input 
                        type="text" 
                        placeholder="Preto, Branco, Azul"
                        value={editingProduct.colors?.join(', ')}
                        onChange={(e) => setEditingProduct({...editingProduct, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-zinc-350 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-zinc-850">
                    <button 
                      type="button" 
                      onClick={() => setEditingProduct(null)}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2 rounded-xl text-xs hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Inventory table spreadsheet */}
            <div className="border border-zinc-800 rounded-2xl overflow-x-auto bg-zinc-950/80">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-900 text-zinc-400 font-bold border-b border-zinc-800 uppercase tracking-widest text-[9px]">
                    <th className="px-4 py-3">Roupa</th>
                    <th className="px-4 py-3 text-center">Preço</th>
                    <th className="px-4 py-3 text-center">Qtd Estoque</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Novidade?</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-900/40">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-zinc-900 overflow-hidden shrink-0">
                          <img referrerPolicy="no-referrer" src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-100">{p.name}</p>
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase">{p.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-amber-400">
                        R$ {p.price.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleUpdateStock(p, 'down')}
                            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-white p-1 rounded cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <span className={`font-mono font-bold w-10 text-center text-sm ${
                            p.stock === 0 ? 'text-red-500' : p.stock <= 3 ? 'text-amber-500' : 'text-emerald-400'
                          }`}>
                            {p.stock}
                          </span>
                          
                          <button
                            onClick={() => handleUpdateStock(p, 'up')}
                            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-white p-1 rounded cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.stock === 0 ? (
                          <span className="bg-red-500/10 text-red-500 border border-red-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            Sem Estoque
                          </span>
                        ) : p.stock <= 3 ? (
                          <span className="bg-amber-500/10 text-amber-500 border border-amber-400/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            Crítico ({p.stock})
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            Disponível
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleNew(p)}
                          className="mx-auto block text-zinc-400 hover:text-white transition-all cursor-pointer"
                        >
                          {p.isNew ? (
                            <ToggleRight className="w-6 h-6 text-amber-500" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-zinc-600" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="bg-zinc-905 border border-zinc-900 text-zinc-400 hover:text-amber-400 p-1.5 rounded-lg hover:border-amber-950 hover:bg-amber-950/20 cursor-pointer transition-all"
                            title="Editar produto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deseja mesmo remover ${p.name} do catálogo?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="bg-zinc-905 border border-zinc-900 text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:border-red-950 hover:bg-red-950/10 cursor-pointer"
                            title="Deletar produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB B: SEASONAL PROMOTIONS AND BANNERS */}
        {activeSubTab === 'promotions' && (
          <div className="space-y-6 text-left">
            
            {/* Adding Promotions Banner form */}
            <AnimatePresence>
              {isAddingPromo && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreatePromo}
                  className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl space-y-4 shadow-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-2 text-xs font-bold">
                    <p className="text-white flex items-center gap-1.5 uppercase">
                      <Megaphone className="w-4.5 h-4.5 text-amber-500 animate-bounce" /> Criar Banner de Campanha Sazonal
                    </p>
                    <button type="button" onClick={() => setIsAddingPromo(false)} className="text-zinc-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Título da Promoção (Ex: Black Friday):</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Dia dos Pais Premiun"
                        value={newPromo.title}
                        onChange={(e) => setNewPromo({...newPromo, title: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Texto de Desconto Comercial (Badge):</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Até 30% OFF / Compre 1 Leve 2"
                        value={newPromo.discount}
                        onChange={(e) => setNewPromo({...newPromo, discount: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Descrição ou Subtítulo complementar:</label>
                      <input 
                        type="text" 
                        placeholder="Condições e vantagens adicionais..."
                        value={newPromo.subtitle}
                        onChange={(e) => setNewPromo({...newPromo, subtitle: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Categoria Filtro Alvo:</label>
                      <select
                        value={newPromo.categoryFilter}
                        onChange={(e) => setNewPromo({...newPromo, categoryFilter: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
                      >
                        <option value="Todos">Todas as Roupas</option>
                        {Array.from(new Set(products.map(p => p.category))).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <ImageDropZone
                        label="Imagem de Capa do Banner (Anexar, Arrastar ou Pressionar Ctrl+V para Colar):"
                        value={newPromo.bannerUrl || ''}
                        onChange={(val) => setNewPromo({...newPromo, bannerUrl: val})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-zinc-850">
                    <button 
                      type="button" 
                      onClick={() => setIsAddingPromo(false)}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2 rounded-xl text-xs hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Confirmar Campanha
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Promotions Banner List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promotions.map((promo) => (
                <div 
                  key={promo.id} 
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden relative flex flex-col justify-between shadow-lg h-36"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center brightness-[0.3]"
                    style={{ backgroundImage: `url('${promo.bannerUrl}')` }}
                  />
                  
                  <div className="relative z-15 p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex gap-2 items-center justify-between">
                        <span className="bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          {promo.discount}
                        </span>
                        <button
                          onClick={async () => {
                            await onSavePromotion({
                              ...promo,
                              isActive: !promo.isActive
                            });
                          }}
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border cursor-pointer ${
                            promo.isActive 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-zinc-800/10 text-zinc-400 border-zinc-800'
                          }`}
                        >
                          {promo.isActive ? 'Ativa' : 'Pausada'}
                        </button>
                      </div>
                      
                      <h4 className="font-extrabold text-sm text-zinc-100 mt-1">{promo.title}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{promo.subtitle}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                      <span className="text-[9px] text-zinc-500 font-mono uppercase">
                        Filtro: {promo.categoryFilter || 'Todos'}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('Deseja mesmo derrubar esta promoção?')) {
                            onDeletePromotion(promo.id);
                          }
                        }}
                        className="text-zinc-500 hover:text-red-400 cursor-pointer"
                        title="Remover promoção"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB C: CLIENT ORDER LOGS RECEIVED */}
        {activeSubTab === 'orders' && (
          <div className="space-y-6 text-left">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <ShoppingBag className="w-5 h-5 text-amber-500" /> Registro de Pedidos via Catálogo
            </h3>

            {orders.length === 0 ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-10 text-center text-zinc-500 max-w-sm mx-auto">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3" />
                <p className="font-bold text-xs text-zinc-300">Nenhum pedido finalizado ainda</p>
                <p className="text-[10px] text-zinc-650 mt-1">Os pedidos efetuados pelos clientes serão indexados e salvos aqui.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...orders].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
                  <div 
                    key={order.id}
                    className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg flex flex-col md:flex-row justify-between gap-4"
                  >
                    
                    {/* Buyer summary */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded text-[10px] font-bold font-mono tracking-wider">
                          Nº {order.id}
                        </span>
                        
                        <span className="text-zinc-500 text-[10px] font-mono leading-none">
                          {new Date(order.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-zinc-150">
                        {order.customerName}
                      </h4>
                      {order.customerPhone && (
                        <p className="text-[11px] text-zinc-400">
                          Fone: <span className="text-zinc-300 font-bold">{order.customerPhone}</span>
                        </p>
                      )}

                      {/* Items description list */}
                      <div className="mt-2 text-[11px] bg-zinc-900/60 p-3 rounded-xl border border-zinc-905 space-y-1 max-w-md">
                        <p className="font-bold text-[9px] uppercase tracking-wider text-zinc-500">Peças Escolhidas:</p>
                        {order.items.map((it, itemIdx) => (
                          <div key={it.productId || itemIdx} className="flex justify-between text-[11px] text-zinc-300">
                            <span>
                              • <strong>{it.quantity}x</strong> {it.name} <span className="text-zinc-500 text-[10px]">[{it.chosenSize} - {it.chosenColor}]</span>
                            </span>
                            <span className="font-bold">
                              R$ {(it.price * it.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order management actions */}
                    <div className="flex flex-row md:flex-col justify-between items-end gap-3 self-stretch shrink-0 md:border-l md:border-zinc-850 md:pl-5">
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Valor Pedido</p>
                        <p className="text-base font-black text-amber-500">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                      </div>

                      {/* Status selectors */}
                      <div className="space-y-2 text-right">
                        <div className="flex items-center gap-1">
                          <button
                            id={`status-pending-${order.id}`}
                            onClick={() => handleUpdateOrderStatus(order, 'pendente')}
                            className={`px-2 py-1 rounded text-[9px] font-bold transition-all cursor-pointer border ${
                              order.status === 'pendente' 
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                : 'bg-zinc-900 border-transparent text-zinc-500'
                            }`}
                          >
                            Pendente
                          </button>
                          
                          <button
                            id={`status-complete-${order.id}`}
                            onClick={() => handleUpdateOrderStatus(order, 'finalizado')}
                            className={`px-2 py-1 rounded text-[9px] font-bold transition-all cursor-pointer border ${
                              order.status === 'finalizado' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-zinc-900 border-transparent text-zinc-500'
                            }`}
                          >
                            Concluído
                          </button>

                          <button
                            id={`status-cancel-${order.id}`}
                            onClick={() => handleUpdateOrderStatus(order, 'cancelado')}
                            className={`px-2 py-1 rounded text-[9px] font-bold transition-all cursor-pointer border ${
                              order.status === 'cancelado' 
                                ? 'bg-red-500/10 text-red-500 border-red-500/30'
                                : 'bg-zinc-900 border-transparent text-zinc-500'
                            }`}
                          >
                            Cancelar
                          </button>
                        </div>

                        {/* Quick Delete */}
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              if (confirm('Deseja mesmo deletar este registro de pedido de forma permanente?')) {
                                onDeleteOrder(order.id);
                              }
                            }}
                            className="text-zinc-650 hover:text-red-400 leading-none flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remover Registro
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </section>

    </div>
  );
}
