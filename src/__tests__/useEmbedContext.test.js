import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  EMBED_CONTEXT_MESSAGE_TYPE,
  EMBED_REQUEST_CONTEXT_MESSAGE_TYPE,
  useEmbedContext,
} from "../hooks/useEmbedContext.js";

describe("useEmbedContext", () => {
  const postMessage = vi.fn();

  beforeEach(() => {
    postMessage.mockClear();
    Object.defineProperty(window, "parent", {
      configurable: true,
      value: { postMessage },
    });
    window.history.replaceState({}, "", "/?embed=1");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lit la catégorie depuis categoryId dans l'URL", () => {
    window.history.replaceState({}, "", "/?embed=1&categoryId=3394219");
    const { result } = renderHook(() => useEmbedContext());
    expect(result.current.pricingTierCode).toBe("Z");
  });

  it("demande le contexte au parent au montage en mode embed", () => {
    renderHook(() => useEmbedContext());
    expect(postMessage).toHaveBeenCalledWith(
      { type: EMBED_REQUEST_CONTEXT_MESSAGE_TYPE },
      "*"
    );
  });

  it("met à jour le tarif via postMessage parent", () => {
    const { result } = renderHook(() => useEmbedContext());
    expect(result.current.pricingTierCode).toBe("S");

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://www.xeilom.fr",
          data: {
            type: EMBED_CONTEXT_MESSAGE_TYPE,
            categoryId: 3394154,
          },
        })
      );
    });

    expect(result.current.pricingTierCode).toBe("A");
  });
});
