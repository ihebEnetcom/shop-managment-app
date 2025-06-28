import { Dashboard } from '@/components/dashboard';
import { initialProducts, initialSales } from '@/lib/data';
import type { Product, Sale } from '@/lib/types';

export default function Home() {
  const products: Product[] = initialProducts;
  const sales: Sale[] = initialSales;

  return <Dashboard products={products} sales={sales} />;
}
