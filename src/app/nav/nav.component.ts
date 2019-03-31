import { Component, OnInit } from "@angular/core";
import { navAnimations } from "./nav.animations";
import { LocalStorage } from "@ngx-pwa/local-storage";
import { DataService } from "../services/data.service";

@Component({
  selector: "navbar",
  templateUrl: "./nav.component.html",
  styleUrls: ["./nav.component.scss"],
  animations: navAnimations
})
export class NavComponent implements OnInit {
  appTitle = "Transactions";
  fabButtons = [
    {
      icon: "playlist_add",
      link: "/add"
    },
    {
      icon: "list",
      link: "/"
    },
    {
      icon: "account_balance_wallet"
    }
  ];
  buttons = [];
  chips = [];
  fabTogglerState = "inactive";

  constructor(
    protected localStorage: LocalStorage,
    private data: DataService
  ) {}

  ngOnInit() {}
  showItems() {
    this.fabTogglerState = "active";
    this.buttons = this.fabButtons;
  }

  hideItems() {
    this.fabTogglerState = "inactive";
    this.buttons = [];
  }

  checkBalance() {
    this.data.getBalance().subscribe(balances => {
      let result = {};
      this.chips = [];
      for (let balance of balances.split(",")) {
        let obj = balance.split(": ");
        let key = obj[0];
        let value = obj[1];
        let tmp = {};
        tmp[key] = result[key] = value;
        this.chips.push(tmp);
      }
      this.localStorage.setItem("balance", result).subscribe(() => {});
    });
  }

  onToggleFab() {
    this.chips = [];
    this.buttons.length ? this.hideItems() : this.showItems();
  }
}
