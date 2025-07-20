const logs = [
      "[BOOT] BIOS Boot OK.",
      "[INFO] CyberSec BIOS v2.4 initialized.",
      "[INFO] Executing POST: Success.",
      "[INFO] OS: Arch Linux 64-bit",
      "[INFO] Running 'yay -Syu'...",
      "[SUCCESS] 21 packages updated.",
      "[ALERT] Unknown traffic from 192.168.0.24 blocked.",
      "[OSINT] New exposure found on Pastebin.",
      "[INFO] Netflow active on enp0s25.",
      "[SCAN] Port 22 blocked for 5.219.202.1",
      "[ALERT] Brute-force SSH attempt mitigated.",
      "[ANALYSIS] No rootkits found.",
      "[SENSOR] CPU Temp: 61°C | RAM: 67%",
      "[SENSOR] Fan Speed: 3400RPM",
      "[SENSOR] Voltage: Normal",
      "[OSINT] Indexed Telegram dump found (User DB).",
      "[AUDIT] 92 system files verified.",
      "[INFO] Next scan in 3 mins...",
      "[MONITOR] Real-time logs streaming...",
      "[ALERT] Suspicious behavior: curl from guest user."
    ];

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    shuffle(logs);

    let logIndex = 0;
    const logDisplay = document.getElementById('logDisplay');
    const barFill = document.getElementById("barFill");

    function displayLogs() {
      if (logIndex >= logs.length) {
        logIndex = 0;
        logDisplay.innerHTML = '';
        shuffle(logs);
      }
      
      const fullLine = logs[logIndex];
      const lineEl = document.createElement('span');
      lineEl.classList.add('log-line');
      if (fullLine.includes('[ALERT]')) {
        lineEl.classList.add('alert');
      }
      lineEl.textContent = fullLine;
      logDisplay.appendChild(lineEl);
      logDisplay.scrollTop = logDisplay.scrollHeight;
      
      logIndex++;
      setTimeout(displayLogs, 1000);
    }

    function updateClockAndDate() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      document.getElementById('clock').textContent = `${h}:${m}`;

      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      document.getElementById('date').textContent = `${day}/${month}/${year}`;

      const totalMinutes = h * 60 + +m;
      const percent = (totalMinutes / 1440) * 100;
      barFill.style.width = `${percent}%`;
    }

    setInterval(updateClockAndDate, 1000);
    updateClockAndDate();
    displayLogs();

    document.addEventListener("click", function () {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    });

    function autoReload() {
      setTimeout(() => {
        location.reload();
      }, 3600000);
    }

    autoReload();