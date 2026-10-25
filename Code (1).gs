/* ===== Relais Vaudrée 2 : notification GSM + (option) imprimante + tableau Google =====
   Reçoit la commande en plus de Formspree. Ne remplace PAS Formspree.
   Les secrets (jeton Telegram...) ne sont PAS dans ce fichier : ils sont dans
   Paramètres du projet > Propriétés du script (voir le guide). */

function prop_(k){ return PropertiesService.getScriptProperties().getProperty(k) || ""; }

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    if (p["_gotcha"]) return out_("ignored");                     // anti-robot

    var texte, ligne;
    if (p["Téléphone"] && p["Date souhaitée"]) {                  // Précommande (page précommande)
      texte = [
        "🍽️ NOUVELLE PRÉCOMMANDE — Vaudrée 2",
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

    try { notifierTelegram_(texte); } catch (err) { log_("telegram", err); }
    try { imprimer_(texte); }        catch (err) { log_("imprimante", err); }
    try { classer_(p); }             catch (err) { log_("tableau", err); }
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
