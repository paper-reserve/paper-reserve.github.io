import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as moment from "moment";
import { NgForage, Driver, NgForageConfig, NgForageCache } from "ngforage";
import * as uuid from "uuid";
import { of } from "rxjs";
import { Observable } from "rxjs/Rx";
@Injectable({
  providedIn: "root"
})
export class DataService {
  MAP_URL =
    "https://script.google.com/macros/s/AKfycbzqbIwv3mExSH1I_kq3QiTiTvD85rXgI7uEWYnkjbe3JGJsnB0/exec";
  INFO_URL =
    "https://script.google.com/macros/s/AKfycbxb2XVYjTfM9CYNEvlpOHmj5QIR_-t3utN4gBMLwf1WLUNhPIs/exec";
  ALL_URL =
    "https://script.google.com/macros/s/AKfycby3u_bOMONedPTgSVXgQz457XN_OKDBw1vFO5rN/exec";
  constructor(
    private http: HttpClient,
    private readonly ngf: NgForage,
    private readonly cache: NgForageCache
  ) {
    this.ngf.name = "offline_transactions";
    this.cache.driver = Driver.INDEXED_DB;
  }

  getAllMonthTransactions() {
    return this.http.get(this.ALL_URL);
  }
  getTransactions(month) {
    return this.http.get(this.MAP_URL + "?isMap=true&sheet=" + month);
  }
  getMapTransactions(month) {
    return this.http.get(this.MAP_URL + "?isMap=true&sheet=" + month);
  }
  getTransaction(id) {
    let ACTION_URL =
      "https://script.google.com/macros/s/AKfycbwclNzWz4lXRs_LyFGoW_maBzNcC52FonDOrsTMJ9n4ed20nk0/exec";
    return this.http.get(ACTION_URL + "?id=" + id + "&actionName=SHOW");
  }

  delTransaction(id) {
    let ACTION_URL =
      "https://script.google.com/macros/s/AKfycbwclNzWz4lXRs_LyFGoW_maBzNcC52FonDOrsTMJ9n4ed20nk0/exec";
    return this.http.get(
      "https://script.google.com/macros/s/AKfycbwclNzWz4lXRs_LyFGoW_maBzNcC52FonDOrsTMJ9n4ed20nk0/exec" +
        "?id=" +
        id +
        "&actionName=DESTROY",
      { responseType: "text" }
    );
  }

  getSheetInfo(sheet_name) {
    return this.http.get(this.INFO_URL + "?sheet_name=" + sheet_name);
  }
  writeTransaction(post, mode, trans_id) {
    let offline = !navigator.onLine;
    if (!post.timeStamp) {
      post.timeStamp = moment().format("DD-MMMM HH:mm");
    }
    let offlinePostData = post;
    if (offline) {
      this.ngf.setItem(uuid.v4(), offlinePostData);
      return of("Stored Offline");
    } else {
      var data = [
        post.subCat,
        post.amount,
        post.source,
        post.cat,
        post.comments,
        post.location,
        post.billImgUrl,
        mode,
        trans_id,
        post.timeStamp
      ].join("|||");
      let WRITE_URL =
        "https://script.google.com/macros/s/AKfycbzp29Qzo_oLjAgi2UnhkRDl798lXFiU99Jy-aqXIuuE8NF0Ejlq/exec?row=";
      return this.http
        .get(WRITE_URL + data)
        .timeout(20000)
        .catch(error => {
          let details = error;
          this.ngf.setItem(uuid.v4(), offlinePostData);
          return of("Stored Offline");
          return Observable.throw(new Error(details));
        });
    }
  }

  uploadImage(fileName, file) {
    let httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/octet-stream",
        Authorization:
          "Bearer jasF7eX3o5gAAAAAAAADQYiBxjLWCTbbsuwxgve2igMcgfu8s7-FOpmB8zl9EktM",
        "Dropbox-API-Arg": JSON.stringify({
          path: "/Bills/" + moment().format("DD-MM-YYYY") + "/" + fileName,
          mode: "add",
          autorename: true,
          mute: false,
          strict_conflict: false
        })
      })
    };
    let DROPBOX_UPLOAD_URL = "https://content.dropboxapi.com/2/files/upload";
    return this.http.post(DROPBOX_UPLOAD_URL, file, httpOptions);
  }

  getSharedLink(response) {
    let httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization:
          "Bearer jasF7eX3o5gAAAAAAAADQYiBxjLWCTbbsuwxgve2igMcgfu8s7-FOpmB8zl9EktM"
      })
    };
    let data = JSON.stringify({
      path: response.path_display,
      settings: {
        requested_visibility: "public"
      }
    });
    let DROPBOX_GET_LINK_URL =
      "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings";
    return this.http.post(DROPBOX_GET_LINK_URL, data, httpOptions);
  }

  getBalance() {
    let BALANCE_URL =
      "https://script.google.com/macros/s/AKfycbwiLibhxusQjgb4yl_3ue0_wY_NojiSRQI1KZOu7HZXMapFO2k/exec";
    return this.http.get(BALANCE_URL, { responseType: "text" });
  }

  addIncome(post) {
    let INCOME_URL =
      "https://script.google.com/macros/s/AKfycbzwgP7l-SP3h0Vbr2Xd3Eh71gr8xaQMHsqHxvQvptndjO1Z5K0K/exec";
    return this.http.get(
      INCOME_URL +
        "?cell=" +
        post.isource +
        "&nVal=" +
        post.iamount +
        "&nNote=" +
        post.icomments,
      { responseType: "text" }
    );
  }

  // offline sync action
  getOfflineTransactions() {
    let out: any[] = [];
    this.ngf
      .iterate(
        (value: any, key: any, itNum: number): void => {
          value.key = key;
          out.push(value);
        }
      )
      .then(() => {})
      .catch();
    return of(out);
  }
  getOffTran(key) {
    return this.ngf.getItem(key);
  }
  delOffTran(key) {
    return this.ngf.removeItem(key);
  }
}
