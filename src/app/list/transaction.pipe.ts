import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment";

@Pipe({
  name: "filter"
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], query: any, column: string): any[] {
    if (!items) return [];
    if (!query) return items;
    switch (column) {
      case "source": {
        if (!query.length) return items;
        return items.filter(it => {
          return query.includes(it[3].toLowerCase());
        });
        break;
      }
      case "search": {
        if (query.length <= 2) return items;
        return items.filter(it => {
          return (
            it[5].toLowerCase().includes(query.toLowerCase()) ||
            it[1].toLowerCase().includes(query.toLowerCase())
          );
        });
        break;
      }
      case "date": {
        return items.filter(it => {
          return (
            moment(query[0]).format("DD MM YYYY") <=
              moment(it[0]).format("DD MM YYYY") &&
            moment(query[1]).format("DD MM YYYY") >=
              moment(it[0]).format("DD MM YYYY")
          );
        });
        break;
      }
      case "cat": {
        if (!query.length) return items;
        return items.filter(it => {
          return query.includes(it[4]);
        });
        break;
      }
      case "amount": {
        return items.filter(it => {
          return query[0] <= parseInt(it[2]) && query[1] >= parseInt(it[2]);
        });
        break;
      }
      default: {
        return items;
        break;
      }
    }
  }
}

@Pipe({ name: "sortBy" })
export class SortingPipe implements PipeTransform {
  transform(items: any[], key: string, order: string) {
    let keyMap = {
      date: 0,
      source: 3,
      cat: 4,
      amount: 2,
      id: 9
    };
    let field = keyMap[key];
    items.sort((a: any, b: any) => {
      if (a[field] < b[field]) {
        return -1;
      } else if (a[field] > b[field]) {
        return 1;
      } else {
        return 0;
      }
    });
    return order === "desc" ? items.reverse() : items;
  }
}
@Pipe({ name: "sumAmt" })
export class SumAmtPipe implements PipeTransform {
  transform(items: any[], flag: string) {
    if (flag == "today") {
      return items.reduce((sum, item) => sum + item[2], 0);
    } else {
      return items.reduce((sum, item) => sum + item[2], 0);
    }
  }
}

@Pipe({ name: "reverse" })
export class ReversePipe implements PipeTransform {
  transform(value) {
    return value.slice().reverse();
  }
}

@Pipe({ name: "iconstr" })
export class IconStrPipe implements PipeTransform {
  transform(value) {
    var CAT_ICONS = {
      Food: "restaurant",
      Travel: "time_to_leave",
      Shopping: "shopping_cart",
      Entertainment: "toys",
      Payments: "receipt",
      "Misc.": "blur_on",
      Transactions: "swap_horiz"
    };
    return CAT_ICONS[value];
  }
}

@Pipe({ name: "percentagePipe" })
export class PercentagePipe implements PipeTransform {
  transform(budget) {
    let used = budget[1] - budget[2];
    let percentage = ((used / budget[1]) * 100).toFixed(0);
    return percentage;
  }
}

@Pipe({ name: "isToday" })
export class IsTodayPipe implements PipeTransform {
  transform(date) {
    return moment(date).format("DD MM YYYY") == moment().format("DD MM YYYY");
  }
}
