<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Device Information Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Supabase Client Library -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Style for better table readability on smaller screens */
        td, th {
            word-break: break-all;
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <header class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-800">Device Information Dashboard</h1>
                <p class="text-gray-500">Displaying all records from the device_info table.</p>
            </div>
            <button id="refreshBtn" class="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all">
                Refresh Data
            </button>
        </header>

        <!-- Data Table -->
        <div class="bg-white shadow-lg rounded-xl overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser Fingerprint</th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Details</th>
                    </tr>
                </thead>
                <tbody id="data-table-body" class="bg-white divide-y divide-gray-200">
                    <!-- Data will be inserted here by JavaScript -->
                    <tr id="loading-row">
                        <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                            <div class="flex justify-center items-center space-x-2">
                                <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                <span>Loading data from Supabase...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    
    <!-- Modal for displaying full JSON data -->
    <div id="details-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
            <div class="flex justify-between items-center mb-4">
                 <h3 class="text-lg leading-6 font-medium text-gray-900">Full Record Details</h3>
                 <button id="close-modal" class="text-gray-400 hover:text-gray-600">
                    <span class="sr-only">Close</span>
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
            </div>
          <pre id="modal-content" class="text-left text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
            <!-- JSON content goes here -->
          </pre>
        </div>
      </div>
    </div>


    <script>
        // --- IMPORTANT: CONFIGURE YOUR SUPABASE DETAILS HERE ---
        const SUPABASE_URL = 'https://gsmnzfbcxmhywznchoxq.supabase.co'; // Your Supabase Project URL
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbW56ZmJjeG1oeXd6bmNob3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NzI4NDgsImV4cCI6MjA3MjQ0ODg0OH0.0seF_SbMoSP5RkEZRGLcfDM07yE2T0EdyGgpgXFcs6c'; // Your Supabase Anon Public Key

        // --- DO NOT EDIT BELOW THIS LINE ---

        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const tableBody = document.getElementById('data-table-body');
        const loadingRow = document.getElementById('loading-row');
        const refreshBtn = document.getElementById('refreshBtn');
        
        const modal = document.getElementById('details-modal');
        const closeModalBtn = document.getElementById('close-modal');
        const modalContent = document.getElementById('modal-content');

        // Function to fetch and display data
        async function fetchData() {
            // Show loading state
            tableBody.innerHTML = '';
            tableBody.appendChild(loadingRow);
            loadingRow.style.display = 'table-row';

            try {
                const { data, error } = await supabase
                    .from('device_info')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }
                
                // Clear loading state
                loadingRow.style.display = 'none';

                if(data.length === 0) {
                     tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4">No data found. Visit the tracker page to collect information.</td></tr>`;
                     return;
                }

                data.forEach(record => {
                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-gray-50";

                    tr.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${record.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(record.created_at).toLocaleString()}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.ip_address}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.device_type}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.operating_system}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.screen_resolution}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">${record.browser_fingerprint}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button class="text-indigo-600 hover:text-indigo-900 view-details-btn">View JSON</button>
                        </td>
                    `;
                    
                    const viewButton = tr.querySelector('.view-details-btn');
                    viewButton.addEventListener('click', () => {
                        modalContent.textContent = JSON.stringify(record, null, 2); // Pretty print JSON
                        modal.classList.remove('hidden');
                    });
                    
                    tableBody.appendChild(tr);
                });


            } catch (error) {
                loadingRow.style.display = 'none';
                tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-red-500">Error loading data: ${error.message}</td></tr>`;
                console.error('Error fetching data:', error);
            }
        }
        
        // Modal close functionality
        closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
        modal.addEventListener('click', (e) => {
             if (e.target === modal) {
                modal.classList.add('hidden');
             }
        });

        // Event listener for the refresh button
        refreshBtn.addEventListener('click', fetchData);

        // Fetch data on initial page load
        fetchData();
    </script>
</body>
</html>
