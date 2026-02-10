
// GHOST WRITER - LINKEDIN INJECTOR

const GHOST_ICON_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C14.21 4 16 5.79 16 8C16 10.21 14.21 12 12 12C9.79 12 8 10.21 8 8C8 5.79 9.79 4 12 4ZM12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z" fill="#6366f1"/>
</svg>
`;

function injectGhostButton() {
    // Target LinkedIn "Start a post" area
    const startPostButton = document.querySelector('.share-box-feed-entry__trigger');
    
    if (startPostButton && !document.getElementById('strategyos-ghost-btn')) {
        const ghostBtn = document.createElement('button');
        ghostBtn.id = 'strategyos-ghost-btn';
        ghostBtn.innerHTML = GHOST_ICON_SVG;
        ghostBtn.title = "Open StrategyOS Ghost Writer";
        ghostBtn.style.cssText = `
            border: none;
            background: rgba(99, 102, 241, 0.1);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        ghostBtn.onmouseover = () => { ghostBtn.style.background = 'rgba(99, 102, 241, 0.2)'; ghostBtn.style.transform = 'scale(1.1)'; };
        ghostBtn.onmouseout = () => { ghostBtn.style.background = 'rgba(99, 102, 241, 0.1)'; ghostBtn.style.transform = 'scale(1)'; };
        
        ghostBtn.onclick = (e) => {
            e.stopPropagation();
            alert("👻 StrategyOS Connected! (Sidebar coming soon)");
            // In future: Open iframe sidebar
            // chrome.runtime.sendMessage({ action: "open_sidebar" });
        };

        startPostButton.parentElement.appendChild(ghostBtn);
        console.log("👻 StrategyOS Injection Successful");
    }
}

// Observe DOM changes (SPA navigation)
const observer = new MutationObserver(() => {
    injectGhostButton();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial run
injectGhostButton();
