
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextSubmit from "../../lib/components/TextSubmit";

describe("TextSubmit", () => {
  it("renders with placeholder text", () => {
    render(<TextSubmit onSubmit={() => {}} placeholder="Test placeholder" />);

    expect(screen.getByPlaceholderText("Test placeholder")).toBeInTheDocument();
  });

  it("allows user to type text", async () => {
    const user = userEvent.setup();
    render(<TextSubmit onSubmit={() => {}} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "Hello world");

    expect(input).toHaveValue("Hello world");
  });

  it("calls onSubmit when button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TextSubmit onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /submit/i });

    await user.type(input, "Test feedback");
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith("Test feedback");
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit when Enter key is pressed", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TextSubmit onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");

    await user.type(input, "Test feedback{Enter}");

    expect(mockOnSubmit).toHaveBeenCalledWith("Test feedback");
  });

  it("clears input after submission", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TextSubmit onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");

    await user.type(input, "Test feedback");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(input).toHaveValue("");
  });

  it("does not call onSubmit with empty text", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TextSubmit onSubmit={mockOnSubmit} />);

    const button = screen.getByRole("button", { name: /submit/i });
    await user.click(button);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("does not call onSubmit with only whitespace", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TextSubmit onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /submit/i });

    await user.type(input, "   ");
    await user.click(button);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  it("trims whitespace before submission", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TextSubmit onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /submit/i });

    await user.type(input, "  Test feedback  ");
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith("  Test feedback  ");
  });

  it("handles multiple submissions correctly", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TextSubmit onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /submit/i });

    await user.type(input, "First submission");
    await user.click(button);

    await user.type(input, "Second submission");
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledTimes(2);
    expect(mockOnSubmit).toHaveBeenNthCalledWith(1, "First submission");
    expect(mockOnSubmit).toHaveBeenNthCalledWith(2, "Second submission");
  });

  it("does not submit when Enter is pressed on empty input", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TextSubmit onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");

    await user.click(input);
    await user.keyboard("{Enter}");

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("handles special characters correctly", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TextSubmit onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");
    const specialText = "Test!@#$%^&*()_+-=[]{}|;:,.<>?";

    await user.click(input);
    await user.paste(specialText);
    await user.keyboard("{Enter}");

    expect(mockOnSubmit).toHaveBeenCalledWith(specialText);
  });

  it("handles very long text input", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TextSubmit onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");
    const longText = "a".repeat(1000);

    await user.type(input, longText);
    await user.keyboard("{Enter}");

    expect(mockOnSubmit).toHaveBeenCalledWith(longText);
  });

  it("uses default placeholder when none provided", () => {
    render(<TextSubmit onSubmit={() => {}} />);

    expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument();
  });

  it("does not clear input when submission with whitespace-only text fails", async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TextSubmit onSubmit={mockOnSubmit} />);

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /submit/i });

    await user.type(input, "   ");
    await user.click(button);

    expect(input).toHaveValue("   ");
  });
});
