import { departmentSchema } from "@/app/department/DepartmentForm";
describe("departmentSchema", () => {
  it("accepts valid data", () => {
    const data = { name: "IT", location: "Kathmandu" };
    const result = departmentSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const data = { name: "I", location: "Kathmandu" };
    const result = departmentSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Department name must be at least 2 characters"
      );
    }
  });

  it("rejects empty location", () => {
    const data = { name: "Finance", location: "" };
    const result = departmentSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Department location must be at least 2 characters");
    }
  });
});
