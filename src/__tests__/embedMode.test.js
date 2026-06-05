import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isEmbedMode } from "../utils/embedMode.js";

describe("embedMode", () => {
  const originalHref = window.location.href;

  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    window.history.replaceState({}, "", originalHref);
  });

  it("retourne false sans paramètre embed", () => {
    expect(isEmbedMode()).toBe(false);
  });

  it("retourne true avec ?embed=1", () => {
    window.history.replaceState({}, "", "/?embed=1");
    expect(isEmbedMode()).toBe(true);
  });

  it("retourne false avec une autre valeur embed", () => {
    window.history.replaceState({}, "", "/?embed=true");
    expect(isEmbedMode()).toBe(false);
  });
});
