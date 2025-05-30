import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams, Link, useNavigate } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { useAppSelector } from '~/hooks';
import Navbar from '~/components/Navbar';
import { format } from 'date-fns';
import { utils as XLSXUtils, write as XLSXWrite } from 'xlsx';

interface FormSubmission {
  _id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormData {
  formName: string;
  formDescription: string;
  fields: FormField[];
  settings: {
    submitButtonText: string;
    successMessage: string;
  };
}

const API_BASE_URL = 'http://localhost:5000/api';

export async function loader({ params }: LoaderFunctionArgs) {
  const { formId } = params;

  if (!formId) {
    throw new Response("Form ID is required", { status: 400 });
  }

  try {
    // Fetch form data
    const formResponse = await fetch(`${API_BASE_URL}/forms/${formId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    const formData = await formResponse.json();

    if (!formResponse.ok) {
      throw new Response(formData.message || 'Failed to fetch form data', { status: formResponse.status });
    }

    if (!formData.success) {
      throw new Response('Failed to fetch form data', { status: 400 });
    }

    if (!formData.form) {
      throw new Response('Form data is missing', { status: 400 });
    }

    // Ensure form has a name, use default if missing
    const formWithDefaults = {
      ...formData.form,
      formName: formData.form.formName || `Form ${formId.slice(0, 8)}`,
      formDescription: formData.form.formDescription || 'No description available'
    };

    // Fetch submissions
    const submissionsResponse = await fetch(`${API_BASE_URL}/forms/${formId}/submissions`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    const submissionsData = await submissionsResponse.json();

    if (!submissionsResponse.ok) {
      throw new Response(submissionsData.message || 'Failed to fetch submissions', { status: submissionsResponse.status });
    }

    if (!submissionsData.success) {
      throw new Response('Failed to fetch submissions', { status: 400 });
    }

    return json({ 
      form: formWithDefaults,
      submissions: submissionsData.submissions || []
    });
  } catch (error) {
    console.error('Error in loader:', error);
    throw new Response('Failed to load data', { status: 500 });
  }
}

export default function FormResponses() {
  const { formId } = useParams();
  const { form, submissions } = useLoaderData<typeof loader>();
  const [columns, setColumns] = useState<Array<{ key: string; label: string }>>([]);
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);

  // Debug log for loader data
  console.log('Loader Data in Component:', form);

  useEffect(() => {
    if (!user) {
      navigate(`/auth/login`);
    }
  }, [user, navigate]);

  // Debug log for form data
  console.log('Form Data in Component:', form);
  console.log('Submissions in Component:', submissions);

  useEffect(() => {
    if (!form?.fields) {
      console.error('Form data is missing or invalid:', form);
      return;
    }

    // Create a map of field IDs to their labels
    const fieldLabelMap = new Map<string, string>();
    form.fields.forEach((field: FormField) => {
      fieldLabelMap.set(field.id, field.label);
    });

    // Extract unique column names from all submissions and map them to labels
    if (submissions && submissions.length > 0) {
      const allKeys = new Set<string>();
      submissions.forEach((submission: FormSubmission) => {
        Object.keys(submission.data).forEach(key => allKeys.add(key));
      });

      // Create columns array with labels
      const columnsWithLabels = [
        { key: 'submittedAt', label: 'Submitted At' },
        ...Array.from(allKeys).map(key => ({
          key,
          label: fieldLabelMap.get(key) || key // Use label if available, fallback to key
        }))
      ];
      setColumns(columnsWithLabels);
    }
  }, [submissions, form]);

  const handleExportToExcel = () => {
    try {
      if (!form) {
        throw new Error('Form data is not loaded yet. Please refresh the page and try again.');
      }

      if (!submissions || submissions.length === 0) {
        throw new Error('No submissions available to export');
      }

      // Use default name if formName is missing
      const formName = form.formName || `Form_${formId?.slice(0, 8) || 'Unknown'}`;
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const sanitizedFormName = formName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${sanitizedFormName}_responses_${timestamp}.xlsx`;

      // Prepare data for Excel
      const excelData = submissions.map((submission: FormSubmission) => {
        const row: Record<string, any> = {
          'Submitted At': format(new Date(submission.submittedAt), 'MMM d, yyyy h:mm a')
        };
        
        // Add all form fields with their labels
        columns.slice(1).forEach(column => {
          const value = submission.data[column.key];
          // Handle different types of values
          if (Array.isArray(value)) {
            row[column.label] = value.join(', ');
          } else if (value === null || value === undefined) {
            row[column.label] = '-';
          } else {
            row[column.label] = String(value);
          }
        });
        
        return row;
      });

      // Create worksheet with headers
      const worksheet = XLSXUtils.json_to_sheet(excelData, {
        header: columns.map(col => col.label),
        skipHeader: false
      });

      // Set column widths based on content
      const columnWidths = columns.map(col => {
        const maxContentLength = Math.max(
          col.label.length,
          ...excelData.map((row: Record<string, string>) => String(row[col.label] || '').length)
        );
        return { wch: Math.min(Math.max(maxContentLength, 15), 50) }; // Min 15, max 50 characters
      });
      worksheet['!cols'] = columnWidths;

      // Create workbook
      const workbook = XLSXUtils.book_new();
      XLSXUtils.book_append_sheet(workbook, worksheet, 'Responses');

      // Generate Excel file
      const excelBuffer = XLSXWrite(workbook, { 
        bookType: 'xlsx', 
        type: 'binary',
        bookSST: false
      });

      // Convert to blob and trigger download
      const blob = new Blob([s2ab(excelBuffer)], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert(error instanceof Error ? error.message : 'Failed to export to Excel. Please try again.');
    }
  };

  // Helper function to convert string to ArrayBuffer
  const s2ab = (s: string): ArrayBuffer => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {form?.formName || `Form ${formId?.slice(0, 8)}`} - Responses
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {submissions?.length || 0} {submissions?.length === 1 ? 'response' : 'responses'} received
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportToExcel}
                disabled={submissions.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export to Excel
              </button>
              <Link
                to={`/form/${formId}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                View Form
              </Link>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No responses yet</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                This form hasn't received any submissions yet
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {submissions.map((submission: FormSubmission) => (
                      <tr key={submission._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(submission.submittedAt), 'MMM d, yyyy h:mm a')}
                        </td>
                        {columns.slice(1).map((column) => (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {String(submission.data[column.key] || '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 