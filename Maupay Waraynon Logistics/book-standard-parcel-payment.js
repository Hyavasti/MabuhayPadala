document.addEventListener("DOMContentLoaded", () => {
    const btnBackToPackage = document.getElementById("btnBackToPackage");
    const btnConfirmBooking = document.getElementById("btnConfirmBooking");
    const summaryPayer = document.getElementById("summaryPayer");

    // Modal Control element hooks references
    const bookingReviewModal = document.getElementById("bookingReviewModal");
    const btnCloseModalX = document.getElementById("btnCloseModalX");
    const btnCancelModal = document.getElementById("btnCancelModal");
    const btnFinalSubmitModal = document.getElementById("btnFinalSubmitModal");

    // Modal Target Data Value fields pointers
    const popDeliveryMode = document.getElementById("popDeliveryMode");
    const popSenderName = document.getElementById("popSenderName");
    const popReceiverName = document.getElementById("popReceiverName");
    const popItemDesc = document.getElementById("popItemDesc");
    const popWeight = document.getElementById("popWeight");
    const popVolume = document.getElementById("popVolume");
    const popPayer = document.getElementById("popPayer");
    const popMethod = document.getElementById("popMethod");
    const popGrandTotal = document.getElementById("popGrandTotal");

    // Dynamic targets for referencing payment confirmation numbers
    const gcashRefInput = document.getElementById("gcashRefNum");
    const bankRefInput = document.getElementById("bankRefNum");

    // Summary calculation UI values pointers
    const summaryBaseRate = document.getElementById("summaryBaseRate");
    const summaryWeightSurcharge = document.getElementById("summaryWeightSurcharge");
    const summaryInsurance = document.getElementById("summaryInsurance");
    const summaryGrandTotal = document.getElementById("summaryGrandTotal");


    //RECOVER CONSOLIDATED DATA MANIFEST
    const rawManifestStringData = localStorage.getItem('consolidatedBookingManifest');
    if (!rawManifestStringData) {
        alert("❌ Missing active booking session values. Heading back to Step 1.");
        window.location.href = "book-standard-parcel-details.html";
        return;
    }

    const currentBookingDataManifest = JSON.parse(rawManifestStringData);
    
    // Auto-populate Ledger Breakdown Numbers using your exact billingLedger object keys
    if (currentBookingDataManifest.billingLedger) {
        const ledger = currentBookingDataManifest.billingLedger;
        summaryBaseRate.textContent = parseFloat(ledger.baseRate || 150).toFixed(2);
        summaryWeightSurcharge.textContent = parseFloat(ledger.weightSurcharge || 0).toFixed(2);
        summaryInsurance.textContent = parseFloat(ledger.insuranceCharge || 0).toFixed(2);
        summaryGrandTotal.textContent = parseFloat(ledger.grandTotal || 150).toFixed(2);
    }

  
    //WHO WILL PAY
 
    const payerRadios = document.querySelectorAll('input[name="payerType"]');
    payerRadios.forEach(radio => {
        const optionCard = radio.closest('.custom-selection-card');
        if (!optionCard) return;

        optionCard.addEventListener("click", (e) => {
            e.preventDefault();
            payerRadios.forEach(r => {
                const parent = r.closest('.custom-selection-card');
                if (parent) parent.classList.remove("active");
            });
            optionCard.classList.add("active");
            radio.checked = true;
            
            if (summaryPayer) {
                summaryPayer.textContent = radio.value;
            }
        });
    });

    // PAYMENT METHOD
    const methodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    methodRadios.forEach(radio => {
        const wrapperCardFrame = radio.closest('.method-card-wrapper');
        if (!wrapperCardFrame) return;

        wrapperCardFrame.addEventListener("click", () => {
            methodRadios.forEach(r => {
                const siblingWrapper = r.closest('.method-card-wrapper');
                if (siblingWrapper) siblingWrapper.classList.remove("active");
            });
            wrapperCardFrame.classList.add("active");
            radio.checked = true;
        });
    });

    // Helper functions to manage modal visibility
    function openReviewModalPopup() {
        bookingReviewModal.classList.add("is-visible");
    }

    function closeReviewModalPopup() {
        bookingReviewModal.classList.remove("is-visible");
    }

    [btnCloseModalX, btnCancelModal].forEach(btn => {
        if (btn) btn.addEventListener("click", closeReviewModalPopup);
    });

  
    // CONFIRM BOOKING

    if (btnConfirmBooking) {
        btnConfirmBooking.addEventListener("click", () => {
            const finalMethodChoice = document.querySelector('input[name="paymentMethod"]:checked').value;
            
            // Validation step: Check reference strings if digital settlement channels are selected
            if (finalMethodChoice === "GCash" && !gcashRefInput.value.trim()) {
                alert("⚠️ Please fill out your 13-digit GCash transfer reference string code before finalizing booking details.");
                gcashRefInput.focus();
                return;
            } else if (finalMethodChoice === "BankTransfer" && !bankRefInput.value.trim()) {
                alert("⚠️ Please provide your bank transaction verification tracking number block.");
                bankRefInput.focus();
                return;
            }

            // ADAPTER PARSING ---
            const s1 = currentBookingDataManifest.step1Details || currentBookingDataManifest.step1 || {};
            popDeliveryMode.textContent = s1.deliveryOption || "Pickup to Outlet";
            popSenderName.textContent = s1.senderName || "Juan Dela Cruz";
            popReceiverName.textContent = s1.receiverName || "Maria Clara";
            
            // FIXED ADAPTER PARSING---
            const pkgConfig = currentBookingDataManifest.packageConfiguration || {};
            
            popItemDesc.textContent = pkgConfig.description || "General Goods";
            popWeight.textContent = `${pkgConfig.weightKg || 0} kg`;
            
            if (pkgConfig.dimensions) {
                const dim = pkgConfig.dimensions;
                popVolume.textContent = `${dim.length || 0}x${dim.width || 0}x${dim.height || 0} cm`;
            } else {
                popVolume.textContent = "0x0x0 cm";
            }

            // --- POPULATING THE PAYMENT TERMS BLOCK ---
            const finalPayerChoice = document.querySelector('input[name="payerType"]:checked').value;
            popPayer.textContent = finalPayerChoice;
            popMethod.textContent = (finalMethodChoice === "Cash") ? "Cash / COD" : finalMethodChoice;
            popGrandTotal.textContent = `PHP ${summaryGrandTotal.textContent}`;

            // Launch the modal review window overlay
            openReviewModalPopup();
        });
    }

  
    // FINAL SUBMISSION TO RE-COMMIT AND SAVE TO LOCAL STORAGE
  
    if (btnFinalSubmitModal) {
        btnFinalSubmitModal.addEventListener("click", () => {
            const finalPayerChoice = document.querySelector('input[name="payerType"]:checked').value;
            const finalMethodChoice = document.querySelector('input[name="paymentMethod"]:checked').value;
            let referenceVerificationCodeValue = "N/A (Cash Settlement)";

            if (finalMethodChoice === "GCash") referenceVerificationCodeValue = gcashRefInput.value.trim();
            if (finalMethodChoice === "BankTransfer") referenceVerificationCodeValue = bankRefInput.value.trim();

            // Append metadata properties details to complete the lifecycle data mapping tracking
            currentBookingDataManifest.assignedPayer = finalPayerChoice;
            currentBookingDataManifest.paymentMethodSelected = finalMethodChoice;
            currentBookingDataManifest.transactionReferenceCode = referenceVerificationCodeValue;
            currentBookingDataManifest.bookingTimestamp = new Date().toISOString();
            currentBookingDataManifest.status = (finalMethodChoice === "Cash") ? "Pending Pickup" : "Verifying Settle Signature";

            // Save the complete manifest out to data memory space registry
            localStorage.setItem('consolidatedBookingManifest', JSON.stringify(currentBookingDataManifest));
            
            closeReviewModalPopup();
            
            alert(`🎉 Success! Booking processed cleanly. Returning back to Overview dashboard.`);
            window.location.href = "dashboard.html";
        });
    }

    if (btnBackToPackage) {
        btnBackToPackage.addEventListener("click", () => {
            window.location.href = "book-standard-parcel-package.html";
        });
    }
});