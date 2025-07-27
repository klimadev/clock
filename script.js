// --- Canvas Network Animation ---
const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');

let nodes = [];
let particles = [];
const maxNodes = 80;
const connectDistance = 150;
const particleSpeed = 0.5;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.fill();
    }
}

class Particle {
    constructor(startNode) {
        this.x = startNode.x;
        this.y = startNode.y;
        this.startNode = startNode;
        this.targetNode = null;
        this.setNewTarget();
        this.progress = 0;
    }

    setNewTarget() {
        let potentialTargets = nodes.filter(n => n !== this.startNode);
        if (potentialTargets.length > 0) {
            this.targetNode = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
        } else {
            this.targetNode = this.startNode; // fallback
        }
        this.progress = 0;
        this.startNode = this.targetNode;
    }

    update() {
        if (!this.targetNode) {
            this.setNewTarget();
            return;
        }

        let dx = this.targetNode.x - this.x;
        let dy = this.targetNode.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            this.progress += particleSpeed;
            let targetDx = this.targetNode.x - this.startNode.x;
            let targetDy = this.targetNode.y - this.startNode.y;
            let totalDist = Math.sqrt(targetDx*targetDx + targetDy*targetDy);
            
            if (totalDist > 0) {
                let currentDist = this.progress;
                let ratio = currentDist / totalDist;
                
                if (ratio >= 1) {
                    this.x = this.targetNode.x;
                    this.y = this.targetNode.y;
                    this.setNewTarget();
                } else {
                    this.x = this.startNode.x + targetDx * ratio;
                    this.y = this.startNode.y + targetDy * ratio;
                }
            }
        } else {
            this.setNewTarget();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function initNetwork() {
    resizeCanvas();
    nodes = [];
    particles = [];
    for (let i = 0; i < maxNodes; i++) {
        nodes.push(new Node(Math.random() * canvas.width, Math.random() * canvas.height));
    }
    for (let i = 0; i < nodes.length / 5; i++) {
        particles.push(new Particle(nodes[Math.floor(Math.random()*nodes.length)]));
    }
}

function animateNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(10, 42, 77, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    nodes.forEach(node => {
        node.update();
        node.draw();
    });

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            let dx = nodes[i].x - nodes[j].x;
            let dy = nodes[i].y - nodes[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectDistance) {
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = `rgba(0, 255, 255, ${1 - dist / connectDistance})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animateNetwork);
}

window.addEventListener('resize', resizeCanvas);
// --- Fim da Animação da Rede Canvas ---

// --- Seletores de Elementos ---
const hudElement = document.getElementById('hud');
const clockElement = document.getElementById('clock');
const dayOfWeekElement = document.getElementById('day-of-week');
const fullDateElement = document.getElementById('full-date');
const barContainer = document.getElementById('barContainer');
const barFill = document.getElementById("barFill");

let animationFrameId;
let lastDay = -1;

// --- Funções Auxiliares ---
function formatTime(value) {
    return String(value).padStart(2, '0');
}

/**
 * FIX: Adiciona &nbsp; para espaços para renderização correta no HTML.
 */
function createCharSpans(text) {
    return text.split('').map(char => `<span class="char" style="display: inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
}

function getFormattedDate() {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase();
    const day = now.getDate();
    const month = now.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase();
    const year = now.getFullYear();
    return {
        dayOfWeek: dayOfWeek.replace('-FEIRA', ''),
        fullDate: `${formatTime(day)} DE ${month} DE ${year}`
    };
}

/**
 * Animação "Tick" de alta qualidade para cada dígito.
 * Imita um display de rolagem mecânica.
 */
function animateDigit(element, newValue) {
    if (element.textContent === newValue) return;

    gsap.timeline()
        .to(element, {
            duration: 0.15,
            y: '10px',
            opacity: 0,
            ease: "power2.in",
            onComplete: () => {
                element.textContent = newValue;
            }
        })
        .fromTo(element, {
            y: '-10px',
            opacity: 0
        }, {
            duration: 0.15,
            y: '0px',
            opacity: 1,
            ease: "power2.out"
        });
}


// --- Funções Principais ---
function updateClockAndDate() {
    const now = new Date();
    
    // Atualiza Relógio
    const h = formatTime(now.getHours());
    const m = formatTime(now.getMinutes());
    const s = formatTime(now.getSeconds());
    const clockDisplayString = `${h}:${m}.${s}`;
    const clockChars = clockElement.querySelectorAll('.char');
    for (let i = 0; i < clockChars.length; i++) {
        if (!clockChars[i].classList.contains('separator')) {
            animateDigit(clockChars[i], clockDisplayString[i]);
        }
    }

    // Atualiza Barra de Progresso
    const progress = ((s * 1000 + now.getMilliseconds()) / 60000) * 100;
    gsap.to(barFill, { width: `${progress}%`, ease: "none" });

    // Atualiza Data (apenas à meia-noite)
    const currentDay = now.getDate();
    if (currentDay !== lastDay) {
        updateDateAnimated();
        lastDay = currentDay;
    }

    animationFrameId = requestAnimationFrame(updateClockAndDate);
}

/**
 * Animação de "desintegração" para a data antiga e "revelação" para a nova.
 */
function updateDateAnimated() {
    const oldDayOfWeekChars = dayOfWeekElement.querySelectorAll('.char');
    const oldFullDateChars = fullDateElement.querySelectorAll('.char');
    const { dayOfWeek, fullDate } = getFormattedDate();

    const tl = gsap.timeline();

    if (oldDayOfWeekChars.length > 0 || oldFullDateChars.length > 0) {
        tl.to([oldDayOfWeekChars, oldFullDateChars], {
            duration: 0.5,
            autoAlpha: 0,
            filter: "blur(5px)",
            y: 20,
            stagger: { each: 0.02, from: "random" },
            ease: "power2.in"
        });
    }

    tl.call(() => {
        dayOfWeekElement.innerHTML = createCharSpans(dayOfWeek);
        fullDateElement.innerHTML = createCharSpans(fullDate);
        
        const newDayOfWeekChars = dayOfWeekElement.querySelectorAll('.char');
        const newFullDateChars = fullDateElement.querySelectorAll('.char');
        
        gsap.set([newDayOfWeekChars, newFullDateChars], { autoAlpha: 0, y: -15, filter: "blur(3px)" });
        gsap.to(newDayOfWeekChars, { 
            duration: 1, 
            autoAlpha: 1, 
            y: 0, 
            filter: "blur(0px)",
            stagger: 0.05, 
            ease: "elastic.out(1, 0.75)" 
        });
        gsap.to(newFullDateChars, { 
            duration: 1, 
            autoAlpha: 1, 
            y: 0, 
            filter: "blur(0px)",
            stagger: 0.04, 
            ease: "elastic.out(1, 0.75)", 
            delay: 0.2 
        });
    });
}


function initBootSequence() {
    // --- 1. Preparação (Estado Inicial) ---
    gsap.set(hudElement, { autoAlpha: 0, scale: 0.9 });
    gsap.set(barContainer, { autoAlpha: 0 });
    gsap.set(barFill, { width: 0 });
    
    const { dayOfWeek, fullDate } = getFormattedDate();
    dayOfWeekElement.innerHTML = createCharSpans(dayOfWeek);
    fullDateElement.innerHTML = createCharSpans(fullDate);
    lastDay = new Date().getDate();
    
    const clockChars = clockElement.querySelectorAll('.char');
    const dayOfWeekChars = dayOfWeekElement.querySelectorAll('.char');
    const fullDateChars = fullDateElement.querySelectorAll('.char');

    gsap.set([...clockChars, ...dayOfWeekChars, ...fullDateChars], { autoAlpha: 0, y: 15, filter: "blur(5px)" });

    // --- 2. Timeline Principal da Animação ---
    const tl = gsap.timeline({ 
        defaults: { ease: "power2.out" },
        onComplete: () => {
             animationFrameId = requestAnimationFrame(updateClockAndDate);
        }
    });

    // Staging e Antecipação do HUD
    tl.to(hudElement, {
        duration: 1.2,
        autoAlpha: 1,
        scale: 1,
        ease: "back.out(1.7)"
    }, "start");

    // Revelação do Relógio (Follow Through e Overlapping Action)
    tl.to(clockChars, {
        duration: 1.5,
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: { each: 0.08, from: "start" },
        ease: "elastic.out(1, 0.75)"
    }, "start+=0.4");

    // Revelação da Data (Ação Secundária)
    tl.to(dayOfWeekChars, {
        duration: 1.2,
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.05,
        ease: "elastic.out(1, 0.8)"
    }, "start+=0.9");

    tl.to(fullDateChars, {
        duration: 1.2,
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.04,
        ease: "elastic.out(1, 0.8)"
    }, "start+=1.1");
    
    // Animação da Barra de "Calibração"
    tl.to(barContainer, { autoAlpha: 1, duration: 0.5 }, "start+=1.8")
      .to(barFill, {
          duration: 2.0,
          width: "100%", 
          ease: "elastic.out(1, 0.75)"
      }, "start+=1.8");
      
    // Preenche a hora inicial (não animada, para preparar para o "tick")
    tl.call(() => {
        const now = new Date();
        const h = formatTime(now.getHours());
        const m = formatTime(now.getMinutes());
        const s = formatTime(now.getSeconds());
        const clockDisplayString = `${h}:${m}.${s}`;
        for (let i = 0; i < clockChars.length; i++) {
            clockChars[i].textContent = clockDisplayString[i];
        }
    }, null, ">-0.5"); // Ocorre um pouco antes do fim da animação
}

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
  initNetwork();
  animateNetwork();
  initBootSequence();
});
