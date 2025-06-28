import { SalesPage } from '@/components/sales-page';
import { initialProducts, initialSales } from '@/lib/data';

export default function SalesRoute() {
  return <SalesPage initialSales={initialSales} allProducts={initialProducts} />;
}
