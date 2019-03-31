import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { NavComponent } from "./nav/nav.component";
import { TransactionComponent } from "./transaction/transaction.component";
import { ListComponent, BottomSheetBudget } from "./list/list.component";

import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ReverseStr, PrependStr } from "./list/stringManipulation.pipe";

import { LightboxModule } from 'ngx-lightbox';

import {
  FilterPipe,
  ReversePipe,
  IconStrPipe,
  PercentagePipe,
  SumAmtPipe,
  IsTodayPipe
} from "./list/transaction.pipe";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "./material.module";
import { Ng5SliderModule } from 'ng5-slider';
import { ActionComponent } from './action/action.component';

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
    IconStrPipe,
    PercentagePipe,
    IsTodayPipe,
    TransactionComponent,
    ActionComponent
  ],
  entryComponents: [BottomSheetBudget],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    Ng5SliderModule,
    LightboxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
