export function loadFromLocalStorage(key: string) {
  try {
    const serializedState = localStorage.getItem(key);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return serializedState === null ? undefined : JSON.parse(serializedState);
  } catch (error) {
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
  } catch (error) {
    console.warn(error);
  }
}
