import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ListComponent } from "./list/list.component";
import { TransactionComponent } from "./transaction/transaction.component";
import { ActionComponent } from "./action/action.component";

const routes: Routes = [
  { path: "", component: TransactionComponent },
  { path: "transactions/:id/show", component: ActionComponent },
  { path: "transactions/:id/edit", component: TransactionComponent },
  { path: "transactions", component: ListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
