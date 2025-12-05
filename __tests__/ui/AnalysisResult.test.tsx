/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AnalysisResult from "@/lib/components/AnalysisResult";

function createValidAnalysis(overrides = {}) {
  return {
    summary: "User feedback about the product",
    sentiment: "neutral",
    priority: "P2",
    tags: ["feedback", "product"],
    nextAction: "Review and respond to user",
    ...overrides,
  };
}

describe("AnalysisResult", () => {
  describe("rendering", () => {
    it("should render all analysis data correctly", () => {
      const analysis = createValidAnalysis({
        summary: "Customer wants refund",
        sentiment: "negative",
        priority: "P1",
        tags: ["refund", "complaint"],
        nextAction: "Process refund immediately",
      });

      render(<AnalysisResult analysis={analysis} />);

      expect(screen.getByText("Customer wants refund")).toBeInTheDocument();
      expect(screen.getByText("negative")).toBeInTheDocument();
      expect(screen.getByText("P1")).toBeInTheDocument();
      expect(screen.getByText(/REFUND/)).toBeInTheDocument();
      expect(screen.getByText(/COMPLAINT/)).toBeInTheDocument();
      expect(
        screen.getByText("Process refund immediately")
      ).toBeInTheDocument();
    });

    it("should render corner decorations", () => {
      const analysis = createValidAnalysis();
      const { container } = render(<AnalysisResult analysis={analysis} />);

      const corners = container.querySelectorAll(".absolute");
      expect(corners.length).toBeGreaterThanOrEqual(4);
    });

    it("should render section headers", () => {
      const analysis = createValidAnalysis();
      render(<AnalysisResult analysis={analysis} />);

      expect(screen.getByText("[ANALYSIS_COMPLETE]")).toBeInTheDocument();
      expect(screen.getByText("SUMMARY:")).toBeInTheDocument();
      expect(screen.getByText("SENTIMENT_ANALYSIS:")).toBeInTheDocument();
      expect(screen.getByText("PRIORITY_LEVEL:")).toBeInTheDocument();
      expect(screen.getByText("TAGS_DETECTED:")).toBeInTheDocument();
      expect(screen.getByText("RECOMMENDED_ACTION:")).toBeInTheDocument();
    });
  });

  describe("sentiment display", () => {
    it("should display positive sentiment with cyan color", () => {
      const analysis = createValidAnalysis({ sentiment: "positive" });
      render(<AnalysisResult analysis={analysis} />);

      const sentiment = screen.getByText("positive");
      expect(sentiment).toHaveClass("text-[#30D6D6]");
    });

    it("should display negative sentiment with red color", () => {
      const analysis = createValidAnalysis({ sentiment: "negative" });
      render(<AnalysisResult analysis={analysis} />);

      const sentiment = screen.getByText("negative");
      expect(sentiment).toHaveClass("text-red-400");
    });

    it("should display neutral sentiment with blue color", () => {
      const analysis = createValidAnalysis({ sentiment: "neutral" });
      render(<AnalysisResult analysis={analysis} />);

      const sentiment = screen.getByText("neutral");
      expect(sentiment).toHaveClass("text-[#006694]");
    });

    it("should capitalize sentiment text", () => {
      const analysis = createValidAnalysis({ sentiment: "positive" });
      render(<AnalysisResult analysis={analysis} />);

      const sentiment = screen.getByText("positive");
      expect(sentiment).toHaveClass("capitalize");
    });
  });

  describe("priority display", () => {
    it("should display P0 with purple color", () => {
      const analysis = createValidAnalysis({ priority: "P0" });
      render(<AnalysisResult analysis={analysis} />);

      const priority = screen.getByText("P0");
      expect(priority).toHaveStyle({ color: "#BB489A" });
    });

    it("should display P1 with violet color", () => {
      const analysis = createValidAnalysis({ priority: "P1" });
      render(<AnalysisResult analysis={analysis} />);

      const priority = screen.getByText("P1");
      expect(priority).toHaveStyle({ color: "#a44aff" });
    });

    it("should display P2 with green color", () => {
      const analysis = createValidAnalysis({ priority: "P2" });
      render(<AnalysisResult analysis={analysis} />);

      const priority = screen.getByText("P2");
      expect(priority).toHaveStyle({ color: "#6CBE4D" });
    });

    it("should display P3 with cyan color", () => {
      const analysis = createValidAnalysis({ priority: "P3" });
      render(<AnalysisResult analysis={analysis} />);

      const priority = screen.getByText("P3");
      expect(priority).toHaveStyle({ color: "#30D6D6" });
    });
  });

  describe("tags display", () => {
    it("should render all tags in uppercase", () => {
      const analysis = createValidAnalysis({
        tags: ["urgent", "billing", "customer"],
      });
      render(<AnalysisResult analysis={analysis} />);

      expect(screen.getByText(/URGENT/)).toBeInTheDocument();
      expect(screen.getByText(/BILLING/)).toBeInTheDocument();
      expect(screen.getByText(/CUSTOMER/)).toBeInTheDocument();
    });

    it("should handle single tag", () => {
      const analysis = createValidAnalysis({ tags: ["important"] });
      render(<AnalysisResult analysis={analysis} />);

      expect(screen.getByText(/IMPORTANT/)).toBeInTheDocument();
    });

    it("should handle empty tags array", () => {
      const analysis = createValidAnalysis({ tags: [] });
      const { container } = render(<AnalysisResult analysis={analysis} />);

      const tagsContainer = container.querySelector(".flex.flex-wrap.gap-2");
      expect(tagsContainer?.children.length).toBe(0);
    });

    it("should prefix each tag with >", () => {
      const analysis = createValidAnalysis({ tags: ["test"] });
      render(<AnalysisResult analysis={analysis} />);

      expect(screen.getByText(/> TEST/)).toBeInTheDocument();
    });
  });

  describe("edit mode - display", () => {
    it("should show EDIT button when not editing and onEditStart provided", () => {
      const analysis = createValidAnalysis();
      const onEditStart = jest.fn();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={false}
          onEditStart={onEditStart}
        />
      );

      expect(screen.getByText("EDIT")).toBeInTheDocument();
    });

    it("should not show EDIT button when onEditStart not provided", () => {
      const analysis = createValidAnalysis();

      render(<AnalysisResult analysis={analysis} />);

      expect(screen.queryByText("EDIT")).not.toBeInTheDocument();
    });

    it("should hide EDIT button when editing", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          onEditStart={jest.fn()}
        />
      );

      expect(screen.queryByText("EDIT")).not.toBeInTheDocument();
    });

    it("should show textarea when editing", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="New action"
        />
      );

      const textarea = screen.getByPlaceholderText(
        "Enter recommended action..."
      );
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue("New action");
    });

    it("should show CANCEL and SAVE buttons when editing", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="Some text here"
        />
      );

      expect(screen.getByText("CANCEL")).toBeInTheDocument();
      expect(screen.getByText("SAVE")).toBeInTheDocument();
    });
  });

  describe("edit mode - interactions", () => {
    it("should call onEditStart when EDIT button clicked", () => {
      const analysis = createValidAnalysis();
      const onEditStart = jest.fn();

      render(<AnalysisResult analysis={analysis} onEditStart={onEditStart} />);

      fireEvent.click(screen.getByText("EDIT"));
      expect(onEditStart).toHaveBeenCalledTimes(1);
    });

    it("should call onNextActionChange when textarea value changes", () => {
      const analysis = createValidAnalysis();
      const onNextActionChange = jest.fn();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction=""
          onNextActionChange={onNextActionChange}
        />
      );

      const textarea = screen.getByPlaceholderText(
        "Enter recommended action..."
      );
      fireEvent.change(textarea, { target: { value: "New action text" } });

      expect(onNextActionChange).toHaveBeenCalledWith("New action text");
    });

    it("should call onEditCancel when CANCEL button clicked", () => {
      const analysis = createValidAnalysis();
      const onEditCancel = jest.fn();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="Some text"
          onEditCancel={onEditCancel}
        />
      );

      fireEvent.click(screen.getByText("CANCEL"));
      expect(onEditCancel).toHaveBeenCalledTimes(1);
    });

    it("should call onEditSave with edited text when SAVE button clicked", () => {
      const analysis = createValidAnalysis();
      const onEditSave = jest.fn();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="Updated action text"
          onEditSave={onEditSave}
        />
      );

      fireEvent.click(screen.getByText("SAVE"));
      expect(onEditSave).toHaveBeenCalledWith("Updated action text");
    });
  });

  describe("edit mode - validation", () => {
    it("should disable SAVE button when text is too short", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="short"
        />
      );

      const saveButton = screen.getByText("SAVE");
      expect(saveButton).toBeDisabled();
    });

    it("should enable SAVE button when text is valid length", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="This is a valid length text"
        />
      );

      const saveButton = screen.getByText("SAVE");
      expect(saveButton).not.toBeDisabled();
    });

    it("should disable SAVE button when text is too long", () => {
      const analysis = createValidAnalysis();
      const longText = "A".repeat(501);

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction={longText}
        />
      );

      const saveButton = screen.getByText("SAVE");
      expect(saveButton).toBeDisabled();
    });

    it("should show character count", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="Test text"
        />
      );

      expect(screen.getByText("9/500")).toBeInTheDocument();
    });

    it("should display validation error when provided", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="Some text"
          nextActionError="Error: Invalid format"
        />
      );

      expect(screen.getByText("Error: Invalid format")).toBeInTheDocument();
    });

    it("should not display error when null", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="Some text"
          nextActionError={null}
        />
      );

      const errorElements = screen
        .queryAllByText(/Error/)
        .filter((el) => el.classList.contains("text-red-400"));
      expect(errorElements.length).toBe(0);
    });
  });

  describe("edit mode - updating state", () => {
    it("should disable textarea when updating", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="Text"
          isUpdating={true}
        />
      );

      const textarea = screen.getByPlaceholderText(
        "Enter recommended action..."
      );
      expect(textarea).toBeDisabled();
    });

    it("should disable CANCEL button when updating", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="Valid text here"
          isUpdating={true}
        />
      );

      expect(screen.getByText("CANCEL")).toBeDisabled();
    });

    it("should disable SAVE button when updating", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="Valid text here"
          isUpdating={true}
        />
      );

      expect(screen.getByText("SAVING...")).toBeDisabled();
    });

    it("should show SAVING... text when updating", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="Valid text here"
          isUpdating={true}
        />
      );

      expect(screen.getByText("SAVING...")).toBeInTheDocument();
      expect(screen.queryByText("SAVE")).not.toBeInTheDocument();
    });

    it("should show loading indicator when updating", () => {
      const analysis = createValidAnalysis();

      const { container } = render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="Valid text here"
          isUpdating={true}
        />
      );

      const loadingIndicator = container.querySelector(".animate-pulse");
      expect(loadingIndicator).toBeInTheDocument();
    });

    it("should not show loading indicator when not updating", () => {
      const analysis = createValidAnalysis();

      const { container } = render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="Valid text here"
          isUpdating={false}
        />
      );

      const loadingIndicator = container.querySelector(".animate-pulse");
      expect(loadingIndicator).not.toBeInTheDocument();
    });
  });

  describe("default props", () => {
    it("should use default value for isEditingNextAction", () => {
      const analysis = createValidAnalysis();

      render(<AnalysisResult analysis={analysis} />);

      expect(screen.getByText(analysis.nextAction)).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("Enter recommended action...")
      ).not.toBeInTheDocument();
    });

    it("should use default value for isUpdating", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="Valid text here"
        />
      );

      expect(screen.getByText("SAVE")).toBeInTheDocument();
      expect(screen.queryByText("SAVING...")).not.toBeInTheDocument();
    });

    it("should use default empty string for editedNextAction", () => {
      const analysis = createValidAnalysis();

      render(<AnalysisResult analysis={analysis} isEditingNextAction={true} />);

      const textarea = screen.getByPlaceholderText(
        "Enter recommended action..."
      );
      expect(textarea).toHaveValue("");
    });
  });

  describe("edge cases", () => {
    it("should handle very long summary text", () => {
      const longSummary = "A".repeat(1000);
      const analysis = createValidAnalysis({ summary: longSummary });

      render(<AnalysisResult analysis={analysis} />);

      expect(screen.getByText(longSummary)).toBeInTheDocument();
    });

    it("should handle special characters in text", () => {
      const analysis = createValidAnalysis({
        summary: "Text with \"quotes\" and 'apostrophes'",
        nextAction: "Action with <brackets> and &ampersand",
      });

      render(<AnalysisResult analysis={analysis} />);

      expect(
        screen.getByText("Text with \"quotes\" and 'apostrophes'")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Action with <brackets> and &ampersand")
      ).toBeInTheDocument();
    });

    it("should handle many tags", () => {
      const manyTags = Array.from({ length: 20 }, (_, i) => `tag${i}`);
      const analysis = createValidAnalysis({ tags: manyTags });

      render(<AnalysisResult analysis={analysis} />);

      manyTags.forEach((tag) => {
        expect(
          screen.getByText(new RegExp(`> ${tag.toUpperCase()}$`))
        ).toBeInTheDocument();
      });
    });

    it("should handle whitespace in nextAction when editing", () => {
      const analysis = createValidAnalysis();

      render(
        <AnalysisResult
          analysis={analysis}
          isEditingNextAction={true}
          editedNextAction="   spaces   "
        />
      );

      const saveButton = screen.getByText("SAVE");
      expect(saveButton).toBeDisabled();
    });
  });
});
