import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@workspace/api-client-react", () => ({
  useAuthMe: vi.fn(),
}));

vi.mock("wouter", () => ({
  Redirect: ({ to }: { to: string }) => (
    <div data-testid="redirect" data-to={to} />
  ),
}));

import { useAuthMe } from "@workspace/api-client-react";
const mockUseAuthMe = vi.mocked(useAuthMe);

import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";

function AdminPage() {
  return <div data-testid="admin-panel">OPERATOR REGISTRY</div>;
}

describe("ProtectedAdminRoute — /admin access control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("unauthenticated visitor is redirected to /login", () => {
    mockUseAuthMe.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useAuthMe>);

    render(<ProtectedAdminRoute component={AdminPage} />);

    const redirect = screen.getByTestId("redirect");
    expect(redirect).toBeInTheDocument();
    expect(redirect).toHaveAttribute("data-to", "/login");
    expect(screen.queryByTestId("admin-panel")).not.toBeInTheDocument();
  });

  it("authenticated non-admin is silently redirected to /", () => {
    mockUseAuthMe.mockReturnValue({
      data: { id: "user-1", email: "user@test.com", isAdmin: false },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useAuthMe>);

    render(<ProtectedAdminRoute component={AdminPage} />);

    const redirect = screen.getByTestId("redirect");
    expect(redirect).toBeInTheDocument();
    expect(redirect).toHaveAttribute("data-to", "/");
    expect(screen.queryByTestId("admin-panel")).not.toBeInTheDocument();
  });

  it("authenticated admin can access /admin and sees the admin UI", () => {
    mockUseAuthMe.mockReturnValue({
      data: { id: "admin-1", email: "admin@test.com", isAdmin: true },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useAuthMe>);

    render(<ProtectedAdminRoute component={AdminPage} />);

    expect(screen.getByTestId("admin-panel")).toBeInTheDocument();
    expect(screen.queryByTestId("redirect")).not.toBeInTheDocument();
  });

  it("shows loading state while auth is resolving", () => {
    mockUseAuthMe.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useAuthMe>);

    render(<ProtectedAdminRoute component={AdminPage} />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-panel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("redirect")).not.toBeInTheDocument();
  });
});
