import { render, screen } from "@testing-library/react";
import FeedbackList from "../../lib/components/FeedbackList";

describe("FeedbackList", () => {
  const mockFeedbacks = [
    {
      _id: "1",
      text: "Great product!",
      analysis: {
        sentiment: "positive",
        priority: "P2",
      },
    },
    {
      _id: "2",
      text: "Needs improvement",
      analysis: {
        sentiment: "negative",
        priority: "P1",
      },
    },
    {
      _id: "3",
      text: "It's okay",
      analysis: {
        sentiment: "neutral",
        priority: "P3",
      },
    },
  ];

  it("renders feedback items correctly", () => {
    render(<FeedbackList feedbacks={mockFeedbacks} />);

    expect(screen.getByText("Great product!")).toBeInTheDocument();
    expect(screen.getByText("Needs improvement")).toBeInTheDocument();
    expect(screen.getByText("It's okay")).toBeInTheDocument();
  });

  it("displays sentiment for each feedback", () => {
    render(<FeedbackList feedbacks={mockFeedbacks} />);

    expect(screen.getByText("positive")).toBeInTheDocument();
    expect(screen.getByText("negative")).toBeInTheDocument();
    expect(screen.getByText("neutral")).toBeInTheDocument();
  });

  it("displays priority for each feedback", () => {
    render(<FeedbackList feedbacks={mockFeedbacks} />);

    expect(screen.getByText("P1")).toBeInTheDocument();
    expect(screen.getByText("P2")).toBeInTheDocument();
    expect(screen.getByText("P3")).toBeInTheDocument();
  });

  it("renders correct number of feedback items", () => {
    const { container } = render(<FeedbackList feedbacks={mockFeedbacks} />);

    const feedbackItems = container.querySelectorAll(".space-y-4 > div");
    expect(feedbackItems).toHaveLength(3);
  });

  it("returns null when feedbacks array is empty", () => {
    const { container } = render(<FeedbackList feedbacks={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders heading when feedbacks exist", () => {
    render(<FeedbackList feedbacks={mockFeedbacks} />);

    expect(screen.getByText("All Feedback")).toBeInTheDocument();
  });

  it("applies correct CSS classes for styling", () => {
    render(<FeedbackList feedbacks={mockFeedbacks} />);

    const feedbackText = screen.getByText("Great product!");
    expect(feedbackText).toHaveClass("text-zinc-900", "dark:text-white");
  });

  it("uses unique keys for each feedback item", () => {
    const { container } = render(<FeedbackList feedbacks={mockFeedbacks} />);

    const feedbackItems = container.querySelectorAll(".space-y-4 > div");

    feedbackItems.forEach((item, index) => {
      expect(item).toBeInTheDocument();
    });
  });

  it("handles single feedback item", () => {
    const singleFeedback = [mockFeedbacks[0]];
    render(<FeedbackList feedbacks={singleFeedback} />);

    expect(screen.getByText("Great product!")).toBeInTheDocument();
    expect(screen.getByText("positive")).toBeInTheDocument();
    expect(screen.getByText("P2")).toBeInTheDocument();
  });

  it("handles feedback with long text", () => {
    const longTextFeedback = [
      {
        _id: "long",
        text: "This is a very long feedback text that goes on and on and on and includes many details about the product experience and suggestions for improvement",
        analysis: {
          sentiment: "neutral",
          priority: "P2",
        },
      },
    ];

    render(<FeedbackList feedbacks={longTextFeedback} />);

    expect(
      screen.getByText(/This is a very long feedback text/)
    ).toBeInTheDocument();
  });
});
