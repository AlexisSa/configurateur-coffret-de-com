import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "../components/ContactForm.jsx";

const emptyInternal = {
  clientName: "",
  societe: "",
  email: "",
  telephone: "",
  commentaire: "",
};

describe("ContactForm", () => {
  it("désactive l'envoi email si les champs sont incomplets", () => {
    render(
      <ContactForm
        internal={emptyInternal}
        updateInternal={vi.fn()}
        buildMailtoLink={() => "mailto:test@example.com"}
      />
    );

    expect(screen.getByRole("button", { name: /envoyer par email/i })).toBeDisabled();
  });

  it("active l'envoi quand tous les champs sont valides", () => {
    const internal = {
      clientName: "Jean Dupont",
      societe: "ACME",
      email: "jean@acme.fr",
      telephone: "0612345678",
    };

    render(
      <ContactForm
        internal={internal}
        updateInternal={vi.fn()}
        buildMailtoLink={() => "mailto:test@example.com"}
      />
    );

    const sendButton = screen.getByRole("button", { name: /envoyer par email/i });
    expect(sendButton).toBeEnabled();
    expect(sendButton).not.toHaveAttribute("disabled");
  });

  it("affiche une erreur email après blur sur une adresse invalide", async () => {
    const user = userEvent.setup();
    const updateInternal = vi.fn();

    render(
      <ContactForm
        internal={{ ...emptyInternal, email: "invalide" }}
        updateInternal={updateInternal}
        buildMailtoLink={() => "mailto:test@example.com"}
      />
    );

    await user.click(screen.getByLabelText(/email/i));
    await user.tab();

    expect(screen.getByText(/adresse email invalide/i)).toBeInTheDocument();
  });

  it("permet de saisir un commentaire optionnel", async () => {
    const user = userEvent.setup();
    const updateInternal = vi.fn();

    render(
      <ContactForm
        internal={emptyInternal}
        updateInternal={updateInternal}
        buildMailtoLink={() => "mailto:test@example.com"}
      />
    );

    const textarea = screen.getByLabelText(/commentaire/i);
    expect(textarea).toBeInTheDocument();
    await user.type(textarea, "Livraison urgente");
    expect(updateInternal).toHaveBeenCalled();
  });

  it("affiche une erreur téléphone après blur sur un numéro trop court", async () => {
    const user = userEvent.setup();

    render(
      <ContactForm
        internal={{ ...emptyInternal, telephone: "123" }}
        updateInternal={vi.fn()}
        buildMailtoLink={() => "mailto:test@example.com"}
      />
    );

    await user.click(screen.getByLabelText(/téléphone/i));
    await user.tab();

    expect(screen.getByText(/numéro de téléphone invalide/i)).toBeInTheDocument();
  });
});
