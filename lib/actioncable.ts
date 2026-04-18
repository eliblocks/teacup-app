// @rails/actioncable expects browser globals (addEventListener, removeEventListener)
// for its ConnectionMonitor. Stub them out for React Native.
if (typeof globalThis.addEventListener === "undefined") {
  (globalThis as any).addEventListener = () => {};
}
if (typeof globalThis.removeEventListener === "undefined") {
  (globalThis as any).removeEventListener = () => {};
}

export { createConsumer } from "@rails/actioncable";
