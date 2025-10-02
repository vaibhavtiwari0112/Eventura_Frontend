import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="px-3 py-1 rounded-full border text-sm font-medium 
                 text-navy-700 dark:text-white 
                 hover:bg-navy-100 dark:hover:bg-navy-800"
    >
      {dark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
