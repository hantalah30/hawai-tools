document.addEventListener('DOMContentLoaded', () => {
    const GITHUB_REPO = "hantalah30/hawai-projects";
    const downloadBtn = document.getElementById('download-btn');
    const versionTag = document.getElementById('version-tag');
    const cursor = document.querySelector('.custom-cursor');
    const hudTl = document.querySelector('.hud-tl');
    const hudBr = document.querySelector('.hud-br');

    // 1. Custom Cursor Logic (Desktop Only)
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        const hoverables = document.querySelectorAll('a, .card, button');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) rotate(45deg) scale(1.5)';
                cursor.style.background = 'var(--p3r-red)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) rotate(45deg) scale(1)';
                cursor.style.background = 'var(--p3r-cyan)';
            });
        });
    }

    // 2. HUD Dynamics
    function updateHUD() {
        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        const date = (now.getMonth() + 1).toString().padStart(2, '0') + "-" + now.getDate().toString().padStart(2, '0');
        if (hudTl) hudTl.textContent = `${time} / ${date} / HAWAI-NET`;
        
        if (hudBr) {
            const x = Math.floor(Math.random() * 1000);
            const y = Math.floor(Math.random() * 1000);
            hudBr.textContent = `COORD_${x}.${y} // STATUS: LINKED`;
        }
    }
    setInterval(updateHUD, 2000);
    updateHUD();

    // 3. Scroll Reveal Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // 4. GitHub API Logic with Fallback
    async function fetchLatestRelease() {
        try {
            downloadBtn.innerHTML = '<span class="btn-text">CHECKING...</span><span class="btn-bg"></span>';
            
            const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
            
            if (!response.ok) {
                // If rate limited or other error, jump to fallback
                throw new Error(`GitHub API Error: ${response.status}`);
            }
            
            const data = await response.json();
            const version = data.tag_name;
            const assets = data.assets;
            
            // Find .exe file (EXCLUDE Setup, Prioritize Direct/Portable)
            const exeAsset = assets.find(asset => asset.name.endsWith('.exe') && !asset.name.includes('Setup')) || 
                             assets.find(asset => asset.name.endsWith('.exe'));

            if (exeAsset) {
                downloadBtn.href = exeAsset.browser_download_url;
                downloadBtn.innerHTML = `<span class="btn-text">DOWNLOAD LATEST</span><span class="btn-bg"></span>`;
                versionTag.textContent = `VERSION ${version}`;
                console.log(`Latest release found: ${version} (${exeAsset.name})`);
            } else {
                throw new Error('No .exe asset found');
            }
        } catch (error) {
            console.warn('Falling back to direct GitHub release page due to error:', error);
            
            // FALLBACK: Point directly to the GitHub releases page
            downloadBtn.href = `https://github.com/${GITHUB_REPO}/releases/latest`;
            downloadBtn.innerHTML = `<span class="btn-text">GOTO RELEASES</span><span class="btn-bg"></span>`;
            versionTag.textContent = "GITHUB PAGE";
            
            // Keep button active so user can still click it
            downloadBtn.style.opacity = "1";
            downloadBtn.style.pointerEvents = "auto";
            downloadBtn.style.background = "var(--p3r-cyan)";
        }
    }

    fetchLatestRelease();

    // 5. Smooth Scroll Fix
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href') === '#' || (this.id !== 'download-btn')) {
                const targetId = this.getAttribute('href');
                if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                    e.preventDefault();
                    const target = document.querySelector(targetId);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    });

    console.log("%c HAWAI PROJECT : FULL OVERDRIVE ", "background: #ff0054; color: #fff; font-weight: bold; font-size: 20px; padding: 5px;");
});
