import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { DataService } from "../services/data.service";
import * as moment from "moment";
import * as d3 from "d3";
import * as _ from "lodash";

@Component({
  selector: "app-savings",
  templateUrl: "./savings.component.html",
  styleUrls: ["./savings.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class SavingsComponent implements OnInit {
  result;
  instalments = [];
  lics = [];
  headers = [];
  licHeaders = [];
  loading = false;
  transactions;
  groupData = [];
  splitData = [];
  csvData = [];
  grouped = false;
  svg;
  constructor(private data: DataService) {}
  monthFltr = moment().format("MMMM YYYY");
  ngOnInit() {
    this.svg = d3
      .select("#expensesBubble")
      .append("svg")
      .attr("width", 375)
      .attr("height", 800);
    this.data.getTransactions(this.monthFltr).subscribe(data => {
      this.transactions = data;
      let expenses = this.transactions.expenses;
      expenses.forEach(function(expense, i) {
        let temp = {
          category: expense[4],
          subCat: expense[1],
          value: expense[2]
        };
        this.splitData.push(temp);
      }, this);
      this.groupData = _(this.splitData)
        .groupBy("category")
        .map((category, id) => ({
          category: id,
          subCat: _.uniq(_.map(category, "subCat")),
          value: _.sumBy(category, "value")
        }))
        .value();
      this.splitBubble();
    });
  }
  splitBubble() {
    this.csvData = this.splitData;
    this.grouped = false;
    this.svg.selectAll("*").remove();
    this.drawChart();
  }
  groupBubble() {
    this.csvData = this.groupData;
    this.grouped = true;
    this.svg.selectAll("*").remove();
    this.drawChart();
  }
  drawChart() {
    d3.select("p").style("color", "red");
    let width = 375;
    let height = 810;

    let color = d3
      .scaleOrdinal()
      .domain(_.uniq(_.map(this.csvData, "category")))
      .range(d3.schemeSet1);

    // Size scale for categories
    let size = d3
      .scaleLinear()
      .domain([
        _.min(_.map(this.csvData, "value")),
        _.max(_.map(this.csvData, "value"))
      ])
      .range([7, 40]); // circle will be between 7 and 55 px wide

    // create a tooltip
    let Tooltip = d3
      .select("#expensesBubble")
      .append("div")
      .style("opacity", 0)
      .style("display", "none")
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px");

    // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function(d) {
      Tooltip.style("display", "block");
    };
    let mousemove = function(d) {
      let subCatArr = [];
      if (typeof d.subCat === "string") d.subCat = [d.subCat];
      d.subCat.forEach(function(subCat, i) {
        let temp = "<mat-chip class='chip-color'>" + subCat + "</mat-chip>";
        subCatArr.push(temp);
      });
      Tooltip.html(
        "<strong>" +
          d.category +
          "</strong><br><mat-chip-list>" +
          subCatArr.join("") +
          "</mat-chip-list>" +
          "<br>₹ " +
          d.value
      )
        .style("left", d3.mouse(this)[0] + 20 + "px")
        .style("top", d3.mouse(this)[1] + "px");
    };
    let mouseleave = function(d) {
      Tooltip.style("display", "none");
    };

    // Initialize the circle: all located at the center of the svg area
    let node = this.svg
      .append("g")
      .selectAll("circle")
      .data(this.csvData)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", function(d) {
        return size(d.value);
      })
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .style("fill", function(d) {
        return color(d.category);
      })
      .style("fill-opacity", 0.8)
      // .attr("stroke", "black")
      // .style("stroke-width", 1)
      .on("mouseover", mouseover) // What to do when hovered
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .call(
        d3
          .drag() // call specific function when circle is dragged
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );
    let simulation: any;
    simulation = d3
      .forceSimulation()
      .force(
        "forceX",
        d3
          .forceX()
          .strength(0.1)
          .x(width * 0.5)
      )
      .force(
        "forceY",
        d3
          .forceY()
          .strength(0.1)
          .y(height * 0.5)
      )
      .force(
        "center",
        d3
          .forceCenter()
          .x(width * 0.5)
          .y(height * 0.5)
      )
      .force("charge", d3.forceManyBody())
      .force(
        "collide",
        d3
          .forceCollide()
          .strength(3)
          .radius(function(d) {
            let d1: any;
            d1 = d;
            return size(d1.value);
          })
          .iterations(1)
      ); // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation.nodes(this.csvData).on("tick", function(d) {
      node
        .attr("cx", function(d: any) {
          return d.x;
        })
        .attr("cy", function(d: any) {
          return d.y;
        });
    });
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.03).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0.03);
      d.fx = null;
      d.fy = null;
    }
  }
  getInstalments() {
    this.loading = true;
    this.data.getSheetInfo("Instalments").subscribe(data => {
      this.result = data;
      this.instalments = this.result.instalments;
      this.headers = this.instalments.shift();
      this.loading = false;
    });
  }
  getLic() {
    this.loading = true;
    this.data.getSheetInfo("LIC").subscribe(data => {
      this.result = data;
      this.loading = false;
      this.licHeaders = this.result.lic.shift();
      this.lics = [];
      this.result.lic.forEach(function(item, i) {
        let temp = {};
        item.forEach(function(col, j) {
          temp[this.licHeaders[j]] = col;
        }, this);
        this.lics.push(temp);
      }, this);
    });
  }
}
