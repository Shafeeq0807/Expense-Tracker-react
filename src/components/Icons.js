// src/components/Icons.js
// Small inline SVG icons (stroke uses currentColor so they follow the theme)
import React from "react";

const Icon = ({ children, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const GridIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
  </Icon>
);

export const ListIcon = (p) => (
  <Icon {...p}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="3.5" cy="6" r="1" />
    <circle cx="3.5" cy="12" r="1" />
    <circle cx="3.5" cy="18" r="1" />
  </Icon>
);

export const ChartIcon = (p) => (
  <Icon {...p}>
    <path d="M3 3v18h18" />
    <path d="M7 15l4-4 3 3 5-6" />
  </Icon>
);

export const PlusIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Icon>
);

export const SunIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);

export const MoonIcon = (p) => (
  <Icon {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Icon>
);

export const LogoutIcon = (p) => (
  <Icon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </Icon>
);

export const MenuIcon = (p) => (
  <Icon {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
);

export const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Icon>
);

export const EditIcon = (p) => (
  <Icon {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Icon>
);

export const TrashIcon = (p) => (
  <Icon {...p}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </Icon>
);

export const DownloadIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </Icon>
);

export const ArrowUpRightIcon = (p) => (
  <Icon {...p}>
    <path d="M7 17L17 7M8 7h9v9" />
  </Icon>
);

export const ArrowDownRightIcon = (p) => (
  <Icon {...p}>
    <path d="M7 7l10 10M17 8v9H8" />
  </Icon>
);

// Five-petal flower used as a soft decoration, like the reference design
export const Flower = ({ className, color = "currentColor" }) => (
  <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
    {[0, 72, 144, 216, 288].map((r) => (
      <ellipse key={r} cx="50" cy="27" rx="15" ry="25" fill={color} transform={`rotate(${r} 50 50)`} />
    ))}
    <circle cx="50" cy="50" r="7" fill={color} opacity="0.6" />
  </svg>
);
