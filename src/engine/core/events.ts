// events.ts — Tiny event emitter for engine communication.

export type EventCallback<T = any> = (data: T) => void;

export class EventEmitter<T = any> {
  private listeners = new Set<EventCallback<T>>();

  on(cb: EventCallback<T>) {
    this.listeners.add(cb);
    return () => this.off(cb);
  }

  off(cb: EventCallback<T>) {
    this.listeners.delete(cb);
  }

  once(cb: EventCallback<T>) {
    const wrapper = (data: T) => {
      cb(data);
      this.off(wrapper);
    };
    this.on(wrapper);
  }

  emit(data: T) {
    for (const cb of this.listeners) cb(data);
  }

  clear() {
    this.listeners.clear();
  }
}
