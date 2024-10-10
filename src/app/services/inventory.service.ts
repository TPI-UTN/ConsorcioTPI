import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model';
import { Inventory, Transaction } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiItemsUrl = 'http://localhost:3000/items'; // URL de la API para los ítems
  private apiInventoriesUrl = 'http://localhost:3000/inventories'; // URL de la API para los inventarios
  private apiTransactionsUrl = 'http://localhost:3000/transactions'; // URL de la API para las transacciones
 
  constructor(private http: HttpClient) {}

  // CRUD para Ítems
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiItemsUrl);
  }

  addItem(item: Item): Observable<Item> {
    return this.http.post<Item>(this.apiItemsUrl, item);
  }

  updateItem(itemId: number, item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.apiItemsUrl}/${itemId}`, item);
  }

  deleteItem(item_id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiItemsUrl}/${item_id}`, { item_status: 'Inactive' });
  }

  // CRUD para Inventarios
  getInventories(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(this.apiInventoriesUrl);
  }

  addInventory(inventory: Inventory): Observable<Inventory> {
    return this.http.post<Inventory>(this.apiInventoriesUrl, inventory);
  }

  updateInventory(inventory: Inventory): Observable<Inventory> {
    return this.http.put<Inventory>(`${this.apiInventoriesUrl}/${inventory.id}`, inventory);
  }

  deleteInventory(inventory_id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiInventoriesUrl}/${inventory_id}`, { inventory_status: 'Inactive' });
  }

  // CRUD para Transacciones
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiTransactionsUrl);
  }

 addTransaction(transaction: Transaction): Observable<Transaction> {
  return this.http.post<Transaction>(`${this.apiTransactionsUrl}`, transaction);
}


  updateTransaction(transactionId: number, transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiTransactionsUrl}/${transactionId}`, transaction);
  }

  deleteTransaction(transaction_id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiTransactionsUrl}/${transaction_id}`, { transaction_status: 'Inactive' });
  }
}
