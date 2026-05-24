// --- Canvas Starry Background ---
        const canvas = document.getElementById('starCanvas');
        const ctx = canvas.getContext('2d');
        let particles = [];
        let meteors = [];
        let animationFrameId;
        
        let mouseX = -1000;
        let mouseY = -1000;
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const STAR_COLORS = ['#d4a853', '#f0e6ff', 'rgba(212, 168, 83, 0.8)', 'rgba(240, 230, 255, 0.8)'];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        class Particle {
            constructor(layer) {
                this.layer = layer; // 'near' or 'far'
                this.reset(true);
            }

            reset(initial = false) {
                this.x = Math.random() * canvas.width;
                this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
                
                if (this.layer === 'near') {
                    this.size = Math.random() * 2 + 1.5; // 1.5 - 3.5
                    this.baseAlpha = Math.random() * 0.5 + 0.5; // 0.5 - 1.0
                    this.speedY = Math.random() * 0.6 + 0.3; // 0.3 - 0.9
                } else {
                    this.size = Math.random() * 1.5 + 0.5; // 0.5 - 2.0
                    this.baseAlpha = Math.random() * 0.3 + 0.1; // 0.1 - 0.4
                    this.speedY = Math.random() * 0.2 + 0.1; // 0.1 - 0.3
                }
                
                this.color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
                this.period = Math.random() * 4000 + 2000; // 2-6 seconds
                this.timeOffset = Math.random() * Math.PI * 2;
                this.glow = this.layer === 'near' && Math.random() < 0.4;
                this.isGolden = this.color === '#d4a853' || this.color === 'rgba(212, 168, 83, 0.8)';
            }

            update(time) {
                this.y -= this.speedY;
                if (this.y < -10) {
                    this.reset();
                }
                
                // Mouse interaction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 120) {
                    this.x += dx * 0.015;
                    this.y += dy * 0.015;
                    if (this.isGolden) this.glow = true;
                } else {
                    // Natural horizontal drift
                    this.x += Math.sin(time / 2000 + this.timeOffset) * 0.15;
                }

                // Sine wave opacity
                const wave = Math.sin(time / this.period * Math.PI * 2 + this.timeOffset);
                this.alpha = this.baseAlpha + wave * (this.layer === 'near' ? 0.3 : 0.1);
                if (this.alpha < 0) this.alpha = 0;
                if (this.alpha > 1) this.alpha = 1;
            }

            draw(ctx) {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                
                if (this.glow) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = this.color;
                }
                
                ctx.fill();
                ctx.restore();
            }
        }
        
        class Meteor {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width * 1.5;
                this.y = -100;
                this.speedX = -(Math.random() * 2 + 2);
                this.speedY = Math.random() * 2 + 2;
                this.length = Math.random() * 80 + 40;
                this.opacity = 0;
                this.state = 'waiting';
                this.waitTime = Math.random() * 5000 + 2000;
                this.lastTime = performance.now();
            }
            update(time) {
                if (this.state === 'waiting') {
                    if (time - this.lastTime > this.waitTime) {
                        this.state = 'falling';
                        this.lastTime = time;
                    }
                } else if (this.state === 'falling') {
                    this.x += this.speedX;
                    this.y += this.speedY;
                    this.opacity = Math.min(1, this.opacity + 0.05);
                    if (this.x < -200 || this.y > canvas.height + 200) {
                        this.reset();
                        this.lastTime = time;
                    }
                }
            }
            draw(ctx) {
                if (this.state !== 'falling') return;
                ctx.save();
                ctx.globalAlpha = this.opacity;
                const grad = ctx.createLinearGradient(this.x, this.y, this.x - this.speedX * 10, this.y - this.speedY * 10);
                grad.addColorStop(0, 'rgba(212, 168, 83, 1)');
                grad.addColorStop(1, 'rgba(212, 168, 83, 0)');
                
                ctx.beginPath();
                ctx.strokeStyle = grad;
                ctx.lineWidth = 2;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.speedX * 10, this.y - this.speedY * 10);
                ctx.stroke();
                
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#d4a853';
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        function initParticles() {
            particles = [];
            meteors = [];
            const count = (typeof AppSettings !== 'undefined' ? AppSettings.particles : 250);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(i < count * 0.3 ? 'near' : 'far'));
            }
            for (let i = 0; i < 3; i++) {
                meteors.push(new Meteor());
            }
        }

        function initMysticSymbols() {
            const container = document.getElementById('mysticSymbols');
            if (!container) return;
            container.innerHTML = '';
            const symbols = ['✣', '✧', '☊', '☾', '☿'];
            const count = 15;
            const minDist = 180;
            mysticSymbolsData = [];
            const placed = [];
            for (let i = 0; i < count; i++) {
                const el = document.createElement('div');
                el.className = 'mystic-symbol';
                el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                const size = Math.random() * 2 + 1;
                el.style.fontSize = `${size}rem`;
                container.appendChild(el);
                
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                
                let px, py;
                let attempts = 0;
                const maxAttempts = 200;
                do {
                    px = Math.random() * (vw - 80) + 40;
                    py = Math.random() * (vh - 80) + 40;
                    attempts++;
                } while (attempts < maxAttempts && placed.some(p => {
                    const dx = p.x - px;
                    const dy = p.y - py;
                    return Math.sqrt(dx * dx + dy * dy) < minDist;
                }));
                placed.push({ x: px, y: py });
                
                mysticSymbolsData.push({
                    el: el,
                    x: px,
                    y: py,
                    vx: (Math.random() - 0.5) * 0.25,
                    vy: (Math.random() - 0.5) * 0.25,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 0.04,
                    swayPhase: Math.random() * Math.PI * 2,
                    swaySpeed: Math.random() * 0.003 + 0.002,
                    swayAmp: Math.random() * 3 + 1
                });
            }
        }

        let mysticSymbolsData = [];

        function animateMysticSymbols(time) {
            if (!mysticSymbolsData.length) return;
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const repulsionDist = 160;
            const repulsionStrength = 0.1;
            const maxSpeed = 0.55;
            
            mysticSymbolsData.forEach(s => {
                s.x += s.vx;
                s.y += s.vy;
                s.rotation += s.rotationSpeed;
                
                if (Math.random() < 0.003) {
                    s.vx += (Math.random() - 0.5) * 0.2;
                    s.vy += (Math.random() - 0.5) * 0.2;
                }
                
                if (s.x < -40) s.x = vw + 30;
                if (s.x > vw + 40) s.x = -30;
                if (s.y < -40) s.y = vh + 30;
                if (s.y > vh + 40) s.y = -30;
            });
            
            for (let i = 0; i < mysticSymbolsData.length; i++) {
                for (let j = i + 1; j < mysticSymbolsData.length; j++) {
                    const a = mysticSymbolsData[i];
                    const b = mysticSymbolsData[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < repulsionDist && dist > 0) {
                        const force = (repulsionDist - dist) / repulsionDist * repulsionStrength;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        a.vx += nx * force;
                        a.vy += ny * force;
                        b.vx -= nx * force;
                        b.vy -= ny * force;
                    }
                }
            }
            
            mysticSymbolsData.forEach(s => {
                const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
                if (speed > maxSpeed) {
                    s.vx = (s.vx / speed) * maxSpeed;
                    s.vy = (s.vy / speed) * maxSpeed;
                }
            });
            
            mysticSymbolsData.forEach(s => {
                const swayX = Math.sin(time * s.swaySpeed + s.swayPhase) * s.swayAmp;
                const swayY = Math.cos(time * s.swaySpeed * 0.7 + s.swayPhase + 1) * s.swayAmp * 0.8;
                s.el.style.transform = `translate(${s.x}px, ${s.y}px) translate(${swayX}px, ${swayY}px) rotate(${s.rotation}deg)`;
            });
        }

        function drawConnections() {
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                if (particles[i].layer === 'far') continue; // only connect near particles to save performance
                for (let j = i + 1; j < particles.length; j++) {
                    if (particles[j].layer === 'far') continue;
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 8100) { // 90 * 90
                        const dist = Math.sqrt(distSq);
                        const opacity = (1 - dist / 90) * 0.15;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(240, 230, 255, ${opacity})`;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }
        
        function drawNebula(ctx, time) {
            const cx1 = canvas.width/2 + Math.sin(time/6000)*300;
            const cy1 = canvas.height/2 + Math.cos(time/5000)*200;
            const gradient1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, canvas.width/1.5);
            gradient1.addColorStop(0, 'rgba(212, 168, 83, 0.06)');
            gradient1.addColorStop(1, 'rgba(30, 16, 64, 0)');
            
            ctx.fillStyle = gradient1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const cx2 = canvas.width/3 + Math.cos(time/7000)*200;
            const cy2 = canvas.height/3 + Math.sin(time/4000)*300;
            const gradient2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, canvas.width/2);
            gradient2.addColorStop(0, 'rgba(240, 230, 255, 0.03)');
            gradient2.addColorStop(1, 'rgba(30, 16, 64, 0)');
            
            ctx.fillStyle = gradient2;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        function animateCanvas(time) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            drawNebula(ctx, time);
            
            particles.forEach(p => {
                p.update(time);
                p.draw(ctx);
            });
            
            drawConnections();
            
            meteors.forEach(m => {
                m.update(time);
                m.draw(ctx);
            });

            animateMysticSymbols(time);
            
            animationFrameId = requestAnimationFrame(animateCanvas);
        }
