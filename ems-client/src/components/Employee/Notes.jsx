// ems-client/src/components/Employee/Notes.jsx
import { useEffect, useState } from "react";

const STORAGE_KEY = "ems_employee_notes";

function Notes() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setNotes(parsed);
    } catch {
      /* ignore */
    }
  }, []);

  const persistNotes = (next) => {
    setNotes(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleSave = () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    setIsSaving(true);
    try {
      const payload = {
        id: Date.now(),
        text: trimmed,
        savedAt: new Date().toISOString(),
      };
      const next = [payload, ...notes];
      persistNotes(next);
      setNote("");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id) => {
    const next = notes.filter((n) => n.id !== id);
    persistNotes(next);
  };

  const latest = notes[0];

  const formatDateTime = (iso) =>
    new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <>
      {/* Full-height column so it fills the card */}
      <div className="h-full flex flex-col text-sm">
        {/* Top: editor area (fixed-ish height) */}
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write down quick notes for today..."
            className="w-full h-[100px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-gray-400">
              Notes are saved on this device.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNote("")}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !note.trim()}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={notes.length === 0}
                className="px-3 py-1.5 rounded-lg border border-blue-500 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60 transition-colors"
              >
                View all
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: last saved / list area fills remaining space */}
        <div className="mt-3 flex-1">
          {latest ? (
            <div className="h-full rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium">Last saved</p>
                <p className="text-[11px] text-blue-800">
                  {formatDateTime(latest.savedAt)}
                </p>
              </div>
              <div className="mt-1 flex-1 overflow-y-auto">
                <p className="whitespace-pre-wrap">{latest.text}</p>
              </div>
            </div>
          ) : (
            <div className="h-full rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400 flex items-center justify-center text-center">
              No notes yet. Start typing above and save your first note.
            </div>
          )}
        </div>
      </div>

      {/* Modal stays same */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-gray-200 max-h-[80vh] flex flex-col">
            <header className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                All notes
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-lg leading-none"
                aria-label="Close notes"
              >
                ×
              </button>
            </header>

            <div className="px-4 py-3 overflow-y-auto text-xs space-y-2">
              {notes.length === 0 ? (
                <p className="text-gray-500">No notes saved yet.</p>
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] text-gray-500">
                        {formatDateTime(n.savedAt)}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDelete(n.id)}
                        className="text-[11px] text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap text-gray-800">
                      {n.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            <footer className="px-4 py-2 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

export default Notes;
