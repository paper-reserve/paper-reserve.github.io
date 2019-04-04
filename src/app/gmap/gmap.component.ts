import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit
} from "@angular/core";
import { DataService } from "../services/data.service";
import * as moment from "moment";

declare var google: any;
@Component({
  selector: "app-gmap",
  templateUrl: "./gmap.component.html",
  styleUrls: ["./gmap.component.scss"]
})
export class GmapComponent implements OnInit {
  map: Object;
  marker: Object;
  zoom: number;
  transactions;
  locations;
  loading = false;
  MARKER_COLORS = {
    Cash: "#00c853",
    ICICI: "#ff6f00",
    HDFC: "#aa00ff",
    Paytm: "#1976d2",
    Zeta: "#4a148c",
    "HDFC Credit": "#ef5350",
    "ICICI Credit": "#ef5350"
  };
  pastMonths = [];
  monthFltr = moment().format("MMMM YYYY");
  currMonth = moment().format("MMMM YYYY");
  today = moment();
  @ViewChild("map") mapRef: ElementRef;
  constructor(private data: DataService) {}

  ngOnInit() {
    this.getMapTransactions();
    this.setMonthSelector();
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
  getMapTransactions() {
    this.loading = true;
    this.transactions = null;
    this.data.getMapTransactions(this.monthFltr).subscribe(data => {
      this.transactions = data;
      this.locations = [];
      this.transactions.expenses
        .reverse()
        .forEach(function(transaction, index) {
          var date = moment(transaction[0]).format("DD-MM-YYYY HH:mm"),
            bill =
              transaction[8].length > 0
                ? '<br><div><a target="_blank" href="' +
                  transaction[8] +
                  '"><i class="tiny material-icons">receipt</i></a></div>'
                : "";
          this.locations.push([
            "<div>" +
              date +
              "</div><hr><div>" +
              transaction[1] +
              '<span class="" style="margin-left: 20px; padding: 4px; border-radius: 5px; background: ' +
              this.MARKER_COLORS[transaction[3]] +
              '">' +
              transaction[3] +
              " | ₹" +
              transaction[2] +
              " </span></div><br><div>" +
              transaction[5] +
              "</div>" +
              bill,
            transaction[6].split(",")[0],
            transaction[6].split(",")[1],
            transaction.length - index
          ]);
        }, this);
      this.loading = false;
      this.generateMap();
    });
  }

  generateMap() {
    let locations = this.locations;
    let expenses = this.transactions.expenses;
    let MARKER_COLORS = this.MARKER_COLORS;
    let map = new google.maps.Map(this.mapRef.nativeElement, {
      zoom: 18,
      backgroundColor: "#AAAAAA",
      zoomControl: false,
      streetViewControl: false,
      rotateControl: false,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
      },
      center: new google.maps.LatLng(locations[0][1], locations[0][2])
    });
    var infowindow = new google.maps.InfoWindow();

    var marker, i, scale, animation;
    setTimeout(function() {
      locations.forEach(function(transaction, i) {
        animation =
          i == 0 ? google.maps.Animation.BOUNCE : google.maps.Animation.DROP;

        marker = new google.maps.Marker({
          position: new google.maps.LatLng(locations[i][1], locations[i][2]),
          map: map,
          animation: animation,
          zIndex: locations[i][3],
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            strokeColor: MARKER_COLORS[expenses[i][3]],
            fillOpacity: 0.5,
            anchor: new google.maps.Point(0, 0),
            fillColor: MARKER_COLORS[expenses[i][3]],
            strokeWeight: 1,
            strokeOpacity: 0.8
          }
        });
        google.maps.event.addListener(
          marker,
          "mouseover",
          (function(marker, i) {
            return function() {
              infowindow.setContent(locations[i][0]);
              infowindow.open(map, marker);
            };
          })(marker, i)
        );
        google.maps.event.addListener(
          marker,
          "click",
          (function(marker, i) {
            return function() {
              infowindow.setContent(locations[i][0]);
              infowindow.open(map, marker);
            };
          })(marker, i)
        );
      }, this);
    }, 1000);
  }
}
