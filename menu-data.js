/* ===== Carte du Vaudrée 2 (source unique : carte + précommande) =====
   Format d'un plat : ["Nom", prix, "Description", "images/photo.jpg" (facultatif)]
   Photo d'une catégorie : ajoutez photo:"images/xxx.jpg",alt:"texte" après title:"…" (facultatif)  — modifiez un prix ICI uniquement.
   Un plat à 0 € est caché (utile pour préparer des plats à l'avance). */
window.MENU = [
{title:"Menu du midi",midi:true,items:[
["Croque Monsieur",10,"Gouda / Jambon à l'os / Salade / Crudités / Ketchup"],
["Croque Madame",11.5,"Gouda / Jambon à l'os / Œuf au plat / Salade / Crudités / Ketchup"]]},
{title:"À partager & grignoter",photo:"images/carte-planche.jpg",alt:"Planche signature",items:[
["Apéro Mixte",13,"Assortiments fritures mixtes"],
["Planche de Fromages",16,"5 variétés de fromages / Salade / Roquette / Confiture / Fruits secs"],
["Planche Italienne",16,"Charcuterie italienne / Salade / Roquette / Légumes"],
["Planche Vaudrée 2",22,"Fromages et charcuterie italienne / Salade / Fruits secs / Confiture"],
["Planche Signature",26,"4 mini boulettes / 4 mini croquettes / 4 mini loumpia / 4 scampis / 4 calamars / Sauces / Salade"],
["Frites",6,"Sauces au choix : Mayo / Tartare / Vaudrée 2 / Ketchup / Mayo Truffe / Andalouse"],
["Arrosticini",15,"6 mini brochettes d'agneau rôties à l'ail / Salade"],
["Camembert Rôti",15,"Rôti au miel et romarin / Pain grillé / Salade"]]},
{title:"Entrées froides",photo:"images/burrata.jpg",alt:"Burrata et tomates",items:[
["Burrata",15,"Burrata crémeuse / Garniture du moment"],
["Carpaccio Angus Beef",17,"Bœuf Angus / Roquette / Parmesan / Champignons / Balsamique / Tomates cerises"],
["Carpaccio de Saumon",16.5,"Saumon norvégien / Pickles d'oignons rouges / Concombre / Citron / Pain"]]},
{title:"Entrées chaudes",photo:"images/carte-entree-chaude.jpg",alt:"Gambas à la crème",items:[
["Croquettes de Fromage",16,"2 pièces / Salade / Crudités (Maison)"],
["Croquettes de Crevettes",19,"2 pièces / Salade / Crudités (Maison)"],
["Duo Croquettes",18,"1 fromage + 1 crevette / Salade / Crudités"],
["Cuisses de Grenouilles",18,"Crème à l'ail ou beurre d'ail / Persil"],
["Calamars Frits Maison",17,"Salade / Crudités / Sauce tartare maison"],
["Scampis Vaudrée 2",17,"Sauce crème tomate / Petits légumes / Ail"]]},
{title:"Salades",photo:"images/carte-salade.jpg",alt:"Salade grecque",items:[
["Poulet Croquant",18,"Poulet pané maison / Salade / Crudités / Citron / Tartare"],
["Frisée aux Lardons",17,"Salade / Crudités / Lardons / Oignons / Crème / Œuf / Croûtons"],
["Chèvre",18,"Salade / Crudités / Chèvre / Miel / Lardons / Pain toasté"],
["Signature",19,"Salade / Crudités / Camembert rôti / Oignons confits / Pain croustillant"],
["Burrata",18,"Salade / Roquette / Aubergines / Courgettes / Poivrons / Tomates cerises / Burrata / Balsamique"],
["Vaudrée 2",22,"Gambas / Scampis / Calamars frits / Tartare maison / Citron"]]},
{title:"Pâtes fraîches",photo:"images/carte-pates.jpg",alt:"Ravioles à la roquette",items:[
["Carbonara",18,"Lardons / Œuf / Légèrement crémeux / Grana Padano"],
["All'Amatriciana",18,"Lardons / Ail / Vin blanc / Tomate / Grana Padano / Basilic"],
["4 Fromages",18,"4 fromages / Crème / Parmesan Grana Padano"],
["Méditerranéenne",18,"Aubergines / Poivrons / Courgettes / Ail / Tomate / Basilic / Parmesan"],
["Cannelloni Florentin",18,"Ricotta / Épinards / Crème tomate / Mozzarella / Parmesan / Gratinée"],
["Polpetta",18,"Boulette italienne / Ail / Tomate / Basilic / Parmesan"],
["Scampis du Chef",18,"6 scampis / Ail / Sauce crème tomate du chef"],
["Gratinés",18,"Jambon à l'os / Crème / Fromage / Parmesan"],
["Ravioles alla Tartufata",20,"Ricotta et truffe / Crème / Tapenade de truffe / Roquette"]]},
{title:"Poissons & crustacés",photo:"images/carte-poisson.jpg",alt:"Pavé de saumon",items:[
["Cassolette Vaudrée 2",24,"7 scampis / Petits légumes / Ail / Sauce crème tomate / Salade"],
["Darne de Saumon",26,"Saumon rôti / Poêlée de légumes / Sauce béarnaise"],
["Épée de Gambas",26,"8 pièces / Poêlée de légumes / Flambée au Pastis (supplément +3 €)"],
["Trio de la Mer",26,"Gambas / Scampis / Calamars frits / Salade / Tartare"]]},
{title:"Moules (selon saison)",photo:"images/carte-moules.jpg",alt:"Casserole de moules",description:"Toutes les moules sont servies avec frites et mayonnaise maison.",items:[
["Marinière",24,"Moules jumbo / Carottes / Céleri / Oignons"],
["Crème Ail",25,"Moules jumbo / Carottes / Céleri / Oignons / Crème / Ail"],
["Vin Blanc",25,"Moules jumbo / Légumes / Vin blanc"],
["Provençale",26,"Moules jumbo / Légumes / Sauce provençale"],
["Vaudrée 2",29,"Moules jumbo / Légumes / Crème / Scampis / Curry / Ail"]]},
{title:"Burgers",photo:"images/carte-burger.jpg",alt:"Burgers et frites",description:"Tous les burgers sont servis avec frites.",items:[
["Chicken",19,"Pain brioché / Poulet pané maison / Cheddar / Tartare / Oignons pickles / Salade"],
["Effiloché",21,"Porc basse température / Sauce BBQ / Lard / Cheddar / Oignons caramélisés"],
["Vaudrée 2",21,"Bœuf / Sauce Vaudrée 2 / Cheddar / Bacon / Oignons caramélisés / Œuf"],
["Signature",22,"Steak de bœuf / Mayo truffe / Mozzarella / Roquette / Parmesan / Oignons"],
["Végétarien",18,"Burger végétarien / Cheddar / Tartare / Légumes grillés / Oignons caramélisés"]]},
{title:"Viandes & steaks",photo:"images/carte-grillade.jpg",alt:"Entrecôte à griller",description:"Nos pierrades sont servies avec accompagnement, 3 sauces froides maison et salade.",items:[
["Bavette d'Aloyau 250 g",26,""],["Pavé de Bœuf Irlandais 300 g",29,""],["Cube Roll Irlandais 350 g",37,""],
["Entrecôte Limousine 350 g",36,""],["Côte à l'Os Irlandaise 600 g (à partager)",54,""]]},
{title:"Brochettes & épées",photo:"images/carte-epee.jpg",alt:"Épée de bœuf",items:[
["Brochette Bœuf d'Aloyau 300 g",27,""],["Brochette Bœuf Irlandais 300 g",33,""],
["Épée Bœuf d'Aloyau 450 g",30,""],["Épée Bœuf Irlandais 450 g",40,""]]},
{title:"Les incontournables",photo:"images/carte-boulettes.jpg",alt:"Boulets sauce lapin",items:[
["Boulet à la Liégeoise — 1 personne",15.5,""],["Boulet à la Liégeoise — 2 personnes",18.5,""],
["Boulet Tomate — 1 personne",15.5,""],["Boulet Tomate — 2 personnes",18.5,""],
["Boulet Provençal — 1 personne",15.5,""],["Boulet Provençal — 2 personnes",18.5,""],
["Carbonnade Flamande",24,"Bière Vaudrée Brune (spécialité)"],["Américain Minute",20,""],["Vol-au-Vent comme Mamy",19,""],
["Spare Ribs Caramélisés",26,"Cuisson basse température"],["Escalope de Veau Milanaise",24,""],
["Escalope de Veau Parmigiana",24,"Aubergines / Parmesan / Mozza"],["Jambonneau à la Moutarde",25,""],
["Jambonneau à la Béarnaise",24,""],["Rognons à la Liégeoise",24,"Lardons / Peket / Crème"],
["Rognons à la Moutarde",24,""],["Souris d'Agneau",30,"Sauce au miel et romarin","images/souris-agneau.jpg"]]},
{title:"Gourmandises du Vaudrée",photo:"images/carte-dessert.jpg",alt:"Carpaccio d'ananas",items:[
["Verrines ou mignardises du moment",3,"Maison / Au choix / Prix à la pièce"],
["Dame blanche",9,"3 boules de glace vanille / Chocolat belge / Chantilly / Riz soufflé au chocolat"],
["Trio de sorbets",9,"Fraise / Citron / Goût du moment / Fruits frais"],
["Café liégeois",9.5,"Café glacé comme un milkshake / Peket ou Baileys, ou sans alcool"],
["Colonel",9,"Vodka / 2 boules de sorbet citron"],
["Tiramisu",9.5,"Savoiardi / Crémeux mascarpone italien / Cacao"],
["Café ou thé gourmand",11,"Trio de verrines de la maison"],
["Crêpes sucre ou cassonade",7.5,""],
["Crêpes Vaudrée",12,"Crêpes farcies de tiramisu / Glace vanille / Cacao"],
["Brownie maison",11,"Brownie ou chocolat belge coulant / Glace vanille / Chantilly / Riz soufflé au chocolat"],
["Brioche Vaudrée",13,"Pain perdu briochée / Crème de tiramisu / Glace vanille / Cacao / Crème chantilly / Soufflé au chocolat"],
["Brioche Signature",14,"Pain perdu briochée / Glace vanille / Pistache / Praliné de pistache / Crème chantilly"]]},
{title:"Les petits plus",photo:"images/carte-supplements.jpg",alt:"Café et mignardises",description:"Suppléments, accompagnements et douceurs pour personnaliser votre plat ou votre dessert. Rien n'est ajouté automatiquement : choisissez uniquement ce que vous souhaitez.",items:[
["Supplément Burrata — Planche Italienne",3.5,""],["Flambée au Pastis — Épée de Gambas",3,""],
["Supplément viande double — Burger",14,""],["Pain sans gluten — Burger",1.5,""],
["Supplément gratin",5,"Accompagnement"],["Supplément légumes — viandes & steaks",4,"Accompagnement"],
["Supplément sauce chaude",3.5,"Accompagnement"],["Supplément légumes — incontournables",5,"Accompagnement"],
["Supplément frites — incontournables",3,"Accompagnement"],
["Boule de glace — vanille",3,""],["Boule de glace — chocolat",3,""],["Boule de glace — fraise",3,""],
["Supplément chantilly",1.5,""]]}
];
