(function() {
  // i18n strings injected by the server into window.MW_I18N (see index.html)
  const T = window.MW_I18N || {};
  const t = (key, fallback) => T[key] || fallback;

  const state = { visited: new Set(), wishlist: new Set(), mode: 'visited', format: 'square' };

  const CONTINENT_MAP = {
    'AF':'AS','AL':'EU','DZ':'AF','AD':'EU','AO':'AF','AR':'SA','AM':'AS','AU':'OC','AT':'EU','AZ':'AS',
    'BS':'NA','BH':'AS','BD':'AS','BB':'NA','BY':'EU','BE':'EU','BZ':'NA','BJ':'AF','BT':'AS','BO':'SA',
    'BA':'EU','BW':'AF','BR':'SA','BN':'AS','BG':'EU','BF':'AF','BI':'AF','KH':'AS','CM':'AF','CA':'NA',
    'CV':'AF','CF':'AF','TD':'AF','CL':'SA','CN':'AS','CO':'SA','KM':'AF','CG':'AF','CD':'AF','CR':'NA',
    'CI':'AF','HR':'EU','CU':'NA','CY':'AS','CZ':'EU','DK':'EU','DJ':'AF','DM':'NA','DO':'NA','EC':'SA',
    'EG':'AF','SV':'NA','GQ':'AF','ER':'AF','EE':'EU','SZ':'AF','ET':'AF','FJ':'OC','FI':'EU','FR':'EU',
    'GA':'AF','GM':'AF','GE':'AS','DE':'EU','GH':'AF','GR':'EU','GD':'NA','GT':'NA','GN':'AF','GW':'AF',
    'GY':'SA','HT':'NA','HN':'NA','HU':'EU','IS':'EU','IN':'AS','ID':'AS','IR':'AS','IQ':'AS','IE':'EU',
    'IL':'AS','IT':'EU','JM':'NA','JP':'AS','JO':'AS','KZ':'AS','KE':'AF','KI':'OC','KP':'AS','KR':'AS',
    'KW':'AS','KG':'AS','LA':'AS','LV':'EU','LB':'AS','LS':'AF','LR':'AF','LY':'AF','LI':'EU','LT':'EU',
    'LU':'EU','MG':'AF','MW':'AF','MY':'AS','MV':'AS','ML':'AF','MT':'EU','MH':'OC','MR':'AF','MU':'AF',
    'MX':'NA','FM':'OC','MD':'EU','MC':'EU','MN':'AS','ME':'EU','MA':'AF','MZ':'AF','MM':'AS','NA':'AF',
    'NR':'OC','NP':'AS','NL':'EU','NZ':'OC','NI':'NA','NE':'AF','NG':'AF','MK':'EU','NO':'EU','OM':'AS',
    'PK':'AS','PW':'OC','PA':'NA','PG':'OC','PY':'SA','PE':'SA','PH':'AS','PL':'EU','PT':'EU','QA':'AS',
    'RO':'EU','RU':'EU','RW':'AF','KN':'NA','LC':'NA','VC':'NA','WS':'OC','SM':'EU','ST':'AF','SA':'AS',
    'SN':'AF','RS':'EU','SC':'AF','SL':'AF','SG':'AS','SK':'EU','SI':'EU','SB':'OC','SO':'AF','ZA':'AF',
    'SS':'AF','ES':'EU','LK':'AS','SD':'AF','SR':'SA','SE':'EU','CH':'EU','SY':'AS','TW':'AS','TJ':'AS',
    'TZ':'AF','TH':'AS','TL':'AS','TG':'AF','TO':'OC','TT':'NA','TN':'AF','TR':'AS','TM':'AS','TV':'OC',
    'UG':'AF','UA':'EU','AE':'AS','GB':'EU','US':'NA','UY':'SA','UZ':'AS','VU':'OC','VA':'EU','VE':'SA',
    'VN':'AS','YE':'AS','ZM':'AF','ZW':'AF','PS':'AS','XK':'EU','GL':'NA','EH':'AF'
  };

  // Only the sovereign countries that countrypick recognises — derived from CONTINENT_MAP.
  // Any GeoJSON feature whose ISO code is not in this set is a territory / dependency
  // and will be rendered as neutral land with no interaction.
  const VALID_CODES = new Set(Object.keys(CONTINENT_MAP));

  const TOTAL_COUNTRIES = 197;
  const GEOJSON_URL = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_50m_admin_0_countries.geojson';
  const GEOJSON_CACHE_KEY = 'cp_geojson_v1'; // bump version to invalidate cache

  let geojsonData = null, geojsonLayer = null, countryIndex = [];

  function loadGeoJSON() {
    try {
      const cached = localStorage.getItem(GEOJSON_CACHE_KEY);
      if (cached) return Promise.resolve(JSON.parse(cached));
    } catch(e) {}
    return fetch(GEOJSON_URL)
      .then(r => r.json())
      .then(data => {
        try { localStorage.setItem(GEOJSON_CACHE_KEY, JSON.stringify(data)); } catch(e) {}
        return data;
      });
  }

  // URL + localStorage state
  const LS_KEY = 'cp_map_v1';

  function encodeState() {
    const v = [...state.visited].sort().join(',');
    const w = [...state.wishlist].sort().join(',');
    const p = new URLSearchParams();
    if (v) p.set('v', v);
    if (w) p.set('w', w);
    return p.toString();
  }
  function decodeState() {
    const p = new URLSearchParams(window.location.search);
    const urlV = p.get('v'), urlW = p.get('w');
    if (urlV || urlW) {
      // URL params take priority (shared link)
      if (urlV) urlV.split(',').filter(c => VALID_CODES.has(c)).forEach(c => state.visited.add(c));
      if (urlW) urlW.split(',').filter(c => VALID_CODES.has(c)).forEach(c => state.wishlist.add(c));
    } else {
      // Fall back to localStorage for return visits
      try {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
          const obj = JSON.parse(saved);
          if (obj.v) obj.v.filter(c => VALID_CODES.has(c)).forEach(c => state.visited.add(c));
          if (obj.w) obj.w.filter(c => VALID_CODES.has(c)).forEach(c => state.wishlist.add(c));
        }
      } catch(e) {}
    }
  }
  function saveToUrl() {
    const qs = encodeState();
    window.history.replaceState(null, '', qs ? window.location.pathname + '?' + qs : window.location.pathname);
    // Also persist to localStorage so return visits restore the map
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        v: [...state.visited],
        w: [...state.wishlist]
      }));
    } catch(e) {}
  }

  function getCode(f) {
    const p = f.properties;
    return (p.ISO_A2 && p.ISO_A2 !== '-99' ? p.ISO_A2 : null) || p.ISO_A2_EH || p['ISO3166-1-Alpha-2'] || p.iso_a2 || null;
  }
  function getName(f) {
    const p = f.properties;
    return p.ADMIN || p.NAME_EN || p.NAME || p.name || 'Unknown';
  }

  const map = L.map('mw-map', {
    center: [20, 10], zoom: 2, minZoom: 2, maxZoom: 8,
    worldCopyJump: false, zoomControl: true, attributionControl: true,
    maxBounds: [[-85,-180],[85,180]], maxBoundsViscosity: 1.0
  }).setView([20, 10], 2);

  function isValid(code) { return code && VALID_CODES.has(code); }

  function styleFor(code) {
    const base = { color: '#6b5d47', weight: 0.5, lineJoin: 'round', lineCap: 'round' };
    if (!isValid(code)) return { ...base, fillColor: '#ddd6c4', fillOpacity: 1, color: '#bfb8a8', weight: 0.3, interactive: false };
    if (state.visited.has(code))  return { ...base, fillColor: '#b54e2b', fillOpacity: 0.88, color: '#7a3519', weight: 0.6 };
    if (state.wishlist.has(code)) return { ...base, fillColor: '#3e6273', fillOpacity: 0.88, color: '#22404e', weight: 0.6 };
    return { ...base, fillColor: '#e8ddc6', fillOpacity: 1 };
  }

  function updateStyle(code) {
    if (!geojsonLayer) return;
    geojsonLayer.eachLayer(l => { if (getCode(l.feature) === code) l.setStyle(styleFor(code)); });
  }

  function toggleCountry(code) {
    if (state.mode === 'visited') {
      if (state.visited.has(code)) state.visited.delete(code);
      else { state.visited.add(code); state.wishlist.delete(code); }
    } else if (state.mode === 'wishlist') {
      if (state.wishlist.has(code)) state.wishlist.delete(code);
      else { state.wishlist.add(code); state.visited.delete(code); }
    } else {
      state.visited.delete(code); state.wishlist.delete(code);
    }
    updateStyle(code);
    updateStats();
    saveToUrl();
  }

  function onEachCountry(feature, layer) {
    const code = getCode(feature);
    if (!isValid(code)) return; // territory / dependency — no interaction
    layer.on({
      click: () => toggleCountry(code),
      mouseover: (e) => { if (!state.visited.has(code) && !state.wishlist.has(code)) e.target.setStyle({ fillColor: '#dbcdb0' }); },
      mouseout:  (e) => { e.target.setStyle(styleFor(code)); }
    });
    layer.bindTooltip(getName(feature), { sticky: true, direction: 'top' });
  }

  loadGeoJSON().then(data => {
    geojsonData = data;
    geojsonLayer = L.geoJSON(data, { style: f => styleFor(getCode(f)), onEachFeature: onEachCountry }).addTo(map);
    data.features.forEach(f => {
      const code = getCode(f), name = getName(f);
      if (!isValid(code)) return;
      // Skip territories/dependencies that inherit a sovereign country's ISO code
      // via the ISO_A2_EH fallback (e.g. Ashmore & Cartier → AU, BIOT → GB).
      const type = f.properties.TYPE || '';
      if (type === 'Dependency' || type === 'Lease') return;
      countryIndex.push({ code, name, feature: f });
    });
    // Deduplicate by code — keep the first (sovereign) feature if the same
    // ISO code appears on multiple GeoJSON features (e.g. split territories)
    const _seen = new Set();
    countryIndex = countryIndex.filter(e => { if (_seen.has(e.code)) return false; _seen.add(e.code); return true; });
    countryIndex.sort((a, b) => a.name.localeCompare(b.name));
    updateStats();
  }).catch(() => {
    document.getElementById('mw-map').innerHTML = '<p style="padding:40px;text-align:center;color:#8a7f6e">' + t('mapError', 'Could not load map data. Please refresh.') + '</p>';
  });

  // Search
  const searchInput = document.getElementById('mw-search-input');
  const searchResults = document.getElementById('mw-search-results');
  let searchHighlight = -1, currentMatches = [];

  function stateLabel(code) {
    if (state.visited.has(code))  return { cls: 'is-visited',  label: t('visitedLabel', 'Visited') };
    if (state.wishlist.has(code)) return { cls: 'is-wishlist', label: t('wishlistLabel', 'Wishlist') };
    return { cls: '', label: t('addLabel', '— add') };
  }

  function renderSearch(matches, maxResults) {
    maxResults = maxResults || 20;
    currentMatches = matches; searchHighlight = -1;
    if (!matches.length) { searchResults.classList.remove('open'); return; }
    const modeHint = state.mode === 'visited' ? t('hintVisited', 'Click to mark as visited') : state.mode === 'wishlist' ? t('hintWishlist', 'Click to add to wishlist') : t('hintClear', 'Click to clear');
    const hint = '<div class="mw-search-hint">' + modeHint + ' · ' + t('hintRemove', 'click again to remove') + '</div>';
    const rows = matches.slice(0, maxResults).map((m, i) => {
      const s = stateLabel(m.code);
      return '<div class="mw-search-result ' + s.cls + '" data-idx="' + i + '" data-code="' + m.code + '">' +
        '<span class="state-dot"></span><span class="name">' + m.name + '</span><span class="state-label">' + s.label + '</span></div>';
    }).join('');
    searchResults.innerHTML = hint + rows;
    searchResults.classList.add('open');
    searchResults.querySelectorAll('.mw-search-result').forEach(el => {
      el.addEventListener('click', e => { e.stopPropagation(); selectResult(parseInt(el.dataset.idx)); });
    });
  }

  function updateSearchRow(code) {
    const row = searchResults.querySelector('.mw-search-result[data-code="' + code + '"]');
    if (!row) return;
    const s = stateLabel(code);
    row.classList.remove('is-visited', 'is-wishlist');
    if (s.cls) row.classList.add(s.cls);
    row.querySelector('.state-label').textContent = s.label;
  }

  function selectResult(idx) {
    const m = currentMatches[idx];
    if (!m) return;
    toggleCountry(m.code);
    updateSearchRow(m.code);
    searchInput.focus();
  }

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { searchResults.classList.remove('open'); return; }
    let matches;
    let maxResults = 20;
    if (q === '*') {
      // Show all countries sorted alphabetically
      matches = [...countryIndex];
      maxResults = countryIndex.length;
    } else {
      matches = countryIndex.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q);
      matches.sort((a, b) => { const aS = a.name.toLowerCase().startsWith(q) ? 0 : 1, bS = b.name.toLowerCase().startsWith(q) ? 0 : 1; return aS - bS || a.name.localeCompare(b.name); });
    }
    renderSearch(matches, maxResults);
  });

  searchInput.addEventListener('keydown', e => {
    const results = searchResults.querySelectorAll('.mw-search-result');
    if (e.key === 'ArrowDown') { e.preventDefault(); searchHighlight = Math.min(searchHighlight + 1, results.length - 1); results.forEach((r, i) => r.classList.toggle('highlight', i === searchHighlight)); results[searchHighlight]?.scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); searchHighlight = Math.max(searchHighlight - 1, 0); results.forEach((r, i) => r.classList.toggle('highlight', i === searchHighlight)); results[searchHighlight]?.scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'Enter') { e.preventDefault(); selectResult(searchHighlight >= 0 ? searchHighlight : 0); }
    else if (e.key === 'Escape') { searchResults.classList.remove('open'); searchInput.value = ''; searchInput.blur(); }
  });

  document.addEventListener('click', e => { if (!e.target.closest('.mw-search')) searchResults.classList.remove('open'); });

  // Stats
  function updateStats() {
    const v = state.visited.size, w = state.wishlist.size;
    const continents = new Set();
    state.visited.forEach(c => { if (CONTINENT_MAP[c]) continents.add(CONTINENT_MAP[c]); });
    const p = Math.round((v / TOTAL_COUNTRIES) * 100);
    document.getElementById('mw-stat-visited').textContent = v;
    document.getElementById('mw-stat-wishlist').textContent = w;
    document.getElementById('mw-stat-continents').textContent = continents.size;
    document.getElementById('mw-stat-percent').innerHTML = p + '<span style="font-size:16px">%</span>';
  }

  // Mode & format switches
  document.querySelectorAll('.mw-mode-switch button').forEach(btn => {
    btn.addEventListener('click', () => { document.querySelectorAll('.mw-mode-switch button').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); }); btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); state.mode = btn.dataset.mode; });
  });
  document.querySelectorAll('.mw-format-switch button').forEach(btn => {
    btn.addEventListener('click', () => { document.querySelectorAll('.mw-format-switch button').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); }); btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); state.format = btn.dataset.format; });
  });

  // Share menu
  const SHARE_ICONS = {
    link: '<svg viewBox="0 0 24 24"><path d="M10.59 13.41c.39.39 1.02.39 1.41 0a.996.996 0 0 0 0-1.41l-2.83-2.83a2.008 2.008 0 0 1 0-2.83L12 3.51c.78-.78 2.05-.78 2.83 0l2.83 2.83c.78.78.78 2.05 0 2.83l-.71.71c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l.71-.71c1.56-1.56 1.56-4.09 0-5.66L16.24 2.1c-1.56-1.56-4.09-1.56-5.66 0L7.76 4.93c-1.56 1.56-1.56 4.09 0 5.66l2.83 2.82zm2.82-2.82c-.39-.39-1.02-.39-1.41 0a.996.996 0 0 0 0 1.41l2.83 2.83c.78.78.78 2.05 0 2.83L12 20.49c-.78.78-2.05.78-2.83 0L6.34 17.66c-.78-.78-.78-2.05 0-2.83l.71-.71c.39-.39.39-1.02 0-1.41a.996.996 0 0 0-1.41 0l-.71.71c-1.56 1.56-1.56 4.09 0 5.66l2.83 2.83c1.56 1.56 4.09 1.56 5.66 0l2.83-2.83c1.56-1.56 1.56-4.09 0-5.66l-2.83-2.83z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
    email: '<svg viewBox="0 0 24 24"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>'
  };

  const shareBtn  = document.getElementById('mw-share-btn');
  const shareMenu = document.getElementById('mw-share-menu');

  function buildShareText() {
    const n = state.visited.size;
    if (!n) return t('shareTextEmpty', "I'm mapping out where I want to travel — what do you think?");
    if (n === 1) return t('shareTextOne', "I've been to 1 country so far. Here's my travel map — make yours free at countrypick.com");
    return t('shareTextMany', "I've been to {n} countries so far. Here's my travel map — make yours free at countrypick.com").replace('{n}', n);
  }

  function buildShareMenu() {
    const url = window.location.href, text = buildShareText();
    const eu = encodeURIComponent(url), et = encodeURIComponent(text);
    const links = [
      { label: t('copyLink',      'Copy link'),           icon: SHARE_ICONS.link,     action: 'copy' },
      { label: t('shareTwitter',  'Share on X (Twitter)'),icon: SHARE_ICONS.twitter,  href: 'https://twitter.com/intent/tweet?text=' + et + '&url=' + eu },
      { label: t('shareWhatsapp', 'Share on WhatsApp'),   icon: SHARE_ICONS.whatsapp, href: 'https://wa.me/?text=' + et + '%20' + eu },
      { label: t('shareTelegram', 'Share on Telegram'),   icon: SHARE_ICONS.telegram, href: 'https://t.me/share/url?url=' + eu + '&text=' + et },
      { label: t('emailLink',     'Email this link'),     icon: SHARE_ICONS.email,    href: 'mailto:?subject=' + encodeURIComponent(t('emailSubject', 'My travel map')) + '&body=' + et + '%20' + eu }
    ];
    if (navigator.share) links.push({ label: t('moreOptions', 'More options'), icon: SHARE_ICONS.link, action: 'native' });
    shareMenu.innerHTML =
      '<div class="share-header">' + t('shareTitle', 'Share this map') + '</div>' +
      '<div class="share-list">' + links.map(l => l.action
        ? '<button data-action="' + l.action + '" type="button"><span class="share-icon">' + l.icon + '</span><span>' + l.label + '</span></button>'
        : '<a href="' + l.href + '" target="_blank" rel="noopener noreferrer"><span class="share-icon">' + l.icon + '</span><span>' + l.label + '</span></a>'
      ).join('') + '</div>' +
      '<div class="share-note">' + t('instaNote', 'Instagram or TikTok? Use the Download image button and upload manually.') + '</div>';
    shareMenu.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (btn.dataset.action === 'copy') { try { await navigator.clipboard.writeText(url); showToast(t('copied', 'Link copied!')); } catch { prompt('Copy this link:', url); } }
        else if (btn.dataset.action === 'native') { try { await navigator.share({ title: t('nativeShareTitle', 'My Travel Map'), text, url }); } catch {} }
        closeShare();
      });
    });
    shareMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setTimeout(closeShare, 100)));
  }

  function openShare()  { buildShareMenu(); shareMenu.classList.add('open'); }
  function closeShare() { shareMenu.classList.remove('open'); }
  shareBtn.addEventListener('click', e => { e.stopPropagation(); shareMenu.classList.contains('open') ? closeShare() : openShare(); });
  document.addEventListener('click', e => { if (!e.target.closest('.mw-share-wrap')) closeShare(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeShare(); });

  function showToast(msg) {
    const t = document.getElementById('mw-toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  document.getElementById('mw-reset-btn').addEventListener('click', () => {
    if (!state.visited.size && !state.wishlist.size) return;
    if (!confirm(t('confirmReset', 'Clear your map? This cannot be undone.'))) return;
    state.visited.clear(); state.wishlist.clear();
    geojsonLayer.eachLayer(l => l.setStyle(styleFor(getCode(l.feature))));
    updateStats(); saveToUrl();
  });

  // Poster / download
  function buildMapSVG() {
    const ns = 'http://www.w3.org/2000/svg', VW = 1000, VH = 420;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + VH);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const bg = document.createElementNS(ns, 'rect');
    bg.setAttribute('width', VW); bg.setAttribute('height', VH); bg.setAttribute('fill', '#a8bfc9');
    svg.appendChild(bg);
    function proj([lon, lat]) { return [(lon + 180) * (VW / 360), ((85 - lat) / 140) * VH]; }
    function pathFor(geom) {
      const coords = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
      let d = '';
      coords.forEach(poly => poly.forEach(ring => { ring.forEach((pt, i) => { const [x, y] = proj(pt); d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1); }); d += 'Z'; }));
      return d;
    }
    geojsonData.features.forEach(f => {
      const code = getCode(f); if (code === 'AQ') return;
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', pathFor(f.geometry));
      // Territories / dependencies get a slightly dimmer fill so they don't appear selectable
      let fill = isValid(code) ? '#e8ddc6' : '#ddd6c4';
      let stroke = isValid(code) ? '#6b5d47' : '#bfb8a8';
      if (state.visited.has(code))  { fill = '#b54e2b'; stroke = '#7a3519'; }
      if (state.wishlist.has(code)) { fill = '#3e6273'; stroke = '#22404e'; }
      path.setAttribute('fill', fill); path.setAttribute('stroke', stroke);
      path.setAttribute('stroke-width', '0.4'); path.setAttribute('stroke-linejoin', 'round'); path.setAttribute('stroke-linecap', 'round');
      svg.appendChild(path);
    });
    return svg;
  }

  async function renderPoster(fmt) {
    const v = state.visited.size, w = state.wishlist.size;
    const continents = new Set(); state.visited.forEach(c => { if (CONTINENT_MAP[c]) continents.add(CONTINENT_MAP[c]); });
    const c = continents.size, p = Math.round((v / TOTAL_COUNTRIES) * 100);
    if (fmt === 'square') {
      document.getElementById('mw-ph-sq-v').textContent = v;
      document.getElementById('mw-ph-sq-w').textContent = w;
      document.getElementById('mw-ph-sq-c').textContent = c;
      const h = document.getElementById('mw-ph-square'); h.innerHTML = ''; h.appendChild(buildMapSVG());
    } else {
      document.getElementById('mw-ph-st-big').innerHTML = v + '<span class="small">' + t('countriesVisitedSmall', 'countries visited') + '</span>';
      document.getElementById('mw-ph-st-w').textContent = w;
      document.getElementById('mw-ph-st-c').textContent = c;
      document.getElementById('mw-ph-st-p').textContent = p + '%';
      const h = document.getElementById('mw-ph-story'); h.innerHTML = ''; h.appendChild(buildMapSVG());
    }
    const poster = document.getElementById('mw-poster-' + fmt);
    poster.style.top = '0'; poster.style.left = '0'; poster.style.zIndex = '-1';
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => setTimeout(r, 80));
    const canvas = await html2canvas(poster, { backgroundColor: '#f4efe6', scale: 1, useCORS: true, logging: false, width: 1080, height: fmt === 'square' ? 1080 : 1920 });
    poster.style.top = '-99999px'; poster.style.left = '-99999px';
    return new Promise(res => canvas.toBlob(b => res(b), 'image/png'));
  }

  document.getElementById('mw-download-btn').addEventListener('click', async () => {
    const btn = document.getElementById('mw-download-btn');
    const orig = btn.textContent; btn.textContent = t('generating', 'Generating…'); btn.disabled = true;
    try {
      const blob = await renderPoster(state.format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = 'my-travel-map-' + state.visited.size + '-countries-' + state.format + '.png';
      a.click(); URL.revokeObjectURL(url);
    } catch (err) { console.error(err); alert(t('error', 'Something went wrong. Please try again.')); }
    finally { btn.textContent = orig; btn.disabled = false; }
  });

  decodeState();
})();
