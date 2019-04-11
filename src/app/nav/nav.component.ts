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
  loading = false;
  online = navigator.onLine;
  fabButtons = [
    {
      icon: "playlist_add",
      link: "/"
    },
    {
      icon: "list",
      link: "/transactions"
    },
    {
      icon: "map",
      link: "/gmap"
    },
    {
      icon: "favorite_border",
      link: "/savings"
    },
    {
      icon: "how_to_vote",
      link: "/income"
    },
    {
      icon: "cloud_upload",
      link: "/offline_sync"
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

  ngOnInit() {
    this.checkNetwork();
  }
  checkNetwork(){
    this.online = navigator.onLine;
    setTimeout(() => {
      this.checkNetwork();
    }, 500)
  }
  showItems() {
    this.fabTogglerState = "active";
    this.buttons = this.fabButtons;
  }

  hideItems() {
    this.fabTogglerState = "inactive";
    this.buttons = [];
  }

  checkBalance() {
    this.loading = true;
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
        this.loading = false;
      }
      this.localStorage.setItem("balance", result).subscribe(() => {});
    });
  }

  onToggleFab() {
    this.chips = [];
    this.buttons.length ? this.hideItems() : this.showItems();
  }
}
