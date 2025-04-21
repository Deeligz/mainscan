"use client";

import { useState, useRef, useEffect } from "react";
// Removed unused Image import
// import Image from "next/image"; 
import styles from "./page.module.css";

// Define the structure for items in the list
interface ScannedItem {
  barcode: string;
  image: string | null; // Store image as base64 data URL or null
}

export default function Home() {
  const [scannedData, setScannedData] = useState("");
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]); 
  const inputRef = useRef<HTMLInputElement>(null);
  
  // --- Camera State & Refs --- 
  // Uncommented camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [barcodeToProcess, setBarcodeToProcess] = useState<string | null>(null);
  // Comment out unused stream state setter for now
  const [stream, /* setStream */] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null); // State for camera errors
  // Comment out unused refs for now
  // const videoRef = useRef<HTMLVideoElement>(null);
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  // ---------------------------

  // Effect for initial focus
  useEffect(() => {
    if (!isCameraOpen) { // Only focus if camera isn't trying to open
       inputRef.current?.focus();
    }
  }, [isCameraOpen]);

  // Effect to handle scan and trigger camera opening
  useEffect(() => {
    if (scannedData) {
      console.log("Scan detected, preparing camera for:", scannedData);
      // Store the barcode
      setBarcodeToProcess(scannedData);
      // Trigger camera UI to open
      setIsCameraOpen(true); 
      // Clear the input field immediately
      setScannedData(""); 
      setError(null); // Clear previous errors
    }
  }, [scannedData]);

  // --- Camera Control Functions (Initial Implementation) ---
  const startCamera = async () => {
    console.log("Attempting to start camera...");
    // TODO: Implement getUserMedia logic
    alert("Camera feature not fully implemented yet."); // Placeholder feedback
    handleCancel(); 
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
    // TODO: Implement stream track stopping logic
  };

  const handleCapture = () => {
    console.log("Capturing image...");
    // TODO: Implement canvas drawing and data URL generation
    alert("Capture feature not fully implemented yet."); // Placeholder feedback
    // For now, add item with null image and cancel
    if (barcodeToProcess) {
       setScannedItems(prevItems => [{ barcode: barcodeToProcess, image: null }, ...prevItems]);
    }
    handleCancel(); 
  };

  const handleCancel = () => {
    console.log("Canceling camera...");
    stopCamera();
    setIsCameraOpen(false);
    setBarcodeToProcess(null);
    setError(null);
    inputRef.current?.focus(); 
  };
  // -------------------------------------------------------

  // Effect to start/stop camera when isCameraOpen changes
  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    }
    return () => {
      if (stream) {
        stopCamera();
      }
    };
    // Added startCamera and stream to dependency array to satisfy eslint
  }, [isCameraOpen, startCamera, stream, stopCamera]); // Added stopCamera as well as it's used in cleanup


  // --- Handlers for Submit/Clear (no changes needed here) ---
  const handleClearList = () => {
    setScannedItems([]);
  };

  const handleSubmit = () => {
    if (scannedItems.length === 0) {
      console.log("No items to submit.");
      return;
    }
    console.log("Submitting items:", scannedItems);
    // TODO: Implement actual submission logic
  };
  // ---------------------------------------------------------

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h2>Scan Barcode:</h2>
        <input
          ref={inputRef}
          type="text"
          value={scannedData}
          onChange={(e) => setScannedData(e.target.value)}
          placeholder="Scan barcode here..."
          className={styles.scanInput}
          disabled={isCameraOpen} // Disable input while camera intends to be open
        />

        {/* Placeholder for where the camera modal will render */}
        {/* We will add the actual modal structure in the next step */}
        {isCameraOpen && (
           <div style={{ marginTop: '20px', padding: '20px', border: '1px solid red', background: 'lightyellow' }}>
              <p>Camera UI Placeholder (Not Implemented Yet)</p>
              <p>Processing: {barcodeToProcess}</p>
              {/* Add placeholder buttons to test handlers */} 
              <button onClick={handleCapture} style={{marginRight: '10px'}}>Capture (Not Implemented)</button>
              <button onClick={handleCancel}>Cancel</button>
              {error && <p style={{color: 'red'}}>Error: {error}</p>}
           </div>
        )}

        <div className={styles.scanListContainer}>
          <h3>Scanned Items:</h3>
          {scannedItems.length === 0 ? (
            <p>No items scanned yet.</p>
          ) : (
            <ul className={styles.scanList}>
              {/* Mapping already updated for object structure */}
              {scannedItems.map((item, index) => (
                <li key={index}>{item.barcode} {item.image ? '(has image)' : ''}</li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.actionButtonsContainer}> {/* New container for buttons */} 
          <button 
            onClick={handleSubmit}
            className={`${styles.button} ${styles.submitButton}`} // Add classes for styling
            disabled={scannedItems.length === 0} // Disable if list is empty
          >
            Submit List
          </button>
          <button 
            onClick={handleClearList}
            className={`${styles.button} ${styles.clearButton}`} // Add classes for styling
            disabled={scannedItems.length === 0} // Disable if list is empty
          >
            Clear List
          </button>
        </div>
      </main>
    </div>
  );
}
