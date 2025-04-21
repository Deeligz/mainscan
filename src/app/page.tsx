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

  // --- Camera Control Functions (Wrapped in useCallback) ---
  
  // Need to define stopCamera before startCamera/handleCancel if it's used inside them
  const stopCamera = useCallback(() => {
    if (stream) {
      console.log("Stopping camera stream...");
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
          videoRef.current.srcObject = null;
      }
    }
  }, [stream]); // Dependency: stream

  const handleCancel = useCallback(() => {
    console.log("Canceling camera...");
    stopCamera(); // Call memoized stopCamera
    setIsCameraOpen(false);
    setBarcodeToProcess(null);
    setError(null);
    inputRef.current?.focus(); 
  }, [stopCamera]); // Dependency: stopCamera

  const startCamera = useCallback(async () => {
    console.log("Attempting to start camera...");
    setError(null);
    // Ensure previous stream is stopped before starting new one
    stopCamera(); 
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
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
      // Keep modal open to show error, user must click cancel
    }
  }, [stopCamera]); // Dependency: stopCamera (to ensure it stops previous stream)

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
    handleCancel(); // Use memoized handleCancel
  }, [barcodeToProcess, handleCancel]); // Dependencies: barcodeToProcess, handleCancel

  // -------------------------------------------------------

  // Effect to start/stop camera when isCameraOpen changes
  useEffect(() => {
    if (isCameraOpen) {
      startCamera(); // Call memoized startCamera
    }
    // Cleanup function is essential for stopping the camera
    return () => {
      // Always attempt to stop if the effect cleans up while camera was intended to be open
      // This logic is simplified because stopCamera internally checks if stream exists
      stopCamera(); 
    };
    // Dependencies should only be isCameraOpen and the stable function references
  }, [isCameraOpen, startCamera, stopCamera]); // REMOVED stream from dependency array

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
