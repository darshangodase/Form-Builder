import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams, useNavigate } from "@remix-run/react";
import FormBuilder from "~/components/builder/FormBuilder";
import Navbar from "~/components/Navbar";
import fs from "fs/promises";
import path from "path";
import { useAppSelector } from "~/hooks";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Form Builder" },
    { name: "description", content: "Build beautiful forms with our drag-and-drop form builder" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const templateId = url.searchParams.get("template");

  if (!templateId) {
    return json({ template: null });
  }

  try {
    const templatePath = path.join(process.cwd(), "app", "templates", `${templateId}.json`);
    const templateContent = await fs.readFile(templatePath, "utf-8");
    const template = JSON.parse(templateContent);
    return json({ template });
  } catch (error) {
    console.error("Error loading template:", error);
    return json({ template: null });
  }
}

export default function Builder() {
  const { template } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template");
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <div className="pt-16">
        <FormBuilder initialTemplate={template} templateId={templateId} />
      </div>
    </div>
  );
} 