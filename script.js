document.addEventListener('DOMContentLoaded', () => {
    const GITHUB_REPO = "hantalah30/hawai-projects";
    const downloadBtn = document.getElementById('download-btn');
    const versionTag = document.getElementById('version-tag');
    const hudTl = document.querySelector('.hud-corner.tl');
    const hudBr = document.querySelector('.hud-corner.br');
    const bootOverlay = document.getElementById('boot-overlay');
    const discordApp = document.querySelector('.discord-app');
    const shutter = document.querySelector('.shutter-overlay');

    // 1. System Boot Sequence
    function bootSystem() {
        const progressBar = document.querySelector('.boot-progress');
        if (progressBar) progressBar.style.width = '100%';

        setTimeout(() => {
            if (bootOverlay) {
                bootOverlay.style.opacity = '0';
                setTimeout(() => {
                    bootOverlay.style.display = 'none';
                    if (discordApp) discordApp.classList.add('ready');
                    checkIdentity();
                }, 1000);
            }
        }, 1600);
    }

    // 2. Identity System
    const identityModal = document.getElementById('identity-modal');
    const usernameInput = document.getElementById('username-input');
    const saveNameBtn = document.getElementById('save-name-btn');
    const displayUsername = document.getElementById('display-username');
    const memberUsername = document.getElementById('member-username');
    const changeNameBtn = document.getElementById('change-name-btn');

    function updateIdentity(name) {
        if (!name) return;
        try {
            localStorage.setItem('hawaiproject_user', name);
        } catch (e) { console.error("LS Error", e); }
        
        if (displayUsername) displayUsername.textContent = name;
        if (memberUsername) memberUsername.textContent = name;
        if (identityModal) {
            identityModal.classList.remove('active');
            identityModal.style.display = 'none';
        }
    }

    function checkIdentity() {
        let savedName = null;
        try { savedName = localStorage.getItem('hawaiproject_user'); } catch (e) {}
        
        if (savedName) {
            updateIdentity(savedName);
        } else {
            if (identityModal) {
                identityModal.classList.add('active');
                identityModal.style.display = 'flex';
                if (usernameInput) usernameInput.focus();
            }
        }
    }

    if (saveNameBtn && usernameInput) {
        saveNameBtn.addEventListener('click', () => {
            const name = usernameInput.value.trim();
            if (name) updateIdentity(name);
        });
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const name = usernameInput.value.trim();
                if (name) updateIdentity(name);
            }
        });
    }

    if (changeNameBtn) {
        changeNameBtn.addEventListener('click', () => {
            if (identityModal) {
                identityModal.style.display = 'flex';
                identityModal.classList.add('active');
                if (usernameInput) usernameInput.focus();
            }
        });
    }

    // 3. Navigation Engine (Shutter Style)
    const pageSections = document.querySelectorAll('.page-section');
    const activeChannelTitle = document.getElementById('active-channel-name');

    function switchChannel(targetId, isInstant = false) {
        if (isInstant) {
            performSwitch(targetId);
            return;
        }

        if (shutter) shutter.classList.add('active');
        setTimeout(() => {
            performSwitch(targetId);
            setTimeout(() => {
                if (shutter) shutter.classList.remove('active');
            }, 100);
        }, 500);
    }

    function performSwitch(targetId) {
        const sourceItem = document.querySelector(`.channel-item[data-target="${targetId}"], .mobile-nav-item[data-target="${targetId}"]`);
        let channelName = targetId;
        if (sourceItem) {
            const nameEl = sourceItem.querySelector('.channel-name');
            const spanEl = sourceItem.querySelector('span:not(.channel-hash)');
            channelName = nameEl ? nameEl.textContent : (spanEl ? spanEl.textContent : targetId);
        }

        document.querySelectorAll('.channel-item, .mobile-nav-item').forEach(item => {
            if (item.getAttribute('data-target') === targetId) item.classList.add('active');
            else item.classList.remove('active');
        });

        if (activeChannelTitle) activeChannelTitle.textContent = channelName;

        pageSections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active');
                const reveals = section.querySelectorAll('.reveal');
                reveals.forEach((el, index) => {
                    el.classList.remove('active');
                    setTimeout(() => el.classList.add('active'), 100 + (index * 100));
                });
            } else {
                section.classList.remove('active');
            }
        });

        const scroller = document.getElementById('main-scroller');
        if (scroller) scroller.scrollTo(0, 0);
    }

    document.querySelectorAll('.channel-item, .mobile-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            if (target) switchChannel(target);
        });
    });

    // 4. Robust Download System (GitHub API)
    async function fetchLatestRelease() {
        if (!downloadBtn || !versionTag) return;
        try {
            const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            const version = data.tag_name;
            const exeAsset = data.assets.find(a => a.name.endsWith('.exe'));
            
            if (exeAsset) {
                downloadBtn.href = exeAsset.browser_download_url;
                versionTag.textContent = `LATEST: ${version}`;
                versionTag.style.color = "var(--p3r-cyan)";
            } else {
                downloadBtn.href = `https://github.com/${GITHUB_REPO}`;
                versionTag.textContent = "GITHUB PAGE";
            }
        } catch (e) {
            console.error("API Fetch Error", e);
            downloadBtn.href = `https://github.com/${GITHUB_REPO}`;
            versionTag.textContent = "STABLE BUILD";
        }
    }

    // 5. Payment Modal Logic
    const buyButtons = document.querySelectorAll('.btn-buy');
    const paymentModal = document.getElementById('payment-modal');
    const targetGameSpan = document.getElementById('target-game');
    const loadingProgress = document.querySelector('.loading-progress');
    const closeModalBtn = document.querySelector('.btn-close-modal');

    buyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const gameName = btn.getAttribute('data-game');
            if (targetGameSpan) targetGameSpan.textContent = gameName;
            if (paymentModal) paymentModal.classList.add('active');
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += 2;
                if (loadingProgress) loadingProgress.style.width = progress + '%';
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        alert(`REDIRECTING: Payment gateway for ${gameName}...`);
                        if (paymentModal) paymentModal.classList.remove('active');
                        if (loadingProgress) loadingProgress.style.width = '0%';
                    }, 500);
                }
            }, 30);
        });
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (paymentModal) paymentModal.classList.remove('active');
        });
    }

    // 6. HUD Dynamics
    function updateHUD() {
        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        const date = (now.getMonth() + 1).toString().padStart(2, '0') + "-" + now.getDate().toString().padStart(2, '0');
        if (hudTl) hudTl.setAttribute('data-content', `${time} / ${date} / HAWAI-NET`);
        if (hudBr) {
            const x = Math.floor(Math.random() * 9999);
            const y = Math.floor(Math.random() * 9999);
            hudBr.setAttribute('data-content', `COORD_${x}.${y} // STATUS_OK`);
        }
    }
    setInterval(updateHUD, 2000);
    updateHUD();

    // Start Everything
    bootSystem();
    switchChannel('welcome', true);
    fetchLatestRelease();

    console.log("%c HAWAI PROJECT : ABSOLUTE PERFECTION ", "background: #00f5ff; color: #000; font-weight: bold; font-size: 24px; padding: 10px; border: 4px solid #000;");
});




    // 1. Blokir Klik Kanan (Context Menu)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // 2. Blokir Shortcut Keyboard (F12, Ctrl+U, Ctrl+Shift+I, dll)
    document.addEventListener('keydown', function(e) {
        // Blokir F12
        if (e.key === 'F12') {
            e.preventDefault();
        }
        
        // Blokir Ctrl+U (View Source)
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
        }

        // Blokir Ctrl+Shift+I (Inspect Element) / Ctrl+Shift+J (Console) / Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
        }
        
        // Blokir Ctrl+S (Save Page)
        if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
        }
    });

    // 3. Tambahan: Bikin script pause kalau ada yang maksa buka dev tools (Anti-Debugging)
    // Peringatan: Ini bisa bikin performa sedikit turun, tapi lumayan bikin repot yang inspect
    setInterval(function() {
        debugger;
    }, 100);
