// ==UserScript==
// @name         Website Shortcuts
// @namespace    http://tampermonkey.net/
// @version      1.9
// @match        https://discord.com/*
// @match        https://www.youtube.com/*
// @match        https://www.instagram.com/*
// @run-at       document-start
// @grant        none
// @updateURL    https://github.com/jernyx/Backup/raw/refs/heads/main/Browser/Tampermonkey/Website%20Shortcuts.js
// @downloadURL  https://github.com/jernyx/Backup/raw/refs/heads/main/Browser/Tampermonkey/Website%20Shortcuts.js
// ==/UserScript==
(function () {
    'use strict';
    /*********************************************************
     * NAVIGATION REDIRECT LOGIC (HARD NAVIGATION ONLY)
     *********************************************************/
    const url = window.location.href;
    const navEntry = performance.getEntriesByType("navigation")[0];
    const navType = navEntry ? navEntry.type : "navigate";
    const isRoot = u => (
        u === "https://discord.com/" ||
        u === "https://www.youtube.com/" ||
        u === "https://www.instagram.com/"
    );
    // Only redirect if it's a hard navigation (typed URL / new tab)
    if (isRoot(url) && (navType === "navigate" || navType === undefined)) {
        setTimeout(() => {
            if (url === "https://discord.com/") {
                window.location.replace("https://discord.com/channels/604300214337273857/1245789037353111602");
            } else if (url === "https://www.youtube.com/") {
                window.location.replace("https://www.youtube.com/feed/subscriptions");
            } else if (url === "https://www.instagram.com/") {
                window.location.replace("https://www.instagram.com/?variant=following");
            }
        }, 0);
    }
    if (location.hostname === 'www.instagram.com') {
        /*********************************************************
         * FORCE INSTAGRAM TAB TITLE (DYNAMIC-SAFE)
         *********************************************************/
        const FORCED_TITLE = 'Instagram';
        const forceTitle = () => {
            if (document.title !== FORCED_TITLE) {
                document.title = FORCED_TITLE;
            }
        };
        forceTitle();
        const titleObserver = new MutationObserver(forceTitle);
        const observeTitle = () => {
            const titleEl = document.querySelector('title');
            if (titleEl) {
                titleObserver.observe(titleEl, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            } else {
                setTimeout(observeTitle, 50);
            }
        };
        observeTitle();
        setInterval(forceTitle, 500);

        /*********************************************************
         * INTERCEPT INSTAGRAM HOME LINK CLICKS → ?variant=following
         *********************************************************/
        // Intercept pushState to catch SPA navigations to "/"
        const _pushState = history.pushState.bind(history);
        history.pushState = function (state, title, url) {
            if (url === '/' || url === 'https://www.instagram.com/') {
                return _pushState(state, title, '/?variant=following');
            }
            return _pushState(state, title, url);
        };

        const _replaceState = history.replaceState.bind(history);
        history.replaceState = function (state, title, url) {
            if (url === '/' || url === 'https://www.instagram.com/') {
                return _replaceState(state, title, '/?variant=following');
            }
            return _replaceState(state, title, url);
        };

        // Also intercept clicks as a fallback
        document.addEventListener('click', function (e) {
            const a = e.target.closest('a');
            if (!a) return;
            const href = a.getAttribute('href');
            if (href === '/' || href === 'https://www.instagram.com/') {
                e.preventDefault();
                e.stopPropagation();
                history.pushState(null, '', '/?variant=following');
                window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
            }
        }, true); // capture phase so we run before Instagram's handlers
    }
})();
