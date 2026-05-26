# Configuration pour GitHub Pages

Le site Ihsane Fragrance fonctionne maintenant avec deux modes de synchronisation :

## Mode Local (Tomcat/XAMPP)
- Charge les produits depuis `js/products.json`
- Sauvegarde dans le localStorage
- Pour synchroniser : Exporter JSON → Remplacer `js/products.json` manuellement
- Fonctionne sur votre serveur local Tomcat

## Mode GitHub Pages
- Utilise un stockage externe (JSONBin.io)
- Synchronisation automatique entre tous les utilisateurs
- Fonctionne sur GitHub Pages ou tout hébergement statique

## Configuration pour GitHub Pages

### 1. Créer un compte JSONBin.io
1. Allez sur https://jsonbin.io/
2. Créez un compte gratuit
3. Récupérez votre clé API (X-Master-Key) dans les paramètres

### 2. Créer un Bin pour les produits
1. Cliquez sur "Create new Bin"
2. Collez le contenu de `js/products.json`
3. Copiez l'URL du Bin (format: `https://api.jsonbin.io/v3/b/YOUR_BIN_ID`)

### 3. Configurer dans l'admin
1. Connectez-vous à l'admin
2. Dépliez "Configuration Stockage Externe"
3. Entrez l'URL JSONBin
4. Entrez votre clé API
5. Cliquez sur "Sauvegarder la configuration"
6. Rechargez la page

### 4. Tester
- Modifiez un prix dans l'admin
- Vérifiez sur JSONBin.io que les données sont mises à jour
- Tous les utilisateurs verront automatiquement les changements

## Avantages
- ✅ Fonctionne sur GitHub Pages
- ✅ Synchronisation automatique avec JSONBin.io
- ✅ Pas besoin de backend PHP
- ✅ Compatible Tomcat (mode local avec export/import manuel)
- ✅ Gratuit avec JSONBin.io (limites généreuses)

## Alternative
Vous pouvez aussi utiliser d'autres services compatibles :
- JSONBin.io (recommandé, gratuit)
- Firebase Realtime Database
- Supabase
- Tout service API REST JSON
