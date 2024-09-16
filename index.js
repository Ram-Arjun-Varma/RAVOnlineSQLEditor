document.addEventListener("DOMContentLoaded", async () => {
    // Load SQL.js and initialize the database
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    // Initialize a new database
    const db = new SQL.Database();

    // Button Initialization
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

    // Download SQL as text file
    const downloadButton = document.getElementById("download-sql");

    downloadButton.addEventListener("click", () => {
        const sqlText = editor.getValue().trim();

        if (sqlText) {
            // Prompt the user for a file name
            let fileName = prompt("Please enter a file name for the SQL download:", "query.sql");

            // Check if user provided a valid name
            if (fileName) {
                // Add .sql extension if not provided
                if (!fileName.endsWith(".sql")) {
                    fileName += ".sql";
                }

                const blob = new Blob([sqlText], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName; // Use the user-provided name
                a.target = "_blank"; // Open download in a new tab
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url); // Clean up the URL object after download
            } else {
                alert("Download canceled. Please provide a valid file name.");
            }
        } else {
            alert("No SQL query to download!");
        }
    });

    // Import SQL from a file and populate the editor
    const importButton = document.getElementById("import-sql");
    const fileInput = document.getElementById("sql-file-input");

    importButton.addEventListener("click", () => {
        fileInput.click(); // Trigger file selection dialog
    });

    fileInput.addEventListener("change", (event) => {
        try {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const sqlText = e.target.result;
                    editor.setValue(sqlText); // Set the content in the editor
                    outputTable.innerHTML = ''; // Clear previous output
                    const queries = sqlText.split(';').filter(q => q.trim() !== ''); // Split queries by ';'
                    executeSQLQueries(queries); // Execute each query after importing
                };
                reader.onerror = function (error) {
                    console.error('Error reading file:', error);
                };
                reader.readAsText(file); // Read the content of the file
            }
        } catch (error) {
            console.error('Error handling file:', error);
            alert('Failed to import the SQL file. Please try again.');
        }
    });
});