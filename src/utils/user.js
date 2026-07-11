// Does a technician reference (on an asset or issue) point to the given user?
// Best-effort match by id, then email, then name — `tech` may be a populated
// object or a bare id/name string.
export function isSameTechnician(tech, user) {
  if (!tech || !user) return false;
  const uid = String(user.id ?? user._id ?? '');
  const uemail = (user.email ?? '').toLowerCase();
  if (typeof tech === 'object') {
    const tid = String(tech.id ?? tech._id ?? '');
    if (uid && tid && uid === tid) return true;
    if (uemail && tech.email && uemail === tech.email.toLowerCase()) return true;
    return false;
  }
  const t = String(tech);
  return Boolean((uid && t === uid) || (user.name && t === user.name));
}
