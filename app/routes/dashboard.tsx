import { useEffect, useState } from 'react';
import { useAppSelector } from '~/hooks';
import { Link } from '@remix-run/react';
import { format } from 'date-fns';
import Navbar from '~/components/Navbar';
import { useNavigate } from '@remix-run/react';

const API_BASE_URL = 'http://localhost:5000/api';

interface Form {
  formId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  submissions: FormSubmission[];
}

interface FormSubmission {
  _id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
}

export default function Dashboard() {
  const { user } = useAppSelector(state => state.auth);
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      if (!user?.id) {
        navigate('/auth/login');
        setError('Please log in to view your forms');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        // Fetch forms created by the user
        const formsResponse = await fetch(`${API_BASE_URL}/forms/user/${user.id}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        const formsData = await formsResponse.json();
        
        if (!formsResponse.ok) {
          throw new Error(formsData.message || 'Failed to fetch forms');
        }

        if (!formsData.success) {
          throw new Error(formsData.message || 'Failed to fetch forms');
        }
        
        // For each form, fetch its submissions
        const formsWithSubmissions = await Promise.all(
          formsData.forms.map(async (form: Form) => {
            try {
              const submissionsResponse = await fetch(`${API_BASE_URL}/forms/${form.formId}/submissions`, {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                }
              });
              const submissionsData = await submissionsResponse.json();
              
              if (!submissionsResponse.ok || !submissionsData.success) {
                console.warn(`Failed to fetch submissions for form ${form.formId}:`, submissionsData.message);
                return {
                  ...form,
                  submissions: []
                };
              }

              return {
                ...form,
                submissions: submissionsData.submissions || []
              };
            } catch (submissionError) {
              console.warn(`Error fetching submissions for form ${form.formId}:`, submissionError);
              return {
                ...form,
                submissions: []
              };
            }
          })
        );
        
        setForms(formsWithSubmissions);
        setError(null);
      } catch (err) {
        console.error('Error fetching forms:', err);
        setError(err instanceof Error ? err.message : 'Failed to load forms. Please try again.');
        setForms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForms();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Forms</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              View and manage your forms and their submissions
            </p>
          </div>

          {forms.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No forms yet</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Get started by creating a new form
              </p>
              <div className="mt-6">
                <Link
                  to="/builder"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create New Form
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {forms.map((form) => (
                <div
                  key={form.formId}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                            {form.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {form.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {form.submissions.length} responses
                        </span>
                        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Created {format(new Date(form.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/form/${form.formId}`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          View Form
                        </Link>
                        <Link
                          to={`/response/${form.formId}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                          View Responses
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
