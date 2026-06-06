import { useState, useEffect, useCallback, useMemo } from "react";
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
import { buildQuoteText } from "../utils/quote.js";
import { normalizeCoffretCount, DEFAULT_COFFRET_COUNT } from "../utils/coffretQuantity.js";
import { loadStoredConfig, clearStoredConfig } from "../utils/storage.js";
import {
  emptyOptions,
  defaultOptionsForGamme,
  DEFAULT_MATERIAU,
  validateAndNormalizeConfig,
  applyOptionSelection,
} from "../utils/configSanitizer.js";
import {
  isQuantityGroup,
  clampQuantityForGroup,
  quantityGroupHandlers,
} from "../utils/quantityGroups.js";
import { buildMailtoLink } from "../utils/mailto.js";
import { copyTextToClipboard } from "../utils/clipboard.js";
import { useToasts } from "./useToasts.js";
import { usePdfPreview } from "./usePdfPreview.js";
import { useConfigPersistence } from "./useConfigPersistence.js";

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
  commentaire: "",
});

export function useCoffretConfiguration(pricingTierCode) {
  const [state, setState] = useState(initialState);
  const [internal, setInternal] = useState(initialInternal);
  const [shareLinkUrl, setShareLinkUrl] = useState(null);
  const { toasts, addToast, removeToast } = useToasts();

  useEffect(() => {
    const fromUrl = loadConfigFromUrl();
    const source = fromUrl?.gammeId ? fromUrl : loadStoredConfig();
    if (!source?.gammeId) return;

    const result = validateAndNormalizeConfig(source);
    if (!result) return;

    setState(result.state);
    if (source.internal) {
      setInternal((current) => ({
        ...current,
        clientName: source.internal.clientName ?? "",
        societe: source.internal.societe ?? "",
        email: source.internal.email ?? "",
        telephone: source.internal.telephone ?? "",
        commentaire: source.internal.commentaire ?? "",
      }));
    }
    if (result.warnings.length > 0) {
      addToast(
        "warning",
        "Configuration ajustée",
        "Certaines options ne sont plus compatibles et ont été retirées."
      );
    }
  }, [addToast]);

  useConfigPersistence({
    gammeId: state.gammeId,
    materiau: state.materiau,
    coffretCount: state.coffretCount,
    options: state.options,
    internal,
  });

  const setGamme = useCallback((gammeId) => {
    setState({
      ...initialState(),
      gammeId,
      materiau: DEFAULT_MATERIAU,
      options: defaultOptionsForGamme(gammeId),
    });
  }, []);

  const setOption = useCallback((group, optionId) => {
    setState((prev) => applyOptionSelection(prev, group, optionId));
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

  const setQuantityForGroup = useCallback((group, quantity) => {
    setState((prev) => {
      const handler = quantityGroupHandlers[group];
      if (!handler) return prev;
      const current = handler.parse(prev.options[group]);
      const clamped = clampQuantityForGroup(group, prev.gammeId, quantity);
      if (current === clamped) return prev;
      return {
        ...prev,
        options: { ...prev.options, [group]: String(clamped) },
      };
    });
  }, []);

  const setRj45Quantity = useCallback(
    (quantity) => setQuantityForGroup("rj45", quantity),
    [setQuantityForGroup]
  );

  const setPriseQuantity = useCallback(
    (quantity) => setQuantityForGroup("prise", quantity),
    [setQuantityForGroup]
  );

  const setCordonRj45Quantity = useCallback(
    (quantity) => setQuantityForGroup("cordon_rj45", quantity),
    [setQuantityForGroup]
  );

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

  const { pdfPreviewUrl, openPdfPreview, closePdfPreview, downloadPdf } =
    usePdfPreview({ state, internal, pricingTierCode, addToast });

  const copyToClipboard = useCallback(
    async (text, successTitle, successMessage) => {
      const copied = await copyTextToClipboard(text);
      if (copied) {
        addToast("success", successTitle, successMessage);
        return true;
      }
      addToast(
        "error",
        "Copie impossible",
        "Votre navigateur a bloqué l'accès au presse-papiers."
      );
      return false;
    },
    [addToast]
  );

  const shareConfig = useCallback(async () => {
    const url = buildShareUrl(state);
    const copied = await copyTextToClipboard(url);
    if (copied) {
      addToast(
        "success",
        "Lien copié",
        "Le lien de configuration est dans le presse-papiers."
      );
      return;
    }
    setShareLinkUrl(url);
  }, [state, addToast]);

  const closeShareLink = useCallback(() => {
    setShareLinkUrl(null);
  }, []);

  const confirmShareLinkCopied = useCallback(() => {
    addToast(
      "success",
      "Lien copié",
      "Le lien de configuration est dans le presse-papiers."
    );
    setShareLinkUrl(null);
  }, [addToast]);

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

  const buildMailtoLinkFn = useCallback(
    () =>
      buildMailtoLink({
        state,
        internal,
        bom,
        pricingTierCode,
        configCode,
      }),
    [configCode, state, internal, bom, pricingTierCode]
  );

  return {
    state,
    internal,
    setGamme,
    setCoffretCount,
    setOption,
    setRj45Quantity,
    setCordonRj45Quantity,
    setPriseQuantity,
    setQuantityForGroup,
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
    buildMailtoLink: buildMailtoLinkFn,
    shareConfig,
    shareLinkUrl,
    closeShareLink,
    confirmShareLinkCopied,
    copyRecap,
    resetConfiguration,
    toasts,
    removeToast,
    isQuantityGroup,
  };
}
