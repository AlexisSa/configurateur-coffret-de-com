# Configurateur coffrets de communication

Outil web pour composer un coffret **XH'system** (gamme [Xeilom](https://www.xeilom.fr/coffrets-de-communication-c102x4344918)) et obtenir une **nomenclature technique** (références, quantités) avec **estimation tarifaire HT** (coffret + options).

Le catalogue (`src/data/catalog.json`) reprend le comparatif des coffrets XH'system : dimensions, grade TV 3 uniquement, capot/porte, emplacement box, plafond RJ45.

## Prérequis

- Node.js 18+

## Installation

```bash
npm install
```

## Lancement

```bash
npm run dev
```

Ouvrir l’URL affichée (par défaut `http://localhost:5173`).

## Tests

```bash
npm run test:run
```

## Build production

```bash
npm run build
npm run preview
```

## Mettre à jour le catalogue produit

Éditer [`src/data/catalog.json`](src/data/catalog.json) :

- **gammes** : châssis (id, label, `baseSku` type **XHG3** + code gamme, ex. `XHG3M`, plaque P → **T** : `XHG3T`, `unitPriceHT`, dimensions, matériaux, groupes d’options)
- **options** : accessoires (sku, `unitPriceHT`, group, règles d’exclusion / compatibilité gamme)
- **rules** : règles globales (masquer un groupe pour une gamme, etc.)

Recharger l’application après modification — aucun redéploiement de code si seul le JSON change (rebuild nécessaire en production).

### Tarifs HT

Les prix affichés viennent de la **matrice tarifaire** [`src/data/pricingMatrix.json`](src/data/pricingMatrix.json) : un prix HT par SKU et par grille client (S, M, B, A, Z). La correspondance ID catégorie Oxatis ↔ code tarif est dans [`src/data/pricingTiers.json`](src/data/pricingTiers.json).

| Source | Rôle |
|--------|------|
| **`pricingMatrix.json`** | Prix HT affichés (source de vérité en production) |
| **`pricingTiers.json`** | Mapping catégories Oxatis → codes tarif |
| **`catalog.json`** (`unitPriceHT`) | Référence produit / fallback pour la colonne S |

**Mettre à jour les tarifs depuis Oxatis :**

```bash
# CSV Oxatis → pricingMatrix.json (grilles S à Z)
npm run import:pricing

# Fallback : recopie unitPriceHT du catalogue vers la colonne S
npm run sync:pricing
```

Guide complet : [`docs/integration-oxatis-embed-tarifs.md`](docs/integration-oxatis-embed-tarifs.md).

Le moteur ([`src/utils/pricing.js`](src/utils/pricing.js)) résout le prix via `getSkuTierPriceHT(sku, tierCode)`.

Références châssis : **XHG3** + code gamme (`M`, `MX`, `MXL`, `L`, `XL`, `M2`, `M2L`, `S`, `SX`…), **sans** le suffixe variante après le tiret. La plaque **P** utilise **T** (`XHG3T`). Le champ `imageSku` conserve la référence complète catalogue Xeilom (ex. `XHG3M-4RJ`) pour les visuels.

### Images (gammes et options)

Les visuels sont stockés dans `public/gammes/` et `public/options/` (CDN Xeilom, champs `image` / `imageSource` et `productUrl` dans `src/data/catalog.json`).

Pour les rafraîchir :

```bash
chmod +x scripts/fetch-gamme-images.sh scripts/fetch-option-images.sh
./scripts/fetch-gamme-images.sh
./scripts/fetch-option-images.sh
```

## Fonctionnalités

- Choix de la gamme puis des options (grade 3 TV automatique)
- Nomenclature en temps réel avec PU HT / total HT (coffret + options)
- Export PDF et demande de devis par email (totaux inclus)
- Bouton **Partager** : copie un lien (`?config=…`) rouvrant la configuration
- Reprise automatique de la dernière configuration (sauvegarde `localStorage`)

## Intégration Oxatis (iframe)

Le configurateur peut être intégré sur [www.xeilom.fr](https://www.xeilom.fr) via une page sur mesure Oxatis.

### Back-office Oxatis

1. **Contenu → Pages sur mesure → Ajouter**
2. Mise en page pleine largeur, URL suggérée : `/configurateur-coffrets-xhsystem`
3. Insérer un bloc HTML avec le code ci-dessous
4. Ajouter la page au menu du site

```html
<div class="configurateur-embed">
  <iframe
    id="configurateur-coffret"
    src="https://configurateur-coffret-de-com.vercel.app/?embed=1"
    title="Configurateur coffrets XH'system"
    width="100%"
    style="border:0; min-height:720px; display:block; width:100%;"
    loading="lazy"
    allow="clipboard-write"
  ></iframe>
</div>

<script>
(function () {
  var IFRAME_ORIGIN = "https://configurateur-coffret-de-com.vercel.app";
  window.addEventListener("message", function (event) {
    if (event.origin !== IFRAME_ORIGIN) return;
    if (!event.data || event.data.type !== "coffret-resize") return;
    var frame = document.getElementById("configurateur-coffret");
    if (frame && event.data.height > 0) {
      frame.style.height = event.data.height + "px";
    }
  });
})();
</script>
```

CSS optionnel (Configuration → Design → Points d'insertion HTML) :

```css
.configurateur-embed {
  max-width: 100%;
  overflow-x: clip;
}

.configurateur-embed iframe {
  width: 100%;
  max-width: 100%;
}
```

### Mode embed (`?embed=1`)

- Masque le header Xeilom (déjà présent sur le site Oxatis)
- Envoie la hauteur au parent via `postMessage` pour éviter le double scroll
- Les liens « Partager » pointent vers l'URL Vercel (comportement voulu)

### Test local

Après `npm run build && npm run preview`, ouvrir `/embed-test.html` pour simuler la page Oxatis.

## Structure

```
src/
  data/catalog.json      # Données produit
  utils/                 # Moteur BOM, compatibilité, PDF, partage, stockage
  hooks/                 # État React
  components/            # Interface
  styles/                # CSS découpé par section (importé via App.css)
```
