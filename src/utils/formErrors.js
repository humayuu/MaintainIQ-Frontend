/**
 * Bridge server-side validation errors into a react-hook-form.
 *
 * The backend returns `{ success:false, message, errors:[{ field, message }] }`
 * on a 400. This maps each `{ field, message }` onto the matching form field via
 * RHF's `setError`, so server rules surface inline exactly like client rules.
 *
 * @param {import('axios').AxiosError} err   the caught axios error
 * @param {(name, error, opts) => void} setError  RHF's setError
 * @param {string[]} knownFields  fields that exist on this form (server errors
 *   for anything else are returned so the caller can show them as a banner)
 * @returns {string} a general (non-field) message to show as a form-level alert
 */
export function applyServerErrors(err, setError, knownFields = []) {
  const data = err?.response?.data;
  const fieldErrors = Array.isArray(data?.errors) ? data.errors : [];

  let firstUnmapped = '';
  let mappedAny = false;

  for (const { field, message } of fieldErrors) {
    if (field && knownFields.includes(field)) {
      setError(field, { type: 'server', message });
      mappedAny = true;
    } else if (!firstUnmapped) {
      firstUnmapped = message;
    }
  }

  // If nothing mapped to a field, fall back to the server's top-level message.
  if (!mappedAny) {
    return firstUnmapped || data?.message || err?.message || 'Something went wrong.';
  }
  return firstUnmapped;
}
