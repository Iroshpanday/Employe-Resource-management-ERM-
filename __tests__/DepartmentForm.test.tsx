import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DepartmentForm from "@/app/department/DepartmentForm";

// Mock notistack (snackbar)
jest.mock("notistack", () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}));

// Mock fetch (API calls)
global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
) as jest.Mock;

describe("DepartmentForm", () => {
  it("shows validation errors when fields are empty", async () => {
    render(<DepartmentForm onSuccess={jest.fn()} />);

    const submitBtn = screen.getByRole("button", { name: /add/i });
    await userEvent.click(submitBtn);

    expect(
      await screen.findByText("Department name must be at least 2 characters")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Department location must be at least 2 characters")
    ).toBeInTheDocument();
  });

  it("submits valid form and calls onSuccess", async () => {
    const mockOnSuccess = jest.fn();
    render(<DepartmentForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText(/department name/i);
    const locationInput = screen.getByLabelText(/department location/i);
    const submitBtn = screen.getByRole("button", { name: /add/i });

    await userEvent.type(nameInput, "Finance");
    await userEvent.type(locationInput, "Kathmandu");
    await userEvent.click(submitBtn);

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/department",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("renders edit mode correctly", async () => {
    const editData = { id: 1, name: "IT", location: "Pokhara" };
    const mockOnCancel = jest.fn();

    render(
      <DepartmentForm
        onSuccess={jest.fn()}
        editData={editData}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue("IT")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Pokhara")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update/i })).toBeInTheDocument();

    // Cancel button should work
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
