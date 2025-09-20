export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export function isCartItem(obj: any): obj is CartItem {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    typeof obj.quantity === 'number'
  );
}
