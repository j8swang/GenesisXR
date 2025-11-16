// src/ModelDemo.tsx
import React, { useEffect, useRef, useState } from "react";

export default function ModelDemo() {
  const modelRef = useRef<HTMLModelElement | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "HTMLModelElement" in window);
  }, []);

  // Apply initial orientation once after the model is ready
  useEffect(() => {
    if (!supported || !modelRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const el = modelRef.current!;
        // Wait for browser's default placement
        await el.ready;
        // Give WebKit a moment to finish any final fitting
        await new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r()))
        );
        if (cancelled) return;

        // Rotate on top of the default placement matrix
        const baseArr = Array.from(el.entityTransform.toFloat64Array());
        const base = new DOMMatrix(baseArr);
        const rotated = base.rotateAxisAngle(0, 1, 0, 90); // +90° around Y
        el.entityTransform = rotated;
      } catch (e) {
        console.warn("Initial transform failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supported]);

  return (
    <div style={{ padding: 8, display: "grid", gap: 8, height: "100vh", boxSizing: "border-box" }}>
      <h1 style={{ margin: 0, fontSize: "1.2em" }}>HTML &lt;model&gt; Demo</h1>

      {supported ? (
        React.createElement(
          "model",
          {
            ref: modelRef,
            id: "inline-model",
            stagemode: "orbit", // set to "flat" if you don't want user orbit
            style: {
              width: "100%",
              height: "calc(100% - 80px)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              overflow: "hidden",
            },
          } as any,
          [
            React.createElement("source", {
              key: "source",
              src: "/models/Earth.usdz",
              type: "model/vnd.usdz+zip",
            }),
            React.createElement("img", {
              key: "img",
              alt: "Loading…",
              src: "/poster.png",
              style: { width: "100%", height: "100%", objectFit: "cover" },
            }),
          ]
        )
      ) : (
        <p>
          Your browser doesn’t support the HTML <code>&lt;model&gt;</code>{" "}
          element. Try Safari on visionOS / WebSpatial on Apple Vision Pro.
        </p>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <span style={{ opacity: 0.7 }}>
          Tip (Vision Pro): pinch and drag the model out into space.
        </span>
      </div>
    </div>
  );
}
