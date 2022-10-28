import myData from "./files/ufo.json";

function _svg(
  d3,
  width,
  height,
  styles,
  scaleTime,
  margin,
  scaleDuration,
  list,
  getColor,
  quadtree,
  removeGuidelines,
  getDescription,
  addGuideline,
  createTooltip
) {
  const chart = d3
    .create("svg")
    .attr("class", "star-background")
    .attr("width", width)
    .attr("height", height);

  chart.append(() => styles);

  const axisTime = d3
    .axisBottom()
    .scale(scaleTime)
    .ticks(width > 500 ? 10 : 5)
    .tickFormat(d3.timeFormat("%Y"))
    .tickSize(5)
    .tickPadding(8);

  chart
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, ${height - margin})`)
    .call(axisTime);

  chart
    .append("text")
    .attr("x", width / 2 - 100)
    .attr("y", height - 10)
    .text("Year when first visible")
    .style("opacity", 0.8)
    .style("font-size", "12px");

  const axisDuration = d3
    .axisLeft()
    .scale(scaleDuration)
    .ticks(10)
    .tickSize(5)
    .tickPadding(8);

  chart
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + margin + ", 0)")
    .call(axisDuration);

  chart
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("transform", `translate(20,${height / 2 + 100}) rotate(270)`)
    .text("Duration first time (Seconds)")
    .style("opacity", 0.8)
    .style("font-size", "12px");

  chart.append("g").attr("class", "guideline-group");

  const entry = chart.selectAll(null).data(list).join("g");

  entry
    .append("circle")
    .attr("cx", (d) => scaleTime(d.dts[0]))
    .attr("cy", (d) => scaleDuration(d.durationFirstYear))
    .attr("r", 2)
    .style("fill", (d) => getColor(d))
    .style("stroke", "none");

  entry
    .selectAll(null)
    .data((d) => d.dts)
    .join("circle")
    .attr("cx", function (d) {
      return scaleTime(d3.select(this.parentNode).datum().dts[0]);
    })
    .attr("cy", function (d) {
      return scaleDuration(
        d3.select(this.parentNode).datum().durationFirstYear
      );
    })
    .attr("r", (d, i) => 4 + i * 4)
    .style("stroke", function (d) {
      return getColor(d3.select(this.parentNode).datum());
    })
    .style("stroke-width", 0.5)
    .style("fill", "none");

  const tooltip = chart.append("g");

  tooltip.on("click", (event) => {
    event.stopPropagation();
  });

  let lastPoint = null;
  chart.on("click", function (event) {
    const point = quadtree.find(...d3.mouse(this));

    if (lastPoint !== point) {
      if (lastPoint)
        entry
          .filter((e) => e === lastPoint)
          .select("circle")
          .attr("r", 2);
      removeGuidelines(chart);
      entry
        .filter((e) => e === point)
        .select("circle")
        .attr("r", 6);
      tooltip
        .select("#state")
        .text(`${point.state} - ${point.country}`)
        .style("font-size", "15px");
      tooltip.select("#description").html(getDescription(point));
      addGuideline("horizontal", point);
      addGuideline("vertical", point);
    }
    lastPoint = point;
  });

  createTooltip(tooltip);

  return chart.node();
}

function _addGuideline(margin, scaleTime, scaleDuration, height, d3) {
  return function addGuideline(orientation, data, chart) {
    const x1 = orientation === "horizontal" ? margin : scaleTime(data.dts[0]);
    const y1 =
      orientation === "horizontal"
        ? scaleDuration(data.durationFirstYear)
        : height - margin;
    const x2 = scaleTime(data.dts[0]);
    const y2 = scaleDuration(data.durationFirstYear);
    d3.select(".guideline-group")
      .append("line")
      .attr("class", "guideline")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .style("stroke-dasharray", "2, 2")
      .style("stroke", "rgba(255, 255, 255, 0.3)");
  };
}

function _removeGuidelines(d3) {
  return function removeGuidelines(chart) {
    d3.select(".guideline-group").selectAll(".guideline").remove();
  };
}

function _getDescription() {
  return function getDescription(d) {
    let desc = "";
    const years = d.dts.map((date) => date.getFullYear());
    desc += `Visible: <strong>${years.length}`;
    if (years.length > 1) {
      desc += ` times.</strong>`;
    } else {
      desc += `time.</strong>`;
    }
    if (years.length > 1) {
      desc += `</br>Years: <strong>${years.join(", ")}.</strong></br></br>`;
    } else {
      desc += `</br>Year: <strong>${years[0]}.</strong></br></br>`;
    }
    let text = d.text;

    /****************************/
    // if you want to add a limit to description length, uncomment the below lines
    /****************************/
    // let limit = 300;
    // if (text.length > limit) text = text.substring(0, limit) + " ...";
    desc += text;

    return desc;
  };
}

function _createTooltip(margin) {
  return function createTooltip(tooltip) {
    const tooltip_height = 150;
    const tooltip_width = 400;

    tooltip
      .append("text")
      .attr("id", "state")
      .attr("x", margin + 15)
      .attr("y", 30)
      .style("fill", "white")
      .style("font-size", "13px")
      .style("font-weight", "bold")
      .text("Click on each point for more info");

    tooltip
      .append("foreignObject")
      .attr("x", margin + 15)
      .attr("y", 50)
      .attr("width", tooltip_width - 10)
      .attr("height", tooltip_height - 10)
      .append("xhtml:div")
      .attr("xmlns", "http://www.w3.org/1999/xhtml")
      .attr("id", "description")
      .style("font-size", "12px")
      .style("color", "white");
  };
}

function _getColor(stateColors) {
  return function getColor(d) {
    console.log(d.state);
    if (stateColors[d.state]) {
      return stateColors[d.state];
    }
    return stateColors["Other"];
  };
}

function _scaleDuration(d3, scaleStats, height, margin) {
  return d3
    .scaleLinear()
    .domain([scaleStats.minDuration, scaleStats.maxDuration])
    .range([height - margin, margin]);
}

function _scaleTime(d3, scaleStats, margin, width) {
  return d3
    .scaleTime()
    .domain([scaleStats.minYearDate, scaleStats.maxYearDate])
    .range([margin, width - margin]);
}

function _quadtree(d3, scaleTime, scaleDuration, list) {
  return d3
    .quadtree()
    .x((d) => scaleTime(d.dts[0]))
    .y((d) => scaleDuration(d.durationFirstYear))
    .addAll(list);
}

function _countryColors() {
  return {
    NY: "rgba(61, 190, 255, 1)",
    TX: "rgba(255, 156, 181, 1)",
    WX: "rgba(255, 156, 181, 1)",
    FL: "rgba(130, 240, 46, 1)",
    CA: "rgba(255, 118, 77, 1)",
    AZ: "rgba(240, 198, 46, 1)",
    MD: "rgba(46, 198, 240, 1)",
    Other: "rgba(168, 168, 168, 1)",
  };
}

function _countryStats(list) {
  const group = {};
  list.forEach((elem) => {
    const country = elem.country;
    if (group[country]) {
      group[country]++;
    } else {
      group[country] = 1;
    }
  });

  return group;
}

function _height() {
  return 800;
}

function _margin() {
  return 60;
}

function _scaleStats(list) {
  let durationsFirstYear = list.map((elem) => elem.durationFirstYear);
  let minDuration = Math.min(...durationsFirstYear);
  let maxDuration = Math.max(...durationsFirstYear);

  let datesFirstYear = list.map((elem) => elem.dts[0]);

  let minYearDate = new Date(Math.min(...datesFirstYear));
  minYearDate.setFullYear(minYearDate.getUTCFullYear() - 1);
  let maxYearDate = new Date(Math.max(...datesFirstYear));

  return {
    minDuration,
    maxDuration,
    minYearDate,
    maxYearDate,
  };
}

function _list(parsedData) {
  return parsedData.map((elem) => {
    elem.dts = elem.dts.map((date) => new Date(date));
    if (elem.duration) {
      elem.durationFirstYear = elem.duration;
    } else {
      elem.durationFirstYear = 20;
    }
    console.log("list: ", elem);
    return elem;
  });
}

function _parsedData() {
  return myData;
}

function _d3(require) {
  return require("https://d3js.org/d3.v5.min.js");
}

function _symbolUrl(FileAttachment) {
  return FileAttachment("symbol@1.png").url();
}

function _backgroundUrl(FileAttachment) {
  return FileAttachment("background@1.jpeg").url();
}

function _styles(html, backgroundUrl) {
  return html`<style>
    @import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;600&display=swap");

    .star-background {
      background: url("${backgroundUrl}");
      background-repeat: no-repeat;
      background-size: cover;
    }

    .axis line,
    .axis path {
      stroke: white;
      stroke-width: 1px;
    }

    text {
      fill: white;
      font-size: 1.2em;
      font-family: "Open Sans", sans-serif;
    }

    .profile {
      width: 50px;
      border-radius: 50%;
      float: left;
      padding: 0 10px 10px 0;
    }
    div {
      font-family: "Open Sans", sans-serif;
    }
  </style>`;
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() {
    return this.url;
  }
  const fileAttachments = new Map([
    [
      "background@1.jpeg",
      {
        url: "/files/6a3b675caea2a19f42a7a02c50b964c5a54d5f3472bd5482a9692cba84cb3e3a793314d1d8c50bf1a347642e756d6a8f33f313d722a25091beeb901bac5ec8bf.jpeg",
        mimeType: "imduration/jpeg",
        toString,
      },
    ],
    [
      "symbol@1.png",
      {
        url: "/files/79800714cc7b84d58bbdba4b0f83dbe5f2e6dd1baf60afc47604296a3d14b36931516071528c03eff1f8caa773f33a369583f76d80a1b8ad09a2a7403c2247cd.png",
        mimeType: "imduration/png",
        toString,
      },
    ],
  ]);
  main.builtin(
    "FileAttachment",
    runtime.fileAttachments((state) => fileAttachments.get(state))
  );

  main
    .variable(observer("svg"))
    .define(
      "svg",
      [
        "d3",
        "width",
        "height",
        "styles",
        "scaleTime",
        "margin",
        "scaleDuration",
        "list",
        "getColor",
        "quadtree",
        "removeGuidelines",
        "getDescription",
        "addGuideline",
        "createTooltip",
      ],
      _svg
    );
  main
    .variable(observer("addGuideline"))
    .define(
      "addGuideline",
      ["margin", "scaleTime", "scaleDuration", "height", "d3"],
      _addGuideline
    );
  main
    .variable(observer("removeGuidelines"))
    .define("removeGuidelines", ["d3"], _removeGuidelines);
  main
    .variable(observer("getDescription"))
    .define("getDescription", _getDescription);
  main
    .variable(observer("createTooltip"))
    .define("createTooltip", ["margin"], _createTooltip);
  main
    .variable(observer("getColor"))
    .define("getColor", ["stateColors"], _getColor);
  main
    .variable(observer("scaleDuration"))
    .define(
      "scaleDuration",
      ["d3", "scaleStats", "height", "margin"],
      _scaleDuration
    );
  main
    .variable(observer("scaleTime"))
    .define("scaleTime", ["d3", "scaleStats", "margin", "width"], _scaleTime);
  main
    .variable(observer("quadtree"))
    .define(
      "quadtree",
      ["d3", "scaleTime", "scaleDuration", "list"],
      _quadtree
    );
  main.variable(observer("stateColors")).define("stateColors", _countryColors);
  main
    .variable(observer("countryStats"))
    .define("countryStats", ["list"], _countryStats);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("margin")).define("margin", _margin);
  main
    .variable(observer("scaleStats"))
    .define("scaleStats", ["list"], _scaleStats);
  main.variable(observer("list")).define("list", ["parsedData"], _list);
  main.variable(observer("parsedData")).define("parsedData", _parsedData);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main
    .variable(observer("symbolUrl"))
    .define("symbolUrl", ["FileAttachment"], _symbolUrl);
  main
    .variable(observer("backgroundUrl"))
    .define("backgroundUrl", ["FileAttachment"], _backgroundUrl);
  main
    .variable(observer("styles"))
    .define("styles", ["html", "backgroundUrl"], _styles);
  return main;
}
