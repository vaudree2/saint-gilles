/* ===== Nos suggestions gourmandes (source unique) =====
   Chaque suggestion a un TYPE : "entree", "plat" ou "dessert", et son PRIX.
   Le client peut choisir uniquement l'entrée et le dessert, par exemple.
   Elle apparaît automatiquement entre "du" et "au" (inclus) sur la page Suggestions,
   dans la carte et dans la précommande. service : "midi", "soir" ou "tous". Dates : AAAA-MM-JJ.

   Modèle à copier-coller :
   { type: "plat", nom: "Nom du plat", prix: 22, desc: "Description courte", du: "2026-11-02", au: "2026-11-08", service: "tous" },
*/
window.SUGGESTIONS = [
  { type: "plat",    nom: "Chicons au gratin traditionnel", prix: 18,  desc: "",  du: "2026-11-22", au: "2026-11-28", service: "tous" },
  { type: "plat",    nom: "Waterzooi de poulet",             prix: 21,  desc: "",  du: "2026-11-22", au: "2026-11-28", service: "tous" }
  // Pour ajouter une suggestion : copiez une ligne ci-dessus, changez le nom, le prix et les dates (du / au)
];
