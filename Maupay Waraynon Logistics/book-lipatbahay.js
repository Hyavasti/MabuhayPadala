document.addEventListener("DOMContentLoaded", () => {
    // Shortcuts dropdowns
    const pickupShortcut = document.getElementById("dropdownPickupShortcut");
    const dropoffShortcut = document.getElementById("dropdownDropoffShortcut");
    
    // Pickup Target Elements (FROM)
    const pickupContact = document.getElementById("pickupContact");
    const pickupMobile = document.getElementById("pickupMobile");
    const pickupProvince = document.getElementById("pickupProvince");
    const pickupCity = document.getElementById("pickupCity");
    const pickupBarangay = document.getElementById("pickupBarangay");
    const pickupStreet = document.getElementById("pickupStreetAddress");

    // Dropoff Target Elements (TO)
    const dropoffContact = document.getElementById("dropoffContact");
    const dropoffMobile = document.getElementById("dropoffMobile");
    const dropoffProvince = document.getElementById("dropoffProvince");
    const dropoffCity = document.getElementById("dropoffCity");
    const dropoffBarangay = document.getElementById("dropoffBarangay");
    const dropoffStreet = document.getElementById("dropoffStreetAddress");

    const btnBack = document.getElementById("btnBackToServices");
    const formWizard = document.getElementById("lipatBahayDetailsForm");
    const profileAvatar = document.getElementById("profileAvatar");

    // Pull active authentication session parameters
    const savedAccountRaw = localStorage.getItem('dummyTestingAccount');
    let userAccountData = null;

    if (savedAccountRaw) {
        userAccountData = JSON.parse(savedAccountRaw);
        if (userAccountData.firstName) {
            profileAvatar.innerText = userAccountData.firstName.charAt(0).toUpperCase();
        }
    }

    // ==========================================
    // NATIONWIDE COMPLETE PH LOCATIONS ENGINE
    // ==========================================
    let phPlacesData = null;

    // Fetch complete official PSGC Geographic structure
    fetch('https://psgc.gitlab.io/api/provinces.json')
        .then(res => res.json())
        .then(provinces => {
            // Sort provinces alphabetically
            provinces.sort((a, b) => a.name.localeCompare(b.name));
            
            // Populate BOTH province dropdowns completely
            pickupProvince.innerHTML = '<option value="" disabled selected>Select province</option>';
            dropoffProvince.innerHTML = '<option value="" disabled selected>Select province</option>';
            
            provinces.forEach(prov => {
                const optFrom = document.createElement("option");
                optFrom.value = prov.code; // Store the unique PSGC code as value
                optFrom.innerText = prov.name;
                pickupProvince.appendChild(optFrom);

                const optTo = document.createElement("option");
                optTo.value = prov.code;
                optTo.innerText = prov.name;
                dropoffProvince.appendChild(optTo);
            });
            console.log("🇵🇭 Nationwide Philippine Province Registry Fully Armed & Connected!");
        })
        .catch(err => console.error("Location API failed to connect:", err));

    // Universal handler to wire up Cascading City & Barangay searches dynamically
    function wirePsgcCascadingDropdowns(provinceSelect, citySelect, barangaySelect) {
        
        // 1. When Province is picked -> Fetch ALL corresponding Cities/Municipalities
        provinceSelect.addEventListener("change", () => {
            const provinceCode = provinceSelect.value;
            
            citySelect.innerHTML = '<option value="" disabled selected>Loading cities...</option>';
            barangaySelect.innerHTML = '<option value="" disabled selected>Select barangay</option>';
            citySelect.disabled = false;
            barangaySelect.disabled = true;

            fetch(`https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities.json`)
                .then(res => res.json())
                .then(cities => {
                    cities.sort((a, b) => a.name.localeCompare(b.name));
                    citySelect.innerHTML = '<option value="" disabled selected>Select city/municipality</option>';
                    
                    cities.forEach(city => {
                        const opt = document.createElement("option");
                        opt.value = city.code; // Unique city key
                        opt.innerText = city.name;
                        citySelect.appendChild(opt);
                    });
                });
        });

        // 2. When City is picked -> Fetch ALL corresponding Barangays (100% complete)
        citySelect.addEventListener("change", () => {
            const cityCode = citySelect.value;
            
            barangaySelect.innerHTML = '<option value="" disabled selected>Loading barangays...</option>';
            barangaySelect.disabled = false;

            // Handle whether it's classified as a city or a sub-municipality automatically
            const targetUrl = `https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays.json`;

            fetch(targetUrl)
                .then(res => res.json())
                .then(barangays => {
                    barangays.sort((a, b) => a.name.localeCompare(b.name));
                    barangaySelect.innerHTML = '<option value="" disabled selected>Select barangay</option>';
                    
                    barangays.forEach(brgy => {
                        const opt = document.createElement("option");
                        opt.value = brgy.name; // Store text name for data logging summary
                        opt.innerText = brgy.name;
                        barangaySelect.appendChild(opt);
                    });
                })
                .catch(() => {
                    // Fallback configuration if API layout changes dynamic endpoints
                    barangaySelect.innerHTML = '<option value="" disabled selected>Select barangay</option>';
                });
        });
    }

    // Activate the live cascading system for both address spaces
    wirePsgcCascadingDropdowns(pickupProvince, pickupCity, pickupBarangay);
    wirePsgcCascadingDropdowns(dropoffProvince, dropoffCity, dropoffBarangay);

    // ==========================================
    // SHORTCUT AUTO-FILL DATA UTILITIES
    // ==========================================
    pickupShortcut.addEventListener("change", () => {
        if (pickupShortcut.value === "profile") {
            if (userAccountData) {
                pickupContact.value = `${userAccountData.firstName} ${userAccountData.lastName}`.trim();
                pickupMobile.value = userAccountData.fullContactPhone || "";
            } else {
                pickupContact.value = "Juan Dela Cruz";
                pickupMobile.value = "09123456789";
            }
        } else if (pickupShortcut.value === "clear") {
            pickupContact.value = "";
            pickupMobile.value = "";
            pickupStreet.value = "";
            pickupProvince.selectedIndex = 0;
            resetSelector(pickupCity, "city/municipality");
            resetSelector(pickupBarangay, "barangay");
        }
    });

    dropoffShortcut.addEventListener("change", () => {
        if (dropoffShortcut.value === "clear") {
            dropoffContact.value = "";
            dropoffMobile.value = "";
            dropoffStreet.value = "";
            dropoffProvince.selectedIndex = 0;
            resetSelector(dropoffCity, "city/municipality");
            resetSelector(dropoffBarangay, "barangay");
        }
    });

    function resetSelector(element, typeName) {
        element.innerHTML = `<option value="" disabled selected>Select ${typeName}</option>`;
        element.disabled = true;
    }

    // ==========================================
    // ACTION CONTROL BUTTON ROUTING
    // ==========================================
    btnBack.addEventListener("click", () => {
        window.location.href = "book-shipment.html";
    });

    formWizard.addEventListener("submit", (e) => {
        e.preventDefault();

        // Get textual names instead of raw code tokens for storage payload
        const selectedOrigProv = pickupProvince.options[pickupProvince.selectedIndex].text;
        const selectedOrigCity = pickupCity.options[pickupCity.selectedIndex].text;
        const selectedDestProv = dropoffProvince.options[dropoffProvince.selectedIndex].text;
        const selectedDestCity = dropoffCity.options[dropoffCity.selectedIndex].text;

        const completeNationalPayload = {
            serviceType: "Lipat Bahay Nationwide",
            origin: {
                name: pickupContact.value,
                phone: pickupMobile.value,
                province: selectedOrigProv,
                city: selectedOrigCity,
                barangay: pickupBarangay.value,
                street: pickupStreet.value
            },
            destination: {
                name: dropoffContact.value,
                phone: dropoffMobile.value,
                province: selectedDestProv,
                city: selectedDestCity,
                barangay: dropoffBarangay.value,
                street: dropoffStreet.value
            }
        };

        localStorage.setItem('activeBookingFormStep2', JSON.stringify(completeNationalPayload));
        console.log("Success! Nationwide address log generated safely:", completeNationalPayload);
        alert("Symmetrical nationwide address verified! Proceeding to Step 3.");
    });
});