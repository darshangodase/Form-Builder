import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import FormValidation from "~/components/builder/FormValidation";
import { useState, useEffect } from "react";

interface FormData {
  formName: string;
  formDescription: string;
  fields: Array<{
    id: string;
    type: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
    checkboxOptions?: string[];
  }>;
  settings: {
    submitButtonText: string;
    successMessage: string;
  };
  lastUpdated: number;
}

// Since we're using localStorage, we need to handle this on the client side
export async function loader({ params }: LoaderFunctionArgs) {
  // Return a minimal response that will be enhanced on the client
  return json({ formId: params.formId });
}

export default function FormView() {
  const { formId } = useLoaderData<typeof loader>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load form data from localStorage on client side
  useEffect(() => {
    if (!formId) {
      setError("Form ID is missing");
      setIsLoading(false);
      return;
    }

    try {
      const savedFormData = localStorage.getItem(`form-data-${formId}`);
      if (!savedFormData) {
        setError("Form not found");
        setIsLoading(false);
        return;
      }

      const parsedData = JSON.parse(savedFormData) as FormData;
      setFormData(parsedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading form data:", error);
      setError("Error loading form data");
      setIsLoading(false);
    }
  }, [formId]);

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }

      const result = await response.json();
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error saving submission:", error);
      setError(error instanceof Error ? error.message : "Error saving your submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidationError = (errors: Array<{ fieldId: string; message: string }>) => {
    console.log("Validation errors:", errors);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Form
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Form Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            The form you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {formData.settings.successMessage}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your response has been recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <FormValidation
              fields={formData.fields}
              settings={formData.settings}
              formName={formData.formName}
              formDescription={formData.formDescription}
              onSubmit={handleSubmit}
              onValidationError={handleValidationError}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 