export type Product = {
  sku: string;
  name?: string;
  availability?: number;
  description?: string;
};

export type DeniedProduct = Partial<Product> & {
  deniedQuantity: number;
  reason: string;
  date: string;
};