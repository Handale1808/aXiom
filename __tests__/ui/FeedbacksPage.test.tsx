
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Feedbacks from "../../app/feedbacks/page";

global.fetch = jest.fn();

describe("Feedbacks Page", () => {
  const mockFeedbacks = [
    {
      _id: "1",
      text: "Great product!",
      analysis: { sentiment: "positive", priority: "P2" },
    },
    {
      _id: "2",
      text: "Needs work",
      analysis: { sentiment: "negative", priority: "P1" },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders page title and description", () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: [] }),
    });

    render(<Feedbacks />);

    expect(screen.getByText("All Feedback")).toBeInTheDocument();
    expect(
      screen.getByText("View and manage all submitted feedback")
    ).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<Feedbacks />);

    expect(screen.getByText("Loading feedbacks...")).toBeInTheDocument();
  });

  it("fetches and displays feedbacks on mount", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockFeedbacks }),
    });

    render(<Feedbacks />);

    await waitFor(() => {
      expect(screen.getByText("Great product!")).toBeInTheDocument();
      expect(screen.getByText("Needs work")).toBeInTheDocument();
    });
  });

  it("displays error message when fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<Feedbacks />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("displays empty state when no feedbacks exist", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: [] }),
    });

    render(<Feedbacks />);

    await waitFor(() => {
      expect(
        screen.getByText(/No feedback submissions yet/)
      ).toBeInTheDocument();
    });
  });

  it("refresh button refetches feedbacks", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: [] }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true, data: mockFeedbacks }),
      });

    const user = userEvent.setup();
    render(<Feedbacks />);

    await waitFor(() => {
      expect(
        screen.getByText(/No feedback submissions yet/)
      ).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    await user.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText("Great product!")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("disables refresh button while loading", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ json: async () => ({ success: true, data: [] }) }),
            100
          )
        )
    );

    render(<Feedbacks />);

    const refreshButton = screen.getByRole("button", { name: /refreshing/i });
    expect(refreshButton).toBeDisabled();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /refresh/i })
      ).not.toBeDisabled();
    });
  });

  it("shows refreshing text on button when loading", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ json: async () => ({ success: true, data: [] }) }),
            100
          )
        )
    );

    render(<Feedbacks />);

    expect(screen.getByText("Refreshing...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Refresh")).toBeInTheDocument();
    });
  });

  it("calls fetch with correct endpoint", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: [] }),
    });

    render(<Feedbacks />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/feedback");
    });
  });

  it("handles API response with success: false", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: false, data: [] }),
    });

    render(<Feedbacks />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch feedbacks")).toBeInTheDocument();
    });
  });

  it("does not show loading state after initial load", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockFeedbacks }),
    });

    render(<Feedbacks />);

    await waitFor(() => {
      expect(screen.getByText("Great product!")).toBeInTheDocument();
    });

    expect(screen.queryByText("Loading feedbacks...")).not.toBeInTheDocument();
  });
});
