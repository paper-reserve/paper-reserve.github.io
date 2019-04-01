import { Component } from "@angular/core";
import { DataService } from "../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { LocalStorage } from "@ngx-pwa/local-storage";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from "@angular/forms";
import { Observable } from "rxjs/Observable";
@Component({
  selector: "app-transaction",
  templateUrl: "./transaction.component.html",
  styleUrls: ["./transaction.component.scss"]
})
export class TransactionComponent {
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  comments: string[] = [];
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || "").trim()) {
      this.comments.push(value.trim());
    }
    if (input) {
      input.value = "";
    }
  }
  remove(comment: string): void {
    const index = this.comments.indexOf(comment);
    if (index >= 0) {
      this.comments.splice(index, 1);
    }
  }
  post: any;
  formGroup: FormGroup;
  imgUploading = false;
  imageRespone: any;
  imgAdded = false;
  balances: any;
  sources = [
    "Cash",
    "HDFC",
    "ICICI",
    "ICICI Credit",
    "HDFC Credit",
    "Zeta",
    "Paytm"
  ];
  cats = [
    "Food",
    "Shopping",
    "Travel",
    "Entertainment",
    "Payments",
    "Misc.",
    "Transactions"
  ];
  subCats = {
    Food: ["Tea/Coffee", "Street Food", "Restaurants", "Snacks"],
    Shopping: [
      "Groceries",
      "Cosmetics",
      "Medicine",
      "Dress",
      "Accessories",
      "Household"
    ],
    Travel: [
      "Bus",
      "Auto",
      "Cab",
      "Train",
      "Fuel",
      "Toll",
      "Parking",
      "Air",
      "Service"
    ],
    Entertainment: ["Movie", "Tour"],
    Payments: [
      "Rent",
      "Car Loan",
      "ICICI Due Repay",
      "HDFC Due Repay",
      "Chit",
      "RD",
      "Phone Bill",
      "EB Bill",
      "Cable TV",
      "Maintenance",
      "Gas",
      "iWish"
    ],
    Transactions: [
      "Cash Withdraw",
      "To ICICI",
      "To HDFC",
      "To Paytm",
      "Savings",
      "WHC",
      "To Home"
    ],
    "Misc.": []
  };
  geoLocation: any;
  trans_id;
  transaction;
  fetching = false;
  mode = "create";
  cat;
  amount;
  constructor(
    private data: DataService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    protected localStorage: LocalStorage
  ) {}

  ngOnInit() {
    this.trans_id = this.route.snapshot.params["id"];
    if (this.trans_id) {
      this.getSetTransaction(this.trans_id);
    }
    this.createForm();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setPosition.bind(this));
    } else {
      console.log("Geo location is not supported by this browser.");
    }
    this.localStorage.getItem("balance").subscribe(balances => {
      this.balances = balances;
    });
  }
  getSetTransaction(id) {
    this.fetching = true;
    this.data.getTransaction(id).subscribe(data => {
      this.transaction = data
      this.transaction = this.transaction.row_data[0];
      this.fetching = false;
      this.mode = "update";
      let transaction = this.transaction;
      let amountRegex: RegExp = /\d+/;
      this.formGroup = this.formBuilder.group({
        amount: [
          transaction[2],
          [Validators.required, Validators.pattern(amountRegex)]
        ],
        source: [transaction[3], [Validators.required]],
        cat: [transaction[4], [Validators.required]],
        subCat: [transaction[1], [Validators.required]],
        comments: [
          null,
          [Validators.minLength(2), Validators.maxLength(30)]
        ],
        billImgUrl: []
      });
      this.cat = transaction[4];
      this.amount = transaction[2];
      this.comments=transaction[5].split(',');
    });
  }

  onFileChange(event) {
    let fileName =
      this.formGroup.controls["amount"].value +
      "-" +
      moment().format("DD-MM-YYYY_HH-mm") +
      ".png";

    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      this.imgUploading = true;
      this.imgAdded = true;
      this.formGroup.controls["billImgUrl"].setValue("");
      this.data.uploadImage(fileName, file).subscribe(result => {
        this.data.getSharedLink(result).subscribe(result => {
          if (result) {
            this.imageRespone = result;
            this.imgUploading = false;
            this.formGroup.controls["billImgUrl"].setValue(
              this.imageRespone.url + "%26raw=1"
            );
          }
        });
      });
    }
  }

  setPosition(position) {
    this.geoLocation =
      position.coords.latitude + "," + position.coords.longitude;
  }

  createForm() {
    let amountRegex: RegExp = /\d+/;
    this.formGroup = this.formBuilder.group({
      amount: [null, [Validators.required, Validators.pattern(amountRegex)]],
      source: [null, [Validators.required]],
      cat: [null, [Validators.required]],
      subCat: [null, [Validators.required]],
      comments: [null, [Validators.minLength(2), Validators.maxLength(30)]],
      billImgUrl: []
    });
  }

  getErrorAmount() {
    return this.formGroup.get("amount").hasError("required")
      ? "Enter amount"
      : this.formGroup.get("amount").hasError("pattern")
      ? "Not a valid amount"
      : "";
  }
  checkBalance() {
    this.data.getBalance().subscribe(balances => {
      let result = {};
      for (let balance of balances.split(",")) {
        let obj = balance.split(": ");
        let key = obj[0];
        let value = obj[1];
        result[key] = value;
      }
      this.localStorage.setItem("balance", result).subscribe(() => {});
    });
  }

  onSubmit(post) {
    this.post = post;
    post.location = this.geoLocation;
    post.comments = this.comments;
    this.data
      .writeTransaction(post, this.mode, this.trans_id)
      .subscribe(data => {
        this.checkBalance();
        this.router.navigate(["/"]);
      });
  }
}
