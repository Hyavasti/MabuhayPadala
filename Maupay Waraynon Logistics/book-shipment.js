document.addEventListener("DOMContentLoaded", () => {
    const serviceCards = document.querySelectorAll(".service-option-card");
    const btnContinue = document.getElementById("btnContinueBooking");
    const profileAvatar = document.getElementById("profileAvatar");

    // Variable track to store selection code state parameters (defaults to standard card)
    let selectedService = "standard"; 

    // ==========================================
    // PROFILE SESSION DISPLAY LOADER
    // ==========================================
    const savedAccountRaw = localStorage.getItem('dummyTestingAccount');
    if (savedAccountRaw) {
        const userAccount = JSON.parse(savedAccountRaw);
        const fullFirstName = userAccount.firstName || "User";
        if (fullFirstName.length > 0) {
            profileAvatar.innerText = fullFirstName.charAt(0).toUpperCase();
        }
    }

    // ==========================================
    // INTERACTIVE SELECTION EVENT HANDLING
    // ==========================================
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

    // ==========================================
    // STEP TRANSITION CONTINUATION TRIGGER
    // ==========================================
    // Inside your original book-shipment.js file continuation handler:
btnContinue.addEventListener("click", () => {
    if (selectedService === "lipat-bahay") {
        window.location.href = "book-lipatbahay.html"; // Open your newly loaded form screen!
    } else {
        alert(`Selected ${selectedService}. Booking form routes for this sector are currently preparation nodes.`);
    }
});});