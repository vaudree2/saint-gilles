/* ===== Vaudrée 2 : horaires + outils partagés (source unique) =====
   0 = dimanche … 6 = samedi. [] = fermé. Fermeture après minuit gérée ("01:00").
   Modifiez UNIQUEMENT ici : accueil, carte, suggestions et précommande suivent. */
(function (w) {
  const CFG = {
    HORAIRES: {
      0: [["11:30", "22:00"]],            // À VÉRIFIER : dimanche ouvert ? Mettre [] si fermé
      1: [],
      2: [["11:30", "14:30"], ["18:00", "23:00"]],
      3: [["11:30", "14:30"], ["18:00", "23:00"]],
      4: [["11:30", "14:30"], ["18:00", "23:00"]],
      5: [["11:30", "14:30"], ["18:00", "01:00"]],
      6: [["11:30", "15:00"], ["18:00", "01:00"]]
    },
    /* "MM-JJ" = chaque année · "AAAA-MM-JJ" = date précise · [] = fermé */
    EXCEPTIONS: { "12-25": [], "01-01": [], "12-31": [["18:00", "02:00"]] },
    TZ: "Europe/Brussels",
    PHONE: "04 223 18 80",
    TEL: "+32422318880",
    MIDI_UNTIL: 16 * 60, // avant 16h00 = service du midi
    JOURS: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
  };

  const pad = n => String(n).padStart(2, "0");
  const toMin = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const hh = m => { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + "h" + pad(m % 60); };
  const euro = v => Number(v).toLocaleString("fr-BE", { style: "currency", currency: "EUR" });
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shiftDate = (ds, n) => { const [y, m, d] = ds.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
  const dowOf = ds => new Date(ds + "T12:00:00Z").getUTCDay();
  const longDate = ds => new Date(ds + "T12:00:00Z").toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  function bxl() { // date + minute actuelles à Liège, quel que soit le fuseau du visiteur
    const p = new Intl.DateTimeFormat("en-CA", { timeZone: CFG.TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    const date = g("year") + "-" + g("month") + "-" + g("day");
    return { date, dow: dowOf(date), min: (Number(g("hour")) % 24) * 60 + Number(g("minute")) };
  }
  function servicesFor(ds) {
    if (ds in CFG.EXCEPTIONS) return CFG.EXCEPTIONS[ds];
    const y = ds.slice(5);
    if (y in CFG.EXCEPTIONS) return CFG.EXCEPTIONS[y];
    return CFG.HORAIRES[dowOf(ds)] || [];
  }
  function creneaux(today) { // créneaux absolus en minutes depuis today 00:00 (hier → +8 jours)
    const out = [];
    for (let off = -1; off <= 8; off++) {
      servicesFor(shiftDate(today, off)).forEach(([a, b]) => {
        const s = toMin(a); let e = toMin(b); if (e <= s) e += 1440;
        out.push({ start: off * 1440 + s, end: off * 1440 + e });
      });
    }
    return out.sort((x, y) => x.start - y.start);
  }
  /* Suggestions valides pour une date (et un service "midi"/"soir" facultatif) */
  function suggestionsFor(ds, svc) {
    return (w.SUGGESTIONS || []).map((s, i) => Object.assign({ id: "s-" + i }, s)).filter(s =>
      (!s.du || ds >= s.du) && (!s.au || ds <= s.au) &&
      (!svc || !s.service || s.service === "tous" || s.service === svc));
  }

  /* Regroupe les suggestions en Entrée / Plat / Dessert (type: "entree" | "plat" | "dessert") */
  const TYPES = [["entree", "Entrées"], ["plat", "Plats"], ["dessert", "Desserts"]];
  function groupSuggestions(list) {
    const out = TYPES.map(([k, label]) => ({ key: k, label, items: list.filter(s => s.type === k) }));
    const autres = list.filter(s => !TYPES.some(([k]) => k === s.type));
    if (autres.length) out.push({ key: "autre", label: "Suggestions", items: autres });
    return out.filter(g => g.items.length);
  }

  w.V = Object.assign(CFG, { pad, toMin, hh, euro, esc, shiftDate, dowOf, longDate, bxl, servicesFor, creneaux, suggestionsFor, groupSuggestions });
})(window);
