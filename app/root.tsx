import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect, useState } from "react";

import "./tailwind.css";

export const meta: MetaFunction = () => {
  return [
    { charSet: "utf-8" },
    { viewport: "width=device-width, initial-scale=1" },
    { title: "FormBuilder - Create Beautiful Forms" },
    { name: "description", content: "Create stunning, responsive forms with our drag-and-drop builder. No coding required." },
  ];
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: "./tailwind.css" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <ThemeProvider>
          <Provider store={store}>
            {isClient ? (
              <PersistGate loading={null} persistor={persistor}>
                {children}
              </PersistGate>
            ) : (
              children
            )}
          </Provider>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
