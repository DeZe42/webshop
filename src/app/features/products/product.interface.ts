export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'laptop' | 'phone' | 'tablet';
  ramGb: number;
  cpu: string;
  screenSizeInch: number;
  os: string;
  screenInch: number;
}
