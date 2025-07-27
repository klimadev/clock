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
        this.startNode = this.targetNode; // O próximo início será o alvo atual
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
    for (let i = 0; i < nodes.length / 5; i++) { // Criar um número de partículas proporcional aos nós
        particles.push(new Particle(nodes[Math.floor(Math.random()*nodes.length)]));
    }
}

function animateNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fundo azul
    ctx.fillStyle = '#0A2A4D';
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

const barFill = document.getElementById("barFill");
const clockElement = document.getElementById('clock');
const dateElement = document.getElementById('date');
const hudElement = document.getElementById('hud');
const clockChars = clockElement.querySelectorAll('.char');
const dateChars = dateElement.querySelectorAll('.char');
const barContainer = document.getElementById('barContainer');

let animationFrameId; // Para controlar o requestAnimationFrame

let lastDay = -1; // Rastreia o dia para atualizar a data apenas uma vez

// --- Funções Auxiliares ---
function formatTime(value) {
  return String(value).padStart(2, '0');
}

/**
 * Anima um dígito com um efeito "scramble" (embaralhamento).
 * Ideal para a animação de boot inicial.
 */
function scrambleDigit(element, newValue) {
    if (element.textContent === newValue) return;

    const randomChars = "1234567890";
    const tl = gsap.timeline();
    
    tl.to(element, {
        duration: 0.03,
        repeat: 4,
        onUpdate: function() {
            element.textContent = randomChars[Math.floor(Math.random() * randomChars.length)];
        },
        ease: "steps(1)"
    }).to(element, {
        duration: 0.05,
        onStart: () => { element.textContent = newValue; },
        ease: "steps(1)"
    });
}

/**
 * Anima um dígito com um efeito de "flicker" (piscar) sutil.
 * Ideal para atualizações contínuas.
 */
function animateDigit(element, newValue) {
    if (element.textContent === newValue) return;

    gsap.to(element, {
        duration: 0.1,
        opacity: 0,
        ease: "power2.in",
        onComplete: () => {
            element.textContent = newValue;
            gsap.to(element, {
                duration: 0.1,
                opacity: 1,
                ease: "power2.out"
            });
        }
    });
}

// --- Funções Principais ---
function updateClockAndDate() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    
    const timeString = `${formatTime(h)}${formatTime(m)}${formatTime(s)}`;
    const clockDisplayString = `${formatTime(h)}:${formatTime(m)}.${formatTime(s)}`;
    
    for (let i = 0; i < clockChars.length; i++) {
        if (clockChars[i].textContent !== clockDisplayString[i]) {
            if (clockChars[i].classList.contains('separator')) {
                clockChars[i].textContent = clockDisplayString[i];
            } else {
                animateDigit(clockChars[i], clockDisplayString[i]);
            }
        }
    }

    const currentDay = now.getDate();
    if (currentDay !== lastDay) {
        const day = formatTime(currentDay);
        const month = formatTime(now.getMonth() + 1);
        const year = now.getFullYear();
        const dateString = `${day}/${month}/${year}`;
        
        for (let i = 0; i < dateChars.length; i++) {
             dateChars[i].textContent = dateString[i];
        }
        lastDay = currentDay;
    }

    const progress = ((s * 1000 + now.getMilliseconds()) / 60000) * 100;
    gsap.to(barFill, { width: `${progress}%`, ease: "none" });

    animationFrameId = requestAnimationFrame(updateClockAndDate);
}

/**
 * Executa a sequência de animação de boot-up inicial cinematográfica e abstrata.
 */
function initBootSequence() {
    const tl = gsap.timeline({ 
        defaults: { ease: "power2.out" },
        onComplete: () => {
             animationFrameId = requestAnimationFrame(updateClockAndDate);
        }
    });

    // --- Sequência "Diagnóstico e Calibração" ---
    
    // 1. Estado Inicial: HUD com escala reduzida e invisível, para a antecipação.
    gsap.set(hudElement, { 
        autoAlpha: 0, // Controla opacity e visibility
        scale: 0.9, 
        border: "1px solid rgba(0, 255, 255, 0)",
        boxShadow: "0 0 0px rgba(0, 255, 255, 0), inset 0 0 0px rgba(0, 255, 255, 0)"
    });
    gsap.set([clockElement, dateElement], { opacity: 1, visibility: 'visible' }); // Mantém containers visíveis
    gsap.set([...clockChars, ...dateChars], { autoAlpha: 0, y: 15, filter: "blur(5px)" });
    gsap.set(barContainer, { autoAlpha: 0 });
    gsap.set(barFill, { width: 0 });

    // 2. Animação do HUD com "Overshoot"
    tl.to(hudElement, {
        duration: 1.2, // Um pouco mais rápido para um "pop" mais nítido
        autoAlpha: 1,
        scale: 1,
        borderColor: "rgba(0, 255, 255, 0.5)",
        boxShadow: "0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.2)",
        ease: "back.out(1.7)" // Efeito "pop" que passa e volta
    }, "start");

    // 3. "Streaming" do Relógio com Efeito Elástico
    tl.to(clockChars, {
        duration: 1.5, // Duração maior para dar tempo para o elástico "assentar"
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: {
            each: 0.1,
            from: "start"
        },
        ease: "elastic.out(1, 0.75)" // Ease elástica pronunciada
    }, "start+=0.3"); // Inicia um pouco antes

    // 4. "Streaming" da Data com Efeito Elástico
    tl.to(dateChars, {
        duration: 1.5,
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: {
            each: 0.08,
            from: "start"
        },
        ease: "elastic.out(1, 0.75)"
    }, "start+=0.8"); // Ajuste de tempo para melhor encenação
    
    // 5. Barra de "Calibração"
    tl.to(barContainer, { autoAlpha: 1, duration: 0.5 }, "start+=1.5")
      .to(barFill, {
          duration: 2.0, // Duração maior para o efeito elástico
          width: "100%", 
          ease: "elastic.out(1, 0.75)"
      }, "start+=1.5"); // Ajuste de tempo para melhor encenação
      
    // 6. Preencher com a hora inicial usando a animação SCRAMBLE
    tl.call(() => {
        const now = new Date();
        const h = formatTime(now.getHours());
        const m = formatTime(now.getMinutes());
        const s = formatTime(now.getSeconds());
        const clockDisplayString = `${h}:${m}.${s}`;
        
        for (let i = 0; i < clockChars.length; i++) {
            if (!clockChars[i].classList.contains('separator')) {
                scrambleDigit(clockChars[i], clockDisplayString[i]);
            }
        }

        const day = formatTime(now.getDate());
        const month = formatTime(now.getMonth() + 1);
        const year = now.getFullYear();
        const dateString = `${day}/${month}/${year}`;
        for (let i = 0; i < dateChars.length; i++) {
             if (dateChars[i].textContent !== dateString[i]) {
                scrambleDigit(dateChars[i], dateString[i]);
             }
        }
        lastDay = now.getDate();
    }, null, "start+=1.0"); // Inicia o scramble durante a animação de boot
}

// --- Inicialização da Aplicação ---
document.addEventListener('DOMContentLoaded', () => {
  initNetwork();
  animateNetwork();
  initBootSequence();
});