(function(){
  function showResult(msg, ok){
    const el = document.getElementById('child-search-result');
    if(!el) return;
    el.textContent = msg;
    el.style.color = ok ? '#86efac' : '#fca5a5';
  }

  function searchChild(){
    const input = document.getElementById('child-search-input');
    const name = input && input.value ? input.value.trim() : '';
    if (!name) { showResult('Inserisci un nome.', false); return; }
    const norm = (typeof normalizeNameKey === 'function') ? normalizeNameKey(name) : name.toLowerCase();
    let teamId = '';
    try {
      if (typeof CHILD_TO_TEAM !== 'undefined' && CHILD_TO_TEAM[norm]) teamId = CHILD_TO_TEAM[norm];
      // also try raw-key contains match (case-insensitive) as tolerant fallback
      if (!teamId && typeof CHILD_TO_TEAM_RAW !== 'undefined') {
        const q = name.toLowerCase();
        const rawKeys = Object.keys(CHILD_TO_TEAM_RAW);
        for (let k of rawKeys) {
          const low = k.toLowerCase();
          if (low === q || low.includes(q) || q.includes(low) || low.split(' ')[0] === q) {
            teamId = CHILD_TO_TEAM[(typeof normalizeNameKey === 'function') ? normalizeNameKey(k) : k];
            break;
          }
        }
      }
    } catch(e) {}
    if (!teamId) {
      // try permissive lookup against raw keys (contains or first-token)
      try {
        if (typeof CHILD_TO_TEAM_RAW !== 'undefined') {
          const rawKeys = Object.keys(CHILD_TO_TEAM_RAW);
          const match = rawKeys.find(k => {
            const kn = (typeof normalizeNameKey === 'function') ? normalizeNameKey(k) : k.toLowerCase();
            if (kn === norm) return true;
            if (kn.includes(norm)) return true;
            const first = kn.split(' ')[0];
            if (first === norm) return true;
            return false;
          });
          if (match) teamId = CHILD_TO_TEAM[(typeof normalizeNameKey==='function'?normalizeNameKey(match):match)];
        }
      } catch(e) {}
      if (!teamId && typeof fuzzyFindTeam === 'function') teamId = fuzzyFindTeam(norm) || '';
    }
    if (teamId) {
      if (typeof highlightForChild === 'function') highlightForChild(teamId, name);
      const team = (typeof SQUADS !== 'undefined') ? SQUADS.find(s => s.id === teamId) : null;
      const macroLabel = team && typeof MACROS !== 'undefined' ? (MACROS[team.macro]?.label || team.macro) : '';
      // find animators for this child
      let animList = [];
      try { if (typeof getAnimatorsForChild === 'function') animList = getAnimatorsForChild(name).map(a=>a.name); } catch(e) {}
      const animText = animList.length ? ' — Animatori: ' + animList.join(', ') : '';
      showResult((team?.name || 'Squadra trovata') + (macroLabel ? ' — ' + macroLabel : '') + animText, true);
    } else {
        // if not found, compute fuzzy suggestions from explicit child list
        const el = document.getElementById('child-search-result');
        if (!el) { showResult('Bambino non trovato.', false); return; }
        const suggestions = [];
        try {
          if (typeof CHILD_TO_TEAM !== 'undefined') {
            const keys = Object.keys(CHILD_TO_TEAM);
            // use a simple distance metric if available
            const lev = typeof levenshtein === 'function' ? levenshtein : null;
            keys.forEach(k => {
              const d = lev ? lev(norm, k) : (norm === k ? 0 : 9999);
              suggestions.push({k,d,team:CHILD_TO_TEAM[k]});
            });
            suggestions.sort((a,b)=>a.d-b.d);
          }
        } catch(e) { /* ignore */ }
        if (suggestions.length) {
          const top = suggestions.slice(0,6);
          el.innerHTML = '<div style="color:#fca5a5;font-weight:700;margin-bottom:6px;">Bambino non trovato. Suggerimenti:</div>' +
            top.map(s => {
              // try to recover the original (non-normalized) label from the raw map if available
              let orig = s.k;
              try {
                if (typeof CHILD_TO_TEAM_RAW !== 'undefined') {
                  const rawKeys = Object.keys(CHILD_TO_TEAM_RAW);
                  const found = rawKeys.find(rk => (typeof normalizeNameKey === 'function' ? normalizeNameKey(rk) : rk) === s.k);
                  if (found) orig = found;
                }
              } catch(e) {}
              const safe = orig.replace(/'/g, "\\'");
              return `<div style="margin:2px 0;"><a href="#" onclick="applySuggestion('${safe}');return false;">${orig}</a> — ${s.team}</div>`;
            }).join('');
        } else {
          showResult('Bambino non trovato.', false);
        }
    }
  }

  function clearChildSearch(){
    const input = document.getElementById('child-search-input'); if (input) input.value = '';
    const el = document.getElementById('child-search-result'); if (el) el.textContent = '';
    const rows = document.querySelectorAll('#rankingBody tr'); rows.forEach(r => r.classList.remove('highlight-row'));
    const macroCards = document.querySelectorAll('#macroCards .photo-card'); macroCards.forEach(c => c.classList.remove('highlight-macro'));
  }

  // expose globally for inline onclick handlers
  window.searchChild = searchChild;
  window.clearChildSearch = clearChildSearch;

  // keyboard handler (script is loaded after DOM)
  try {
    const input = document.getElementById('child-search-input');
    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') searchChild(); });
    const btn = document.getElementById('child-search-btn'); if (btn) btn.addEventListener('click', searchChild);
  } catch(e) { /* ignore */ }
    // allow applying a suggestion from the generated list
    window.applySuggestion = function(originalName) {
      try {
        const norm = (typeof normalizeNameKey === 'function') ? normalizeNameKey(originalName) : originalName.toLowerCase();
        const teamId = (typeof CHILD_TO_TEAM !== 'undefined' && CHILD_TO_TEAM[norm]) ? CHILD_TO_TEAM[norm] : '';
        if (!teamId) return showResult('Suggerimento non valido.', false);
        // highlight and save as chosen child (store original name)
        if (typeof highlightForChild === 'function') highlightForChild(teamId, originalName);
        try { localStorage.setItem('genitori_child', JSON.stringify({ name: originalName, teamId })); } catch(e) {}
        const team = (typeof SQUADS !== 'undefined') ? SQUADS.find(s => s.id === teamId) : null;
        const macroLabel = team && typeof MACROS !== 'undefined' ? (MACROS[team.macro]?.label || team.macro) : '';
        showResult((team?.name || 'Squadra trovata') + (macroLabel ? ' — ' + macroLabel : ''), true);
      } catch(e) { showResult('Errore nell\'applicare il suggerimento.', false); }
    };
})();
