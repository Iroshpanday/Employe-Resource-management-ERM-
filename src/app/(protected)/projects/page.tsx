"use client";

import { useEffect, useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import { useAuth } from "@/context/AuthContext";
import { EmpDataTable } from "./Empdata-table";
import { columns, Project } from "./columns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        credentials: "include", // 👈 Send cookies automatically
      });

      if (!res.ok) throw new Error("Failed to fetch projects");

      const data: Project[] = await res.json();
      setProjects(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (user) fetchProjects();
  }, [fetchProjects, user]);

  // Unified handler for delete (could be extended for edit later)
  const handleDelete = async (project: Project) => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete project");

      enqueueSnackbar("Project deleted successfully", { variant: "success" });
      fetchProjects();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  const handleEdit = (project: Project) => {
    // Future implementation placeholder
    enqueueSnackbar(`Edit feature coming soon for ${project.title}`, { variant: "info" });
  };

  const handleViewDetails = (project: Project) => {
    enqueueSnackbar(`Viewing details for ${project.title}`, { variant: "info" });
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="p-4">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="p-4 w-full mx-auto">
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Projects</h1>
          {user && (
            <div className="text-sm text-gray-600">
              Logged in as: <span className="font-semibold">{user.role}</span>
            </div>
          )}
        </div>

        <ScrollArea className="h-full w-[1150px] rounded-md border">
          <div className="min-w-full">
            <EmpDataTable
              columns={columns}
              data={projects}
              meta={{
                currentUser: user || undefined,
                onEdit: user?.role === "ADMIN" ? handleEdit : undefined,
                onDelete: user?.role === "ADMIN" ? handleDelete : undefined,
                onViewDetails: handleViewDetails,
              }}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
