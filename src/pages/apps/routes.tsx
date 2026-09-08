import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const Chat = lazyPage(() => import("./Chat"), "Chat");
const Contacts = lazyPage(() => import("./Contacts"), "Contacts");
const ContactDetail = lazyPage(() => import("./ContactDetail"), "ContactDetail");
const FileManager = lazyPage(() => import("./FileManager"), "FileManager");
const Notes = lazyPage(() => import("./Notes"), "Notes");
const TaskManager = lazyPage(() => import("./TaskManager"), "TaskManager");
const HelpDesk = lazyPage(() => import("./HelpDesk"), "HelpDesk");
const TicketDetail = lazyPage(() => import("./TicketDetail"), "TicketDetail");
const GroupChat = lazyPage(() => import("./GroupChat"), "GroupChat");
const SupportTickets = lazyPage(() => import("./SupportTickets"), "SupportTickets");
const Email = lazyPage(() => import("./Email"), "Email");
const Calendar = lazyPage(() => import("./Calendar"), "Calendar");

export const appsRoutes: RouteObject[] = [
  { path: paths.apps.chat, element: <Chat /> },
  { path: paths.apps.contacts, element: <Contacts /> },
  { path: paths.apps.contactDetail(), element: <ContactDetail /> },
  { path: paths.apps.fileManager, element: <FileManager /> },
  { path: paths.apps.notes, element: <Notes /> },
  { path: paths.apps.taskManager, element: <TaskManager /> },
  { path: paths.apps.helpDesk, element: <HelpDesk /> },
  { path: paths.apps.ticketDetail(), element: <TicketDetail /> },
  { path: paths.apps.groupChat, element: <GroupChat /> },
  { path: paths.apps.supportTickets, element: <SupportTickets /> },
  { path: paths.apps.email, element: <Email /> },
  { path: paths.apps.calendar, element: <Calendar /> },
];
