# Xeilom Kit

Dossier portable extrait du **Configurateur coffrets XH'system**. Copiez-le tel quel dans un autre projet React/Vite pour réutiliser :

- le **design system** (CSS, tokens, composants UI),
- le **système de tarification** multi-grilles Oxatis (S → Z),
- le **logo** (header + PDF),
- l'**import CSV Oxatis** (export catalogue, pas de lib Excel),
- l'**intégration iframe** Oxatis (tarif client, redimensionnement).

> **Note :** l'import tarifs utilise un export **CSV Oxatis** (`;`, champs quotés). Les fichiers `.xlsx` ne sont pas lus — exportez depuis Oxatis en CSV ou convertissez manuellement.

---

## Structure

```
xeilom-kit/
├── styles/           # Design system CSS (tokens, layout, composants)
├── components/       # ConfirmModal, ToastContainer, Header
├── hooks/            # useToasts, useEmbedContext, useEmbedResize
├── utils/            # Tarifs, logo, embed, clipboard, couleurs PDF
├── data/             # pricingTiers.json, pricingMatrix.json, template
├── scripts/          # import CSV Oxatis → pricingMatrix.json
├── config/           # Chemins configurables (kit.config.example.mjs)
├── public/brand/     # Emplacement logo (logo.webp)
├── docs/             # Guide intégration Oxatis
└── package.snippet.json
```

---

## Installation dans un nouveau projet

### 1. Copier le dossier

```bash
cp -R xeilom-kit/ /chemin/vers/mon-projet/xeilom-kit/
```

### 2. Dépendances npm

Ajoutez les dépendances de `package.snippet.json` :

```bash
npm install react react-dom lucide-react jspdf
```

### 3. Styles

Dans votre point d'entrée (ex. `src/main.jsx`) :

```jsx
import "../xeilom-kit/styles/kit.css";
```

Enveloppez votre app avec la classe `.app` :

```jsx
<div className="app app--embed">{/* contenu */}</div>
```

### 4. Logo

Copiez le logo WebP dans le dossier `public` de votre projet :

```
public/brand/logo.webp
```

### 5. Données tarifaires

| Fichier | Action |
|---------|--------|
| `data/pricingTiers.json` | Copier tel quel ou adapter les IDs Oxatis |
| `data/pricingMatrix.json` | Copier depuis ce kit (tarifs Xeilom à jour) ou regénérer |

Si vous placez les JSON ailleurs, modifiez l'import dans `utils/pricingMatrix.js` et `utils/pricingTier.js`.

### 6. Configuration des scripts

```bash
cp xeilom-kit/config/kit.config.example.mjs kit.config.mjs
```

Adaptez les chemins (`catalogPath`, `pricingMatrixPath`, etc.) à votre projet.

Ajoutez les scripts npm (voir `package.snippet.json`).

### 7. Configuration tarifaire (optionnel)

Au démarrage de l'app :

```js
import { configurePricing } from "./xeilom-kit/utils/pricingConfig.js";

configurePricing({
  vatRate: 0.2,
  disclaimer: "Prix indicatifs HT, hors transport.",
  lot24: {
    unitSku: "KJ6AFSEF1",
    lotSku: "KJ6AFSEF1-24",
    size: 24,
  },
});
```

---

## Utilisation — tarification

```js
import { useEmbedContext } from "./xeilom-kit/hooks/useEmbedContext.js";
import {
  applyPricingToLines,
  formatPriceHT,
  getPricingDisclaimer,
} from "./xeilom-kit/utils/pricing.js";
import { getOrderPricingLines } from "./xeilom-kit/utils/orderPricing.js";

function MonRecap({ lines }) {
  const { pricingTierCode } = useEmbedContext();
  const priced = applyPricingToLines(lines, pricingTierCode);
  const totals = getOrderPricingLines(priced, 3, {
    quantityLabel: "coffret",
    pluralLabel: "coffrets",
  });

  return (
    <>
      {totals.map((line) => (
        <p key={line.label}>
          {line.label} : {formatPriceHT(line.amount)}
        </p>
      ))}
      <p className="pricing-disclaimer">{getPricingDisclaimer(pricingTierCode)}</p>
    </>
  );
}
```

### Ligne de nomenclature attendue

```js
{ sku: "XHG3M", quantity: 1, label: "Châssis M" }
// Après applyPricingToLine → unitPriceHT, lineTotalHT
```

---

## Utilisation — composants UI

```jsx
import { Header, ConfirmModal, ToastContainer } from "./xeilom-kit/components";
import { useToasts } from "./xeilom-kit/hooks/useToasts.js";

function App() {
  const { toasts, addToast, removeToast } = useToasts();

  return (
    <div className="app">
      <Header title="Mon configurateur" eyebrow="Ma gamme" />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {/* … */}
    </div>
  );
}
```

### Classes CSS utiles

| Classe | Usage |
|--------|-------|
| `.panel` | Carte conteneur |
| `.btn.primary` / `.btn.secondary` / `.btn.ghost` | Boutons |
| `.link-btn` | Lien bouton |
| `.option-tile` | Tuile sélectionnable |
| `.gamme-card` | Carte gamme |
| `.recap-panel` | Panneau récap sidebar |
| `.toast-container` | Notifications |

Variables CSS dans `styles/base.css` (`--brand`, `--surface`, `--radius`, etc.).

---

## Import tarifs depuis Oxatis (CSV)

1. Exporter le catalogue Oxatis en CSV (`;`) → `data/import/MonExport.csv`
2. Le CSV reste **local et gitignored** (données confidentielles)
3. Lancer l'import :

```bash
npm run import:pricing
# ou avec un chemin explicite :
node xeilom-kit/scripts/import-oxatis-pricing.mjs data/import/MonExport.csv
```

4. Fallback colonne S depuis le catalogue :

```bash
npm run sync:pricing
```

| Colonne Oxatis | Code tarif |
|----------------|------------|
| `Price2VATExcluded` | S (public) |
| `Price3VATExcluded` | M |
| `Price4VATExcluded` | B |
| `Price5VATExcluded` | A |
| `Price6VATExcluded` | Z |

Guide complet : [`docs/integration-oxatis-embed-tarifs.md`](docs/integration-oxatis-embed-tarifs.md)

---

## Intégration iframe Oxatis

```jsx
import { useEmbedContext } from "./xeilom-kit/hooks/useEmbedContext.js";
import { useEmbedResize } from "./xeilom-kit/hooks/useEmbedResize.js";

function App() {
  const { pricingTierCode } = useEmbedContext();
  useEmbedResize();

  return <div className="app app--embed">{/* … */}</div>;
}
```

Paramètres URL : `?embed=1&categoryId=3394219` ou `?pricingTier=Z`

Messages postMessage : voir `utils/embedMessages.js`

Origines autorisées : `utils/embedOrigins.js` (`EMBED_PARENT_ORIGINS`)

---

## PDF et logo

```js
import { loadBrandLogoForPdf } from "./xeilom-kit/utils/brandLogo.js";
import { PDF_COLORS, formatPdfPrice } from "./xeilom-kit/utils/pdfColors.js";

const logo = await loadBrandLogoForPdf();
// logo.dataUrl → jsPDF.addImage(...)
// PDF_COLORS.brand → palette alignée sur --brand
// formatPdfPrice(1234.5) → "1 234,50 €"
```

---

## Checklist intégration rapide

- [ ] Copier `xeilom-kit/` dans le projet
- [ ] `npm install` des dépendances
- [ ] Importer `styles/kit.css` dans `main.jsx`
- [ ] Placer `public/brand/logo.webp`
- [ ] Copier/configurer `data/pricingTiers.json` et `pricingMatrix.json`
- [ ] Créer `kit.config.mjs` + scripts npm
- [ ] `configurePricing()` si lot 24 ou disclaimer custom
- [ ] Tester `?embed=1&pricingTier=S` et import CSV

---

## Origine

Extrait du dépôt **Configurateur_Coffret_de_communication** (Xeilom / XH'system).
