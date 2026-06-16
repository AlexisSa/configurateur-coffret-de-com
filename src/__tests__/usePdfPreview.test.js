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
    vi.stubGlobal("open", vi.fn(() => null));
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    URL.createObjectURL = vi.fn(() => "blob:pdf");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("télécharge le PDF si window.open est bloqué", async () => {
    const { result } = renderHook(() => usePdfPreview(params));
    await act(async () => {
      await result.current.openPdfPreview();
    });
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    expect(addToast).toHaveBeenCalledWith(
      "success",
      "PDF téléchargé",
      expect.any(String)
    );
  });
});
