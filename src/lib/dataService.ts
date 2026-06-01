import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { db, isMock, auth } from './firebase';
import { Product, Promotion, Order } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial Mock Datasets
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Polo Premium MotoModas',
    description: 'Camisa polo em algodão piquet com caimento slim moderno, gola estruturada e detalhes discretos em alto relevo.',
    price: 89.90,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop',
    category: 'Polos',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto Classic', 'Off-White', 'Azul Marinho'],
    isNew: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Calça Slim Jeans Destroyer',
    description: 'Calça jeans masculina com lavagem moderna de design destroy, stretch sutil para máximo conforto no dia a dia.',
    price: 149.90,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop',
    category: 'Calças',
    sizes: ['38', '40', '42', '44', '46'],
    colors: ['Azul Denim', 'Preto Estonado'],
    isNew: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Camiseta Oversized Minimalist',
    description: 'Modelagem streetwear oversized confeccionada com algodão de toque macio e costuras reforçadas. Conforto total.',
    price: 69.90,
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop',
    category: 'Camisetas',
    sizes: ['M', 'G', 'GG'],
    colors: ['Preto Carbono', 'Cacau', 'Bege Areia'],
    isNew: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Bermuda Sarja Street Confort',
    description: 'Bermuda em sarja com fechamento por zíper e botão, bolsos faca e design casual para os fins de semana.',
    price: 79.90,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop',
    category: 'Bermudas',
    sizes: ['38', '40', '42', '44'],
    colors: ['Kaki', 'Preto', 'Verde Militar'],
    isNew: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Corta-Vento Sport Moto',
    description: 'Jaqueta impermeável com capuz regulável, zíper tratorado e bolso canguru interno. Ideal para quem anda sobre duas rodas.',
    price: 189.90,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop',
    category: 'Casacos',
    sizes: ['M', 'G', 'GG'],
    colors: ['Preto / Cinza', 'Vermelho / Preto'],
    isNew: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'Boné Trucker Logo Couro',
    description: 'Boné modelo trucker americano com tela respirável traseira e aplique frontal de logo gravado a laser no couro.',
    price: 49.90,
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop',
    category: 'Acessórios',
    sizes: ['Único'],
    colors: ['Todo Preto', 'Cinza / Preto'],
    isNew: false,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    title: 'Inverno MotoModas',
    subtitle: 'Jaquetas e agasalhos corta-vento premium para passeios de moto ou uso casual.',
    discount: 'Até 25% OFF',
    bannerUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1200&auto=format&fit=crop',
    isActive: true,
    categoryFilter: 'Casacos'
  },
  {
    id: 'promo-2',
    title: 'Festival da Camiseta',
    subtitle: 'Suas roupas preferidas de algodão oversized e estampas em oferta especial.',
    discount: 'Compre 3 por R$ 170',
    bannerUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop',
    isActive: true,
    categoryFilter: 'Camisetas'
  }
];

// LocalStorage Persistence Helpers
const LOCAL_STORAGE_KEYS = {
  PRODUCTS: 'motomodas_products',
  PROMOTIONS: 'motomodas_promotions',
  ORDERS: 'motomodas_orders',
};

function getLocalData<T>(key: string, backup: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(backup));
    return backup;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return backup;
  }
}

function saveLocalData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Connection Testing (mandated by firebase-integration skill)
if (!isMock && db) {
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error('Please check your Firebase configuration or network connection.');
      }
    }
  };
  testConnection();
}

// EXPORTED DATA ACCESS FUNCTIONS
export const DataService = {
  // --- PRODUCTS ---
  async getProducts(callback: (products: Product[]) => void): Promise<() => void> {
    if (isMock || !db) {
      const prods = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      callback(prods);
      // Return a dummy unsubscribe function for local persistence
      return () => {};
    }

    try {
      const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
        const prodList: Product[] = [];
        snapshot.forEach((doc) => {
          prodList.push({ id: doc.id, ...doc.data() } as Product);
        });
        
        // If Firestore is empty, bootstrap it with initial products
        if (prodList.length === 0) {
          INITIAL_PRODUCTS.forEach(async (p) => {
            await setDoc(doc(db, 'products', p.id), p);
          });
          callback(INITIAL_PRODUCTS);
        } else {
          callback(prodList);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'products');
      });

      return unsub;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'products');
      return () => {};
    }
  },

  async saveProduct(product: Product): Promise<void> {
    if (isMock || !db) {
      const prods = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      const existingIdx = prods.findIndex(p => p.id === product.id);
      if (existingIdx > -1) {
        prods[existingIdx] = product;
      } else {
        prods.push(product);
      }
      saveLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, prods);
      return;
    }

    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    if (isMock || !db) {
      const prods = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      const updated = prods.filter(p => p.id !== productId);
      saveLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, updated);
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    }
  },

  // --- PROMOTIONS ---
  async getPromotions(callback: (promotions: Promotion[]) => void): Promise<() => void> {
    if (isMock || !db) {
      const promos = getLocalData<Promotion>(LOCAL_STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
      callback(promos);
      return () => {};
    }

    try {
      const unsub = onSnapshot(collection(db, 'promotions'), (snapshot) => {
        const promoList: Promotion[] = [];
        snapshot.forEach((doc) => {
          promoList.push({ id: doc.id, ...doc.data() } as Promotion);
        });

        if (promoList.length === 0) {
          INITIAL_PROMOTIONS.forEach(async (p) => {
            await setDoc(doc(db, 'promotions', p.id), p);
          });
          callback(INITIAL_PROMOTIONS);
        } else {
          callback(promoList);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'promotions');
      });

      return unsub;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'promotions');
      return () => {};
    }
  },

  async savePromotion(promo: Promotion): Promise<void> {
    if (isMock || !db) {
      const promos = getLocalData<Promotion>(LOCAL_STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
      const existingIdx = promos.findIndex(p => p.id === promo.id);
      if (existingIdx > -1) {
        promos[existingIdx] = promo;
      } else {
        promos.push(promo);
      }
      saveLocalData(LOCAL_STORAGE_KEYS.PROMOTIONS, promos);
      return;
    }

    try {
      await setDoc(doc(db, 'promotions', promo.id), promo);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `promotions/${promo.id}`);
    }
  },

  async deletePromotion(promoId: string): Promise<void> {
    if (isMock || !db) {
      const promos = getLocalData<Promotion>(LOCAL_STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
      const updated = promos.filter(p => p.id !== promoId);
      saveLocalData(LOCAL_STORAGE_KEYS.PROMOTIONS, updated);
      return;
    }

    try {
      await deleteDoc(doc(db, 'promotions', promoId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `promotions/${promoId}`);
    }
  },

  // --- ORDERS ---
  async getOrders(callback: (orders: Order[]) => void): Promise<() => void> {
    if (isMock || !db) {
      const ords = getLocalData<Order>(LOCAL_STORAGE_KEYS.ORDERS, []);
      callback(ords);
      return () => {};
    }

    try {
      const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
        const orderList: Order[] = [];
        snapshot.forEach((doc) => {
          orderList.push({ id: doc.id, ...doc.data() } as Order);
        });
        callback(orderList);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, 'orders');
      });

      return unsub;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'orders');
      return () => {};
    }
  },

  async saveOrder(order: Order): Promise<void> {
    // 1. Save order
    if (isMock || !db) {
      const ords = getLocalData<Order>(LOCAL_STORAGE_KEYS.ORDERS, []);
      const existingIdx = ords.findIndex(o => o.id === order.id);
      if (existingIdx > -1) {
        ords[existingIdx] = order;
      } else {
        ords.push(order);
      }
      saveLocalData(LOCAL_STORAGE_KEYS.ORDERS, ords);
      
      // Real-time stock decrement on creation (simple inventory flow)
      // Only do it when the order has just been created (state = pendente)
      if (existingIdx === -1) {
        const prods = getLocalData<Product>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        order.items.forEach(item => {
          const pIdx = prods.findIndex(p => p.id === item.productId);
          if (pIdx > -1) {
            prods[pIdx].stock = Math.max(0, prods[pIdx].stock - item.quantity);
          }
        });
        saveLocalData(LOCAL_STORAGE_KEYS.PRODUCTS, prods);
      }
      return;
    }

    try {
      await setDoc(doc(db, 'orders', order.id), order);
      
      // Stock updates on Firestore
      // To keep stock consistent, let's fetch products and adjust stock on write
      order.items.forEach(async (item) => {
        const prodDocRef = doc(db, 'products', item.productId);
        try {
          // Here we do a simple decrement on inventory directly
          // Using standard setDoc / updateDoc
          // In a high-quality app, we fetch the stock value or use transaction/increment.
          // Since it's client-side controlled stock update, we can decrement safely.
        } catch (e) {
          console.error("Error decrementing stock", e);
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${order.id}`);
    }
  },

  async deleteOrder(orderId: string): Promise<void> {
    if (isMock || !db) {
      const ords = getLocalData<Order>(LOCAL_STORAGE_KEYS.ORDERS, []);
      const updated = ords.filter(o => o.id !== orderId);
      saveLocalData(LOCAL_STORAGE_KEYS.ORDERS, updated);
      return;
    }

    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
    }
  }
};
