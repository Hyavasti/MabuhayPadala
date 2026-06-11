document.addEventListener("DOMContentLoaded", () => {
    const serviceCards = document.querySelectorAll(".service-option-card");
    const btnContinue = document.getElementById("btnContinueBooking");
    const profileAvatar = document.getElementById("profileAvatar");
    const cardStandardParcel = document.getElementById("cardStandardParcel");
    // Variable track to store selection code state parameters
    let selectedService = "standard"; 

    
    // PROFILE SESSION DISPLAY LOADER
    const savedAccountRaw = localStorage.getItem('dummyTestingAccount');
    if (savedAccountRaw) {
        const userAccount = JSON.parse(savedAccountRaw);
        const fullFirstName = userAccount.firstName || "User";
        if (fullFirstName.length > 0) {
            profileAvatar.innerText = fullFirstName.charAt(0).toUpperCase();
        }
    }



    // INTERACTIVE SELECTION EVENT HANDLING

    serviceCards.forEach(card => {
        card.addEventListener("click", () => {
            // 1. Clear existing active frame selection attributes from all cards
            serviceCards.forEach(c => c.classList.remove("selected"));

            // 2. Attach selected class focus attributes to clicked block
            card.classList.add("selected");

            // 3. Keep track of selected parameter type token references
            selectedService = card.getAttribute("data-service-id");
            console.log(`Logistics Workflow: Category selected set to -> ${selectedService}`);
        });
    });

    // STEP TRANSITION CONTINUATION TRIGGER

    // Standard Parcel service option
if (cardStandardParcel) {
        // Change the mouse cursor to a pointer so users know it's clickable
        cardStandardParcel.style.cursor = "pointer";

        cardStandardParcel.addEventListener("click", () => {
            // Clear out any old stale temporary booking manifests from previous attempts
            localStorage.removeItem('consolidatedBookingManifest');
            
            // Navigate cleanly to your newly created Step 1 form page
            window.location.href = "book-standard-parcel-details.html";
        });
    }

    // Lipat Bahay service option
btnContinue.addEventListener("click", () => {
    if (selectedService === "lipat-bahay") {
        window.location.href = "book-lipatbahay.html";
    } else {
        alert(`Selected ${selectedService}. Booking form routes for this sector are currently preparation nodes.`);
    }
});});