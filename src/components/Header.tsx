import { Shirt, MapPin, Settings2, ShoppingCart, Instagram, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassEffect } from './GlassEffect';
import { MorphingLogoText } from './GooeyText';

interface HeaderProps {
  currentTab: 'catalog' | 'map' | 'admin';
  setCurrentTab: (tab: 'catalog' | 'map' | 'admin') => void;
  cartCount: number;
  cartTotal: number;
  onCartOpen: () => void;
}

export default function Header({
  currentTab,
  setCurrentTab,
  cartCount,
  cartTotal,
  onCartOpen
 }: HeaderProps) {
  const scrollToFooter = () => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactClick = () => {
    // Open WhatsApp link or scroll to map coordinates
    window.open('https://api.whatsapp.com/send?phone=5581985555951&text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20as%20roupas%20da%20Moto%2520Modas.', '_blank');
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 border-b-2 border-black text-white px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo - Styled exactly like the second photo with live morphing effect */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setCurrentTab('catalog')}>
          <div className="bg-[#e6ff00] text-black w-9 h-9 flex items-center justify-center font-black text-xl rounded-none border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            M
          </div>
          <div className="flex flex-col justify-center min-h-[36px]">
            <MorphingLogoText 
              texts={['MOTO MODAS', 'MOTO ESTILO', 'MOTO ORIGINAL', 'MOTO MODAS']} 
              className="w-44"
            />
          </div>
        </div>

        {/* Navigation links & Actions - Styled exactly like the second photo */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3 w-full md:w-auto">
          
          <nav className="flex items-center gap-5 text-xs font-black uppercase tracking-widest text-zinc-300">
            <button
              onClick={() => setCurrentTab('catalog')}
              className={`hover:text-[#e6ff00] transition-colors cursor-pointer ${currentTab === 'catalog' ? 'text-[#e6ff00]' : ''}`}
            >
              COLEÇÃO
            </button>
            
            <button
              onClick={() => setCurrentTab('map')}
              className={`hover:text-[#e6ff00] transition-colors cursor-pointer ${currentTab === 'map' ? 'text-[#e6ff00]' : ''}`}
            >
              ONDE ESTAMOS
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`hover:text-[#e6ff00] transition-colors cursor-pointer ${currentTab === 'admin' ? 'text-[#e6ff00]' : ''}`}
            >
              PAINEL
            </button>

            <button
              onClick={scrollToFooter}
              className="hover:text-[#e6ff00] transition-colors cursor-pointer"
            >
              SOBRE NÓS
            </button>

            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              className="text-zinc-300 hover:text-[#e6ff00] transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </nav>

          {/* Contact and Cart Actions */}
          <div className="flex items-center gap-3">
            {/* Dynamic Cart Button - Fits the second photo style */}
            <button
              onClick={onCartOpen}
              className="relative px-3.5 py-1.5 bg-black border border-zinc-800 hover:border-[#e6ff00] hover:text-[#e6ff00] text-white rounded-none text-[11px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>CARRINHO</span>
              {cartCount > 0 && (
                <span className="bg-[#e6ff00] text-black text-[9px] font-black h-4 px-1 flex items-center justify-center border border-black font-mono">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Neon Yellow CONTATO button - Matched exactly to the second photo */}
            <button
              onClick={handleContactClick}
              className="bg-[#e6ff00] hover:bg-white text-black font-black uppercase text-[11px] tracking-widest py-2 px-4 border border-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-0 hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer rounded-none"
            >
              <Send className="w-3.5 h-3.5" />
              <span>CONTATO</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
