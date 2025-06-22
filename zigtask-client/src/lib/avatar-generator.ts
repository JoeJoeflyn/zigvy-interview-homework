/**
 * Generate avatar using email address.
 */
export function getInitialsFromEmail(email: string): string {
    const localPart = email.split('@')[0]; // e.g. "john.doe"
    const parts = localPart.split(/[._-]/).filter(Boolean); // split on common separators
  
    if (parts.length >= 2) {
      return (
        (parts[0][0] ?? '').toUpperCase() + (parts[1][0] ?? '').toUpperCase()
      );
    }
  
    // fallback to first two characters
    return localPart.slice(0, 2).toUpperCase();
  }
  