import { ProductsPage } from '@/components/products-page';
import { initialProducts } from '@/lib/data';

export default function ProductsRoute() {
  return <ProductsPage initialProducts={initialProducts} />;
}
