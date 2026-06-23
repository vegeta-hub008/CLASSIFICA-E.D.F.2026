// Import provided children -> team mapping and expose global maps
(function(){
  // raw mapping: exact labels provided by the user grouped per team
  const RAW = {
    /* Brucaliffi (ROSSI) */
    "laura coppola":"Brucaliffi","carolina allocca":"Brucaliffi","francesco orsi":"Brucaliffi","barletta matteo":"Brucaliffi","bifulco desirée":"Brucaliffi","bifulco alessandra":"Brucaliffi","butto mattia":"Brucaliffi","butto martina":"Brucaliffi","di bonito rosa":"Brucaliffi","marigliano michela":"Brucaliffi","marigliano maria":"Brucaliffi","robustella mario":"Brucaliffi","ubertone diego":"Brucaliffi","alena de lucia":"Brucaliffi","renato spera":"Brucaliffi","francesco luigi cavaliere":"Brucaliffi",

    /* Fanti */
    "manila mascolino":"Fanti","luca migliardini":"Fanti","noemi cecere":"Fanti","alosco serena":"Fanti","barone gioia maria":"Fanti","capuano giuseppe":"Fanti","cimmino sergio":"Fanti","coppola davide":"Fanti","cosenza alessio":"Fanti","de rosa vittoria":"Fanti","d'oriano irene":"Fanti","matrone raimondo":"Fanti","pollice alessandro":"Fanti","sautto serena":"Fanti","dario dente":"Fanti","francesca pia barriciano":"Fanti","giulia pia capomazza":"Fanti",

    /* Ostrichette */
    "alba colutta":"Ostrichette","cecilia allocca":"Ostrichette","della ragione denise":"Ostrichette","ferrante martina":"Ostrichette","ferrante sara":"Ostrichette","fiengo giovanni":"Ostrichette","lauro francesca":"Ostrichette","lucignano andrea":"Ostrichette","maiorano emanuele":"Ostrichette","maiorano elena":"Ostrichette","mascolino manuel":"Ostrichette","petrone francesco":"Ostrichette","francesco cecere":"Ostrichette","daniele sorrentino":"Ostrichette","scognamiglio francesca":"Ostrichette",

    /* Gemelli Pinco */
    "eleonora satta":"Gemelli Pinco","dante bianchini":"Gemelli Pinco","bellofiore antonio":"Gemelli Pinco","coppola maria francesca":"Gemelli Pinco","cossiga lorenzo":"Gemelli Pinco","cossiga gabriele":"Gemelli Pinco","della ragione gaia":"Gemelli Pinco","leone dalilah":"Gemelli Pinco","marino benedetta":"Gemelli Pinco","palmese serena":"Gemelli Pinco","rabbito davide":"Gemelli Pinco","rabbito antonio":"Gemelli Pinco","francesco gargiulo":"Gemelli Pinco","alessia de vita":"Gemelli Pinco","michele cerase":"Gemelli Pinco",

    /* Fiori Parlanti */
    "peppino lucignano":"Fiori Parlanti","cosentino margherita":"Fiori Parlanti","capomazza rodolfo":"Fiori Parlanti","carannante lucia":"Fiori Parlanti","carannante emanuele":"Fiori Parlanti","cortese martina":"Fiori Parlanti","d'aniello laura":"Fiori Parlanti","de lucia mattia":"Fiori Parlanti","de santi fabrizio":"Fiori Parlanti","elemento pasquale":"Fiori Parlanti","sgamato lucia":"Fiori Parlanti","zerella sofia":"Fiori Parlanti","asia sebastiano":"Fiori Parlanti","gennaro mirabella":"Fiori Parlanti","cristina banchini":"Fiori Parlanti",

    /* Stregatti */
    "eleonora di natale":"Stregatti","vincenzo cocciardo":"Stregatti","chiara zerella":"Stregatti","auriemma sofia":"Stregatti","cannavacciuolo francesco":"Stregatti","esposito mattia":"Stregatti","lubrano aurora":"Stregatti","ottieri leonardo":"Stregatti","paparone francesco":"Stregatti","solimeo ginevra":"Stregatti","valentino giacomo":"Stregatti","vollero federico":"Stregatti","giorgia falanga":"Stregatti","giorgia lauro":"Stregatti","gabriele piro":"Stregatti",

    /* Bianconigli */
    "luca scognamiglio":"Bianconigli","francesco di bonito":"Bianconigli","egor de lucia":"Bianconigli","abaci ilyas":"Bianconigli","blasone elisa":"Bianconigli","carnevale fernando":"Bianconigli","cimmelli lorenza":"Bianconigli","del giudice aurora":"Bianconigli","ferri domenico massimo":"Bianconigli","lubrano giuseppe":"Bianconigli","serio simone":"Bianconigli","trincone gabriele":"Bianconigli","trincone gloria":"Bianconigli","francesca palumbo":"Bianconigli","grazia coppola":"Bianconigli","vittoria viglietti":"Bianconigli",

    /* Cappellai Matti */
    "francesco avallone":"Cappellai Matti","alessandra cosentino":"Cappellai Matti","biondi adele":"Cappellai Matti","ciccarelli giuseppe":"Cappellai Matti","della monica davide pio":"Cappellai Matti","della monica noemi":"Cappellai Matti","di meo michele":"Cappellai Matti","falanga domenico":"Cappellai Matti","lubrino matteo":"Cappellai Matti","mirabella lucia":"Cappellai Matti","mirabella carla":"Cappellai Matti","petrone salvatore":"Cappellai Matti","manuela marchetti":"Cappellai Matti","francesca cammenatelli":"Cappellai Matti","guido spaccaforno":"Cappellai Matti",

    /* Non-Compleanni */
    "guliana robustella":"Non-Compleanni","daniele alaio":"Non-Compleanni","biondi salvatore":"Non-Compleanni","de lucia ethan":"Non-Compleanni","laisa danilo":"Non-Compleanni","laisa gabriele":"Non-Compleanni","marciano giovanni":"Non-Compleanni","mascolino marco":"Non-Compleanni","mascolino mattia":"Non-Compleanni","russolillo raffaele":"Non-Compleanni","russolillo fabio":"Non-Compleanni","volpe andrea":"Non-Compleanni","fabiana fiorito":"Non-Compleanni","mathias vitale":"Non-Compleanni","vincenzo sebastiano":"Non-Compleanni"
  };

  // simple normalizer (matches the one used elsewhere)
  function normalize(s){
    if(!s) return '';
    return s.normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9 ]/gi,'').toLowerCase().trim();
  }

  // wait until SQUADS is defined (script.js loads first then this file)
  function applyMapping(){
    if(typeof SQUADS === 'undefined' || !Array.isArray(SQUADS)) return false;
    // build a map from readable team fragment -> squad id
    const teamNameToId = {};
    SQUADS.forEach(s => {
      if(!s || !s.id) return;
      const nname = (s.name||s.id).toString();
      teamNameToId[normalize(nname)] = s.id;
      // also map short tokens
      const parts = nname.split(/\s+/).map(p=>normalize(p));
      parts.forEach(p=>{ if(p) teamNameToId[p] = s.id; });
    });

    const CHILD_TO_TEAM_RAW = {};
    const CHILD_TO_TEAM = {};
    Object.keys(RAW).forEach(orig => {
      const teamLabel = RAW[orig];
      const teamKey = normalize(teamLabel);
      const teamId = teamNameToId[teamKey] || teamNameToId[teamKey.split(' ')[0]] || null;
      if(teamId) {
        // IMPORTANT: search.js vuole SEMPRE un teamId (bruca/fanti/...) 
        CHILD_TO_TEAM_RAW[orig] = teamId;
        CHILD_TO_TEAM[ normalize(orig) ] = teamId;
      } else {
        // Se non troviamo il teamId corretto, NON mettere la label (rompe la ricerca).
        CHILD_TO_TEAM_RAW[orig] = '';
        CHILD_TO_TEAM[ normalize(orig) ] = '';
      }
    });

    // expose globally for other scripts (search.js expects these names)
    window.CHILD_TO_TEAM_RAW = CHILD_TO_TEAM_RAW;
    window.CHILD_TO_TEAM = CHILD_TO_TEAM;

    // persist a copy so admins can inspect via localStorage
    try{ localStorage.setItem('alice2025_children_raw', JSON.stringify(CHILD_TO_TEAM_RAW)); }catch(e){}
    try{ localStorage.setItem('alice2025_children_norm', JSON.stringify(CHILD_TO_TEAM)); }catch(e){}
    return true;
  }

  // try immediately, otherwise poll a few times
  if(!applyMapping()){
    let tries = 0;
    const t = setInterval(()=>{
      tries++; if(applyMapping() || tries>20) clearInterval(t);
    },150);
  }
})();
