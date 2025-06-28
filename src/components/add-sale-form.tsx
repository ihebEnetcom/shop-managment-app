"use client";

import { useState } from 'react';
import type { Product, Sale, SaleItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';

type AddSaleFormProps = {
  products: Product[];
  addSale: (newSale: Omit<Sale, 'id' | 'date'>) => void;
  setDialogOpen: (open: boolean) => void;
};

export function AddSaleForm({ products, addSale, setDialogOpen }: AddSaleFormProps) {
  const { toast } = useToast();
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddItem = () => {
    if (!selectedProductId || quantity <= 0) {
      toast({
        title: 'Invalid Item',
        description: 'Please select a product and enter a valid quantity.',
        variant: 'destructive',
      });
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const existingItem = saleItems.find((item) => item.productId === product.id);
    if (existingItem) {
      setSaleItems(
        saleItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setSaleItems([
        ...saleItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: quantity,
          salePrice: product.salePrice,
        },
      ]);
    }
    // Reset inputs
    setSelectedProductId('');
    setQuantity(1);
  };

  const handleRemoveItem = (productId: string) => {
    setSaleItems(saleItems.filter(item => item.productId !== productId));
  }

  const total = saleItems.reduce(
    (sum, item) => sum + item.salePrice * item.quantity,
    0
  );

  const handleSubmit = () => {
    if (saleItems.length === 0) {
      toast({
        title: 'Empty Sale',
        description: 'Please add at least one item to the sale.',
        variant: 'destructive',
      });
      return;
    }
    addSale({ items: saleItems, total });
    toast({
      title: 'Sale Recorded!',
      description: `A new sale of $${total.toFixed(2)} has been successfully recorded.`,
    });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_auto]">
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-full sm:w-24"
          placeholder="Qty"
        />
        <Button onClick={handleAddItem} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="max-h-60 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/50">
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleItems.length > 0 ? (
                  saleItems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${(item.salePrice * item.quantity).toFixed(2)}
                      </TableCell>
                       <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveItem(item.productId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No items added yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <span className="text-lg font-semibold">Total:</span>
        <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSubmit} size="lg" disabled={saleItems.length === 0}>
          Save Sale
        </Button>
      </div>
    </div>
  );
}
