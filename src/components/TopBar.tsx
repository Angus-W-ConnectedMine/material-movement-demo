"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  uploadSpreadsheet,
  type UploadSpreadsheetState,
} from "@/data/upload-file/actions";
import { useActionState } from "react";

const initialState: UploadSpreadsheetState = {
  ok: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Uploading..." : "Upload"}
    </button>
  );
}

export function TopBar() {
  const [state, formAction] = useActionState(uploadSpreadsheet, initialState);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="text-xs text-muted-foreground">
        {state.message ? (
          <span>
            {state.message}
          </span>
        ) : (
          <span>Upload an Excel spreadsheet to generate CSVs.</span>
        )}
      </div>
      <form action={formAction} className="flex items-center gap-2">
        <input
          type="file"
          name="spreadsheet"
          accept=".xlsx,.xls"
          className="max-w-[220px] text-xs file:mr-2 file:rounded-md file:border file:border-border file:bg-background file:px-2 file:py-1 file:text-xs file:font-medium"
        />
        <SubmitButton />
      </form>
    </header>
  );
}
