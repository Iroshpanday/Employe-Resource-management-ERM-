"use client";

import { useEffect, useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ProjectForm from "../ProjectForm";
import { Project } from "../columns";
 import Image from "next/image";

export default function AdminProjectsPage() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const token = user?.token;
      if (!token) return;

      let url = "/api/projects";
      const params = new URLSearchParams();
      
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedStatus) params.append("status", selectedStatus);
      
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch projects");

      const data: Project[] = await res.json();
      setProjects(data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [user, selectedCategory, selectedStatus, enqueueSnackbar]);

  useEffect(() => {
    if (user?.token) {
      fetchProjects();
    }
  }, [fetchProjects, user?.token]);

  const handleEdit = (project: Project) => {

     

    
    setEditData(project);
    setShowForm(true);
  };

  const handleDelete = async (project: Project) => {
    try {
      const token = user?.token;
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete project");
      
      enqueueSnackbar("Project deleted successfully", { variant: "success" });
      fetchProjects();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  const handleViewDetails = (project: Project) => {
    // Navigate to project details page
    router.push(`/projects/admin/${project.id}`);
  };

  const handleSuccess = () => {
    fetchProjects();
    setShowForm(false);
    setEditData(null);
  };

  // Get unique categories and statuses for filters
  const categories = [...new Set(projects.map(project => project.category).filter(Boolean))];
  const statuses = [...new Set(projects.map(project => project.status))];


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
      <p>Loading user data...</p>
    </div>
  );
}

  if ( !loading && user?.role !== "ADMIN" && user?.role !== "HR") {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Access denied. Only administrators and HR can access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="p-4">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Projects</h1>
        
        {/* Add Project Button (Admin only) */}
        {user?.role === "ADMIN" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            {showForm ? "Cancel" : "+ New Project"}
          </button>
        )}
      </div>

      {/* Project Form */}
      {showForm && (
        <div className="mb-6">
          <ProjectForm
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditData(null);
            }}
            editData={editData}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {statuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setSelectedCategory("");
            setSelectedStatus("");
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Clear Filters
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Project Image */}
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative">
              {project.image ? (
                <Image
                  src={project.image} 
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-white text-4xl font-bold">
                  {project.title.charAt(0)}
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Project Header */}
              <div className="mb-3">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {project.description || "No description available."}
                </p>
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Open Tasks:</span>
                  <span className="font-semibold ml-2">{project.openTasks}</span>
                </div>
                <div>
                  <span className="text-gray-500">Team Members:</span>
                  <span className="font-semibold ml-2">{project.numberOfMembers}</span>
                </div>
                <div>
                  <span className="text-gray-500">Client:</span>
                  <span className="font-semibold ml-2">{project.clientName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Start:</span>
                  <span>{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deadline:</span>
                  <span>{new Date(project.deadline).toLocaleDateString()}</span>
                </div>
                {project.endDate && (
                  <div className="flex justify-between">
                    <span>End:</span>
                    <span>{new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Team Members */}
              <div className="border-t pt-4">
                <span className="text-sm text-gray-500">Team:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.projectEmployees.slice(0, 3).map((pe, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                      <span>{pe.employee.firstName} {pe.employee.lastName}</span>
                      {pe.role === "LEAD" && (
                        <span className="bg-yellow-100 text-yellow-800 px-1 rounded text-xs">Lead</span>
                      )}
                    </div>
                  ))}
                  {project.projectEmployees.length > 3 && (
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs">
                      +{project.projectEmployees.length - 3} more
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button 
                  onClick={() => handleViewDetails(project)}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  View Details
                </button>
                {user?.role === "ADMIN" && (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(project)}
                      className="bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(project)}
                      className="bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-4">
            {selectedCategory || selectedStatus 
              ? "Try changing your filters to see more results." 
              : "Get started by creating your first project."}
          </p>
          {user?.role === "ADMIN" && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Create Project
            </button>
          )}
        </div>
      )}
    </div>
  );
}