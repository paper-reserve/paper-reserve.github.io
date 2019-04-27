import { Component, OnInit } from "@angular/core";
import { DataService } from "../services/data.service";
import * as moment from "moment";
import * as _ from "lodash";

@Component({
  selector: "app-mapbox",
  templateUrl: "./mapbox.component.html",
  styleUrls: ["./mapbox.component.scss", "../list/list.component.scss"]
})
export class MapboxComponent implements OnInit {
  monthFltr = moment().format("MMMM YYYY");
  transactions;
  locations;
  currLoc =null;
  constructor(private data: DataService) {}

  ngOnInit() {
    this.getMapTransactions();
  }
  getMapTransactions() {
    this.transactions = null;
    this.data.getMapTransactions(this.monthFltr).subscribe(data => {
      this.transactions = data;
      console.log(this.transactions);
      this.locations = [];
      this.transactions.expenses.forEach(function(expense, i) {
        let loc = expense[6].split(",").reverse();
        let lng = parseFloat(loc[0]);
        let lat = parseFloat(loc[1]);
        let locTemp = {
          lnglat: { lng: lng, lat: lat },
          source: expense[3].replace(/\s/g, ""),
          cat: expense[4],
          amount: expense[2],
          subCat: expense[1],
          comment: expense[5],
          date:expense[0]
        };
        this.locations.push(locTemp);
      }, this);
    });
  }
  popupMarker(loc) {
    this.currLoc = loc;
    setTimeout(() => {
      this.currLoc = null;
    }, 8000)
  }
}
