import { updateRsvpCheckInAction } from "@/app/dashboard/events/[id]/actions";

type CheckInButtonProps = {
  rsvpId: string;
  checkedIn: boolean;
};

export function CheckInButton({ rsvpId, checkedIn }: CheckInButtonProps) {
  return (
    <form action={updateRsvpCheckInAction}>
      <input type="hidden" name="rsvpId" value={rsvpId} />
      <input type="hidden" name="checkedIn" value={checkedIn ? "false" : "true"} />
      <button
        type="submit"
        className={[
          "focus-ring rounded-full px-4 py-2 text-sm font-black transition hover:-translate-y-0.5",
          checkedIn
            ? "bg-lime-mute text-zinc-950"
            : "bg-[color:var(--card)] text-[color:var(--foreground)]",
        ].join(" ")}
      >
        {checkedIn ? "Checked in" : "Check in"}
      </button>
    </form>
  );
}
