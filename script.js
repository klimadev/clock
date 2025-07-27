    const barFill = document.getElementById("barFill");
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date');
    const hudElement = document.getElementById('hud');

    // Funções de formatação para evitar repetição
    function formatTime(value) {
      return String(value).padStart(2, '0');
    }

    function updateClockAndDate() {
      const now = new Date();
      const h = formatTime(now.getHours());
      const m = formatTime(now.getMinutes());

      // Atualiza os dígitos do relógio com animação
      const newHourTens = h[0];
      const newHourUnits = h[1];
      const newMinuteTens = m[0];
      const newMinuteUnits = m[1];

      const hourTensElement = clockElement.querySelector('.hour-tens');
      const hourUnitsElement = clockElement.querySelector('.hour-units');
      const minuteTensElement = clockElement.querySelector('.minute-tens');
      const minuteUnitsElement = clockElement.querySelector('.minute-units');

      // Função auxiliar para animar dígitos com efeito glitch
      function animateDigit(element, newValue) {
        if (element.textContent !== newValue) {
          const currentText = element.textContent;
          const randomChars = "0123456789ABCDEF!@#$%^&"; // Caracteres para o scramble

          // Animação de glitch/scramble
          gsap.timeline()
            .to(element, { duration: 0.05, opacity: 0.5, textShadow: "0 0 5px rgba(255,255,255,0.7)", 
                           onUpdate: function() { 
                             element.textContent = randomChars.charAt(Math.floor(Math.random() * randomChars.length)); 
                           } 
                         }) // Glitch rápido
            .to(element, { duration: 0.05, opacity: 0.8, textShadow: "none", 
                           onUpdate: function() { 
                             element.textContent = randomChars.charAt(Math.floor(Math.random() * randomChars.length)); 
                           } 
                         }) // Outro glitch
            .to(element, { duration: 0.05, opacity: 0.5, textShadow: "0 0 5px rgba(255,255,255,0.7)", 
                           onUpdate: function() { 
                             element.textContent = randomChars.charAt(Math.floor(Math.random() * randomChars.length)); 
                           } 
                         }) // Terceiro glitch
            .to(element, { duration: 0.1, opacity: 1, textShadow: "none", 
                           onComplete: () => { element.textContent = newValue; } // Seta o valor final
                         });
        }
      }

      animateDigit(hourTensElement, newHourTens);
      animateDigit(hourUnitsElement, newHourUnits);
      animateDigit(minuteTensElement, newMinuteTens);
      animateDigit(minuteUnitsElement, newMinuteUnits);

      // Atualiza a data
      const day = formatTime(now.getDate());
      const month = formatTime(now.getMonth() + 1);
      const year = now.getFullYear();
      dateElement.textContent = `${day}/${month}/${year}`;

      const totalMinutes = h * 60 + +m;
      const percent = (totalMinutes / 1440) * 100;
      barFill.style.width = `${percent}%`;
    }

    // Função para a sequência de boot-up
    function initBootSequence() {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        // Efeito de ruído/glitch na tela (simulado com opacidade do overlay)
        const glitchOverlay = document.createElement('div');
        glitchOverlay.className = 'glitch-overlay';
        document.body.appendChild(glitchOverlay);

        const initialBorderColor = "rgba(0, 255, 204, 0.4)";

        tl.to(glitchOverlay, { opacity: 0.8, duration: 0.05, repeat: 3, yoyo: true, ease: "steps(1)" }) // Flash de ruído
          .to(glitchOverlay, { opacity: 0, duration: 0.2 }, "-=0.05") // Remove o ruído
          .to(hudElement, { opacity: 1, duration: 0.5, ease: "power2.inOut" }) // Liga o HUD
          .fromTo(hudElement, { scale: 0.9, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }) // Efeito de "power-on"
          // Animação de "desenho" da borda do HUD
          .fromTo(hudElement, 
            { boxShadow: "0 0 0 rgba(0, 255, 204, 0)", borderWidth: "0px" },
            { boxShadow: "0 0 15px rgba(0, 255, 204, 0.8)", borderWidth: "2px", duration: 0.5, ease: "power2.out", 
              borderTopColor: initialBorderColor, borderRightColor: initialBorderColor, 
              borderBottomColor: initialBorderColor, borderLeftColor: initialBorderColor 
            }, "<0.2") // Desenha a borda
          .from(clockElement, { y: 20, opacity: 0, duration: 0.7, ease: "back.out(1.7)" }, "-=0.4") // Relógio surge
          .from(dateElement, { y: 20, opacity: 0, duration: 0.7, ease: "back.out(1.7)" }, "-=0.5") // Data surge
          .from(barFill.parentElement, { width: 0, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.4") // Barra surge
          .set(glitchOverlay, { display: "none" }); // Esconde o overlay de glitch após a animação

        // Inicia a atualização do relógio após a animação de boot
        tl.call(() => {
            setInterval(updateClockAndDate, 1000);
            updateClockAndDate();
        });
    }

    // Inicialização da aplicação
    document.addEventListener('DOMContentLoaded', () => {
      // Remove a autoReload por enquanto, focando na sequência de boot e UX
      // autoReload(); 

      // Configura os listeners (nenhum atualmente, pois fullscreen foi removido)

      // Inicia a sequência de boot
      initBootSequence();
    });