import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@remix-run/react";
import {
  Cog6ToothIcon,
  EyeIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";

interface FormSettings {
  submitButtonText: string;
  successMessage: string;
}

interface FormSettingsProps {
  settings: FormSettings;
  onUpdate: (settings: FormSettings) => void;
  onPreview: () => void;
  isPreviewMode: boolean;
}

export default function FormSettings({
  settings,
  onUpdate,
  onPreview,
  isPreviewMode,
}: FormSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSettings, setEditedSettings] = useState(settings);
  const [editingField, setEditingField] = useState<keyof FormSettings | null>(null);

  const handleSave = () => {
    onUpdate(editedSettings);
    setIsEditing(false);
    setEditingField(null);
  };

  const handleDoubleClick = (field: keyof FormSettings) => {
    setEditingField(field);
    setIsEditing(true);
  };

  const handleFieldChange = (field: keyof FormSettings, value: string) => {
    setEditedSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditingField(null);
      setEditedSettings(settings);
    }
  };

  const inputClasses = "px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:bg-gray-50 dark:disabled:bg-gray-800";

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-4"
            >
              {editingField === "submitButtonText" ? (
                <input
                  type="text"
                  value={editedSettings.submitButtonText}
                  onChange={(e) => handleFieldChange("submitButtonText", e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  autoFocus
                  className={inputClasses}
                  placeholder="Submit Button Text"
                />
              ) : (
                <button
                  onDoubleClick={() => handleDoubleClick("submitButtonText")}
                  className="text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors border-2 border-gray-200 dark:border-gray-600"
                >
                  {settings.submitButtonText}
                </button>
              )}

              {editingField === "successMessage" ? (
                <input
                  type="text"
                  value={editedSettings.successMessage}
                  onChange={(e) => handleFieldChange("successMessage", e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  autoFocus
                  className={inputClasses}
                  placeholder="Success Message"
                />
              ) : (
                <button
                  onDoubleClick={() => handleDoubleClick("successMessage")}
                  className="text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors border-2 border-gray-200 dark:border-gray-600"
                >
                  {settings.successMessage}
                </button>
              )}

              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
            </motion.div>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onPreview}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors ${
              isPreviewMode
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <EyeIcon className="w-5 h-5" />
            <span>{isPreviewMode ? "Exit Preview" : "Preview"}</span>
          </button>
        </div>
      </div>
    </div>
  );
} 