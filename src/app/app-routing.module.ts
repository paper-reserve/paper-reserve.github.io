import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ListComponent } from "./list/list.component";
import { TransactionComponent } from "./transaction/transaction.component";
import { ActionComponent } from "./action/action.component";
import { GmapComponent } from "./gmap/gmap.component";
import { OfflineSyncComponent } from "./offline-sync/offline-sync.component";
import { IncomeFormComponent } from "./income-form/income-form.component";
import { SavingsComponent } from "./savings/savings.component";
import { ChartComponent } from "./chart/chart.component";
import { HeatMapComponent } from "./heat-map/heat-map.component";

const routes: Routes = [
  { path: "", redirectTo: "/add", pathMatch: 'full' },
  { path: "add", component: TransactionComponent },
  { path: "transactions/:id/show", component: ActionComponent },
  { path: "transactions/:id/edit", component: TransactionComponent },
  { path: "transactions", component: ListComponent },
  { path: "offline_sync", component: OfflineSyncComponent },
  { path: "gmap", component: GmapComponent },
  { path: "income", component: IncomeFormComponent },
  { path: "savings", component: SavingsComponent },
  { path: "chart", component: ChartComponent },
  { path: "heatMap", component: HeatMapComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
