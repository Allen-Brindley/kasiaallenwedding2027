/*
 * Site language switcher (English / Polish).
 *
 * English is written directly in the HTML, so pages work without JS.
 * Elements that need translating carry data-i18n="key" (inner HTML) and/or
 * data-i18n-attr="attr:key;attr2:key2" (attributes). Polish strings live in
 * i18n.js (window.SITE_TRANSLATIONS.pl). The English originals are captured
 * from the page the first time they are swapped, so switching back restores
 * them exactly.
 *
 * Polish strings may contain <a data-a="n">text</a>: that link gets every
 * attribute (href, target, class...) of the nth link in the English
 * original, so long URLs never need copying into the translations.
 */
(function () {
    var STORAGE_KEY = 'siteLang';
    var LANGS = ['en', 'pl'];

    function readLang() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (LANGS.indexOf(stored) !== -1) return stored;
        } catch (e) {}
        return 'en';
    }

    function saveLang(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {}
    }

    var current = readLang();
    document.documentElement.lang = current;

    function lookup(lang, key) {
        if (lang === 'en') return undefined;
        var dict = (window.SITE_TRANSLATIONS || {})[lang];
        return dict ? dict[key] : undefined;
    }

    function capture(el) {
        if (el.__i18n) return el.__i18n;
        el.__i18n = {
            html: el.innerHTML,
            links: Array.prototype.map.call(el.querySelectorAll('a'), function (a) {
                return a.cloneNode(false);
            }),
            attrs: {}
        };
        return el.__i18n;
    }

    function restoreLinks(el, links) {
        el.querySelectorAll('a[data-a]').forEach(function (a) {
            var source = links[Number(a.getAttribute('data-a'))];
            a.removeAttribute('data-a');
            if (!source) return;
            Array.prototype.forEach.call(source.attributes, function (attr) {
                a.setAttribute(attr.name, attr.value);
            });
        });
    }

    function translateElement(el, lang) {
        var key = el.getAttribute('data-i18n');
        if (key) {
            var original = capture(el);
            var html = lookup(lang, key);
            if (html === undefined) {
                if (el.innerHTML !== original.html) el.innerHTML = original.html;
            } else {
                el.innerHTML = html;
                restoreLinks(el, original.links);
            }
        }

        var attrSpec = el.getAttribute('data-i18n-attr');
        if (attrSpec) {
            var store = capture(el).attrs;
            attrSpec.split(';').forEach(function (pair) {
                var parts = pair.split(':');
                var name = parts[0].trim();
                var attrKey = (parts[1] || '').trim();
                if (!name || !attrKey) return;
                if (!(name in store)) store[name] = el.getAttribute(name);
                var value = lookup(lang, attrKey);
                if (value === undefined) value = store[name];
                if (value === null) el.removeAttribute(name);
                else el.setAttribute(name, value);
            });
        }
    }

    function apply(lang) {
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-i18n], [data-i18n-attr]').forEach(function (el) {
            translateElement(el, lang);
        });
        updateSwitch();
        document.dispatchEvent(new CustomEvent('site:langchange', { detail: { lang: lang } }));
    }

    function setLang(lang) {
        if (LANGS.indexOf(lang) === -1) return;
        current = lang;
        saveLang(lang);
        apply(lang);
    }

    /* Lets page scripts show translated text they set at runtime
       (e.g. login errors): the English text is the fallback. */
    function setText(el, key, english) {
        el.setAttribute('data-i18n', key);
        el.textContent = english;
        el.__i18n = null;
        capture(el);
        translateElement(el, current);
    }

    /* ---------- Flag toggle ---------- */

    var FLAGS = {
        en: '<svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
            '<clipPath id="lang-flag-uk-t"><path d="M30,15h30v15zv15h-30zh-30v-15zv-15h30z"/></clipPath>' +
            '<rect width="60" height="30" fill="#012169"/>' +
            '<path d="M0,0L60,30M60,0L0,30" stroke="#fff" stroke-width="6"/>' +
            '<path d="M0,0L60,30M60,0L0,30" clip-path="url(#lang-flag-uk-t)" stroke="#C8102E" stroke-width="4"/>' +
            '<path d="M30,0v30M0,15h60" stroke="#fff" stroke-width="10"/>' +
            '<path d="M30,0v30M0,15h60" stroke="#C8102E" stroke-width="6"/>' +
            '</svg>',
        pl: '<svg viewBox="0 0 16 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
            '<rect width="16" height="5" fill="#fff"/>' +
            '<rect y="5" width="16" height="5" fill="#DC143C"/>' +
            '</svg>'
    };
    // Each button is labelled in its own language so it is recognisable to
    // the person who needs it.
    var LABELS = { en: 'English', pl: 'Polski' };

    var switcher = null;

    function updateSwitch() {
        if (!switcher) return;
        switcher.querySelectorAll('button[data-lang]').forEach(function (button) {
            var active = button.getAttribute('data-lang') === current;
            button.setAttribute('aria-pressed', String(active));
        });
    }

    function buildSwitch() {
        switcher = document.createElement('div');
        switcher.className = 'lang-switch';
        switcher.setAttribute('role', 'group');
        switcher.setAttribute('aria-label', 'Language');
        switcher.setAttribute('data-i18n-attr', 'aria-label:lang.group');

        LANGS.forEach(function (lang) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'lang-flag';
            button.setAttribute('data-lang', lang);
            button.setAttribute('lang', lang);
            button.setAttribute('aria-label', LABELS[lang]);
            button.title = LABELS[lang];
            button.innerHTML = FLAGS[lang];
            button.addEventListener('click', function () {
                setLang(lang);
            });
            switcher.appendChild(button);
        });

        document.body.appendChild(switcher);
        updateSwitch();

        if (document.body.classList.contains('home')) hideOverHero();
    }

    /* Home page: keep the flags out of the hero; show them once it has
       scrolled off screen. */
    function hideOverHero() {
        var hero = document.querySelector('section.hero');
        if (!hero || !('IntersectionObserver' in window)) return;
        switcher.classList.add('is-hidden');
        new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                switcher.classList.toggle('is-hidden', entry.isIntersecting);
            });
        }).observe(hero);
    }

    window.siteI18n = {
        getLang: function () { return current; },
        setLang: setLang,
        setText: setText,
        t: function (key, english) {
            var value = lookup(current, key);
            return value === undefined ? english : value;
        }
    };

    function init() {
        buildSwitch();
        if (current !== 'en') apply(current);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
