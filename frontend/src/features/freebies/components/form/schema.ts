import { z } from 'zod';

export const freebieItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters').max(60, 'Max 60 characters'),
  requirements: z.string().max(200, 'Max 200 characters').optional(),
  description: z.string().max(300, 'Max 300 characters').optional(),
});

export const multiFreebieSchema = z.object({
  vendor_name: z.string().min(1, 'Vendor / company name is required').max(50, 'Max 50 characters'),
  location: z.string().max(150, 'Max 150 characters').optional(),
  items: z.array(freebieItemSchema).min(1, 'At least one freebie item is required'),
});

export type FreebieItemFormValues = z.infer<typeof freebieItemSchema>;
export type MultiFreebieFormValues = z.infer<typeof multiFreebieSchema>;
