/** Dot-path access into the content box's nested value object. */
export type Path = string;

function segments(path: Path): string[] {
  return path ? path.split('.') : [];
}

export function getAtPath(source: unknown, path: Path): unknown {
  let current = source;
  for (const segment of segments(path)) {
    if (Array.isArray(current)) {
      current = current[Number(segment)];
    } else if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

/** Set a nested value without mutating the previous object. */
export function setAtPath<T extends Record<string, unknown>>(
  source: T,
  path: Path,
  value: unknown,
): T {
  const parts = segments(path);
  if (parts.length === 0) return source;

  const [head, ...rest] = parts;
  const clone: Record<string, unknown> = { ...source };
  const nextPath = rest.join('.');

  if (rest.length === 0) {
    clone[head] = value;
    return clone as T;
  }

  const existing = clone[head];
  if (/^\d+$/.test(rest[0])) {
    const list = Array.isArray(existing) ? [...existing] : [];
    const index = Number(rest[0]);
    list[index] = setAtPath(
      (list[index] as Record<string, unknown>) ?? {},
      rest.slice(1).join('.'),
      value,
    );
    clone[head] = list;
    return clone as T;
  }

  clone[head] = setAtPath(
    existing && typeof existing === 'object' ? (existing as Record<string, unknown>) : {},
    nextPath,
    value,
  );
  return clone as T;
}
