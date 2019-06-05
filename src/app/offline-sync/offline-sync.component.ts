import { Component, OnInit } from "@angular/core";
import { DataService } from "../services/data.service";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material";
import { LocalStorage } from "@ngx-pwa/local-storage";
import * as _ from "lodash";

@Component({
  selector: "app-offline-sync",
  templateUrl: "./offline-sync.component.html",
  styleUrls: ["../list/list.component.scss", "./offline-sync.component.scss"]
})
export class OfflineSyncComponent implements OnInit {
  offline_transactions;
  loading = false;
  syncing = false;
  syncTran;
  _: any = _;
  constructor(
    private data: DataService,
    private router: Router,
    protected localStorage: LocalStorage,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.getOfflineTransactions();
  }
  getOfflineTransactions() {
    this.loading = true;
    this.data.getOfflineTransactions().subscribe(data => {
      this.loading = false;
      this.offline_transactions = data;
    });
  }
  sync(transaction) {
    let key = transaction.key;
    let result;
    this.syncing = true;
    this.syncTran = transaction;
    this.data.getOffTran(key).then(out => {
      result = out;
      result.key = key;
      if (_.isEqual(result, transaction)) {
        let msg;
        let redirect;
        this.data
          .writeTransaction(transaction, "create", null)
          .subscribe(data => {
            if (data === "Stored Offline") {
              msg = "Stored Offline";
              redirect = ["/offline_sync"];
            } else {
              msg = "Transaction Synced";
              redirect = ["/transactions"];
            }

            this.data.delOffTran(key).then(out => {
              this.snackBar.open(msg, null, {
                duration: 3000,
                verticalPosition: "bottom",
                horizontalPosition: "left"
              });
              this.syncing = false;
              this.syncTran = null;
              this.router.navigate(redirect);
            });
            this.localStorage.removeItem("unSubmittedForm").subscribe(() => { });
          });
      }
    });
  }

  remove(transaction) {
    this.data.delOffTran(transaction.key).then(out => {
      this.getOfflineTransactions();
    })
  }
}
