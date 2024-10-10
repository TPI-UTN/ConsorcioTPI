import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../services/inventory.service';
import { Inventory, Transaction, StatusType } from '../../../models/inventory.model';
import { Item, Status } from '../../../models/item.model';
import { AppComponent } from '../../../app.component';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  transactionForm: FormGroup;
  items: Item[] = [];
  activeItems: Item[] = []; // Solo los ítems activos
  inventories: Inventory[] = [];
  transactions: Transaction[] = []; // Propiedad para almacenar las transacciones
  itemMap: { [key: number]: string } = {}; // Mapa para almacenar el nombre de ítems con sus IDs
  inventoryMap: { [key: number]: Inventory } = {}; // Mapa para almacenar inventarios con sus IDs
  isEditing: boolean = false;
  editingTransactionId: any | null = null; // Para guardar el ID de la transacción en edición

  constructor(private fb: FormBuilder, private inventoryService: InventoryService) {
    this.transactionForm = this.fb.group({
     // item_id: ['', Validators.required], // Relación con el ítem
      identifier: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      location: [''],
      type: ['', Validators.required],
      status: ['', Validators.required],
      category: ['', Validators.required],
      measurement_unit: ['', Validators.required],
      min_stock: [0],
      quantity: [0, Validators.required], // Relación con la transacción
      price: [0]
    });
  }

  ngOnInit(): void {
    this.getItems();
    this.getInventories();
    this.getTransactions(); // Llamada para obtener las transacciones al inicializar el componente
  }

  getItems(): void {
    this.inventoryService.getItems().subscribe(items => {
      this.items = items;
      this.activeItems = this.items.filter(item => item.item_status === Status.ACTIVE); // Mostrar solo ítems activos
      this.buildItemMap(); // Construir el mapa de ítems
    });
  }

  getInventories(): void {
    this.inventoryService.getInventories().subscribe(inventories => {
      this.inventories = inventories.filter(inventory => inventory.inventory_status === 'Active');
      this.buildInventoryMap(); // Construir el mapa de inventarios
    });
  }
    // Método para construir el mapa de ítems
    buildItemMap(): void {
      this.items.forEach(item => {
        if (item && item.id !== undefined && item.id !== null && item.name) {
          this.itemMap[item.id] = item.name;
        }
      });
    }
      // Método para construir el mapa de inventarios
  buildInventoryMap(): void {
    this.inventories.forEach(inventory => {
      if (inventory && inventory.id !== undefined && inventory.id !== null) {
        this.inventoryMap[inventory.id] = inventory;
      }
    });
  }
  getTransactions(): void {
    this.inventoryService.getTransactions().subscribe(transactions => {
      this.transactions = transactions; // Guardar las transacciones en la propiedad
    });
  }
  addTransaction(): void {
    if (this.transactionForm.valid) {
      const formValues = this.transactionForm.value;

      // Crear el ítem
      const newItem: Item = {
        identifier: formValues.identifier,
        name: formValues.name,
        description: formValues.description,
        location: formValues.location,
        type: formValues.type,
        status: formValues.status,
        category: formValues.category,
        measurement_unit: formValues.measurement_unit,
        item_status: Status.ACTIVE
      };

      this.inventoryService.addItem(newItem).subscribe(addedItem => {
        // Crear el inventario
        const newInventory: Inventory = {
          item_id: addedItem.id!,
          stock: formValues.quantity,
          min_stock: formValues.min_stock,
          inventory_status: StatusType.ACTIVE
        };

        this.inventoryService.addInventory(newInventory).subscribe(addedInventory => {
          // Crear la transacción
          const newTransaction: Transaction = {
            inventory_id: addedInventory.id!,
            quantity: formValues.quantity,
            price: formValues.price
          };

          this.inventoryService.addTransaction(newTransaction).subscribe(() => {
            this.getItems();
            this.getInventories();
            this.resetForm(); // Resetea el formulario después de agregar
          });
        });
      });
    }
  }
   // Método para editar una transacción existente
   editTransaction(transaction: Transaction): void {
    this.isEditing = true; // Cambia el estado a edición
    this.editingTransactionId = transaction.transaction_id; // Guarda el ID de la transacción actual
    const inventory = this.inventoryMap[transaction.inventory_id];
    const item = this.items.find(i => i.id === inventory.item_id);

    if (item) {
      this.transactionForm.patchValue({
        item_id: item.id,
        identifier: item.identifier,
        name: item.name,
        description: item.description,
        location: item.location,
        type: item.type,
        status: item.status,
        category: item.category,
        measurement_unit: item.measurement_unit,
        stock: inventory.stock,
        min_stock: inventory.min_stock,
        quantity: transaction.quantity,
        price: transaction.price
      });
    }
  }
  // Método para eliminar una transacción existente
  deleteTransaction(transaction_id: number): void {
    this.inventoryService.deleteTransaction(transaction_id).subscribe(() => {
      this.getTransactions(); // Recargar la lista de transacciones
    });
  }

  resetForm(): void {
    this.transactionForm.reset({
      identifier: '',
      name: '',
      description: '',
      location: '',
      type: '',
      status: '',
      category: '',
      measurement_unit: '',
      stock: 0,
      min_stock: 0,
      quantity: 0,
      price: 0
    });
    this.isEditing = false; // Desactivar el modo edición
    this.editingTransactionId = null; // Limpiar el ID del inventario en edición
  }
  saveTransaction(): void {
    if (this.transactionForm.valid) {
      const transactionData = this.transactionForm.value;
      
      // Primero creamos el ítem
      this.inventoryService.addItem({
        identifier: transactionData.identifier,
        name: transactionData.name,
        description: transactionData.description,
        location: transactionData.location,
        type: transactionData.type,
        status: transactionData.status,
        category: transactionData.category,
        measurement_unit: transactionData.measurement_unit,
        item_status: Status.ACTIVE
      }).subscribe(newItem => {
        
        // Luego creamos el inventario con el ID del ítem recién creado
        this.inventoryService.addInventory({
          item_id: newItem.id!,
          stock: transactionData.quantity, // Asignamos la cantidad como stock
          min_stock: transactionData.min_stock,
          inventory_status: StatusType.ACTIVE
        }).subscribe(newInventory => {
          
          // Finalmente creamos la transacción con el ID del inventario recién creado
          this.inventoryService.addTransaction({
            inventory_id: newInventory.id!,
            quantity: transactionData.quantity,
            price: transactionData.price,
          }).subscribe(() => {
            this.getTransactions(); // Cargar todas las transacciones nuevamente
            this.resetForm(); // Resetear el formulario
          });
        });
      });
    }
  }
  
}
