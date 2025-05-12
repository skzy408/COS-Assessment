const apiUrl = "http://18.143.79.95/api/priceData/technical-test";
let currentData = [];
let currentPage = 1;
const rowsPerPage = 10;
const maxVisiblePages = 5;

// Create table rows dynamically based on paginated data
function createRows(data) {
    const tbody = document.querySelector("#price-table-body");
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.Symbol}</td>
            <td>${item.Bid}</td>
            <td>${item.Ask}</td>
            <td>${(item.Ask - item.Bid).toFixed(5)}</td>
        `;

        tbody.appendChild(row);
    });
}

// Display a specific page of data
function displayPage(data, page) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);
    createRows(paginatedData);
}

// Change the current page and update display
function changePage(page) {
    const totalPages = Math.ceil(currentData.length / rowsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    displayPage(currentData, currentPage);
    renderPagination(totalPages);
}

// Render pagination controls
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

    // « Previous
    paginationContainer.appendChild(createButton("«", currentPage - 1, false, currentPage === 1));

    // Always show first 3 pages
    const visible = [];
    for (let i = 1; i <= Math.min(4, totalPages); i++) visible.push(i);

    // Add last page if needed
    if (totalPages > 4) {
        if (totalPages > 5) visible.push("...");

        visible.push(totalPages);
    }

    visible.forEach(p => {
        if (p === "...") {
            const dots = document.createElement("span");
            dots.textContent = "...";
            dots.className = "mx-1";
            paginationContainer.appendChild(dots);
        } else {
            paginationContainer.appendChild(createButton(p, p, p === currentPage));
        }
    });

    // » Next
    paginationContainer.appendChild(createButton("»", currentPage + 1, false, currentPage === totalPages));
}


// Fetch and update price data
function fetchPriceData() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Sort rows by symbol for consistency
            data.sort((a, b) => a.Symbol.localeCompare(b.Symbol));
            currentData = data;

            displayPage(currentData, currentPage);
            renderPagination(Math.ceil(currentData.length / rowsPerPage));
        })
        .catch(error => {
            console.error("Error fetching price data:", error);
        });
}

// Initial fetch and periodic update every 1 second
fetchPriceData();
setInterval(fetchPriceData, 1000);
