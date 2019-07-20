import {
  Component,
  ViewChild,
  ElementRef,
  Inject,
  EventEmitter
} from "@angular/core";
import { DataService } from "../services/data.service";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { LocalStorage } from "@ngx-pwa/local-storage";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material";
import { formConsts } from "../consts/form.consts";
import { navAnimations } from "../nav/nav.animations";
import { MatSnackBar } from "@angular/material";
import {
  MatBottomSheet,
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA
} from "@angular/material";

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
  @ViewChild("eamount") amountfield: ElementRef;
  @ViewChild("ecomments") commentfield: ElementRef;
  constructor(
    private data: DataService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    protected localStorage: LocalStorage,
    private snackBar: MatSnackBar,
    private todoSheet: MatBottomSheet
  ) {}

  //todo
  todos;
  openTodo(): void {
    this.todoSheet.open(TodoSheet, {
      data: null
    });
    this.getTodos();
  }
  getTodos() {
    this.todos = null;
    let todoRef;
    this.data.getSheetInfo("Todo").subscribe(data => {
      this.todos = data;
      todoRef = this.todoSheet.open(TodoSheet, {
        data: this.todos.todos
      });
      todoRef.instance.onAdd.subscribe(data => {
        this.fillTodo(data);
      });
    });
  }
  fillTodo(data) {
    this.formGroup.setValue({
      amount: data[1],
      source: null,
      cat: data[2],
      subCat: data[0],
      comments: [data[3]],
      billImgUrl: null
    });
    this.commentfield.nativeElement.focus();
    this.amountfield.nativeElement.focus();
    this.cat = data[2];
    if (data[3]) {
      this.comments = data[3].split(",");
    } else {
      this.comments = [];
    }
  }
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
    if (suggestion === "Todo") {
      this.openTodo();
      return;
    }
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
    this.commentfield.nativeElement.focus();
    this.amountfield.nativeElement.focus();
    this.source = sugg[0];
    this.cat = sugg[1];
    if (sugg[5]) {
      this.comments = sugg[5].split(",");
    } else {
      this.comments = [];
    }
  }

  // FORM
  post: any;
  formGroup: FormGroup;
  imgUploading = false;
  imageRespone: any;
  imgAdded = false;
  balances: any;
  sources = formConsts.SOURCES;
  fabSources = formConsts.FAB_SOURCES;
  source;
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
  spinner = 0;
  spinnerVal = 0;
  mode = "create";

  ngOnInit() {
    this.editCheck();
    this.setSuggestions();
    this.createForm();
    this.getGeoLoc();
    this.getBalance();
    setTimeout(() => {
      this.commentfield.nativeElement.focus();
      this.amountfield.nativeElement.focus();
    }, 100);
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
    this.fabSuggestions.push("Todo");
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
      if (unSubmittedForm) {
        this.formGroup = this.formBuilder.group({
          amount: [
            unSubmittedForm.amount,
            [Validators.required, Validators.pattern(amountRegex)]
          ],
          source: [unSubmittedForm.source, [Validators.required]],
          cat: [unSubmittedForm.cat, [Validators.required]],
          subCat: [unSubmittedForm.subCat, [Validators.required]],
          comments: [[], []],
          billImgUrl: []
        });
        this.cat = unSubmittedForm.cat;
        this.source = unSubmittedForm.source;
        if (unSubmittedForm) {
          this.comments = unSubmittedForm.comments;
        } else {
          this.comments = null;
        }
      }
      this.formChanges();
    });
  }

  formChanges(): void {
    this.formGroup.valueChanges.subscribe(values => {
      let temp = Object.assign([], this.comments);
      temp.push(values.comments);
      values.comments = temp;
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

  loadingSpinner() {
    setTimeout(() => {
      if (this.spinner < 20) {
        this.spinner = this.spinner + 1;
        this.spinnerVal = (this.spinner / 20) * 100;
        this.loadingSpinner();
      }
    }, 1000);
  }

  onSubmit(post) {
    this.post = post;
    post.location = this.geoLocation;
    post.comments = this.comments;
    let msg;
    this.loadingSpinner();
    this.data
      .writeTransaction(post, this.mode, this.trans_id)
      .subscribe(data => {
        this.spinnerVal = 100;
        if (data === "Stored Offline") {
          this.router.navigate(["/offline_sync"]);
          msg = "Stored Offline";
        } else {
          msg = "Transaction Added";
          this.checkBalance();
          this.router.navigate(["/transactions"]);
        }
        this.snackBar.open(msg, null, {
          duration: 3000,
          verticalPosition: "bottom",
          horizontalPosition: "left"
        });
        this.localStorage.removeItem("unSubmittedForm").subscribe(() => {});
        this.comments = [];
      });
  }
}

@Component({
  selector: "todo-sheet",
  templateUrl: "todo-sheet.component.html"
})
export class TodoSheet {
  formattedTodos = [];
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public todos: any,
    private todoSheetRef: MatBottomSheetRef<TodoSheet>,
    private router: Router
  ) {
    if (this.todos) {
      this.todos.forEach(function(todo, i) {
        let temp = {
          name: todo[0],
          status: todo[1] === true,
          data: JSON.parse(todo[2])
        };
        this.formattedTodos.push(temp);
      }, this);
    }
  }
  onAdd = new EventEmitter();
  fillForm(data) {
    this.todoSheetRef.dismiss();
    this.onAdd.emit(data);
    event.preventDefault();
  }
  completedTodo(name) {
    this.todoSheetRef.dismiss();
    this.router.navigate(["/transactions"], { queryParams: { query: name } });
    event.preventDefault();
  }
}
