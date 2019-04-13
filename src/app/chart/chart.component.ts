import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { DataService } from "../services/data.service";
import * as moment from "moment";
import * as d3 from "d3";
import * as _ from "lodash";

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class ChartComponent implements OnInit {
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
    this.loading = true;
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
      this.splitData = _(this.splitData)
        .groupBy("subCat")
        .map((subCat, id) => ({
          category: _.uniq(_.map(subCat, "category"))[0],
          subCat: id,
          value: _.sumBy(subCat, "value")
        }))
        .value();
      this.groupData = _(this.splitData)
        .groupBy("category")
        .map((category, id) => ({
          category: id,
          subCat: _.uniq(_.map(category, "subCat")),
          value: _.sumBy(category, "value")
        }))
        .value();
      this.loading = false;
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
    //color
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
      .range([10, 50]);

    // create a tooltip
    let Tooltip = d3
      .select("#expensesBubble")
      .append("div")
      .style("display", "none")
      .attr("class", "tooltip")
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
        let temp = "<li>" + subCat + "</li>";
        subCatArr.push(temp);
      });
      Tooltip.html(
        "<strong>" +
          d.category +
          " ₹ " +
          d.value +
          "</strong>" +
          "<br><ul>" +
          subCatArr.join("") +
          "</ul>"
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
      .force(
        "charge",
        d3
          .forceManyBody()
          .distanceMax(400)
          .distanceMin(60)
      )
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
    let legend = this.svg
      .selectAll(".legend")
      .data(_.sortBy(_.uniq(_.map(this.csvData, "category"))))
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + 180 + "," + 80 + ")");
    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", function(d, i) {
        return 20 * i;
      })
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", function(d) {
        return color(d);
      });
    legend
      .append("text")
      .attr("x", 25)
      .attr("text-anchor", "start")
      .attr("dy", "1em")
      .attr("y", function(d, i) {
        return 20 * i;
      })
      .text(function(d) {
        return d;
      })
      .attr("font-size", "12px");
    let selectedLegend = null;
    legend.on(
      "click",
      function(type) {
        // dim all of the icons in legend
        d3.selectAll(".legend").style("opacity", 0.1);
        // make the one selected be un-dimmed
        d3.select(this).style("opacity", 1);
        if (type !== selectedLegend) {
          d3.selectAll(".node")
            .transition()
            .duration(500)
            .style("opacity", 0.0)
            .filter(function(d) {
              selectedLegend = type;
              return d["category"] == type;
            })
            .style("opacity", 1); // need this line to unhide dots
        } else {
          selectedLegend = null;
          d3.selectAll(".node")
            .transition()
            .duration(500)
            .style("opacity", 1);
          d3.selectAll(".legend").style("opacity", 1);
        }
      },
      this
    );
    legend
      .append("text")
      .attr("x", 31)
      .attr("dy", "-.2em")
      .attr("y", -10)
      .text("CATEGORY")
      .attr("font-size", "17px");
  }
}
