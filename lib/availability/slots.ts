export type TimeRange = {
  start: string;
  end: string;
};

export function rangesOverlap(slot: TimeRange, booking: TimeRange) {
  return slot.start < booking.end && slot.end > booking.start;
}
