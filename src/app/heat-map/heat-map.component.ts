import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { DataService } from "../services/data.service";
import * as moment from "moment";
import * as d3 from "d3";
import * as _ from "lodash";

@Component({
  selector: "app-heat-map",
  templateUrl: "./heat-map.component.html",
  styleUrls: ["./heat-map.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class HeatMapComponent implements OnInit {
  loading = false;
  allTransactions;
  heatMapData = [];
  small = true;
  svg;
  selectedDate = null;
  constructor(private data: DataService) {}
  monthFltr = moment().format("MMMM YYYY");
  ngOnInit() {
    this.getAllMonthTransactions();
    this.checkSelectedDate();
    localStorage.removeItem("heatmapd");
  }
  checkSelectedDate() {
    this.selectedDate = localStorage.getItem("heatmapd");
    setTimeout(() => {
      this.checkSelectedDate();
    }, 500);
  }
  getAllMonthTransactions() {
    this.loading = true;
    this.data.getAllMonthTransactions().subscribe(data => {
      this.allTransactions = data;
      this.smallHeatMapChart();
      this.loading = false;
    });
  }
  heatMapChart() {
    this.small = false;
    let expenses = this.allTransactions.expenses;
    let heatMapData = [];
    expenses.forEach(function(expense, i) {
      let heatTemp = {
        day: moment(expense[0]).format("YYYY-MM-DD"),
        count: expense[2]
      };
      heatMapData.push(heatTemp);
    }, this);
    heatMapData = _(heatMapData)
      .groupBy("day")
      .map((day, id) => ({
        day: id,
        count: _.sumBy(day, "count")
      }))
      .value();
    this.drawHeatMap(heatMapData);
  }
  smallHeatMapChart() {
    this.small = true;
    let expenses = this.allTransactions.expenses;
    let heatMapData = [];
    expenses.forEach(function(expense, i) {
      if (expense[2] < 6500) {
        let heatTemp = {
          day: moment(expense[0]).format("YYYY-MM-DD"),
          count: expense[2]
        };
        heatMapData.push(heatTemp);
      }
    }, this);
    heatMapData = _(heatMapData)
      .groupBy("day")
      .map((day, id) => ({
        day: id,
        count: _.sumBy(day, "count")
      }))
      .value();
    this.drawHeatMap(heatMapData);
  }
  drawHeatMap(heatMapData) {
    let dateData = heatMapData;
    var weeksInMonth = function(month) {
      var m = d3.timeMonth.floor(month);
      return d3.timeWeeks(d3.timeWeek.floor(m), d3.timeMonth.offset(m, 1))
        .length;
    };

    var minDate = d3.min(dateData, function(d: any) {
      return new Date(d.day);
    });
    var maxDate = d3.max(dateData, function(d: any) {
      return new Date(d.day);
    });
    var cellMargin = 2,
      cellSize = 20;

    var day = d3.timeFormat("%w"),
      week = d3.timeFormat("%U"),
      format = d3.timeFormat("%Y-%m-%d"),
      titleFormat = d3.utcFormat("%a, %d-%b"),
      monthName = d3.timeFormat("%B %y"),
      months = d3.timeMonth.range(d3.timeMonth.floor(minDate), maxDate);
    d3.select("#heatMap")
      .selectAll("*")
      .remove();

    let svg = d3
      .select("#heatMap")
      .selectAll("svg")
      .data(months)
      .enter()
      .append("svg")
      .attr("class", "month")
      .attr("height", cellSize * 7 + cellMargin * 8 + 20) // the 20 is for the month labels
      .attr("width", function(d) {
        var columns = weeksInMonth(d);
        return cellSize * columns + cellMargin * (columns + 1);
      })
      .append("g");
    svg
      .append("text")
      .attr("class", "month-name")
      .attr("y", cellSize * 7 + cellMargin * 8 + 15)
      .attr("x", function(d) {
        var columns = weeksInMonth(d);
        return (cellSize * columns + cellMargin * (columns + 1)) / 2;
      })
      .attr("text-anchor", "middle")
      .text(function(d) {
        return monthName(d);
      });
    var rect = svg
      .selectAll("rect.day")
      .data(function(d, i) {
        return d3.timeDays(d, new Date(d.getFullYear(), d.getMonth() + 1, 1));
      })
      .enter()
      .append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("rx", 3)
      .attr("ry", 3) // rounded corners
      .attr("fill", "#eaeaea") // default light grey fill
      .attr("y", function(d) {
        return +day(d) * cellSize + +day(d) * cellMargin + cellMargin; //extra + for number conversion
      })
      .attr("x", function(d): number {
        return (
          (+week(d) - +week(new Date(d.getFullYear(), d.getMonth(), 1))) *
            cellSize +
          (+week(d) - +week(new Date(d.getFullYear(), d.getMonth(), 1))) *
            cellMargin +
          cellMargin
        );
      })
      .datum(format);

    rect.append("title").text(function(d) {
      return titleFormat(new Date(d));
    });
    var lookup = d3
      .nest()
      .key(function(d: any) {
        return d.day;
      })
      .rollup(function(leaves: any): any {
        return d3.sum(leaves, function(d: any) {
          return parseInt(d.count);
        });
      })
      .object(dateData);

    var scale = d3
      .scaleLinear()
      .domain(
        d3.extent(dateData, function(d: any) {
          return parseInt(d.count);
        })
      )
      .range([0.4, 1]); // the interpolate used for color expects a number in the range [0,1] but i don't want the lightest part of the color scheme
    let Tooltip = d3
      .select("#heatMap")
      .append("div")
      .style("display", "none")
      .attr("class", "tooltip")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("font-size", "18px");

    // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function(d) {
      Tooltip.style("display", "block");
    };

    let mousemove = function(d) {
      d = moment(d).format("YYYY-MM-DD");
      d3.select(this).classed("hover", true);
      let amount = lookup[d] ? lookup[d] : 0;
      localStorage.setItem("heatmapd", d);
      Tooltip.html(
        "<strong>" +
          moment(d).format("ddd DD-MM-YY") +
          "<span class='green' href=/tansactions?date=" +
          d +
          "> ₹ " +
          amount +
          "</span></strong>"
      )
        .style("left", "15%")
        .style("top", "2px")
        .style("margin", "5px");
    };
    let mouseleave = function(d) {
      d3.select(this).classed("hover", false);
      // Tooltip.style("display", "none");
    };
    //date label
    svg
      .selectAll("rect.day.text")
      .data(function(d, i) {
        return d3.timeDays(d, new Date(d.getFullYear(), d.getMonth() + 1, 1));
      })
      .enter()
      .append("text")
      .on("mouseover", mouseover) // What to do when hovered
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .text(function(d) {
        return moment(d).format("DD");
      })
      .attr("fill", "white")
      .style("font-size", "12px")
      .attr("y", function(d) {
        return +day(d) * cellSize + +day(d) * cellMargin + cellMargin + 12;
      })
      .attr("x", function(d) {
        return (
          (+week(d) - +week(new Date(d.getFullYear(), d.getMonth(), 1))) *
            cellSize +
          (+week(d) - +week(new Date(d.getFullYear(), d.getMonth(), 1))) *
            cellMargin +
          cellMargin +
          2
        );
      });
    rect
      .filter(function(d) {
        return d in lookup;
      })
      .style("fill", function(d) {
        return d3.interpolateYlGn(scale(lookup[d]));
      })
      .on("mouseover", mouseover) // What to do when hovered
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .select("title")
      .text(function(d) {
        return titleFormat(new Date(d)) + ":  " + lookup[d];
      });
  }
}
