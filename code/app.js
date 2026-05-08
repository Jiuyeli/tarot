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
                }, 600);
            });

            document.getElementById('entryStartBtn').addEventListener('click', () => {
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
        // ⚠️ 请在这里填入你的 DeepSeek API Key (注意保密，不要将此文件直接公开分享)
        const DEEPSEEK_API_KEY = 'sk-8b78610f0e31452c88f83ed4a99699cf'; // 例如: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx'

        const AppSettings = {
            apiKey: DEEPSEEK_API_KEY,
            musicUrl: 'sound_effect/first_light_particles_0.wav',
            volume: parseInt(localStorage.getItem('tarot_volume') || '40', 10),
            particles: parseInt(localStorage.getItem('tarot_particles') || '250', 10),
            sfxEnabled: localStorage.getItem('tarot_sfx') !== 'false',
            save() {
                localStorage.setItem('tarot_volume', this.volume);
                localStorage.setItem('tarot_particles', this.particles);
                localStorage.setItem('tarot_sfx', this.sfxEnabled);
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
                card.className = 'spread-card';
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
                card.className = 'category-card';
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
                card.className = 'spread-card';
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
                <div class="glass-panel" style="width: 100%; max-width: 600px; display: flex; flex-direction: column; align-items: center;">
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
                    <div class="input-group">
                        <label>第 ${i + 1} 个数字</label>
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" class="number-input" placeholder="1-78" data-index="${i}" autocomplete="off">
                    </div>
                `;
            }

            screen.innerHTML = `
                <div class="glass-panel meditation-box" id="meditationText">
                    <div class="corner-symbol top-left">✧</div>
                    <div class="corner-symbol top-right">✧</div>
                    <div class="corner-symbol bottom-left">✧</div>
                    <div class="corner-symbol bottom-right">✧</div>
                    ${promptText}
                </div>
                <div id="numberInputContainer" style="opacity: 0; transition: opacity 1s; display: flex; flex-direction: column; align-items: center;">
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
            
            allInputs.forEach((input, index) => {

                input.addEventListener('input', () => {
                    const val = input.value.replace(/[^0-9]/g, '');
                    input.value = val;

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
                <div class="glass-panel" style="width: 100%; max-width: 800px; padding: 30px;">
                    <div class="corner-symbol top-left">✧</div>
                    <div class="corner-symbol top-right">✧</div>
                    <div class="corner-symbol bottom-left">✧</div>
                    <div class="corner-symbol bottom-right">✧</div>
                    <div class="result-scroll-area">
                        <h2 class="spread-title" style="text-align: center; font-size: 2rem; margin-bottom: 20px;">解读结果</h2>
                        
                        <div id="loadingIndicator" style="text-align: center; margin: 40px 0; transition: opacity 1.2s ease, transform 1.2s ease;">
                            <div class="magic-loading-text">
                                <span class="desktop-text">魔法正在施展中≽^-⩊-^≼</span>
                                <span class="mobile-text">魔法正在施展中<br>≽^-⩊-^≼</span>
                            </div>
                            <div style="width: 80%; max-width: 300px; height: 4px; background: rgba(212, 168, 83, 0.2); border-radius: 2px; overflow: hidden; margin: 15px auto 0; position: relative; box-shadow: inset 0 0 5px rgba(0,0,0,0.5);">
                                <div id="magicProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, transparent, var(--color-gold), transparent); box-shadow: 0 0 10px var(--color-gold); animation: magicProgress 2s infinite ease-in-out;"></div>
                            </div>
                        </div>

                        <div id="apiContent" style="line-height: 1.8; font-size: 1.1rem; white-space: pre-wrap; display: none; opacity: 0; transform: translateY(20px); transition: opacity 1.5s ease, transform 1.5s ease;"></div>
                        <div class="btn-row" id="resultBtnRow" style="display: none; margin-top: 30px; opacity: 0; transition: opacity 1.5s ease 0.8s;">
                            <button class="btn" id="restartBtn">重新占卜</button>
                            <button class="btn" id="suggestBtn">💬 匿名建议</button>
                            <button class="btn" id="donateBtn">🎁 打赏作者</button>
                        </div>
                    </div>
                </div>

                <!-- Suggest Modal -->
                <div class="modal-overlay" id="suggestModal" style="display: none;">
                    <div class="modal-box">
                        <button class="modal-close" id="closeSuggestModal">&times;</button>
                        <h3 style="color: var(--color-gold); font-family: var(--font-title); margin-bottom: 16px;">💬 匿名建议箱</h3>
                        <textarea id="suggestText" placeholder="请输入你的匿名建议" style="width: 100%; height: 140px; padding: 12px; border-radius: 10px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.06); color: var(--color-white); font-family: var(--font-body); font-size: 0.95rem; resize: vertical; outline: none;"></textarea>
                        <button class="btn" id="sendSuggestBtn" style="margin-top: 14px; width: 100%;">提交建议</button>
                        <p id="suggestMsg" style="color: var(--color-gold); font-size: 0.85rem; margin-top: 10px; text-align: center; min-height: 20px;"></p>
                    </div>
                </div>

                <!-- Donate Modal -->
                <div class="modal-overlay" id="donateModal" style="display: none;">
                    <div class="modal-box">
                        <button class="modal-close" id="closeDonateModal">&times;</button>
                        <h3 style="color: var(--color-gold); font-family: var(--font-title); margin-bottom: 16px;">🎁 打赏作者</h3>
                        <p style="color: var(--color-gold-light); font-size: 0.85rem; margin-bottom: 6px;">一张牌3r，两张牌5r，三张牌6r，四张牌7.2r，五张牌8r，六张牌9r，七张牌10.5r，八张牌12r，九张牌13.5r，十张牌15r</p>
                        <p id="donatePriceText" style="color: var(--color-white); font-size: 1rem; margin-bottom: 16px; font-weight: 600;"></p>
                        <div class="qr-row">
                            <div class="qr-item">
                                <img src="money/Alipay.jpg" alt="支付宝" style="width: 100%; border-radius: 10px;">
                                <span style="color: var(--color-gold); font-size: 0.8rem; margin-top: 6px;">支付宝</span>
                            </div>
                            <div class="qr-item">
                                <img src="money/WechatPay.jpg" alt="微信" style="width: 100%; border-radius: 10px;">
                                <span style="color: var(--color-gold); font-size: 0.8rem; margin-top: 6px;">微信支付</span>
                            </div>
                        </div>
                        <p style="color: rgba(245,240,255,0.55); font-size: 0.78rem; text-align: center; margin-top: 14px; line-height: 1.6;">如果打赏多一点作者谢谢谢谢老板^›⩊‹^ ੭<br>少打赏一点也没关系噢，谢谢大家支持≽^ ⦁ ⩊ ⦁ ^≼</p>
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
                    @keyframes magicProgress {
                        0% { transform: translateX(-100%); width: 50%; }
                        100% { transform: translateX(200%); width: 50%; }
                    }
                </style>
            `;
            screen.innerHTML = resultHTML;

            document.getElementById('restartBtn').addEventListener('click', () => {
                location.reload();
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
            document.getElementById('sendSuggestBtn').addEventListener('click', () => {
                const content = document.getElementById('suggestText').value.trim();
                if (!content) {
                    document.getElementById('suggestMsg').textContent = '请输入建议内容';
                    return;
                }
                window.open(`https://github.com/Jiuyeli/tarot/issues/new?body=${encodeURIComponent(content)}`, '_blank');
                document.getElementById('suggestText').value = '';
                document.getElementById('suggestMsg').textContent = '感谢你的反馈 ✅';
            });

            // --- Donate Modal ---
            const donateModal = document.getElementById('donateModal');
            document.getElementById('donateBtn').addEventListener('click', () => {
                const n = AppState.selectedSpread.cardCount;
                const prices = [null, '3r', '5r', '6r', '7.2r', '8r', '9r', '10.5r', '12r', '13.5r', '15r'];
                const price = prices[n] || '??r';
                document.getElementById('donatePriceText').textContent = `当前选择${n}张牌阵，建议打赏：${price}，谢谢客官光顾`;
                donateModal.style.display = 'flex';
            });
            function closeDonateModal() {
                donateModal.style.display = 'none';
            }
            document.getElementById('closeDonateModal').addEventListener('click', closeDonateModal);
            donateModal.addEventListener('click', (e) => {
                if (e.target === donateModal) closeDonateModal();
            });

            callDeepSeekAPI();
        }

        async function callDeepSeekAPI() {
            const apiContent = document.getElementById('apiContent');
            const loadingIndicator = document.getElementById('loadingIndicator');
            const restartBtn = document.getElementById('restartBtn');
            const resultBtnRow = document.getElementById('resultBtnRow');

            if (!AppSettings.apiKey) {
                loadingIndicator.style.display = 'none';
                apiContent.innerHTML = `<span style="color: #ff6b6b;">错误：未设置 DeepSeek API Key。请在 index.html 代码中的 DEEPSEEK_API_KEY 处填入您的 API Key。</span>`;
                resultBtnRow.style.display = 'flex';
                resultBtnRow.style.opacity = '1';
                return;
            }

            const drawnText = AppState.drawnCards.map((c, i) => {
                return `[${c.position}] ${c.card.name} (${c.isReversed ? '逆位' : '正位'})`;
            }).join('\n');

            const systemPrompt = "你是一位资深塔罗牌解读师，拥有20年占卜经验。你精通韦特塔罗、托特塔罗等多种体系。你的解读风格既专业又富有诗意，能够将牌面符号与提问者的生活情境巧妙连接。你总是先解读每张牌在特定牌位中的含义，然后综合分析整个牌阵的能量流动，最后给出温暖而有力的建议。使用流畅优美的中文。";
            
            const userPrompt = `请为我解读以下塔罗牌阵：
牌阵类型：${AppState.selectedSpread.name}
各牌位含义：${AppState.selectedSpread.positions.join(', ')}
用户问题：${AppState.question || '无具体问题，寻求普遍指引'}
抽取结果：
${drawnText}
请给出详细解读，包括每张牌在牌位中的具体含义、牌阵整体能量分析、以及给用户的建议。`;

            try {
                const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${AppSettings.apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'deepseek-chat',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.8,
                        max_tokens: 2048,
                        stream: false // Changed to false for one-time render
                    })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`API 错误 (${response.status}): ${errText}`);
                }

                const data = await response.json();
                const fullText = data.choices[0].message.content;

                // Smooth transition out for loading indicator
                loadingIndicator.style.opacity = '0';
                loadingIndicator.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                    
                    apiContent.style.display = 'block';
                    apiContent.innerHTML = formatAPIContent(fullText);
                    
                    // Trigger reflow
                    apiContent.offsetHeight;
                    
                    // Smooth transition in for result content
                    apiContent.style.opacity = '1';
                    apiContent.style.transform = 'translateY(0)';
                    
                    restartBtn.style.opacity = '1';

                    resultBtnRow.style.display = 'flex';
                    resultBtnRow.offsetHeight;
                    resultBtnRow.style.opacity = '1';
                }, 1200);
                
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
                loadingIndicator.style.display = 'none';
                apiContent.style.display = 'block';
                apiContent.style.opacity = '1';
                apiContent.style.transform = 'translateY(0)';
                apiContent.innerHTML += `<br><br><span style="color: #ff6b6b;">发生错误：${error.message}</span>`;
                resultBtnRow.style.display = 'flex';
                resultBtnRow.style.opacity = '1';
            }
        }