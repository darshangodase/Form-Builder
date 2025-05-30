import { useEffect, useState } from "react";

export default function dynamic(importFn: () => Promise<any>) {
  return function DynamicComponent(props: any) {
    const [Component, setComponent] = useState<any>(null);

    useEffect(() => {
      importFn().then((module) => {
        setComponent(() => module.default);
      });
    }, []);

    if (!Component) return null;
    return <Component {...props} />;
  };
} 