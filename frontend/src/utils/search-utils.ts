import Fuse from "fuse.js";

export function generateSearchEngine<T>(
  documents: readonly T[],
  options?: Fuse.IFuseOptions<T>,
) {
  return new Fuse(documents, options);
}
