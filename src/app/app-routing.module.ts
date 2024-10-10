import { Routes } from '@angular/router';
import { EmployeesComponent } from './components/employees/employees.component';
import { ProvidersComponent } from './components/providers/providers.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { ItemComponent } from './components/item/item/item.component';
import { TransactionComponent } from './components/transaction/transaction/transaction.component';

export const routes: Routes = [
  { path: 'employees', component: EmployeesComponent },
  { path: 'providers', component: ProvidersComponent },
  { path: 'item', component: ItemComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: '', redirectTo: '/employees', pathMatch: 'full' }
];
