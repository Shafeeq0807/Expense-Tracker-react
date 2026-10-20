// src/chartTheme.js
// Chart.js can't read CSS variables, so the chart colours for each theme live here
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip, Legend);
ChartJS.defaults.font.family = "'Poppins', system-ui, sans-serif";

const THEMES = {
  light: {
    teal: "#5f9e92",
    tealFill: "rgba(95, 158, 146, 0.18)",
    peach: "#de9467",
    butter: "#2b2f2e",
    grid: "rgba(120, 130, 128, 0.14)",
    text: "#8a9491",
    faint: "#dfe7e5",
    surface: "#ffffff",
  },
  dark: {
    teal: "#7cc0b2",
    tealFill: "rgba(124, 192, 178, 0.18)",
    peach: "#eea57a",
    butter: "#e8e6c8",
    grid: "rgba(160, 180, 176, 0.12)",
    text: "#8fa19d",
    faint: "#2a3836",
    surface: "#172120",
  },
};

export const chartColors = (theme) => THEMES[theme] || THEMES.light;
