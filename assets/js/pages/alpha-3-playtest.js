document.addEventListener('DOMContentLoaded', function() {
    const targetDate = new Date(2026, 2, 5, 12, 0, 0); // February 05, 2026 at 12:00:00 UTC

    // Initialize variables for DOM elements
    const countdownTitle = document.querySelector('.countdown-title');
    const countdownSubtitle = document.querySelector('.countdown-subtitle');
    const countdownTimer = document.querySelector('.countdown-timer');
    const speculationNotice = document.getElementById('speculationNotice');
    const closeNoticeBtn = document.getElementById('closeNotice');

    // Show notification popup
    function showNotification() {
        // Only show if not previously dismissed
        if (!localStorage.getItem('noticeDismissed')) {
            speculationNotice.style.display = 'flex';
        }
    }

    // Close notification popup
    function closeNotification() {
        speculationNotice.style.display = 'none';
        localStorage.setItem('noticeDismissed', 'true');
    }

    // Event listeners for notification
    closeNoticeBtn.addEventListener('click', closeNotification);

    // Initialize timer display mode
    let simpleCountdownMode = true;

    // Track typed characters for "alpha3"
    let typedChars = [];
    document.addEventListener('keydown', function(e) {
        typedChars.push(e.key.toLowerCase());
        if (typedChars.length > 6) {
            typedChars.shift();
        }
        if (typedChars.join('').includes('alpha3')) {
            toggleCountdownMode();
            typedChars = [];
        }
    });

    // Function to toggle between simple and detailed countdown
    function toggleCountdownMode() {
        simpleCountdownMode = !simpleCountdownMode;

        if (simpleCountdownMode) {
            // Switch to simple mode
            countdownTitle.classList.add('hidden');
            countdownSubtitle.classList.add('hidden');
            countdownTimer.innerHTML = `
        <div class="countdown-item">
          <div class="countdown-value" id="seconds">00</div>
        </div>
      `;
        } else {
            // Switch to detailed mode
            countdownTitle.classList.remove('hidden');
            countdownSubtitle.classList.remove('hidden');
            countdownTimer.innerHTML = `
        <div class="countdown-item">
          <div class="countdown-value" id="months">00</div>
          <div class="countdown-label">Months</div>
        </div>
        <div class="countdown-item">
          <div class="countdown-value" id="days">00</div>
          <div class="countdown-label">Days</div>
        </div>
        <div class="countdown-item">
          <div class="countdown-value" id="hours">00</div>
          <div class="countdown-label">Hours</div>
        </div>
        <div class="countdown-item">
          <div class="countdown-value" id="minutes">00</div>
          <div class="countdown-label">Minutes</div>
        </div>
        <div class="countdown-item">
          <div class="countdown-value" id="seconds">00</div>
          <div class="countdown-label">Seconds</div>
        </div>
      `;
        }

        // Update immediately after toggle
        updateCountdown();
    }

    // Update the countdown every second
    const countdownInterval = setInterval(updateCountdown, 1000);

    // Initial call to display countdown immediately
    updateCountdown();

    // Show notification
    showNotification();

    function updateCountdown() {
        const now = new Date();
        let difference = targetDate - now;
        let isPast = false;

        // If the countdown is over, switch to counting up
        if (difference <= 0) {
            isPast = true;
            difference = Math.abs(difference);
        }

        if (simpleCountdownMode) {
            // Simple mode - just show total seconds
            const totalSeconds = Math.floor(difference / 1000);
            document.getElementById('seconds').textContent = totalSeconds.toString().padStart(2, '0');
        } else {
            // Detailed mode - show all units
            const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30.44));
            const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            // Update the display
            const monthsElement = document.getElementById('months');
            const daysElement = document.getElementById('days');
            const hoursElement = document.getElementById('hours');
            const minutesElement = document.getElementById('minutes');
            const secondsElement = document.getElementById('seconds');

            if (monthsElement) monthsElement.textContent = months.toString().padStart(2, '0');
            if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
            if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
            if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
            if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
        }
    }
});