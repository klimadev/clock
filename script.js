    const barFill = document.getElementById("barFill");    function updateClockAndDate() {
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