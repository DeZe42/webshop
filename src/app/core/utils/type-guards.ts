import { Product } from '../models/product.model';

export function isProduct(item: unknown): item is Product {
  return (
    typeof item === 'object' && item !== null && 'id' in item && 'name' in item && 'price' in item
  );
}
