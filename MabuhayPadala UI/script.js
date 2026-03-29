document.getElementById('shipmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const trackNum = "MPC-2024-" + Math.floor(10000 + Math.random() * 90000);
    
    const card = document.querySelector('.form-card');
    card.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="background: #dcfce7; color: #16a34a; width: 60px; height: 60px; line-height: 60px; border-radius: 50%; margin: 0 auto 20px; font-size: 30px;">✓</div>
            <h2 style="margin-bottom: 10px;">Booking Submitted!</h2>
            <p style="color: #6b7280;">Your tracking number:</p>
            <h3 style="color: #2563eb; font-size: 1.5rem; margin: 10px 0;">${trackNum}</h3>
            <p style="font-size: 0.9rem; color: #6b7280;">Our staff will verify your payment. You'll receive updates via SMS.</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; border: 1px solid #ddd; background: none; border-radius: 5px; cursor: pointer;">Book Another</button>
        </div>
    `;
});