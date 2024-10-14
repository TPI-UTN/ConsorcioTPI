import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';
import { Inventory, StatusType} from '../../models/inventory.model';
import { Item, Status } from '../../models/item.model';
import { ItemComponent } from "../item/item/item.component";

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ItemComponent],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  inventoryForm: FormGroup;
  inventories: Inventory[] = [];
  items: Item[] = [];
  activeItems: Item[] = []; // Solo los ítems activos
  itemMap: { [key: number]: string } = {}; // Mapa para almacenar nombre de ítems con sus IDs
  isEditing: boolean = false;
  editingInventoryId: any | null = null; // Para guardar el ID del inventario en edición
  filterForm: FormGroup;


  constructor(private fb: FormBuilder, private inventoryService: InventoryService) {
    this.inventoryForm = this.fb.group({
      item_id: ['', Validators.required],
      stock: [1, Validators.required], // Stock inicial es 1
      min_stock: [1],
      inventory_status: [StatusType.ACTIVE]
    });

    this.filterForm = this.fb.group({
      minStock: ['']
    });
  }

  ngOnInit(): void {
    this.getInventories();
    this.getItems();
    this.filterForm.valueChanges.subscribe(() => {
      this.applyStockFilter();
    });
  }

  getInventories(): void {
    this.inventoryService.getInventories().subscribe(inventories => {
      this.inventories = inventories.filter(inventory => inventory.inventory_status === StatusType.ACTIVE);
    });
  }

  applyStockFilter(): void {
    const filters = this.filterForm.value;
    this.inventoryService.getInventories({ stock: filters.minStock }).subscribe(inventories => {
      this.inventories = inventories.filter(inventory => 
        inventory.stock >= filters.minStock && inventory.inventory_status === StatusType.ACTIVE
      );
    });
  }

  clearFilters(): void {
    this.filterForm.reset({ minStock: '' });
    this.getInventories();
  }
  buildItemMap(): void {
    this.items.forEach(item => {
      // Verificar que el ID y el nombre no sean undefined o nulos
      if (item && item.id !== undefined && item.id !== null && item.name) {
        this.itemMap[item.id] = item.name;
      } else {
        console.warn('Item inválido encontrado:', item);
      }
    });
  }
  
  // Método para obtener los ítems y filtrar solo los activos

  getItems(): void {
    this.inventoryService.getItems().subscribe(items => {
      this.items = items;
      this.activeItems = this.items.filter(item => item.item_status === Status.ACTIVE); // Usar ItemStatus.FUNCTIONAL
      this.buildItemMap();
    });
  }

  addInventory(): void {
    if (this.inventoryForm.valid) {
      const newInventory = this.inventoryForm.value;
      this.inventoryService.addInventory(newInventory).subscribe(() => {
        this.getInventories();
        this.inventoryForm.reset({ stock: 1, min_stock: 1, inventory_status: Status.ACTIVE });
      });
    }
  }

  editInventory(inventory: Inventory): void {
    this.isEditing = true; // Activar el modo edición
    this.editingInventoryId = inventory.id; // Guardar el ID del inventario en edición
    this.inventoryForm.patchValue({
      item_id: inventory.item_id,
      stock: inventory.stock,
      min_stock: inventory.min_stock,
      inventory_status: inventory.inventory_status
    });
  }
  

  updateInventory(): void {
    if (this.inventoryForm.valid) {
      const updatedInventory = this.inventoryForm.value;
      this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
        this.getInventories();
        this.inventoryForm.reset({ stock: 1, min_stock: 1, inventory_status: Status.ACTIVE });
      });
    }
  }

  deleteInventory(id: number): void {
    this.inventoryService.deleteInventory(id).subscribe(() => {
      this.getInventories();
    });
  }
  resetForm(): void {
    this.isEditing = false; // Desactivar el modo edición
    this.editingInventoryId = null; // Limpiar el ID del inventario en edición
    this.inventoryForm.reset({ stock: 1, min_stock: 1, inventory_status: 'Active' });
  }
  
  saveInventory(): void {
    if (this.inventoryForm.valid) {
      const inventoryData = this.inventoryForm.value;
  
      if (this.isEditing && this.editingInventoryId) {
        // Editar inventario existente
        const updatedInventory: Inventory = {
          ...inventoryData,
          id: this.editingInventoryId
        };
        this.inventoryService.updateInventory(updatedInventory).subscribe(() => {
          this.getInventories(); // Recargar la lista después de actualizar
          this.resetForm(); // Resetear el formulario después de editar
        });
      } else {
        // Agregar nuevo inventario
        this.inventoryService.addInventory(inventoryData).subscribe(() => {
          this.getInventories(); // Recargar la lista después de agregar
          this.resetForm(); // Resetear el formulario después de agregar
        });
      }
    }
  }
  
}
