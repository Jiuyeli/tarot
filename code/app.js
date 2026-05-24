// --- Preload & Settings ---
// --- Preload Assets ---
        (function preloadAssets() {
            const imagePaths = new Set();
            TAROT_DECK.forEach(c => imagePaths.add('graph/' + c.imgName));
            imagePaths.add('graph/背面牌.jpg');
            
            const audioPath = 'sound_effect/first_light_particles_0.wav';
            
            const totalAssets = imagePaths.size + 1; // +1 for audio
            let loadedCount = 0;
            let hasError = false;
            
            const bar = document.getElementById('preloadBar');
            const text = document.getElementById('preloadText');
            const btn = document.getElementById('preloadStartBtn');
            const preloadScreen = document.getElementById('preloadScreen');
            
            function updateProgress() {
                const percent = Math.floor((loadedCount / totalAssets) * 100);
                bar.style.width = percent + '%';
                text.textContent = `Connecting to the Universe... ${percent}%`;
                
                if (loadedCount >= totalAssets) {
                    text.textContent = "The cards are ready.";
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    btn.style.transform = 'translateY(0)';
                }
            }
            
            function handleLoad() {
                loadedCount++;
                updateProgress();
            }
            
            function handleError() {
                loadedCount++;
                hasError = true;
                updateProgress();
            }

            imagePaths.forEach(src => {
                const img = new Image();
                img.onload = handleLoad;
                img.onerror = handleError;
                img.src = src;
            });
            
            const audio = new Audio();
            audio.oncanplaythrough = handleLoad;
            audio.onerror = handleError;
            audio.src = audioPath;
            audio.load();
            
            // Fallback timeout just in case events don't fire on mobile
            setTimeout(() => {
                if (loadedCount < totalAssets) {
                    loadedCount = totalAssets;
                    updateProgress();
                }
            }, 10000); // 10 seconds max wait
            
            btn.addEventListener('click', () => {
                preloadScreen.style.opacity = '0';
                preloadScreen.style.pointerEvents = 'none';
                setTimeout(() => {
                    preloadScreen.style.display = 'none';
                    const entryOverlay = document.getElementById('entryNoticeOverlay');
                    entryOverlay.style.display = 'flex';
                    const entryBtn = document.getElementById('entryStartBtn');
                    entryBtn.textContent = '开启塔罗之旅（3s）';
                    let count = 3;
                    const countdown = setInterval(() => {
                        count--;
                        if (count <= 0) {
                            clearInterval(countdown);
                            entryBtn.textContent = '开启塔罗之旅';
                            entryBtn.disabled = false;
                            entryBtn.classList.add('ready');
                        } else {
                            entryBtn.textContent = `开启塔罗之旅（${count}s）`;
                        }
                    }, 1000);
                }, 600);
            });

            document.getElementById('entryStartBtn').addEventListener('click', () => {
                if (document.getElementById('entryStartBtn').disabled) return;
                const entryOverlay = document.getElementById('entryNoticeOverlay');
                entryOverlay.style.opacity = '0';
                entryOverlay.style.transition = 'opacity 0.4s ease';
                setTimeout(() => {
                    entryOverlay.style.display = 'none';
                    switchScreen('screen-spread');
                    if (!musicUnlocked) {
                        musicUnlocked = true;
                        toggleMusic();
                    }
                }, 400);
            });
        })();

        // --- Settings Management ---
        // API Key 已移至服务端 api/proxy.js，由环境变量 DEEPSEEK_API_KEY 管理

        const READING_STYLES = [
            {
                id: 'poetic',
                name: '诗意',
                prompt: '你是一位资深塔罗牌解读师，拥有20年占卜经验。你精通韦特塔罗、托特塔罗等多种体系。你的解读风格既专业又富有诗意，能够将牌面符号与提问者的生活情境巧妙连接。你总是先解读每张牌在特定牌位中的含义，然后综合分析整个牌阵的能量流动，最后给出温暖而有力的建议。使用流畅优美的中文。'
            },
            {
                id: 'sharp',
                name: '犀利',
                prompt: '你是一位资深塔罗牌解读师，拥有20年占卜经验。你精通韦特塔罗、托特塔罗等多种体系。你的解读风格犀利直接、一针见血，不绕弯子、不敷衍、不刻意美化，能够精准捕捉牌面符号背后的真实问题，结合提问者的生活情境，戳破自我欺骗与逃避。解读时先清晰解读每张牌在特定牌位中的核心含义（不冗余），再综合分析整个牌阵的能量流动与核心矛盾，最后给出直接、有力、不委婉的建议，不灌鸡汤、不模糊其辞，直面问题本质。使用流畅中文，语气坚定，不拖泥带水。'
            },
            {
                id: 'objective',
                name: '客观',
                prompt: '你是一位资深塔罗牌解读师，拥有20年占卜经验。你精通韦特塔罗、托特塔罗等多种体系。你的解读风格绝对理性、客观中立，完全摒弃主观情绪与个人偏好，不灌鸡汤、不刻意渲染吉凶，不掺杂安慰或批判。解读时先精准解读每张牌在特定牌位中的原始含义（贴合韦特/托特正统牌意），结合提问者的生活情境客观分析，再梳理整个牌阵的能量流动、利弊关系与发展趋势，最后给出中立、可行的建议，只陈述事实与可能性，不引导情绪、不主观评判。使用流畅中文，语气平和、严谨克制。'
            },
            {
                id: 'concise',
                name: '精简',
                prompt: '你是一位资深塔罗牌解读师，拥有20年占卜经验。你精通韦特塔罗、托特塔罗等多种体系。你的解读风格极度精简、干练高效，舍去所有多余铺垫与修饰，只保留核心信息。解读时先提炼每张牌在特定牌位中的核心含义（一句话说清，不展开），再简要概括整个牌阵的能量关键与发展核心，最后给出精准、简短、可落地的建议，全程不冗余、不啰嗦，每一句都直击重点。使用流畅中文，语言凝练，无废话、不拖沓。'
            },
            {
                id: 'savage',
                name: '毒舌',
                prompt: '你是一位资深塔罗牌解读师，拥有20年占卜经验。你精通韦特塔罗、托特塔罗等多种体系。你的解读风格毒舌尖锐、一针见血，擅长用直白甚至有点扎心的语言，点破提问者的自我欺骗、逃避与侥幸心理，不委婉、不照顾玻璃心，但解读专业、不恶意伤人。解读时先精准解读每张牌在特定牌位中的含义，结合提问者的生活情境戳中问题要害，再综合分析牌阵的能量矛盾与潜在隐患，最后给出狠辣但实用的建议，打破幻想、直面现实。使用流畅中文，语气犀利带点吐槽感，不敷衍、不讨好，只说真话。'
            }
        ];

        const AppSettings = {
            musicUrl: 'sound_effect/first_light_particles_0.wav',
            volume: parseInt(localStorage.getItem('tarot_volume') || '40', 10),
            particles: (function() {
                const saved = localStorage.getItem('tarot_particles');
                if (saved) return parseInt(saved, 10);
                const vw = window.innerWidth;
                const auto = Math.min(400, Math.max(100, Math.floor(vw * 0.22)));
                return auto;
            })(),
            sfxEnabled: localStorage.getItem('tarot_sfx') !== 'false',
            readingStyle: localStorage.getItem('tarot_reading_style') || 'poetic',
            save() {
                localStorage.setItem('tarot_volume', this.volume);
                localStorage.setItem('tarot_particles', this.particles);
                localStorage.setItem('tarot_sfx', this.sfxEnabled);
                localStorage.setItem('tarot_reading_style', this.readingStyle);
            },
            getReadingPrompt() {
                const style = READING_STYLES.find(s => s.id === this.readingStyle);
                return style ? style.prompt : READING_STYLES[0].prompt;
            }
        };

// --- Initialize Starry Background (after settings ready) ---
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
initParticles();
initMysticSymbols();
requestAnimationFrame(animateCanvas);

// --- Music Player & Settings UI ---
        const bgMusic = document.getElementById('bgMusic');
        const musicBtn = document.getElementById('musicBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsPanel = document.getElementById('settingsPanel');
        const authorBtn = document.getElementById('authorBtn');
        const authorPanel = document.getElementById('authorPanel');
        
        // Inputs
        const volumeInput = document.getElementById('volumeInput');
        const particlesInput = document.getElementById('particlesInput');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        const sfxToggleBtn = document.getElementById('sfxToggleBtn');
        const styleScrollTrack = document.getElementById('styleScrollTrack');
        const styleScrollContainer = document.getElementById('styleScrollContainer');
        const styleTicksTop = document.getElementById('styleTicksTop');
        const styleTicksBottom = document.getElementById('styleTicksBottom');

        // --- Sound Effects ---
        const sfxCardTurn = new Audio('sound_effect/cardturn.wav');
        sfxCardTurn.volume = 0.25;
        const sfxConfirm = new Audio('sound_effect/confirm.wav');
        sfxConfirm.volume = 0.25;

        function playSfx(audio) {
            if (!AppSettings.sfxEnabled) return;
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }

        function toggleSfx() {
            AppSettings.sfxEnabled = !AppSettings.sfxEnabled;
            AppSettings.save();
            sfxToggleBtn.textContent = AppSettings.sfxEnabled ? '🔊 开启' : '🔇 静音';
        }

        // Init
        sfxToggleBtn.textContent = AppSettings.sfxEnabled ? '🔊 开启' : '🔇 静音';
        sfxToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSfx();
        });

        // Init Settings UI
        volumeInput.value = AppSettings.volume;
        particlesInput.value = AppSettings.particles;

        // Apply settings
        bgMusic.volume = AppSettings.volume / 100;

        // Event Listeners for Settings
        volumeInput.addEventListener('input', (e) => { 
            AppSettings.volume = e.target.value; 
            bgMusic.volume = AppSettings.volume / 100;
            AppSettings.save(); 
        });
        particlesInput.addEventListener('change', (e) => { 
            AppSettings.particles = e.target.value; 
            AppSettings.save();
            initParticles(); // Re-init canvas
        });

        clearHistoryBtn.addEventListener('click', () => {
            localStorage.clear();
            alert('历史记录已清空，请刷新页面。');
            location.reload();
        });

        // --- Reading Style Selector ---
        const STYLE_COUNT = READING_STYLES.length;
        const STYLE_COPIES = 3;
        const STYLE_MIDDLE_OFFSET = STYLE_COUNT;
        let styleScrollTimeout = null;
        let styleJumping = false;
        let styleSetWidth = 0;

        function buildStyleSelector() {
            styleScrollTrack.innerHTML = '';
            styleTicksTop.innerHTML = '';
            styleTicksBottom.innerHTML = '';

            const savedStyleId = AppSettings.readingStyle;
            const savedRealIndex = READING_STYLES.findIndex(s => s.id === savedStyleId);
            const startRealIndex = savedRealIndex >= 0 ? savedRealIndex : 0;

            READING_STYLES.forEach((style, realIndex) => {
                const tickTop = document.createElement('div');
                tickTop.className = 'style-tick';
                if (realIndex === startRealIndex) tickTop.classList.add('center');
                styleTicksTop.appendChild(tickTop);

                const tickBottom = document.createElement('div');
                tickBottom.className = 'style-tick';
                if (realIndex === startRealIndex) tickBottom.classList.add('center');
                styleTicksBottom.appendChild(tickBottom);
            });

            for (let copy = 0; copy < STYLE_COPIES; copy++) {
                READING_STYLES.forEach((style, realIndex) => {
                    const chip = document.createElement('div');
                    chip.className = 'style-chip';
                    chip.textContent = style.name;
                    chip.dataset.realIndex = realIndex;
                    chip.addEventListener('click', () => selectStyle(realIndex));

                    if (realIndex === startRealIndex) {
                        chip.classList.add('active');
                    }

                    styleScrollTrack.appendChild(chip);
                });
            }

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const chips = styleScrollTrack.children;
                    if (chips.length > STYLE_COUNT) {
                        styleSetWidth = chips[STYLE_COUNT].offsetLeft - chips[0].offsetLeft;
                    }
                    scrollToStyle(startRealIndex, 'auto');
                });
            });
        }

        function selectStyle(realIndex) {
            AppSettings.readingStyle = READING_STYLES[realIndex].id;
            AppSettings.save();

            document.querySelectorAll('.style-chip').forEach(chip => {
                const ri = parseInt(chip.dataset.realIndex);
                chip.classList.toggle('active', ri === realIndex);
            });

            document.querySelectorAll('#styleTicksTop .style-tick').forEach((tick, i) => {
                tick.classList.toggle('center', i === realIndex);
            });
            document.querySelectorAll('#styleTicksBottom .style-tick').forEach((tick, i) => {
                tick.classList.toggle('center', i === realIndex);
            });

            scrollToStyle(realIndex, 'smooth');
        }

        function scrollToStyle(realIndex, behavior) {
            const chips = styleScrollTrack.children;
            if (!chips.length) return;
            const target = chips[realIndex + STYLE_MIDDLE_OFFSET];
            if (!target) return;

            const container = styleScrollContainer;
            const scrollLeft = target.offsetLeft - container.offsetWidth / 2 + target.offsetWidth / 2;
            container.scrollTo({ left: Math.max(0, scrollLeft), behavior: behavior || 'smooth' });
        }

        function getClosestChipIndex() {
            const chips = styleScrollTrack.children;
            if (!chips.length) return 0;
            const container = styleScrollContainer;
            const centerX = container.scrollLeft + container.offsetWidth / 2;

            let closestRaw = 0;
            let closestDist = Infinity;

            for (let i = 0; i < chips.length; i++) {
                const chipCenter = chips[i].offsetLeft + chips[i].offsetWidth / 2;
                const dist = Math.abs(chipCenter - centerX);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestRaw = i;
                }
            }

            return closestRaw;
        }

        function onStyleScrollEnd() {
            if (styleJumping) return;

            const rawIndex = getClosestChipIndex();
            const realIndex = rawIndex % STYLE_COUNT;
            const currentStyleId = READING_STYLES[realIndex].id;

            if (currentStyleId !== AppSettings.readingStyle) {
                AppSettings.readingStyle = currentStyleId;
                AppSettings.save();

                document.querySelectorAll('.style-chip').forEach(chip => {
                    const ri = parseInt(chip.dataset.realIndex);
                    chip.classList.toggle('active', ri === realIndex);
                });

                document.querySelectorAll('#styleTicksTop .style-tick').forEach((tick, i) => {
                    tick.classList.toggle('center', i === realIndex);
                });
                document.querySelectorAll('#styleTicksBottom .style-tick').forEach((tick, i) => {
                    tick.classList.toggle('center', i === realIndex);
                });
            }

            if (rawIndex < STYLE_COUNT) {
                styleJumping = true;
                styleScrollContainer.scrollBy({ left: styleSetWidth, behavior: 'auto' });
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        styleJumping = false;
                    });
                });
            } else if (rawIndex >= STYLE_COUNT * 2) {
                styleJumping = true;
                styleScrollContainer.scrollBy({ left: -styleSetWidth, behavior: 'auto' });
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        styleJumping = false;
                    });
                });
            }
        }

        styleScrollContainer.addEventListener('scroll', () => {
            clearTimeout(styleScrollTimeout);
            styleScrollTimeout = setTimeout(onStyleScrollEnd, 150);
        }, { passive: true });

        styleScrollContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            styleScrollContainer.scrollLeft += e.deltaY;
        }, { passive: false });

        buildStyleSelector();

        // Settings Panel Toggle
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsPanel.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (settingsPanel.classList.contains('open') && !settingsPanel.contains(e.target) && e.target !== settingsBtn) {
                settingsPanel.classList.remove('open');
            }
            if (authorPanel.classList.contains('open') && !authorPanel.contains(e.target) && e.target !== authorBtn) {
                authorPanel.classList.remove('open');
            }
        });

        // Author Panel Toggle
        authorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            authorPanel.classList.toggle('open');
        });

        // Render author Q&A from data
        AUTHOR_MESSAGES.forEach(msg => {
            const block = document.createElement('div');
            block.className = 'author-qa';
            block.innerHTML = `<div class="author-q">${msg.q}</div><div class="author-a">${msg.a}</div>`;
            authorPanel.appendChild(block);
        });

        // Music Player Toggle
        let musicUnlocked = false;

        function toggleMusic() {
            if (bgMusic.paused) {
                // Fade in
                bgMusic.volume = 0;
                bgMusic.play().then(() => {
                    musicBtn.classList.add('playing');
                    let vol = 0;
                    const fadeInterval = setInterval(() => {
                        vol += 0.05;
                        if (vol >= AppSettings.volume / 100) {
                            bgMusic.volume = AppSettings.volume / 100;
                            clearInterval(fadeInterval);
                        } else {
                            bgMusic.volume = vol;
                        }
                    }, 50);
                }).catch(e => console.log('Music play failed', e));
            } else {
                bgMusic.pause();
                musicBtn.classList.remove('playing');
            }
        }

        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            musicUnlocked = true;
            toggleMusic();
        });

        // Unlock audio on first click
        document.addEventListener('click', () => {
            if (!musicUnlocked) {
                musicUnlocked = true;
                toggleMusic();
            }
        }, { once: true });

        // Fade in canvas
        setTimeout(() => {
            canvas.style.opacity = '1';
            initApp();
        }, 100);

        // --- App State ---
        const AppState = {
            selectedSpread: null,
            selectedSpreadKey: null,
            question: '',
            meditationNumbers: [],
            drawnCards: [],
            shuffledDeck: []
        };

        // --- Utility: Shuffle Array ---
        function shuffleArray(array) {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        // --- Screen Management ---
        function switchScreen(screenId) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(screenId).classList.add('active');
        }

        // --- Init App (Step 1) ---
        function initApp() {
            const isPC = window.innerWidth > 768;
            if (isPC) {
                renderAllSpreads();
            } else {
                renderCategoryGrid();
            }

            // 顶部打赏按钮
            document.getElementById('donateTopBtn').addEventListener('click', showDonatePayModal);
        }

        // --- PC: show all spreads directly ---
        function renderAllSpreads() {
            const spreadScreen = document.getElementById('screen-spread');
            spreadScreen.innerHTML = '';

            const grid = document.createElement('div');
            grid.className = 'spread-grid';
            grid.innerHTML = '<div style="width: 100%; text-align: center; color: var(--color-gold); margin-bottom: 10px; font-size: 1.1rem; animation: pulse 2s infinite;">双击选择牌阵</div><style>@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }</style>';

            Object.entries(SPREADS).forEach(([key, spread], index) => {
                const card = document.createElement('div');
                card.className = 'spread-card liquid-glass';
                card.innerHTML = `
                    <div class="spread-title">${spread.name}</div>
                    <div style="font-size:0.8rem;color:rgba(240,230,255,0.5);margin-bottom:8px;">${spread.cardCount} Cards</div>
                    <div class="spread-desc">${spread.description}</div>
                `;
                card.dataset.spreadKey = key;

                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 300 + index * 60);

                let clickTimer = null;
                card.addEventListener('click', () => {
                    if (clickTimer) {
                        clearTimeout(clickTimer);
                        clickTimer = null;
                        grid.querySelectorAll('.spread-card').forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        AppState.selectedSpread = spread;
                        AppState.selectedSpreadKey = key;
                        setTimeout(startQuestionStep, 300);
                    } else {
                        grid.querySelectorAll('.spread-card').forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        clickTimer = setTimeout(() => { clickTimer = null; }, 300);
                    }
                });

                grid.appendChild(card);
            });

            spreadScreen.appendChild(grid);
        }

        // --- Mobile: show categories first ---
        function renderCategoryGrid() {
            const spreadScreen = document.getElementById('screen-spread');
            spreadScreen.innerHTML = '';

            const grid = document.createElement('div');
            grid.className = 'spread-grid';
            grid.innerHTML = '<div style="width: 100%; text-align: center; color: var(--color-gold); margin-bottom: 10px; font-size: 1.1rem; animation: pulse 2s infinite;">双击选择分类</div><style>@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }</style>';

            Object.entries(SPREAD_CATEGORIES).forEach(([catKey, cat], index) => {
                const card = document.createElement('div');
                card.className = 'category-card liquid-glass';
                card.innerHTML = `
                    <div class="spread-title">${cat.name}</div>
                    <div class="spread-desc">${cat.description}</div>
                `;
                card.dataset.categoryKey = catKey;

                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 300 + index * 120);

                let clickTimer = null;
                card.addEventListener('click', () => {
                    if (clickTimer) {
                        clearTimeout(clickTimer);
                        clickTimer = null;
                        grid.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        setTimeout(() => renderSpreadGrid(catKey, cat.name), 300);
                    } else {
                        grid.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        clickTimer = setTimeout(() => { clickTimer = null; }, 300);
                    }
                });

                grid.appendChild(card);
            });

            spreadScreen.appendChild(grid);
        }

        function renderSpreadGrid(categoryKey, categoryName) {
            const spreadScreen = document.getElementById('screen-spread');
            spreadScreen.innerHTML = '';

            const grid = document.createElement('div');
            grid.className = 'spread-grid';
            grid.innerHTML = `<div style="width: 100%; text-align: center; color: var(--color-gold); margin-bottom: 10px; font-size: 1.1rem; animation: pulse 2s infinite;">【${categoryName}】双击选择牌阵</div><style>@keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }</style>`;

            const spreadKeys = SPREAD_CATEGORIES[categoryKey].spreads;

            spreadKeys.forEach((key, index) => {
                const spread = SPREADS[key];
                const card = document.createElement('div');
                card.className = 'spread-card liquid-glass';
                card.innerHTML = `
                    <div class="spread-title">${spread.name}</div>
                    <div style="font-size:0.8rem;color:rgba(240,230,255,0.5);margin-bottom:8px;">${spread.cardCount} Cards</div>
                    <div class="spread-desc">${spread.description}</div>
                `;
                card.dataset.spreadKey = key;

                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 300 + index * 120);

                let clickTimer = null;
                card.addEventListener('click', () => {
                    if (clickTimer) {
                        clearTimeout(clickTimer);
                        clickTimer = null;
                        grid.querySelectorAll('.spread-card').forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        AppState.selectedSpread = spread;
                        AppState.selectedSpreadKey = key;
                        setTimeout(startQuestionStep, 300);
                    } else {
                        grid.querySelectorAll('.spread-card').forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        clickTimer = setTimeout(() => { clickTimer = null; }, 300);
                    }
                });

                grid.appendChild(card);
            });

            const backRow = document.createElement('div');
            backRow.style.cssText = 'width:100%;text-align:center;margin-top:20px;';
            backRow.innerHTML = '<button class="btn" id="backToCategoriesBtn">← 返回分类</button>';
            grid.appendChild(backRow);

            spreadScreen.appendChild(grid);

            document.getElementById('backToCategoriesBtn').addEventListener('click', () => {
                renderCategoryGrid();
            });
        }

        // --- Step 2: Question & Meditation ---
        function startQuestionStep() {
            switchScreen('screen-meditation');
            const screen = document.getElementById('screen-meditation');
            screen.innerHTML = `
                <div class="glass-panel liquid-glass" style="width: 100%; max-width: 600px; display: flex; flex-direction: column; align-items: center;">
                    <div class="corner-symbol top-left">✧</div>
                    <div class="corner-symbol top-right">✧</div>
                    <div class="corner-symbol bottom-left">✧</div>
                    <div class="corner-symbol bottom-right">✧</div>
                    <input type="text" id="questionInput" class="fancy-input" placeholder="（可选）你心中所想之事..." autocomplete="off">
                    <button class="btn" id="startMeditationBtn">开始冥想</button>
                </div>
            `;

            document.getElementById('startMeditationBtn').addEventListener('click', () => {
                AppState.question = document.getElementById('questionInput').value.trim();
                startMeditationStep();
            });
        }

        function startMeditationStep() {
            const screen = document.getElementById('screen-meditation');
            const spreadName = AppState.selectedSpread.name;
            const spreadDesc = AppState.selectedSpread.description;
            
            let promptText = `闭上眼睛，深呼吸三次...<br>将注意力集中在【${spreadName}】的能量流动上...<br>想象${spreadDesc}<br>`;
            if (AppState.question) {
                promptText += `带着关于“${AppState.question}”的疑问，<br>`;
            }
            promptText += `当你准备好时，脑海中浮现的数字是什么？`;

            const cardCount = AppState.selectedSpread.cardCount;
            let inputsHTML = '';
            for (let i = 0; i < cardCount; i++) {
                inputsHTML += `
                    <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" class="number-input liquid-glass" placeholder="${i + 1}" data-index="${i}" autocomplete="off">
                `;
            }

            screen.innerHTML = `
                <div class="glass-panel meditation-box liquid-glass" id="meditationText">
                    <div class="corner-symbol top-left">✧</div>
                    <div class="corner-symbol top-right">✧</div>
                    <div class="corner-symbol bottom-left">✧</div>
                    <div class="corner-symbol bottom-right">✧</div>
                    ${promptText}
                </div>
                <div id="numberInputContainer" style="opacity: 0; transition: opacity 1s; display: flex; flex-direction: column; align-items: center;">
                    <p id="numberHint" style="color: rgba(212,168,83,0.55); font-size: 0.75rem; margin-bottom: 8px; transition: opacity 0.6s ease;">请输入1-78间的数字</p>
                    <div class="inputs-container">
                        ${inputsHTML}
                    </div>
                    <p id="inputError"></p>
                    <button class="btn" id="confirmNumberBtn" style="margin-top: 10px;" disabled>确认抽取</button>
                </div>
            `;

            setTimeout(() => {
                document.getElementById('meditationText').classList.add('show');
            }, 100);

            setTimeout(() => {
                document.getElementById('numberInputContainer').style.opacity = '1';
            }, 2100);

            document.getElementById('confirmNumberBtn').addEventListener('click', handleNumberSubmit);
            
            const allInputs = document.querySelectorAll('.number-input');
            if (allInputs.length > 0) {
                setTimeout(() => allInputs[0].focus(), 2200);
            }
            
            allInputs.forEach((input, index) => {

                input.addEventListener('input', () => {
                    const val = input.value.replace(/[^0-9]/g, '');
                    input.value = val;

                    const anyFilled = [...allInputs].some(inp => inp.value.length > 0);
                    document.getElementById('numberHint').style.opacity = anyFilled ? '0' : '1';

                    if (val.length === 2 && index < allInputs.length - 1) {
                        allInputs[index + 1].focus();
                    }

                    validateNumberInputs();
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace') {
                        if (input.value) {
                            return;
                        }
                        if (index > 0) {
                            const prev = allInputs[index - 1];
                            prev.focus();
                            prev.value = prev.value.slice(0, -1);
                            validateNumberInputs();
                            e.preventDefault();
                        }
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (index < allInputs.length - 1) {
                            allInputs[index + 1].focus();
                        } else {
                            validateNumberInputs();
                            handleNumberSubmit();
                        }
                    }
                });

                input.addEventListener('focus', () => {
                    allInputs.forEach(inp => inp.classList.remove('num-focus'));
                    input.classList.add('num-focus');
                });

                input.addEventListener('blur', () => {
                    input.classList.remove('num-focus');
                    validateNumberInputs();
                });
            });

            validateNumberInputs();
        }

        function validateNumberInputs() {
            const inputs = document.querySelectorAll('.number-input');
            const errorEl = document.getElementById('inputError');
            const confirmBtn = document.getElementById('confirmNumberBtn');
            const values = [];
            let hasError = false;
            let errorMsg = '';

            inputs.forEach(input => input.classList.remove('error'));

            for (let input of inputs) {
                const num = parseInt(input.value, 10);
                if (input.value === '') {
                    values.push(null);
                    continue;
                }
                if (isNaN(num) || num < 1 || num > 78 || !Number.isInteger(num)) {
                    hasError = true;
                    errorMsg = '请输入 1-78 之间的整数';
                    input.classList.add('error');
                    values.push(null);
                } else {
                    values.push(num);
                }
            }

            const filledValues = values.filter(v => v !== null);
            const uniqueSet = new Set(filledValues);
            if (uniqueSet.size < filledValues.length) {
                hasError = true;
                errorMsg = '数字不可重复';
                inputs.forEach(input => {
                    const num = parseInt(input.value, 10);
                    if (!isNaN(num) && filledValues.filter(v => v === num).length > 1) {
                        input.classList.add('error');
                    }
                });
            }

            const requiredCount = AppState.selectedSpread.cardCount;
            const allFilled = filledValues.length === requiredCount;
            if (!allFilled && !hasError) {
                errorMsg = `请填写全部 ${requiredCount} 个数字`;
            }

            errorEl.textContent = errorMsg;
            confirmBtn.disabled = hasError || !allFilled;

            if (!hasError && allFilled) {
                AppState.meditationNumbers = [...filledValues];
            } else {
                AppState.meditationNumbers = [];
            }
        }

        function handleNumberSubmit() {
            validateNumberInputs();
            if (AppState.meditationNumbers.length !== AppState.selectedSpread.cardCount) {
                return;
            }

            playSfx(sfxConfirm);
            // 洗牌
            AppState.shuffledDeck = shuffleArray(TAROT_DECK);
            startDrawStep();
        }

        function startDrawStep() {
            switchScreen('screen-draw');
            if (drawConfirmBtn) drawConfirmBtn.style.display = 'none';
            initFanDeck();
        }

        // --- Fan Deck & Draw Implementation ---
        let N_VISIBLE = 11;
        const ARC_STEP_DEG = 9;
        
        let scrollOffsetRef = 0;
        let scrollVelocity = 0;
        let isDragging = false;
        let startX = 0;
        let fanRafId = null;
        let isDrawing = false;
        let drawQueue = [];
        let currentDrawIndex = 0;
        let lastCardFlooredRef = 0;

        const fanContainer = document.getElementById('fan-container');
        const spreadLayout = document.getElementById('spread-layout');
        const drawConfirmBtn = document.getElementById('drawConfirmBtn');

        const SPREAD_POSITIONS = {
            single: [{ x: '50%', y: '50%' }],
            two: [
                { x: '35%', y: '50%' }, // 现状/问题
                { x: '65%', y: '50%' }  // 建议/对策
            ],
            three: [
                { x: '20%', y: '50%' }, // 过去
                { x: '50%', y: '50%' }, // 现在
                { x: '80%', y: '50%' }  // 未来
            ],
            relationship: [
                { x: '30%', y: '50%' }, // 你的状态
                { x: '70%', y: '50%' }, // 对方状态
                { x: '50%', y: '25%' }, // 关系现状
                { x: '50%', y: '75%' }  // 未来发展
            ],
            choice: [
                { x: '50%', y: '75%' }, // 当前处境
                { x: '25%', y: '45%' }, // 选择A
                { x: '75%', y: '45%' }, // 选择B
                { x: '50%', y: '20%' }  // 最终建议
            ],
            elements: [
                { x: '35%', y: '30%' }, // 火
                { x: '65%', y: '30%' }, // 水
                { x: '35%', y: '70%' }, // 风
                { x: '65%', y: '70%' }  // 土
            ],
            career: [
                { x: '50%', y: '50%' }, // 目前状态
                { x: '50%', y: '20%' }, // 潜在机会
                { x: '80%', y: '50%' }, // 面临挑战
                { x: '20%', y: '50%' }, // 未来发展
                { x: '50%', y: '80%' }  // 综合建议
            ],
            hexagram: [
                { x: '50%', y: '15%' }, // 过去 (顶)
                { x: '80%', y: '75%' }, // 现在 (右下)
                { x: '20%', y: '75%' }, // 未来 (左下)
                { x: '50%', y: '85%' }, // 阻碍 (底)
                { x: '20%', y: '25%' }, // 环境 (左上)
                { x: '80%', y: '25%' }, // 建议 (右上)
                { x: '50%', y: '50%' }  // 结果 (中)
            ],
            celtic: [
                { x: '35%', y: '50%' }, // 1现状
                { x: '35%', y: '50%', rotate: 90 }, // 2阻碍 (横放)
                { x: '35%', y: '80%' }, // 3基础
                { x: '15%', y: '50%' }, // 4过去
                { x: '35%', y: '20%' }, // 5目标
                { x: '55%', y: '50%' }, // 6未来
                { x: '80%', y: '80%' }, // 7自我
                { x: '80%', y: '60%' }, // 8环境
                { x: '80%', y: '40%' }, // 9希望/恐惧
                { x: '80%', y: '20%' }  // 10结果
            ],
            daily: [{ x: '50%', y: '50%' }],
            yesno: [
                { x: '30%', y: '50%' },
                { x: '50%', y: '25%' },
                { x: '70%', y: '50%' }
            ],
            weekly: [
                { x: '10%', y: '50%' },
                { x: '25%', y: '50%' },
                { x: '40%', y: '50%' },
                { x: '55%', y: '50%' },
                { x: '70%', y: '50%' },
                { x: '85%', y: '50%' }
            ],
            venus: [
                { x: '25%', y: '30%' },
                { x: '75%', y: '30%' },
                { x: '25%', y: '70%' },
                { x: '75%', y: '70%' },
                { x: '50%', y: '15%' },
                { x: '50%', y: '45%' },
                { x: '50%', y: '60%' },
                { x: '50%', y: '85%' }
            ],
            breakup: [
                { x: '50%', y: '15%' },
                { x: '25%', y: '45%' },
                { x: '75%', y: '45%' },
                { x: '50%', y: '65%' },
                { x: '50%', y: '85%' }
            ],
            study: [
                { x: '50%', y: '20%' },
                { x: '20%', y: '50%' },
                { x: '80%', y: '50%' },
                { x: '30%', y: '80%' },
                { x: '70%', y: '80%' }
            ],
            wealth: [
                { x: '50%', y: '20%' },
                { x: '25%', y: '50%' },
                { x: '75%', y: '50%' },
                { x: '30%', y: '80%' },
                { x: '70%', y: '80%' }
            ],
            threechoices: [
                { x: '50%', y: '80%' },
                { x: '20%', y: '40%' },
                { x: '50%', y: '40%' },
                { x: '80%', y: '40%' },
                { x: '50%', y: '15%' }
            ],
            innerself: [
                { x: '50%', y: '20%' },
                { x: '20%', y: '50%' },
                { x: '80%', y: '50%' },
                { x: '30%', y: '80%' },
                { x: '70%', y: '80%' }
            ],
            growthblock: [
                { x: '50%', y: '25%' },
                { x: '30%', y: '50%' },
                { x: '70%', y: '50%' },
                { x: '50%', y: '75%' }
            ],
            horseshoe: [
                { x: '30%', y: '25%' },
                { x: '50%', y: '20%' },
                { x: '70%', y: '25%' },
                { x: '20%', y: '60%' },
                { x: '80%', y: '60%' },
                { x: '50%', y: '80%' }
            ],
            monthly: [
                { x: '20%', y: '30%' },
                { x: '50%', y: '20%' },
                { x: '80%', y: '30%' },
                { x: '20%', y: '70%' },
                { x: '50%', y: '80%' },
                { x: '80%', y: '70%' },
                { x: '35%', y: '50%' },
                { x: '65%', y: '50%' }
            ]
        };

        function initFanDeck() {
            N_VISIBLE = window.innerWidth < 768 ? 7 : 11;
            drawQueue = [...AppState.meditationNumbers];
            currentDrawIndex = 0;
            AppState.drawnCards = [];
            
            // Generate layout slots
            spreadLayout.innerHTML = '<div class="scan-effect" id="layoutScanEffect"></div>';
            const positions = SPREAD_POSITIONS[AppState.selectedSpreadKey];
            positions.forEach((pos, idx) => {
                const slot = document.createElement('div');
                slot.className = 'layout-card-slot';
                slot.style.left = pos.x;
                slot.style.top = pos.y;
                slot.innerHTML = AppState.selectedSpread.positions[idx];
                spreadLayout.appendChild(slot);
            });

            fanContainer.innerHTML = '';
            
            // Set initial offset far away so it "scrolls" to the first target
            scrollOffsetRef = (drawQueue[0] % 78) - 20; 
            lastCardFlooredRef = Math.floor(scrollOffsetRef);
            scrollVelocity = 0;
            isDragging = false;
            isDrawing = false;
            
            for (let i = 0; i < N_VISIBLE; i++) {
                const card = document.createElement('div');
                card.className = 'fan-card';
                card.innerHTML = `
                    <div class="fan-card-inner">
                        <div class="fan-card-back"></div>
                        <div class="fan-card-front"></div>
                    </div>
                `;
                fanContainer.appendChild(card);
            }

            setTimeout(() => {
                fanContainer.classList.add('visible');
                // Start auto drawing sequence
                setTimeout(processNextDraw, 800);
            }, 100);

            if (!fanRafId) {
                fanRafId = requestAnimationFrame(updateFanDeck);
            }
        }

        function handlePointerDown(e) {
            if (isDrawing) return;
            isDragging = true;
            startX = e.clientX;
            scrollVelocity = 0;
        }

        function handlePointerMove(e) {
            if (!isDragging || isDrawing) return;
            const deltaX = e.clientX - startX;
            startX = e.clientX;
            
            // 40px approx 1 step
            const deltaOffset = -deltaX / 40;
            scrollOffsetRef += deltaOffset;
            scrollVelocity = deltaOffset * 60; // Approximate velocity per second (assuming 60fps)
        }

        function handlePointerUp() {
            if (isDragging) {
                isDragging = false;
            }
        }

        function updateFanDeck() {
            if (!fanContainer.classList.contains('visible') && !isDrawing) {
                fanRafId = requestAnimationFrame(updateFanDeck);
                return;
            }

            if (!isDragging && Math.abs(scrollVelocity) > 0.001) {
                scrollOffsetRef += scrollVelocity * (1/60);
                scrollVelocity *= 0.95;
                if (Math.abs(scrollVelocity) < 0.001) scrollVelocity = 0;
            }

            // Snap to nearest integer if velocity is very low
            if (!isDragging && Math.abs(scrollVelocity) < 0.05) {
                const nearest = Math.round(scrollOffsetRef);
                scrollOffsetRef += (nearest - scrollOffsetRef) * 0.1;
            }

            scrollOffsetRef = ((scrollOffsetRef % 78) + 78) % 78;

            const currentFloored = Math.floor(scrollOffsetRef);
            const diff = currentFloored - lastCardFlooredRef;
            if (diff !== 0 && Math.abs(diff) < 70) {
                lastCardFlooredRef = currentFloored;
                playSfx(sfxCardTurn);
            }

            const isMobile = window.innerWidth < 768;
            const ARC_RADIUS = isMobile ? 260 : 520;
            const ARC_LIFT = ARC_RADIUS;
            const baseScale = isMobile ? 0.8 : 1.0;

            const cards = fanContainer.querySelectorAll('.fan-card');
            
            cards.forEach((card, i) => {
                const theta_i_deg = (i - Math.floor(N_VISIBLE / 2)) * ARC_STEP_DEG;
                const theta_deg = theta_i_deg + (scrollOffsetRef % 1) * ARC_STEP_DEG; // Wait, scrollOffsetRef determines the center card
                
                // Let center index be Math.round(scrollOffsetRef)
                // The actual offset in steps for card i is:
                const offsetSteps = (i - Math.floor(N_VISIBLE / 2)) - (scrollOffsetRef % 1);
                const actual_theta_deg = offsetSteps * ARC_STEP_DEG;
                const theta_rad = actual_theta_deg * (Math.PI / 180);

                const x = Math.sin(theta_rad) * ARC_RADIUS;
                const y = ARC_LIFT * (1 - Math.cos(theta_rad));

                // Scale and opacity based on actual_theta_deg
                const cosRatio = Math.cos(actual_theta_deg * Math.PI / 90); // 90 deg range
                let scale = 0.65 + 0.35 * Math.max(0, cosRatio);
                scale *= baseScale;
                
                let opacity = 0.35 + 0.65 * Math.max(0, cosRatio);
                
                // Z-index
                const zIndex = 50 - Math.abs(Math.round(offsetSteps)) * 3;

                card.style.transform = `translate(${x}px, -${y}px) rotate(${actual_theta_deg}deg) scale(${scale})`;
                card.style.opacity = opacity;
                card.style.zIndex = zIndex;
                
                // Assign card id to front
                if (!card.classList.contains('flipped')) {
                    const cardIndex = Math.floor(((Math.round(scrollOffsetRef) + i - Math.floor(N_VISIBLE/2)) % 78 + 78) % 78);
                    card.dataset.cardIndex = cardIndex;
                }
            });

            fanRafId = requestAnimationFrame(updateFanDeck);
        }

        // --- Step 7: Draw Flow ---
        function processNextDraw() {
            if (currentDrawIndex >= drawQueue.length) {
                // All cards drawn
                fanContainer.classList.remove('visible');
                const scanEffect = document.getElementById('layoutScanEffect');
                if(scanEffect) scanEffect.style.display = 'block';
                setTimeout(startResultStep, 2500);
                return;
            }

            isDrawing = true;
            const targetOffset = drawQueue[currentDrawIndex] % 78;
            
            // Auto scroll to target (smooth ease out)
            let startOffset = scrollOffsetRef;
            let diff = targetOffset - (startOffset % 78);
            if (diff < -39) diff += 78;
            if (diff > 39) diff -= 78;
            
            const totalDiff = diff;
            const duration = 800; // ms
            const startTime = performance.now();

            function easeOutCubic(x) {
                return 1 - Math.pow(1 - x, 3);
            }

            function animateScroll(time) {
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = easeOutCubic(progress);
                
                scrollOffsetRef = startOffset + totalDiff * ease;
                
                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                } else {
                    scrollOffsetRef = targetOffset;
                    setTimeout(extractCenterCard, 200);
                }
            }
            requestAnimationFrame(animateScroll);
        }

        function extractCenterCard() {
            const cards = fanContainer.querySelectorAll('.fan-card');
            const centerCard = cards[Math.floor(N_VISIBLE / 2)];
            
            // Map the user's input number (1-78) to an index (0-77) in the shuffled deck
            const inputNumber = drawQueue[currentDrawIndex];
            const deckIndex = inputNumber - 1; 
            const tarotData = AppState.shuffledDeck[deckIndex];
            
            const front = centerCard.querySelector('.fan-card-front');
            const isReversed = Math.random() > 0.5;
            
            front.innerHTML = `
                <img src="graph/${tarotData.imgName}" alt="${tarotData.name}" onerror="this.style.display='none'">
                <div class="card-name-overlay">${tarotData.name}</div>
            `;

            // Glow and slight scale up
            centerCard.style.transition = 'all 0.3s ease';
            centerCard.style.boxShadow = '0 0 30px 10px rgba(212, 168, 83, 0.8)';
            const currentTransform = centerCard.style.transform;
            centerCard.style.transform = currentTransform + ' scale(1.05)';

            setTimeout(() => {
                // Remove glow, start flip
                centerCard.style.boxShadow = '';
                centerCard.classList.add('flipped');
                centerCard.style.transform = currentTransform + ' rotateX(5deg)';
                playSfx(sfxCardTurn);
                
                const inner = centerCard.querySelector('.fan-card-inner');
                if (isReversed) {
                    inner.style.transform = 'rotateY(180deg) rotateZ(180deg)';
                } else {
                    inner.style.transform = 'rotateY(180deg)';
                }

                // Wait for flip to complete
                setTimeout(() => {
                    flyCardToLayout(centerCard, tarotData, isReversed);
                }, 800);
            }, 400);
        }

        function flyCardToLayout(sourceCard, tarotData, isReversed) {
            const positions = SPREAD_POSITIONS[AppState.selectedSpreadKey];
            const targetPos = positions[currentDrawIndex];

            // Create the card directly at the target position
            const flyCard = document.createElement('div');
            flyCard.className = 'drawn-card-final';
            
            flyCard.innerHTML = `
                <img src="graph/${tarotData.imgName}" onerror="this.style.display='none'">
                <div class="overlay-label" style="${isReversed ? 'transform: translateX(-50%) rotate(180deg); bottom: auto; top: -25px;' : ''}">${tarotData.name}${isReversed ? ' (逆)' : ''}</div>
            `;
            
            // Record
            AppState.drawnCards.push({
                card: tarotData,
                isReversed: isReversed,
                position: AppState.selectedSpread.positions[currentDrawIndex]
            });

            // Hide original card temporarily to avoid visual dup
            sourceCard.style.opacity = '0';

            // Attach to layout container directly
            spreadLayout.appendChild(flyCard);
            
            // Set initial state for fade-in
            flyCard.style.left = targetPos.x;
            flyCard.style.top = targetPos.y;
            flyCard.style.opacity = '0';
            
            if (targetPos.rotate) {
                flyCard.style.transform = `translate(-50%, -50%) rotate(${targetPos.rotate + (isReversed ? 180 : 0)}deg)`;
            } else {
                flyCard.style.transform = `translate(-50%, -50%) ${isReversed ? 'rotate(180deg)' : 'rotate(0deg)'}`;
            }

            // Trigger reflow
            flyCard.offsetHeight;

            // Fade in
            flyCard.style.opacity = '1';

            setTimeout(() => {
                currentDrawIndex++;
                
                // Hide deck, advance offset, and prepare next
                if (currentDrawIndex < drawQueue.length) {
                    fanContainer.classList.remove('visible');
                    setTimeout(() => {
                        scrollOffsetRef += 17; // advance offset
                        sourceCard.classList.remove('flipped');
                        const inner = sourceCard.querySelector('.fan-card-inner');
                        inner.style.transform = ''; // Reset the inner transform
                        sourceCard.style.opacity = '';
                        sourceCard.style.transition = '';
                        fanContainer.classList.add('visible');
                        
                        setTimeout(processNextDraw, 600);
                    }, 600);
                } else {
                    processNextDraw(); // will trigger the end
                }

            }, 800);
        }

        // --- Step 8: Result & DeepSeek API ---
        function startResultStep() {
            switchScreen('screen-result');
            const screen = document.getElementById('screen-result');
            
            // Generate result layout
            let resultHTML = `
                <div class="glass-panel liquid-glass-strong" style="width: 100%; max-width: 95%; padding: 30px;">
                    <div class="corner-symbol top-left">✧</div>
                    <div class="corner-symbol top-right">✧</div>
                    <div class="corner-symbol bottom-left">✧</div>
                    <div class="corner-symbol bottom-right">✧</div>
                    <div class="result-scroll-area">
                        <h2 class="spread-title" style="text-align: center; font-size: 2rem; margin-bottom: 20px;">解读结果</h2>
                        
                        <div id="loadingIndicator" style="text-align: center; margin: 40px 0; transition: opacity 1.2s ease, transform 1.2s ease;">
                            <div class="magic-loading-text" id="magicProgressText">
                                <span class="desktop-text">与宇宙建立连接中...≽^-⩊-^≼</span>
                                <span class="mobile-text">与宇宙建立连接中...<br>≽^-⩊-^≼</span>
                            </div>
                            <div style="width: 80%; max-width: 300px; height: 4px; background: rgba(212, 168, 83, 0.2); border-radius: 2px; overflow: hidden; margin: 15px auto 0; position: relative; box-shadow: inset 0 0 5px rgba(0,0,0,0.5);">
                                <div id="magicProgressBar" style="width: 0%; height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--color-gold-light), var(--color-gold), var(--color-gold-light)); box-shadow: 0 0 12px rgba(212, 168, 83, 0.6); transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                            </div>
                        </div>

                        <div id="apiContent" style="line-height: 1.8; font-size: 1.1rem; white-space: pre-wrap; display: none; opacity: 0; transform: translateY(20px); transition: opacity 1.5s ease, transform 1.5s ease;"></div>
                        <div class="btn-row" id="resultBtnRow" style="display: none; margin-top: 30px; opacity: 0; transition: opacity 1.5s ease 0.8s;">
                            <button class="btn" id="copyResultBtn">📃复制结果</button>
                            <button class="btn" id="restartBtn">🔮重新占卜</button>
                            <button class="btn" id="suggestBtn">💬 匿名建议</button>
                            <button class="btn" id="donateBtn">🎁 打赏作者</button>
                        </div>
                    </div>
                </div>

                <!-- Suggest Modal -->
                <div class="modal-overlay" id="suggestModal" style="display: none;">
                    <div class="modal-box liquid-glass">
                        <button class="modal-close" id="closeSuggestModal">&times;</button>
                        <h3 style="color: var(--color-gold); font-family: var(--font-title); margin-bottom: 16px;">💬 匿名建议箱</h3>
                        <textarea id="suggestText" placeholder="请输入你的匿名建议" style="width: 100%; height: 140px; padding: 12px; border-radius: 10px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.06); color: var(--color-white); font-family: var(--font-body); font-size: 0.95rem; resize: vertical; outline: none;"></textarea>
                        <button class="btn" id="sendSuggestBtn" style="margin-top: 14px; width: 100%;">提交建议</button>
                        <p id="suggestMsg" style="color: var(--color-gold); font-size: 0.85rem; margin-top: 10px; text-align: center; min-height: 20px;"></p>
                    </div>
                </div>

                <style>
                    .magic-loading-text {
                        color: var(--color-gold);
                        font-family: var(--font-title);
                        font-size: 1.2rem;
                        text-shadow: 0 0 10px rgba(212, 168, 83, 0.6);
                        animation: pulseText 2s infinite alternate;
                    }
                    .mobile-text { display: none; }
                    @media (max-width: 768px) {
                        .desktop-text { display: none; }
                        .mobile-text { display: block; line-height: 1.5; }
                    }
                    @keyframes pulseText {
                        0% { opacity: 0.6; text-shadow: 0 0 5px rgba(212, 168, 83, 0.4); }
                        100% { opacity: 1; text-shadow: 0 0 15px rgba(212, 168, 83, 0.8); }
                    }
                </style>
            `;
            screen.innerHTML = resultHTML;

            document.getElementById('restartBtn').addEventListener('click', () => {
                location.reload();
            });

            document.getElementById('copyResultBtn').addEventListener('click', () => {
                const content = document.getElementById('apiContent').innerText;
                navigator.clipboard.writeText(content).then(() => {
                    const btn = document.getElementById('copyResultBtn');
                    const original = btn.textContent;
                    btn.textContent = '✅已复制';
                    setTimeout(() => { btn.textContent = original; }, 2000);
                }).catch(() => {
                    const btn = document.getElementById('copyResultBtn');
                    btn.textContent = '❌复制失败';
                    setTimeout(() => { btn.textContent = '📃复制结果'; }, 2000);
                });
            });

            // --- Suggest Modal ---
            const suggestModal = document.getElementById('suggestModal');
            document.getElementById('suggestBtn').addEventListener('click', () => {
                suggestModal.style.display = 'flex';
                document.getElementById('suggestText').focus();
            });
            function closeSuggestModal() {
                suggestModal.style.display = 'none';
                document.getElementById('suggestText').value = '';
                document.getElementById('suggestMsg').textContent = '';
            }
            document.getElementById('closeSuggestModal').addEventListener('click', closeSuggestModal);
            suggestModal.addEventListener('click', (e) => {
                if (e.target === suggestModal) closeSuggestModal();
            });
            document.getElementById('sendSuggestBtn').addEventListener('click', async () => {
                const content = document.getElementById('suggestText').value.trim();
                if (!content) {
                    document.getElementById('suggestMsg').textContent = '请输入建议内容';
                    return;
                }
                const btn = document.getElementById('sendSuggestBtn');
                btn.disabled = true;
                btn.textContent = '提交中...';
                try {
                    const res = await fetch('/api/suggest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ body: content })
                    });
                    const result = await res.json();
                    if (res.ok && result.success) {
                        document.getElementById('suggestText').value = '';
                        document.getElementById('suggestMsg').textContent = '感谢你的反馈 ✅';
                    } else {
                        document.getElementById('suggestMsg').textContent = result.error || '提交失败，请稍后再试';
                    }
                } catch (err) {
                    document.getElementById('suggestMsg').textContent = '网络错误，请稍后再试';
                }
                btn.disabled = false;
                btn.textContent = '提交建议';
            });

            // --- 打赏按钮（结果页） ---
            document.getElementById('donateBtn').addEventListener('click', showDonatePayModal);

            // 先弹支付弹窗，付款后再调 DeepSeek
            showPayModal();
        }

        // ========== 支付流程 ==========
        let payPollTimer = null;
        let payPollCount = 0;
        let payBackoffCount = 0;        // 指数退避计数
        let payPollCurrentInterval = POLL_CONFIG.INTERVAL;
        let payVisibilityPaused = false; // 页面隐藏时暂停

        // 页面隐藏/显示 时暂停/恢复轮询
        document.addEventListener('visibilitychange', () => {
            if (!window.__tarotCurrentOrder) return;
            const payModal = document.getElementById('payModal');
            if (!payModal || payModal.style.display === 'none') return;

            if (document.hidden) {
                if (payPollTimer) {
                    clearTimeout(payPollTimer);
                    payPollTimer = null;
                    payVisibilityPaused = true;
                }
            } else if (payVisibilityPaused) {
                payVisibilityPaused = false;
                payPollCurrentInterval = POLL_CONFIG.INTERVAL;
                payBackoffCount = 0;
                // 恢复时立即检查一次
                pollPaymentStatus(window.__tarotCurrentOrder);
            }
        });

        // 页面刷新/关闭时停止轮询
        window.addEventListener('beforeunload', () => {
            stopPayPolling();
            stopDonatePolling();
        });

        // ========== 打赏支付流程（独立轮询，不复用解牌轮询） ==========
        let donatePollTimer = null;
        let donatePollCount = 0;
        let donateBackoffCount = 0;
        let donatePollInterval = POLL_CONFIG.INTERVAL;

        function showDonatePayModal() {
            const modal = document.getElementById('donatePayModal');
            const inputArea = document.getElementById('donatePayInputArea');
            const qrArea = document.getElementById('donatePayQRArea');
            const amountInput = document.getElementById('donateAmountInput');
            const statusText = document.getElementById('donatePayStatusText');
            const qrImage = document.getElementById('donateQRImage');
            const qrLoading = document.getElementById('donateQRLoading');

            if (!modal) return;

            // 重置 UI
            inputArea.style.display = 'block';
            qrArea.style.display = 'none';
            amountInput.value = '';
            statusText.textContent = '';
            statusText.style.color = '';
            qrImage.style.display = 'none';
            qrLoading.style.display = 'block';
            modal.style.display = 'flex';

            // 停止上一轮打赏轮询
            stopDonatePolling();

            // 关闭按钮
            document.getElementById('closeDonatePayModal').onclick = () => {
                stopDonatePolling();
                modal.style.display = 'none';
            };
            modal.onclick = (e) => {
                if (e.target === modal) {
                    stopDonatePolling();
                    modal.style.display = 'none';
                }
            };

            // 确认打赏
            document.getElementById('submitDonateBtn').onclick = () => {
                const raw = amountInput.value.trim();
                if (!raw) {
                    statusText.textContent = '⚠️ 请输入打赏金额';
                    statusText.style.color = '#ffa500';
                    return;
                }
                const amount = parseFloat(raw);
                if (isNaN(amount) || amount < 0.01) {
                    statusText.textContent = '⚠️ 金额不能低于 0.01 元';
                    statusText.style.color = '#ffa500';
                    return;
                }

                // 隐藏输入区，显示二维码区
                inputArea.style.display = 'none';
                qrArea.style.display = 'block';
                statusText.textContent = '';
                statusText.style.color = '';
                document.getElementById('submitDonateBtn').disabled = true;
                document.getElementById('checkDonatePayBtn').disabled = true;

                // 调支付接口
                const title = '塔罗牌打赏';
                fetch('/api/pay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ price: amount, title })
                })
                .then(res => res.json())
                .then(data => {
                    if (!data.ok) {
                        qrLoading.style.display = 'none';
                        statusText.textContent = '❌ 下单失败：' + (data.msg || '请重试');
                        statusText.style.color = '#ff6b6b';
                        return;
                    }

                    qrLoading.style.display = 'none';
                    qrImage.src = data.qrCode;
                    qrImage.style.display = 'block';
                    document.getElementById('checkDonatePayBtn').disabled = false;
                    statusText.textContent = '⏳ 等待付款中...';

                    window.__tarotDonateOrder = data.orderNo;

                    // 启动独立打赏轮询
                    donatePollCount = 0;
                    donateBackoffCount = 0;
                    donatePollInterval = POLL_CONFIG.INTERVAL;
                    scheduleDonatePoll(data.orderNo);
                })
                .catch(err => {
                    qrLoading.style.display = 'none';
                    statusText.textContent = '❌ 网络错误：' + err.message;
                    statusText.style.color = '#ff6b6b';
                });
            };

            // "我已付款"
            document.getElementById('checkDonatePayBtn').onclick = () => {
                const orderNo = window.__tarotDonateOrder;
                if (!orderNo) return;
                statusText.textContent = '🔍 正在检查支付状态...';
                statusText.style.color = '';
                document.getElementById('checkDonatePayBtn').disabled = true;
                checkDonatePayment(orderNo, true);
            };
        }

        function checkDonatePayment(orderNo, isManual = false) {
            if (!orderNo) return;

            donatePollCount++;
            if (donatePollCount > POLL_CONFIG.MAX_COUNT) {
                stopDonatePolling();
                const st = document.getElementById('donatePayStatusText');
                st.textContent = '⏰ 支付超时，请关闭弹窗重试';
                st.style.color = '#ffa500';
                document.getElementById('checkDonatePayBtn').disabled = false;
                return;
            }

            fetch('/api/check-order?orderNo=' + encodeURIComponent(orderNo))
                .then(res => res.json())
                .then(data => {
                    donateBackoffCount = 0;
                    donatePollInterval = POLL_CONFIG.INTERVAL;

                    if (data.paid) {
                        stopDonatePolling();
                        const st = document.getElementById('donatePayStatusText');
                        st.textContent = '✅ 打赏成功，谢谢客官 ≽^⦁⩊⦁^≼';
                        st.style.color = '#4caf50';
                        document.getElementById('checkDonatePayBtn').disabled = true;
                        document.getElementById('closeDonatePayModal').style.pointerEvents = 'none';
                        setTimeout(() => {
                            document.getElementById('donatePayModal').style.display = 'none';
                            // 恢复关闭按钮
                            document.getElementById('closeDonatePayModal').style.pointerEvents = '';
                        }, 2000);
                    } else if (data.status === 'not_found') {
                        stopDonatePolling();
                        const st = document.getElementById('donatePayStatusText');
                        st.textContent = '⚠️ 订单已过期，请重新下单';
                        st.style.color = '#ffa500';
                        document.getElementById('checkDonatePayBtn').disabled = false;
                    } else if (isManual) {
                        document.getElementById('donatePayStatusText').textContent =
                            '⏳ 尚未收到付款，请确认后重试';
                        document.getElementById('checkDonatePayBtn').disabled = false;
                    }
                })
                .catch(() => {
                    donateBackoffCount++;
                    donatePollInterval = Math.min(
                        POLL_CONFIG.BACKOFF_BASE * Math.pow(2, donateBackoffCount),
                        POLL_CONFIG.BACKOFF_MAX
                    );
                    if (isManual) {
                        document.getElementById('donatePayStatusText').textContent =
                            '⚠️ 网络异常，请检查网络';
                        document.getElementById('checkDonatePayBtn').disabled = false;
                    }
                });
        }

        function scheduleDonatePoll(orderNo) {
            if (!orderNo || document.hidden) return;
            donatePollTimer = setTimeout(() => {
                checkDonatePayment(orderNo);
                scheduleDonatePoll(orderNo);
            }, donatePollInterval);
        }

        function stopDonatePolling() {
            if (donatePollTimer) {
                clearTimeout(donatePollTimer);
                donatePollTimer = null;
            }
            donatePollCount = 0;
            donateBackoffCount = 0;
        }

        function showPayModal() {
            const payModal = document.getElementById('payModal');
            const payPriceText = document.getElementById('payPriceText');
            const payStatusText = document.getElementById('payStatusText');
            const payQRImage = document.getElementById('payQRImage');
            const payQRLoading = document.getElementById('payQRLoading');
            const checkPayBtn = document.getElementById('checkPayBtn');

            if (!payModal) {
                callDeepSeekAPI();
                return;
            }

            const n = AppState.selectedSpread?.cardCount || 0;
            const price = getPriceInYuan(n);
            const priceText = getPriceText(n);
            const title = `塔罗牌阵解读-${AppState.selectedSpread?.name || '占卜'}`;

            payPriceText.textContent = n
                ? `当前选择 ${n} 张牌阵，建议打赏：${priceText}，谢谢客官光顾`
                : '谢谢客官的支持≽^ ⦁ ⩊ ⦁ ^≼';
            payStatusText.textContent = '';
            payQRImage.style.display = 'none';
            payQRLoading.style.display = 'block';
            checkPayBtn.disabled = true;
            payModal.style.display = 'flex';

            // 重置轮询状态
            payPollCount = 0;
            payBackoffCount = 0;
            payPollCurrentInterval = POLL_CONFIG.INTERVAL;
            payVisibilityPaused = false;
            stopPayPolling();

            // 调后端创建订单
            fetch('/api/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price, title })
            })
            .then(res => res.json())
            .then(data => {
                if (!data.ok) {
                    payStatusText.textContent = '❌ 下单失败，请重试：' + (data.msg || '未知错误');
                    payStatusText.style.color = '#ff6b6b';
                    payQRLoading.style.display = 'none';
                    checkPayBtn.disabled = false;
                    checkPayBtn.textContent = '🔄 重新下单';
                    checkPayBtn.onclick = () => {
                        checkPayBtn.textContent = '我已付款 ✅';
                        checkPayBtn.style.color = '';
                        payStatusText.style.color = '';
                        showPayModal();
                    };
                    return;
                }

                // 渲染二维码
                payQRLoading.style.display = 'none';
                payQRImage.src = data.qrCode;
                payQRImage.style.display = 'block';
                checkPayBtn.disabled = false;
                checkPayBtn.textContent = '我已付款 ✅';

                // 存储当前订单号
                window.__tarotCurrentOrder = data.orderNo;

                // 提示轮询中
                payStatusText.textContent = '⏳ 等待付款中...';

                // 启动轮询
                scheduleNextPoll(data.orderNo);
            })
            .catch(err => {
                payStatusText.textContent = '❌ 网络错误，下单失败：' + err.message;
                payStatusText.style.color = '#ff6b6b';
                payQRLoading.style.display = 'none';
                checkPayBtn.disabled = false;
                checkPayBtn.textContent = '🔄 重新下单';
                checkPayBtn.onclick = () => {
                    checkPayBtn.textContent = '我已付款 ✅';
                    payStatusText.style.color = '';
                    showPayModal();
                };
            });

            // 关闭按钮
            document.getElementById('closePayModal').addEventListener('click', () => {
                stopPayPolling();
                payModal.style.display = 'none';
            });

            // "我已付款"按钮
            checkPayBtn.onclick = () => {
                const orderNo = window.__tarotCurrentOrder;
                if (!orderNo) return;
                payStatusText.textContent = '🔍 正在检查支付状态...';
                payStatusText.style.color = '';
                checkPayBtn.disabled = true;
                pollPaymentStatus(orderNo, true);
            };
        }

        function pollPaymentStatus(orderNo, isManual = false) {
            if (!orderNo) return;

            payPollCount++;
            if (payPollCount > POLL_CONFIG.MAX_COUNT) {
                stopPayPolling();
                const statusEl = document.getElementById('payStatusText');
                statusEl.textContent = '⏰ 支付超时（15分钟），请重新下单';
                statusEl.style.color = '#ffa500';
                const btn = document.getElementById('checkPayBtn');
                btn.disabled = false;
                btn.textContent = '🔄 重新下单';
                btn.onclick = () => {
                    btn.textContent = '我已付款 ✅';
                    document.getElementById('payStatusText').style.color = '';
                    showPayModal();
                };
                return;
            }

            fetch('/api/check-order?orderNo=' + encodeURIComponent(orderNo))
                .then(res => res.json())
                .then(data => {
                    // 重置退避
                    payBackoffCount = 0;
                    payPollCurrentInterval = POLL_CONFIG.INTERVAL;

                    if (data.paid) {
                        // 支付成功！
                        stopPayPolling();
                        const statusEl = document.getElementById('payStatusText');
                        statusEl.textContent = '✅ 支付成功！正在获取解牌结果...';
                        statusEl.style.color = '#4caf50';
                        document.getElementById('checkPayBtn').disabled = true;
                        document.getElementById('closePayModal').style.pointerEvents = 'none';

                        setTimeout(() => {
                            document.getElementById('payModal').style.display = 'none';
                            callDeepSeekAPI();
                        }, 1500);
                    } else if (data.status === 'not_found') {
                        // 订单丢失（冷启动/多实例）
                        stopPayPolling();
                        const statusEl = document.getElementById('payStatusText');
                        statusEl.textContent = '⚠️ 订单已过期，请关闭弹窗重新抽取牌阵';
                        statusEl.style.color = '#ffa500';
                        document.getElementById('checkPayBtn').disabled = false;
                    } else if (isManual) {
                        document.getElementById('payStatusText').textContent =
                            '⏳ 尚未收到付款，请确认已完成支付后重试';
                        document.getElementById('checkPayBtn').disabled = false;
                    }
                })
                .catch(() => {
                    // 网络错误 — 指数退避
                    payBackoffCount++;
                    payPollCurrentInterval = Math.min(
                        POLL_CONFIG.BACKOFF_BASE * Math.pow(2, payBackoffCount),
                        POLL_CONFIG.BACKOFF_MAX
                    );

                    if (isManual) {
                        document.getElementById('payStatusText').textContent =
                            '⚠️ 网络异常，请检查网络后重试';
                        document.getElementById('checkPayBtn').disabled = false;
                    }
                });
        }

        function scheduleNextPoll(orderNo) {
            if (!orderNo || document.hidden) return;
            payPollTimer = setTimeout(() => {
                pollPaymentStatus(orderNo);
                scheduleNextPoll(orderNo);
            }, payPollCurrentInterval);
        }

        function stopPayPolling() {
            if (payPollTimer) {
                clearTimeout(payPollTimer);
                payPollTimer = null;
            }
            payPollCount = 0;
        }

        async function callDeepSeekAPI() {
            const apiContent = document.getElementById('apiContent');
            const loadingIndicator = document.getElementById('loadingIndicator');
            const restartBtn = document.getElementById('restartBtn');
            const resultBtnRow = document.getElementById('resultBtnRow');
            const progressBar = document.getElementById('magicProgressBar');
            const progressText = document.getElementById('magicProgressText');

            let progressCompleted = false;

            // Staged fake progress
            const stages = [
                { width: 20,  dt: ['与宇宙建立连接中...≽^-⩊-^≼', '与宇宙建立连接中...<br>≽^-⩊-^≼'],       delay: 0 },
                { width: 45,  dt: ['牌灵正在低语...✨',              '牌灵正在低语...<br>✨'],                  delay: 900 },
                { width: 70,  dt: ['在编织你的解读...🌟',            '在编织你的解读...<br>🌟'],                delay: 2400 },
                { width: 88,  dt: ['即将揭晓...🔮',                  '即将揭晓...<br>🔮'],                      delay: 4500 },
                { width: 95,  dt: ['星象已对齐，答案浮现...🌙',       '星象已对齐，答案浮现...<br>🌙'],           delay: 7000 },
            ];
            let stageIndex = 0;
            let stageTimer = null;

            function advanceStage() {
                if (progressCompleted) return;
                if (!progressBar || !progressText) return;
                const stage = stages[stageIndex];
                progressBar.style.width = stage.width + '%';
                const isMobile = window.innerWidth <= 768;
                progressText.innerHTML = isMobile
                    ? '<span class="mobile-text">' + stage.dt[1] + '</span>'
                    : '<span class="desktop-text">' + stage.dt[0] + '</span>';
                stageIndex++;
                if (stageIndex < stages.length) {
                    stageTimer = setTimeout(advanceStage, stages[stageIndex].delay);
                }
            }

            stageTimer = setTimeout(advanceStage, 400);

            function completeProgress() {
                progressCompleted = true;
                if (stageTimer) clearTimeout(stageTimer);
                if (progressBar) {
                    progressBar.style.transition = 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                    progressBar.style.width = '100%';
                }
            }

            const drawnText = AppState.drawnCards.map((c, i) => {
                return `[${c.position}] ${c.card.name} (${c.isReversed ? '逆位' : '正位'})`;
            }).join('\n');

            const systemPrompt = AppSettings.getReadingPrompt();
            
            const userPrompt = `请为我解读以下塔罗牌阵：
牌阵类型：${AppState.selectedSpread.name}
各牌位含义：${AppState.selectedSpread.positions.join(', ')}
用户问题：${AppState.question || '无具体问题，寻求普遍指引'}
抽取结果：
${drawnText}
请给出详细解读，包括每张牌在牌位中的具体含义、牌阵整体能量分析、以及给用户的建议。`;

            try {
                // 20 秒超时：移动端网络波动大，避免无限等待
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000);

                const response = await fetch('/api/proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ systemPrompt, userPrompt }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error || `服务器错误 (${response.status})`);
                }

                const data = await response.json();
                const fullText = data.choices[0].message.content;

                completeProgress();

                // Brief pause to show 100%, then fade out
                setTimeout(() => {
                    loadingIndicator.style.opacity = '0';
                    loadingIndicator.style.transform = 'translateY(-20px)';
                    
                    setTimeout(() => {
                        loadingIndicator.style.display = 'none';
                        
                        apiContent.style.display = 'block';
                        apiContent.innerHTML = formatAPIContent(fullText);
                        
                        apiContent.offsetHeight;
                        
                        apiContent.style.opacity = '1';
                        apiContent.style.transform = 'translateY(0)';
                        
                        restartBtn.style.opacity = '1';

                        resultBtnRow.style.display = 'flex';
                        resultBtnRow.offsetHeight;
                        resultBtnRow.style.opacity = '1';
                    }, 1200);
                }, 500);
                
                function formatAPIContent(text) {
                    let html = text.replace(/\n/g, '<br>');
                    // Bold to keyword tags
                    html = html.replace(/\*\*(.*?)\*\*/g, '<span class="keyword-tag">$1</span>');
                    // ### Headings to dividers
                    html = html.replace(/### (.*?)<br>/g, '<div class="api-divider"></div><h3 class="result-title-grad" style="text-align:center; margin-bottom:10px; font-size:1.4rem;">$1</h3>');
                    // ## Headings
                    html = html.replace(/## (.*?)<br>/g, '<div class="api-divider"></div><h2 class="result-title-grad" style="text-align:center; margin-bottom:12px; font-size:1.6rem;">$1</h2>');
                    // # Headings
                    html = html.replace(/# (.*?)<br>/g, '<div class="api-divider"></div><h1 class="result-title-grad" style="text-align:center; margin-bottom:15px; font-size:1.8rem;">$1</h1>');
                    return html;
                }
                
            } catch (error) {
                completeProgress();
                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                    apiContent.style.display = 'block';
                    apiContent.style.opacity = '1';
                    apiContent.style.transform = 'translateY(0)';

                    // 区分超时、网络错误、服务器错误
                    let errorMsg;
                    if (error.name === 'AbortError') {
                        errorMsg = '⏱️ 请求超时，网络较慢，请重试';
                    } else if (error.message === 'Failed to fetch' || error.message === 'Load failed') {
                        errorMsg = '📡 网络连接失败，请检查网络后重试';
                    } else if (error.message && error.message.includes('服务器错误')) {
                        errorMsg = `🖥️ ${error.message}`;
                    } else {
                        errorMsg = `❌ 发生错误：${error.message}`;
                    }

                    apiContent.innerHTML += `<br><br><span style="color: #ff6b6b;">${errorMsg}</span>
                        <br><br><button class="btn" id="retryDeepSeekBtn" style="margin-top: 12px; font-size: 0.95rem;">🔄 重新获取解读</button>`;

                    document.getElementById('retryDeepSeekBtn').addEventListener('click', () => {
                        // 清理重试按钮和错误文本
                        apiContent.innerHTML = '';
                        apiContent.style.display = 'none';
                        loadingIndicator.style.display = 'block';
                        loadingIndicator.style.opacity = '1';
                        loadingIndicator.style.transform = 'translateY(0)';
                        // 重置进度条
                        const magicBar = document.getElementById('magicProgressBar');
                        if (magicBar) {
                            magicBar.style.width = '0%';
                            magicBar.style.transition = 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
                        }
                        callDeepSeekAPI();
                    });

                    resultBtnRow.style.display = 'flex';
                    resultBtnRow.style.opacity = '1';
                }, 600);
            }
        }