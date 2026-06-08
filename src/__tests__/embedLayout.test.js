import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getEmbedReportedHeight,
  syncEmbedSidebarPinned,
} from "../utils/embedLayout.js";

describe("embedLayout", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.documentElement.style.height = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("retourne la hauteur du document pour l'iframe parent", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 2400,
      configurable: true,
    });

    expect(getEmbedReportedHeight()).toBe(2400);
  });

  it("épingle la pile sidebar en desktop embed", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true });
    Object.defineProperty(window, "innerHeight", { value: 900, configurable: true });

    const sidebar = document.createElement("aside");
    const stack = document.createElement("div");
    stack.getBoundingClientRect = () => ({
      left: 640,
      width: 360,
      top: 120,
      height: 400,
      right: 1000,
      bottom: 520,
      x: 640,
      y: 120,
      toJSON: () => ({}),
    });
    Object.defineProperty(stack, "scrollHeight", { value: 420, configurable: true });
    sidebar.appendChild(stack);
    document.body.appendChild(sidebar);

    sidebar.getBoundingClientRect = () => ({
      left: 640,
      width: 360,
      top: 120,
      height: 0,
      right: 1000,
      bottom: 120,
      x: 640,
      y: 120,
      toJSON: () => ({}),
    });

    syncEmbedSidebarPinned(sidebar, stack);

    expect(sidebar.classList.contains("sidebar-column--pinned")).toBe(true);
    expect(stack.style.position).toBe("fixed");
    expect(stack.style.left).toBe("640px");
    expect(stack.style.width).toBe("360px");
    expect(sidebar.style.minHeight).toBe("420px");
  });

  it("retire l'épinglage hors desktop", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: false });

    const sidebar = document.createElement("aside");
    sidebar.classList.add("sidebar-column--pinned");
    const stack = document.createElement("div");
    stack.style.position = "fixed";
    sidebar.appendChild(stack);
    document.body.appendChild(sidebar);

    syncEmbedSidebarPinned(sidebar, stack);

    expect(sidebar.classList.contains("sidebar-column--pinned")).toBe(false);
    expect(stack.style.position).toBe("");
  });
});
