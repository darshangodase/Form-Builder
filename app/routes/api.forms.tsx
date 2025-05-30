import { json, type ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.json();
    
    const response = await fetch('http://localhost:5000/api/forms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // Forward cookies for authentication
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return json(data, { status: response.status });
    }

    return json(data, { status: response.status });
  } catch (error) {
    console.error('Form creation error:', error);
    return json(
      { 
        success: false, 
        message: 'An error occurred while creating the form',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
} 