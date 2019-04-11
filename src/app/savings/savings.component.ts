import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { DataService } from "../services/data.service";

@Component({
  selector: "app-savings",
  templateUrl: "./savings.component.html",
  styleUrls: ["./savings.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class SavingsComponent implements OnInit {
  result;
  instalments = [];
  headers = [];
  loading = false;
  constructor(private data: DataService) {}

  ngOnInit() {}
  getInstalments() {
    this.loading = true;
    this.data.getSheetInfo("Instalments").subscribe(data => {
      this.result = data;
      this.instalments = this.result.instalments;
      this.headers = this.instalments.shift();
      this.loading = false;
    });
  }
}
