import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCoffretConfiguration } from "../hooks/useCoffretConfiguration.js";
import { encodeConfig } from "../utils/configCode.js";
import { clearStoredConfig, saveStoredConfig } from "../utils/storage.js";

const baseOptions = {
  dti_rj45: "",
  dti_fibre: "",
  rj45: "",
  cordon_rj45: "",
  tv: "",
  terre: "",
  prise: "",
  etagere_box: "",
  capot: "",
  porte: "",
  brassage: "",
};

describe("useCoffretConfiguration", () => {
  beforeEach(() => {
    clearStoredConfig();
    window.history.replaceState({}, "", "/");
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearStoredConfig();
  });

  it("charge une configuration valide depuis l'URL", async () => {
    const encoded = encodeConfig({
      gammeId: "xh-m-250",
      materiau: "grade3",
      options: { ...baseOptions, tv: "tv-4" },
    });
    window.history.replaceState({}, "", `/?config=${encoded}`);

    const { result } = renderHook(() => useCoffretConfiguration("S"));

    await waitFor(() => {
      expect(result.current.state.gammeId).toBe("xh-m-250");
      expect(result.current.state.options.tv).toBe("tv-4");
    });
  });

  it("ignore une gamme invalide dans l'URL", async () => {
    const encoded = encodeConfig({
      gammeId: "gamme-inconnue",
      materiau: "grade3",
      options: baseOptions,
    });
    window.history.replaceState({}, "", `/?config=${encoded}`);

    const { result } = renderHook(() => useCoffretConfiguration("S"));

    await waitFor(() => {
      expect(result.current.state.gammeId).toBe("");
    });
  });

  it("affiche un toast si des options sont retirées au chargement", async () => {
    const encoded = encodeConfig({
      gammeId: "xh-m-250",
      materiau: "grade3",
      options: { ...baseOptions, capot: "capot-s250" },
    });
    window.history.replaceState({}, "", `/?config=${encoded}`);

    const { result } = renderHook(() => useCoffretConfiguration("S"));

    await waitFor(() => {
      expect(result.current.toasts.some((t) => t.type === "warning")).toBe(true);
      expect(result.current.state.options.capot).toBe("");
    });
  });

  it("réinitialise la configuration et efface l'URL", async () => {
    saveStoredConfig({
      gammeId: "xh-m-250",
      materiau: "grade3",
      coffretCount: 1,
      options: { ...baseOptions, tv: "tv-4" },
      internal: {
        clientName: "",
        societe: "",
        email: "",
        telephone: "",
        commentaire: "",
      },
    });
    const encoded = encodeConfig({
      gammeId: "xh-m-250",
      materiau: "grade3",
      options: { ...baseOptions, tv: "tv-4" },
    });
    window.history.replaceState({}, "", `/?config=${encoded}`);

    const { result } = renderHook(() => useCoffretConfiguration("S"));

    await waitFor(() => {
      expect(result.current.state.gammeId).toBe("xh-m-250");
    });

    act(() => {
      result.current.resetConfiguration();
    });

    expect(result.current.state.gammeId).toBe("");
    expect(window.location.search).not.toContain("config=");
    expect(result.current.toasts.some((t) => t.title === "Configuration réinitialisée")).toBe(
      true
    );
  });
});
