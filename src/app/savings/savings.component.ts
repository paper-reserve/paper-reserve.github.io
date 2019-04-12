import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { DataService } from "../services/data.service";
import * as d3 from "d3";

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
  csvData;
  svg;
  constructor(private data: DataService) {}

  ngOnInit() {
    this.csvData = [
      {
        category: "Savings",
        value: "17600"
      },
      {
        category: "Food",
        value: "5200"
      },
      {
        category: "Groceries",
        value: "5600"
      },
      {
        category: "Travel",
        value: "6300"
      },
      {
        category: "Misc.",
        value: "3000"
      }
    ];
    this.svg = d3
      .select("#my_dataviz")
      .append("svg")
      .attr("width", 450)
      .attr("height", 450);
  }
  ngAfterContentInit() {
    d3.select("p").style("color", "red");
    let width = 450;
    let height = 450;

    let color = d3
      .scaleOrdinal()
      .domain(["Savings", "Groceries", "Travel", "Misc.", "Food"])
      .range(d3.schemeSet1);

    // Size scale for categories
    let size = d3
      .scaleLinear()
      .domain([0, 20000])
      .range([7, 55]); // circle will be between 7 and 55 px wide

    // create a tooltip
    let Tooltip = d3
      .select("#my_dataviz")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px");

    // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function(d) {
      Tooltip.style("opacity", 1);
    };
    let mousemove = function(d) {
      Tooltip.html("<u>" + d.category + "</u>" + "<br>" + d.value + " %")
        .style("left", d3.mouse(this)[0] + 20 + "px")
        .style("top", d3.mouse(this)[1] + "px");
    };
    let mouseleave = function(d) {
      Tooltip.style("opacity", 0);
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
        "center",
        d3
          .forceCenter()
          .x(width / 2)
          .y(height / 2)
      ) // Attraction to the center of the svg area
      .force("charge", d3.forceManyBody().strength(0.1)) // Nodes are attracted one each other of value is > 0
      .force(
        "collide",
        d3
          .forceCollide()
          .strength(0.2)
          .radius(function(d) {
            let d1: any;
            d1 = d;
            return size(d1.value) + 3;
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
