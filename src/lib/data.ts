import type { Product, Sale } from './types';

export const initialProducts: Product[] = [
  { id: 'p1', name: 'Premium Coffee Beans', barcode: '8992761132015', purchasePrice: 15.50, salePrice: 25.00, stock: 100 },
  { id: 'p2', name: 'Organic Green Tea', barcode: '8992761132022', purchasePrice: 8.00, salePrice: 14.50, stock: 150 },
  { id: 'p3', name: 'Artisan Sourdough Bread', barcode: '8992761132039', purchasePrice: 3.50, salePrice: 7.00, stock: 50 },
  { id: 'p4', name: 'Gourmet Chocolate Bar', barcode: '8992761132046', purchasePrice: 2.75, salePrice: 5.50, stock: 200 },
  { id: 'p5', name: 'Fresh Orange Juice', barcode: '8992761132053', purchasePrice: 4.00, salePrice: 7.50, stock: 80 },
  { id: 'p6', name: 'Whole Milk (1L)', barcode: '8992761132060', purchasePrice: 1.50, salePrice: 3.00, stock: 120 },
  { id: 'p7', name: 'Free-Range Eggs (Dozen)', barcode: '8992761132077', purchasePrice: 3.00, salePrice: 5.50, stock: 60 },
];

export const initialSales: Sale[] = [
  {
    id: 's1',
    date: new Date('2023-10-01T10:00:00Z'),
    items: [
      { productId: 'p1', productName: 'Premium Coffee Beans', quantity: 2, salePrice: 25.00 },
      { productId: 'p3', productName: 'Artisan Sourdough Bread', quantity: 1, salePrice: 7.00 },
    ],
    total: 57.00,
  },
  {
    id: 's2',
    date: new Date('2023-10-02T14:30:00Z'),
    items: [
      { productId: 'p2', productName: 'Organic Green Tea', quantity: 1, salePrice: 14.50 },
      { productId: 'p4', productName: 'Gourmet Chocolate Bar', quantity: 3, salePrice: 5.50 },
    ],
    total: 31.00,
  },
  {
    id: 's3',
    date: new Date('2023-10-02T18:45:00Z'),
    items: [
      { productId: 'p5', productName: 'Fresh Orange Juice', quantity: 2, salePrice: 7.50 },
    ],
    total: 15.00,
  },
    {
    id: 's4',
    date: new Date('2023-10-03T09:15:00Z'),
    items: [
      { productId: 'p6', productName: 'Whole Milk (1L)', quantity: 2, salePrice: 3.00 },
      { productId: 'p7', productName: 'Free-Range Eggs (Dozen)', quantity: 1, salePrice: 5.50 },
      { productId: 'p3', productName: 'Artisan Sourdough Bread', quantity: 1, salePrice: 7.00 },
    ],
    total: 18.50,
  },
  {
    id: 's5',
    date: new Date('2023-10-04T11:00:00Z'),
    items: [
      { productId: 'p1', productName: 'Premium Coffee Beans', quantity: 1, salePrice: 25.00 },
      { productId: 'p4', productName: 'Gourmet Chocolate Bar', quantity: 2, salePrice: 5.50 },
    ],
    total: 36.00,
  },
];
