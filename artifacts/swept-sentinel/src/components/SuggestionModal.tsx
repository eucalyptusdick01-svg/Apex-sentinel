import { useState } from "react";
import { useSubmitSuggestion } from "@workspace/api-client-react";

interface SuggestionModalProps {
  onClose: () => void;
}

export default function SuggestionModal({ onClose }: SuggestionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitSuggestion = useSubmitSuggestion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    submitSuggestion.mutate(
      { data: { title: title.trim(), description: description.trim() } },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md mx-4 border border-primary/40 bg-background shadow-[0_0_40px_rgba(0,204,255,0.15)] font-mono">
        <div className="flex items-center justify-between px-4 py-3 border-b border-primary/30 bg-card">
          <span className="text-xs text-primary tracking-widest font-bold">
            [ SUGGEST A FEATURE ]
          </span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary text-xs tracking-widest transition-colors"
          >
            [X]
          </button>
        </div>

        {submitted ? (
          <div className="p-6 flex flex-col gap-4">
            <div className="text-xs text-[#00ff41] tracking-wider">
              [SUCCESS] Suggestion transmitted. The operator team will review your input.
            </div>
            <button
              onClick={onClose}
              className="text-xs text-primary border border-primary/30 px-4 py-2 hover:border-primary/60 hover:bg-primary/5 transition-colors tracking-widest"
            >
              [CLOSE]
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-primary/80 tracking-widest">
                TITLE &gt;
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title for your idea"
                maxLength={200}
                required
                className="bg-card border border-primary/30 text-foreground font-mono text-xs px-3 py-2 focus:outline-none focus:border-primary/70 placeholder:text-muted-foreground/40 tracking-wide"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-primary/80 tracking-widest">
                DESCRIPTION &gt;
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the feature or improvement in detail..."
                maxLength={2000}
                required
                rows={5}
                className="bg-card border border-primary/30 text-foreground font-mono text-xs px-3 py-2 focus:outline-none focus:border-primary/70 placeholder:text-muted-foreground/40 tracking-wide resize-none custom-scrollbar"
              />
              <span className="text-muted-foreground/50 text-xs text-right">
                {description.length}/2000
              </span>
            </div>

            {submitSuggestion.isError && (
              <div className="text-red-400 text-xs tracking-wider">
                [ERROR] Failed to submit. Please try again.
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-muted-foreground border border-border px-4 py-2 hover:border-primary/30 transition-colors tracking-widest"
              >
                [CANCEL]
              </button>
              <button
                type="submit"
                disabled={submitSuggestion.isPending || !title.trim() || !description.trim()}
                className="text-xs text-primary border border-primary/40 px-4 py-2 hover:border-primary hover:bg-primary/10 transition-colors tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitSuggestion.isPending ? "[TRANSMITTING...]" : "[SUBMIT]"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
