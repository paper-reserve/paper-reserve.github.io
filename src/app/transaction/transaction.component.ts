import { Component } from "@angular/core";
import { DataService } from "../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { LocalStorage } from "@ngx-pwa/local-storage";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material";
import { formConsts } from "../consts/form.consts";
import { navAnimations } from "../nav/nav.animations";

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
  styleUrls: ["./transaction.component.scss"],
  animations: navAnimations
})
export class TransactionComponent {
  // mat chip variables
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
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

  // fab suggestions
  fabTogglerState = "inactive";
  fabSuggestions = [];
  suggestions = [];
  suggDetails = formConsts.SUGGESTIONS;
  showSuggestions() {
    this.fabTogglerState = "active";
    this.suggestions = this.fabSuggestions;
  }

  hideSuggestions() {
    this.fabTogglerState = "inactive";
    this.suggestions = [];
  }
  onToggleFab() {
    this.suggestions.length ? this.hideSuggestions() : this.showSuggestions();
  }
  suggClick(suggestion) {
    this.onToggleFab();
    let sugg = this.suggDetails[suggestion];
    this.formGroup.setValue({
      amount: null,
      source: sugg[0],
      cat: sugg[1],
      subCat: sugg[2],
      comments: [sugg[5]],
      billImgUrl: null
    });
    this.cat = sugg[1];
    // if (sugg[5]) {
    //   this.comments = [sugg[5]];
    // } else {
    //   this.comments = [];
    // }
  }

  // FORM
  post: any;
  formGroup: FormGroup;
  imgUploading = false;
  imageRespone: any;
  imgAdded = false;
  balances: any;
  sources = formConsts.SOURCES;
  cats = formConsts.CATEGORIES;
  subCats = formConsts.SUBCATS;
  comments: string[] = [];
  geoLocation: any;
  cat;
  amount;

  // edit form
  trans_id;
  transaction;
  fetching = false;
  mode = "create";

  constructor(
    private data: DataService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    protected localStorage: LocalStorage
  ) {}

  ngOnInit() {
    this.editCheck();
    this.setSuggestions();
    this.createForm();
    this.getGeoLoc();
    this.getBalance();
  }

  editCheck() {
    this.trans_id = this.route.snapshot.params["id"];
    if (this.trans_id) {
      this.getSetTransaction(this.trans_id);
    }
  }
  getBalance() {
    this.localStorage.getItem("balance").subscribe(balances => {
      this.balances = balances;
    });
  }
  getGeoLoc() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setPosition.bind(this));
    } else {
      console.log("Geo location is not supported by this browser.");
    }
  }
  setSuggestions() {
    let day = moment().day();
    let hour = moment().hour();
    let key = day == 0 || day == 6 ? "WE" + hour : hour;
    this.fabSuggestions = Object.assign([], formConsts.TIMELY_SUGGESTIONS[key]);
    this.fabSuggestions.push("Reset");
  }
  getSetTransaction(id) {
    this.fetching = true;
    this.data.getTransaction(id).subscribe(data => {
      this.transaction = data;
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
        comments: [null, []],
        billImgUrl: []
      });
      this.cat = transaction[4];
      this.amount = transaction[2];
      this.comments = transaction[5].split(",");
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
      comments: [null, []],
      billImgUrl: []
    });
    this.localStorage.getItem("unSubmittedForm").subscribe(unSubmittedForm => {
      if(unSubmittedForm){
      this.formGroup = this.formBuilder.group({
        amount: [unSubmittedForm.amount, [Validators.required, Validators.pattern(amountRegex)]],
        source: [unSubmittedForm.source, [Validators.required]],
        cat: [unSubmittedForm.cat, [Validators.required]],
        subCat: [unSubmittedForm.subCat, [Validators.required]],
        comments: [[unSubmittedForm.comments], []],
        billImgUrl: []
      });
      this.cat = unSubmittedForm.cat;
      // if (unSubmittedForm.comments) {
      //   this.comments = [unSubmittedForm.comments];
      // } else {
      //   this.comments = null;
      // }
      }
      this.formChanges();
    });
  }

  formChanges(): void {
    this.formGroup.valueChanges.subscribe(values => {
      this.localStorage.setItem("unSubmittedForm", values).subscribe(() => {});
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
        this.localStorage.removeItem("unSubmittedForm").subscribe(() => {});
        this.router.navigate(["/transactions"]);
      });
  }
}
