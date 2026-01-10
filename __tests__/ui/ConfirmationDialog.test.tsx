import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ConfirmationDialog from "../../lib/components/ui/ConfirmationDialog";

jest.mock("../../lib/components/Modal", () => {
  return function MockModal({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal" onClick={onClose}>
        {children}
      </div>
    );
  };
});

describe("ConfirmationDialog", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: "DELETE ITEM",
    message:
      "Are you sure you want to delete this item? This action cannot be undone.",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the dialog when isOpen is true", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByText("[DELETE ITEM]")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Are you sure you want to delete this item? This action cannot be undone."
        )
      ).toBeInTheDocument();
    });

    it("should not render the dialog when isOpen is false", () => {
      render(<ConfirmationDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should render with default button text", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByText("CONFIRM")).toBeInTheDocument();
      expect(screen.getByText("CANCEL")).toBeInTheDocument();
    });

    it("should render with custom button text", () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          confirmText="DELETE"
          cancelText="GO BACK"
        />
      );

      expect(screen.getByText("DELETE")).toBeInTheDocument();
      expect(screen.getByText("GO BACK")).toBeInTheDocument();
    });

    it("should render title with correct formatting", () => {
      render(<ConfirmationDialog {...defaultProps} title="WARNING" />);

      const title = screen.getByText("[WARNING]");
      expect(title).toHaveAttribute("id", "dialog-title");
    });

    it("should render message with correct formatting", () => {
      const message = "This is a test message";
      render(<ConfirmationDialog {...defaultProps} message={message} />);

      const messageElement = screen.getByText(message);
      expect(messageElement).toHaveAttribute("id", "dialog-message");
    });
  });

  describe("Variant Styling", () => {
    it("should apply danger variant styling by default", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const title = screen.getByText("[DELETE ITEM]");
      expect(title).toHaveClass("text-red-400");
    });

    it("should apply danger variant border colors", () => {
      const { container } = render(<ConfirmationDialog {...defaultProps} />);

      const dialogBox = container.querySelector(".border-red-500");
      expect(dialogBox).toBeInTheDocument();
    });

    it("should apply warning variant styling when specified", () => {
      render(<ConfirmationDialog {...defaultProps} variant="warning" />);

      const title = screen.getByText("[DELETE ITEM]");
      expect(title).toHaveClass("text-yellow-400");
    });

    it("should apply warning variant border colors", () => {
      const { container } = render(
        <ConfirmationDialog {...defaultProps} variant="warning" />
      );

      const dialogBox = container.querySelector(".border-yellow-500");
      expect(dialogBox).toBeInTheDocument();
    });

    it("should apply correct button colors for danger variant", () => {
      render(<ConfirmationDialog {...defaultProps} variant="danger" />);

      const confirmButton = screen.getByText("CONFIRM");
      expect(confirmButton).toHaveClass("border-red-500");
      expect(confirmButton).toHaveClass("text-red-400");
      expect(confirmButton).toHaveClass("hover:bg-red-500");
    });

    it("should apply correct button colors for warning variant", () => {
      render(<ConfirmationDialog {...defaultProps} variant="warning" />);

      const confirmButton = screen.getByText("CONFIRM");
      expect(confirmButton).toHaveClass("border-yellow-500");
      expect(confirmButton).toHaveClass("text-yellow-400");
      expect(confirmButton).toHaveClass("hover:bg-yellow-500");
    });
  });

  describe("User Interactions", () => {
    it("should call onConfirm when confirm button is clicked", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const confirmButton = screen.getByText("CONFIRM");
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should call onClose when cancel button is clicked", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const cancelButton = screen.getByText("CANCEL");
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it("should allow multiple confirm clicks when not loading", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const confirmButton = screen.getByText("CONFIRM");
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(3);
    });

    it("should allow multiple cancel clicks when not loading", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const cancelButton = screen.getByText("CANCEL");
      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });
  });

  describe("Loading State", () => {
    it("should disable both buttons when loading", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByText("CONFIRM");
      const cancelButton = screen.getByText("CANCEL");

      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it("should display loading indicator on confirm button", () => {
      const { container } = render(
        <ConfirmationDialog {...defaultProps} isLoading={true} />
      );

      const loadingIndicator = container.querySelector(".animate-pulse");
      expect(loadingIndicator).toBeInTheDocument();
    });

    it("should not call onConfirm when confirm button is clicked while loading", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByText("CONFIRM");
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it("should not call onClose when cancel button is clicked while loading", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByText("CANCEL");
      fireEvent.click(cancelButton);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should apply disabled styling to buttons when loading", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByText("CONFIRM");
      const cancelButton = screen.getByText("CANCEL");

      expect(confirmButton).toHaveClass("disabled:opacity-50");
      expect(confirmButton).toHaveClass("disabled:cursor-not-allowed");
      expect(cancelButton).toHaveClass("disabled:opacity-50");
      expect(cancelButton).toHaveClass("disabled:cursor-not-allowed");
    });

    it("should enable buttons when loading changes from true to false", () => {
      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} isLoading={true} />
      );

      const confirmButton = screen.getByText("CONFIRM");
      expect(confirmButton).toBeDisabled();

      rerender(<ConfirmationDialog {...defaultProps} isLoading={false} />);

      expect(confirmButton).not.toBeDisabled();
    });
  });

  describe("Modal Integration", () => {
    it("should pass isOpen prop to Modal", () => {
      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} isOpen={true} />
      );

      expect(screen.getByTestId("modal")).toBeInTheDocument();

      rerender(<ConfirmationDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should prevent modal close when loading", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      const modal = screen.getByTestId("modal");
      fireEvent.click(modal);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should allow modal close when not loading", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={false} />);

      const modal = screen.getByTestId("modal");
      fireEvent.click(modal);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes on title", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const title = screen.getByText("[DELETE ITEM]");
      expect(title).toHaveAttribute("id", "dialog-title");
    });

    it("should have proper ARIA attributes on message", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const message = screen.getByText(defaultProps.message);
      expect(message).toHaveAttribute("id", "dialog-message");
    });

    it("should have disabled attribute on buttons when loading", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      expect(screen.getByText("CONFIRM")).toHaveAttribute("disabled");
      expect(screen.getByText("CANCEL")).toHaveAttribute("disabled");
    });

    it("should not have disabled attribute on buttons when not loading", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={false} />);

      expect(screen.getByText("CONFIRM")).not.toHaveAttribute("disabled");
      expect(screen.getByText("CANCEL")).not.toHaveAttribute("disabled");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty title", () => {
      render(<ConfirmationDialog {...defaultProps} title="" />);

      expect(screen.getByText("[]")).toBeInTheDocument();
    });

    it("should handle empty message", () => {
      render(<ConfirmationDialog {...defaultProps} message="" />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("should handle very long titles", () => {
      const longTitle = "A".repeat(200);
      render(<ConfirmationDialog {...defaultProps} title={longTitle} />);

      expect(screen.getByText(`[${longTitle}]`)).toBeInTheDocument();
    });

    it("should handle very long messages", () => {
      const longMessage = "This is a very long message. ".repeat(50);
      render(<ConfirmationDialog {...defaultProps} message={longMessage} />);

      expect(
        screen.getByText(/This is a very long message/)
      ).toBeInTheDocument();
    });

    it("should handle special characters in title", () => {
      const specialTitle = 'Delete <Item> & "Confirm" [Action]';
      render(<ConfirmationDialog {...defaultProps} title={specialTitle} />);

      expect(screen.getByText(`[${specialTitle}]`)).toBeInTheDocument();
    });

    it("should handle special characters in message", () => {
      const specialMessage =
        "Are you sure? This will delete <all> data & reset 'everything'";
      render(<ConfirmationDialog {...defaultProps} message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it("should handle rapid state changes", () => {
      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} isLoading={false} />
      );

      rerender(<ConfirmationDialog {...defaultProps} isLoading={true} />);
      rerender(<ConfirmationDialog {...defaultProps} isLoading={false} />);
      rerender(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByText("CONFIRM");
      expect(confirmButton).toBeDisabled();
    });

    it("should maintain state when switching variants", () => {
      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} variant="danger" />
      );

      rerender(<ConfirmationDialog {...defaultProps} variant="warning" />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(mockOnConfirm).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should handle undefined optional props gracefully", () => {
      const minimalProps = {
        isOpen: true,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        title: "Test",
        message: "Test message",
      };

      render(<ConfirmationDialog {...minimalProps} />);

      expect(screen.getByText("CONFIRM")).toBeInTheDocument();
      expect(screen.getByText("CANCEL")).toBeInTheDocument();
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });
  });

  describe("Button Layout", () => {
    it("should render buttons in correct order", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveTextContent("CANCEL");
      expect(buttons[1]).toHaveTextContent("CONFIRM");
    });

    it("should maintain button order with custom text", () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          confirmText="YES"
          cancelText="NO"
        />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toHaveTextContent("NO");
      expect(buttons[1]).toHaveTextContent("YES");
    });
  });

  describe("Corner Decorations", () => {
    it("should render all four corner decorations", () => {
      const { container } = render(<ConfirmationDialog {...defaultProps} />);

      const corners = container.querySelectorAll(".absolute");
      const cornerDecorations = Array.from(corners).filter(
        (el) => el.classList.contains("h-4") && el.classList.contains("w-4")
      );

      expect(cornerDecorations).toHaveLength(4);
    });

    it("should apply correct positioning to corners", () => {
      const { container } = render(<ConfirmationDialog {...defaultProps} />);

      const topLeft = container.querySelector(".-left-px.-top-px");
      const topRight = container.querySelector(".-right-px.-top-px");
      const bottomLeft = container.querySelector(".-bottom-px.-left-px");
      const bottomRight = container.querySelector(".-bottom-px.-right-px");

      expect(topLeft).toBeInTheDocument();
      expect(topRight).toBeInTheDocument();
      expect(bottomLeft).toBeInTheDocument();
      expect(bottomRight).toBeInTheDocument();
    });
  });

  describe("Component Updates", () => {
    it("should update title when prop changes", () => {
      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} title="OLD TITLE" />
      );

      expect(screen.getByText("[OLD TITLE]")).toBeInTheDocument();

      rerender(<ConfirmationDialog {...defaultProps} title="NEW TITLE" />);

      expect(screen.queryByText("[OLD TITLE]")).not.toBeInTheDocument();
      expect(screen.getByText("[NEW TITLE]")).toBeInTheDocument();
    });

    it("should update message when prop changes", () => {
      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} message="Old message" />
      );

      expect(screen.getByText("Old message")).toBeInTheDocument();

      rerender(<ConfirmationDialog {...defaultProps} message="New message" />);

      expect(screen.queryByText("Old message")).not.toBeInTheDocument();
      expect(screen.getByText("New message")).toBeInTheDocument();
    });

    it("should update button text when props change", () => {
      const { rerender } = render(
        <ConfirmationDialog
          {...defaultProps}
          confirmText="OLD"
          cancelText="OLD_CANCEL"
        />
      );

      expect(screen.getByText("OLD")).toBeInTheDocument();

      rerender(
        <ConfirmationDialog
          {...defaultProps}
          confirmText="NEW"
          cancelText="NEW_CANCEL"
        />
      );

      expect(screen.queryByText("OLD")).not.toBeInTheDocument();
      expect(screen.getByText("NEW")).toBeInTheDocument();
    });
  });
});
