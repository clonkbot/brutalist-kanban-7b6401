import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  boardId: Id<"boards">;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const board = useQuery(api.boards.get, { id: boardId });
  const columns = useQuery(api.columns.listByBoard, { boardId });
  const tasks = useQuery(api.tasks.listByBoard, { boardId });
  const createColumn = useMutation(api.columns.create);
  const moveTask = useMutation(api.tasks.move);

  const [newColumnName, setNewColumnName] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<Id<"tasks"> | null>(null);

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    await createColumn({ boardId, name: newColumnName.trim().toUpperCase() });
    setNewColumnName("");
    setIsAddingColumn(false);
  };

  const handleDragStart = (taskId: Id<"tasks">) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDrop = async (columnId: Id<"columns">) => {
    if (!draggedTaskId) return;

    const columnTasks = tasks?.filter((t: { columnId: Id<"columns">; order: number }) => t.columnId === columnId) || [];
    const maxOrder = columnTasks.reduce((max: number, t: { order: number }) => Math.max(max, t.order), -1);

    await moveTask({
      id: draggedTaskId,
      columnId,
      order: maxOrder + 1,
    });
    setDraggedTaskId(null);
  };

  if (board === undefined || columns === undefined || tasks === undefined) {
    return (
      <div className="p-8 flex justify-center">
        <div className="font-mono text-xl uppercase tracking-wider animate-pulse">
          LOADING BOARD...
        </div>
      </div>
    );
  }

  if (board === null) {
    return (
      <div className="p-8 flex justify-center">
        <div className="border-4 border-[#ff3333] bg-white p-8">
          <div className="font-mono text-xl uppercase tracking-wider text-[#ff3333]">
            BOARD NOT FOUND
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="p-4 md:p-6 border-b-4 border-black bg-white">
        <h2 className="font-mono text-xl md:text-3xl font-bold uppercase tracking-tighter">
          {board.name}
        </h2>
      </div>

      {/* Columns Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full p-4 md:p-6 gap-4 md:gap-6 min-w-min">
          {columns.map((column: { _id: Id<"columns">; name: string; order: number }, index: number) => (
            <KanbanColumn
              key={column._id}
              column={column}
              tasks={tasks.filter((t: { columnId: Id<"columns"> }) => t.columnId === column._id)}
              boardId={boardId}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={() => handleDrop(column._id)}
              isDragTarget={draggedTaskId !== null}
              index={index}
            />
          ))}

          {/* Add Column */}
          <div className="w-72 md:w-80 flex-shrink-0">
            {isAddingColumn ? (
              <form
                onSubmit={handleAddColumn}
                className="border-4 border-black bg-[#ffff00] p-4"
              >
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="COLUMN NAME"
                  autoFocus
                  className="w-full border-4 border-black p-3 font-mono text-sm uppercase tracking-wider bg-white focus:outline-none mb-4"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white border-4 border-black p-2 font-mono text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
                  >
                    ADD
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnName("");
                    }}
                    className="border-4 border-black p-2 font-mono text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="w-full border-4 border-dashed border-black/40 p-6 flex items-center justify-center gap-2 hover:border-black hover:border-solid hover:bg-[#ffff00] transition-all group"
              >
                <span className="font-mono text-2xl group-hover:scale-110 transition-transform">+</span>
                <span className="font-mono text-sm uppercase tracking-wider">ADD COLUMN</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
