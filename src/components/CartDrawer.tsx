import { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Send, 
  MapPin, 
  Truck, 
  Coins,
  CheckCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Order } from '../types';
import { DataService } from '../lib/dataService';
import { GlassEffect } from './GlassEffect';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (productId: string, size: string, color: string, newQty: number) => void;
  onRemoveItem: (productId: string, size: string, color: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'retirada' | 'envio'>('retirada');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const cartTotal = cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);

  const generateWhatsAppUrl = (orderId: string) => {
    const formattedTotal = cartTotal.toFixed(2).replace('.', ',');
    const lineBreak = '%0A';
    
    let message = `*✨ MOTA MODAS - NOVO PEDIDO* [ID #${orderId}]${lineBreak}`;
    message += `----------------------------------------${lineBreak}`;
    message += `*Cliente:* ${customerName}${lineBreak}`;
    if (customerPhone) message += `*WhatsApp:* ${customerPhone}${lineBreak}`;
    message += `*Entrega:* ${deliveryType === 'retirada' ? 'Retirada na Loja (Curado III)' : 'Envio pelos Correios / MotoBoy'}${lineBreak}`;
    if (notes) message += `*Observações:* ${notes}${lineBreak}`;
    message += `----------------------------------------${lineBreak}${lineBreak}`;
    
    message += `*ITENS DO PEDIDO:*${lineBreak}`;
    cartItems.forEach((item) => {
      const itemPrice = item.product.price.toFixed(2).replace('.', ',');
      const itemTotal = (item.product.price * item.quantity).toFixed(2).replace('.', ',');
      message += `• *${item.quantity}x* ${item.product.name}${lineBreak}`;
      message += `  [Tam: ${item.chosenSize} | Cor: ${item.chosenColor}]${lineBreak}`;
      message += `  Preço: R$ ${itemPrice}/un | Subtotal: R$ ${itemTotal}${lineBreak}${lineBreak}`;
    });
    
    message += `----------------------------------------${lineBreak}`;
    message += `*VALOR TOTAL:* R$ ${formattedTotal}${lineBreak}`;
    message += `----------------------------------------${lineBreak}`;
    message += `_Olá MotoModas, acabo de montar meu carrinho no catálogo online. Confirmam a disponibilidade das peças e tamanhos para mim?_`;

    const encodedMessage = encodeURIComponent(message)
      // Restore standard spacing look if needed or just use standard encoding
      .replace(/%20/g, '+');

    // Phone is +5581985555951
    return `https://api.whatsapp.com/send?phone=5581985555951&text=${encodedMessage}`;
  };

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      alert('Por favor, informe seu nome para finalizar seu pedido.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Compile order blueprint
      const orderId = `MM-${Math.floor(1000 + Math.random() * 9000)}`;
      const order: Order = {
        id: orderId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          chosenSize: item.chosenSize,
          chosenColor: item.chosenColor
        })),
        total: cartTotal,
        status: 'pendente',
        createdAt: new Date().toISOString()
      };

      // 2. Transmit to Firebase (updating stock instantly)
      await DataService.saveOrder(order);

      // 3. Clear cart & open WhatsApp tab
      const whatsappUrl = generateWhatsAppUrl(orderId);
      
      setOrderCompleted(true);
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        onClearCart();
        setOrderCompleted(false);
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
        onClose();
        setIsSubmitting(false);
      }, 1500);

    } catch (e) {
      console.error('Falha ao registrar pedido', e);
      setIsSubmitting(false);
      alert('Ocorreu um erro ao salvar o pedido no estoque. Finalizando diretamente no WhatsApp.');
      // Fallback checkout anyway
      const whatsappUrl = generateWhatsAppUrl(`MM-OFF`);
      window.open(whatsappUrl, '_blank');
      onClearCart();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xs"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-zinc-950 border-l-2 border-black text-white flex flex-col h-full shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-base font-black tracking-wider uppercase text-zinc-100 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-white" />
                  SEU CARRINHO
                </h3>
                <button
                  onClick={onClose}
                  className="text-white hover:text-white p-2 rounded-none bg-zinc-900 border-2 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-300 cursor-pointer shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Loader confirmation screen */}
              {orderCompleted ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0.5, rotate: -45 }}
                    animate={{ scale: 1.1, rotate: 0 }}
                    className="w-16 h-16 rounded-none bg-white text-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                  >
                    <CheckCircle className="w-8 h-8" />
                  </motion.div>
                  <h4 className="text-xl font-extrabold text-white">Incrível! Pedido Registrado.</h4>
                  <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                    Estamos atualizando nosso estoque em tempo real e abrindo o WhatsApp do lojista para que você conclua o pagamento.
                  </p>
                  <p className="text-[10px] text-zinc-300 font-mono tracking-widest animate-pulse">
                    DIRECIONANDO VOCÊ EM 1 SEGUNDO...
                  </p>
                </div>
              ) : cartItems.length === 0 ? (
                /* Empty Cart screen */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-500 text-center">
                  <ShoppingBag className="w-16 h-16 text-zinc-800 mb-4 animate-bounce" />
                  <p className="font-extrabold text-zinc-300">Carrinho Vazio</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                    Navegue pelos produtos no catálogo masculino, selecione tamanho/cor e adicione itens para começar!
                  </p>
                  <GlassEffect
                    variant="amber"
                    onClick={onClose}
                    className="mt-6 px-5 py-2.5 rounded-none text-xs"
                  >
                    <span>Voltar ao Catálogo</span>
                  </GlassEffect>
                </div>
              ) : (
                /* Items & Checkout Fields */
                <div className="flex-1 overflow-y-auto flex flex-col h-full scrollbar-thin scrollbar-thumb-zinc-800">
                  
                  {/* Item List section */}
                  <div className="px-4 sm:px-6 py-4 space-y-3 sm:space-y-4 division">
                    {cartItems.map((item, idx) => (
                      <div 
                        key={`${item.product.id}-${item.chosenSize}-${item.chosenColor}`}
                        className="flex gap-3 bg-zinc-950 border-2 border-zinc-850 rounded-none p-3 relative group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <div className="w-16 h-16 rounded-none border border-zinc-800 bg-zinc-950 overflow-hidden shrink-0">
                          <img
                            referrerPolicy="no-referrer"
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-extrabold text-xs sm:text-sm text-zinc-100 truncate pr-4">
                                {item.product.name}
                              </h4>
                              <button
                                onClick={() => onRemoveItem(item.product.id, item.chosenSize, item.chosenColor)}
                                className="text-zinc-600 hover:text-red-500 absolute top-3 right-3 p-1 rounded-none border border-transparent hover:border-red-550 hover:bg-neutral-900 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-mono font-medium mt-0.5">
                              Tamanho: <span className="text-zinc-200 font-bold">{item.chosenSize}</span> | Cor: <span className="text-zinc-200 font-bold">{item.chosenColor}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-900">
                            {/* Quantity buttons */}
                            <div className="flex items-center bg-zinc-950 border-2 border-zinc-800 rounded-none p-0.5 scale-90 -ml-1">
                              <button
                                onClick={() => onUpdateQty(item.product.id, item.chosenSize, item.chosenColor, item.quantity - 1)}
                                className="p-1 text-zinc-500 hover:text-white cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-[11px] font-bold font-mono text-center w-7">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQty(item.product.id, item.chosenSize, item.chosenColor, item.quantity + 1)}
                                className="p-1 text-zinc-500 hover:text-white cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <p className="text-xs font-black text-amber-400">
                              R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Fields form */}
                  <div className="bg-zinc-900 border-t border-zinc-850 p-4 sm:p-6 space-y-3.5 sm:space-y-4 mt-auto">
                    
                    {/* Customer info */}
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                        <FileText className="w-3 h-3" /> IDENTIFICAÇÃO DO PEDIDO
                      </p>
                      <div className="space-y-2">
                        <input
                          id="customer-name"
                          type="text"
                          required
                          placeholder="Seu Nome Completo (Obrigatório)"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-white px-4 py-2.5 rounded-none text-xs text-white focus:outline-none transition-all outline-none font-black uppercase tracking-wider"
                        />
                        <input
                          id="customer-phone"
                          type="tel"
                          placeholder="Seu WhatsApp (Ex: 81 98888-7777)"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-white px-4 py-2.5 rounded-none text-xs text-white focus:outline-none transition-all outline-none font-black uppercase tracking-wider"
                        />
                      </div>
                    </div>

                    {/* Delivery type selectors */}
                    <div className="space-y-1.5 select-none">
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Como deseja obter?</p>
                      <div className="grid grid-cols-2 gap-2">
                        <GlassEffect
                          variant={deliveryType === 'retirada' ? 'amber' : 'dark'}
                          onClick={() => setDeliveryType('retirada')}
                          className="py-2.5 rounded-none text-xs h-10"
                        >
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>Retirar na Loja</span>
                        </GlassEffect>
                        <GlassEffect
                          variant={deliveryType === 'envio' ? 'amber' : 'dark'}
                          onClick={() => setDeliveryType('envio')}
                          className="py-2.5 rounded-none text-xs h-10"
                        >
                          <Truck className="w-3.5 h-3.5 shrink-0" />
                          <span>Envio / Entrega</span>
                        </GlassEffect>
                      </div>

                      {/* Display Delivery Address alerts */}
                      {deliveryType === 'retirada' ? (
                        <div className="bg-zinc-950/80 p-2.5 rounded-none border border-zinc-800 text-[10px] text-zinc-300 flex items-start gap-1.5 leading-relaxed shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]">
                          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-white" />
                          <div>
                            <strong>Retirada física (Grátis):</strong> Avenida Antonio Jacome Bezerra, N: 9 C, Curado III, Jaboatão. Próximo ao metrô ou principais avenidas do Curado.
                          </div>
                        </div>
                      ) : (
                        <div className="bg-zinc-950/80 p-2.5 rounded-none border-2 border-black text-[10px] text-zinc-350 flex items-start gap-1.5 leading-relaxed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <Truck className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
                          <div>
                            <strong>Envio para o Brasil:</strong> Enviamos via Correios (PAC/SEDEX) ou MotoBoy regulamentado. Sujeito à taxa calculada pelo CEP no WhatsApp.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Client Notes */}
                    <input
                      id="cart-notes"
                      type="text"
                      placeholder="Observações adicionais (tamanho, cor, etc.)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-white px-4 py-2.5 rounded-none text-xs text-white focus:outline-none transition-all outline-none font-black uppercase tracking-wider"
                    />

                    {/* Checkout Billing */}
                    <div className="pt-2 border-t border-zinc-800/80 space-y-1.5 text-xs text-zinc-300">
                      <div className="flex items-center justify-between">
                        <span>Subtotal das peças:</span>
                        <span className="font-bold">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Taxa de Entrega:</span>
                        <span className="text-emerald-500 font-bold uppercase text-[10px] font-mono">
                          {deliveryType === 'retirada' ? 'Grátis' : 'A calcular'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-white font-black text-sm pt-1">
                        <span>VALOR TOTAL:</span>
                        <span className="text-amber-400">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <GlassEffect
                      id="checkout-confirm-btn"
                      variant="emerald"
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                      className="w-full py-3.5 h-12 rounded-none text-xs"
                    >
                      <Send className="w-4 h-4 shrink-0" />
                      <span>{isSubmitting ? 'ENVIANDO PEDIDO...' : 'FINALIZAR E ENVIAR NO WHATSAPP'}</span>
                    </GlassEffect>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
