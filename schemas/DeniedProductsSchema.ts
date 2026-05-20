import {z} from 'zod';

export const DeniedProductsSchema = z.object({
  sku: z.string({error: 'El SKU es requerido'}),
  name: z.string({error: 'El nombre es requerido'}),
  reason: z.string({error: 'La razón es requerida'}),
});