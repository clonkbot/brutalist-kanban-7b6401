import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { KanbanBoard } from "./components/KanbanBoard";
import { BoardSelector } from "./components/BoardSelector";
import { Id } from "../convex/_generated/dataModel";

function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-black text-white p-4">
            <h1 className="font-mono text-2xl md:text-3xl font-bold tracking-tighter uppercase">
              BRUTALIST KANBAN
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-widest font-bold">
                EMAIL
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:bg-[#ffff00] transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-widest font-bold">
                PASSWORD
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:bg-[#ffff00] transition-colors"
                placeholder="********"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="bg-[#ff3333] border-4 border-black p-3 font-mono text-sm text-white">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white border-4 border-black p-4 font-mono text-lg font-bold uppercase tracking-wider hover:bg-[#ffff00] hover:text-black transition-colors disabled:opacity-50"
            >
              {loading ? "..." : flow === "signIn" ? "ENTER" : "REGISTER"}
            </button>

            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="w-full border-4 border-black p-3 font-mono text-sm uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
            >
              {flow === "signIn" ? "CREATE ACCOUNT" : "BACK TO LOGIN"}
            </button>
          </form>
        </div>

        <button
          onClick={() => signIn("anonymous")}
          className="w-full mt-6 border-4 border-dashed border-black p-4 font-mono text-sm uppercase tracking-wider hover:border-solid hover:bg-black hover:text-white transition-all"
        >
          CONTINUE AS GUEST
        </button>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const { signOut } = useAuthActions();
  const [selectedBoardId, setSelectedBoardId] = useState<Id<"boards"> | null>(null);

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col">
      {/* Header */}
      <header className="border-b-4 border-black bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="font-mono text-xl md:text-2xl font-bold tracking-tighter uppercase">
              BRUTALIST KANBAN
            </h1>
            {selectedBoardId && (
              <button
                onClick={() => setSelectedBoardId(null)}
                className="border-4 border-black px-3 py-1 font-mono text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
              >
                BOARDS
              </button>
            )}
          </div>
          <button
            onClick={() => signOut()}
            className="border-4 border-black px-4 py-2 font-mono text-sm uppercase tracking-wider hover:bg-[#ff3333] hover:border-[#ff3333] hover:text-white transition-colors self-start sm:self-auto"
          >
            EXIT
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {selectedBoardId ? (
          <KanbanBoard boardId={selectedBoardId} />
        ) : (
          <BoardSelector onSelectBoard={setSelectedBoardId} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black/20 bg-[#f5f5f0] py-3 px-4">
        <p className="text-center font-mono text-xs text-black/40 tracking-wide">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-pulse">
          <div className="font-mono text-2xl font-bold uppercase tracking-tighter">
            LOADING...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return <AuthenticatedApp />;
}
