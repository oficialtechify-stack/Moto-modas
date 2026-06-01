import { useState } from 'react';
import { Search, Sparkles, AlertTriangle, CheckCircle2, ShoppingBag, Plus, Minus, X, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Promotion, CartItem } from '../types';
import { GlassEffect } from './GlassEffect';
import InteractiveWaveShader from './InteractiveWaveShader';

interface CatalogViewProps {
  products: Product[];
  promotions: Promotion[];
  onAddToCart: (item: CartItem) => void;
}

export default function CatalogView({ products, promotions, onAddToCart }: CatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [onlyNew, setOnlyNew] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modal configuration states
  const [chosenSize, setChosenSize] = useState('');
  const [chosenColor, setChosenColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  // Get unique categories
  const categories = ['Todos', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter products based on search, category and isNew toggles
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesNew = !onlyNew || p.isNew;
    return matchesSearch && matchesCategory && matchesNew;
  });

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setChosenSize(product.sizes[0] || '');
    setChosenColor(product.colors[0] || '');
    setQuantity(1);
    setAddedMessage(false);
  };

  const handleAddToCartClick = () => {
    if (!selectedProduct) return;
    
    onAddToCart({
      product: selectedProduct,
      quantity,
      chosenSize,
      chosenColor,
    });

    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
      setSelectedProduct(null);
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. MOTO MODAS PREMIUM HERO SECTION */}
      <section className="relative w-full overflow-hidden border-2 border-black rounded-none shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] bg-zinc-950 px-4 py-12 sm:py-20 flex flex-col items-center">
        
        {/* Interactive neon-wave backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <InteractiveWaveShader opacity={0.4} />
        </div>
        <div 
          className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
          style={{
            backgroundImage: `url("https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png")`,
            backgroundSize: "200px",
            backgroundRepeat: "repeat"
          }}
        />

        {/* Massive Background Outlined Text */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 flex items-center justify-center select-none pointer-events-none opacity-5 overflow-hidden">
          <span className="text-[12rem] sm:text-[24rem] font-black italic uppercase tracking-tighter text-white font-mono leading-none">
            MOTO
          </span>
        </div>

        {/* Content Elements on Top */}
        <div className="relative z-10 w-full flex flex-col items-center">
          
          {/* Neon Yellow Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-[#e6ff00] text-black text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 mb-6 rounded-none font-mono border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            COLEÇÃO 2024 / RECIFE, PE
          </motion.div>

          {/* High Impact Display Title */}
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4.5xl sm:text-6xl md:text-7xl lg:text-8xl font-sans italic font-black uppercase leading-[0.85] text-white tracking-wider text-center select-none mb-4 flex flex-col items-center"
          >
            <span className="block drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">MARCAS</span>
            <span className="block mt-1 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] text-[#e6ff00]">
              FAMOSAS
            </span>
          </motion.h2>

          {/* Subtitle describing styles */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm font-mono tracking-widest text-center text-zinc-300 max-w-xl px-4 uppercase mb-12 font-bold leading-relaxed"
          >
            Venda de roupas das principais marcas famosas do mercado. Encontre os estilos imperativos: <span className="text-[#e6ff00]">CASUAL</span> • <span className="text-[#e6ff00]">SOCIAL</span> • <span className="text-[#e6ff00]">STREET</span> com a máxima exclusividade.
          </motion.p>

          {/* 4 Tall Streetwear Model Photos in red brick background */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl w-full px-2 mb-10">
            {[
              "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80"
            ].map((imgUrl, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="aspect-[3/4.2] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-zinc-950 overflow-hidden relative group rounded-none"
              >
                <img
                  referrerPolicy="no-referrer"
                  src={imgUrl}
                  alt={`Coleção Moto Modas ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </motion.div>
            ))}
          </div>

          {/* Hero Buttons block */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md px-4">
            <button
              onClick={() => {
                const el = document.getElementById('catalog-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-[#e6ff00] hover:bg-white text-black font-black uppercase text-xs sm:text-sm tracking-widest py-3 px-8 border-2 border-black flex items-center justify-center gap-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-0 hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer rounded-none"
            >
              VER COLEÇÃO →
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('catalog-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-transparent hover:bg-white text-white hover:text-black font-black uppercase text-xs sm:text-sm tracking-widest py-3 px-8 border-2 border-white hover:border-black transition-all cursor-pointer rounded-none"
            >
              CATÁLOGO
            </button>
          </div>

        </div>
      </section>

      {/* Anchor for automatic scrolls */}
      <div id="catalog-anchor" className="scroll-mt-6" />

      {/* INFINITE STREETWEAR MARQUEE TICKER TAPE */}
      <div className="w-full bg-[#e6ff00] py-2 border-y-2 border-black overflow-hidden select-none flex items-center my-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)]">
        <div className="flex animate-marquee whitespace-nowrap gap-12 text-xs font-black italic text-black uppercase tracking-widest">
          {/* We repeat the pattern enough to span multiple screen widths */}
          <div className="flex shrink-0 items-center gap-12 uppercase font-black font-mono">
            <span>RECIFE</span> <span>🏍️</span> <span>MOTO ESTILO</span> <span>✦</span> <span>ORIGINAL</span> <span>🏍️</span> <span>URBAN CULTURE</span> <span>✦</span> <span>STREETWEAR</span> <span>🏍️</span> <span>MOTO MODAS</span> <span>✦</span>
          </div>
          <div className="flex shrink-0 items-center gap-12 uppercase font-black font-mono">
            <span>RECIFE</span> <span>🏍️</span> <span>MOTO ESTILO</span> <span>✦</span> <span>ORIGINAL</span> <span>🏍️</span> <span>URBAN CULTURE</span> <span>✦</span> <span>STREETWEAR</span> <span>🏍️</span> <span>MOTO MODAS</span> <span>✦</span>
          </div>
          <div className="flex shrink-0 items-center gap-12 uppercase font-black font-mono">
            <span>RECIFE</span> <span>🏍️</span> <span>MOTO ESTILO</span> <span>✦</span> <span>ORIGINAL</span> <span>🏍️</span> <span>URBAN CULTURE</span> <span>✦</span> <span>STREETWEAR</span> <span>🏍️</span> <span>MOTO MODAS</span> <span>✦</span>
          </div>
        </div>
      </div>

      {/* 2. FILTERS AND SECH PANEL */}
      <section className="bg-zinc-950 border-2 border-zinc-800 p-4 sm:p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] rounded-none">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="w-full md:max-w-md relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              id="product-search"
              type="text"
              placeholder="Buscar polo, calça jeans, camiseta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-none bg-zinc-950 border-2 border-zinc-800 focus:border-[#e6ff00] text-white placeholder-zinc-500 text-sm focus:outline-none transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto select-none">
            <GlassEffect
              variant={onlyNew ? 'amber' : 'dark'}
              onClick={() => setOnlyNew(!onlyNew)}
              className="px-4 py-2.5 rounded-none text-xs gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Chegaram Novidades</span>
            </GlassEffect>
          </div>
        </div>

        {/* Category Horizontal Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin select-none">
          {categories.map((cat, i) => (
            <GlassEffect
              key={cat || i}
              variant={selectedCategory === cat ? 'amber' : 'dark'}
              onClick={() => setSelectedCategory(cat)}
              className="px-4 py-2.5 rounded-none text-xs whitespace-nowrap shrink-0 font-bold uppercase tracking-wider"
            >
              {cat === 'Todos' ? '✦ MOSTRAR TODOS' : cat}
            </GlassEffect>
          ))}
        </div>
      </section>

      {/* 3. PRODUCT LIST GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            PRODUTOS DISPONÍVEIS
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full font-mono font-medium">
              {filteredProducts.length} itens encontrados
            </span>
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-zinc-900/10 border border-dashed border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 max-w-sm mx-auto">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-zinc-600 animate-pulse" />
            <p className="font-bold text-sm text-zinc-300">Nenhum produto encontrado</p>
            <p className="text-xs text-zinc-500 mt-1">Experimente limpar filtros ou digitar outro termo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p, index) => {
                const isOutOfStock = p.stock === 0;
                const isLowStock = p.stock > 0 && p.stock <= 3;

                return (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.4) }}
                    onClick={() => !isOutOfStock && handleOpenDetail(p)}
                    className={`bg-zinc-950 border-2 border-zinc-800 text-white rounded-none p-3 sm:p-4 flex flex-col group relative transition-all duration-300 select-none ${
                      isOutOfStock ? 'opacity-50' : 'hover:border-[#e6ff00] cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(230,255,0,0.85)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                    }`}
                  >
                    {/* New Badge */}
                    {p.isNew && !isOutOfStock && (
                      <span className="absolute top-4 left-4 z-10 bg-[#e6ff00] text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-none border border-black shadow-md flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 shrink-0" />
                        NOVIDADE
                      </span>
                    )}

                    {/* Image Area */}
                    <div className="aspect-square w-full bg-zinc-900 rounded-none border border-zinc-850 overflow-hidden mb-3 relative">
                      <img
                        referrerPolicy="no-referrer"
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                          <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase">
                            ESGOTADO
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Metadata */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Category Label */}
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                          {p.category}
                        </span>
                        
                        {/* Title */}
                        <h4 className="font-extrabold text-sm sm:text-base text-zinc-100 group-hover:text-[#e6ff00] transition-colors mt-0.5 line-clamp-1">
                          {p.name}
                        </h4>

                        {/* Description snippet */}
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800">
                        {/* Real-Time Stock Status */}
                        <div className="mb-2 text-[10px] font-bold">
                          {isOutOfStock ? (
                            <span className="text-red-500 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Estoque esgotado
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[#e6ff00] flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Apenas {p.stock} restantes!
                            </span>
                          ) : (
                            <span className="text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Estoque confirmado ({p.stock})
                            </span>
                          )}
                        </div>

                        {/* Price & Cart button */}
                        <div className="flex items-center justify-between">
                          <p className="text-base sm:text-lg font-black text-white">
                            R$ {p.price.toFixed(2).replace('.', ',')}
                          </p>
                          
                          {!isOutOfStock && (
                            <GlassEffect
                              variant="amber"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(p);
                              }}
                              className="w-10 h-10 rounded-none"
                            >
                              <Plus className="w-5 h-5 shrink-0" />
                            </GlassEffect>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* 4. PRODUCT CONFIGURATOR MODAL / DRAWER */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 15, opacity: 0 }}
              className="relative bg-zinc-950 border-2 border-black w-full max-w-2xl rounded-none overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-10 flex flex-col md:flex-row text-white"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-20 bg-zinc-900 border-2 border-black text-white hover:bg-[#e6ff00] hover:text-black p-2 rounded-none cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Product Visual */}
              <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-[450px] bg-zinc-900 relative border-b-2 md:border-b-0 md:border-r-2 border-zinc-850">
                <img
                  referrerPolicy="no-referrer"
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Visual Novelty tag */}
                {selectedProduct.isNew && (
                  <span className="absolute top-4 left-4 z-10 bg-[#e6ff00] text-black text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                    Novidade
                  </span>
                )}
              </div>

              {/* Configure Fields */}
              <div className="w-full md:w-1/2 p-6 flex flex-col justify-between h-[450px] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-semibold text-[#e6ff00] font-mono tracking-widest uppercase">
                      {selectedProduct.category}
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-1 leading-tight">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-2xl font-black text-[#e6ff00] mt-2">
                      R$ {selectedProduct.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    {selectedProduct.description}
                  </p>

                  {/* Size Options */}
                  {selectedProduct.sizes?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-zinc-300">Escolha o Tamanho:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProduct.sizes.map((sz) => (
                          <GlassEffect
                            key={sz}
                            variant={chosenSize === sz ? 'amber' : 'dark'}
                            onClick={() => setChosenSize(sz)}
                            className="px-3.5 py-2 rounded-none text-xs font-black"
                          >
                            <span>{sz}</span>
                          </GlassEffect>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Options */}
                  {selectedProduct.colors?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-zinc-300">Escolha a Cor:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedProduct.colors.map((col) => (
                          <GlassEffect
                            key={col}
                            variant={chosenColor === col ? 'amber' : 'dark'}
                            onClick={() => setChosenColor(col)}
                            className="px-3.5 py-2 rounded-none text-xs font-black"
                          >
                            <span>{col}</span>
                          </GlassEffect>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Configuration bounded by real stock */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <p className="font-bold text-zinc-300">Quantidade:</p>
                      <span className="text-emerald-500 font-bold font-mono">
                        (Em estoque: {selectedProduct.stock})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-zinc-950 border-2 border-zinc-800 rounded-none overflow-hidden p-1">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-1.5 text-zinc-400 hover:text-white active:scale-95 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 text-sm font-bold text-center w-12 font-mono text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                          className="p-1.5 text-zinc-400 hover:text-white active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Total do item: R$ {(selectedProduct.price * quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confirm additions or successful warnings */}
                <div className="mt-6 pt-4 border-t border-zinc-800">
                  {addedMessage ? (
                    <div className="bg-emerald-500/10 border-2 border-emerald-400 text-emerald-400 text-center py-2.5 rounded-none text-xs font-black italic uppercase tracking-wider flex items-center justify-center gap-2 animate-bounce">
                      <CheckCircle2 className="w-4.5 h-4.5" /> Adicionado com sucesso!
                    </div>
                  ) : (
                    <GlassEffect
                      variant="emerald"
                      onClick={handleAddToCartClick}
                      disabled={selectedProduct.stock === 0}
                      className="w-full py-3 h-11 rounded-none text-xs"
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" />
                      <span>ADICIONAR AO PEDIDO</span>
                    </GlassEffect>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
