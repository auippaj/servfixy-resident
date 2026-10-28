// One place that turns the raw request status into what a resident sees.
// Residents only ever see: Received, Working on it, Needs you, Done (plus Cancelled for closed-out requests).

export const RESIDENT_STATUS = {
  received: { label: 'Received', bg: '#e6f1fb', text: '#185FA5' },
  working: { label: 'Working on it', bg: '#faeeda', text: '#633806' },
  needs_resident: { label: 'Needs you', bg: '#fee2e2', text: '#991b1b' },
  done: { label: 'Done', bg: '#e1f5ee', text: '#0F6E56' },
  cancelled: { label: 'Cancelled', bg: '#f3f4f6', text: '#6b7280' },
};

const norm = (s) => String(s || '').trim().toLowerCase().replace(/[\s-]+/g, '_');

const DONE = ['completed', 'closed', 'resident_confirmed'];
const CANCELLED = ['cancelled', 'canceled'];
const NEEDS_RESIDENT = ['needs_resident', 'awaiting_resident', 'waiting_on_resident'];
const WORKING = ['dispatched', 'assigned', 'scheduled', 'in_progress', 'en_route', 'pending_qa', 'qa'];
// After the visit: no verification code or video call should be offered.
const VISIT_OVER = ['pending_qa', 'qa', ...DONE, ...CANCELLED];

// Anything unrecognized falls back to Received, never to a raw database value.
export function residentStatusKey(status) {
  const s = norm(status);
  if (CANCELLED.includes(s)) return 'cancelled';
  if (DONE.includes(s)) return 'done';
  if (NEEDS_RESIDENT.includes(s)) return 'needs_resident';
  if (WORKING.includes(s)) return 'working';
  return 'received';
}

export const isEnRoute = (status) => norm(status) === 'en_route';
export const isVisitOver = (status) => VISIT_OVER.includes(norm(status));

// A request that has waited this long with no technician assigned gets a "taking longer" note.
export const STALE_HOURS = 72;

export function isStale(request, firedTouches, past) {
  if (past) return false;
  if (firedTouches.includes(2)) return false;
  const created = new Date(request.created_at).getTime();
  if (!created) return false;
  return Date.now() - created > STALE_HOURS * 60 * 60 * 1000;
}
