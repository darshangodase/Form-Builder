import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface ValidationError {
  fieldId: string;
  message: string;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  checkboxOptions?: string[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  validationType?: 'email' | 'phone' | 'number' | 'text' | 'date';
}

interface FormSettings {
  submitButtonText: string;
  successMessage: string;
}

interface FormValidationProps {
  fields: Array<FormField>;
  settings: FormSettings;
  formName: string;
  formDescription: string;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onValidationError: (errors: ValidationError[]) => void;
  onFieldChange?: (fieldId: string, value: any) => void;
  isSubmitting?: boolean;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateField = (
    value: any,
    field: FormField
  ): ValidationError | null => {
    // Required field validation
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ""))) {
      return {
        fieldId: field.id,
        message: `${field.label} is required`,
      };
    }

    // Skip further validation if no value and not required
    if (!value) return null;

    // Email validation
    if (field.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return {
          fieldId: field.id,
          message: "Please enter a valid email address",
        };
      }
    }

    // Phone validation (10 digits only)
    if (field.type === "phone") {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(value.replace(/\D/g, ''))) {
        return {
          fieldId: field.id,
          message: "Please enter a valid 10-digit phone number",
        };
      }
    }

    return null;
  };

  const validateForm = (
    formData: Record<string, any>,
    fields: FormValidationProps["fields"]
  ): ValidationError[] => {
    const validationErrors: ValidationError[] = [];
    fields.forEach((field) => {
      const error = validateField(formData[field.id], field);
      if (error) {
        validationErrors.push(error);
      }
    });
    return validationErrors;
  };

  const handleSubmit = async (
    formData: Record<string, any>,
    fields: FormValidationProps["fields"],
    onSubmit: FormValidationProps["onSubmit"],
    onValidationError: FormValidationProps["onValidationError"]
  ) => {
    setInternalIsSubmitting(true);
    setErrors([]);

    const validationErrors = validateForm(formData, fields);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      onValidationError(validationErrors);
      setInternalIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
      setIsSubmitted(true);
    } catch (error) {
      setErrors([
        {
          fieldId: "form",
          message: "An error occurred while submitting the form",
        },
      ]);
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  return {
    errors,
    isSubmitting: internalIsSubmitting,
    isSubmitted,
    handleSubmit,
    validateField,
  };
}

export default function FormValidation({
  fields,
  settings,
  formName,
  formDescription,
  onSubmit,
  onValidationError,
  onFieldChange,
  isSubmitting: externalIsSubmitting,
}: FormValidationProps) {
  const {
    errors,
    isSubmitting: internalIsSubmitting,
    isSubmitted,
    handleSubmit,
  } = useFormValidation();

  const [formData, setFormData] = useState<Record<string, any>>({});

  // Use external isSubmitting if provided, otherwise use internal state
  const isSubmitting = externalIsSubmitting ?? internalIsSubmitting;

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    onFieldChange?.(fieldId, value);
  };

  const renderField = (field: FormField) => {
    const error = errors.find((e) => field.id === e.fieldId);

    const commonProps = {
      id: field.id,
      name: field.id,
      value: formData[field.id] || "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleInputChange(field.id, e.target.value),
      className: `w-full px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border rounded-lg shadow-sm 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
        placeholder:text-gray-400 dark:placeholder:text-gray-500
        disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400
        disabled:cursor-not-allowed transition-colors duration-200 ${
          error 
            ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500" 
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        }`,
      placeholder: field.placeholder,
      disabled: isSubmitting,
      required: field.required,
    };

    switch (field.type) {
      case "text":
        return (
          <div>
            <input
              type="text"
              {...commonProps}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium"
              >
                {error.message}
              </motion.p>
            )}
          </div>
        );
      case "email":
        return (
          <div>
            <input
              type="email"
              {...commonProps}
              placeholder={field.placeholder || "Enter email address..."}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium"
              >
                {error.message}
              </motion.p>
            )}
          </div>
        );
      case "phone":
        return (
          <div>
            <input
              type="tel"
              {...commonProps}
              placeholder={field.placeholder || "Enter 10-digit phone number..."}
              maxLength={10}
              pattern="[0-9]{10}"
              inputMode="numeric"
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium"
              >
                {error.message}
              </motion.p>
            )}
          </div>
        );
      case "textarea":
        return (
          <div>
            <textarea 
              {...commonProps} 
              rows={3}
              className={`${commonProps.className} resize-none`}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium"
              >
                {error.message}
              </motion.p>
            )}
          </div>
        );
      case "dropdown":
        return (
          <div>
            <select 
              {...commonProps}
              className={`${commonProps.className} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236B7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a1%201%200%2001.707.293l3%203a1%201%200%2001-1.414%201.414L10%205.414%207.707%207.707a1%201%200%2001-1.414-1.414l3-3A1%201%200%200110%203zm-3.707%209.293a1%201%200%20011.414%200L10%2014.586l2.293-2.293a1%201%200%20011.414%201.414l-3%203a1%201%200%2001-1.414%200l-3-3a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] dark:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239CA3AF%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M10%203a1%201%200%2001.707.293l3%203a1%201%200%2001-1.414%201.414L10%205.414%207.707%207.707a1%201%200%2001-1.414-1.414l3-3A1%201%200%200110%203zm-3.707%209.293a1%201%200%20011.414%200L10%2014.586l2.293-2.293a1%201%200%20011.414%201.414l-3%203a1%201%200%2001-1.414%200l-3-3a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:1.5em_1.5em] bg-[right_0.75rem_center] pr-10`}
            >
              <option value="" disabled className="text-gray-500 dark:text-gray-400">Select your option</option>
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
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium"
              >
                {error.message}
              </motion.p>
            )}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-3">
            {field.checkboxOptions && field.checkboxOptions.length > 0 ? (
              field.checkboxOptions.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${field.id}-${index}`}
                    name={field.id}
                    value={option.toLowerCase().replace(/\s+/g, '-')}
                    checked={formData[field.id]?.includes(option.toLowerCase().replace(/\s+/g, '-')) || false}
                    onChange={(e) => {
                      const currentValues = formData[field.id] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, e.target.value]
                        : currentValues.filter((v: string) => v !== e.target.value);
                      handleInputChange(field.id, newValues);
                    }}
                    className={`w-5 h-5 rounded border-2 bg-white dark:bg-gray-700
                      checked:bg-blue-600 checked:border-blue-600 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800
                      transition-colors duration-200
                      appearance-none relative
                      before:absolute before:inset-0 before:bg-white dark:before:bg-gray-700 before:rounded
                      checked:before:bg-blue-600
                      after:absolute after:inset-0 after:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23fff%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M16.707%205.293a1%201%200%20010%201.414l-8%208a1%201%200%2001-1.414%200l-4-4a1%201%200%20011.414-1.414L8%2012.586l7.293-7.293a1%201%200%20011.414%200z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] after:bg-no-repeat after:bg-center after:opacity-0 checked:after:opacity-100
                      ${error ? "border-red-300 dark:border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    disabled={isSubmitting}
                  />
                  <label 
                    htmlFor={`${field.id}-${index}`} 
                    className="ml-3 text-gray-700 dark:text-gray-300 font-medium select-none"
                  >
                    {option}
                  </label>
                </div>
              ))
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic">No checkbox options added</div>
            )}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium"
              >
                {error.message}
              </motion.p>
            )}
          </div>
        );
      case "date":
        return (
          <div>
            <input 
              type="date" 
              {...commonProps}
              className={`${commonProps.className} [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100`}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium"
              >
                {error.message}
              </motion.p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
      <div className="border-b border-gray-100 dark:border-gray-700 pb-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
          {formName}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto">{formDescription}</p>
      </div>
      <AnimatePresence>
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center space-x-3"
          >
            <CheckCircleIcon className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0" />
            <p className="text-green-700 dark:text-green-300 font-medium">{settings.successMessage || "Form submitted successfully!"}</p>
          </motion.div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(formData, fields, onSubmit, onValidationError);
            }}
            className="space-y-6 max-w-2xl mx-auto"
          >
            {fields.map((field) => (
              <div key={field.id} className="bg-gray-50/50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 dark:text-red-400 ml-1">*</span>
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}

            {errors.some((e) => e.fieldId === "form") && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-3"
              >
                <XCircleIcon className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 font-medium">
                  {errors.find((e) => e.fieldId === "form")?.message}
                </p>
              </motion.div>
            )}

            {fields.length > 0 && (
              <div className="flex justify-center pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-[200px] px-6 py-3 text-white rounded-lg transition-all duration-200 
                    shadow-sm hover:shadow-md ${
                      isSubmitting
                        ? "bg-blue-400 dark:bg-blue-500 cursor-not-allowed"
                        : "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </span>
                  ) : (
                    settings.submitButtonText
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </AnimatePresence>
    </div>
  );
} 