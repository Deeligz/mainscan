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
  // Uncomment state setter and refs
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null); // State for camera errors
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // --- Camera Control Functions (Implemented) ---
  const startCamera = async () => {
    console.log("Attempting to start camera...");
    setError(null);
    try {
      // Request video stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: "environment" // Prioritize rear camera if available
        } 
      });
      setStream(mediaStream); // Save the stream
      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof Error) {
          setError(`Error accessing camera: ${err.name} - ${err.message}`);
      } else {
          setError("An unknown error occurred while accessing the camera.");
      }
      setIsCameraOpen(false); // Close if camera failed to start
      setBarcodeToProcess(null);
    }
  };

  const stopCamera = () => {
    if (stream) {
      console.log("Stopping camera stream...");
      stream.getTracks().forEach(track => track.stop()); // Stop all tracks
      setStream(null); // Clear the stream state
      // Detach stream from video element
      if (videoRef.current) {
          videoRef.current.srcObject = null;
      }
    }
  };

  const handleCapture = () => {
    console.log("Capturing image...");
    if (!videoRef.current || !canvasRef.current || !barcodeToProcess) {
        console.error("Capture failed: refs or barcode missing");
        setError("Capture failed. Please try again.");
        return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    // Set canvas dimensions to match video feed
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // Draw current video frame onto canvas
    const context = canvas.getContext('2d');
    if (!context) {
        console.error("Could not get canvas context");
        setError("Failed to process image.");
        return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Get image data URL (e.g., JPEG format)
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8); // Adjust quality if needed

    // Add the item with barcode and image data
    setScannedItems(prevItems => [{ barcode: barcodeToProcess, image: imageDataUrl }, ...prevItems]);
    
    // Close camera and cleanup
    handleCancel(); 
  };

  const handleCancel = () => {
    console.log("Canceling camera...");
    stopCamera(); // Call stopCamera logic
    setIsCameraOpen(false); // Close the (future) modal
    setBarcodeToProcess(null); // Clear the temporary barcode
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
