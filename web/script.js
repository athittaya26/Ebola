/* ==========================================
   GLOBAL VARIABLES
========================================== */

let featureData = [];

/* ==========================================
   TOOLTIP
========================================== */

const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


/* ==========================================
   NUMBER ANIMATION
========================================== */

function animateValue(id, start, end, suffix = "") {

    const duration = 1500;
    const range = end - start;
    const increment = range / 60;

    let current = start;

    const timer = setInterval(() => {

        current += increment;

        if (current >= end) {
            current = end;
            clearInterval(timer);
        }

        const element = document.getElementById(id);

        if (!element) return;

        if (suffix === "%") {

            element.innerHTML =
                current.toFixed(2) + suffix;

        } else {

            element.innerHTML =
                Math.floor(current).toLocaleString();
        }

    }, duration / 60);
}


/* ==========================================
   DATASET OVERVIEW
========================================== */

fetch("dataset_summary.json")
    .then(res => res.json())
    .then(data => {

        animateValue(
            "records",
            0,
            data.records
        );

        animateValue(
            "features",
            0,
            data.features
        );

        animateValue(
            "positive",
            0,
            data.positive
        );

        animateValue(
            "negative",
            0,
            data.negative
        );

    })
    .catch(err => console.error(err));


/* ==========================================
   KPI
========================================== */

fetch("model_metrics.json")
    .then(res => res.json())
    .then(data => {

        animateValue(
            "accuracy",
            0,
            data.accuracy * 100,
            "%"
        );

        animateValue(
            "precision",
            0,
            data.precision * 100,
            "%"
        );

        animateValue(
            "recall",
            0,
            data.recall * 100,
            "%"
        );

        animateValue(
            "f1",
            0,
            data.f1_score * 100,
            "%"
        );

    })
    .catch(err => console.error(err));


/* ==========================================
   FEATURE IMPORTANCE
========================================== */

fetch("feature_importance.json")
    .then(res => res.json())
    .then(data => {

        featureData = data;

        drawFeatureChart("all");

    })
    .catch(err => console.error(err));


/* ==========================================
   FEATURE CHART
========================================== */

function drawFeatureChart(category) {

    d3.select("#importanceChart").html("");

    let data = [...featureData];

    if (category === "demographic") {

        data = data.filter(d =>
            [
                "Age",
                "Gender",
                "Occupation"
            ].includes(d.Feature)
        );
    }

    else if (category === "symptoms") {

        data = data.filter(d =>
            [
                "Body_Temperature",
                "Vomiting",
                "Diarrhea",
                "Bleeding_Symptoms",
                "Dehydration_Level"
            ].includes(d.Feature)
        );
    }

    else if (category === "exposure") {

        data = data.filter(d =>
            [
                "Contact_With_Patient",
                "Visited_Outbreak_Region",
                "Household_Exposure",
                "Days_Since_Exposure"
            ].includes(d.Feature)
        );
    }

    else if (category === "lab") {

        data = data.filter(d =>
            [
                "Platelet_Count",
                "Viral_Load_Score",
                "Heart_Rate",
                "Oxygen_Saturation"
            ].includes(d.Feature)
        );
    }

    data.sort(
        (a, b) => b.Importance - a.Importance
    );

    const margin = {
        top: 30,
        right: 50,
        bottom: 50,
        left: 250
    };

    const width = 1100;
    const height = 650;

    const svg = d3
        .select("#importanceChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleLinear()
        .domain([
            0,
            d3.max(data, d => d.Importance)
        ])
        .range([
            margin.left,
            width - margin.right
        ]);

    const y = d3.scaleBand()
        .domain(
            data.map(d => d.Feature)
        )
        .range([
            margin.top,
            height - margin.bottom
        ])
        .padding(0.25);

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")

        .attr("x", margin.left)

        .attr("y", d => y(d.Feature))

        .attr("height", y.bandwidth())

        .attr("width", 0)

        .attr("rx", 7)

        .attr("fill", "#0f4c81")

        .on("mouseover", function(event, d) {

            d3.select(this)
                .attr("fill", "#2b7de9");

            tooltip
                .style("opacity", 1)
                .html(`
                    <strong>${d.Feature}</strong>
                    <br>
                    Importance:
                    ${d.Importance.toFixed(4)}
                `);

        })

        .on("mousemove", function(event) {

            tooltip
                .style(
                    "left",
                    event.pageX + 15 + "px"
                )
                .style(
                    "top",
                    event.pageY - 20 + "px"
                );

        })

        .on("mouseout", function() {

            d3.select(this)
                .attr("fill", "#0f4c81");

            tooltip
                .style("opacity", 0);

        })

        .transition()
        .duration(1500)
        .attr(
            "width",
            d => x(d.Importance) - margin.left
        );

    svg.append("g")
        .attr(
            "transform",
            `translate(0,${height - margin.bottom})`
        )
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr(
            "transform",
            `translate(${margin.left},0)`
        )
        .call(d3.axisLeft(y));
}


/* ==========================================
   MODEL PREDICTION PERFORMANCE
========================================== */

fetch("confusion_matrix.json")
    .then(res => res.json())
    .then(data => {

        animateValue(
            "tp",
            0,
            data.tp
        );

        animateValue(
            "tn",
            0,
            data.tn
        );

        animateValue(
            "fp",
            0,
            data.fp
        );

        animateValue(
            "fn",
            0,
            data.fn
        );

    })
    .catch(err => console.error(err));

  /* ==========================================
   CHART.JS VISUALIZATION
========================================== */

/* Radar Chart - Model Metrics */

fetch("model_metrics.json")
    .then(res => res.json())
    .then(metrics => {

        const metricsCanvas =
            document.getElementById("metricsChart");

        if (!metricsCanvas) return;

        new Chart(metricsCanvas, {

            type: "radar",

            data: {

                labels: [
                    "Accuracy",
                    "Precision",
                    "Recall",
                    "F1 Score"
                ],

                datasets: [{

                    label: "Model Performance",

                    data: [
                        metrics.accuracy * 100,
                        metrics.precision * 100,
                        metrics.recall * 100,
                        metrics.f1_score * 100
                    ],

                    backgroundColor:
                        "rgba(43,125,233,0.25)",

                    borderColor:
                        "#2b7de9",

                    borderWidth: 3,

                    pointBackgroundColor:
                        "#0f4c81"
                }]
            },

            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "top"
                    }
                }
            }

        });

    });




/* Doughnut Chart - Positive vs Negative */

const casesCanvas =
    document.getElementById("casesChart");

if (casesCanvas) {

    new Chart(casesCanvas, {

        type: "doughnut",

        data: {

            labels: [
                "Positive",
                "Negative"
            ],

            datasets: [{

                data: [
                    5915,
                    4085
                ],

                backgroundColor: [
                    "#ef4444",
                    "#22c55e"
                ]
            }]
        },

        options: {
            responsive: true
        }

    });

}




/* Prediction Result Chart */

fetch("confusion_matrix.json")
    .then(res => res.json())
    .then(data => {

        const predictionCanvas =
            document.getElementById("predictionChart");

        if (!predictionCanvas) return;

        new Chart(predictionCanvas, {

            type: "bar",

            data: {

                labels: [
                    "TP",
                    "TN",
                    "FP",
                    "FN"
                ],

                datasets: [{

                    label: "Prediction Result",

                    data: [
                        data.tp,
                        data.tn,
                        data.fp,
                        data.fn
                    ],

                    backgroundColor: [
                        "#22c55e",
                        "#2563eb",
                        "#f59e0b",
                        "#ef4444"
                    ]

                }]

            },

            options: {
                responsive: true
            }

        });

    });




/* Framework Comparison Chart */

const frameworkCanvas =
    document.getElementById("frameworkChart");

if (frameworkCanvas) {

    new Chart(frameworkCanvas, {

        type: "bar",

        data: {

            labels: [
                "Customization",
                "Interactive",
                "Learning Ease",
                "Flexibility"
            ],

            datasets: [

                {

                    label: "Chart.js",

                    data: [
                        7,
                        8,
                        10,
                        7
                    ],

                    backgroundColor:
                        "#2563eb"

                },

                {

                    label: "D3.js",

                    data: [
                        10,
                        10,
                        5,
                        10
                    ],

                    backgroundColor:
                        "#16a34a"

                }

            ]
        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    position: "top"
                }

            }

        }

    });

}
/* ======================================
   D3 PIE CHART
====================================== */


/* ======================================
   D3 PIE CHART
====================================== */

function drawPieChart() {

    // ล้างกราฟเก่า
    d3.select("#pieChart").html("");

    const data = [
        {
            label: "Positive",
            value: 1228
        },
        {
            label: "Negative",
            value: 772
        }
    ];

    const total = d3.sum(data, d => d.value);

    const width = 600;
    const height = 450;
    const radius = 150;

    // =========================
    // SVG
    // =========================

    const svg = d3.select("#pieChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", "100%")
        .style("height", "auto")
        .append("g")
        .attr(
            "transform",
            `translate(${width / 2},${height / 2})`
        );


    // =========================
    // COLORS
    // =========================

    const color = d3.scaleOrdinal()
        .domain(["Positive", "Negative"])
        .range([
            "#ef4444",
            "#3b82f6"
        ]);


    // =========================
    // PIE
    // =========================

    const pie = d3.pie()
        .sort(null)
        .value(d => d.value);


    // =========================
    // ARC
    // =========================

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);


    const arcHover = d3.arc()
        .innerRadius(0)
        .outerRadius(radius + 15);


    // =========================
    // TOOLTIP
    // =========================

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    // =========================
    // DRAW PIE
    // =========================

    const slices = svg.selectAll(".slice")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("class", "slice")
        .attr("fill", d => color(d.data.label))
        .style("cursor", "pointer")

        // เริ่มจากกราฟว่าง
        .attr("d", d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
            .startAngle(0)
            .endAngle(0)
        )

        // =========================
        // HOVER
        // =========================

        .on("mouseover", function(event, d) {

            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", arcHover);

            const percentage =
                ((d.data.value / total) * 100).toFixed(1);

            tooltip
                .style("opacity", 1)
                .html(`
                    <div style="font-size:16px;font-weight:bold;">
                        ${d.data.label}
                    </div>

                    <div>
                        จำนวน:
                        ${d.data.value.toLocaleString()} คน
                    </div>

                    <div>
                        สัดส่วน:
                        ${percentage}%
                    </div>
                `);

        })

        // =========================
        // MOUSE MOVE
        // =========================

        .on("mousemove", function(event) {

            tooltip
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 20) + "px");

        })

        // =========================
        // MOUSE OUT
        // =========================

        .on("mouseout", function() {

            d3.select(this)
                .transition()
                .duration(200)
                .attr("d", arc);

            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0);

        });


    // =========================
    // ANIMATION
    // =========================

    slices
        .transition()
        .duration(1200)
        .attrTween("d", function(d) {

            const interpolate = d3.interpolate(
                {
                    startAngle: 0,
                    endAngle: 0
                },
                d
            );

            return function(t) {
                return arc(interpolate(t));
            };

        });


    // =========================
    // TEXT LABEL
    // =========================

    svg.selectAll(".pie-label")
        .data(pie(data))
        .enter()
        .append("text")
        .attr("class", "pie-label")
        .attr(
            "transform",
            d => `translate(${arc.centroid(d)})`
        )
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .text(d => {

            const percentage =
                ((d.data.value / total) * 100).toFixed(1);

            return percentage + "%";

        });


    // =========================
    // LEGEND
    // =========================

    const legend = d3.select("#pieChart")
        .append("div")
        .attr("class", "pie-legend");

    data.forEach(d => {

        const item = legend
            .append("div")
            .attr("class", "legend-item");

        item.append("span")
            .attr("class", "legend-color")
            .style("background", color(d.label));

        item.append("span")
            .text(
                `${d.label}: ${d.value.toLocaleString()} คน`
            );

    });

}


// เรียกใช้
drawPieChart();
