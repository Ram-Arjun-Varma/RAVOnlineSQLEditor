document.addEventListener("DOMContentLoaded", async () => {
    // Load SQL.js and initialize the database
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    // Initialize a new database
    const db = new SQL.Database();

    //Button Initialization
    const outputTable = document.getElementById("output-table");

    // Initialize CodeMirror for SQL editing
    const editor = CodeMirror.fromTextArea(document.getElementById("sql-editor"), {
        mode: "text/x-sql", // Set mode to SQL for syntax highlighting
        theme: "default", // Use a theme (you can choose any other CodeMirror theme)
        lineNumbers: true, // Show line numbers
        tabSize: 2, // Set tab size
        indentWithTabs: true, // Indent code with tabs
        autofocus: true // Focus editor on load
    });

    // Function to render table data into HTML
    function renderTable(columns, values, queryIndex) {
        let html = `<h3 class='text-lg font-bold mb-2'>Result for Query ${queryIndex}</h3>`;
        html += "<table class='table-auto w-full text-left border-collapse'>";
        html += "<thead><tr>";
        columns.forEach(column => {
            html += `<th class='border-b-2 p-2'>${column}</th>`;
        });
        html += "</tr></thead><tbody>";

        values.forEach(row => {
            html += "<tr>";
            row.forEach(value => {
                html += `<td class='border-b p-2'>${value}</td>`;
            });
            html += "</tr>";
        });

        html += "</tbody></table>";
        return html;
    }

    // Execute SQL queries and handle multiple results
    function executeSQLQueries(queries) {
        queries.forEach((query, index) => {
            try {
                const result = db.exec(query); // Execute SQL query
                if (result.length > 0) {
                    const columns = result[0].columns;
                    const values = result[0].values;
                    outputTable.innerHTML += renderTable(columns, values, index + 1); // Append each result
                } else {
                    outputTable.innerHTML += `<p class='text-green-500'>Query ${index + 1}: Executed successfully (No result)</p>`;
                }
            } catch (error) {
                outputTable.innerHTML += `<p class="text-red-500">Error in Query ${index + 1}: ${error.message}</p>`;
            }
        });
    }

    const runButton = document.getElementById("run-sql");

    // Execute SQL on button click
    runButton.addEventListener("click", () => {
        outputTable.innerHTML = ''; // Clear previous output
        const queryText = editor.getValue().trim(); // Get SQL from CodeMirror
        if (queryText) {
            const queries = queryText.split(';').filter(q => q.trim() !== ''); // Split queries by ';'
            executeSQLQueries(queries); // Execute each query
        }
    });
});