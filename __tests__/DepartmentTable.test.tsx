// __tests__/DepartmentTable.test.tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DataTable } from "@/components/data-table"
import {columns} from "@/app/department/columns"


interface Department {
  id: number;
  name: string;
  location: string;
}

describe("DepartmentTable", () => {
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()

  const departments: Department[] = [
    { id: 1, name: "HR", location: "Building A" },
    { id: 2, name: "Finance", location: "Building B" },
    { id: 3, name: "IT", location: "Building C" },
  ]

  const setup = (data = departments) =>
    render(
      <DataTable
        columns={columns}
        data={data}
        meta={{ onEdit: mockOnEdit, onDelete: mockOnDelete }}
      />
    )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders department rows", () => {
    setup()
    expect(screen.getByText("HR")).toBeInTheDocument()
    expect(screen.getByText("Finance")).toBeInTheDocument()
    expect(screen.getByText("IT")).toBeInTheDocument()
  })

  it("filters departments using search", async () => {
    setup()
    const searchBox = screen.getByPlaceholderText(/search/i)

    await userEvent.type(searchBox, "HR")
    expect(screen.getByText("HR")).toBeInTheDocument()
    expect(screen.queryByText("Finance")).not.toBeInTheDocument()
    expect(screen.queryByText("IT")).not.toBeInTheDocument()
  })

  it("calls onEdit when Edit is clicked", async () => {
    setup()
    const actionsBtns = screen.getAllByLabelText("Open actions menu")
    await userEvent.click(actionsBtns[0]) // open first row menu
    await userEvent.click(screen.getByText("Edit"))
    expect(mockOnEdit).toHaveBeenCalledWith(departments[0])
  })

  it("calls onDelete when Delete is confirmed", async () => {
    setup()
    const actionsBtns = screen.getAllByLabelText("Open actions menu")
    await userEvent.click(actionsBtns[0]) // open first row menu

    // Open confirm dialog
    await userEvent.click(screen.getByText("Delete"))

    // Confirm deletion
    const confirmBtn = await screen.findByRole("button", { name: /confirm/i })
    await userEvent.click(confirmBtn)

    expect(mockOnDelete).toHaveBeenCalledWith(departments[0])
  })

  it("navigates pages with pagination", async () => {
    // Add more rows so pagination triggers
    const bigData = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `Dept ${i + 1}`,
      location: `Building ${i + 1}`,
    }))

    setup(bigData)

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()

    const nextBtn = screen.getByRole("button", { name: /next/i })
    await userEvent.click(nextBtn)

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument()
  })
})
