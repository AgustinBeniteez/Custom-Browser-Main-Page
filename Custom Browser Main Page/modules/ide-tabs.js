/**
 * IDE-style tab switching for the settings panel.
 * Also handles live previews (clock, background, font).
 */

function initIdeTabs() {
    const tabs = document.querySelectorAll('.ide-tab');
    const panels = document.querySelectorAll('.ide-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            panels.forEach(p => {
                p.classList.remove('active');
                p.hidden = true;
            });

            // Activate clicked
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            const targetId = tab.dataset.tab;
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
                targetPanel.hidden = false;
            }

            // Update previews when switching to relevant tabs
            if (targetId === 'tab-clock') updateClockPreview();
            if (targetId === 'tab-background') updateBgPreview();
        });
    });

    // Keyboard navigation (left/right arrows between tabs)
    const tabList = document.querySelector('.ide-tabs');
    if (tabList) {
        tabList.addEventListener('keydown', e => {
            const tabsArr = Array.from(tabs);
            const currentIndex = tabsArr.indexOf(document.activeElement);
            if (currentIndex === -1) return;

            let newIndex;
            if (e.key === 'ArrowRight') newIndex = (currentIndex + 1) % tabsArr.length;
            else if (e.key === 'ArrowLeft') newIndex = (currentIndex - 1 + tabsArr.length) % tabsArr.length;
            else return;

            e.preventDefault();
            tabsArr[newIndex].focus();
            tabsArr[newIndex].click();
        });
    }
}

/** Update clock preview text and color */
function updateClockPreview() {
    const previewText = document.getElementById('ide-clock-preview-text');
    const colorInput = document.getElementById('color-reloj');
    const reloj = document.getElementById('reloj');

    if (previewText) {
        // Get current time from the main clock or fallback
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        previewText.textContent = `${h}:${m}`;

        if (colorInput) {
            previewText.style.color = colorInput.value;
        } else if (reloj) {
            previewText.style.color = getComputedStyle(reloj).color;
        }
    }

    // Watch for color changes
    const colorEl = document.getElementById('color-reloj');
    if (colorEl && !colorEl._ideWatching) {
        colorEl._ideWatching = true;
        colorEl.addEventListener('input', () => {
            if (previewText) previewText.style.color = colorEl.value;
        });
    }
}

/** Update background preview */
function updateBgPreview() {
    const previewEl = document.getElementById('ide-bg-preview');
    if (!previewEl) return;

    const bodyBg = document.body.style.backgroundImage;
    if (bodyBg && bodyBg !== 'none') {
        previewEl.style.backgroundImage = bodyBg;
    } else {
        // Try to get from localStorage
        try {
            const saved = localStorage.getItem('fondo-url');
            if (saved) {
                if (saved.startsWith('data:') || saved.startsWith('http') || saved.startsWith('blob:')) {
                    previewEl.style.backgroundImage = `url(${saved})`;
                } else {
                    previewEl.style.backgroundImage = `url(./${saved})`;
                }
            }
        } catch (_) { /* ignore */ }
    }
}

// Initialize when DOM is ready
function onReady() {
    initIdeTabs();
    // Initialize bg preview after a short delay to let background load
    setTimeout(updateBgPreview, 300);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
} else {
    onReady();
}

export { initIdeTabs, updateClockPreview, updateBgPreview };
