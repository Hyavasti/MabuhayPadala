document.addEventListener("DOMContentLoaded", () => {
    const detailsForm = document.getElementById("standardParcelDetailsForm");
    const btnBackToShipmentMenu = document.getElementById("btnBackToShipmentMenu");
    const deliveryCards = document.querySelectorAll('.delivery-option-card');
    
    // Form Dropdown Element References
    const senderProvince = document.getElementById("senderProvince");
    const senderCity = document.getElementById("senderCity");
    const senderBarangay = document.getElementById("senderBarangay");

    const receiverProvince = document.getElementById("receiverProvince");
    const receiverCity = document.getElementById("receiverCity");
    const receiverOutlet = document.getElementById("receiverOutlet");

    // Dynamic Display Segment Containers
    const receiverDoorToDoorFields = document.getElementById("receiverDoorToDoorFields");
    const receiverPickupOutletFields = document.getElementById("receiverPickupOutletFields");

    // Text Input Element References (Names & Phones)
    const senderName = document.getElementById("senderName");
    const receiverName = document.getElementById("receiverName");
    const senderMobile = document.getElementById("senderMobile");
    const receiverMobile = document.getElementById("receiverMobile");

    // Save Address Checkboxes References
    const saveSenderAddress = document.getElementById("saveSenderAddress");
    const saveReceiverAddress = document.getElementById("saveReceiverAddress");

    // Profile Avatar Display Setup
    const profileAvatar = document.getElementById("profileAvatar");
    const savedAccountRaw = localStorage.getItem('dummyTestingAccount');
    if (savedAccountRaw && profileAvatar) {
        const userAccount = JSON.parse(savedAccountRaw);
        if (userAccount.firstName) {
            profileAvatar.innerText = userAccount.firstName.charAt(0).toUpperCase();
        }
    }

    
    //CONTACT PERSON STRICT NAME VALIDATION
    function sanitizeContactNameInput(inputElement) {
        inputElement.addEventListener("input", (e) => {
            // Replace any numerical digits (0-9) with an empty string
            let sanitizedValue = e.target.value.replace(/[0-9]/g, "");
            e.target.value = sanitizedValue;
        });
    }

    // Apply name filters to both Contact Person fields
    sanitizeContactNameInput(senderName);
    sanitizeContactNameInput(receiverName);



    // PHONE NUMBER STRICT VALIDATION & SANITIZATION
    function sanitizePhoneNumberInput(inputElement) {
        inputElement.addEventListener("input", (e) => {
            let sanitizedValue = e.target.value.replace(/\D/g, "");
            if (sanitizedValue.length > 11) {
                sanitizedValue = sanitizedValue.slice(0, 11);
            }
            e.target.value = sanitizedValue;
        });
    }

    sanitizePhoneNumberInput(senderMobile);
    sanitizePhoneNumberInput(receiverMobile);

    // PSGC API DATA ENGINE (ENTIRE PHILIPPINES)
    const PSGC_BASE_URL = "https://psgc.gitlab.io/api";

    async function initializeProvinces() {
        try {
            const response = await fetch(`${PSGC_BASE_URL}/provinces.json`);
            const provinces = await response.json();
            provinces.sort((a, b) => a.name.localeCompare(b.name));

            senderProvince.innerHTML = '<option value="" disabled selected>Select province</option>';
            receiverProvince.innerHTML = '<option value="" disabled selected>Select province</option>';

            provinces.forEach(prov => {
                const optSender = document.createElement("option");
                optSender.value = prov.code; 
                optSender.textContent = prov.name;
                optSender.setAttribute('data-name', prov.name);
                senderProvince.appendChild(optSender);

                const optReceiver = document.createElement("option");
                optReceiver.value = prov.code;
                optReceiver.textContent = prov.name;
                optReceiver.setAttribute('data-name', prov.name);
                receiverProvince.appendChild(optReceiver);
            });
        } catch (error) {
            console.error("Error downloading national PSGC province lists:", error);
        }
    }

    async function handleProvinceChange(provinceSelect, citySelect, barangaySelect = null) {
        const selectedProvinceCode = provinceSelect.value;
        citySelect.innerHTML = '<option value="" disabled selected>Select city/municipality</option>';
        if (barangaySelect) {
            barangaySelect.innerHTML = '<option value="" disabled selected>Select barangay</option>';
        }

        if (!selectedProvinceCode) return;

        try {
            const response = await fetch(`${PSGC_BASE_URL}/provinces/${selectedProvinceCode}/cities-municipalities.json`);
            const cities = await response.json();
            cities.sort((a, b) => a.name.localeCompare(b.name));

            cities.forEach(city => {
                const opt = document.createElement("option");
                opt.value = city.code;
                opt.textContent = city.name;
                opt.setAttribute('data-name', city.name);
                citySelect.appendChild(opt);
            });
        } catch (error) {
            console.error("Error pulling PSGC city maps:", error);
        }
    }

    async function handleCityChange(citySelect, barangaySelect) {
        const selectedCityCode = citySelect.value;
        barangaySelect.innerHTML = '<option value="" disabled selected>Select barangay</option>';

        if (!selectedCityCode) return;

        try {
            const response = await fetch(`${PSGC_BASE_URL}/cities-municipalities/${selectedCityCode}/barangays.json`);
            const barangays = await response.json();
            barangays.sort((a, b) => a.name.localeCompare(b.name));

            barangays.forEach(brgy => {
                const opt = document.createElement("option");
                opt.value = brgy.code;
                opt.textContent = brgy.name;
                opt.setAttribute('data-name', brgy.name);
                barangaySelect.appendChild(opt);
            });
        } catch (error) {
            console.error("Error pulling PSGC barangay maps:", error);
        }
    }

    senderProvince.addEventListener("change", () => handleProvinceChange(senderProvince, senderCity, senderBarangay));
    senderCity.addEventListener("change", () => handleCityChange(senderCity, senderBarangay));
    receiverProvince.addEventListener("change", () => handleProvinceChange(receiverProvince, receiverCity));

    initializeProvinces();


    //DYNAMIC TABS TOGGLE LOGIC: DOOR-TO-DOOR vs PICKUP TO OUTLET

    deliveryCards.forEach(card => {
        card.addEventListener("click", (e) => {
            const radio = card.querySelector('.native-delivery-radio');
            if (e.target !== radio && radio) {
                radio.checked = true;
            }
            deliveryCards.forEach(c => c.classList.remove('active-card'));
            card.classList.add('active-card');

            const currentOption = radio.value;
            toggleReceiverFormLayout(currentOption);
        });
    });

    function toggleReceiverFormLayout(option) {
        const receiverStreet = document.getElementById("receiverStreet");

        if (option === "PickupOutlet") {
            receiverDoorToDoorFields.classList.add("hidden-field-block");
            receiverPickupOutletFields.classList.remove("hidden-field-block");

            receiverProvince.required = false;
            receiverCity.required = false;
            receiverStreet.required = false;
            receiverOutlet.required = true;
        } else {
            receiverDoorToDoorFields.classList.remove("hidden-field-block");
            receiverPickupOutletFields.classList.add("hidden-field-block");

            receiverProvince.required = true;
            receiverCity.required = true;
            receiverStreet.required = true;
            receiverOutlet.required = false;
        }
    }


    // NAVIGATION SUBMISSIONS & WORKSPACE PERSISTENCE
    if (btnBackToShipmentMenu) {
        btnBackToShipmentMenu.addEventListener("click", () => {
            window.location.href = "book-shipment.html";
        });
    }

    if (detailsForm) {
        detailsForm.addEventListener("submit", (e) => {
            e.preventDefault();

            if (senderMobile.value.length < 11 || receiverMobile.value.length < 11) {
                alert("❌ Mobile numbers must be exactly 11 digits long (e.g., 09171234567).");
                return;
            }

            const selectedOption = document.querySelector('input[name="deliveryOption"]:checked').value;

            const senderProvName = senderProvince.options[senderProvince.selectedIndex].getAttribute('data-name');
            const senderCityName = senderCity.options[senderCity.selectedIndex].getAttribute('data-name');
            const senderBrgyName = senderBarangay.options[senderBarangay.selectedIndex].getAttribute('data-name');

            let receiverDestinationSummary = {};

            if (selectedOption === "PickupOutlet") {
                receiverDestinationSummary = {
                    isOutletDropoff: true,
                    assignedOutletHub: receiverOutlet.value
                };
            } else {
                const receiverProvName = receiverProvince.options[receiverProvince.selectedIndex].getAttribute('data-name');
                const receiverCityName = receiverCity.options[receiverCity.selectedIndex].getAttribute('data-name');
                receiverDestinationSummary = {
                    isOutletDropoff: false,
                    province: receiverProvName,
                    city: receiverCityName,
                    street: document.getElementById("receiverStreet").value.trim()
                };
            }

            const shouldSaveSender = saveSenderAddress ? saveSenderAddress.checked : false;
            const shouldSaveReceiver = saveReceiverAddress ? saveReceiverAddress.checked : false;

            const trackingManifest = {
                serviceWorkflowType: "Standard Parcel",
                deliveryArrangementOption: selectedOption,
                saveSenderToAddressBook: shouldSaveSender,
                saveReceiverToAddressBook: shouldSaveReceiver,
                senderContactDetails: {
                    fullName: senderName.value.trim(),
                    mobile: senderMobile.value,
                    province: senderProvName,
                    city: senderCityName,
                    barangay: senderBrgyName,
                    street: document.getElementById("senderStreet").value.trim()
                },
                receiverContactDetails: {
                    fullName: receiverName.value.trim(),
                    mobile: receiverMobile.value,
                    ...receiverDestinationSummary
                }
            };

            localStorage.setItem('consolidatedBookingManifest', JSON.stringify(trackingManifest));
            window.location.href = "book-standard-parcel-package.html";
        });
    }
});