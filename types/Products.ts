export type Product = {
  sku: string;
  name: string;
  description: string;
  availability: number;
};

export type DeniedProduct = Partial<Product> & {
  deniedQuantity: number;
  reason: string;
  date: string;
};