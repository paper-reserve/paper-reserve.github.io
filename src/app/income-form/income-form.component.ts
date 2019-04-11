import { Component, OnInit } from "@angular/core";
import { DataService } from "../services/data.service";
import { Router } from "@angular/router";
import { formConsts } from "../consts/form.consts";
import { MatSnackBar } from "@angular/material";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from "@angular/forms";

@Component({
  selector: "app-income-form",
  templateUrl: "./income-form.component.html",
  styleUrls: [
    "../transaction/transaction.component.scss",
    "./income-form.component.scss"
  ]
})
export class IncomeFormComponent implements OnInit {
  sources = [
    { key: "Cash", value: "D2" },
    { key: "ICICI", value: "B2" },
    { key: "HDFC", value: "C2" },
    { key: "Zeta", value: "E2" },
    { key: "Paytm", value: "F2" }
  ];
  post;
  loading = false;
  formGroup: FormGroup;

  constructor(
    private data: DataService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.createForm();
  }
  createForm() {
    let amountRegex: RegExp = /\d+/;
    this.formGroup = this.formBuilder.group({
      iamount: [null, [Validators.required, Validators.pattern(amountRegex)]],
      isource: [null, [Validators.required]],
      icomments: [null, []]
    });
  }
  onSubmit(post) {
    this.post = post;
    this.data.addIncome(post).subscribe(data => {
      this.snackBar.open("Income Added", null, {
        duration: 3000,
        verticalPosition: "bottom",
        horizontalPosition: "left"
      });
      this.router.navigate([""]);
    });
  }
}
