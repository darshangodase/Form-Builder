import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
  DocumentDuplicateIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface FormFieldProps {
  field: {
    id: string;
    type: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
    checkboxOptions?: string[];
  };
  onUpdate: (id: string, updates: Partial<FormFieldProps["field"]>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDuplicate: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function FormField({
  field,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
  isFirst,
  isLast,
}: FormFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(field.label);
  const [editedPlaceholder, setEditedPlaceholder] = useState(field.placeholder || "");
  const [editedRequired, setEditedRequired] = useState(field.required || false);
  const [editedOptions, setEditedOptions] = useState<string[]>(field.options || []);
  const [editedCheckboxOptions, setEditedCheckboxOptions] = useState<string[]>(field.checkboxOptions || []);
  const [newOption, setNewOption] = useState("");
  const [newCheckboxOption, setNewCheckboxOption] = useState("");
  const labelInputRef = useRef<HTMLInputElement>(null);

  // Reset edited values when field prop changes
  useEffect(() => {
    setEditedLabel(field.label);
    setEditedPlaceholder(field.placeholder || "");
    setEditedRequired(field.required || false);
    setEditedOptions(field.options || []);
    setEditedCheckboxOptions(field.checkboxOptions || []);
  }, [field]);

  useEffect(() => {
    if (isEditing && labelInputRef.current) {
      labelInputRef.current.focus();
    }
  }, [isEditing]);

  const inputClasses = "w-64 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:bg-gray-50 dark:disabled:bg-gray-800";

  const handleSave = () => {
    onUpdate(field.id, {
      label: editedLabel,
      placeholder: field.type === "dropdown" ? undefined : editedPlaceholder,
      required: editedRequired,
      options: field.type === "dropdown" ? editedOptions : undefined,
      checkboxOptions: field.type === "checkbox" ? editedCheckboxOptions : undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedLabel(field.label);
    setEditedPlaceholder(field.placeholder || "");
    setEditedRequired(field.required || false);
    setEditedOptions(field.options || []);
    setEditedCheckboxOptions(field.checkboxOptions || []);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setEditedOptions([...editedOptions, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    setEditedOptions(editedOptions.filter((_, i) => i !== index));
  };

  const handleAddCheckboxOption = () => {
    if (newCheckboxOption.trim()) {
      setEditedCheckboxOptions([...editedCheckboxOptions, newCheckboxOption.trim()]);
      setNewCheckboxOption("");
    }
  };

  const handleRemoveCheckboxOption = (index: number) => {
    setEditedCheckboxOptions(editedCheckboxOptions.filter((_, i) => i !== index));
  };

  const renderField = () => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            className={inputClasses}
            placeholder={field.placeholder || "Enter text..."}
            disabled
          />
        );
      case "email":
        return (
          <input
            type="email"
            className={inputClasses}
            placeholder={field.placeholder || "Enter email address..."}
            disabled
          />
        );
      case "phone":
        return (
          <input
            type="tel"
            className={inputClasses}
            placeholder={field.placeholder || "Enter 10-digit phone number..."}
            disabled
          />
        );
      case "textarea":
        return (
          <textarea
            className={inputClasses}
            rows={3}
            placeholder={field.placeholder || "Enter text..."}
            disabled
          />
        );
      case "dropdown":
        return (
          <select
            className={`${inputClasses} bg-white dark:bg-gray-700`}
            disabled
          >
            <option value="" disabled selected className="text-gray-500 dark:text-gray-400">Select your option</option>
            {field.options && field.options.length > 0 ? (
              field.options.map((option, index) => (
                <option key={index} value={option.toLowerCase().replace(/\s+/g, '-')} className="text-gray-900 dark:text-white">
                  {option}
                </option>
              ))
            ) : (
              <option value="" disabled className="text-gray-500 dark:text-gray-400">No options added</option>
            )}
          </select>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.checkboxOptions && field.checkboxOptions.length > 0 ? (
              field.checkboxOptions.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 appearance-none border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23fff%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M16.707%205.293a1%201%200%20010%201.414l-8%208a1%201%200%2001-1.414%200l-4-4a1%201%200%20011.414-1.414L8%2012.586l7.293-7.293a1%201%200%20011.414%200z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] checked:bg-center checked:bg-no-repeat"
                    disabled
                  />
                  <label className="ml-2 text-gray-700 dark:text-gray-300">{option}</label>
                </div>
              ))
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic">No checkbox options added</div>
            )}
          </div>
        );
      case "date":
        return (
          <input
            type="date"
            className={inputClasses}
            disabled
          />
        );
      default:
        return null;
    }
  };

  const renderValidationFields = () => {
    // Remove validation fields as they're no longer needed
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 group relative"
    >
      {/* Field Actions */}
      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
            title="Edit field"
          >
            <PencilIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => onDuplicate(field.id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
            title="Duplicate field"
          >
            <DocumentDuplicateIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => onDelete(field.id)}
            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
            title="Delete field"
          >
            <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
          {!isFirst && (
            <button
              onClick={() => onMove(field.id, "up")}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
              title="Move up"
            >
              <ChevronUpIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => onMove(field.id, "down")}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
              title="Move down"
            >
              <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3 max-w-md">
          <div className="flex items-center gap-3">
            <label className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
              Field Label:
            </label>
            <input
              type="text"
              value={editedLabel}
              onChange={(e) => setEditedLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              className={inputClasses}
              placeholder="Enter field label"
              ref={labelInputRef}
            />
          </div>
          
          {field.type === "dropdown" ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Options:
              </label>
              <div className="space-y-2">
                {editedOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editedOptions];
                        newOptions[index] = e.target.value;
                        setEditedOptions(newOptions);
                      }}
                      className={inputClasses}
                      placeholder="Option text"
                    />
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                      title="Remove option"
                    >
                      <XMarkIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    className={inputClasses}
                    placeholder="Add new option"
                  />
                  <button
                    onClick={handleAddOption}
                    className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                    title="Add option"
                  >
                    <PlusIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </button>
                </div>
              </div>
            </div>
          ) : field.type === "checkbox" ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Checkbox Options:
              </label>
              <div className="space-y-2">
                {editedCheckboxOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editedCheckboxOptions];
                        newOptions[index] = e.target.value;
                        setEditedCheckboxOptions(newOptions);
                      }}
                      className={inputClasses}
                      placeholder="Checkbox label"
                    />
                    <button
                      onClick={() => handleRemoveCheckboxOption(index)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                      title="Remove option"
                    >
                      <XMarkIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCheckboxOption}
                    onChange={(e) => setNewCheckboxOption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCheckboxOption();
                      }
                    }}
                    className={inputClasses}
                    placeholder="Add new checkbox option"
                  />
                  <button
                    onClick={handleAddCheckboxOption}
                    className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                    title="Add option"
                  >
                    <PlusIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <label className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
                Placeholder:
              </label>
              <input
                type="text"
                value={editedPlaceholder}
                onChange={(e) => setEditedPlaceholder(e.target.value)}
                onKeyDown={handleKeyDown}
                className={inputClasses}
                placeholder="Enter placeholder text"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
              Required:
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`required-${field.id}`}
                checked={editedRequired}
                onChange={(e) => setEditedRequired(e.target.checked)}
                className="w-4 h-4 appearance-none border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23fff%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M16.707%205.293a1%201%200%20010%201.414l-8%208a1%201%200%2001-1.414%200l-4-4a1%201%200%20011.414-1.414L8%2012.586l7.293-7.293a1%201%200%20011.414%200z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] checked:bg-center checked:bg-no-repeat"
              />
              <label
                htmlFor={`required-${field.id}`}
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Make this field required
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-1"
              >
                <XMarkIcon className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors flex items-center gap-1"
              >
                <CheckIcon className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
          </label>
          {renderField()}
        </>
      )}
    </motion.div>
  );
} 