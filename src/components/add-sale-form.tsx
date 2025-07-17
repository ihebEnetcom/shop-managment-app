"use client";

import { useState, useTransition } from 'react';
import type { Product, Sale, SaleItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
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
import { Check, ChevronsUpDown, PlusCircle, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

type AddSaleFormProps = {
  products: Product[];
  addSaleAction: (newSale: Omit<Sale, 'id' | 'date'>) => Promise<any>;
  setDialogOpen: (open: boolean) => void;
};

export function AddSaleForm({ products, addSaleAction, setDialogOpen }: AddSaleFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [openCombobox, setOpenCombobox] = useState(false)

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
    
    if (product.stock < quantity) {
        toast({
            title: 'Not enough stock',
            description: `Only ${product.stock} of ${product.name} left in stock.`,
            variant: 'destructive'
        });
        return;
    }

    const existingItem = saleItems.find((item) => item.productId === product.id);
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if(product.stock < newQuantity) {
            toast({
                title: 'Not enough stock',
                description: `Cannot add ${quantity} more. Only ${product.stock - existingItem.quantity} of ${product.name} left in stock.`,
                variant: 'destructive'
            });
            return;
        }
      setSaleItems(
        saleItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
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
    
    startTransition(async () => {
        const result = await addSaleAction({ items: saleItems, total });
        if(result?.error) {
             toast({
                title: 'Error',
                description: result.error,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Sale Recorded!',
                description: `A new sale of ${total.toFixed(2)} DT has been successfully recorded.`,
            });
            setDialogOpen(false);
        }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_auto]">
        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCombobox}
              className="w-full justify-between"
            >
              {selectedProductId
                ? products.find((product) => product.id === selectedProductId)?.name
                : "Select a product..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Search product..." />
              <CommandEmpty>No product found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                {products.filter(p => p.stock > 0).map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.name}
                    onSelect={() => {
                      setSelectedProductId(product.id === selectedProductId ? "" : product.id)
                      setOpenCombobox(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedProductId === product.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {product.name} ({product.stock} in stock)
                  </CommandItem>
                ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-full sm:w-24"
          placeholder="Qty"
        />
        <Button onClick={handleAddItem} className="w-full sm:w-auto" disabled={!selectedProductId}>
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
                        {(item.salePrice * item.quantity).toFixed(2)} DT
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
        <span className="text-2xl font-bold text-primary">{total.toFixed(2)} DT</span>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSubmit} size="lg" disabled={saleItems.length === 0 || isPending}>
          {isPending ? 'Saving...' : 'Save Sale'}
        </Button>
      </div>
    </div>
  );
}
