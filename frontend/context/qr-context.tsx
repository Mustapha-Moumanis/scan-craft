"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { QRCode } from "@/types"

interface QRContextType {
  allQRCodes: QRCode[] | null
  addQRCodes: (qrCodes: QRCode[]) => void
  clearCurrentSession: () => void
  getCurrentSessionQRCodes: () => QRCode[] | null
}

const QRContext = createContext<QRContextType | undefined>(undefined)

export function QRProvider({ children }: { children: ReactNode }) {
  const [allQRCodes, setAllQRCodes] = useState<QRCode[] | null>(null)

  const addQRCodes = (newQRCodes: QRCode[]) => {
    setAllQRCodes((prev) => (prev ? [...newQRCodes, ...prev] : newQRCodes))
  }

  const getCurrentSessionQRCodes = () => {
    return allQRCodes;
  }

  const clearCurrentSession = () => {
    setAllQRCodes(null)
  }

  return <QRContext.Provider value={{ allQRCodes, addQRCodes, clearCurrentSession, getCurrentSessionQRCodes }}>{children}</QRContext.Provider>
}

export function useQRContext() {
  const context = useContext(QRContext)
  if (!context) {
    throw new Error("useQRContext must be used within QRProvider")
  }
  return context
}
