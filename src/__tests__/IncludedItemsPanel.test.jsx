import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IncludedItemsPanel } from "../components/IncludedItemsPanel.jsx";

describe("IncludedItemsPanel", () => {
  it("ne s'affiche pas si la liste est vide", () => {
    const { container } = render(<IncludedItemsPanel gammeId="xh-p-300" />);
    expect(container.firstChild).toBeNull();
  });

  it("affiche les éléments renseignés dans le catalogue", () => {
    render(<IncludedItemsPanel gammeId="xh-m-250" />);
    expect(screen.getByText(/^Déjà inclus$/i)).toBeInTheDocument();
    expect(screen.getByText("Bornier de mise à la terre")).toBeInTheDocument();
    expect(screen.getByText("Panneau pour 10 RJ45")).toBeInTheDocument();
  });
});
