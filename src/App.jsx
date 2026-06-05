import { useCallback, useEffect, useState } from "react";
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
  MobileSummaryBar,
  PdfPreviewModal,
  OptionAccordion,
} from "./components/index.js";

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
  }, [state.gammeId]);

  const handleSetOption = useCallback(
    (group, optionId) => setOption(group, optionId),
    [setOption]
  );

  const handleSetRj45Quantity = useCallback(
    (value) => setRj45Quantity(value),
    [setRj45Quantity]
  );

  const handleSetPriseQuantity = useCallback(
    (value) => setPriseQuantity(value),
    [setPriseQuantity]
  );

  const handleSetCordonRj45Quantity = useCallback(
    (value) => setCordonRj45Quantity(value),
    [setCordonRj45Quantity]
  );

  const handleClearOption = useCallback(
    (group) => clearOption(group),
    [clearOption]
  );

  const handleScrollToContact = () => {
    document.getElementById("contact-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const renderOptionGroupContent = (group) => {
    if (group === "rj45") {
      return (
        <Rj45QuantityGroup
          headerless
          state={state}
          onQuantityChange={handleSetRj45Quantity}
          onClear={() => handleClearOption("rj45")}
        />
      );
    }
    if (group === "cordon_rj45") {
      return (
        <CordonRj45QuantityGroup
          headerless
          state={state}
          onQuantityChange={handleSetCordonRj45Quantity}
          onClear={() => handleClearOption("cordon_rj45")}
        />
      );
    }
    if (group === "prise") {
      return (
        <PriseQuantityGroup
          headerless
          state={state}
          onQuantityChange={handleSetPriseQuantity}
          onClear={() => handleClearOption("prise")}
        />
      );
    }
    return (
      <OptionGroup
        headerless
        group={group}
        state={state}
        onSelect={handleSetOption}
        onClear={handleClearOption}
        getOptionState={getOptionState}
      />
    );
  };

  const getAccordionClear = (group) => {
    if (group === "rj45") {
      const qty = Number.parseInt(state.options.rj45, 10);
      return qty > 0 ? () => handleClearOption("rj45") : undefined;
    }
    if (group === "cordon_rj45") {
      const qty = Number.parseInt(state.options.cordon_rj45, 10);
      return qty > 0 ? () => handleClearOption("cordon_rj45") : undefined;
    }
    if (group === "prise") {
      const qty = Number.parseInt(state.options.prise, 10);
      return qty > 0 ? () => handleClearOption("prise") : undefined;
    }
    const selected = state.options[group];
    return selected ? () => handleClearOption(group) : undefined;
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
                count={state.coffretCount ?? 1}
                onChange={setCoffretCount}
              />
            )}
            <RecapTable
              bom={bom}
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

      <MobileSummaryBar
        bom={bom}
        showContactCta={showContactForm}
        onScrollToContact={handleScrollToContact}
        onPreviewPdf={openPdfPreview}
        onShare={shareConfig}
      />

      <PdfPreviewModal
        open={pdfPreviewUrl != null}
        url={pdfPreviewUrl}
        onClose={closePdfPreview}
        onDownload={downloadPdf}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
