"use client";

import { useState, useRef, useEffect } from "react";
// Removed unused Image import
// import Image from "next/image"; 
import styles from "./page.module.css";

export default function Home() {
  const [scannedData, setScannedData] = useState("");
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scannedData) {
      const currentScan = scannedData;
      console.log("Scan detected:", currentScan);

      setScannedItems(prevItems => [currentScan, ...prevItems]);

      const timer = setTimeout(() => {
        setScannedData("");
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [scannedData]);

  // Handler to clear the scanned items list
  const handleClearList = () => {
    setScannedItems([]);
  };

  // Handler for submitting the list (placeholder for now)
  const handleSubmit = () => {
    if (scannedItems.length === 0) {
      console.log("No items to submit.");
      return; // Or show a message to the user
    }
    console.log("Submitting items:", scannedItems);
    // TODO: Implement actual submission logic (e.g., API call)
    // Optionally clear the list after successful submission
    // setScannedItems([]); 
  };

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

        <div className={styles.scanListContainer}>
          <h3>Scanned Items:</h3>
          {scannedItems.length === 0 ? (
            <p>No items scanned yet.</p>
          ) : (
            <ul className={styles.scanList}>
              {scannedItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Add Submit and Clear buttons */} 
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
