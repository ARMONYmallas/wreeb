'use client';

import { useRef, useState, useTransition } from 'react';
import { Loader2, StickyNote, Trash2 } from 'lucide-react';
import { addNote, deleteNote } from '@/app/admin/actions';
import { formatDateTime } from '@/lib/date';
import type { AdminNote } from '@/types';

export function NotesPanel({
  appointmentId,
  notes,
}: {
  appointmentId: string;
  notes: AdminNote[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="flex items-center gap-2 font-semibold text-ink">
        <StickyNote className="h-[1.125rem] w-[1.125rem] text-brand-600" aria-hidden="true" />
        Notas internas
      </h2>

      <form
        ref={formRef}
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await addNote(appointmentId, formData);
            if (!result.ok) setError(result.error);
            else formRef.current?.reset();
          });
        }}
        className="mt-4"
      >
        <textarea
          name="content"
          rows={2}
          required
          maxLength={2000}
          placeholder="Ej: prefiere después de las 15:00, tiene terraza y 3 ventanas…"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-ink placeholder:text-muted-soft focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        />
        <div className="mt-2.5 flex items-center justify-between gap-3">
          {error ? (
            <p role="alert" className="text-sm font-medium text-red-700">
              {error}
            </p>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Guardar nota
          </button>
        </div>
      </form>

      {notes.length > 0 && (
        <ul className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5">
          {notes.map((note) => (
            <li key={note.id} className="rounded-2xl bg-surface p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">
                {note.content}
              </p>
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <p className="text-xs text-muted">
                  {note.author_email ?? 'Equipo'} · {formatDateTime(note.created_at)}
                </p>
                <button
                  type="button"
                  aria-label="Borrar nota"
                  onClick={() =>
                    startTransition(async () => {
                      await deleteNote(note.id, appointmentId);
                    })
                  }
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-soft transition-colors hover:bg-white hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
