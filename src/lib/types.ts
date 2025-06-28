export interface Product {
  id: string;
  name: string;
  barcode: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  salePrice: number;
}

export interface Sale {
  id: string;
  date: Date;
  items: SaleItem[];
  total: number;
}
