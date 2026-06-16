document.addEventListener("DOMContentLoaded", () => {
    const btnBackToPackage = document.getElementById("btnBackToPackage");
    const btnConfirmBooking = document.getElementById("btnConfirmBooking");
    const summaryPayer = document.getElementById("summaryPayer");

    const bookingReviewModal = document.getElementById("bookingReviewModal");
    const btnCloseModalX = document.getElementById("btnCloseModalX");
    const btnCancelModal = document.getElementById("btnCancelModal");
    const btnFinalSubmitModal = document.getElementById("btnFinalSubmitModal");

    const successModalOverlay = document.getElementById("successModalOverlay");
    const successTrackingId = document.getElementById("successTrackingId");
    const btnSuccessDashboard = document.getElementById("btnSuccessDashboard");

    const popDeliveryMode = document.getElementById("popDeliveryMode");
    const popSenderName = document.getElementById("popSenderName");
    const popReceiverName = document.getElementById("popReceiverName");
    const popItemDesc = document.getElementById("popItemDesc");
    const popWeight = document.getElementById("popWeight");
    const popVolume = document.getElementById("popVolume");
    const popSpecialNotes = document.getElementById("popSpecialNotes");
    
    const popPayer = document.getElementById("popPayer");
    const popMethod = document.getElementById("popMethod");
    const popGrandTotal = document.getElementById("popGrandTotal");

    const gcashRefInput = document.getElementById("gcashRefNum");
    const bankRefInput = document.getElementById("bankRefNum");

    const summaryBaseRate = document.getElementById("summaryBaseRate");
    const summaryWeightSurcharge = document.getElementById("summaryWeightSurcharge");
    const summaryInsurance = document.getElementById("summaryInsurance");
    const summaryGrandTotal = document.getElementById("summaryGrandTotal");

    const rawManifestStringData = localStorage.getItem('consolidatedBookingManifest');
    if (!rawManifestStringData) {
        alert("❌ Missing active booking session values. Heading back to Step 1.");
        window.location.href = "book-standard-parcel-details.html";
        return;
    }

    const currentBookingDataManifest = JSON.parse(rawManifestStringData);
    
    if (currentBookingDataManifest.billingLedger) {
        const ledger = currentBookingDataManifest.billingLedger;
        if (summaryBaseRate) summaryBaseRate.textContent = parseFloat(ledger.baseRate || 150).toFixed(2);
        if (summaryWeightSurcharge) summaryWeightSurcharge.textContent = parseFloat(ledger.weightSurcharge || 0).toFixed(2);
        if (summaryInsurance) summaryInsurance.textContent = parseFloat(ledger.insuranceCharge || 0).toFixed(2);
        if (summaryGrandTotal) summaryGrandTotal.textContent = parseFloat(ledger.grandTotal || 150).toFixed(2);
    }

    const payerRadios = document.querySelectorAll('input[name="payerType"]');
    payerRadios.forEach(radio => {
        const optionCard = radio.closest('.custom-selection-card');
        if (!optionCard) return;
        optionCard.addEventListener("click", () => {
            payerRadios.forEach(r => { const p = r.closest('.custom-selection-card'); if (p) p.classList.remove("active"); });
            optionCard.classList.add("active");
            radio.checked = true;
            if (summaryPayer) summaryPayer.textContent = radio.value;
        });
    });

    const methodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    methodRadios.forEach(radio => {
        const wrapperCardFrame = radio.closest('.method-card-wrapper');
        if (!wrapperCardFrame) return;
        wrapperCardFrame.addEventListener("click", () => {
            methodRadios.forEach(r => { const s = r.closest('.method-card-wrapper'); if (s) s.classList.remove("active"); });
            wrapperCardFrame.classList.add("active");
            radio.checked = true;
        });
    });

    function openReviewModalPopup() { if (bookingReviewModal) bookingReviewModal.classList.add("is-visible"); }
    function closeReviewModalPopup() { if (bookingReviewModal) bookingReviewModal.classList.remove("is-visible"); }

    [btnCloseModalX, btnCancelModal].forEach(btn => { if (btn) btn.addEventListener("click", closeReviewModalPopup); });

    if (btnConfirmBooking) {
        btnConfirmBooking.addEventListener("click", () => {
            const checkedMethod = document.querySelector('input[name="paymentMethod"]:checked');
            const checkedPayer = document.querySelector('input[name="payerType"]:checked');

            if (!checkedMethod || !checkedPayer) {
                alert("⚠️ Please confirm both your payment terms configuration and method channels.");
                return;
            }

            const finalMethodChoice = checkedMethod.value;
            if (finalMethodChoice === "GCash" && (!gcashRefInput || !gcashRefInput.value.trim())) {
                alert("⚠️ Please fill out your 13-digit GCash transfer reference string code.");
                if (gcashRefInput) gcashRefInput.focus();
                return;
            } else if (finalMethodChoice === "BankTransfer" && (!bankRefInput || !bankRefInput.value.trim())) {
                alert("⚠️ Please provide your bank transaction verification tracking number block.");
                if (bankRefInput) bankRefInput.focus();
                return;
            }

            const senderDetails = currentBookingDataManifest.senderContactDetails || {};
            const receiverDetails = currentBookingDataManifest.receiverContactDetails || {};

            if (popDeliveryMode) popDeliveryMode.textContent = currentBookingDataManifest.deliveryArrangementOption || "DoorToDoor";
            if (popSenderName) popSenderName.textContent = senderDetails.fullName || "Sender Name Unavailable";
            if (popReceiverName) popReceiverName.textContent = receiverDetails.fullName || "Receiver Name Unavailable";
            
            const pkgConfig = currentBookingDataManifest.packageConfiguration || {};
            if (popItemDesc) popItemDesc.textContent = pkgConfig.description || "General Goods";
            if (popWeight) popWeight.textContent = `${pkgConfig.weightKg || 0} kg`;
            
            if (popVolume) {
                if (pkgConfig.dimensions) {
                    const dim = pkgConfig.dimensions;
                    popVolume.textContent = `${dim.length || 0}x${dim.width || 0}x${dim.height || 0} cm`;
                } else {
                    popVolume.textContent = "0x0x0 cm";
                }
            }

            if (popSpecialNotes) {
                popSpecialNotes.textContent = (pkgConfig.specialHandlingNotes && pkgConfig.specialHandlingNotes.trim() !== "") ? pkgConfig.specialHandlingNotes : "None";
            }

            if (popPayer) popPayer.textContent = checkedPayer.value;
            if (popMethod) popMethod.textContent = (finalMethodChoice === "Cash") ? "Cash / COD" : finalMethodChoice;
            if (popGrandTotal && summaryGrandTotal) popGrandTotal.textContent = `PHP ${summaryGrandTotal.textContent}`;

            openReviewModalPopup();
        });
    }

    if (btnFinalSubmitModal) {
        btnFinalSubmitModal.addEventListener("click", () => {
            const checkedPayer = document.querySelector('input[name="payerType"]:checked');
            const checkedMethod = document.querySelector('input[name="paymentMethod"]:checked');
            
            const finalPayerChoice = checkedPayer ? checkedPayer.value : "Sender";
            const finalMethodChoice = checkedMethod ? checkedMethod.value : "Cash";
            let referenceVerificationCodeValue = "N/A (Cash Settlement)";

            if (finalMethodChoice === "GCash" && gcashRefInput) referenceVerificationCodeValue = gcashRefInput.value.trim();
            if (finalMethodChoice === "BankTransfer" && bankRefInput) referenceVerificationCodeValue = bankRefInput.value.trim();

            const uniqueTrackingId = "BAC-" + Math.floor(10000000 + Math.random() * 90000000) + "-PH";

            const senderDetails = currentBookingDataManifest.senderContactDetails || {};
            const receiverDetails = currentBookingDataManifest.receiverContactDetails || {};
            const pkgConfig = currentBookingDataManifest.packageConfiguration || {};
            const dimensionsObj = pkgConfig.dimensions || {};
            
            const senderName = senderDetails.fullName || "Sender Name N/A";
            const receiverName = receiverDetails.fullName || "Authorized Receiver";
            
            // Re-compile sender full address path safely
            let finalSenderAddress = senderDetails.fullAddress || senderDetails.streetAddress || "Main Parcel Terminal";

            // Dynamic receiver full address assembly
            let finalReceiverAddress = "";
            if (receiverDetails.streetAddress) {
                const parts = [
                    receiverDetails.streetAddress,
                    receiverDetails.barangay,
                    receiverDetails.city,
                    receiverDetails.province,
                    receiverDetails.region
                ].filter(val => val && val.trim() !== "" && !val.toLowerCase().includes("select"));
                
                finalReceiverAddress = parts.join(", ");
            }
            
            if (!finalReceiverAddress || finalReceiverAddress.trim() === "") {
                finalReceiverAddress = currentBookingDataManifest.dashboardDisplayDestination || "N/A";
            }

            // Extract clean phone details cleanly
            const finalSenderPhone = senderDetails.phoneNumber || "N/A";
            const finalReceiverPhone = receiverDetails.phoneNumber || "N/A";

            // CRITICAL FIX: Safe declared value numerical validation formatting strings
            let parcelValueFormatted = "PHP 0.00";
            if (pkgConfig.declaredValue) {
                const cleanValueString = pkgConfig.declaredValue.toString().replace(/[^0-9.]/g, "");
                const numericDeclaredValue = parseFloat(cleanValueString);
                if (!isNaN(numericDeclaredValue)) {
                    parcelValueFormatted = `PHP ${numericDeclaredValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
            }

            let cleanNumericPrice = "150";
            if (summaryGrandTotal && summaryGrandTotal.textContent) {
                cleanNumericPrice = summaryGrandTotal.textContent.replace(/[^0-9.]/g, "");
            }

            const currentTimestampAnchor = new Date().getTime();

            // Unified clean payload for the dashboard view database matching exactly
            const finalDashboardRecord = {
                trackingId: uniqueTrackingId,
                serviceType: "Standard Parcel", 
                destination: finalReceiverAddress, 
                dateBooked: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                idTimestamp: currentTimestampAnchor, 
                estDelivery: "Pending Dispatch",
                totalAmount: cleanNumericPrice,
                status: "Pending Dispatch",
                
                sender: {
                    name: senderName,
                    phone: finalSenderPhone,
                    address: finalSenderAddress
                },
                receiver: {
                    name: receiverName,
                    phone: finalReceiverPhone,
                    address: finalReceiverAddress
                },
                package: {
                    desc: pkgConfig.description || "General Goods",
                    category: "Standard Delivery Parcel",
                    dims: `${dimensionsObj.length || 0} × ${dimensionsObj.width || 0} × ${dimensionsObj.height || 0} cm`,
                    weight: `${pkgConfig.weightKg || 0} kg`,
                    value: parcelValueFormatted // This ensures clean text is committed
                },
                payment: {
                    method: (finalMethodChoice === "Cash") ? "Cash / COD" : finalMethodChoice,
                    amount: cleanNumericPrice
                }
            };

            const masterShipmentsDatabase = JSON.parse(localStorage.getItem("maupayShipments")) || [];
            masterShipmentsDatabase.push(finalDashboardRecord);
            localStorage.setItem("maupayShipments", JSON.stringify(masterShipmentsDatabase));

            currentBookingDataManifest.assignedPayer = finalPayerChoice;
            currentBookingDataManifest.paymentMethodSelected = finalMethodChoice;
            currentBookingDataManifest.transactionReferenceCode = referenceVerificationCodeValue;
            currentBookingDataManifest.bookingTimestamp = new Date().toISOString();
            currentBookingDataManifest.generatedTrackingId = uniqueTrackingId;
            currentBookingDataManifest.idTimestamp = currentTimestampAnchor;
            currentBookingDataManifest.status = "Pending Dispatch";
            
            localStorage.setItem('consolidatedBookingManifest', JSON.stringify(currentBookingDataManifest));
            sessionStorage.removeItem("activeBookingServiceType");

            closeReviewModalPopup();
            if (successTrackingId) successTrackingId.textContent = uniqueTrackingId;
            if (successModalOverlay) successModalOverlay.classList.add("display-modal-active");
        });
    }

    if (btnSuccessDashboard) {
        btnSuccessDashboard.addEventListener("click", () => {
            if (successModalOverlay) successModalOverlay.classList.remove("display-modal-active");
            window.location.href = "dashboard.html";
        });
    }

    if (btnBackToPackage) {
        btnBackToPackage.addEventListener("click", () => { window.location.href = "book-standard-parcel-package.html"; });
    }
});