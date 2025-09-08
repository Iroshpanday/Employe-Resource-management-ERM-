import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AttendanceActions from "@/app/attendance/AttendanceActions";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "notistack";

// Mock the hooks

jest.mock("../src/context/AuthContext");
jest.mock("notistack");

// Mock fetch
global.fetch = jest.fn();

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseSnackbar = useSnackbar as jest.MockedFunction<typeof useSnackbar>;
const mockEnqueueSnackbar = jest.fn();

// Reusable mock user
const mockUser = {
  id: 1,
  email: "test@example.com", // ✅ Added required email
  role: "EMPLOYEE",
  token: "test-token",
};

describe("AttendanceActions", () => {
  const mockOnAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSnackbar.mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar,
      closeSnackbar: jest.fn(), // ✅ Added required closeSnackbar
    });
  });

  it("renders check-in and check-out buttons for employee", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<AttendanceActions onAction={mockOnAction} />);

    expect(screen.getByText("Check In")).toBeInTheDocument();
    expect(screen.getByText("Check Out")).toBeInTheDocument();
  });

  it("calls check-in API successfully", async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          checkIn: new Date().toISOString(),
        }),
    });

    render(<AttendanceActions onAction={mockOnAction} />);

    const checkInBtn = screen.getByText("Check In");
    await userEvent.click(checkInBtn);

    expect(global.fetch).toHaveBeenCalledWith("/api/attendance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer test-token",
  },
  // No body should be sent
});
  });

  it("calls check-out API successfully", async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          checkOut: new Date().toISOString(),
        }),
    });

    render(<AttendanceActions onAction={mockOnAction} />);

    const checkOutBtn = screen.getByText("Check Out");
    await userEvent.click(checkOutBtn);

    expect(global.fetch).toHaveBeenCalledWith("/api/attendance/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer test-token",
  },
  // No body should be sent
});
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith("Checked out successfully", {
      variant: "success",
    });
    expect(mockOnAction).toHaveBeenCalled();
  });

  it("shows error when check-in fails", async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          error: "Already checked in",
        }),
    });

    render(<AttendanceActions onAction={mockOnAction} />);

    const checkInBtn = screen.getByText("Check In");
    await userEvent.click(checkInBtn);

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith("Already checked in", {
      variant: "error",
    });
  });

  it("disables buttons during loading", async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      
    });

    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({}),
      }), 100))
    );

    render(<AttendanceActions onAction={mockOnAction} />);

    const checkInBtn = screen.getByText("Check In");
    await userEvent.click(checkInBtn);

    expect(checkInBtn).toBeDisabled();
    expect(screen.getByText("Checking In...")).toBeInTheDocument();
  });
});
