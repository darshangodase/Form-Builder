import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { motion } from "framer-motion";
import fs from "fs/promises";
import path from "path";
import Navbar from "~/components/Navbar";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useAppSelector } from "~/hooks";
import { useEffect } from "react";

interface Template {
  id: string;
  name: string;
  description: string;
  settings: {
    title: string;
    description: string;
  };
}

export async function loader() {
  const templatesDir = path.join(process.cwd(), "app", "templates");
  const files = await fs.readdir(templatesDir);
  
  const templates = await Promise.all(
    files
      .filter(file => file.endsWith(".json"))
      .map(async (file) => {
        const content = await fs.readFile(path.join(templatesDir, file), "utf-8");
        const template = JSON.parse(content);
        return {
          id: file.replace(".json", ""),
          name: template.settings.title,
          description: template.settings.description,
          settings: template.settings
        };
      })
  );

  return json({ templates });
}

export default function Templates() {
  const { templates } = useLoaderData<typeof loader>();
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
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Form Templates
            </h1>
            <p className="mt-3 text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
              Choose a template to get started or create your own form from scratch
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/builder"
              className="relative block p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors group"
            >
              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                  <PlusIcon />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Create New Form
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Start from scratch with a blank form
                </p>
              </div>
            </Link>

            {templates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                className="relative block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
              >
                <Link to={`/builder?template=${template.id}`} className="block">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {template.description}
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      Use Template
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 