/* ===== Relais Vaudrée 2 : notification GSM + (option) imprimante + tableau Google =====
   Reçoit la commande en plus de Formspree. Ne remplace PAS Formspree.
   Les secrets (jeton Telegram...) ne sont PAS dans ce fichier : ils sont dans
   Paramètres du projet > Propriétés du script (voir le guide). */

function prop_(k){ return PropertiesService.getScriptProperties().getProperty(k) || ""; }

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    if (p["_gotcha"]) return out_("ignored");                     // anti-robot

    if (p["beershop"]) {                                          // Beer Shop : pas de ticket ni de numéro
      var t = [
        "🎁 DEMANDE BEER SHOP — Vaudrée 2", "",
        "🛍 " + (p["type_commande"] || "?") + (p["type_biere"] ? " · " + p["type_biere"] : ""),
        "👤 " + (p["name"] || "") + " · 📞 " + (p["phone"] || ""),
        p["email"] ? "✉️ " + p["email"] : "",
        "🚚 " + (p["mode"] || "?") + (p["adresse"] ? " : " + p["adresse"] : ""),
        p["budget"] ? "💶 Budget : " + p["budget"] : "",
        p["date_souhaitee"] ? "📅 Souhaité pour le : " + p["date_souhaitee"] : "",
        "", p["message"] ? "📝 " + p["message"] : ""
      ].filter(function (x) { return x !== ""; }).join("\n");
      try { notifierTelegram_(t); } catch (err) { log_("telegram beershop", err); }
      try {
        if (emailValide_(p["email"])) {
          var mot = motDuJour_(plusJours_(0));
          var blocs = ["Bonjour " + (p["name"] || "") + ",",
            "Merci pour votre demande au Beer Shop du Vaudrée 2 ! Nous l'avons bien reçue et nous vous recontactons sous 24 h pour confirmer les détails, le prix et le paiement.",
            "Votre demande : " + (p["type_commande"] || "") + (p["message"] ? "\n" + p["message"] : ""),
            "Une question ? " + "04 223 18 80"];
          MailApp.sendEmail({ to: p["email"], name: "Vaudrée 2", subject: "Votre demande au Beer Shop du Vaudrée 2",
            body: blocs.join("\n\n") + "\n\n« " + mot + " »\n\nL'équipe du Vaudrée 2",
            htmlBody: mailHtml_("Merci pour votre demande", blocs, mot) });
        }
      } catch (err) { log_("e-mail beershop", err); }
      return out_("ok");
    }

    var texte, ligne;
    if (p["Téléphone"] && p["Date souhaitée"]) {                  // Précommande (page précommande)
      texte = [
        (String(p["Résumé de commande"] || "").indexOf("Aucune précommande") === 0 ? "📅 RÉSERVATION DE TABLE (sans plats) — Vaudrée 2" : "🍽️ NOUVELLE PRÉCOMMANDE — Vaudrée 2"),
        "",
        "📅 " + p["Date souhaitée"] + " à " + p["Heure souhaitée"] + " · " + p["Nombre de personnes"] + " pers.",
        "👤 " + p["Nom et prénom"] + " · 📞 " + p["Téléphone"],
        p["email"] ? "✉️ " + p["email"] : "",
        "",
        p["Résumé de commande"] || "",
        p["Allergies ou intolérances"] ? "\n⚠️ ALLERGIES : " + p["Allergies ou intolérances"] : "",
        p["Demandes particulières"] ? "\n📝 " + p["Demandes particulières"] : ""
      ].filter(function(x){ return x !== ""; }).join("\n");
    } else if (p["phone"] && p["date"] && p["people"]) {          // Réservation simple (site principal)
      texte = [
        "📅 NOUVELLE RÉSERVATION — Vaudrée 2",
        "",
        p["date"] + " à " + p["time"] + " · " + p["people"] + " pers.",
        "👤 " + p["name"] + " · 📞 " + p["phone"],
        p["email"] ? "✉️ " + p["email"] : "",
        p["message"] ? "\n📝 " + p["message"] : ""
      ].filter(function(x){ return x !== ""; }).join("\n");
    } else if (p["phone"] && p["commande"]) {                     // Commande à emporter (site principal)
      texte = [
        "🥡 NOUVELLE COMMANDE À EMPORTER — Vaudrée 2",
        "",
        "⏰ Retrait : " + p["pickup_time"],
        "👤 " + p["name"] + " · 📞 " + p["phone"],
        p["email"] ? "✉️ " + p["email"] : "",
        "",
        p["commande"]
      ].filter(function(x){ return x !== ""; }).join("\n");
    } else {
      return out_("incomplete");
    }

    var ticket = null;
    try { ticket = ticketDe_(p); ticket.num = numero_(ticket.date, ticket.heure); } catch (err) { log_("numéro", err); }
    if (ticket && ticket.num) texte = "🔢 N° " + ticket.num + "\n" + texte;

    var info = null;                                              // couverts du service, "presque complet", archive du jour
    try { if (ticket) info = enregistrer_(ticket, p); } catch (err) { log_("enregistrement", err); }
    if (info && info.presque) {
      ticket.alerte = "PRESQUE COMPLET : À CONFIRMER PAR TÉLÉPHONE";
      texte = "⚠️ PRESQUE COMPLET (" + info.total + "/" + info.seuil + " couverts, service du " + info.svc + ") : rappelez le client.\n" + texte;
    }
    try { if (p["newsletter"] && p["email"]) abonner_(p["email"], ticket ? ticket.nom : ""); } catch (err) { log_("newsletter", err); }
    try { if (ticket) emailClient_(ticket, p, info); } catch (err) { log_("e-mail client", err); }

    try { notifierTelegram_(texte); } catch (err) { log_("telegram", err); }
    try { imprimer_(texte); }        catch (err) { log_("imprimante", err); }
    try { classer_(p); }             catch (err) { log_("tableau", err); }
    try { if (ticket) enfiler_(ticket); } catch (err) { log_("file d'impression", err); }
    return out_("ok");
  } catch (err) { log_("global", err); return out_("error"); }
}

function notifierTelegram_(texte) {
  var token = prop_("TELEGRAM_TOKEN"), chat = prop_("TELEGRAM_CHAT_ID");
  if (!token) throw new Error("TELEGRAM_TOKEN manquant dans Propriétés du script");
  if (!chat) throw new Error("TELEGRAM_CHAT_ID manquant : lancez trouverChatId");
  var rep = UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "post", muteHttpExceptions: true,
    payload: { chat_id: chat, text: texte }
  });
  console.log("Telegram a répondu : " + rep.getResponseCode() + " " + rep.getContentText());
  if (rep.getResponseCode() !== 200) throw new Error("Telegram a refusé : " + rep.getContentText());
}

function imprimer_(texte) {                                       // option : e-mail vers l'imprimante
  var adr = prop_("PRINTER_EMAIL");
  if (!adr) return;
  MailApp.sendEmail(adr, "Précommande Vaudrée 2", texte);
}

function classer_(p) {                                            // option : tableau Google
  var id = prop_("SHEET_ID");
  if (!id) return;
  var sh = SpreadsheetApp.openById(id).getSheets()[0];
  sh.appendRow([new Date(), p["Date souhaitée"] || p["date"] || "", p["Heure souhaitée"] || p["time"] || p["pickup_time"] || "", p["Nombre de personnes"] || p["people"] || "",
    p["Nom et prénom"] || p["name"] || "", p["Téléphone"] || p["phone"] || "", p["email"] || "", p["Résumé de commande"] || p["commande"] || "",
    p["Allergies ou intolérances"] || "", p["Demandes particulières"] || p["message"] || ""]);
}

function log_(quoi, err) { console.error(quoi + " : " + err); }
function out_(s) { return ContentService.createTextOutput(s); }

/* Test depuis l'éditeur : menu Exécuter > testerRelais */
function testerRelais() {
  doPost({ parameter: {
    "Date souhaitée": "2026-11-01", "Heure souhaitée": "12:30", "Nombre de personnes": "2",
    "Nom et prénom": "TEST Vaudrée 2", "Téléphone": "0400 00 00 00",
    "Résumé de commande": "1 × Test plat — 10,00 €\n\nTOTAL INDICATIF : 10,00 €"
  }});
}

/* Étape d'installation : trouve tout seul votre identifiant Telegram (CHAT_ID).
   Prérequis : TELEGRAM_TOKEN enregistré, et vous avez écrit "bonjour" au robot.
   Exécutez-la UNE fois, puis regardez le journal d'exécution. */
function trouverChatId() {
  var token = prop_("TELEGRAM_TOKEN");
  if (!token) { console.log("TELEGRAM_TOKEN manquant (Propriétés du script)."); return; }
  var r = JSON.parse(UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/getUpdates").getContentText());
  var m = (r.result || []).filter(function(u){ return u.message; }).pop();
  if (!m) { console.log("Aucun message trouvé : écrivez 'bonjour' au robot puis relancez."); return; }
  PropertiesService.getScriptProperties().setProperty("TELEGRAM_CHAT_ID", String(m.message.chat.id));
  console.log("OK : CHAT_ID enregistré pour " + (m.message.chat.first_name || "") + ". Vous pouvez lancer testerRelais.");
}


/* ======================= POSTE D'IMPRESSION (ticket cuisine) =======================
   Chaque commande est mise en file d'attente. La page "poste-impression.html", ouverte sur
   l'ordinateur du restaurant, vient les chercher et les imprime sur l'Epson.
   L'accès est protégé par une clé secrète (propriété PRINT_KEY, voir creerCleImpression). */

/* Numéro de ticket : service du midi 001, 002, 003… ; service du soir 100, 101, 102…
   (on repart de zéro chaque jour de service ; midi = réservation avant 15h) */
function numero_(date, heure) {
  var d = /^\d{4}-\d{2}-\d{2}$/.test(String(date)) ? String(date) : Utilities.formatDate(new Date(), "Europe/Brussels", "yyyy-MM-dd");
  var m = String(heure || "").match(/(\d{1,2})/);
  var h = m ? parseInt(m[1], 10) : parseInt(Utilities.formatDate(new Date(), "Europe/Brussels", "H"), 10);
  var svc = h < 15 ? "midi" : "soir", base = svc === "midi" ? 0 : 99;
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties(), cle = "NUM_" + d + "_" + svc;
    var n = Number(props.getProperty(cle) || 0) + 1;
    props.setProperty(cle, String(n));
    var limite = Utilities.formatDate(new Date(new Date().getTime() - 14 * 24 * 3600 * 1000), "Europe/Brussels", "yyyy-MM-dd");
    Object.keys(props.getProperties()).forEach(function (k) {     // ménage : on oublie les compteurs de plus de 14 jours
      if (k.indexOf("NUM_") === 0 && k.slice(4, 14) < limite) props.deleteProperty(k);
    });
    return ("000" + (base + n)).slice(-3);
  } finally { lock.releaseLock(); }
}

function ticketDe_(p) {
  var t = { id: Utilities.getUuid().slice(0, 8), recu: Utilities.formatDate(new Date(), "Europe/Brussels", "HH:mm"),
            ts: new Date().getTime(), imprime: false };
  if (p["Téléphone"] && p["Date souhaitée"]) {                    // précommande / table
    var res = String(p["Résumé de commande"] || "");
    var sans = res.indexOf("Aucune précommande") === 0;
    t.genre = sans ? "RÉSERVATION DE TABLE" : "PRÉCOMMANDE";
    t.date = p["Date souhaitée"]; t.heure = p["Heure souhaitée"]; t.pers = p["Nombre de personnes"];
    t.nom = p["Nom et prénom"]; t.tel = p["Téléphone"];
    t.plats = sans ? "" : res.replace(/\n*Ce total est indicatif[^\n]*/g, "").trim();
    t.allergies = p["Allergies ou intolérances"] || ""; t.remarques = p["Demandes particulières"] || "";
  } else if (p["phone"] && p["date"] && p["people"]) {            // réservation simple
    t.genre = "RÉSERVATION"; t.date = p["date"]; t.heure = p["time"]; t.pers = p["people"];
    t.nom = p["name"]; t.tel = p["phone"]; t.plats = ""; t.allergies = ""; t.remarques = p["message"] || "";
  } else {                                                        // commande à emporter
    t.genre = "À EMPORTER"; t.date = ""; t.heure = p["pickup_time"]; t.pers = "";
    t.nom = p["name"]; t.tel = p["phone"]; t.plats = p["commande"] || ""; t.allergies = ""; t.remarques = "";
  }
  t.statut = "";
  t.jour = /^\d{4}-\d{2}-\d{2}$/.test(String(t.date)) ? String(t.date) : Utilities.formatDate(new Date(), "Europe/Brussels", "yyyy-MM-dd");
  return t;
}

/* Un ticket = une propriété (TK_...), pour ne jamais dépasser la limite de taille de Google. On garde 90 jours après le jour de service. */
function cleTicket_(t) { return "TK_" + ("0000000000000" + t.ts).slice(-13) + "_" + t.id; }

function enfiler_(t) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty(cleTicket_(t), JSON.stringify(t));
  var limite = Utilities.formatDate(new Date(new Date().getTime() - 90 * 24 * 3600 * 1000), "Europe/Brussels", "yyyy-MM-dd");
  Object.keys(props.getProperties()).forEach(function (k) {      // on supprime 90 jours après le jour de service
    if (k.indexOf("TK_") !== 0) return;
    try { if (jourDe_(JSON.parse(props.getProperty(k))) < limite) props.deleteProperty(k); } catch (e) {}
  });
}

function lireFile_() {
  var props = PropertiesService.getScriptProperties(), all = props.getProperties(), out = [];
  if (all["FILE_IMPRESSION"]) {                                   // reprise de l'ancien format (une seule fois)
    try { JSON.parse(all["FILE_IMPRESSION"]).forEach(function (t) { props.setProperty(cleTicket_(t), JSON.stringify(t)); }); } catch (e) {}
    props.deleteProperty("FILE_IMPRESSION"); all = props.getProperties();
  }
  Object.keys(all).forEach(function (k) {
    if (k.indexOf("TK_") === 0) { try { out.push(JSON.parse(all[k])); } catch (e) {} }
  });
  out.sort(function (a, b) { return a.ts - b.ts; });
  return out;
}

function majTicket_(id, fn) {
  var props = PropertiesService.getScriptProperties();
  Object.keys(props.getProperties()).forEach(function (k) {
    if (k.indexOf("TK_") === 0 && k.slice(-(id.length + 1)) === "_" + id) {
      var t = JSON.parse(props.getProperty(k)); fn(t); props.setProperty(k, JSON.stringify(t));
    }
  });
}

function jourDe_(t) {
  if (t.jour) return t.jour;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(t.date))) return String(t.date);
  return Utilities.formatDate(new Date(t.ts), "Europe/Brussels", "yyyy-MM-dd");
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === "capacite") {                                  // public : le site demande « presque complet ? » (aucune donnée perso)
    var sv = service_(p.heure), seuil = seuil_(sv), n = persNum_(p.pers);
    var tot = Number(prop_("COV_" + p.date + "_" + sv) || 0) + n;
    return json_({ ok: true, presque: tot >= seuil });
  }
  var cle = prop_("PRINT_KEY");
  if (!cle || p.key !== cle) return json_({ ok: false, erreur: "cle" });
  if (p.action === "pending") {                                   // seulement les 12 dernières heures : jamais de vieux tickets qui ressortent
    var limite = new Date().getTime() - 12 * 3600 * 1000;
    return json_({ ok: true, orders: lireFile_().filter(function (x) { return !x.imprime && x.ts > limite; }) });
  }
  if (p.action === "done" && p.id) { majTicket_(p.id, function (t) { t.imprime = true; }); return json_({ ok: true }); }
  if (p.action === "statut" && p.id) {
    var ok = ["", "prepa", "pret", "servi"];
    if (ok.indexOf(p.s || "") >= 0) majTicket_(p.id, function (t) { t.statut = p.s || ""; });
    return json_({ ok: true });
  }
  if (p.action === "recent") return json_({ ok: true, orders: lireFile_().slice(-10).reverse() });
  if (p.action === "jour") {                                      // toutes les commandes d'un jour de service
    var d = /^\d{4}-\d{2}-\d{2}$/.test(String(p.date)) ? p.date : Utilities.formatDate(new Date(), "Europe/Brussels", "yyyy-MM-dd");
    var l = lireFile_().filter(function (t) { return jourDe_(t) === d; });
    l.sort(function (a, b) { return (Number(a.num) || 0) - (Number(b.num) || 0) || a.ts - b.ts; });
    return json_({ ok: true, date: d, orders: l });
  }
  if (p.action === "mois") {                                      // toutes les commandes d'un mois (agenda)
    var m = /^\d{4}-\d{2}$/.test(String(p.mois)) ? p.mois : Utilities.formatDate(new Date(), "Europe/Brussels", "yyyy-MM");
    var lm = lireFile_().filter(function (t) { return jourDe_(t).slice(0, 7) === m; });
    lm.sort(function (a, b) { return jourDe_(a) < jourDe_(b) ? -1 : jourDe_(a) > jourDe_(b) ? 1 : (Number(a.num) || 0) - (Number(b.num) || 0) || a.ts - b.ts; });
    return json_({ ok: true, mois: m, orders: lm });
  }
  return json_({ ok: true, ping: true });
}

/* À lancer UNE fois : crée la clé secrète et l'affiche dans le journal. */
function creerCleImpression() {
  var cle = Utilities.getUuid().replace(/-/g, "").slice(0, 16);
  PropertiesService.getScriptProperties().setProperty("PRINT_KEY", cle);
  console.log("VOTRE CLÉ D'IMPRESSION : " + cle + "   (gardez-la pour vous)");
}

/* Test depuis l'éditeur : ajoute un faux ticket dans la file d'impression. */
function testerImpression() {
  enfiler_(ticketDe_({ "Date souhaitée": "2026-10-28", "Heure souhaitée": "12:30", "Nombre de personnes": "2",
    "Nom et prénom": "TEST Vaudrée 2", "Téléphone": "0400 00 00 00",
    "Résumé de commande": "2 × Carbonara — 36,00 €\n1 × Dame blanche — 9,00 €\n\nTOTAL INDICATIF : 45,00 €\n\nCe total est indicatif et doit être vérifié par le restaurant.",
    "Allergies ou intolérances": "Sans gluten", "Demandes particulières": "Table calme" }));
  console.log("Faux ticket ajouté : ouvrez le poste d'impression.");
}


/* ======================= V2 : couverts, confirmation client, rappels, résumé du matin ======================= */
/* Réglages (modifiables dans Paramètres du projet > Propriétés du script) :
   SEUIL_MIDI et SEUIL_SOIR = nombre de personnes à partir duquel on dit « presque complet » (40 par défaut)
   AVIS_GOOGLE_URL = lien pour laisser un avis Google (facultatif) */
var TEL_RESTO = "04 223 18 80";
var ADRESSE_RESTO = "Rue Saint-Gilles 149, 4000 Liège";

function service_(heure) {
  var m = String(heure || "").match(/(\d{1,2})/);
  var h = m ? parseInt(m[1], 10) : parseInt(Utilities.formatDate(new Date(), "Europe/Brussels", "H"), 10);
  return h < 15 ? "midi" : "soir";
}
function seuil_(svc) { return Number(prop_(svc === "midi" ? "SEUIL_MIDI" : "SEUIL_SOIR")) || 40; }
function persNum_(v) {
  var m = String(v || "").match(/\d+/); if (!m) return 0;
  var n = parseInt(m[0], 10); return /plus/i.test(String(v)) ? n + 1 : n;
}
function dateFr_(iso) { var m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? m[3] + "/" + m[2] + "/" + m[1] : String(iso || ""); }
function emailValide_(a) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(a || "").trim()); }

/* Ajoute les personnes au compteur du service et archive la réservation du jour (pour rappels et résumé). */
function enregistrer_(t, p) {
  var d = /^\d{4}-\d{2}-\d{2}$/.test(String(t.date)) ? String(t.date) : Utilities.formatDate(new Date(), "Europe/Brussels", "yyyy-MM-dd");
  var svc = service_(t.heure), n = persNum_(t.pers), seuil = seuil_(svc);
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties(), total = Number(props.getProperty("COV_" + d + "_" + svc) || 0) + n;
    if (n > 0) props.setProperty("COV_" + d + "_" + svc, String(total));
    var cle = "RES_" + d, liste = [];
    try { liste = JSON.parse(props.getProperty(cle) || "[]"); } catch (e) { liste = []; }
    liste.push({ n: t.num, svc: svc, h: t.heure, pers: t.pers, nom: t.nom, tel: t.tel, mail: emailValide_(p["email"]) ? String(p["email"]).trim() : "",
                 genre: t.genre, plats: String(t.plats || "").slice(0, 400), all: t.allergies || "", rem: String(t.remarques || "").slice(0, 120) });
    while (JSON.stringify(liste).length > 8500 && liste.length > 1) liste.shift();
    props.setProperty(cle, JSON.stringify(liste));
    var limite = Utilities.formatDate(new Date(new Date().getTime() - 14 * 24 * 3600 * 1000), "Europe/Brussels", "yyyy-MM-dd");
    Object.keys(props.getProperties()).forEach(function (k) {
      if ((k.indexOf("COV_") === 0 || k.indexOf("RES_") === 0) && k.slice(4, 14) < limite) props.deleteProperty(k);
    });
    return { svc: svc, total: total, seuil: seuil, presque: n > 0 && total >= seuil, date: d };
  } finally { lock.releaseLock(); }
}


/* ---- Mise en page « classe » des e-mails + petit mot positif du jour ---- */
var MOTS_DU_JOUR = [
  "Un bon repas, c'est comme une bonne bière : ça se savoure sans se presser.",
  "Les meilleurs souvenirs se font autour d'une table.",
  "Le bonheur, c'est simple comme une bonne table et de bons amis.",
  "Sourire est la plus belle des sauces : elle va avec tous les plats.",
  "Ce qui se partage a deux fois plus de goût.",
  "Aujourd'hui est un bon jour pour être de bonne humeur.",
  "Après la pluie, le beau temps. Et après le beau temps, une petite bière en terrasse.",
  "Mieux vaut un verre de bonheur qu'un tonneau de soucis.",
  "On ne vit qu'une fois : autant commander le dessert.",
  "La vie est trop courte pour boire de mauvaises bières.",
  "Chaque jour est une page blanche : écrivez-y quelque chose de joyeux.",
  "Les petits plaisirs font les grandes journées.",
  "Un sourire coûte moins cher que l'électricité, et il éclaire autant.",
  "Qui mange avec le sourire digère avec le sourire.",
  "Le secret d'une bonne journée : un bon café, une bonne nouvelle, une bonne table.",
  "Rien ne rapproche plus les gens qu'un plat qu'on partage.",
  "Ce n'est pas le chemin qui compte, mais l'endroit où on déguste à l'arrivée.",
  "La bonne humeur, ça se commande sans modération.",
  "À table, on oublie les soucis et on se souvient des rires.",
  "Une journée sans rire est une journée perdue.",
  "Le meilleur ingrédient d'une recette, c'est ceux avec qui on la partage.",
  "Prenez le temps : les bonnes choses arrivent à ceux qui savent déguster.",
  "Le cœur est comme un estomac : il aime les bonnes choses et les gens qu'on aime.",
  "Que votre verre soit toujours à moitié plein, et votre assiette toujours à moitié encore pleine.",
  "Regardez le bon côté de la vie : c'est souvent celui où il y a de la mousse.",
  "Garder le sourire, c'est la meilleure des résolutions, et elle ne coûte rien.",
  "Un « merci » est le plus joli des desserts.",
  "Ceux qui rient ensemble mangent mieux ensemble.",
  "La chance sourit à ceux qui réservent à l'avance.",
  "Pour être heureux, il suffit parfois d'une table, d'une chaise et de bonne compagnie."
];
function motDuJour_(dateIso) {
  var j = Math.floor(new Date(String(dateIso || plusJours_(0)) + "T12:00:00Z").getTime() / 86400000);
  return MOTS_DU_JOUR[((j % MOTS_DU_JOUR.length) + MOTS_DU_JOUR.length) % MOTS_DU_JOUR.length];
}
function escH_(t) { return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function paraH_(t) { return escH_(t).replace(/\n/g, "<br>"); }
function mailHtml_(titre, blocs, mot) {
  var corps = blocs.filter(function (b) { return b; }).map(function (b) {
    return '<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#2b2b2b;">' + paraH_(b) + '</p>';
  }).join("");
  return '<div style="background:#f3efe6;padding:24px 12px;font-family:Georgia,\'Times New Roman\',serif;">'
    + '<table role="presentation" align="center" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6dcc3;">'
    + '<tr><td style="background:#171717;padding:26px 20px;text-align:center;">'
    + '<div style="color:#d4af37;font-size:28px;letter-spacing:4px;font-weight:bold;">VAUDRÉE 2</div>'
    + '<div style="color:#bfae7a;font-size:12px;letter-spacing:3px;margin-top:6px;">BRASSERIE · RESTAURANT · BIÈRES BELGES</div></td></tr>'
    + '<tr><td style="padding:28px 26px 8px;"><h1 style="margin:0 0 18px;font-size:22px;color:#171717;font-weight:normal;">' + escH_(titre) + '</h1>' + corps + '</td></tr>'
    + '<tr><td style="padding:0 26px 26px;"><div style="border-left:4px solid #d4af37;background:#faf6ea;padding:14px 16px;border-radius:6px;font-style:italic;color:#5a4a1a;font-size:15px;line-height:1.5;">'
    + '« ' + escH_(mot) + ' »</div></td></tr>'
    + '<tr><td style="background:#171717;padding:18px 20px;text-align:center;color:#bfae7a;font-size:13px;line-height:1.6;">'
    + escH_(ADRESSE_RESTO) + '<br><a href="tel:+3242231880" style="color:#d4af37;text-decoration:none;">' + escH_(TEL_RESTO) + '</a></td></tr>'
    + '</table></div>';
}

/* E-mail automatique au client (seulement s'il a donné une adresse). */
function emailClient_(t, p, info) {
  var a = String(p["email"] || "").trim();
  if (!emailValide_(a)) return;
  var d = dateFr_(t.date), emporter = t.genre === "À EMPORTER";
  var titre, blocs = [];
  blocs.push("Bonjour " + (t.nom || "") + ",");
  if (emporter) {
    titre = "Votre commande est bien reçue";
    blocs.push("Votre commande à emporter est prête à être préparée. Retrait prévu : " + t.heure + ".");
  } else if (info && info.presque) {
    titre = "Votre demande est bien reçue";
    blocs.push("Nous avons bien reçu votre demande pour le " + d + " à " + t.heure + " (" + t.pers + " pers.).",
      "Ce jour-là, nous sommes presque complets. Merci de nous appeler au " + TEL_RESTO + " afin de confirmer votre place.");
  } else {
    titre = "Votre réservation est confirmée";
    blocs.push("Nous vous attendons le " + d + " à " + t.heure + " pour " + t.pers + " personne" + (persNum_(t.pers) > 1 ? "s" : "") + ".");
  }
  if (t.plats) blocs.push("Votre précommande :\n" + t.plats);
  if (t.allergies) blocs.push("Allergies notées : " + t.allergies);
  blocs.push("Pour modifier ou annuler, appelez-nous au " + TEL_RESTO + ".");
  var mot = motDuJour_(t.date);
  var texte = [blocs.join("\n\n"), "« " + mot + " »", "Vaudrée 2 · " + ADRESSE_RESTO].join("\n\n");
  MailApp.sendEmail({ to: a, subject: "Vaudrée 2 · " + (emporter ? "votre commande" : "votre réservation du " + d), body: texte,
                      htmlBody: mailHtml_(titre, blocs, mot), name: "Vaudrée 2" });
}

function lireRes_(date) { try { return JSON.parse(prop_("RES_" + date) || "[]"); } catch (e) { return []; } }
function plusJours_(n) { return Utilities.formatDate(new Date(new Date().getTime() + n * 24 * 3600 * 1000), "Europe/Brussels", "yyyy-MM-dd"); }

/* Tâche quotidienne (11 h) : résumé Telegram du jour, rappels pour demain, remerciements d'hier. */
function jobMatin() {
  try { resumeDuJour_(); } catch (e) { log_("résumé", e); }
  try { rappelsDemain_(); } catch (e) { log_("rappels", e); }
  try { remerciementsHier_(); } catch (e) { log_("remerciements", e); }
}

function resumeDuJour_() {
  var d = plusJours_(0), liste = lireRes_(d);
  if (!liste.length) { notifierTelegram_("☀️ Vaudrée 2 · " + dateFr_(d) + "\nAucune réservation enregistrée pour aujourd'hui."); return; }
  var out = ["☀️ Vaudrée 2 · " + dateFr_(d)], plats = {}, allerg = [];
  ["midi", "soir"].forEach(function (sv) {
    var l = liste.filter(function (x) { return x.svc === sv; }), c = 0;
    l.forEach(function (x) { c += persNum_(x.pers); });
    out.push("", (sv === "midi" ? "🍽 MIDI" : "🌙 SOIR") + " : " + l.length + " réservation" + (l.length > 1 ? "s" : "") + " · " + c + " couverts");
  });
  liste.forEach(function (x) {
    if (x.all) allerg.push("• " + x.nom + " (" + x.h + ") : " + x.all);
    String(x.plats || "").split("\n").forEach(function (ln) {
      var m = ln.match(/^(\d+) × (.+?)(?: \[SUGGESTION\])? — /); if (m) plats[m[2]] = (plats[m[2]] || 0) + parseInt(m[1], 10);
    });
  });
  if (allerg.length) out.push("", "⚠️ ALLERGIES", allerg.join("\n"));
  var top = Object.keys(plats).sort(function (a, b) { return plats[b] - plats[a]; }).slice(0, 6);
  if (top.length) out.push("", "🔥 PLATS PRÉCOMMANDÉS", top.map(function (k) { return plats[k] + " × " + k; }).join("\n"));
  notifierTelegram_(out.join("\n"));
}

function rappelsDemain_() {
  var d = plusJours_(1);
  lireRes_(d).forEach(function (x) {
    if (!x.mail || x.genre === "À EMPORTER") return;
    var blocs = ["Bonjour " + x.nom + ",", "Petit rappel : nous vous attendons demain (" + dateFr_(d) + ") à " + x.h + " pour " + x.pers + " personne(s).",
      "Un empêchement ? Appelez-nous au " + TEL_RESTO + " pour libérer la table."], mot = motDuJour_(d);
    MailApp.sendEmail({ to: x.mail, name: "Vaudrée 2", subject: "Vaudrée 2 · rappel de votre réservation demain",
      body: blocs.join("\n\n") + "\n\n« " + mot + " »\n\nVaudrée 2 · " + ADRESSE_RESTO, htmlBody: mailHtml_("À demain au Vaudrée 2", blocs, mot) });
  });
}

function remerciementsHier_() {
  var lien = prop_("AVIS_GOOGLE_URL"); if (!lien) return;
  lireRes_(plusJours_(-1)).forEach(function (x) {
    if (!x.mail || x.genre === "À EMPORTER") return;
    var mot = motDuJour_(plusJours_(0));
    var blocs = ["Bonjour " + x.nom + ",", "Merci d'être venu au Vaudrée 2. Si vous avez passé un bon moment, un petit avis nous aide beaucoup :", lien];
    MailApp.sendEmail({ to: x.mail, name: "Vaudrée 2", subject: "Merci de votre visite au Vaudrée 2",
      body: blocs.join("\n\n") + "\n\n« " + mot + " »\n\nÀ bientôt, l'équipe du Vaudrée 2", htmlBody: mailHtml_("Merci de votre visite", blocs, mot) });
  });
}

/* À lancer UNE fois : planifie la tâche quotidienne de 11 h. */
function installerDeclencheurs() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "jobMatin") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("jobMatin").timeBased().atHour(11).everyDays(1).inTimezone("Europe/Brussels").create();
  console.log("OK : la tâche du matin (résumé Telegram, rappels, remerciements) est planifiée chaque jour vers 11 h.");
}

/* ---- Liste d'envoi (clients qui ont coché « Recevoir nos suggestions ») ---- */
function abonner_(email, nom) {
  var a = String(email || "").trim().toLowerCase(); if (!emailValide_(a)) return;
  PropertiesService.getScriptProperties().setProperty("N_" + a, JSON.stringify({ nom: nom || "", date: plusJours_(0) }));
}
function desabonner(email) { PropertiesService.getScriptProperties().deleteProperty("N_" + String(email || "").trim().toLowerCase()); }

/* Modifiez le texte ci-dessous, puis lancez envoyerNewsletter (max. ~100 e-mails par jour). */
function envoyerNewsletter() {
  var SUJET = "Les suggestions de la semaine au Vaudrée 2";
  var TEXTE = "Bonjour,\n\nVoici nos suggestions de la semaine :\n- (à compléter)\n\nRéservez ou précommandez : https://vaudree2.github.io/saint-gilles/accueil-qr.html\n\nÀ bientôt,\nVaudrée 2";
  var cles = Object.keys(PropertiesService.getScriptProperties().getProperties()).filter(function (k) { return k.indexOf("N_") === 0; });
  var n = 0;
  cles.slice(0, 90).forEach(function (k) {
    MailApp.sendEmail({ to: k.slice(2), name: "Vaudrée 2", subject: SUJET, body: TEXTE + "\n\n—\nPour ne plus recevoir ces e-mails, répondez simplement STOP." }); n++;
  });
  console.log(n + " e-mail(s) envoyé(s) sur " + cles.length + " abonné(s).");
}

/* Test : envoie un faux résumé du jour, sans toucher aux vraies données. */
function testerResume() { resumeDuJour_(); }
