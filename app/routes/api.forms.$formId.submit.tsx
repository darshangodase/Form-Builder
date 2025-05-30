import { json, type ActionFunctionArgs } from "@remix-run/node";

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const formId = params.formId;
    if (!formId) {
      return json({ success: false, message: "Form ID is required" }, { status: 400 });
    }

    const formData = await request.json();
    
    const response = await fetch(`http://localhost:5000/api/forms/${formId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return json(data, { status: response.status });
    }

    return json(data, { status: response.status });
  } catch (error) {
    console.error('Form submission error:', error);
    return json(
      { 
        success: false, 
        message: 'An error occurred while submitting the form',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
} 