import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "reverseStr" })
export class ReverseStr implements PipeTransform {
  transform(value: string): string {
    let newStr: string = "";
    for (var i = value.length - 1; i >= 0; i--) {
      newStr += value.charAt(i);
    }
    return newStr;
  }
}

@Pipe({ name: "prependStr" })
export class PrependStr implements PipeTransform {
  transform(value: string, before: string): string {
    if (value) {
      return before + value;
    }
  }
}
