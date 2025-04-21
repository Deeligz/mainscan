"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  const [error, setError] = useState<string | null>(null); // State for camera errors
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // ---------------------------

  // --- Camera Control Functions ---
  // handleCapture and handleCancel need useCallback because they are passed as props/handlers
  // stopCamera logic will be moved into useEffect cleanup
  
  const handleCancel = useCallback(() => {
    console.log("Canceling camera...");
    // Stop stream logic is now handled by useEffect cleanup when isCameraOpen becomes false
    setIsCameraOpen(false);
    setBarcodeToProcess(null);
    setError(null);
    inputRef.current?.focus(); 
  }, []); // No external dependencies needed now for core logic

  const handleCapture = useCallback(() => {
    console.log("Capturing image...");
    if (!videoRef.current || !canvasRef.current || !barcodeToProcess) {
        console.error("Capture failed: refs or barcode missing");
        setError("Capture failed. Please try again.");
        return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
        console.error("Could not get canvas context");
        setError("Failed to process image.");
        return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setScannedItems(prevItems => [{ barcode: barcodeToProcess, image: imageDataUrl }, ...prevItems]);
    handleCancel(); // Close modal after capture
  }, [barcodeToProcess, handleCancel]); // Dependencies: barcodeToProcess, handleCancel

  // -------------------------------------------------------

  // Effect for initial focus
  useEffect(() => {
    if (!isCameraOpen) {
       inputRef.current?.focus();
    }
  }, [isCameraOpen]);

  // Effect to handle scan trigger
  useEffect(() => {
    if (scannedData) {
      console.log("Scan detected, preparing camera for:", scannedData);
      setBarcodeToProcess(scannedData);
      setIsCameraOpen(true); 
      setScannedData(""); 
      setError(null);
    }
  }, [scannedData]);
  
  // Effect to MANAGE camera stream based ONLY on isCameraOpen
  useEffect(() => {
    // Capture videoRef.current at the start of the effect
    const videoElement = videoRef.current;
    let currentStream: MediaStream | null = null; // Local variable for the stream

    if (isCameraOpen) {
      console.log("Effect: Attempting to start camera...");
      setError(null);
      
      const start = async () => {
          try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: "environment" } 
            });
            currentStream = mediaStream; // Assign to local variable
            if (videoElement) { // Use captured ref value
              videoElement.srcObject = mediaStream;
              console.log("Effect: Camera stream started and attached.");
            }
          } catch (err) {
            console.error("Effect: Error accessing camera:", err);
            if (err instanceof Error) {
                setError(`Error accessing camera: ${err.name} - ${err.message}`);
            } else {
                setError("An unknown error occurred accessing camera.");
            }
            // Keep modal open to show error, user must click cancel
          }
      };
      start(); // Call the async function
    }

    // Cleanup function: This runs when isCameraOpen becomes false OR component unmounts
    return () => {
      console.log("Effect Cleanup: Stopping camera stream if active...");
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        console.log("Effect Cleanup: Stream tracks stopped.");
      }
      if (videoElement) { // Use captured ref value in cleanup
          videoElement.srcObject = null;
      }
    };
  }, [isCameraOpen]); // *** ONLY depend on isCameraOpen ***

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
          disabled={isCameraOpen} // Disable input while camera is open
        />

        {/* Replace Placeholder with Actual Camera Modal */}
        {isCameraOpen && (
          <div className={styles.cameraOverlay}> {/* Modal backdrop */} 
            <div className={styles.cameraModal}> {/* Modal container */} 
              <h3>Scan: {barcodeToProcess}</h3>
              {/* Video element to display camera stream */} 
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className={styles.videoFeed}
                // Muted is often recommended for autoplay policies
                muted 
              />
              {/* Hidden canvas for capturing frames */} 
              <canvas ref={canvasRef} style={{ display: 'none' }} /> 
              
              {/* Error display */} 
              {error && <p className={styles.errorMessage}>Error: {error}</p>}
              
              {/* Camera control buttons */} 
              <div className={styles.cameraControls}>
                <button onClick={handleCapture} className={`${styles.button} ${styles.captureButton}`}>Capture</button>
                <button onClick={handleCancel} className={`${styles.button} ${styles.cancelButton}`}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.scanListContainer}>
          <h3>Scanned Items:</h3>
          {scannedItems.length === 0 ? (
            <p>No items scanned yet.</p>
          ) : (
            <ul className={styles.scanList}>
              {/* Update this mapping later to show barcode and image */}
              {scannedItems.map((item, index) => (
                <li key={index}>
                  <span>{item.barcode}</span>
                  {/* Add image display later */}
                  {item.image && <img src={item.image} alt={`Scan ${item.barcode}`} width="50" style={{marginLeft: '10px', verticalAlign: 'middle'}}/>}
                </li>
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
