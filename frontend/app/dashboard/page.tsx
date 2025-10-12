"use client"

import { useState } from "react"
import { Box, Container, Typography } from "@mui/material"
import Sidebar from "@/components/sidebar"
import UploadSection from "@/components/upload-section"
import { useQRContext } from "@/context/qr-context"
import type { QRCode } from "@/types"

export default function DashboardPage() {
  // const { addQRCodes } = useQRContext()
  const [currentSessionQRCodes, setCurrentSessionQRCodes] = useState<QRCode[]>([])

  // const handleQRCodesProcessed = (newQRCodes: QRCode[]) => {
  //   // Add to global history
  //   addQRCodes(newQRCodes)
  //   // Update current session display
  //   setCurrentSessionQRCodes(newQRCodes)
  // }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - 260px)` },
          minHeight: "100vh",
          background: "linear-gradient(135deg, #F8F9FF 0%, #FFF5F7 50%, #F0F9FF 100%)",
		  marginLeft: {md: "260px"},
		}}
      >
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 4, mt: { xs: 6, md: 0 } }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1C1B1F",
                letterSpacing: "-0.02em",
                mb: 1,
              }}
            >
              Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: "#6B7280" }}>
              Upload a PDF file to extract and validate QR codes
            </Typography>
          </Box>

          <UploadSection 
          // onQRCodesProcessed={handleQRCodesProcessed} currentQRCodes={currentSessionQRCodes} 
          />
        </Container>
      </Box>
    </Box>
  )
}
