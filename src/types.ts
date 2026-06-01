export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  sizes: string[];
  colors: string[];
  isNew: boolean;
  createdAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  bannerUrl: string;
  isActive: boolean;
  categoryFilter?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  chosenSize: string;
  chosenColor: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    chosenSize: string;
    chosenColor: string;
  }[];
  total: number;
  status: 'pendente' | 'finalizado' | 'cancelado';
  createdAt: string;
}
