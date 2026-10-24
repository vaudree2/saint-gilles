/* ===== Nos suggestions gourmandes (source unique) =====
   Chaque suggestion a un TYPE : "entree", "plat" ou "dessert", et son PRIX.
   Le client peut choisir uniquement l'entrée et le dessert, par exemple.
   Elle apparaît automatiquement entre "du" et "au" (inclus) sur la page Suggestions,
   dans la carte et dans la précommande. service : "midi", "soir" ou "tous". Dates : AAAA-MM-JJ.

   Modèle à copier-coller :
   { type: "plat", nom: "Nom du plat", prix: 22, desc: "Description courte", du: "2026-11-02", au: "2026-11-08", service: "tous" },
*/
window.SUGGESTIONS = [
  // EXEMPLES À MODIFIER (valables jusqu'au 31/10, puis ils disparaissent tout seuls)
  { type: "entree",  nom: "Velouté de potimarron",           prix: 9.5, desc: "Crème, éclats de noisettes",        du: "2026-10-23", au: "2026-10-31", service: "tous" },
  { type: "plat",    nom: "Joue de porc braisée",            prix: 22,  desc: "Purée maison / Jus réduit",          du: "2026-10-23", au: "2026-10-31", service: "tous" },
  { type: "dessert", nom: "Tiramisu maison",                 prix: 8,   desc: "Mascarpone / Café / Cacao",          du: "2026-10-23", au: "2026-10-31", service: "tous" }
];
