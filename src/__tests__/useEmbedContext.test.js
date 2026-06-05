import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  EMBED_CONTEXT_MESSAGE_TYPE,
  useEmbedContext,
} from "../hooks/useEmbedContext.js";

describe("useEmbedContext", () => {
  beforeEach(() => {
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

  it("met à jour le tarif via postMessage parent", () => {
    const { result } = renderHook(() => useEmbedContext());
    expect(result.current.pricingTierCode).toBe("S");

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://www.xeilom.fr",
          data: {
            type: EMBED_CONTEXT_MESSAGE_TYPE,
            categoryId: "3394154",
          },
        })
      );
    });

    expect(result.current.pricingTierCode).toBe("A");
  });
});
