"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";
import Image from "next/image";


// Form validation schema
export const projectSchema = z.object({
  
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  clientName: z.string().min(1, "Client name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  category: z.string().min(1, "Category is required"),
  image: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// Create a separate type for editing that includes ID
export type ProjectWithId = ProjectFormData & { id: number };

interface ProjectFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
  editData?: ProjectWithId | null;
}

export default function ProjectForm({ onSuccess, onCancel, editData }: ProjectFormProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      clientName: "",
      startDate: "",
      endDate: "",
      deadline: "",
      priority: "MEDIUM",
      category: "Web Development",
      image: "",
    },
  });

  // Set form data when editing
 useEffect(() => {
  if (editData) {
    console.log("Edit data received:", editData); // Debug log
    
    Object.entries(editData).forEach(([key, value]) => {
      if (value) {
        // Handle date formatting for date inputs
        if ((key === 'startDate' || key === 'endDate' || key === 'deadline') && value) {
          try {
            // Convert ISO date to YYYY-MM-DD format for HTML date input
            const dateValue = new Date(value as string);
            if (!isNaN(dateValue.getTime())) { // Check if valid date
              const formattedDate = dateValue.toISOString().split('T')[0];
              console.log(`Converting ${key}: ${value} → ${formattedDate}`); // Debug
              setValue(key as keyof ProjectFormData, formattedDate);
            } else {
              console.warn(`Invalid date for ${key}:`, value);
              setValue(key as keyof ProjectFormData, value as ProjectFormData[keyof ProjectFormData]);
            }
          } catch (error) {
            console.error(`Error converting date for ${key}:`, error);
            setValue(key as keyof ProjectFormData, value as ProjectFormData[keyof ProjectFormData]);
          }
        } else {
          // For non-date fields, set value directly
          setValue(key as keyof ProjectFormData, value as ProjectFormData[keyof ProjectFormData]);
        }
      }
    });
    
    if (editData.image) {
      setImagePreview(editData.image);
    }
  }
}, [editData, setValue]);

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
       
      
      const url = editData && editData.id 
        ? `/api/projects/${editData.id}` 
        : "/api/projects";
        console.log("Submitting data to:", url);
      
      const method = editData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Failed to ${editData ? 'update' : 'create'} project`);
      }

      enqueueSnackbar(`Project ${editData ? 'updated' : 'created'} successfully!`, { variant: "success" });
      reset();
      setImagePreview(null);
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll just set a placeholder
      // In production, you'd upload to a file storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        setValue('image', imageUrl); // Store base64 or URL
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold">
        {editData ? "Edit Project" : "Create New Project"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Project Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              {...register("title")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name *
            </label>
            <input
              type="text"
              {...register("clientName")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter client name"
            />
            {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              type="text"
              {...register("category")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Web Development, Mobile App"
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <select
              {...register("priority")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Dates */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                {...register("endDate")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline *
              </label>
              <input
                type="date"
                {...register("deadline")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline.message}</p>}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {imagePreview ? (
                <div className="mb-4">
                  <Image
                    src={imagePreview} 
                    alt="Preview" 
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-gray-400 mb-4">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm">Upload project image</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="project-image"
              />
              <label
                htmlFor="project-image"
                className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
              >
                Choose Image
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe the project details, goals, and requirements..."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isSubmitting ? (editData ? "Updating..." : "Creating...") : (editData ? "Update Project" : "Create Project")}
          
        </button>
      </div>
    </form>
  );
}