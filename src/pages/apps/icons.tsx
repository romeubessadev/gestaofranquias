import type { SVGProps } from "react";

/**
 * Small inline stroke-icon set for the Apps domain (no icon package is
 * installed in this project). Each icon is a plain 24x24 SVG following the
 * same visual language as the rest of the design system (stroke=currentColor,
 * round caps/joins), mirroring the icon set used in the original prototype.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 18, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
);

export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const PhoneIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9z" />
  </Base>
);

export const VideoIcon = (p: IconProps) => (
  <Base {...p}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </Base>
);

export const MoreIcon = (p: IconProps) => (
  <Base {...p} fill="currentColor" stroke="none">
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </Base>
);

export const SendIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
  </Base>
);

export const PaperclipIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.07a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </Base>
);

export const SmileIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
  </Base>
);

export const MailIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" />
  </Base>
);

export const BackIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </Base>
);

export const FolderIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Base>
);

export const UploadIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </Base>
);

export const DownloadIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Base>
);

export const TrashIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
  </Base>
);

export const FileTextIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </Base>
);

export const ImageIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </Base>
);

export const VideoFileIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <polygon points="10 12 15 15 10 18 10 12" />
  </Base>
);

export const SheetIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="9" x2="9" y2="21" />
    <line x1="15" y1="9" x2="15" y2="21" />
  </Base>
);

export const ArchiveIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </Base>
);

export const CodeIcon = (p: IconProps) => (
  <Base {...p}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </Base>
);

export const BoldIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" />
  </Base>
);

export const ItalicIcon = (p: IconProps) => (
  <Base {...p}>
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </Base>
);

export const ListIcon = (p: IconProps) => (
  <Base {...p}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </Base>
);

export const LinkIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Base>
);

export const FilterIcon = (p: IconProps) => (
  <Base {...p}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Base>
);

export const TicketIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M2 9a3 3 0 1 0 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 1 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
  </Base>
);

export const AlarmIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2M5 3 2 6M22 6l-3-3" />
  </Base>
);

export const AlertIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Base>
);

export const StarIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Base {...p} fill={filled ? "var(--warn)" : "none"} stroke={filled ? "var(--warn)" : "currentColor"}>
    <path d="M12 2 15 9l7 .5-5.5 4.5 2 7-6.5-4-6.5 4 2-7L2 9.5 9 9z" />
  </Base>
);

export const InboxIcon = (p: IconProps) => (
  <Base {...p}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </Base>
);

export const SendFolderIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
  </Base>
);

export const DraftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
  </Base>
);

export const SpamIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="4.9" y1="4.9" x2="19.1" y2="19.1" />
  </Base>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m15 18-6-6 6-6" />
  </Base>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 18 6-6-6-6" />
  </Base>
);

export const HashIcon = (p: IconProps) => (
  <Base {...p}>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </Base>
);

export const UsersIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
  </Base>
);

export const MapPinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Base>
);

export const BuildingIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="2" width="16" height="20" rx="1" />
    <line x1="9" y1="7" x2="9" y2="7.01" />
    <line x1="15" y1="7" x2="15" y2="7.01" />
    <line x1="9" y1="12" x2="9" y2="12.01" />
    <line x1="15" y1="12" x2="15" y2="12.01" />
    <line x1="9" y1="17" x2="9" y2="17.01" />
    <line x1="15" y1="17" x2="15" y2="17.01" />
  </Base>
);

export function fileIcon(fileType: string, size = 17) {
  switch (fileType) {
    case "pdf":
      return <FileTextIcon size={size} />;
    case "image":
      return <ImageIcon size={size} />;
    case "video":
      return <VideoFileIcon size={size} />;
    case "sheet":
      return <SheetIcon size={size} />;
    case "archive":
      return <ArchiveIcon size={size} />;
    case "code":
      return <CodeIcon size={size} />;
    case "figma":
      return <ImageIcon size={size} />;
    case "doc":
    default:
      return <FileTextIcon size={size} />;
  }
}
