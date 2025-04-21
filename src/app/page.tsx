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
  // Update scannedItems state to use the new structure
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]); 
  const inputRef = useRef<HTMLInputElement>(null);
  
  // New state for camera flow - temporarily commented out until used
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  // const [barcodeToProcess, setBarcodeToProcess] = useState<string | null>(null);
  // const [stream, setStream] = useState<MediaStream | null>(null);
  // Refs for camera elements (will be added later)
  // const videoRef = useRef<HTMLVideoElement>(null);
  // const canvasRef = useRef<HTMLCanvasElement>(null);

  // Effect for initial focus
  useEffect(() => {
    // Only focus if camera isn't open, otherwise it might interfere
    if (!isCameraOpen) {
       inputRef.current?.focus();
    }
  }, [isCameraOpen]); // Re-run when camera opens/closes

  // Modified effect to handle scan and trigger camera
  useEffect(() => {
    if (scannedData) {
      console.log("Scan detected:", scannedData);
      // Store the barcode to process it after image capture - temporarily commented out
      // setBarcodeToProcess(scannedData);
      // Open the camera UI
      setIsCameraOpen(true);
      // Clear the input field immediately
      setScannedData(""); 
    }
  }, [scannedData]); // Dependency remains scannedData

  // Handler to clear the scanned items list (logic is the same)
  const handleClearList = () => {
    setScannedItems([]);
  };

  // Handler for submitting the list (updated console log)
  const handleSubmit = () => {
    if (scannedItems.length === 0) {
      console.log("No items to submit.");
      return;
    }
    // Log the array of objects
    console.log("Submitting items:", scannedItems);
    // TODO: Implement actual submission logic
  };

  // ... Camera handling functions (startCamera, handleCapture, handleCancel) will be added here ...

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
        />

        {/* TODO: Add Camera Modal/View here, conditionally rendered based on isCameraOpen */}
        {/* Example: {isCameraOpen && <CameraView onCapture={handleCapture} onCancel={handleCancel} />} */}

        <div className={styles.scanListContainer}>
          <h3>Scanned Items:</h3>
          {scannedItems.length === 0 ? (
            <p>No items scanned yet.</p>
          ) : (
            <ul className={styles.scanList}>
              {/* Update this mapping later to show barcode and image */}
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
