import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  order: number;
  createdAt: number;
}

interface TaskCardProps {
  task: Task;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function TaskCard({ task, onDragStart, onDragEnd }: TaskCardProps) {
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [isDragging, setIsDragging] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    await updateTask({
      id: task._id,
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("DELETE THIS TASK?")) {
      await removeTask({ id: task._id });
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
    onDragStart();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  if (isEditing) {
    return (
      <div className="border-4 border-black bg-[#ffff00] p-3 space-y-3">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full border-4 border-black p-2 font-mono text-sm focus:outline-none"
          autoFocus
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="DESCRIPTION (OPTIONAL)"
          className="w-full border-4 border-black p-2 font-mono text-xs resize-none h-20 focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-black text-white border-4 border-black p-2 font-mono text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
          >
            SAVE
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditTitle(task.title);
              setEditDescription(task.description || "");
            }}
            className="border-4 border-black p-2 font-mono text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group border-4 border-black bg-white p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 ${
        isDragging ? "opacity-50 rotate-2 scale-105" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-mono text-sm font-bold uppercase tracking-tight break-words">
            {task.title}
          </div>
          {task.description && (
            <div className="font-mono text-xs text-black/60 mt-2 break-words">
              {task.description}
            </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="w-6 h-6 border-2 border-black flex items-center justify-center font-mono text-xs hover:bg-[#ffff00] transition-colors"
          >
            E
          </button>
          <button
            onClick={handleDelete}
            className="w-6 h-6 border-2 border-black flex items-center justify-center font-mono text-xs hover:bg-[#ff3333] hover:text-white hover:border-[#ff3333] transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Drag Handle Visual */}
      <div className="mt-3 flex justify-center opacity-30 group-hover:opacity-60 transition-opacity">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-black"></div>
          <div className="w-1 h-1 bg-black"></div>
          <div className="w-1 h-1 bg-black"></div>
        </div>
      </div>
    </div>
  );
}
