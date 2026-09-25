"use client";

import { useState, useEffect } from "react";
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor,
  PointerSensor, useSensor, useSensors, DragStartEvent,
  DragOverEvent, DragEndEvent, defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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

// Varian animasi untuk kemunculan kolom secara bertahap
const boardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const columnVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function KanbanBoard({ initialData, onTicketClick, showToast }: KanbanBoardProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialData);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  // Sinkronisasi data real-time dari database/parent
  useEffect(() => {
    setTickets(initialData);
  }, [initialData]);

  // PointerSensor dengan distance 5px agar fungsi onClick() pada kartu tetap berjalan normal
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticket = tickets.find((t) => t.id === active.id);
    if (ticket) setActiveTicket(ticket);
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

    if (isActiveTicket && isOverTicket) {
      setTickets((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);
        
        // Pindah beda kolom (hover ke tiket lain)
        if (prev[activeIndex].status !== prev[overIndex].status) {
          const newTickets = [...prev];
          newTickets[activeIndex].status = newTickets[overIndex].status;
          return arrayMove(newTickets, activeIndex, overIndex - 1);
        }
        // Pindah dalam satu kolom
        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    // Drop ke area kosong dalam kolom
    if (isActiveTicket && isOverColumn) {
      setTickets((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const newTickets = [...prev];
        newTickets[activeIndex].status = overId as string;
        return arrayMove(newTickets, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTicket(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Simpan snapshot untuk ROLLBACK jika API gagal
    const previousTicketsSnapshot = [...tickets];
    
    const movedTicket = tickets.find(t => t.id === activeId);
    const isOverColumn = over.data.current?.type === "Column";
    const isOverTicket = over.data.current?.type === "Ticket";
    let newStatus = movedTicket?.status;

    if (isOverColumn) newStatus = overId;
    if (isOverTicket) {
      const targetTicket = tickets.find(t => t.id === overId);
      if (targetTicket) newStatus = targetTicket.status;
    }

    // 1. UPDATE UI LOKAL (Optimistic Update)
    setTickets((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      const overIndex = prev.findIndex((t) => t.id === overId);
      return arrayMove(prev, activeIndex, overIndex !== -1 ? overIndex : activeIndex);
    });

    // 2. UPDATE KE DATABASE
    if (movedTicket && newStatus && movedTicket.status !== newStatus) {
      const res = await updateTicketStatus(activeId, newStatus);
      
      if (res.success) {
        if (showToast) {
          const displayStatus = newStatus === 'In Progress' ? 'Fixing' : newStatus === 'Closed' ? 'Resolved' : 'Open';
          showToast(`Tiket berhasil dipindah ke ${displayStatus}`, "success");
        }
      } else {
        // ROLLBACK UI jika server gagal
        setTickets(previousTicketsSnapshot);
        if (showToast) {
          showToast("Gagal memindahkan tiket: " + res.message, "error");
        } else {
          alert("Gagal memindahkan tiket: " + res.message);
        }
      }
    }
  };

  // Konfigurasi animasi saat elemen di-drop ke tempatnya
  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
  };

  return (
    <DndContext 
      id="kanban-board"
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart} 
      onDragOver={handleDragOver} 
      onDragEnd={handleDragEnd}
    >
      <motion.div variants={boardVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeTicket ? <TicketCard ticket={activeTicket} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// ---------------- Komponen Kolom Kanban ----------------

function Column({ title, tickets, onTicketClick }: { title: string; tickets: Ticket[]; onTicketClick?: (ticket: Ticket) => void; }) {
  const { setNodeRef } = useSortable({ id: title, data: { type: "Column" } });
  
  // Penyesuaian nama kolom UI vs Database
  const displayTitle = title === "In Progress" ? "Fixing" : title === "Closed" ? "Resolved" : title;

  return (
    <div className="flex flex-col bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 min-h-[500px] shadow-sm">
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2.5">
          {/* Indikator Warna Kolom */}
          <span className={`w-2.5 h-2.5 rounded-full ${
            title === 'Open' ? 'bg-[#FC7A0B] shadow-[0_0_8px_rgba(252,122,11,0.5)]' : 
            title === 'In Progress' ? 'bg-[#011D58] dark:bg-[#FF9F03] shadow-[0_0_8px_rgba(255,159,3,0.5)]' : 
            'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
          }`}></span>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">{displayTitle}</h3>
        </div>
        <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {tickets.length}
        </span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 flex flex-col gap-3.5 relative rounded-2xl transition-colors">
        <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map((ticket) => (
            <SortableTicket key={ticket.id} ticket={ticket} onTicketClick={onTicketClick} />
          ))}
        </SortableContext>

        {/* Empty State / Dropzone Placeholder jika kolom kosong */}
        {tickets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white/30 dark:bg-slate-950/20 text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-widest">
            Drop Tiket Di Sini
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- Komponen Sortable Element ----------------

function SortableTicket({ ticket, onTicketClick }: { ticket: Ticket; onTicketClick?: (ticket: Ticket) => void; }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: ticket.id, data: { type: "Ticket", ticket },
  });

  const style = { 
    transition, 
    transform: CSS.Transform.toString(transform),
    // Menaikkan z-index saat drag agar tidak tertimpa elemen lain
    zIndex: isDragging ? 100 : "auto", 
    opacity: isDragging ? 0.3 : 1
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

// ---------------- Komponen Visual Kartu Tiket ----------------

function TicketCard({ ticket, isOverlay, onTicketClick }: { ticket: Ticket; isOverlay?: boolean; onTicketClick?: (ticket: Ticket) => void; }) {
  const priorityColors: Record<string, string> = {
    High: "bg-[#FA4D09]/10 text-[#FA4D09] border-[#FA4D09]/20",
    Medium: "bg-[#FF9F03]/10 text-[#FC7A0B] border-[#FF9F03]/20",
    Low: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  };

  return (
    <div 
      onClick={() => onTicketClick?.(ticket)} 
      className={`relative p-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm cursor-grab active:cursor-grabbing hover:border-[#FC7A0B]/50 dark:hover:border-[#FC7A0B]/50 hover:shadow-md transition-all group ${
        isOverlay ? "rotate-3 scale-105 shadow-2xl ring-2 ring-[#FC7A0B] ring-opacity-60 cursor-grabbing bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm" : ""
      }`}
    >
      {/* Indikator Grip Handle (6 dots) yang muncul saat di-hover */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 dark:text-slate-600">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
      </div>

      <div className="flex justify-between items-start mb-3.5 pr-6">
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${priorityColors[ticket.priority]}`}>
          {ticket.priority === 'High' && <span className="w-1.5 h-1.5 rounded-full bg-[#FA4D09] animate-pulse"></span>}
          {ticket.priority}
        </span>
        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">{ticket.reportedDate || ticket.date}</span>
      </div>
      
      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug mb-5">
        {ticket.title}
      </p>
      
      <div className="flex items-center gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#011D58] to-[#FC7A0B] flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0">
          {ticket.clientName ? ticket.clientName.charAt(0).toUpperCase() : "IN"}
        </div>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
          {ticket.websiteName || "Internal Project"}
        </span>
      </div>
    </div>
  );
}