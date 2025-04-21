"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
      </main>
    </div>
  );
}
