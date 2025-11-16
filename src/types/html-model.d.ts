// src/types/html-model.d.ts
declare global {
    interface HTMLModelElement extends HTMLElement {
      ready: Promise<void>;
      entityTransform: DOMMatrix;
      // Optional: some browsers may support these
      addEventListener(type: string, listener: EventListener | null, options?: boolean | AddEventListenerOptions): void;
    }
  }
  export {};
  