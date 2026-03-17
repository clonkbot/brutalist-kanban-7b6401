import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface BoardSelectorProps {
  onSelectBoard: (boardId: Id<"boards">) => void;
}

export function BoardSelector({ onSelectBoard }: BoardSelectorProps) {
  const boards = useQuery(api.boards.list);
  const createBoard = useMutation(api.boards.create);
  const removeBoard = useMutation(api.boards.remove);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    const boardId = await createBoard({ name: newBoardName.trim() });
    setNewBoardName("");
    setIsCreating(false);
    onSelectBoard(boardId);
  };

  const handleDeleteBoard = async (e: React.MouseEvent, boardId: Id<"boards">) => {
    e.stopPropagation();
    if (confirm("DELETE THIS BOARD?")) {
      await removeBoard({ id: boardId });
    }
  };

  if (boards === undefined) {
    return (
      <div className="p-8 flex justify-center">
        <div className="font-mono text-xl uppercase tracking-wider animate-pulse">
          LOADING BOARDS...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="font-mono text-2xl md:text-4xl font-bold uppercase tracking-tighter mb-2">
          YOUR BOARDS
        </h2>
        <div className="h-2 bg-black w-24"></div>
      </div>

      {/* Board Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {boards.map((board: { _id: Id<"boards">; name: string; createdAt: number }, index: number) => (
          <button
            key={board._id}
            onClick={() => onSelectBoard(board._id)}
            className="group relative border-4 border-black bg-white p-6 text-left hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-1 hover:-translate-y-1"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleDeleteBoard(e, board._id)}
                className="w-8 h-8 border-2 border-black flex items-center justify-center font-mono text-lg hover:bg-[#ff3333] hover:text-white hover:border-[#ff3333] transition-colors"
              >
                ×
              </button>
            </div>
            <div className="font-mono text-lg md:text-xl font-bold uppercase tracking-tight mb-2 pr-8">
              {board.name}
            </div>
            <div className="font-mono text-xs text-black/50 uppercase">
              {new Date(board.createdAt).toLocaleDateString()}
            </div>
          </button>
        ))}

        {/* Create New Board Button */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="border-4 border-dashed border-black p-6 flex flex-col items-center justify-center hover:border-solid hover:bg-[#ffff00] transition-all min-h-[120px]"
          >
            <div className="font-mono text-4xl md:text-5xl font-bold mb-2">+</div>
            <div className="font-mono text-xs uppercase tracking-wider">NEW BOARD</div>
          </button>
        ) : (
          <form
            onSubmit={handleCreateBoard}
            className="border-4 border-black bg-[#ffff00] p-4"
          >
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="BOARD NAME"
              autoFocus
              className="w-full border-4 border-black p-3 font-mono text-sm uppercase tracking-wider bg-white focus:outline-none mb-4"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-black text-white border-4 border-black p-2 font-mono text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
              >
                CREATE
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewBoardName("");
                }}
                className="border-4 border-black p-2 font-mono text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </form>
        )}
      </div>

      {boards.length === 0 && !isCreating && (
        <div className="border-4 border-dashed border-black/30 p-8 md:p-12 text-center">
          <div className="font-mono text-lg md:text-xl uppercase tracking-wider text-black/50 mb-4">
            NO BOARDS YET
          </div>
          <div className="font-mono text-sm uppercase tracking-wider text-black/30">
            CREATE YOUR FIRST BOARD TO GET STARTED
          </div>
        </div>
      )}
    </div>
  );
}
