import { Dashboard } from '@/components/dashboard';
import { getProducts, getSales } from '@/lib/actions';

export default async function Home() {
  const products = await getProducts();
  const sales = await getSales();

  return <Dashboard products={products} sales={sales} />;
}
