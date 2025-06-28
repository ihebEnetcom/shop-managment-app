import { SalesPage } from '@/components/sales-page';
import { getProducts, getSales } from '@/lib/actions';

export default async function SalesRoute() {
  const initialSales = await getSales();
  const allProducts = await getProducts();
  return <SalesPage initialSales={initialSales} allProducts={allProducts} />;
}
