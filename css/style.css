// Initialize D3.js charts
document.addEventListener("DOMContentLoaded", () => {
    renderEconomicsChart();
    setupDarkMode();
});

// 1. Economics Line Chart (D3.js)
function renderEconomicsChart() {
    const data = [
        { year: 2018, value: 30 },
        { year: 2019, value: 45 },
        { year: 2020, value: 25 },
        { year: 2021, value: 60 },
        { year: 2022, value: 50 }
    ];

    const svg = d3.select("#economics-chart")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "300");

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const x = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([height, 0]);

    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add bars
    chartGroup.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "#3498db");

    // Add axes
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    chartGroup.append("g")
        .call(d3.axisLeft(y));
}

// 2. Dark Mode Toggle
function setupDarkMode() {
    const toggle = document.getElementById("dark-mode-toggle");
    toggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });
}
