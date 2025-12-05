import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FeedbackDetailModal from "../../lib/components/FeedbackDetailModal";
import { apiFetch } from "@/lib/apiClient";
import type { IFeedback } from "@/models/Feedback";

jest.mock("@/lib/apiClient");
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

jest.mock("@/lib/components/AnalysisResult", () => ({
  __esModule: true,
  default: ({
    analysis,
    isEditingNextAction,
    editedNextAction,
    onEditStart,
    onEditCancel,
    onEditSave,
    onNextActionChange,
    nextActionError,
  }: any) => (
    <div data-testid="analysis-result">
      <div>Sentiment: {analysis.sentiment}</div>
      <div>Category: {analysis.tags?.[0] || "N/A"}</div>
      <div>Next Action: {analysis.nextAction}</div>

      {!isEditingNextAction ? (
        <button data-testid="edit-button" onClick={onEditStart}>
          Edit
        </button>
      ) : (
        <div>
          <textarea
            data-testid="next-action-input"
            value={editedNextAction}
            onChange={(e) => onNextActionChange(e.target.value)}
          />
          {nextActionError && <div>{nextActionError}</div>}
          <button data-testid="cancel-edit-button" onClick={onEditCancel}>
            Cancel
          </button>
          <button
            data-testid="save-button"
            onClick={() => onEditSave(editedNextAction)}
          >
            Save
          </button>
        </div>
      )}
    </div>
  ),
}));

jest.mock("@/lib/utils/formatDate", () => ({
  formatDate: (date: string) => `formatted_${date}`,
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe("FeedbackDetailModal", () => {
  const mockOnClose = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnUpdateNextAction = jest.fn();

  const mockFeedback: IFeedback = {
    _id: "feedback-123",
    text: "This is test feedback text",
    email: "test@example.com",
    createdAt: "2024-01-01T00:00:00Z",
    analysis: {
      sentiment: "positive",
      category: "feature_request",
      nextAction: "Review and prioritize for next sprint",
    },
  };

  const defaultProps = {
    feedbackId: "feedback-123",
    onClose: mockOnClose,
    onDelete: mockOnDelete,
    onUpdateNextAction: mockOnUpdateNextAction,
    isDeleting: false,
    isUpdating: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should not render when feedbackId is null", () => {
      render(<FeedbackDetailModal {...defaultProps} feedbackId={null} />);

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should render modal when feedbackId is provided", () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("should display loading state initially", () => {
      mockApiFetch.mockImplementationOnce(() => new Promise(() => {}));

      render(<FeedbackDetailModal {...defaultProps} />);

      expect(screen.getByText("LOADING_RECORD")).toBeInTheDocument();
      expect(
        screen.getByText("Retrieving feedback data...")
      ).toBeInTheDocument();
    });

    it("should display header with correct title", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("FEEDBACK_DETAILS")).toBeInTheDocument();
        expect(screen.getByText("[RECORD_VIEWER]")).toBeInTheDocument();
      });
    });

    it("should render DELETE and CLOSE buttons", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("DELETE")).toBeInTheDocument();
        expect(screen.getByText("CLOSE")).toBeInTheDocument();
      });
    });
  });

  describe("Data Fetching", () => {
    it("should fetch feedback data on mount", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith("/api/feedback/feedback-123");
      });
    });

    it("should display feedback data after successful fetch", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("This is test feedback text")
        ).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
        expect(
          screen.getByText(/formatted_2024-01-01T00:00:00Z/)
        ).toBeInTheDocument();
      });
    });

    it("should not display email when not provided", async () => {
      const feedbackWithoutEmail = { ...mockFeedback, email: undefined };
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: feedbackWithoutEmail,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByText(/SUBMITTER:/)).not.toBeInTheDocument();
      });
    });

    it("should refetch when feedbackId changes", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      const { rerender } = render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledTimes(1);
      });

      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: { ...mockFeedback, _id: "feedback-456" },
      });

      rerender(
        <FeedbackDetailModal {...defaultProps} feedbackId="feedback-456" />
      );

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith("/api/feedback/feedback-456");
        expect(mockApiFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message when fetch fails", async () => {
      mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("[LOAD_ERROR]")).toBeInTheDocument();
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
    });

    it("should display generic error message when error message is empty", async () => {
      mockApiFetch.mockRejectedValueOnce(new Error(""));

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Failed to load feedback")).toBeInTheDocument();
      });
    });

    it("should render RETRY_LOAD button on error", async () => {
      mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("RETRY_LOAD")).toBeInTheDocument();
      });
    });

    it("should retry fetching when RETRY_LOAD is clicked", async () => {
      mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("RETRY_LOAD")).toBeInTheDocument();
      });

      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      fireEvent.click(screen.getByText("RETRY_LOAD"));

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledTimes(2);
        expect(
          screen.getByText("This is test feedback text")
        ).toBeInTheDocument();
      });
    });

    it("should show loading state during retry", async () => {
      mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("RETRY_LOAD")).toBeInTheDocument();
      });

      mockApiFetch.mockImplementationOnce(() => new Promise(() => {}));

      fireEvent.click(screen.getByText("RETRY_LOAD"));

      await waitFor(() => {
        expect(screen.getByText("LOADING_RECORD")).toBeInTheDocument();
      });
    });
  });

  describe("User Interactions", () => {
    it("should call onClose when CLOSE button is clicked", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("CLOSE")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("CLOSE"));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onDelete with feedbackId when DELETE button is clicked", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("DELETE")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("DELETE"));

      expect(mockOnDelete).toHaveBeenCalledWith("feedback-123");
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it("should not call onDelete when feedbackId is null", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      const { rerender } = render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("DELETE")).toBeInTheDocument();
      });

      rerender(<FeedbackDetailModal {...defaultProps} feedbackId={null} />);

      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe("Deleting State", () => {
    it("should disable DELETE button when isDeleting is true", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} isDeleting={true} />);

      await waitFor(() => {
        const deleteButton = screen.getByText("DELETING...");
        expect(deleteButton).toBeDisabled();
      });
    });

    it("should show DELETING... text when isDeleting is true", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} isDeleting={true} />);

      await waitFor(() => {
        expect(screen.getByText("DELETING...")).toBeInTheDocument();
      });
    });

    it("should show loading indicator when isDeleting is true", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      const { container } = render(
        <FeedbackDetailModal {...defaultProps} isDeleting={true} />
      );

      await waitFor(() => {
        const loadingIndicator = container.querySelector(
          ".animate-pulse.bg-red-400"
        );
        expect(loadingIndicator).toBeInTheDocument();
      });
    });

    it("should not call onDelete when clicking disabled DELETE button", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} isDeleting={true} />);

      await waitFor(() => {
        const deleteButton = screen.getByText("DELETING...");
        fireEvent.click(deleteButton);
      });

      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe("Next Action Editing", () => {
    it("should start editing when edit button is clicked", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("edit-button"));

      await waitFor(() => {
        expect(screen.getByTestId("next-action-input")).toBeInTheDocument();
      });

      expect(screen.getByTestId("next-action-input")).toBeInTheDocument();
      expect(screen.getByTestId("next-action-input")).toHaveValue(
        "Review and prioritize for next sprint"
      );
    });

    it("should cancel editing when cancel button is clicked", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("edit-button"));
      });

      fireEvent.click(screen.getByTestId("cancel-edit-button"));

      expect(screen.queryByTestId("next-action-input")).not.toBeInTheDocument();
      expect(screen.getByTestId("edit-button")).toBeInTheDocument();
    });

    it("should update input value when typing", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("edit-button"));
      });

      const input = screen.getByTestId("next-action-input");
      fireEvent.change(input, { target: { value: "New action text" } });

      expect(input).toHaveValue("New action text");
    });

    it("should call onUpdateNextAction with trimmed value when save is clicked", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("edit-button"));
      });

      const input = screen.getByTestId("next-action-input");
      fireEvent.change(input, { target: { value: "  New action text  " } });
      fireEvent.click(screen.getByTestId("save-button"));

      expect(mockOnUpdateNextAction).toHaveBeenCalledWith(
        "feedback-123",
        "New action text"
      );
    });

    it("should exit edit mode after successful update", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      const { rerender } = render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("edit-button"));
      });

      expect(screen.getByTestId("next-action-input")).toBeInTheDocument();

      rerender(<FeedbackDetailModal {...defaultProps} isUpdating={true} />);
      rerender(<FeedbackDetailModal {...defaultProps} isUpdating={false} />);

      await waitFor(() => {
        expect(
          screen.queryByTestId("next-action-input")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Next Action Validation", () => {
    it("should show error for empty next action", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("edit-button"));
      });

      const input = screen.getByTestId("next-action-input");
      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.click(screen.getByTestId("save-button"));

      expect(screen.getByTestId("validation-error")).toHaveTextContent(
        "Next action cannot be empty"
      );
      expect(mockOnUpdateNextAction).not.toHaveBeenCalled();
    });

    it("should show error for next action shorter than 10 characters", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("edit-button"));
      });

      const input = screen.getByTestId("next-action-input");
      fireEvent.change(input, { target: { value: "Short" } });
      fireEvent.click(screen.getByTestId("save-button"));

      expect(screen.getByTestId("validation-error")).toHaveTextContent(
        "Next action must be at least 10 characters"
      );
      expect(mockOnUpdateNextAction).not.toHaveBeenCalled();
    });

    it("should show error for next action longer than 500 characters", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("edit-button"));
      });

      const input = screen.getByTestId("next-action-input");
      const longText = "a".repeat(501);
      fireEvent.change(input, { target: { value: longText } });
      fireEvent.click(screen.getByTestId("save-button"));

      expect(screen.getByTestId("validation-error")).toHaveTextContent(
        "Next action must not exceed 500 characters"
      );
      expect(mockOnUpdateNextAction).not.toHaveBeenCalled();
    });

    it("should clear validation error when user starts typing again", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("edit-button"));
      });

      const input = screen.getByTestId("next-action-input");
      fireEvent.change(input, { target: { value: "Short" } });
      fireEvent.click(screen.getByTestId("save-button"));

      expect(screen.getByTestId("validation-error")).toBeInTheDocument();

      fireEvent.change(input, {
        target: { value: "This is a valid next action" },
      });

      expect(screen.queryByTestId("validation-error")).not.toBeInTheDocument();
    });

    it("should accept next action with exactly 10 characters", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("edit-button"));
      });

      const input = screen.getByTestId("next-action-input");
      fireEvent.change(input, { target: { value: "1234567890" } });
      fireEvent.click(screen.getByTestId("save-button"));

      expect(screen.queryByTestId("validation-error")).not.toBeInTheDocument();
      expect(mockOnUpdateNextAction).toHaveBeenCalledWith(
        "feedback-123",
        "1234567890"
      );
    });

    it("should accept next action with exactly 500 characters", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("edit-button"));
      });

      const input = screen.getByTestId("next-action-input");
      const exactText = "a".repeat(500);
      fireEvent.change(input, { target: { value: exactText } });
      fireEvent.click(screen.getByTestId("save-button"));

      expect(screen.queryByTestId("validation-error")).not.toBeInTheDocument();
      expect(mockOnUpdateNextAction).toHaveBeenCalledWith(
        "feedback-123",
        exactText
      );
    });
  });

  describe("Loading State Animation", () => {
    it("should render loading indicator animation elements", () => {
      mockApiFetch.mockImplementationOnce(() => new Promise(() => {}));

      const { container } = render(<FeedbackDetailModal {...defaultProps} />);

      const animatedElements = container.querySelectorAll(".animate-pulse");
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it("should render three loading dots with different delays", () => {
      mockApiFetch.mockImplementationOnce(() => new Promise(() => {}));

      const { container } = render(<FeedbackDetailModal {...defaultProps} />);

      const dots = container.querySelectorAll(".h-2.w-2.animate-pulse");
      expect(dots).toHaveLength(3);
    });
  });

  describe("Error State Corner Decorations", () => {
    it("should render all four corner decorations in error state", async () => {
      mockApiFetch.mockRejectedValueOnce(new Error("Network error"));

      const { container } = render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
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
  });

  describe("Feedback Text Corner Decorations", () => {
    it("should render corner decorations around feedback text", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      const { container } = render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        const corners = container.querySelectorAll(
          ".relative .absolute.h-4.w-4.border-\\[\\#30D6D6\\]"
        );
        expect(corners.length).toBeGreaterThanOrEqual(4);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long feedback text", async () => {
      const longFeedback = {
        ...mockFeedback,
        text: "This is a very long feedback text. ".repeat(100),
      };

      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: longFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(/This is a very long feedback text/)
        ).toBeInTheDocument();
      });
    });

    it("should handle special characters in feedback text", async () => {
      const specialFeedback = {
        ...mockFeedback,
        text: "Special chars: <div> & 'quotes' \"double\" [brackets]",
      };

      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: specialFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Special chars: <div> & 'quotes' \"double\" [brackets]"
          )
        ).toBeInTheDocument();
      });
    });

    it("should handle rapid feedbackId changes", async () => {
      mockApiFetch.mockResolvedValue({
        success: true,
        data: mockFeedback,
      });

      const { rerender } = render(
        <FeedbackDetailModal {...defaultProps} feedbackId="id-1" />
      );

      rerender(<FeedbackDetailModal {...defaultProps} feedbackId="id-2" />);
      rerender(<FeedbackDetailModal {...defaultProps} feedbackId="id-3" />);

      await waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledTimes(3);
      });
    });

    it("should handle switching from null to valid feedbackId", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      const { rerender } = render(
        <FeedbackDetailModal {...defaultProps} feedbackId={null} />
      );

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();

      rerender(
        <FeedbackDetailModal {...defaultProps} feedbackId="feedback-123" />
      );

      await waitFor(() => {
        expect(screen.getByTestId("modal")).toBeInTheDocument();
      });
    });

    it("should not start editing when next action is missing", async () => {
      const feedbackWithoutNextAction = {
        ...mockFeedback,
        analysis: {
          ...mockFeedback.analysis,
          nextAction: undefined,
        },
      };

      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: feedbackWithoutNextAction as any,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        const editButton = screen.queryByTestId("edit-button");
        if (editButton) {
          fireEvent.click(editButton);
          expect(
            screen.queryByTestId("next-action-input")
          ).not.toBeInTheDocument();
        }
      });
    });
  });

  describe("Component Cleanup", () => {
    it("should reset state when feedbackId becomes null", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      const { rerender } = render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("This is test feedback text")
        ).toBeInTheDocument();
      });

      rerender(<FeedbackDetailModal {...defaultProps} feedbackId={null} />);

      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("should clear editing state when canceling", async () => {
      mockApiFetch.mockResolvedValueOnce({
        success: true,
        data: mockFeedback,
      });

      render(<FeedbackDetailModal {...defaultProps} />);

      await waitFor(() => {
        fireEvent.click(screen.getByTestId("edit-button"));
      });

      const input = screen.getByTestId("next-action-input");
      fireEvent.change(input, { target: { value: "Modified text" } });

      fireEvent.click(screen.getByTestId("cancel-edit-button"));

      fireEvent.click(screen.getByTestId("edit-button"));

      await waitFor(() => {
        expect(screen.getByTestId("next-action-input")).toBeInTheDocument();
      });

      expect(screen.getByTestId("next-action-input")).toHaveValue(
        "Review and prioritize for next sprint"
      );
    });
  });
});
