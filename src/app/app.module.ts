import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { NavComponent } from "./nav/nav.component";
import { TransactionComponent, TodoSheet } from "./transaction/transaction.component";
import { ListComponent, BottomSheetBudget } from "./list/list.component";

import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ReverseStr, PrependStr } from "./list/stringManipulation.pipe";

import { LightboxModule } from "ngx-lightbox";
import { NgForageConfig, Driver } from "ngforage";
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';

import {
  FilterPipe,
  ReversePipe,
  IconStrPipe,
  PercentagePipe,
  SumAmtPipe,
  SavingSumAmtPipe,
  SortingPipe,
  IsTodayPipe,
  SmallSavingPipe,
  ArrayStringFilterPipe
} from "./list/transaction.pipe";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "./material.module";
import { Ng5SliderModule } from "ng5-slider";
import { ActionComponent } from "./action/action.component";
import { GmapComponent } from "./gmap/gmap.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { OfflineSyncComponent } from './offline-sync/offline-sync.component';
import { environment } from "../environments/environment";
import { IncomeFormComponent } from './income-form/income-form.component';
import { SavingsComponent } from './savings/savings.component';
import { ChartComponent } from './chart/chart.component';
import { HeatMapComponent } from './heat-map/heat-map.component';
import { MapboxComponent } from './mapbox/mapbox.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    ListComponent,
    BottomSheetBudget,
    ReverseStr,
    PrependStr,
    FilterPipe,
    ReversePipe,
    SumAmtPipe,
    SavingSumAmtPipe,
    SortingPipe,
    IconStrPipe,
    PercentagePipe,
    IsTodayPipe,
    SmallSavingPipe,
    ArrayStringFilterPipe,
    TransactionComponent,
    TodoSheet,
    ActionComponent,
    GmapComponent,
    OfflineSyncComponent,
    IncomeFormComponent,
    SavingsComponent,
    ChartComponent,
    HeatMapComponent,
    MapboxComponent
  ],
  entryComponents: [BottomSheetBudget, TodoSheet],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    Ng5SliderModule,
    LightboxModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production
    }),
    NgxMapboxGLModule.withConfig({
      accessToken: 'pk.eyJ1IjoibmFnYXN1bmRyYW0iLCJhIjoiY2psMXVtNXk1MWptbjN3bXBnMGN6bWF4ZCJ9.1TUsWyuX9yZ1REK6HSl_IA', // Optionnal, can also be set per map (accessToken input of mgl-map)
      geocoderAccessToken: 'pk.eyJ1IjoibmFnYXN1bmRyYW0iLCJhIjoiY2psMXVtNXk1MWptbjN3bXBnMGN6bWF4ZCJ9.1TUsWyuX9yZ1REK6HSl_IA' // Optionnal, specify if different from the map access token, can also be set per mgl-geocoder (accessToken input of mgl-geocoder)
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  public constructor(ngfConfig: NgForageConfig) {
    ngfConfig.configure({
      name: "ng7-pre",
      driver: [Driver.INDEXED_DB, Driver.WEB_SQL, Driver.LOCAL_STORAGE]
    });
  }
}
