// neuro-bg.js - Neural Network Canvas Background

const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: null, y: null, radius: 100 };

// Resize canvas dynamically
function resize() {
    // Canvas should match its parent mobile-container's size
    const container = canvas.parentElement;
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);

// Mouse interactions
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Particle Class (Neuron)
class Neuron {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
        this.color = Math.random() > 0.5 ? '#6366f1' : '#8b5cf6'; // Theme colors
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
    }

    update() {
        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction (slight attract/repel)
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                // Subtle Repel
                this.x -= dx * 0.01;
                this.y -= dy * 0.01;
            }
        }
    }
}

// Init Network
function initNetwork() {
    resize();
    particles = [];
    // Adjust number of neurons based on screen size (perf)
    let numNeurons = Math.floor((width * height) / 8000);
    // Hard cap for mobile performance
    if (numNeurons > 60) numNeurons = 60;
    
    for (let i = 0; i < numNeurons; i++) {
        particles.push(new Neuron());
    }
    animate();
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);

    // Draw lines (synapses) between close neurons
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Connect if close
            if (distance < 90) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(99, 102, 241, ${1 - distance / 90})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', initNetwork);
