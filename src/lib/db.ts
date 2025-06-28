import Database from 'better-sqlite3';
import { initialProducts, initialSales } from './data';
import type { Product, Sale } from './types';
import path from 'path';

const dbPath = path.join(process.cwd(), 'local.db');

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

function initDb() {
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = 'products'").get();
  if (table) {
    return;
  }

  db.exec(`
    CREATE TABLE products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      barcode TEXT NOT NULL UNIQUE,
      purchasePrice REAL NOT NULL,
      salePrice REAL NOT NULL,
      stock INTEGER NOT NULL
    );
    CREATE TABLE sales (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      total REAL NOT NULL
    );
    CREATE TABLE sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      productName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      salePrice REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    );
  `);

  const insertProduct = db.prepare('INSERT INTO products (id, name, barcode, purchasePrice, salePrice, stock) VALUES (?, ?, ?, ?, ?, ?)');
  const insertSale = db.prepare('INSERT INTO sales (id, date, total) VALUES (?, ?, ?)');
  const insertSaleItem = db.prepare('INSERT INTO sale_items (sale_id, product_id, productName, quantity, salePrice) VALUES (?, ?, ?, ?, ?)');

  const insertManyProducts = db.transaction((products: Product[]) => {
    for (const product of products) {
      insertProduct.run(product.id, product.name, product.barcode, product.purchasePrice, product.salePrice, product.stock);
    }
  });

  const insertManySales = db.transaction((sales: Sale[]) => {
    for (const sale of sales) {
      insertSale.run(sale.id, sale.date.toISOString(), sale.total);
      for (const item of sale.items) {
        insertSaleItem.run(sale.id, item.productId, item.productName, item.quantity, item.salePrice);
      }
    }
  });

  insertManyProducts(initialProducts);
  insertManySales(initialSales);

  console.log('Database initialized and seeded.');
}

initDb();
