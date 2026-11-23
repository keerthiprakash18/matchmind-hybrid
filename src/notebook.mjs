/** Presentation-only filtering: underlying analytics and AI always see every logged event. */
export function filterObservations(events, { search = '', team = 'All', type = 'All' } = {}) {
  if (!Array.isArray(events)) return [];
  const query = String(search).trim().toLocaleLowerCase('en');
  return events.filter((event) => {
    if (team !== 'All' && event.team !== team) return false;
    if (type !== 'All' && event.type !== type) return false;
    if (!query) return true;
    const haystack = [event.minute, event.team, event.type, event.note]
      .map((item) => String(item ?? '')).join(' ').toLocaleLowerCase('en');
    return haystack.includes(query);
  });
}
