import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getEmbedReportedHeight,
  syncEmbedViewportScrollClass,
  disableEmbedViewportScroll,
} from "../utils/embedLayout.js";

describe("embedLayout", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    document.documentElement.style.height = "";
    document.body.style.height = "";
  });

  afterEach(() => {
    disableEmbedViewportScroll();
    vi.restoreAllMocks();
  });

  it("retourne innerHeight en viewport desktop", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true });
    Object.defineProperty(window, "innerHeight", { value: 820, configurable: true });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 2400,
      configurable: true,
    });

    expect(getEmbedReportedHeight()).toBe(820);
  });

  it("retourne scrollHeight en mobile embed", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: false });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 1800,
      configurable: true,
    });

    expect(getEmbedReportedHeight()).toBe(1800);
  });

  it("bascule la classe embed-mode sur html", () => {
    syncEmbedViewportScrollClass(true);
    expect(document.documentElement.classList.contains("embed-mode")).toBe(true);

    syncEmbedViewportScrollClass(false);
    expect(document.documentElement.classList.contains("embed-mode")).toBe(false);
  });
});
