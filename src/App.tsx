import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SecondPage from "./SecondPage";
import ModelDemo from "./ModelDemo";
import { Model } from "@WebSpatial/react-sdk";
import fireModel from "./assets/models/fire.usdz?url";
import earthModel from "./assets/models/Earth.usdz?url";

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
  const [firstSelected, setFirstSelected] = useState<ElementType | null>(null);
  const [secondSelected, setSecondSelected] = useState<ElementType | null>(
    null
  );
  const [supported, setSupported] = useState(false);
  const firstModelRef = useRef<any>(null);
  const secondModelRef = useRef<any>(null);

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

    // If clicking the first selected element, deselect it and promote second to first
    if (firstSelected === element) {
      if (secondSelected) {
        // Promote second to first
        setFirstSelected(secondSelected);
        setSecondSelected(null);
      } else {
        // No second element, just deselect first
        setFirstSelected(null);
      }
      return;
    }

    // If clicking the second selected element, just deselect it
    if (secondSelected === element) {
      setSecondSelected(null);
      return;
    }

    // Select first element if none selected, or second if first is already selected
    if (!firstSelected) {
      setFirstSelected(element);
    } else if (!secondSelected) {
      setSecondSelected(element);
    } else {
      // If both are selected, clear both and make the new element the first
      setFirstSelected(element);
      setSecondSelected(null);
    }
  };

  return (
    <div className="main-layout" enable-xr>
      <div className="menu-column" enable-xr>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Elements
        </h2>
        <div className="element-menu" enable-xr>
          {BASIC_ELEMENTS.map((element) => {
            const isFirstSelected = firstSelected === element.id;
            const isSecondSelected = secondSelected === element.id;
            return (
              <button
                key={element.id}
                className={[
                  "element-button",
                  isFirstSelected ? "selected-first" : "",
                  isSecondSelected ? "selected-second" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleElementClick(element.id)}
                enable-xr
              >
                <span className="element-emoji" enable-xr>
                  {element.emoji}
                </span>
                <span className="element-name" enable-xr>
                  {element.name}
                </span>
                {isFirstSelected && (
                  <span style={{ marginLeft: "auto", fontSize: "0.8rem" }}>
                    1st
                  </span>
                )}
                {isSecondSelected && (
                  <span style={{ marginLeft: "auto", fontSize: "0.8rem" }}>
                    2nd
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="right-area" enable-xr>
        <div className="top-section" enable-xr>
          {supported ? (
            firstSelected || secondSelected ? (
              <div
                className={`models-container ${
                  firstSelected && secondSelected
                    ? "two-models"
                    : "single-model"
                }`}
                enable-xr
              >
                {firstSelected && (
                  <div className="model-wrapper model-left" enable-xr>
                    <p
                      style={{
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                        color: "#666",
                        textAlign: "center",
                      }}
                    >
                      {BASIC_ELEMENTS.find((e) => e.id === firstSelected)?.name}
                    </p>
                    <Model
                      ref={firstModelRef}
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "400px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        overflow: "visible",
                        display: "block",
                      }}
                      onLoad={() => {
                        console.log("First model loaded:", firstSelected);
                      }}
                    >
                      <source
                        src={getModelUrl(firstSelected)}
                        type="model/vnd.usdz+zip"
                      />
                    </Model>
                  </div>
                )}
                {secondSelected && (
                  <div className="model-wrapper model-right" enable-xr>
                    <p
                      style={{
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                        color: "#666",
                        textAlign: "center",
                      }}
                    >
                      {
                        BASIC_ELEMENTS.find((e) => e.id === secondSelected)
                          ?.name
                      }
                    </p>
                    <Model
                      ref={secondModelRef}
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "400px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        overflow: "visible",
                        display: "block",
                      }}
                      onLoad={() => {
                        console.log("Second model loaded:", secondSelected);
                      }}
                    >
                      <source
                        src={getModelUrl(secondSelected)}
                        type="model/vnd.usdz+zip"
                      />
                    </Model>
                  </div>
                )}
              </div>
            ) : (
              <p
                style={{
                  color: "#999",
                  fontSize: "1.5rem",
                  textAlign: "center",
                  margin: "2rem 0",
                }}
              >
                Select two elements to combine
              </p>
            )
          ) : (
            <p>
              Your browser doesn't support the HTML &lt;model&gt; element.
              Supported: {supported.toString()}
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
