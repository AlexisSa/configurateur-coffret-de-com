import { useEffect, useState } from "react";
import "./App.css";
import { useCoffretConfiguration } from "./hooks/useCoffretConfiguration.js";
import { useEmbedResize } from "./hooks/useEmbedResize.js";
import { useEmbedContext } from "./hooks/useEmbedContext.js";
import { isEmbedMode } from "./utils/embedMode.js";
import { getGroupMeta } from "./utils/bomBuilder.js";
import { getVisibleGroups } from "./utils/compatibility.js";
import {
  isGroupConfigured,
  isOptionsStepComplete,
  canClearQuantityGroup,
} from "./utils/progress.js";
import {
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
} from "./components/index.js";

const QUANTITY_GROUP_COMPONENTS = {
  rj45: Rj45QuantityGroup,
  cordon_rj45: CordonRj45QuantityGroup,
  prise: PriseQuantityGroup,
};

function App() {
  const embedMode = isEmbedMode();
  useEmbedResize();
  const { pricingTierCode } = useEmbedContext();

  const {
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
    isConfigurationComplete,
    openPdfPreview,
    buildMailtoLink,
    shareConfig,
    shareLinkUrl,
    closeShareLink,
    confirmShareLinkCopied,
    copyRecap,
    resetConfiguration,
    toasts,
    removeToast,
    isQuantityGroup,
  } = useCoffretConfiguration(pricingTierCode);

  const [openGroup, setOpenGroup] = useState(null);

  const showOptions = Boolean(state.gammeId && state.materiau);
  const optionsStepComplete = isOptionsStepComplete(state);
  const showContactForm = isConfigurationComplete && bom.length > 0;

  useEffect(() => {
    if (!state.gammeId) {
      setOpenGroup(null);
      return;
    }
    const groups = getVisibleGroups(state);
    const firstOpen =
      groups.find((group) => !isGroupConfigured(group, state)) ??
      groups[0] ??
      null;
    setOpenGroup(firstOpen);
    // Ne se déclenche qu'au changement de gamme : on lit `state` au moment du
    // recalcul mais on ne veut pas rouvrir l'accordéon à chaque option cochée.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.gammeId]);

  const quantityHandlers = {
    rj45: setRj45Quantity,
    cordon_rj45: setCordonRj45Quantity,
    prise: setPriseQuantity,
  };

  const renderOptionGroupContent = (group) => {
    const QuantityComponent = QUANTITY_GROUP_COMPONENTS[group];
    if (QuantityComponent) {
      return (
        <QuantityComponent
          headerless
          state={state}
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
        onSelect={setOption}
        onClear={clearOption}
        getOptionState={getOptionState}
      />
    );
  };

  const getAccordionClear = (group) => {
    if (isQuantityGroup(group)) {
      return canClearQuantityGroup(group, state)
        ? () => clearOption(group)
        : undefined;
    }
    const selected = state.options[group];
    return selected ? () => clearOption(group) : undefined;
  };

  return (
    <div className={embedMode ? "app app--embed" : "app"}>
      <main className="app-main">
        <div className="layout">
          <div className="wizard-column">
            <GammeSelector
              selectedId={state.gammeId}
              onSelect={setGamme}
            />

            {showOptions && (
              <section className="panel">
                <div className="panel-header">
                  <h2 className="section-title">Options</h2>
                  <span className="section-badge">Étape 2</span>
                </div>

                <IncludedItemsPanel gammeId={state.gammeId} />

                <div className="options-stack options-stack--accordion">
                  {visibleGroups.map((group) => {
                    const meta = getGroupMeta(group);
                    const onClear = getAccordionClear(group);

                    return (
                      <OptionAccordion
                        key={group}
                        title={meta.label}
                        description={meta.description}
                        isConfigured={isGroupConfigured(group, state)}
                        expanded={openGroup === group}
                        onToggle={() =>
                          setOpenGroup((current) =>
                            current === group ? null : group
                          )
                        }
                        showClear={Boolean(onClear)}
                        onClear={onClear}
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
              hasGamme={Boolean(state.gammeId)}
              optionsStepComplete={optionsStepComplete}
              onPreviewPdf={openPdfPreview}
              onShare={shareConfig}
              onReset={resetConfiguration}
            />
          </aside>
        </div>
      </main>

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
