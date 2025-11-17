import {
  Dashboard,
  People,
  Chat,
  BarChart,
  Person,
  ConnectWithoutContact,
} from "@mui/icons-material";

// App-wide constants
export const APP_NAME = "HealthTrack";
export const APP_TITLE = "Hospital Management System";

/**
 * Application configuration
 * Centralized configuration for menu items, routes, and other app settings
 */

export const MENU_ITEMS = [
  { text: "Dashboard", icon: Dashboard, path: "/dashboard" },
  {
    text: "Doctors",
    icon: People,
    path: "/doctors",
    roles: ["admin", "doctor"],
  },
  {
    text: "Patients",
    icon: Person,
    path: "/patients",
    roles: ["admin", "doctor"],
  },
  {
    text: "Charts",
    icon: BarChart,
    path: "/charts",
    patientLabel: "My Data", // Custom label for patients
  },
  { text: "Connections", icon: ConnectWithoutContact, path: "/connections" },
  { text: "Chat", icon: Chat, path: "/chat" },
];

// Layout constants
export const DRAWER_WIDTH = 240;
