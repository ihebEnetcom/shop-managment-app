'use server';

import { db } from '@/lib/db';
import type { Product, Sale, SaleItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  barcode: z.string().min(1, 'Barcode is required'),
  purchasePrice: z.coerce.number().positive('Purchase price must be positive'),
  salePrice: z.coerce.number().positive('Sale price must be positive'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
});

const fullProductSchema = productSchema.extend({
    id: z.string(),
});

const saleItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  salePrice: z.number().positive(),
});

const saleSchema = z.object({
    items: z.array(saleItemSchema).min(1, 'Sale must have at least one item.'),
    total: z.number().min(0),
});


export async function getProducts(): Promise<Product[]> {
    const stmt = db.prepare('SELECT * FROM products ORDER BY name ASC');
    return stmt.all() as Product[];
}

export async function getSales(): Promise<Sale[]> {
    const salesStmt = db.prepare('SELECT * FROM sales ORDER BY date DESC');
    const itemsStmt = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?');
    
    const salesData = salesStmt.all() as Omit<Sale, 'items' | 'date'> & { date: string }[];
    
    const sales: Sale[] = [];
    for (const s of salesData) {
        const items = itemsStmt.all(s.id) as SaleItem[];
        sales.push({
            ...s,
            date: new Date(s.date),
            items: items,
        });
    }
    
    return sales;
}

export async function addProduct(values: Omit<Product, 'id'>) {
    const parsed = productSchema.safeParse(values);
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
    }

    const { name, barcode, purchasePrice, salePrice, stock } = parsed.data;
    
    try {
        const stmt = db.prepare('INSERT INTO products (id, name, barcode, purchasePrice, salePrice, stock) VALUES (?, ?, ?, ?, ?, ?)');
        const id = `p${Date.now()}`;
        stmt.run(id, name, barcode, purchasePrice, salePrice, stock);
        
        revalidatePath('/products');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return { error: { barcode: ['A product with this barcode already exists.'] } };
        }
        console.error('Failed to add product:', error);
        return { error: { _form: ['Could not add product.'] } };
    }
}

export async function updateProduct(values: Product) {
    const parsed = fullProductSchema.safeParse(values);
    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors };
    }

    const { id, name, barcode, purchasePrice, salePrice, stock } = parsed.data;
    
    try {
        const stmt = db.prepare('UPDATE products SET name = ?, barcode = ?, purchasePrice = ?, salePrice = ?, stock = ? WHERE id = ?');
        stmt.run(name, barcode, purchasePrice, salePrice, stock, id);
        
        revalidatePath('/products');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return { error: { barcode: ['A product with this barcode already exists.'] } };
        }
        console.error('Failed to update product:', error);
        return { error: { _form: ['Could not update product.'] } };
    }
}


export async function addSale(values: Omit<Sale, 'id' | 'date'>) {
    const parsed = saleSchema.safeParse(values);
    if (!parsed.success) {
        return { error: 'Invalid sale data.' };
    }

    const { items, total } = parsed.data;

    const runTransaction = db.transaction(() => {
        const saleId = `s${Date.now()}`;
        const saleDate = new Date().toISOString();
        
        const saleStmt = db.prepare('INSERT INTO sales (id, date, total) VALUES (?, ?, ?)');
        saleStmt.run(saleId, saleDate, total);
        
        const itemStmt = db.prepare('INSERT INTO sale_items (sale_id, product_id, productName, quantity, salePrice) VALUES (?, ?, ?, ?, ?)');
        const updateStockStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
        
        for (const item of items) {
            itemStmt.run(saleId, item.productId, item.productName, item.quantity, item.salePrice);
            const result = updateStockStmt.run(item.quantity, item.productId);
            if (result.changes === 0) {
                throw new Error(`Product with ID ${item.productId} not found or out of stock.`);
            }
        }
    });

    try {
        runTransaction();
        revalidatePath('/sales');
        revalidatePath('/products');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to record sale:', error);
        return { error: error.message || 'Could not record sale.' };
    }
}
