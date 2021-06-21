import Fuse from "fuse.js";

export function generateSearchEngine<T>(
  documents: T[],
  options?: Fuse.IFuseOptions<T>,
) {
  return new Fuse(documents, options);
}
