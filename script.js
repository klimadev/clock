const barFill = document.getElementById("barFill");
const clockElement = document.getElementById('clock');
const dateElement = document.getElementById('date');
const hudElement = document.getElementById('hud');
const secondsElement = document.getElementById('seconds');
const barContainer = document.getElementById('barContainer');

let animationFrameId; // Para controlar o requestAnimationFrame

// Variáveis para rastrear os últimos valores e evitar animações desnecessárias
let lastHour = -1;
let lastMinute = -1;
let lastSecond = -1;

// --- Funções Auxiliares ---

/**
 * Formata um valor numérico para ter sempre dois dígitos (ex: 5 -> "05").
 * @param {number} value - O valor a ser formatado.
 * @returns {string} O valor formatado como string.
 */
function formatTime(value) {
  return String(value).padStart(2, '0');
}

/**
 * Anima um dígito de um elemento com um efeito glitch.
 * @param {HTMLElement} element - O elemento HTML cujo texto será animado.
 * @param {string} newValue - O novo valor final do texto do elemento.
 */
function animateDigit(element, newValue) {
    if (element.textContent === newValue) return; // Não anima se o valor não mudou

    const randomChars = "0123456789ABCDEF!@#$%^&"; // Caracteres para o scramble
    const glitchColorRgb = getComputedStyle(document.documentElement).getPropertyValue('--glitch-color-rgb').trim();

    gsap.timeline({
        onComplete: () => { element.textContent = newValue; }
    })
    .to(element, { 
        duration: 0.05, 
        opacity: 0.5, 
        textShadow: `0 0 5px rgba(${glitchColorRgb}, 0.7)`, 
        onUpdate: function() { 
            element.textContent = randomChars.charAt(Math.floor(Math.random() * randomChars.length)); 
        } 
    })
    .to(element, { 
        duration: 0.05, 
        opacity: 0.8, 
        textShadow: "none", 
        onUpdate: function() { 
            element.textContent = randomChars.charAt(Math.floor(Math.random() * randomChars.length)); 
        } 
    })
    .to(element, { 
        duration: 0.05, 
        opacity: 0.5, 
        textShadow: `0 0 5px rgba(${glitchColorRgb}, 0.7)`, 
        onUpdate: function() { 
            element.textContent = randomChars.charAt(Math.floor(Math.random() * randomChars.length)); 
        } 
    })
    .to(element, { duration: 0.1, opacity: 1, textShadow: "none" });
}

// --- Funções Principais de Lógica e Renderização ---

/**
 * Atualiza o relógio e a data na interface.
 * Esta função é chamada repetidamente via requestAnimationFrame.
 */
function updateClockAndDate() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  const formattedH = formatTime(h);
  const formattedM = formatTime(m);
  const formattedS = formatTime(s);

  // Animar horas e minutos APENAS se os valores mudaram
  if (h !== lastHour || m !== lastMinute) {
    const hourTensElement = clockElement.querySelector('.hour-tens');
    const hourUnitsElement = clockElement.querySelector('.hour-units');
    const minuteTensElement = clockElement.querySelector('.minute-tens');
    const minuteUnitsElement = clockElement.querySelector('.minute-units');

    if (hourTensElement.textContent !== formattedH[0]) animateDigit(hourTensElement, formattedH[0]);
    if (hourUnitsElement.textContent !== formattedH[1]) animateDigit(hourUnitsElement, formattedH[1]);
    if (minuteTensElement.textContent !== formattedM[0]) animateDigit(minuteTensElement, formattedM[0]);
    if (minuteUnitsElement.textContent !== formattedM[1]) animateDigit(minuteUnitsElement, formattedM[1]);

    lastHour = h;
    lastMinute = m;
  }

  // Animar segundos APENAS se o valor mudou
  if (s !== lastSecond) { 
    animateDigit(secondsElement, formattedS);
  }

  // Atualiza a data apenas quando o segundo for 0 e ele realmente mudou para 0 (início de um novo minuto)
  if ((s === 0 && lastSecond !== 0)) { 
    const day = formatTime(now.getDate());
    const month = formatTime(now.getMonth() + 1);
    const year = now.getFullYear();
    dateElement.textContent = `${day}/${month}/${year}`;
  }
  lastSecond = s; 

  // Atualiza a barra de progresso
  const totalSecondsInDay = (h * 3600) + (m * 60) + s;
  const percent = (totalSecondsInDay / (24 * 3600)) * 100;
  barFill.style.width = `${percent}%`;

  animationFrameId = requestAnimationFrame(updateClockAndDate);
}

/**
 * Executa a sequência de animação de boot-up inicial cinematográfica e abstrata.
 */
function initBootSequence() {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Remove o elemento de texto de pré-boot se por acaso ainda existir do DOM anterior
    const preBootTextElement = document.querySelector('.pre-boot-text');
    if (preBootTextElement) {
        preBootTextElement.remove();
    }

    // Efeito de ruído/glitch na tela
    const glitchOverlay = document.createElement('div');
    glitchOverlay.className = 'glitch-overlay';
    document.body.appendChild(glitchOverlay);

    // Cores obtidas do CSS
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const primaryRgb = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim();
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim(); 
    const glitchColor = getComputedStyle(document.documentElement).getPropertyValue('--glitch-color').trim();

    // Set initial placeholders and hide elements
    gsap.set(document.body, { backgroundColor: "#000" });
    gsap.set([hudElement, glitchOverlay], { opacity: 0, visibility: 'hidden' });
    
    // Set placeholder text for clock and date elements
    clockElement.querySelector('.hour-tens').textContent = '--';
    clockElement.querySelector('.hour-units').textContent = '--';
    clockElement.querySelector('.minute-tens').textContent = '--';
    clockElement.querySelector('.minute-units').textContent = '--';
    secondsElement.textContent = '--';
    dateElement.textContent = '----/--/--';


    // --- Sequência Cinematográfica de Boot-up (Abstrata) --- 

    // Fase 1: Pequeno delay inicial para tela preta
    tl.to({}, { duration: 0.5 }); 

    // Fase 2: Série de glitches e pulsos de energia no fundo e no overlay
    tl.to(glitchOverlay, { opacity: 0.9, backgroundColor: glitchColor, duration: 0.05, repeat: 7, yoyo: true, ease: "steps(1)", visibility: 'visible' }, "startAbstract")
      .to(document.body, { backgroundColor: secondaryColor, duration: 0.08, ease: "power1.inOut", repeat: 6, yoyo: true }, "<0.01") // Pulsos de luz no fundo
      .to(glitchOverlay, { opacity: 0, backgroundColor: "transparent", duration: 0.5, ease: "power2.out" }, ">") // Finaliza o glitch

    // Fase 3: HUD Power-Up com elasticidade e blur-in
      .fromTo(hudElement, 
        { opacity: 0, scale: 0.5, filter: "blur(20px)", y: 50, visibility: 'hidden', 
          boxShadow: `0 0 0 rgba(${primaryRgb}, 0)`, borderWidth: "0px", borderColor: `rgba(${primaryRgb}, 0)` },
        { opacity: 1, scale: 1, filter: "blur(0px)", y: 0, visibility: 'visible', duration: 1.8, ease: "elastic.out(1, 0.5)",
          boxShadow: `0 0 25px rgba(${primaryRgb}, 0.8), inset 0 0 15px rgba(${primaryRgb}, 0.5)`, 
        }, "-=0.8") // HUD aparece com elasticidade e brilho

    // Fase 4: Desenho da borda do HUD com curva suave
      .to(hudElement, { 
          borderWidth: "2px", 
          borderTopColor: primaryColor, borderRightColor: primaryColor, 
          borderBottomColor: primaryColor, borderLeftColor: primaryColor, 
          duration: 1.5, ease: "circ.out" 
      }, "<0.3") // A borda se desenha suavemente

    // Fase 5: Surgimento do Relógio, Data e Barra de Progresso com bounce
      .to([clockElement, dateElement], { y: 0, opacity: 1, visibility: 'visible', duration: 1.5, ease: "back.out(2.0)", stagger: 0.2 }, "-=0.7")
      .to(barContainer, { width: "calc(min(448px, 91.666667%))", opacity: 1, visibility: 'visible', duration: 1.2, ease: "back.out(1.7)" }, "-=0.9")

    // Fase Final: Limpeza
      .set(glitchOverlay, { display: "none" });

    // Inicia a atualização do relógio após a animação de boot completa
    tl.call(() => {
        animationFrameId = requestAnimationFrame(updateClockAndDate);
        // Garante que a data e os segundos sejam carregados na primeira vez (após o placeholder)
        const now = new Date();
        const day = formatTime(now.getDate());
        const month = formatTime(now.getMonth() + 1);
        const year = now.getFullYear();
        dateElement.textContent = `${day}/${month}/${year}`;
        secondsElement.textContent = formatTime(now.getSeconds());
    });
}

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
  initBootSequence();
});