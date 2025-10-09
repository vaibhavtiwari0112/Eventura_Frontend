import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function DarkModeToggle() {
  const getAutoDark = () => {
    const hour = new Date().getHours();
    return hour >= 19 || hour < 7; // Dark from 7PM–7AM
  };

  const [dark, setDark] = useState(getAutoDark);

  // Apply theme on change
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  useEffect(() => {
    const interval = setInterval(() => {
      const shouldBeDark = getAutoDark();
      setDark((prev) => (prev !== shouldBeDark ? shouldBeDark : prev));
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-full border transition-all 
                 text-gray-700 dark:text-yellow-300 
                 hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
