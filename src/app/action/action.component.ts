import { Component, OnInit } from "@angular/core";
import { DataService } from "../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";
@Component({
  selector: "app-action",
  templateUrl: "./action.component.html",
  styleUrls: ["./action.component.scss"]
})
export class ActionComponent implements OnInit {
  id;
  transaction;
  constructor(
    private data: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params["id"];
    if (this.id) {
      this.getTransaction(this.id);
    }
  }
  getTransaction(id) {
    this.data.getTransaction(id).subscribe(data => {
      this.transaction = data
      this.transaction = this.transaction.row_data[0];
    });
  }
  delTran(id) {
    this.data.delTransaction(id).subscribe(data => {
      this.router.navigate(["/"]);
    });
  }
}
