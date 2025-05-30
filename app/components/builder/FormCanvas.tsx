import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import FormField from "./FormField";
import FormValidation from "./FormValidation";
import { CalendarIcon } from "@heroicons/react/24/outline";

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];  // For dropdown fields
  checkboxOptions?: string[];  // For checkbox fields
}

interface FormSettings {
  submitButtonText: string;
  successMessage: string;
}

interface FormCanvasProps {
  fields: FormField[];
  onDrop: (fieldType: string) => void;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDuplicate: (id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  formName?: string;
  formDescription?: string;
  onFormDetailsUpdate?: (updates: { name?: string; description?: string }) => void;
}

const getDefaultLabel = (type: string): string => {
  const labels: Record<string, string> = {
    text: "Text Input",
    textarea: "Text Area",
    dropdown: "Dropdown",
    checkbox: "Checkbox",
    date: "Date Picker",
    email: "Email Address",
    phone: "Phone Number",
  };
  return labels[type] || "Field";
};

const renderField = (field: FormField) => {
  switch (field.type) {
    case "text":
      return (
        <div>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={field.placeholder || "Enter text..."}
            disabled
            required={field.required}
          />
          {field.required && (
            <p className="mt-1 text-sm text-gray-500">* Required field</p>
          )}
        </div>
      );
    case "textarea":
      return (
        <div>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder={field.placeholder || "Enter text..."}
            disabled
            required={field.required}
          />
          {field.required && (
            <p className="mt-1 text-sm text-gray-500">* Required field</p>
          )}
        </div>
      );
    case "dropdown":
      return (
        <div>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            disabled
            required={field.required}
          >
            {field.options && field.options.length > 0 ? (
              field.options.map((option, index) => (
                <option key={index} value={option.toLowerCase().replace(/\s+/g, '-')}>
                  {option}
                </option>
              ))
            ) : (
              <option value="" disabled>No options added</option>
            )}
          </select>
          {field.required && (
            <p className="mt-1 text-sm text-gray-500">* Required field</p>
          )}
        </div>
      );
    case "checkbox":
      return (
        <div className="space-y-2">
          {field.checkboxOptions && field.checkboxOptions.length > 0 ? (
            field.checkboxOptions.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 appearance-none border border-gray-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23fff%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M16.707%205.293a1%201%200%20010%201.414l-8%208a1%201%200%2001-1.414%200l-4-4a1%201%200%20011.414-1.414L8%2012.586l7.293-7.293a1%201%200%20011.414%200z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] checked:bg-center checked:bg-no-repeat"
                  disabled
                  required={field.required}
                />
                <label className="ml-2 text-gray-700">
                  {option}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic">No checkbox options added</div>
          )}
        </div>
      );
    case "date":
      return (
        <div className="relative">
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            placeholder="Select date..."
            disabled
            required={field.required}
          />
          <CalendarIcon className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          {field.required && (
            <p className="mt-1 text-sm text-gray-500">* Required field</p>
          )}
        </div>
      );
    default:
      return null;
  }
};

export default function FormCanvas({
  fields,
  onDrop,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
  onDragOver,
  formName = "Untitled Form",
  formDescription = "",
  onFormDetailsUpdate,
}: FormCanvasProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);

  // Mock settings for preview
  const previewSettings: FormSettings = {
    submitButtonText: "Submit",
    successMessage: "Thank you for your submission!",
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
    onDragOver?.(e);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter((prev) => prev + 1);
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter((prev) => prev - 1);
    if (dragCounter <= 1) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragCounter(0);
    setIsDraggingOver(false);
    const fieldType = e.dataTransfer.getData("fieldType");
    if (fieldType) {
      onDrop(fieldType);
    }
  };

  const handleFieldDragStart = (e: React.DragEvent, fieldId: string) => {
    e.stopPropagation();
    setDraggedFieldId(fieldId);
    e.dataTransfer.setData('fieldId', fieldId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFieldDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedFieldId === fieldId) return;
    setDragOverFieldId(fieldId);
  };

  const handleFieldDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFieldId(null);
  };

  const handleFieldDrop = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedFieldId || draggedFieldId === fieldId) {
      setDraggedFieldId(null);
      setDragOverFieldId(null);
      return;
    }

    const draggedIndex = fields.findIndex(f => f.id === draggedFieldId);
    const targetIndex = fields.findIndex(f => f.id === fieldId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    // Use the existing onMove function to move the field
    if (draggedIndex < targetIndex) {
      // Move down until we reach the target
      for (let i = draggedIndex; i < targetIndex; i++) {
        onMove(draggedFieldId, "down");
      }
    } else {
      // Move up until we reach the target
      for (let i = draggedIndex; i > targetIndex; i--) {
        onMove(draggedFieldId, "up");
      }
    }

    setDraggedFieldId(null);
    setDragOverFieldId(null);
  };

  const handleFieldDragEnd = () => {
    setDraggedFieldId(null);
    setDragOverFieldId(null);
  };

  return (
    <div className="flex h-full">
      {/* Form Builder Section */}
      <div 
        className={`flex-1 min-h-full ${
          isDraggingOver 
            ? "bg-blue-50 dark:bg-blue-900/20" 
            : "bg-gray-100 dark:bg-gray-800"
        } transition-colors overflow-auto`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-8 text-center">
              <input
                type="text"
                value={formName}
                onChange={(e) => onFormDetailsUpdate?.({ name: e.target.value })}
                className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                placeholder="Untitled Form"
              />
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => onFormDetailsUpdate?.({ description: e.target.value })}
                className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-center"
                  placeholder="Add a description for your form"
                />
            </div>

            {fields.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div
                  className={`border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ${
                    isDraggingOver 
                      ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <p
                    className={`text-lg transition-colors duration-200 ${
                      isDraggingOver 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {isDraggingOver
                      ? "Drop to add field"
                      : "Drag and drop form fields here to start building your form"}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Available fields: Text Input, Text Area, Dropdown, Checkbox, Date Picker, Email Input, Phone Input
                  </p>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={(e) => handleFieldDragStart(e, field.id)}
                      onDragOver={(e) => handleFieldDragOver(e, field.id)}
                      onDragLeave={handleFieldDragLeave}
                      onDrop={(e) => handleFieldDrop(e, field.id)}
                      onDragEnd={handleFieldDragEnd}
                      className={`relative ${
                        dragOverFieldId === field.id
                          ? 'border-2 border-blue-500 dark:border-blue-400'
                          : ''
                      }`}
                    >
                      <FormField
                        field={field}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onMove={onMove}
                        onDuplicate={onDuplicate}
                        isFirst={index === 0}
                        isLast={index === fields.length - 1}
                      />
                    </div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10 text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Live Preview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">See how your form will look to users</p>
        </div>
        <div className="p-6 flex justify-center">
          <div className="w-full max-w-2xl">
            <FormValidation
              fields={fields}
              settings={previewSettings}
              formName={formName}
              formDescription={formDescription}
              onSubmit={async (data) => {
                console.log('Preview form submitted:', data);
                return Promise.resolve();
              }}
              onValidationError={(errors) => console.log('Preview validation errors:', errors)}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 