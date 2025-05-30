import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BuilderSidebar from "./BuilderSidebar";
import FormCanvas from "./FormCanvas";
import FormValidation from "./FormValidation";
import { v4 as uuidv4 } from "uuid";
import PreviewControls from "./PreviewControls";
import SaveIndicator from "./SaveIndicator";
import { ShareIcon } from "@heroicons/react/24/outline";
import { useAppSelector } from "~/hooks";

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  checkboxOptions?: string[];
}

interface FormSettings {
  submitButtonText: string;
  successMessage: string;
  title: string;
  description: string;
}

interface ValidationError {
  fieldId: string;
  message: string;
}

interface FormTemplate {
  title: string;
  description: string;
  settings: FormSettings;
  fields: FormField[];
}

const defaultSettings: FormSettings = {
  submitButtonText: "Submit",
  successMessage: "Thank you for your submission!",
  title: "",
  description: "",
};

const getDefaultLabel = (type: string): string => {
  const labels: Record<string, string> = {
    text: "Text Input",
    textarea: "Text Area",
    dropdown: "Dropdown",
    checkbox: "Checkbox",
    date: "Date Picker",
    email: "Email Address",
    phone: "Phone Number",
    number: "Number Input"
  };
  return labels[type] || "Field";
};

type PreviewMode = "desktop" | "tablet" | "mobile";

interface FormBuilderProps {
  initialTemplate?: FormTemplate | null;
  templateId?: string | null;
}

interface FormValidationProps {
  fields: Array<FormField>;
  settings: FormSettings;
  formName: string;
  formDescription: string;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onValidationError: (errors: ValidationError[]) => void;
  onFieldChange?: (fieldId: string, value: any) => void;
}

interface HistoryState {
  fields: FormField[];
  settings: FormSettings;
  formName: string;
  formDescription: string;
}

interface SavedState {
  fields: FormField[];
  settings: FormSettings;
  formName: string;
  formDescription: string;
  history: HistoryState[];
  currentHistoryIndex: number;
  lastSaved: number; // timestamp
}

export default function FormBuilder({ initialTemplate, templateId }: FormBuilderProps) {
  const { user } = useAppSelector(state => state.auth);

  // Generate a unique form ID by combining timestamp and UUID
  const generateUniqueFormId = () => {
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    return `${timestamp}-${uniqueId}`;
  };

  // Initialize formId with a new unique ID for each form
  const [formId] = useState(() => {
    // Always generate a new ID for each form
    return generateUniqueFormId();
  });

  // Initialize form state with unique IDs for each field
  const initializeFormFields = (templateFields: FormField[] = []) => {
    return templateFields.map(field => ({
      ...field,
      id: uuidv4(), // Generate new ID for each field
      // Remove timestamp from label
      label: field.label
    }));
  };

  // Initialize state with unique fields
  const [fields, setFields] = useState<FormField[]>(() => 
    initializeFormFields(initialTemplate?.fields)
  );
  
  const [settings, setSettings] = useState<FormSettings>(() => ({
    ...(initialTemplate?.settings || defaultSettings),
    title: initialTemplate?.settings?.title || "Untitled Form",
    description: initialTemplate?.settings?.description || ""
  }));

  const [formName, setFormName] = useState(() => 
    initialTemplate?.settings?.title || "Untitled Form"
  );
  
  const [formDescription, setFormDescription] = useState(
    initialTemplate?.settings?.description || ""
  );

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ fieldId: string; message: string }>>([]);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // History management
  const [history, setHistory] = useState<HistoryState[]>([{
    fields: initialTemplate?.fields || [],
    settings: initialTemplate?.settings || defaultSettings,
    formName: initialTemplate?.settings?.title || "Untitled Form",
    formDescription: initialTemplate?.settings?.description || "",
  }]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const isHistoryUpdate = useRef(false);

  // Storage key for this form
  const storageKey = `form-builder-${templateId || 'new-form'}`;

  // Save status state
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load saved state from localStorage
  useEffect(() => {
    const loadSavedState = () => {
      try {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          const savedState: SavedState = JSON.parse(savedData);
          
          // Only load if the saved state is newer than the initial template
          if (!initialTemplate || savedState.lastSaved > Date.now() - 24 * 60 * 60 * 1000) { // 24 hours
            setFields(savedState.fields);
            setSettings(savedState.settings);
            setFormName(savedState.formName);
            setFormDescription(savedState.formDescription);
            setHistory(savedState.history);
            setCurrentHistoryIndex(savedState.currentHistoryIndex);
          }
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    };

    loadSavedState();
  }, [storageKey, initialTemplate]);

  // Modified saveToLocalStorage to include visual feedback
  const saveToLocalStorage = useCallback(() => {
    try {
      setIsSaving(true);
      setShowSaveIndicator(true);

      const stateToSave: SavedState = {
        fields,
        settings,
        formName,
        formDescription,
        history,
        currentHistoryIndex,
        lastSaved: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));

      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set a timeout to hide the indicator
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaving(false);
        // Hide the indicator after a short delay
        setTimeout(() => {
          setShowSaveIndicator(false);
        }, 1000);
      }, 500);
    } catch (error) {
      console.error('Error saving state:', error);
      setIsSaving(false);
      setShowSaveIndicator(false);
    }
  }, [fields, settings, formName, formDescription, history, currentHistoryIndex, storageKey]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Auto-save on state changes
  useEffect(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      saveToLocalStorage();
      // Optional: Show a confirmation dialog if there are unsaved changes
      // e.preventDefault();
      // e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save one last time when component unmounts
      saveToLocalStorage();
    };
  }, [saveToLocalStorage]);

  // Modified saveToHistory to include auto-save
  const saveToHistory = useCallback((newState: Partial<HistoryState>) => {
    if (isHistoryUpdate.current) return;

    const currentState = {
      fields,
      settings,
      formName,
      formDescription,
      ...newState
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, currentHistoryIndex + 1);
      newHistory.push(currentState);
      return newHistory;
    });
    setCurrentHistoryIndex(prev => prev + 1);
    
    // Auto-save will be triggered by the useEffect watching the state changes
  }, [fields, settings, formName, formDescription, currentHistoryIndex]);

  // Undo function
  const undo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      isHistoryUpdate.current = true;
      const previousState = history[currentHistoryIndex - 1];
      setFields(previousState.fields);
      setSettings(previousState.settings);
      setFormName(previousState.formName);
      setFormDescription(previousState.formDescription);
      setCurrentHistoryIndex(prev => prev - 1);
      setTimeout(() => {
        isHistoryUpdate.current = false;
      }, 0);
    }
  }, [currentHistoryIndex, history]);

  // Redo function
  const redo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      isHistoryUpdate.current = true;
      const nextState = history[currentHistoryIndex + 1];
      setFields(nextState.fields);
      setSettings(nextState.settings);
      setFormName(nextState.formName);
      setFormDescription(nextState.formDescription);
      setCurrentHistoryIndex(prev => prev + 1);
      setTimeout(() => {
        isHistoryUpdate.current = false;
      }, 0);
    }
  }, [currentHistoryIndex, history]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Update history when template changes
  useEffect(() => {
    if (initialTemplate) {
      const newState = {
        fields: initializeFormFields(initialTemplate.fields),
        settings: {
          ...initialTemplate.settings,
          title: initialTemplate.settings.title || "Untitled Form",
        },
        formName: initialTemplate.settings.title || "Untitled Form",
        formDescription: initialTemplate.settings.description || "",
      };
      setHistory([newState]);
      setCurrentHistoryIndex(0);
      setFields(newState.fields);
      setSettings(newState.settings);
      setFormName(newState.formName);
      setFormDescription(newState.formDescription);
    }
  }, [initialTemplate]);

  // Track field completion
  const handleFieldChange = (fieldId: string, value: any) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const isCompleted = value !== undefined && value !== null && value !== '';
    setCompletedFields(prev => {
      const next = new Set(prev);
      if (isCompleted) {
        next.add(fieldId);
      } else {
        next.delete(fieldId);
      }
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, fieldType: string) => {
    e.dataTransfer.setData("fieldType", fieldType);
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    requestAnimationFrame(() => {
      document.body.removeChild(dragImage);
    });
  };

  const handleDrop = (fieldType: string) => {
    const newField: FormField = {
      id: uuidv4(),
      type: fieldType,
      label: getDefaultLabel(fieldType),
      placeholder: fieldType === "dropdown" ? undefined : `Enter ${fieldType}...`,
      options: fieldType === "dropdown" ? [] : undefined,
      checkboxOptions: fieldType === "checkbox" ? [] : undefined,
    };
    const newFields = [...fields, newField];
    setFields(newFields);
    saveToHistory({ fields: newFields });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleUpdate = (id: string, updates: Partial<FormField>) => {
    const newFields = fields.map((field) =>
      field.id === id ? { ...field, ...updates } : field
    );
    setFields(newFields);
    saveToHistory({ fields: newFields });
  };

  const handleDelete = (id: string) => {
    const newFields = fields.filter((field) => field.id !== id);
    setFields(newFields);
    saveToHistory({ fields: newFields });
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const newFields = [...fields];
    const index = newFields.findIndex((field) => field.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === newFields.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
    saveToHistory({ fields: newFields });
  };

  const handleDuplicate = (id: string) => {
    const fieldToDuplicate = fields.find((field) => field.id === id);
    if (!fieldToDuplicate) return;

    const duplicatedField = {
      ...fieldToDuplicate,
      id: uuidv4(),
      label: `${fieldToDuplicate.label} (Copy)`,
    };

    const index = fields.findIndex((field) => field.id === id);
    const newFields = [...fields];
    newFields.splice(index + 1, 0, duplicatedField);
    setFields(newFields);
    saveToHistory({ fields: newFields });
  };

  const handleSubmit = async (data: Record<string, any>) => {
    // Here you would typically send the data to your backend
    console.log("Form submitted:", data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleValidationError = (errors: Array<{ fieldId: string; message: string }>) => {
    setValidationErrors(errors);
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case "mobile":
        return "max-w-sm";
      case "tablet":
        return "max-w-2xl";
      case "desktop":
      default:
        return "max-w-4xl";
    }
  };

  const handleFormDetailsUpdate = (updates: { name?: string; description?: string }) => {
    const newName = updates.name !== undefined ? updates.name : formName;
    const newDescription = updates.description !== undefined ? updates.description : formDescription;
    setFormName(newName);
    setFormDescription(newDescription);
    saveToHistory({ formName: newName, formDescription: newDescription });
  };

  const handleShare = async () => {
    try {
      const formData = {
        formName,
        formDescription,
        fields,
        settings,
        createdAt: Date.now(),
        createdBy: user?.id || 'anonymous',
        formId,
        templateId: templateId || 'custom'
      };
      
      // Save form data to localStorage using the unique formId
      localStorage.setItem(`form-data-${formId}`, JSON.stringify(formData));
      
      // Save form to database
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formName,
          description: formDescription,
          fields: fields.map(field => ({
            id: field.id,
            type: field.type,
            label: field.label,
            required: field.required,
            placeholder: field.placeholder,
            options: field.options,
            checkboxOptions: field.checkboxOptions
          })),
          settings: {
            submitButtonText: settings.submitButtonText,
            successMessage: settings.successMessage
          },
          isPublic: true,
          formId,
          userId: user?.id || 'anonymous' // Use user ID from Redux state
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        throw new Error(errorData.message || 'Failed to save form to database');
      }
      
      
      setIsShareModalOpen(true);
    } catch (error) {
      console.error('Error saving form data:', error);
      // Show error to user
      alert('Failed to save form. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/form/${formId}`;
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      // Log for debugging
      console.log('Share link copied:', shareUrl);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <PreviewControls
        currentMode={previewMode}
        onModeChange={setPreviewMode}
        isPreviewMode={isPreviewMode}
        onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
        totalFields={fields.length}
        completedFields={completedFields.size}
        canUndo={currentHistoryIndex > 0}
        canRedo={currentHistoryIndex < history.length - 1}
        onUndo={undo}
        onRedo={redo}
        onShare={handleShare}
      />
      <div className="flex flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {!isPreviewMode && (
          <BuilderSidebar onDragStart={handleDragStart} />
        )}
        <div className={`flex-1 overflow-auto p-4 ${isPreviewMode ? "flex justify-center" : ""}`}>
          {isPreviewMode ? (
            <div className={`w-full ${getPreviewWidth()} mx-auto transition-all duration-300`}>
              <FormValidation
                fields={fields}
                settings={settings}
                formName={formName}
                formDescription={formDescription}
                onSubmit={handleSubmit}
                onValidationError={handleValidationError}
                onFieldChange={handleFieldChange}
              />
            </div>
          ) : (
            <FormCanvas
              fields={fields}
              onDrop={handleDrop}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onMove={handleMove}
              onDuplicate={handleDuplicate}
              formName={formName}
              formDescription={formDescription}
              onFormDetailsUpdate={handleFormDetailsUpdate}
            />
          )}
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Share Your Form
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Share this link with others to let them fill out your form.
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/form/${formId}`}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Anyone with this link can:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>View and fill out your form</li>
                <li>Submit responses</li>
              </ul>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Form ID: {formId}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Created: {new Date(parseInt(formId.split('-')[0])).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Template: {templateId || 'Custom Form'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This is a unique form with its own submission link
              </p>
            </div>
          </div>
        </div>
      )}

      <SaveIndicator isVisible={showSaveIndicator} isSaving={isSaving} />
    </div>
  );
} 