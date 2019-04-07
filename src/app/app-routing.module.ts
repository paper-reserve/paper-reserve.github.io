import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ListComponent } from "./list/list.component";
import { TransactionComponent } from "./transaction/transaction.component";
import { ActionComponent } from "./action/action.component";
import { GmapComponent } from "./gmap/gmap.component";
import { OfflineSyncComponent } from "./offline-sync/offline-sync.component";
import { IncomeFormComponent } from "./income-form/income-form.component";

const routes: Routes = [
  { path: "", component: TransactionComponent },
  { path: "transactions/:id/show", component: ActionComponent },
  { path: "transactions/:id/edit", component: TransactionComponent },
  { path: "transactions", component: ListComponent },
  { path: "offline_sync", component: OfflineSyncComponent },
  { path: "gmap", component: GmapComponent },
  { path: "income", component: IncomeFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
