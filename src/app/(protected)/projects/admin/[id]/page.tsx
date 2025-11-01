"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useAuth } from "@/context/AuthContext";
import { Project } from "../../columns";
import AddTeamMemberModal from "../components/AddTeamMemberModal";
import CreateTaskModal from "../components/CreateTaskModal";
import { ConfirmDialog } from "./ConfirmDialog";
import Image from "next/image";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const projectId = params.id as string;

  const fetchProjectDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : user?.token;
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 404) {
          enqueueSnackbar("Project not found", { variant: "error" });
          router.push("/projects/admin");
          return;
        }
        throw new Error("Failed to fetch project details");
      }

      const data: Project = await res.json();
      setProject(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, router, user?.token, projectId]);

  useEffect(() => {
    if (user?.token && projectId) {
      fetchProjectDetails();
    }
  }, [fetchProjectDetails, projectId, user?.token]);

  // Handle Edit Project
  const handleEditProject = () => {
    if (project) {
      router.push(`/projects/admin/${project.id}/edit`);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async () => {
    try {
      const token = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : user?.token;
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete project");
      
      enqueueSnackbar("Project deleted successfully", { variant: "success" });
      router.push("/projects/admin");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  // Get existing member IDs for the modal
  const existingMemberIds = project?.projectEmployees.map(member => member.employee.id) || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-100 text-red-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "LOW": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800";
      case "DEACTIVE": return "bg-red-100 text-red-800";
      case "COMPLETED": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Project not found.</p>
          <button
            onClick={() => router.push("/projects/admin")}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // Calculate days remaining
  const daysRemaining = Math.ceil(
    (new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={() => router.push("/projects/admin")}
            className="flex items-center text-blue-500 hover:text-blue-700 mb-4"
          >
            ← Back to Projects
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-600 mt-2">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(project.priority)}`}>
            {project.priority}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Image */}
          {project.image && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <Image 
                src={project.image} 
                alt={project.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Project Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Project Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Client</label>
                <p className="text-gray-900">{project.clientName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Category</label>
                <p className="text-gray-900">{project.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Start Date</label>
                <p className="text-gray-900">{new Date(project.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Deadline</label>
                <p className="text-gray-900">{new Date(project.deadline).toLocaleDateString()}</p>
              </div>
              {project.endDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">End Date</label>
                  <p className="text-gray-900">{new Date(project.endDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Progress</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-semibold">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Open Tasks:</span>
                  <span className="font-semibold ml-2">{project.openTasks}</span>
                </div>
                <div>
                  <span className="text-gray-600">Team Members:</span>
                  <span className="font-semibold ml-2">{project.numberOfMembers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Members */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Team Members</h2>
            <div className="space-y-3">
              {project.projectEmployees.length > 0 ? (
                project.projectEmployees.map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {member.employee.firstName.charAt(0)}{member.employee.lastName.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {member.employee.firstName} {member.employee.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{member.employee.email}</p>
                      </div>
                    </div>
                    {member.role === "LEAD" && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Lead
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No team members assigned yet.</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={() => setShowAddMemberModal(true)}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Add Team Member
              </button>
              <button 
                onClick={() => setShowCreateTaskModal(true)}
                className="w-full bg-green-500 text-white py-2 px-4 rounded text-sm hover:bg-green-600 transition-colors"
              >
                Create Task
              </button>
              {user?.role === "ADMIN" && (
                <>
                  <button 
                    onClick={handleEditProject}
                    className="w-full bg-gray-500 text-white py-2 px-4 rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    Edit Project
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Delete Project
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Project Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Tasks:</span>
                <span className="font-semibold">{project.openTasks + (project.tasks?.length || 0 - project.openTasks)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Tasks:</span>
                <span className="font-semibold">{(project.tasks?.length || 0) - project.openTasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Team Size:</span>
                <span className="font-semibold">{project.numberOfMembers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days Remaining:</span>
                <span className="font-semibold">
                  {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTeamMemberModal
        projectId={Number(projectId)}
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onSuccess={fetchProjectDetails}
        existingMembers={existingMemberIds}
      />

      <CreateTaskModal
        projectId={Number(projectId)}
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onSuccess={fetchProjectDetails}
        teamMembers={project?.projectEmployees || []}
      />

      <ConfirmDialog
        title="Delete Project"
        description={`Are you sure you want to delete "${project?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteProject}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </div>
  );
}