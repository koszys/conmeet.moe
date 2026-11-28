/**
 * Parses a DRF / ky HTTP error response into a flat field-to-message map.
 * Top-level `detail` or `error` strings are mapped to `non_field_errors`.
 */
export async function parseApiFieldErrors(
  err: unknown,
  fallbackMessage = 'Something went wrong. Please try again.'
): Promise<Record<string, string>> {
  if (err && typeof err === 'object' && 'response' in err) {
    try {
      const res = (err as { response: Response }).response;
      const data: unknown = await res.json();
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const mapped: Record<string, string> = {};
        for (const [key, val] of Object.entries(data)) {
          const targetKey = key === 'detail' || key === 'error' ? 'non_field_errors' : key;
          mapped[targetKey] = Array.isArray(val) ? val.join(' ') : String(val);
        }
        if (Object.keys(mapped).length > 0) {
          return mapped;
        }
      }
    } catch {
      // Fallback if response body is not JSON
    }
  }

  return { non_field_errors: fallbackMessage };
}
