"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, type Variants } from "framer-motion";
import { updateTicketStatus } from "@/actions/ticketActions";

export type Ticket = {
  id: string;
  title: string;
  status: string;
  priority: string;
  date?: string;
  reportedDate?: string;
  description: string;
  websiteId?: number;
  websiteName?: string;
  clientName?: string;
};

type KanbanBoardProps = {
  initialData: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
  showToast?: (message: string, type: "success" | "error") => void;
};

const COLUMNS = ["Open", "In Progress", "Closed"];

// Varian animasi untuk kemunculan kolom secara bertahap (Stagger)
const boardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const columnVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function KanbanBoard({
  initialData,
  onTicketClick,
  showToast,
}: KanbanBoardProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialData);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  // Sinkronisasi data real-time jika prop parent diperbarui
  useEffect(() => {
    setTickets(initialData);
  }, [initialData]);

  // Sensor Pointer dengan batas 6px agar klik kartu tidak terganggu oleh gesture drag
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = tickets.find((t) => t.id === active.id);
    if (found) setActiveTicket(found);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTicket = active.data.current?.type === "Ticket";
    const isOverTicket = over.data.current?.type === "Ticket";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTicket) return;

    // Dragging over another ticket
    if (isOverTicket) {
      setTickets((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);
        if (activeIndex === -1 || overIndex === -1) return prev;

        // Pindah ke kolom yang berbeda
        if (prev[activeIndex].status !== prev[overIndex].status) {
          const updated = [...prev];
          updated[activeIndex] = {
            ...updated[activeIndex],
            status: prev[overIndex].status,
          };
          return arrayMove(updated, activeIndex, overIndex);
        }

        // Pindah dalam kolom yang sama
        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    // Dragging over an empty column area
    if (isOverColumn) {
      setTickets((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        if (activeIndex === -1) return prev;

        const updated = [...prev];
        if (updated[activeIndex].status !== overId) {
          updated[activeIndex] = {
            ...updated[activeIndex],
            status: overId as string,
          };
          return arrayMove(updated, activeIndex, activeIndex);
        }
        return prev;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTicket(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const targetTicket = tickets.find((t) => t.id === activeId);
    if (!targetTicket) return;

    const isOverColumn = over.data.current?.type === "Column";
    const isOverTicket = over.data.current?.type === "Ticket";

    let destinationStatus = targetTicket.status;
    if (isOverColumn) destinationStatus = overId;
    if (isOverTicket) {
      const overTicketObj = tickets.find((t) => t.id === overId);
      if (overTicketObj) destinationStatus = overTicketObj.status;
    }

    // Cari status tiket lama dari initialData/snapshots
    const initialTicketObj = initialData.find((t) => t.id === activeId);
    const originalStatus = initialTicketObj?.status || targetTicket.status;

    // Jika status benar-benar berubah, kirim ke server
    if (originalStatus !== destinationStatus) {
      const displayStatus =
        destinationStatus === "In Progress"
          ? "Fixing"
          : destinationStatus === "Closed"
          ? "Resolved"
          : "Open";

      const res = await updateTicketStatus(activeId, destinationStatus);

      if (res.success) {
        if (showToast) {
          showToast(`Tiket berhasil dipindah ke status ${displayStatus}`, "success");
        }
      } else {
        // Rollback ke status asli jika server gagal
        setTickets((prev) =>
          prev.map((t) => (t.id === activeId ? { ...t, status: originalStatus } : t))
        );
        if (showToast) {
          showToast(res.message || "Gagal memperbarui status tiket di server.", "error");
        }
      }
    }
  };

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.4" } },
    }),
  };

  return (
    <DndContext
      id="kanban-board-sulo"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        variants={boardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {COLUMNS.map((col) => (
          <motion.div key={col} variants={columnVariants}>
            <Column
              title={col}
              tickets={tickets.filter((t) => t.status === col)}
              onTicketClick={onTicketClick}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Visual Overlay saat elemen di-drag */}
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeTicket ? <TicketCard ticket={activeTicket} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// ==========================================
// KOMPONEN KOLOM KANBAN
// ==========================================

function Column({
  title,
  tickets,
  onTicketClick,
}: {
  title: string;
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
}) {
  const { setNodeRef } = useSortable({
    id: title,
    data: { type: "Column" },
  });

  const displayTitle =
    title === "In Progress" ? "Fixing" : title === "Closed" ? "Resolved" : title;

  return (
    <div className="flex flex-col bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 min-h-[520px] shadow-sm">
      {/* Header Kolom */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              title === "Open"
                ? "bg-[#FC7A0B] shadow-[0_0_10px_rgba(252,122,11,0.6)]"
                : title === "In Progress"
                ? "bg-[#011D58] dark:bg-[#FF9F03] shadow-[0_0_10px_rgba(255,159,3,0.6)]"
                : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
            }`}
          />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {displayTitle}
          </h3>
        </div>
        <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {tickets.length}
        </span>
      </div>

      {/* Area Drop Zone Kolom */}
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-3.5 relative rounded-2xl transition-colors"
      >
        <SortableContext
          items={tickets.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tickets.map((ticket) => (
            <SortableTicket
              key={ticket.id}
              ticket={ticket}
              onTicketClick={onTicketClick}
            />
          ))}
        </SortableContext>

        {/* Empty State jika kolom tidak berisi tiket */}
        {tickets.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white/40 dark:bg-slate-950/20 text-slate-400 dark:text-slate-500 p-6 text-center">
            <svg
              className="w-8 h-8 mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-wider">
              Drop Tiket Di Sini
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// KOMPONEN SORTABLE TICKET
// ==========================================

function SortableTicket({
  ticket,
  onTicketClick,
}: {
  ticket: Ticket;
  onTicketClick?: (ticket: Ticket) => void;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({
      id: ticket.id,
      data: { type: "Ticket", ticket },
    });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 100 : "auto",
    opacity: isDragging ? 0.3 : 1,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[140px] bg-[#FC7A0B]/10 border-2 border-[#FC7A0B]/40 border-dashed rounded-2xl"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TicketCard ticket={ticket} onTicketClick={onTicketClick} />
    </div>
  );
}

// ==========================================
// KOMPONEN VISUAL KARTU TIKET
// ==========================================

function TicketCard({
  ticket,
  isOverlay,
  onTicketClick,
}: {
  ticket: Ticket;
  isOverlay?: boolean;
  onTicketClick?: (ticket: Ticket) => void;
}) {
  const priorityColors: Record<string, string> = {
    High: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
    Medium:
      "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    Low: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  };

  return (
    <div
      onClick={() => onTicketClick?.(ticket)}
      className={`relative p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm cursor-grab active:cursor-grabbing hover:border-[#FC7A0B]/50 dark:hover:border-[#FC7A0B]/50 hover:shadow-md transition-all group ${
        isOverlay
          ? "rotate-3 scale-105 shadow-2xl ring-2 ring-[#FC7A0B] cursor-grabbing bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
          : ""
      }`}
    >
      {/* Indikator Grip Handle (6 Dots) yang Muncul Saat Hover */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 dark:text-slate-600">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        </svg>
      </div>

      {/* Priority Badge & Date */}
      <div className="flex justify-between items-center mb-3 pr-5">
        <span
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
            priorityColors[ticket.priority] || priorityColors["Low"]
          }`}
        >
          {ticket.priority === "High" && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          )}
          {ticket.priority}
        </span>
        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
          {ticket.reportedDate || ticket.date || "-"}
        </span>
      </div>

      {/* Judul Tiket */}
      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug mb-4 line-clamp-2">
        {ticket.title}
      </p>

      {/* Footer Proyek Terkait */}
      <div className="flex items-center gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#011D58] to-[#FC7A0B] flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0">
          {ticket.clientName ? ticket.clientName.charAt(0).toUpperCase() : "IN"}
        </div>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
          {ticket.websiteName || "Proyek Internal"}
        </span>
      </div>
    </div>
  );
}