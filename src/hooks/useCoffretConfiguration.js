import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { catalog } from "../utils/catalog.js";
import {
  getVisibleGroups,
  getIncompatibilityReason,
  isConfigurationComplete,
} from "../utils/compatibility.js";
import { buildBom } from "../utils/bomBuilder.js";
import {
  loadConfigFromUrl,
  generateConfigCode,
  buildShareUrl,
} from "../utils/configCode.js";
import {
  createBomPdfBlob,
  downloadBomPdf,
} from "../utils/pdfGenerator.js";
import { buildQuoteText } from "../utils/quote.js";
import { getMaxPriseCount, normalizePriseValue } from "../utils/prise.js";
import {
  normalizeCordonRj45Value,
  parseCordonRj45Quantity,
} from "../utils/cordonRj45.js";
import { getMaxRj45Count, normalizeRj45Value } from "../utils/rj45.js";
import {
  DEFAULT_COFFRET_COUNT,
  normalizeCoffretCount,
} from "../utils/coffretQuantity.js";
import {
  loadStoredConfig,
  saveStoredConfig,
  clearStoredConfig,
} from "../utils/storage.js";

const emptyOptions = () => {
  const opts = {};
  for (const group of Object.keys(catalog.optionGroups)) {
    opts[group] = "";
  }
  return opts;
};

function normalizeLegacyDti(options) {
  const legacy = options.dti;
  if (!legacy) return options;
  const next = { ...options };
  delete next.dti;
  if (legacy === "dti-rj45-4precable" && !next.dti_rj45) {
    next.dti_rj45 = legacy;
  } else if (legacy.startsWith("dti-fibre") && !next.dti_fibre) {
    next.dti_fibre = legacy;
  }
  return next;
}

function normalizeOptions(options, gammeId = "") {
  const base = { ...emptyOptions(), ...normalizeLegacyDti(options) };
  base.rj45 = normalizeRj45Value(base.rj45);
  base.cordon_rj45 = normalizeCordonRj45Value(base.cordon_rj45, gammeId);
  base.prise = normalizePriseValue(base.prise);
  const maxRj45 = getMaxRj45Count(gammeId);
  const rj45Qty = Number.parseInt(base.rj45, 10);
  if (base.rj45 && rj45Qty > maxRj45) base.rj45 = String(maxRj45);
  const maxPrise = getMaxPriseCount(gammeId);
  const priseQty = Number.parseInt(base.prise, 10);
  if (base.prise && priseQty > maxPrise) base.prise = String(maxPrise);
  return base;
}

const DEFAULT_MATERIAU = "grade3";

function withDefaultMateriau(state) {
  if (!state.gammeId) return state;
  const materiau =
    state.materiau === "grade2" || !state.materiau
      ? DEFAULT_MATERIAU
      : state.materiau;
  return materiau === state.materiau ? state : { ...state, materiau };
}

const initialState = () => ({
  gammeId: "",
  materiau: "",
  coffretCount: DEFAULT_COFFRET_COUNT,
  options: emptyOptions(),
});

const initialInternal = () => ({
  clientName: "",
  societe: "",
  email: "",
  telephone: "",
});

export function useCoffretConfiguration(pricingTierCode) {
  const [state, setState] = useState(initialState);
  const [internal, setInternal] = useState(initialInternal);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((type, title, message) => {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const fromUrl = loadConfigFromUrl();
    const source = fromUrl?.gammeId ? fromUrl : loadStoredConfig();
    if (!source?.gammeId) return;
    setState(
      withDefaultMateriau({
        gammeId: source.gammeId,
        materiau: source.materiau ?? DEFAULT_MATERIAU,
        options: normalizeOptions(source.options ?? {}, source.gammeId),
        coffretCount: normalizeCoffretCount(source.coffretCount),
      })
    );
    if (source.internal) {
      setInternal((current) => ({
        ...current,
        clientName: source.internal.clientName ?? "",
        societe: source.internal.societe ?? "",
        email: source.internal.email ?? "",
        telephone: source.internal.telephone ?? "",
      }));
    }
  }, []);

  useEffect(() => {
    if (!state.gammeId) return;
    saveStoredConfig({
      gammeId: state.gammeId,
      materiau: state.materiau,
      coffretCount: state.coffretCount,
      options: state.options,
      internal,
    });
  }, [state, internal]);

  const setGamme = useCallback((gammeId) => {
    setState({
      ...initialState(),
      gammeId,
      materiau: DEFAULT_MATERIAU,
      options: emptyOptions(),
    });
  }, []);

  const setOption = useCallback((group, optionId) => {
    setState((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [group]: prev.options[group] === optionId ? "" : optionId,
      },
    }));
  }, []);

  const setCoffretCount = useCallback((count) => {
    setState((prev) => ({
      ...prev,
      coffretCount: normalizeCoffretCount(count),
    }));
  }, []);

  const clearOption = useCallback((group) => {
    setState((prev) => ({
      ...prev,
      options: { ...prev.options, [group]: "" },
    }));
  }, []);

  const setRj45Quantity = useCallback((quantity) => {
    setState((prev) => {
      const max = getMaxRj45Count(prev.gammeId);
      const current = Number.parseInt(prev.options.rj45, 10);
      const clamped = Math.min(Math.max(1, quantity), max);
      if (current === clamped) return prev;
      return {
        ...prev,
        options: { ...prev.options, rj45: String(clamped) },
      };
    });
  }, []);

  const setPriseQuantity = useCallback((quantity) => {
    setState((prev) => {
      const max = getMaxPriseCount(prev.gammeId);
      const current = Number.parseInt(prev.options.prise, 10);
      const clamped = Math.min(Math.max(1, quantity), max);
      if (current === clamped) return prev;
      return {
        ...prev,
        options: { ...prev.options, prise: String(clamped) },
      };
    });
  }, []);

  const setCordonRj45Quantity = useCallback((quantity) => {
    setState((prev) => {
      const max = getMaxRj45Count(prev.gammeId);
      const current = parseCordonRj45Quantity(prev.options.cordon_rj45);
      const clamped = Math.min(Math.max(1, quantity), max);
      if (current === clamped) return prev;
      return {
        ...prev,
        options: { ...prev.options, cordon_rj45: String(clamped) },
      };
    });
  }, []);

  const updateInternal = useCallback((field, value) => {
    setInternal((prev) => ({ ...prev, [field]: value }));
  }, []);

  const visibleGroups = useMemo(() => getVisibleGroups(state), [state]);
  const bom = useMemo(
    () => buildBom(state, pricingTierCode),
    [state, pricingTierCode]
  );
  const configCode = useMemo(() => generateConfigCode(state), [state]);

  const getOptionState = useCallback(
    (optionId) => {
      if (!state.gammeId) {
        return { disabled: true, reason: "Choisissez une gamme" };
      }
      const reason = getIncompatibilityReason(optionId, state);
      return {
        disabled: reason !== null,
        reason: reason ?? undefined,
        selected: Object.values(state.options).includes(optionId),
      };
    },
    [state]
  );

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const pdfPreviewUrlRef = useRef(null);

  const revokePdfPreviewUrl = useCallback(() => {
    if (pdfPreviewUrlRef.current) {
      URL.revokeObjectURL(pdfPreviewUrlRef.current);
      pdfPreviewUrlRef.current = null;
    }
    setPdfPreviewUrl(null);
  }, []);

  useEffect(() => () => revokePdfPreviewUrl(), [revokePdfPreviewUrl]);

  const openPdfPreview = useCallback(async () => {
    const blob = await createBomPdfBlob(state, internal, pricingTierCode);
    if (!blob) {
      addToast("error", "Erreur", "Sélectionnez une gamme");
      return;
    }
    revokePdfPreviewUrl();
    const url = URL.createObjectURL(blob);
    pdfPreviewUrlRef.current = url;
    setPdfPreviewUrl(url);
  }, [state, internal, pricingTierCode, addToast, revokePdfPreviewUrl]);

  const closePdfPreview = useCallback(() => {
    revokePdfPreviewUrl();
  }, [revokePdfPreviewUrl]);

  const downloadPdf = useCallback(async () => {
    const ok = await downloadBomPdf(state, internal, pricingTierCode);
    if (ok) addToast("success", "PDF téléchargé", "");
    else addToast("error", "Erreur", "Sélectionnez une gamme");
  }, [state, internal, pricingTierCode, addToast]);

  const copyToClipboard = useCallback(
    async (text, successTitle, successMessage) => {
      try {
        await navigator.clipboard.writeText(text);
        addToast("success", successTitle, successMessage);
      } catch {
        addToast(
          "error",
          "Copie impossible",
          "Votre navigateur a bloqué l'accès au presse-papiers."
        );
      }
    },
    [addToast]
  );

  const shareConfig = useCallback(() => {
    copyToClipboard(
      buildShareUrl(state),
      "Lien copié",
      "Le lien de configuration est dans le presse-papiers."
    );
  }, [state, copyToClipboard]);

  const copyRecap = useCallback(() => {
    copyToClipboard(
      buildQuoteText(state, internal, bom, pricingTierCode),
      "Récapitulatif copié",
      "Collez-le dans un email ou un document."
    );
  }, [state, internal, bom, pricingTierCode, copyToClipboard]);

  const resetConfiguration = useCallback(() => {
    clearStoredConfig();
    setState(initialState());
    setInternal(initialInternal());
    const url = new URL(window.location.href);
    if (url.searchParams.has("config")) {
      url.searchParams.delete("config");
      window.history.replaceState(null, "", url.toString());
    }
    addToast("success", "Configuration réinitialisée", "");
  }, [addToast]);

  const buildMailtoLink = useCallback(() => {
    const subject = encodeURIComponent(`Devis coffret — ${configCode}`);
    const body = [
      "Bonjour,",
      "",
      buildQuoteText(state, internal, bom, pricingTierCode),
      "",
      "Cordialement",
    ].join("\n");

    return `mailto:commercial@xeilom.fr?subject=${subject}&body=${encodeURIComponent(body)}`;
  }, [configCode, state, internal, bom, pricingTierCode]);

  return {
    state,
    internal,
    setGamme,
    setCoffretCount,
    setOption,
    setRj45Quantity,
    setCordonRj45Quantity,
    setPriseQuantity,
    clearOption,
    updateInternal,
    visibleGroups,
    bom,
    getOptionState,
    isConfigurationComplete: isConfigurationComplete(state),
    pdfPreviewUrl,
    openPdfPreview,
    closePdfPreview,
    downloadPdf,
    buildMailtoLink,
    shareConfig,
    copyRecap,
    resetConfiguration,
    toasts,
    removeToast,
  };
}
