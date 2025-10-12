export interface BaseProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  keywords: string[];
}

export interface LaptopProduct extends BaseProduct {
  type: 'laptop';
  ramGb: number;
  cpu: string;
  os: string;
  screenInch: number;
}

export interface PhoneProduct extends BaseProduct {
  type: 'phone';
  os: string;
  screenInch: number;
  ramGb: number;
  cpu: string;
}

export interface TabletProduct extends BaseProduct {
  type: 'tablet';
  os: string;
  screenInch: number;
  ramGb: number;
  cpu: string;
}

export interface AccessoryProduct extends BaseProduct {
  type: 'accessory';
  compatibleWith?: string;
}

export type Product = LaptopProduct | PhoneProduct | TabletProduct | AccessoryProduct;
