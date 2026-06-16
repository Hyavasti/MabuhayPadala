document.addEventListener("DOMContentLoaded", () => {
    const metricTotalBookings = document.getElementById("metricTotalBookings");
    const metricLipatBahay = document.getElementById("metricLipatBahay");
    const metricStandardParcel = document.getElementById("metricStandardParcel");
    const metricHeavyCargo = document.getElementById("metricHeavyCargo");
    
    const activeShipmentsProgressContainer = document.getElementById("activeShipmentsProgressContainer");
    const bookingsTableBody = document.getElementById("bookingsTableBody");
    const welcomeSummaryLabel = document.getElementById("welcomeSummaryLabel");
    const quickTrackForm = document.getElementById("quickTrackForm");

    // Fetch data from localStorage or fallback to an empty array
    const shipments = JSON.parse(localStorage.getItem("maupayShipments")) || [];

    // Helper Utility: Forces raw text fragments cleanly into standardized Title Case
    function formatToTitleCase(str) {
        if (!str) return "Authorized Receiver";
        return str.toLowerCase().split(' ').map(word => {
            // Keep specific organizational acronyms capitalized if found
            if (["ncr", "ph"].includes(word)) return word.toUpperCase();
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }

    // Helper Utility: Selects the most appropriate professional Font Awesome icon based on booking category
    function getServiceIcon(serviceType) {
        const type = (serviceType || "").toLowerCase();
        if (type.includes("lipat") || type.includes("bahay") || type.includes("moving")) {
            return "fas fa-truck-ramp-box"; // Best for Home Moving / Lipat Bahay
        } else if (type.includes("heavy") || type.includes("cargo") || type.includes("commercial")) {
            return "fas fa-dolly";           // Best for Industrial Heavy Cargo
        } else {
            return "fas fa-box-open";       // Best for Standard Mail & Small Parcels
        }
    }

    // Normalizes mixed destination parameters cleanly into a premium formal "Name — Location" layout
    function parseDestinationString(rawDestination) {
        if (!rawDestination) return "Authorized Receiver — Tacloban City";
        
        // Strip out the sloppy legacy fallback string text cleanly if found
        let cleanText = rawDestination.replace(/\s*-\s*Main Delivery Zone/gi, "");
        cleanText = cleanText.replace(/\s*—\s*Main Delivery Zone/gi, "");
        
        let namePart = "Authorized Receiver";
        let locationPart = "";

        // Detect structural delimiters
        if (cleanText.includes(" — ")) {
            const parts = cleanText.split(" — ");
            namePart = parts[0].trim();
            locationPart = parts[1].trim();
        } else if (cleanText.includes(" - ")) {
            const parts = cleanText.split(" - ");
            namePart = parts[0].trim();
            locationPart = parts[1].trim();
        } else {
            // Implicit fallback detection for pure address records
            const lowerText = cleanText.toLowerCase();
            if (lowerText.includes("tacloban") || lowerText.includes("manila") || lowerText.includes("pasay") || lowerText.includes("piñas") || lowerText.includes("san juan") || lowerText.includes("apayao")) {
                locationPart = cleanText;
            } else {
                namePart = cleanText;
                locationPart = "Main Terminal";
            }
        }

        // Apply title casing properties cleanly to strings
        const formattedName = formatToTitleCase(namePart);
        const formattedLocation = formatToTitleCase(locationPart);

        return locationPart ? `${formattedName} — ${formattedLocation}` : formattedName;
    }

    // Function to calculate and update dashboard metrics counters
    function calculateMetrics() {
        const total = shipments.length;

        // FLEXIBLE MATCHING: Converts to lowercase and checks keywords to bypass spelling/mismatches
        const lipatBahayCount = shipments.filter(s => {
            const type = (s.serviceType || "").toLowerCase();
            return type.includes("lipat") || type.includes("bahay");
        }).length;

        const standardCount = shipments.filter(s => {
            const type = (s.serviceType || "").toLowerCase();
            return type.includes("standard") || type.includes("parcel");
        }).length;

        const cargoCount = shipments.filter(s => {
            const type = (s.serviceType || "").toLowerCase();
            return type.includes("heavy") || type.includes("cargo") || type.includes("commercial");
        }).length;

        // Counter UI Assignment safely checking if elements exist first
        if (metricTotalBookings) metricTotalBookings.textContent = total;
        if (metricLipatBahay) metricLipatBahay.textContent = lipatBahayCount;
        if (metricStandardParcel) metricStandardParcel.textContent = standardCount;
        if (metricHeavyCargo) metricHeavyCargo.textContent = cargoCount;

        // Dynamic Sub-Header string change
        const activeCount = shipments.filter(s => s.status !== "Delivered").length;
        if (welcomeSummaryLabel) {
            welcomeSummaryLabel.textContent = `You have ${activeCount} active operational shipments recorded.`;
        }
    }

    // Function to build and show the active transit progress bar components
    function renderActiveProgressCards() {
        if (!activeShipmentsProgressContainer) return;
        
        activeShipmentsProgressContainer.innerHTML = ""; 

        // Filter out items that are already closed or delivered
        const activeShipments = shipments.filter(s => s.status !== "Delivered");

        if (activeShipments.length === 0) {
            activeShipmentsProgressContainer.innerHTML = `
                <div class="no-data-placeholder" style="padding: 32px; text-align: center; color: #94a3b8; background: #fff; border: 2px dashed #e2e8f0; border-radius: 12px;">
                    <i class="fas fa-folder-open" style="font-size: 28px; margin-bottom: 8px; color: #cbd5e1;"></i>
                    <p style="margin: 0; font-size: 0.9rem;">No active transit routes discovered. Create a new booking to populate real-time milestones.</p>
                </div>`;
            return;
        }

        // Arranged from latest on top to oldest
        const sortedActiveShipments = [...activeShipments].reverse();

        // Generate progress bars dynamically based on transit states
        sortedActiveShipments.forEach(shipment => {
            let progressPercentage = 35; 
            let statusClass = "status-transit";
            
            if (shipment.status === "Out for Delivery") {
                progressPercentage = 85;
                statusClass = "status-delivery";
            } else if (shipment.status === "Pending Dispatch") {
                progressPercentage = 15;
                statusClass = "status-pending";
            }

            const cleanDestination = parseDestinationString(shipment.destination);
            
            // Dynamic Icon assignment based on category matching
            const dynamicIconClass = getServiceIcon(shipment.serviceType);

            // 🏛️ PREMIUM GRID ALIGNMENT STRUCTURAL INJECTION
            const cardHtml = `
                <div class="shipment-progress-card">
                    <div class="shipment-info-col">
                        <div class="meta-box-avatar">
                            <i class="${dynamicIconClass}"></i>
                        </div>
                        <div class="meta-text-details">
                            <h4>${shipment.trackingId}</h4>
                            <p>To: ${cleanDestination}</p>
                        </div>
                    </div>
                    
                    <div class="shipment-progress-col">
                        <div class="progress-bar-container">
                            <div class="progress-fill-line" style="width: ${progressPercentage}%;"></div>
                        </div>
                        <span class="progress-pct-lbl">${progressPercentage}%</span>
                    </div>
                    
                    <div class="shipment-status-col">
                        <span class="badge ${statusClass}">${shipment.status}</span>
                    </div>
                </div>
            `;
            activeShipmentsProgressContainer.insertAdjacentHTML("beforeend", cardHtml);
        });
    }

    // Function to render the history ledger data table rows
    function renderLedgerTable() {
        if (!bookingsTableBody) return;
        
        bookingsTableBody.innerHTML = "";

        if (shipments.length === 0) {
            bookingsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 24px; color: #94a3b8;">
                        No shipments booked yet. Click "Book a Shipment" to begin.
                    </td>
                </tr>`;
            return;
        }

        // Sort ledger to show newest bookings first
        const sortedShipments = [...shipments].reverse();

        sortedShipments.forEach(shipment => {
            let statusBadgeClass = "status-transit";
            if (shipment.status === "Out for Delivery") statusBadgeClass = "status-delivery";
            if (shipment.status === "Delivered") statusBadgeClass = "status-delivered";
            if (shipment.status === "Pending Dispatch") statusBadgeClass = "status-pending";

            const cleanDestination = parseDestinationString(shipment.destination);
            
            // Select the icon for the ledger table row item
            const tableRowIcon = getServiceIcon(shipment.serviceType);

            const rowHtml = `
                <tr>
                    <td><strong>${shipment.trackingId}</strong></td>
                    <td><i class="${tableRowIcon}" style="margin-right: 6px; color: #64748b; width: 16px; text-align: center;"></i> ${shipment.serviceType}</td>
                    <td>${cleanDestination}</td>
                    <td>${shipment.dateBooked || "Today"}</td>
                    <td><span class="badge ${statusBadgeClass}">${shipment.status}</span></td>
                </tr>
            `;
            bookingsTableBody.insertAdjacentHTML("beforeend", rowHtml);
        });
    }

    // Fast-redirect function passing text control numbers over to the track parcel screen
    if (quickTrackForm) {
        quickTrackForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const quickTrackInput = document.getElementById("quickTrackInput");
            if (quickTrackInput) {
                const trackNum = quickTrackInput.value.trim();
                if (trackNum) {
                    sessionStorage.setItem("pendingTrackId", trackNum);
                    window.location.href = "track-parcel.html";
                }
            }
        });
    }

    // Initialize operations panel engine calculations on layout loading
    calculateMetrics();
    renderActiveProgressCards();
    renderLedgerTable();
});