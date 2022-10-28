import React, { useRef, useEffect } from "react";
import { Runtime, Inspector } from "@observablehq/runtime";
import notebook from "./chart";
import "./inspector.css";

function WomenInSpace() {
  const ref = useRef();

  useEffect(() => {
    const runtime = new Runtime();
    runtime.module(notebook, (name) => {
      if (name === "svg") return new Inspector(ref.current);
    });
    return () => runtime.dispose();
  }, []);

  return <div ref={ref} />;
}

export default WomenInSpace;
