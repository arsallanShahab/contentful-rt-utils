/**
 * Pick properties from an object based on a list of keys (supports dot notation).
 * @param obj The source object.
 * @param keys The list of keys to keep.
 * @returns A new object with only the selected properties.
 */
export function pick(obj: any, keys: string[]): any {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  const result: any = {};

  for (const key of keys) {
    const parts = key.split(".");
    let currentSource = obj;
    let currentTarget = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (currentSource[part] === undefined) {
        break; // Property doesn't exist in source
      }

      if (i === parts.length - 1) {
        // Last part, assign value
        currentTarget[part] = currentSource[part];
      } else {
        // Intermediate part, ensure object exists
        if (!currentTarget[part]) {
          currentTarget[part] = {};
        }
        currentTarget = currentTarget[part];
        currentSource = currentSource[part];
      }
    }
  }

  return result;
}
