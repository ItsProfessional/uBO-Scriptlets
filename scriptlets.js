'use strict';

// https://github.com/tastytypist/scriptlets/blob/e2a5f49eb52edd164ffbcc1c14f65b2057f8874e/scriptlets.js#L68-L110
/**
 * Redirects opened URL by replacing its hostname with the specified hostname.
 * @example
 * www.reddit.com##+js(rh, old.reddit.com)
 * @description
 * The scriptlet also accepts and optional token `exclude`, followed by a valid
 * string representation of hrefs we want to exclude from redirection.
 * @param {string} hostname - A valid string representation of a hostname we
 *                            want to be redirected to.
 * */
/// redirect-hostname.js
/// alias rh.js
/// world isolated
/// dependency safe-self.fn
function redirectHostname(hostname) {
    if (hostname === undefined) {
        return;
    }
    let targetOrigin;
    if (/^https?:\/\//.test(hostname)) {
        targetOrigin = hostname
    } else {
        targetOrigin = "https://" + hostname;
    }
    try {
        new URL(targetOrigin);
    } catch (error) {
        return;
    }
    const safe = safeSelf();
    const extraArgs = safe.getExtraArgs(Array.from(arguments), 1);
    if (extraArgs.exclude) {
        const reExclude = safe.patternToRegex(extraArgs.exclude);
        if (reExclude.test(window.location)) {
            return;
        }
    }
    window.location.replace(targetOrigin
        + window.location.pathname
        + window.location.search
        + window.location.hash
    );
}

// https://github.com/tastytypist/scriptlets/blob/e2a5f49eb52edd164ffbcc1c14f65b2057f8874e/scriptlets.js#L126-L171
// The built-in set-attr has restrictions on the values you can set, while this doesn't.
/**
 * Sets the specified attribute-value pair on the specified node at the
 * specified document loading state.
 * @example
 * github.com##+js(sa, html, data-color-mode, dark)
 * @param {string} selector - A valid CSS selector of the targeted DOM node.
 * @param {string} attribute - The name of the attribute being set.
 * @param {string} [value] - The value of the attribute being set.
 * @param {string} [when] - A valid value of the `Document.readyState` property.
 */
/// set-attribute.js
/// alias sa.js
/// world isolated
/// dependency run-at.fn
function setAttribute(selector, attribute, value, when) {
    if (selector === undefined || attribute === undefined) {
        return;
    }
    if (value === undefined) {
        value = "";
    }
    if (when === undefined) {
        when = "complete";
    }
    const setAttr = () => {
        const nodes = document.querySelectorAll(selector);
        try {
            nodes.forEach((node) => {
                node.setAttribute(attribute, value);
            });
        } catch (error) {
            console.log(error);
        }
    };
    const callback = (_, observer) => {
        observer.disconnect();
        setAttr();
        observer.observe(document.documentElement, {
            subtree: true, childList: true, attributeFilter: [attribute]
        });
    };
    function debounce(func, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }
    const debouncedCallback = debounce(callback, 20);
    const observer = new MutationObserver(debouncedCallback);
    runAt(() => {
        setAttr();
        observer.observe(document.documentElement, {
            subtree: true, childList: true, attributeFilter: [attribute]
        });
    }, when);
}
