import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SecondPage from "./SecondPage";
import ModelDemo from "./ModelDemo";
import { Model } from "@webspatial/react-sdk";
import fireModel from "./assets/models/fire.usdz?url";
import earthModel from "./assets/models/Earth.usdz?url";
import waterModel from "./assets/models/water.usdz?url";
import mudModel from "./assets/models/Mud.usdz?url";
import dirtModel from "./assets/models/Dirt.usdz?url";
import sandModel from "./assets/models/Sand.usdz?url";
import glassModel from "./assets/models/Glass.usdz?url";
import woodModel from "./assets/models/Wood.usdz?url";

declare const __XR_ENV_BASE__: string;

// Element types for Little Alchemy - matching available models
type ElementType =
  | "earth"
  | "fire"
  | "water"
  | "mud"
  | "dirt"
  | "sand"
  | "glass"
  | "wood";

interface Element {
  id: ElementType;
  name: string;
  emoji?: string;
}

const BASIC_ELEMENTS: Element[] = [
  { id: "earth", name: "Earth", emoji: "🌍" },
  { id: "fire", name: "Fire", emoji: "🔥" },
  { id: "water", name: "Water", emoji: "💧" },
  { id: "mud", name: "Mud", emoji: "🟤" },
  { id: "dirt", name: "Dirt", emoji: "🟫" },
  { id: "sand", name: "Sand", emoji: "🏖️" },
  { id: "glass", name: "Glass", emoji: "🪟" },
  { id: "wood", name: "Wood", emoji: "🪵" },
];

const getModelUrl = (element: ElementType): string => {
  switch (element) {
    case "fire":
      return fireModel;
    case "earth":
      return earthModel;
    case "water":
      return waterModel;
    case "mud":
      return mudModel;
    case "dirt":
      return dirtModel;
    case "sand":
      return sandModel;
    case "glass":
      return glassModel;
    case "wood":
      return woodModel;
    default:
      return fireModel;
  }
};

// Combination rules: [element1, element2] => result
type CombinationRule = [ElementType, ElementType, ElementType];

const COMBINATION_RULES: CombinationRule[] = [
  ["earth", "water", "mud"],
  ["fire", "sand", "glass"],
];

// Check if two elements can combine and return the result
const canCombine = (
  element1: ElementType,
  element2: ElementType
): ElementType | null => {
  for (const [a, b, result] of COMBINATION_RULES) {
    if (
      (element1 === a && element2 === b) ||
      (element1 === b && element2 === a)
    ) {
      return result;
    }
  }
  return null;
};

function AppContent() {
  const [firstSelected, setFirstSelected] = useState<ElementType | null>(null);
  const [secondSelected, setSecondSelected] = useState<ElementType | null>(
    null
  );
  const [supported, setSupported] = useState(false);
  const [newlyCreated, setNewlyCreated] = useState<ElementType | null>(null);
  const [recipe, setRecipe] = useState<[ElementType, ElementType] | null>(null);
  const [unlockedElements, setUnlockedElements] = useState<ElementType[]>([
    "earth",
    "water",
    "fire",
    "sand",
  ]);
  const firstModelRef = useRef<any>(null);
  const secondModelRef = useRef<any>(null);

  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" && "HTMLModelElement" in window;
    setSupported(isSupported);
    console.log("HTMLModelElement supported:", isSupported);
  }, []);

  useEffect(() => {
    console.log("Unlocked elements:", unlockedElements);
  }, [unlockedElements]);

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

  const handleElementClick = (element: ElementType, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log("Element clicked:", element);

    // Clear the newly created element display when clicking any button
    setNewlyCreated(null);
    setRecipe(null);

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

  const handleCombine = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("=== COMBINE BUTTON CLICKED ===");
    console.log("First selected:", firstSelected);
    console.log("Second selected:", secondSelected);

    if (!firstSelected || !secondSelected) {
      console.error("Cannot combine - missing selections", {
        firstSelected,
        secondSelected,
      });
      alert(
        `Cannot combine - missing selections. First: ${firstSelected}, Second: ${secondSelected}`
      );
      return;
    }

    const result = canCombine(firstSelected, secondSelected);
    console.log("Combination result:", result);

    if (!result) {
      console.error(`${firstSelected} + ${secondSelected} cannot combine`);
      alert(`${firstSelected} + ${secondSelected} cannot combine`);
      return;
    }

    console.log(`✓ Combining ${firstSelected} + ${secondSelected} = ${result}`);

    // Store the recipe
    setRecipe([firstSelected, secondSelected]);

    // Add the newly created element to unlocked elements if not already unlocked
    setUnlockedElements((prev) => {
      const newList = !prev.includes(result) ? [...prev, result] : prev;
      console.log("Updated unlocked elements:", newList);
      return newList;
    });

    // Set the newly created element as the first selected
    setNewlyCreated(result);
    setFirstSelected(result);
    setSecondSelected(null);

    console.log("=== COMBINE COMPLETE ===");
  };

  return (
    <div className="main-layout" enable-xr>
      <div className="menu-column" enable-xr>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Elements
        </h2>
        <div className="element-menu" enable-xr>
          {BASIC_ELEMENTS.filter((element) => {
            const isUnlocked = unlockedElements.includes(element.id);
            if (!isUnlocked && element.id === "sand") {
              console.log(
                "Sand not found in unlockedElements:",
                unlockedElements
              );
            }
            return isUnlocked;
          }).map((element) => {
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
                onClick={(e) => handleElementClick(element.id, e)}
                type="button"
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
                    <div style={{ marginBottom: "1rem" }}>
                      <p
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                          color: "#ffffff",
                          backgroundColor: "#646cff",
                          textAlign: "center",
                          paddingLeft: "1.5rem",
                          paddingRight: "1.5rem",
                          paddingTop: "0.5rem",
                          paddingBottom: "0.5rem",
                          borderRadius: "8px",
                          display: "inline-block",
                          margin: 0,
                        }}
                      >
                        {
                          BASIC_ELEMENTS.find((e) => e.id === firstSelected)
                            ?.name
                        }
                      </p>
                    </div>
                    <Model
                      ref={firstModelRef}
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "400px",
                        maxHeight: "600px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        overflow: "hidden",
                        display: "block",
                        objectFit: "contain",
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
                    <div style={{ marginBottom: "1rem" }}>
                      <p
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                          color: "#ffffff",
                          backgroundColor: "#4caf50",
                          textAlign: "center",
                          paddingLeft: "1.5rem",
                          paddingRight: "1.5rem",
                          paddingTop: "0.5rem",
                          paddingBottom: "0.5rem",
                          borderRadius: "8px",
                          display: "inline-block",
                          margin: 0,
                        }}
                      >
                        {
                          BASIC_ELEMENTS.find((e) => e.id === secondSelected)
                            ?.name
                        }
                      </p>
                    </div>
                    <Model
                      ref={secondModelRef}
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "400px",
                        maxHeight: "600px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        overflow: "hidden",
                        display: "block",
                        objectFit: "contain",
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
                  color: "#ffffff",
                  fontSize: "2.5rem",
                  fontWeight: "500",
                  textAlign: "center",
                  margin: "2rem auto",
                  width: "100%",
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
        <div className="bottom-section" enable-xr>
          {firstSelected && secondSelected && (
            <button
              onClick={handleCombine}
              className="combine-button"
              type="button"
              style={{
                width: "calc(100% - 4rem)",
                padding: "1rem 2rem",
                fontSize: "1.5rem",
                fontWeight: "bold",
                backgroundColor: "#646cff",
                color: "#ffffff",
                border: "none",
                borderRadius: "13px",
                cursor: "pointer",
                marginTop: "1.5rem",
                marginBottom: "2rem",
                marginLeft: "2rem",
                marginRight: "2rem",
                transition: "background-color 0.2s ease",
                position: "relative",
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#535bf2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#646cff";
              }}
            >
              Combine
            </button>
          )}
          {newlyCreated && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#333",
                  margin: 0,
                  marginTop: "2.5rem",
                }}
              >
                New Element Created:
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  backgroundColor: "transparent",
                  borderRadius: "20px",
                  width: "90%",
                  minHeight: "100px",
                }}
              >
                <span style={{ fontSize: "3rem" }}>
                  {BASIC_ELEMENTS.find((e) => e.id === newlyCreated)?.emoji}
                </span>
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#333",
                    margin: 0,
                  }}
                >
                  {BASIC_ELEMENTS.find((e) => e.id === newlyCreated)?.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="menu-column-right" enable-xr>
        {newlyCreated && recipe && (
          <div style={{ padding: "1rem" }}>
            <h2
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#000000",
              }}
            >
              Recipe
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>
                  {BASIC_ELEMENTS.find((e) => e.id === recipe[0])?.emoji}
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: "500",
                    color: "#000000",
                  }}
                >
                  {BASIC_ELEMENTS.find((e) => e.id === recipe[0])?.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#000000",
                }}
              >
                +
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>
                  {BASIC_ELEMENTS.find((e) => e.id === recipe[1])?.emoji}
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: "500",
                    color: "#000000",
                  }}
                >
                  {BASIC_ELEMENTS.find((e) => e.id === recipe[1])?.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#000000",
                }}
              >
                =
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  backgroundColor: "#646cff",
                  borderRadius: "8px",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>
                  {BASIC_ELEMENTS.find((e) => e.id === newlyCreated)?.emoji}
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    color: "#ffffff",
                  }}
                >
                  {BASIC_ELEMENTS.find((e) => e.id === newlyCreated)?.name}
                </span>
              </div>
            </div>
          </div>
        )}
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
