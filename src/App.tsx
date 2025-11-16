import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SecondPage from "./SecondPage";
import ModelDemo from "./ModelDemo";
import { Model } from "@WebSpatial/react-sdk";
import fireModel from './assets/models/fire.usdz?url';
import earthModel from './assets/models/Earth.usdz?url';

declare const __XR_ENV_BASE__: string;

// Element types for Little Alchemy
type ElementType =
  | "air"
  | "earth"
  | "fire"
  | "water"
  | "plant"
  | "rain"
  | "mud"
  | "energy"
  | "stone"
  | "steam";

interface Element {
  id: ElementType;
  name: string;
  emoji?: string;
}

const BASIC_ELEMENTS: Element[] = [
  { id: "air", name: "Air", emoji: "💨" },
  { id: "earth", name: "Earth", emoji: "🌍" },
  { id: "fire", name: "Fire", emoji: "🔥" },
  { id: "water", name: "Water", emoji: "💧" },
  { id: "plant", name: "Plant", emoji: "🌱" },
  { id: "rain", name: "Rain", emoji: "🌧️" },
  { id: "mud", name: "Mud", emoji: "🟤" },
  { id: "energy", name: "Energy", emoji: "🔋" },
  { id: "stone", name: "Stone", emoji: "🪨" },
  { id: "steam", name: "Steam", emoji: "💨" },
];

const getModelUrl = (element: ElementType): string => {
  if (element === "fire") return fireModel;
  if (element === "earth") return earthModel;
  return fireModel;
};

function AppContent() {
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(
    null
  );
  const [supported, setSupported] = useState(false);
  const modelRef = useRef<any>(null);

  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" && "HTMLModelElement" in window;
    setSupported(isSupported);
    console.log("HTMLModelElement supported:", isSupported);
  }, []);

  // Apply initial orientation once after the model is ready
  // useEffect(() => {
  //   console.log("Model effect triggered:", {
  //     supported,
  //     selectedElement,
  //     hasRef: !!modelRef.current,
  //   });
  //   if (!supported || !modelRef.current || selectedElement !== "fire") return;
  //   let cancelled = false;

  //   (async () => {
  //     try {
  //       const el = modelRef.current!;
  //       console.log("Waiting for model to be ready...");
  //       // Wait for browser's default placement
  //       await el.ready;
  //       console.log("Model is ready!");
  //       // Give WebKit a moment to finish any final fitting
  //       await new Promise<void>((r) =>
  //         requestAnimationFrame(() => requestAnimationFrame(() => r()))
  //       );
  //       if (cancelled) return;

  //       // Rotate on top of the default placement matrix
  //       const baseArr = Array.from(el.entityTransform.toFloat64Array());
  //       const base = new DOMMatrix(baseArr);
  //       const rotated = base.rotateAxisAngle(0, 1, 0, 90); // +90° around Y
  //       el.entityTransform = rotated;
  //       console.log("Model transform applied");
  //     } catch (e) {
  //       console.warn("Initial transform failed:", e);
  //     }
  //   })();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [supported, selectedElement]);

  const handleElementClick = (element: ElementType) => {
    console.log("Element clicked:", element);
    setSelectedElement(element);
  };

  return (
    <div className="main-layout" enable-xr>
      <div className="menu-column" enable-xr>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Elements
        </h2>
        <div style={{ marginBottom: "1rem" }} enable-xr>
          <Link
            to="/model-demo"
            className="element-button"
            style={{ textDecoration: "none", display: "block" }}
            enable-xr
          >
            <span style={{ fontWeight: 600 }}>Open Model Demo</span>
          </Link>
        </div>
        <div className="element-menu" enable-xr>
          {BASIC_ELEMENTS.map((element) => (
            <button
              key={element.id}
              className={`element-button ${
                selectedElement === element.id ? "selected" : ""
              }`}
              onClick={() => handleElementClick(element.id)}
              enable-xr
            >
              <span className="element-emoji" enable-xr>
                {element.emoji}
              </span>
              <span className="element-name" enable-xr>
                {element.name}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="right-area" enable-xr>
        <div className="top-section" enable-xr>
          {(selectedElement === "fire" || selectedElement === "earth") ? (
            supported ? (
              <>
                <p
                  style={{
                    marginBottom: "0.5rem",
                    fontSize: "0.9rem",
                    color: "#666",
                  }}
                >
                  Loading {selectedElement} model...
                </p>
                <Model
                  ref={modelRef}
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "400px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    overflow: "hidden",
                    display: "block",
                  }}
                  onLoad={(e) => {
                    console.log("onLoad fired!", e);
                    console.log("target:", e.target);
                    console.log("ready:", e.target.ready);
                    console.log("currentSrc:", e.target.currentSrc);
                    if (e.target.ready) {
                      console.log("Model loaded successfully");
                    } else {
                      console.log("Model failed to load");
                    }
                  }}
                >
                  <source
                    src={getModelUrl(selectedElement!)}
                    type="model/vnd.usdz+zip"
                  />
                </Model>
              </>
            ) : (
              <p>
                Your browser doesn't support the HTML &lt;model&gt; element.
                Supported: {supported.toString()}
              </p>
            )
          ) : (
            <p style={{ color: "#999" }}>
              Select an element to view its 3D model
            </p>
          )}
        </div>
        <div className="bottom-section" enable-xr></div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router basename={__XR_ENV_BASE__}>
      <Routes>
        <Route path="/second-page" element={<SecondPage />} />
        <Route path="/model-demo" element={<ModelDemo />} />
        <Route path="/" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
