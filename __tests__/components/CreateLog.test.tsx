import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateLog from "../../app/_components/CreateLog";
import { AuthContext } from "../../app/context/AuthContext";

// Mock the database functions
jest.mock("../../app/_db/db", () => ({
  createLog: jest.fn().mockResolvedValue({ id: "test-log-id" }),
  getUserData: jest.fn().mockResolvedValue({ username: "testuser" }),
}));

describe("CreateLog Component", () => {
  const mockUser = {
    uid: "test-uid",
    email: "test@example.com",
    displayName: "Test User",
  };

  const renderComponent = () => {
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <CreateLog />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    renderComponent();
  });

  it("renders the create log form", () => {
    expect(screen.getByText("Create Practice Log")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Duration (minutes)")).toBeInTheDocument();
    expect(screen.getByLabelText("Tags (comma separated)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Log" })
    ).toBeInTheDocument();
  });

  it("allows users to input log details", () => {
    const descriptionInput = screen.getByLabelText("Description");
    const durationInput = screen.getByLabelText("Duration (minutes)");
    const tagsInput = screen.getByLabelText("Tags (comma separated)");

    fireEvent.change(descriptionInput, {
      target: { value: "Practiced scales" },
    });
    fireEvent.change(durationInput, { target: { value: "30" } });
    fireEvent.change(tagsInput, { target: { value: "guitar,scales" } });

    expect(descriptionInput).toHaveValue("Practiced scales");
    expect(durationInput).toHaveValue("30");
    expect(tagsInput).toHaveValue("guitar,scales");
  });

  it("shows success message when log is created successfully", async () => {
    const descriptionInput = screen.getByLabelText("Description");
    const durationInput = screen.getByLabelText("Duration (minutes)");
    const createButton = screen.getByRole("button", { name: "Create Log" });

    fireEvent.change(descriptionInput, {
      target: { value: "Practiced scales" },
    });
    fireEvent.change(durationInput, { target: { value: "30" } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Log created successfully!")).toBeInTheDocument();
    });
  });

  it("shows error message when log creation fails", async () => {
    // Mock the createLog function to reject
    jest.mock("../../app/_db/db", () => ({
      createLog: jest.fn().mockRejectedValue(new Error("Database error")),
      getUserData: jest.fn().mockResolvedValue({ username: "testuser" }),
    }));

    const descriptionInput = screen.getByLabelText("Description");
    const durationInput = screen.getByLabelText("Duration (minutes)");
    const createButton = screen.getByRole("button", { name: "Create Log" });

    fireEvent.change(descriptionInput, {
      target: { value: "Practiced scales" },
    });
    fireEvent.change(durationInput, { target: { value: "30" } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to create log. Please try again.")
      ).toBeInTheDocument();
    });
  });
});
