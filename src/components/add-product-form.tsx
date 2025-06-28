"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  barcode: z.string().min(1, 'Barcode is required'),
  purchasePrice: z.coerce.number().positive('Purchase price must be positive'),
  salePrice: z.coerce.number().positive('Sale price must be positive'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
});

type AddProductFormProps = {
  addProduct: (newProduct: Omit<Product, 'id'>) => void;
  setDialogOpen: (open: boolean) => void;
};

export function AddProductForm({ addProduct, setDialogOpen }: AddProductFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      barcode: '',
      purchasePrice: 0,
      salePrice: 0,
      stock: 0,
    },
  });

  function onSubmit(values: z.infer<typeof productSchema>) {
    addProduct(values);
    toast({
      title: 'Success!',
      description: `Product "${values.name}" has been added.`,
      variant: 'default',
    });
    setDialogOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Organic Coffee Beans" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barcode (SKU)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 8992761132015" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Purchase Price</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="15.50" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Sale Price</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="25.00" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
            <Button type="submit">Add Product</Button>
        </div>
      </form>
    </Form>
  );
}
