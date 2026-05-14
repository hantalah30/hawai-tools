document.addEventListener('DOMContentLoaded', () => {
    const GITHUB_REPO = "hantalah30/hawai-projects";
    const downloadBtn = document.getElementById('download-btn');
    const versionTag = document.getElementById('version-tag');

    // Reveal animations on scroll
    const observerOptions = {
        threshold: 0.1
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

    // Fetch Latest Release from GitHub
    async function fetchLatestRelease() {
        try {
            downloadBtn.textContent = "CHECKING VERSION...";
            
            const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            const version = data.tag_name;
            const assets = data.assets;
            
            // Find .exe file (EXCLUDE Setup, Prioritize Direct/Portable)
            const exeAsset = assets.find(asset => asset.name.endsWith('.exe') && !asset.name.includes('Setup')) || 
                             assets.find(asset => asset.name.endsWith('.exe'));

            if (exeAsset) {
                downloadBtn.href = exeAsset.browser_download_url;
                downloadBtn.textContent = "DOWNLOAD LATEST";
                versionTag.textContent = `VERSION ${version}`;
                console.log(`Latest release found: ${version} (${exeAsset.name})`);
            } else {
                console.warn('No .exe asset found in the latest release.');
                downloadBtn.textContent = "EXE NOT FOUND";
            }
        } catch (error) {
            console.error('Error fetching latest release:', error);
            versionTag.textContent = "OFFLINE";
            downloadBtn.textContent = "DOWNLOAD UNAVAILABLE";
            downloadBtn.style.opacity = "0.5";
            downloadBtn.style.pointerEvents = "none";
        }
    }

    fetchLatestRelease();

    // Custom Console Message
    console.log("%c HAWAI PROJECT ", "background: #00f5ff; color: #000; font-weight: bold; font-size: 20px; padding: 5px;");
    console.log("Status: Online. Persona vibe detected.");

    // Simple interaction for the cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add a little sound or additional effect here if needed
        });
    });

    // Smooth scroll for internal links
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
});
