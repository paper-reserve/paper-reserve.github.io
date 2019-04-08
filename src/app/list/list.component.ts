import { Component, OnInit, Inject } from "@angular/core";
import { DataService } from "../services/data.service";
import * as moment from "moment";
import { MatBottomSheet, MatBottomSheetRef } from "@angular/material";
import { MAT_BOTTOM_SHEET_DATA } from "@angular/material";
import { MatSlideToggleChange } from "@angular/material";
import { Options } from "ng5-slider";
import { Lightbox } from "ngx-lightbox";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"]
})
export class ListComponent implements OnInit {
  transactions;
  budgets;
  sources = [
    { value: "cash", viewValue: "Cash" },
    { value: "hdfc", viewValue: "HDFC" },
    { value: "icici", viewValue: "ICICI" },
    { value: "icici credit", viewValue: "ICICI Credit" },
    { value: "hdfc credit", viewValue: "HDFC Credit" },
    { value: "zeta", viewValue: "Zeta" },
    { value: "paytm", viewValue: "Paytm" }
  ];
  cats = [
    "Food",
    "Travel",
    "Shopping",
    "Entertainment",
    "Payments",
    "Misc.",
    "Transactions"
  ];
  pastMonths = [];
  monthFltr = moment().format("MMMM YYYY");
  currMonth = moment().format("MMMM YYYY");
  today = moment();
  sourceFltr;
  query;
  dateQuery;
  catFltr;
  minDate = new Date(
    moment(this.monthFltr)
      .startOf("month")
      .toString()
  );
  maxDate = new Date(
    moment(this.monthFltr)
      .endOf("month")
      .toString()
  );
  lowValue: number = 0;
  highValue: number = 20000;
  options: Options = {
    floor: 0,
    ceil: 20000,
    step: 10,
    translate: (value: number): string => {
      return "₹" + value;
    }
  };
  filterDrawer;
  sortDrawer;
  sortKey;
  sortOrder;
  sortKeys = [
    {
      key: "amount",
      value: "Amount",
      icon: "₹",
      desc: "(high to low)",
      asc: "(low to high)"
    },
    {
      key: "date",
      value: "Date",
      icon: "date_range",
      desc: "(" + moment().format("DD") + " to 01)",
      asc: "(01 to " + moment().format("DD") + ")"
    },
    {
      key: "source",
      value: "Source",
      icon: "credit_card",
      desc: "(Z to A)",
      asc: "(A to Z)"
    },
    {
      key: "cat",
      value: "Category",
      icon: "category",
      desc: "(Z to A)",
      asc: "(A to Z)"
    }
  ];
  constructor(
    private data: DataService,
    private bottomSheet: MatBottomSheet,
    private _lightbox: Lightbox
  ) {}

  ngOnInit() {
    this.setMonthSelector();
    this.getTransactions();
    this.sortKey = "id";
    this.sortOrder = "desc";
  }

  setMonthSelector() {
    let maxPastMonth = "May 2018";
    let monthCount = 0;
    let month = this.monthFltr;
    while (month != maxPastMonth) {
      this.pastMonths.push(month);
      monthCount++;
      month = moment()
        .subtract(monthCount, "months")
        .format("MMMM YYYY");
    }
  }
  getTransactions() {
    this.transactions = null;
    this.minDate = new Date(
      moment(this.monthFltr)
        .startOf("month")
        .toString()
    );
    this.maxDate = new Date(
      moment(this.monthFltr)
        .endOf("month")
        .toString()
    );
    this.data.getTransactions(this.monthFltr).subscribe(data => {
      this.transactions = data;
    });
  }
  imgOpen(src, caption) {
    let album = {
      src: src,
      caption: "<a target='_blank' href=" + src + ">" + caption + "</a>",
      thumb: null
    };
    this._lightbox.open([album], 0);
  }
  getBudgets() {
    this.budgets = null;
    this.data.getBudgets().subscribe(data => {
      this.budgets = data;
      this.bottomSheet.open(BottomSheetBudget, {
        data: this.budgets
      });
    });
  }
  openBottomSheetBudgets(): void {
    this.bottomSheet.open(BottomSheetBudget, {
      data: null
    });
    this.getBudgets();
  }
}

@Component({
  selector: "bottom-sheet-budget",
  templateUrl: "bottom-sheet-budget.html"
})
export class BottomSheetBudget {
  balanceSwitch = false;
  toggle(event: MatSlideToggleChange) {
    this.balanceSwitch = event.checked;
  }
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public budgets: any,
    private bottomSheetRef: MatBottomSheetRef<BottomSheetBudget>
  ) {}

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
