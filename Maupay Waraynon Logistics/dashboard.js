document.addEventListener("DOMContentLoaded", () => {
    // Select dynamic UI hook targets
    const welcomeGreeting = document.getElementById("welcomeGreeting");
    const profileAvatar = document.getElementById("profileAvatar");
    const logoutBtn = document.getElementById("logoutBtn");
    const quickTrackForm = document.getElementById("quickTrackForm");

    // AUTHENTICATION CHECK & PROFILE LOADING

    // Look into browser local storage for our active custom dummy session account
    const savedAccountRaw = localStorage.getItem('dummyTestingAccount');

    if (savedAccountRaw) {
        // Parse account variables mapping
        const userAccount = JSON.parse(savedAccountRaw);
        const fullFirstName = userAccount.firstName || "User";
        const fullLastName = userAccount.lastName || "";

        // 1. Greet the custom registered first name dynamically
        welcomeGreeting.innerText = `Good Evening, ${fullFirstName} ${fullLastName}`;

        // 2. Compute first character text initial for top right account icon avatar
        if (fullFirstName.length > 0) {
            profileAvatar.innerText = fullFirstName.charAt(0).toUpperCase();
        }
    } else {
        // Fallback placeholder credentials if dashboard is loaded directly without signing up
        welcomeGreeting.innerText = "Good Evening, Mc Lloyd Dolorito";
        profileAvatar.innerText = "M";
    }


    // EVENT ACTIONS HANDLERS

    // Simple Alert for the layout search action
    quickTrackForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const trackingNum = quickTrackForm.querySelector("input").value.trim();
        alert(`Searching tracking registry database instances for: ${trackingNum}`);
    });

    // Logout drops and clears user mock sessions
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to log out of your session track?")) {
            // Drop session reference mapping pointers
            localStorage.removeItem('dummyTestingAccount');
            
            // Redirect clean route bounce back to user gate access sign-in screen
            window.location.href = "signin.html";
        }
    });
});