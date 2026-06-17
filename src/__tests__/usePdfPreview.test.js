import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePdfPreview } from "../hooks/usePdfPreview.js";

vi.mock("../utils/pdfGenerator.js", () => ({
  createBomPdfBlob: vi.fn(async () => new Blob(["pdf"], { type: "application/pdf" })),
}));

describe("usePdfPreview", () => {
  const addToast = vi.fn();
  const params = {
    state: { gammeId: "xh-m-250", materiau: "grade3", options: {} },
    internal: {},
    pricingTierCode: "S",
    addToast,
  };

  beforeEach(() => {
    addToast.mockClear();
    vi.stubGlobal("open", vi.fn(() => ({ closed: false })));
    URL.createObjectURL = vi.fn(() => "blob:pdf");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("ouvre le PDF dans un nouvel onglet", async () => {
    const { result } = renderHook(() => usePdfPreview(params));
    await act(async () => {
      await result.current.openPdfPreview();
    });
    expect(window.open).toHaveBeenCalledWith(
      "blob:pdf",
      "_blank",
      "noopener,noreferrer"
    );
    expect(addToast).not.toHaveBeenCalled();
  });

  it("affiche une erreur si window.open est bloqué", async () => {
    vi.stubGlobal("open", vi.fn(() => null));
    const { result } = renderHook(() => usePdfPreview(params));
    await act(async () => {
      await result.current.openPdfPreview();
    });
    expect(addToast).toHaveBeenCalledWith(
      "error",
      "Ouverture bloquée",
      expect.any(String)
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:pdf");
  });
});
