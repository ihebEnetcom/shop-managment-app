import { ProductsPage } from '@/components/products-page';
import { getProducts } from '@/lib/actions';

export default async function ProductsRoute() {
  const initialProducts = await getProducts();
  return <ProductsPage initialProducts={initialProducts} />;
}
