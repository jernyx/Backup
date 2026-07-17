// ==UserScript==
// @name         Website Shortcuts
// @namespace    http://tampermonkey.net/
// @version      1.9
// @match        https://discord.com/*
// @match        https://www.youtube.com/*
// @match        https://www.instagram.com/*
// @run-at       document-start
// @grant        none
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

    /*********************************************************
     * INSTAGRAM: INTERCEPT SPA NAVIGATIONS TO /
     *********************************************************/
    if (location.hostname === 'www.instagram.com') {

        const redirectToFollowing = () => {
            window.location.replace('https://www.instagram.com/?variant=following');
        };

        // Intercept pushState and replaceState (SPA navigation)
        const _pushState = history.pushState.bind(history);
        const _replaceState = history.replaceState.bind(history);

        const isRootNav = (url) =>
            url === '/' || url === 'https://www.instagram.com/';

        history.pushState = function(state, title, url) {
            if (isRootNav(url)) {
                redirectToFollowing();
                return;
            }
            return _pushState(state, title, url);
        };

        history.replaceState = function(state, title, url) {
            if (isRootNav(url)) {
                redirectToFollowing();
                return;
            }
            return _replaceState(state, title, url);
        };

        // Also catch popstate (back/forward button)
        window.addEventListener('popstate', () => {
            if (location.pathname === '/' && !location.search.includes('variant=following')) {
                redirectToFollowing();
            }
        });

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
    }

})();
