/**
 * Zentrale Einstellungen — hier später Ihre freien Termine pflegen.
 * Besucherzähler: aktuell CountAPI (Drittanbieter); für Produktion ggf. Supabase/eigenes Backend.
 */
window.SAIBOT_SITE = {
  booking: {
    /** Wochentage mit Slots: 0=So … 6=Sa */
    weekdays: [2, 3, 4, 5],
    times: ["10:00", "11:00", "14:00", "15:30"],
    weeksAhead: 6,
    /** ISO-Daten ohne Slots, z. B. "2026-12-24" */
    blockedDates: [],
    /** Feste Slots (überschreibt Regeln), z. B. { date: "2026-09-30", times: ["09:00"] } */
    manualSlots: [],
    timezoneLabel: "Europe/Berlin",
  },
  visitorCounter: {
    enabled: true,
    /** CountAPI — Namespace/Key frei wählbar; später durch eigene URL ersetzbar */
    provider: "countapi",
    namespace: "saibot-impulse-de",
    key: "website-visits",
    /** Später: endpoint: "https://ihr-backend.de/api/visitors" */
    endpoint: null,
  },
};
