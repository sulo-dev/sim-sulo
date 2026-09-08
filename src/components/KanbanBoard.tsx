"use client";

import { useState } from "react";
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
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { initialTickets, type Ticket } from "@/lib/mockData"; // Tambahkan ini

const COLUMNS = ["Open", "Fixing", "Resolved"];

export default function KanbanBoard() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

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

    // Pindah tiket di atas tiket lain (Beda kolom)
    if (isActiveTicket && isOverTicket) {
      setTickets((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);
        if (prev[activeIndex].status !== prev[overIndex].status) {
          const newTickets = [...prev];
          newTickets[activeIndex].status = newTickets[overIndex].status;
          return arrayMove(newTickets, activeIndex, overIndex - 1);
        }
        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    // Pindah tiket ke kolom kosong
    if (isActiveTicket && isOverColumn) {
      setTickets((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const newTickets = [...prev];
        newTickets[activeIndex].status = overId as string;
        return arrayMove(newTickets, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTicket(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    setTickets((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      const overIndex = prev.findIndex((t) => t.id === overId);
      return arrayMove(prev, activeIndex, overIndex);
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => (
          <Column key={col} title={col} tickets={tickets.filter((t) => t.status === col)} />
        ))}
      </div>
      <DragOverlay>
        {activeTicket ? <TicketCard ticket={activeTicket} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// --- SUB-KOMPONEN KOLOM ---
function Column({ title, tickets }: { title: string; tickets: Ticket[] }) {
  const { setNodeRef } = useSortable({
    id: title,
    data: { type: "Column" },
  });

  return (
    <div className="flex flex-col bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 min-h-[400px]">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{title}</h3>
        <span className="bg-slate-800 text-slate-400 text-xs font-semibold px-2 py-1 rounded-full">{tickets.length}</span>
      </div>
      <div ref={setNodeRef} className="flex-1 flex flex-col gap-3">
        <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map((ticket) => (
            <SortableTicket key={ticket.id} ticket={ticket} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// --- SUB-KOMPONEN KARTU TIKET (SORTABLE) ---
function SortableTicket({ ticket }: { ticket: Ticket }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    data: { type: "Ticket", ticket },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="h-28 bg-indigo-500/10 border-2 border-indigo-500/50 border-dashed rounded-xl" />;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TicketCard ticket={ticket} />
    </div>
  );
}

// --- SUB-KOMPONEN DESAIN KARTU VISUAL ---
function TicketCard({ ticket, isOverlay }: { ticket: Ticket; isOverlay?: boolean }) {
  const priorityColors: Record<string, string> = {
    High: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <div className={`p-4 bg-slate-900 border border-slate-700/80 rounded-xl shadow-lg cursor-grab active:cursor-grabbing hover:border-slate-600 transition-colors ${isOverlay ? "rotate-2 scale-105 shadow-2xl" : ""}`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColors[ticket.priority]}`}>
          {ticket.priority}
        </span>
        <span className="text-[10px] text-slate-500">{ticket.date}</span>
      </div>
      <p className="text-sm font-medium text-slate-200 leading-snug">{ticket.title}</p>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">AD</div>
        <span className="text-xs text-slate-400">Admin_SULO</span>
      </div>
    </div>
  );
}