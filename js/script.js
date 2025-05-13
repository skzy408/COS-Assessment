const apiUrl = "http://18.143.79.95/api/priceData/technical-test";
let currentData = [];
let previousData = [];
let currentPage = 1;
const rowsPerPage = 10;
let searchTerm = ""; // Store the search term globally


// Banner Hover Movement
var scene = document.getElementById("scene");
var parallaxInstance = new Parallax(scene, {
    relativeInput: true
});

// Round to 4 decimals
function roundTo4(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return value;

    const decimalPart = value.toString().split(".")[1];
    if (!decimalPart || decimalPart.length <= 4) {
        return value;
    }

    return num.toFixed(4);
}

// Create table rows dynamically
function createRows(data) {
    const tbody = document.querySelector("#price-table-body");
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement("tr");

        const prev = previousData.find(d => d.Symbol === item.Symbol) || {};

        const bidColor = getColor(item.Bid, prev.Bid);
        const askColor = getColor(item.Ask, prev.Ask);
        const changeColor = getColor(item.DailyChange, prev.DailyChange);

        row.innerHTML = `
            <td class="fw-bold">${item.Symbol}</td>
            <td style="color: ${bidColor}; transition: color 0.3s;">${roundTo4(item.Bid)}</td>
            <td style="color: ${askColor}; transition: color 0.3s;">${roundTo4(item.Ask)}</td>
            <td style="color: ${changeColor}; transition: color 0.3s;">${roundTo4(item.DailyChange)}</td>
        `;

        tbody.appendChild(row);
    });
}


// Determine color based on price change
function getColor(current, previous) {
    if (previous === undefined || current === previous) return "black";
    return current < previous ? "green" : "#ff2261";
}

// Pagination logic
function displayPage(data, page) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);
    createRows(paginatedData);
}

function changePage(page) {
    const totalPages = Math.ceil(currentData.length / rowsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    displayPage(currentData, currentPage);
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = '';

    const createButton = (label, page, isActive = false, isDisabled = false) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.className = `btn btn-sm me-1 ${isActive ? 'btn-danger' : 'btn-outline-secondary'}`;
        btn.disabled = isDisabled;
        if (!isDisabled && !isNaN(page)) {
            btn.onclick = () => changePage(page);
        }
        return btn;
    };

    paginationContainer.appendChild(createButton("«", currentPage - 1, false, currentPage === 1));

    const visiblePages = [];
    for (let i = 1; i <= Math.min(4, totalPages); i++) visiblePages.push(i);

    if (totalPages > 5) {
        visiblePages.push("...");
        visiblePages.push(totalPages);
    }

    visiblePages.forEach(p => {
        if (p === "...") {
            const dots = document.createElement("span");
            dots.textContent = "...";
            dots.className = "mx-1";
            paginationContainer.appendChild(dots);
        } else {
            paginationContainer.appendChild(createButton(p, p, p === currentPage));
        }
    });

    paginationContainer.appendChild(createButton("»", currentPage + 1, false, currentPage === totalPages));
}

// Fetch API data
function fetchPriceData() {
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            // Sort alphabetically to ensure stable row order
            data.sort((a, b) => a.Symbol.localeCompare(b.Symbol));

            // Copy currentData into previousData before updating
            previousData = currentData.map(item => ({ ...item }));

            // Update currentData with new data
            currentData = data;

            // Apply search filter if there's a search term
            if (searchTerm) {
                currentData = currentData.filter(item => item.Symbol.toLowerCase().includes(searchTerm.toLowerCase()));
            }

            // Display updated page
            displayPage(currentData, currentPage);
            renderPagination(Math.ceil(currentData.length / rowsPerPage));
        })
        .catch(err => console.error("Error fetching price data:", err));
}

// Search functionality
document.getElementById('search').addEventListener('input', function () {
    searchTerm = this.value.toLowerCase(); // Store the search term globally

    // Filter data based on the search term
    const filteredData = currentData.filter(item =>
        item.Symbol.toLowerCase().includes(searchTerm) // Filter based on Symbol (case insensitive)
    );

    // Display the filtered data
    displayPage(filteredData, currentPage);
    renderPagination(Math.ceil(filteredData.length / rowsPerPage)); // Adjust pagination for filtered data
});


fetchPriceData();
setInterval(fetchPriceData, 1000);
