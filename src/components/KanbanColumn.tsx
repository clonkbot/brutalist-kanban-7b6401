import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { TaskCard } from "./TaskCard";

interface Column {
  _id: Id<"columns">;
  name: string;
  order: number;
}

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  order: number;
  createdAt: number;
}

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  boardId: Id<"boards">;
  onDragStart: (taskId: Id<"tasks">) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  isDragTarget: boolean;
  index: number;
}

const COLUMN_COLORS = [
  "bg-white",
  "bg-[#e8e8e8]",
  "bg-[#d0d0d0]",
  "bg-[#c0ffc0]",
  "bg-[#ffc0c0]",
  "bg-[#c0c0ff]",
];

export function KanbanColumn({
  column,
  tasks,
  boardId,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragTarget,
  index,
}: KanbanColumnProps) {
  const createTask = useMutation(api.tasks.create);
  const removeColumn = useMutation(api.columns.remove);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await createTask({
      columnId: column._id,
      boardId,
      title: newTaskTitle.trim(),
    });
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const handleDeleteColumn = async () => {
    if (confirm(`DELETE "${column.name}" AND ALL ITS TASKS?`)) {
      await removeColumn({ id: column._id });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop();
  };

  const bgColor = COLUMN_COLORS[index % COLUMN_COLORS.length];

  return (
    <div
      className={`w-72 md:w-80 flex-shrink-0 flex flex-col border-4 border-black ${bgColor} transition-all ${
        isDragOver ? "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -translate-x-1 -translate-y-1" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b-4 border-black bg-black text-white">
        <h3 className="font-mono text-sm md:text-base font-bold uppercase tracking-wider truncate flex-1">
          {column.name}
        </h3>
        <div className="flex items-center gap-2 ml-2">
          <span className="font-mono text-xs bg-white text-black px-2 py-1">
            {tasks.length}
          </span>
          <button
            onClick={handleDeleteColumn}
            className="w-6 h-6 flex items-center justify-center font-mono hover:bg-[#ff3333] transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onDragStart={() => onDragStart(task._id)}
            onDragEnd={onDragEnd}
          />
        ))}

        {/* Drop Zone Indicator */}
        {isDragTarget && tasks.length === 0 && (
          <div className="border-4 border-dashed border-black/30 p-4 text-center">
            <div className="font-mono text-xs uppercase tracking-wider text-black/40">
              DROP HERE
            </div>
          </div>
        )}
      </div>

      {/* Add Task */}
      <div className="p-3 md:p-4 border-t-4 border-black">
        {isAddingTask ? (
          <form onSubmit={handleAddTask} className="space-y-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="TASK TITLE"
              autoFocus
              className="w-full border-4 border-black p-2 font-mono text-sm uppercase tracking-wider focus:outline-none focus:bg-[#ffff00] transition-colors"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-black text-white border-4 border-black p-2 font-mono text-xs uppercase tracking-wider hover:bg-[#ffff00] hover:text-black transition-colors"
              >
                ADD
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                }}
                className="border-4 border-black p-2 font-mono text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full border-4 border-dashed border-black/40 p-3 font-mono text-xs uppercase tracking-wider hover:border-black hover:border-solid hover:bg-[#ffff00] transition-all flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            <span>ADD TASK</span>
          </button>
        )}
      </div>
    </div>
  );
}
