import { DeniedProduct } from '@/types/Products';

export const deniedProducts: DeniedProduct[] = [
  {
    "sku": "SKU001",
    "name": "Producto 1",
    "availability": 0,
    "deniedQuantity": 10,
    "reason": "Producto sin stock real",
    "date": "2024-06-01"
  },
  {
    "sku": "SKU002",
    "name": "Producto 2",
    "availability": 0,
    "deniedQuantity": 5,
    "reason": "Producto defectuoso",
    "date": "2024-06-01"
  }
]