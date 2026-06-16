import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { useCoffretConfiguration } from "./hooks/useCoffretConfiguration.js";
import { useEmbedResize } from "./hooks/useEmbedResize.js";
import { useEmbedContext } from "./hooks/useEmbedContext.js";
import { isEmbedMode } from "./utils/embedMode.js";
import { getGroupMeta } from "./utils/bomBuilder.js";
import { getVisibleGroups } from "./utils/compatibility.js";
import {
  getConfiguredGroupsProgress,
  getGroupAccordionHint,
} from "./utils/configurationReadiness.js";
import {
  isOptionsStepComplete,
  shouldShowAccordionClear,
  isGroupResolved,
  isExplicitNoneChoice,
  getChangedOptionGroup,
  getNewlyAcknowledgedGroup,
  getNextAccordionGroup,
} from "./utils/progress.js";
import { getConfiguredCoffretRef } from "./utils/bomDisplay.js";
import { getOrderPricingLines } from "./utils/orderPricing.js";
import { hasPricedLines } from "./utils/pricing.js";
import { getPricingTierLabel } from "./utils/pricingTier.js";
import { normalizeCoffretCount } from "./utils/coffretQuantity.js";
import {
  Header,
  GammeSelector,
  OptionGroup,
  Rj45QuantityGroup,
  CordonRj45QuantityGroup,
  PriseQuantityGroup,
  CoffretQuantitySelector,
  RecapTable,
  ContactForm,
  ToastContainer,
  ShareLinkModal,
  OptionAccordion,
  IncludedItemsPanel,
  ConfigSummaryBar,
  RefLegendModal,
  RefApplyField,
} from "./components/index.js";

const QUANTITY_GROUP_COMPONENTS = {
  rj45: Rj45QuantityGroup,
  cordon_rj45: CordonRj45QuantityGroup,
  prise: PriseQuantityGroup,
};

function App() {
  const embedMode = isEmbedMode();
  useEmbedResize();
  const { pricingTierCode, pricingTierPending } = useEmbedContext();
  const [refLegendOpen, setRefLegendOpen] = useState(false);

  const {
    state,
    acknowledgedGroups,
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
    configurationReady,
    openPdfPreview,
    buildMailtoLink,
    shareConfig,
    applyConfigurationFromRef,
    shareLinkUrl,
    closeShareLink,
    confirmShareLinkCopied,
    copyRecap,
    resetConfiguration,
    toasts,
    removeToast,
  } = useCoffretConfiguration(pricingTierCode);

  const [openGroup, setOpenGroup] = useState(null);
  const prevOptionsRef = useRef(state.options);
  const prevAckRef = useRef(acknowledgedGroups);

  const showOptions = Boolean(state.gammeId && state.materiau);
  const optionsStepComplete = isOptionsStepComplete(state);
  const showContactForm = configurationReady && bom.length > 0;
  const groupsProgress = getConfiguredGroupsProgress(state, acknowledgedGroups);
  const configuredRef = getConfiguredCoffretRef(bom);
  const pricingTierLabel = getPricingTierLabel(pricingTierCode);

  const summaryTotalHT = useMemo(() => {
    if (!hasPricedLines(bom)) return null;
    const lines = getOrderPricingLines(bom, normalizeCoffretCount(state.coffretCount));
    return lines.find((line) => line.highlight)?.amount ?? null;
  }, [bom, state.coffretCount]);

  useEffect(() => {
    if (!state.gammeId) {
      setOpenGroup(null);
      return;
    }
    const groups = getVisibleGroups(state);
    const firstOpen =
      groups.find((group) => !isGroupResolved(group, state, acknowledgedGroups)) ??
      groups[0] ??
      null;
    setOpenGroup(firstOpen);
    prevAckRef.current = {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.gammeId]);

  useEffect(() => {
    if (!state.gammeId || !openGroup) {
      prevOptionsRef.current = state.options;
      prevAckRef.current = acknowledgedGroups;
      return;
    }

    const changedGroup = getChangedOptionGroup(
      prevOptionsRef.current,
      state.options
    );
    const newlyAcknowledged = getNewlyAcknowledgedGroup(
      prevAckRef.current,
      acknowledgedGroups
    );
    prevOptionsRef.current = state.options;
    prevAckRef.current = acknowledgedGroups;

    const next = getNextAccordionGroup(
      state,
      openGroup,
      changedGroup,
      newlyAcknowledged,
      acknowledgedGroups
    );
    if (next && next !== openGroup) {
      setOpenGroup(next);
    }
  }, [state.options, acknowledgedGroups, openGroup, state.gammeId]);

  const quantityHandlers = {
    rj45: setRj45Quantity,
    cordon_rj45: setCordonRj45Quantity,
    prise: setPriseQuantity,
  };

  const renderOptionGroupContent = (group) => {
    const explicitNone = isExplicitNoneChoice(group, state, acknowledgedGroups);
    const QuantityComponent = QUANTITY_GROUP_COMPONENTS[group];
    if (QuantityComponent) {
      return (
        <QuantityComponent
          headerless
          state={state}
          explicitNone={explicitNone}
          onQuantityChange={quantityHandlers[group]}
          onClear={() => clearOption(group)}
        />
      );
    }
    return (
      <OptionGroup
        headerless
        group={group}
        state={state}
        explicitNone={explicitNone}
        onSelect={setOption}
        onClear={clearOption}
        getOptionState={getOptionState}
      />
    );
  };

  const getAccordionClear = (group) => {
    if (!shouldShowAccordionClear(group, state)) return undefined;
    return () => clearOption(group);
  };

  return (
    <div className={embedMode ? "app app--embed" : "app"}>
      {!embedMode && <Header />}

      <main className="app-main">
        <div className="layout">
          <div className="wizard-column">
            <GammeSelector selectedId={state.gammeId} onSelect={setGamme} />

            {showOptions && (
              <section className="panel">
                <div className="panel-header">
                  <h2 className="section-title">Options</h2>
                  <span className="section-badge">
                    Étape 2 · {groupsProgress.configured}/{groupsProgress.total}{" "}
                    groupes
                  </span>
                </div>

                <IncludedItemsPanel gammeId={state.gammeId} />

                <div className="options-stack options-stack--accordion">
                  {visibleGroups.map((group) => {
                    const meta = getGroupMeta(group);
                    const hint = getGroupAccordionHint(group, state, acknowledgedGroups);

                    return (
                      <OptionAccordion
                        key={group}
                        title={meta.label}
                        description={meta.description}
                        hint={hint}
                        isConfigured={isGroupResolved(group, state, acknowledgedGroups)}
                        expanded={openGroup === group}
                        onToggle={() =>
                          setOpenGroup((current) =>
                            current === group ? null : group
                          )
                        }
                        showClear={shouldShowAccordionClear(group, state)}
                        clearActive={isExplicitNoneChoice(group, state, acknowledgedGroups)}
                        onClear={getAccordionClear(group)}
                      >
                        {renderOptionGroupContent(group)}
                      </OptionAccordion>
                    );
                  })}
                </div>
              </section>
            )}

            {showContactForm && (
              <ContactForm
                internal={internal}
                updateInternal={updateInternal}
                buildMailtoLink={buildMailtoLink}
                onCopyRecap={copyRecap}
                coffretCount={normalizeCoffretCount(state.coffretCount)}
              />
            )}
          </div>

          <aside className="sidebar-column">
            {showOptions && (
              <CoffretQuantitySelector
                count={state.coffretCount}
                onChange={setCoffretCount}
              />
            )}
            <RecapTable
              bom={bom}
              coffretCount={state.coffretCount}
              pricingTierCode={pricingTierCode}
              pricingTierLabel={pricingTierLabel}
              pricingTierPending={embedMode && pricingTierPending}
              hasGamme={Boolean(state.gammeId)}
              optionsStepComplete={optionsStepComplete}
              isConfigurationReady={configurationReady}
              onPreviewPdf={openPdfPreview}
              onShare={shareConfig}
              onApplyRef={applyConfigurationFromRef}
              onOpenLegend={() => setRefLegendOpen(true)}
              onReset={resetConfiguration}
            />
          </aside>
        </div>
      </main>

      {state.gammeId && (
        <ConfigSummaryBar
          configuredRef={configuredRef}
          totalHT={summaryTotalHT}
          isConfigurationReady={configurationReady}
          onPreviewPdf={openPdfPreview}
          onShare={shareConfig}
          onOpenLegend={() => setRefLegendOpen(true)}
        />
      )}

      <RefLegendModal
        open={refLegendOpen}
        onClose={() => setRefLegendOpen(false)}
      />

      <ShareLinkModal
        open={shareLinkUrl != null}
        url={shareLinkUrl ?? ""}
        onClose={closeShareLink}
        onCopied={confirmShareLinkCopied}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
