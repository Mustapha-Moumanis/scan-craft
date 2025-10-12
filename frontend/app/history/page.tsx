"use client"

import { Box, Container, Typography } from "@mui/material"
import Sidebar from "@/components/sidebar"
import HistorySection from "@/components/history-section"

export default function HistoryPage() {
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
              History
            </Typography>
            <Typography variant="body1" sx={{ color: "#6B7280" }}>
              View all previously processed PDFs and their QR codes
            </Typography>
          </Box>

          <HistorySection />
        </Container>
      </Box>
    </Box>
  )
}
