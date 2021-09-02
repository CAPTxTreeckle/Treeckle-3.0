export function loadFromLocalStorage(key: string) {
  try {
    const serializedState = localStorage.getItem(key);
    return serializedState === null ? undefined : JSON.parse(serializedState);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.warn(error);
    localStorage.removeItem("key");
    return undefined;
  }
}

export function saveToLocalStorage(key: string, object: unknown) {
  if (object === null) {
    localStorage.removeItem(key);
    return;
  }

  try {
    const serializedState = JSON.stringify(object);
    localStorage.setItem(key, serializedState);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.warn(error);
  }
}
