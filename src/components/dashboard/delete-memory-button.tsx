"use client";

import { useFormStatus } from "react-dom";
import { deleteMemoryAction } from "@/app/dashboard/events/[id]/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-full border border-rose-neon/35 bg-rose-neon/12 px-3 py-2 text-xs font-black text-rose-neon transition hover:bg-rose-neon/18 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Removing..." : "Delete"}
    </button>
  );
}

export function DeleteMemoryButton({ memoryId }: { memoryId: string }) {
  return (
    <form action={deleteMemoryAction}>
      <input type="hidden" name="memoryId" value={memoryId} />
      <SubmitButton />
    </form>
  );
}
