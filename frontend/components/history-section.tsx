"use client"

import { useState, useEffect } from "react"
import { Box, Card, CardContent, Typography, Chip, ToggleButton, ToggleButtonGroup, CircularProgress, Skeleton } from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import WarningIcon from "@mui/icons-material/Warning"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import IconButton from "@mui/material/IconButton"
import type { QRCode, QRCodeStatus } from "@/types"

interface FileMetadata {
  fileName: string
  processedAt: Date
  qrCount: number
  validCount: number
  invalidCount: number
  unreadableCount: number
  duplicateCount: number
}

export default function HistorySection() {
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingResults, setLoadingResults] = useState(false)
  const [filter, setFilter] = useState<"ALL" | "VALID" | "INVALID" | "DUPLICATE" | "UNREADABLE">("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://localhost"
  const pageSize = 8

  // Fetch files from /history endpoint
  useEffect(() => {
    fetchFiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${apiBase}/api/pdf/history`)
      const filesData = await response.json()
      
      // Convert processedAt strings to Date objects
      const filesWithDates = filesData.map((file: any) => ({
        ...file,
        processedAt: new Date(file.processedAt),
      })) as FileMetadata[]
      
      setFiles(filesWithDates)
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch QR codes for a specific file
  const fetchResults = async (fileName: string) => {
    setLoadingResults(true)
    // Reset filter and pagination when loading a new file
    setFilter("ALL")
    setCurrentPage(1)
    
    try {
      const response = await fetch(`${apiBase}/api/pdf/results?fileName=${encodeURIComponent(fileName)}`)
      const data = await response.json()
      // Convert createdAt string to Date object
      const qrCodesWithDates = data.map((qr: any) => ({
        ...qr,
        createdAt: new Date(qr.createdAt),
        processedAt: new Date(qr.createdAt), // For backward compatibility
      }))
      setQrCodes(qrCodesWithDates)
      setSelectedFile(fileName)
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoadingResults(false)
    }
  }

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  const filteredHistory = qrCodes?.filter((qrCode) => {
    if (filter === "ALL") return true
		return qrCode?.status === filter
  })

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil((filteredHistory?.length || 0) / pageSize))
  const clampedPage = Math.min(Math.max(currentPage, 1), totalPages)
  const start = (clampedPage - 1) * pageSize
  const end = start + pageSize
  const paginatedHistory = filteredHistory?.slice(start, end)

  const goToPage = (p: number) => {
    const target = Math.min(Math.max(p, 1), totalPages)
    setCurrentPage(target)
  }

  // Compute a compact page range around the current page (max 5 buttons)
  const maxButtons = 5
  let startPage = Math.max(1, clampedPage - Math.floor(maxButtons / 2))
  let endPage = startPage + maxButtons - 1
  if (endPage > totalPages) {
    endPage = totalPages
    startPage = Math.max(1, endPage - maxButtons + 1)
  }

  const btnSx = (active = false, disabled = false) => ({
    px: 1.5,
    py: 0.75,
    borderRadius: 1,
    border: "1px solid",
    borderColor: active ? "#7F5AF0" : "#E5E7EB",
    bgcolor: active ? "#F3F0FF" : "white",
    color: active ? "#7F5AF0" : "#111827",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    "&:hover": { bgcolor: active ? "#F3F0FF" : "#F9FAFB" },
  })

  const getStatusColor = (status: QRCodeStatus) => {
    switch (status) {
      case "VALID":
        return { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" }
      case "INVALID":
        return { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" }
      case "UNREADABLE":
        return { bg: "#E5E7EB", text: "#374151", border: "#9CA3AF" }
      case "DUPLICATE":
        return { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" }
    }
  }

  const getStatusIcon = (status: QRCodeStatus) => {
    switch (status) {
      case "VALID":
        return <CheckCircleIcon fontSize="small" />
      case "INVALID":
        return <ErrorIcon fontSize="small" />
      case "UNREADABLE":
        return <WarningIcon fontSize="small" />
      case "DUPLICATE":
        return <ContentCopyIcon fontSize="small" />
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return formatDate(date)
  }

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#7F5AF0" }} />
      </Box>
    )
  }

  // Show empty state if no files
  if (files.length === 0) {
    return (
      <Card
        sx={{
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          p: 6,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" sx={{ color: "#1C1B1F", fontWeight: 600, mb: 1 }}>
          No Files Yet
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280" }}>
          Upload a PDF to start processing QR codes
        </Typography>
      </Card>
    )
  }

  // Show file list if no file is selected
  if (!selectedFile) {
    return (
      <Box>
        <Typography variant="h6" sx={{ color: "#1C1B1F", fontWeight: 600, mb: 3 }}>
          Processed Files ({files.length})
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {files.map((file) => (
            <Card
              key={file.fileName}
                sx={{
                  position: "relative",
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #E5E7EB",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  height: "100%",
                  minHeight: 240,
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    borderColor: "#7F5AF0",
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(127, 90, 240, 0.2)",
                  },
                }}
                onClick={() => fetchResults(file.fileName)}
              >
                {/* QR Count Badge - Top Right Corner */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    zIndex: 1,
                  }}
                >
                  <Chip
                    label={`${file.qrCount} QR${file.qrCount !== 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      bgcolor: "#7F5AF0",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      height: 24,
                      minWidth: 24,
                      "& .MuiChip-label": {
                        px: 1,
                      },
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  {/* PDF Icon */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: "#F3F4F6",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    <PictureAsPdfIcon sx={{ fontSize: 40, color: "#7F5AF0" }} />
                  </Box>

                  {/* File Name - Fixed Height with Ellipsis */}
                  <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#1C1B1F",
                        fontWeight: 600,
                        textAlign: "center",
                        width: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.4,
                        minHeight: "2.8em",
                      }}
                    >
                      {file.fileName}
                    </Typography>
                  </Box>

                  {/* Status Breakdown */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", flexWrap: "wrap" }}>
                      {file.validCount > 0 && (
                        <Chip
                          label={`${file.validCount} ✓`}
                          size="small"
                          sx={{
                            bgcolor: "#D1FAE5",
                            color: "#065F46",
                            fontSize: "0.65rem",
                            height: 20,
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {file.invalidCount > 0 && (
                        <Chip
                          label={`${file.invalidCount} ✗`}
                          size="small"
                          sx={{
                            bgcolor: "#FEE2E2",
                            color: "#991B1B",
                            fontSize: "0.65rem",
                            height: 20,
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {file.unreadableCount > 0 && (
                        <Chip
                          label={`${file.unreadableCount} ?`}
                          size="small"
                          sx={{
                            bgcolor: "#E5E7EB",
                            color: "#374151",
                            fontSize: "0.65rem",
                            height: 20,
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {file.duplicateCount > 0 && (
                        <Chip
                          label={`${file.duplicateCount} ⚡`}
                          size="small"
                          sx={{
                            bgcolor: "#FEF3C7",
                            color: "#92400E",
                            fontSize: "0.65rem",
                            height: 20,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Time Information */}
                  <Box sx={{ borderTop: "1px solid #E5E7EB", pt: 1.5, mt: "auto" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#6B7280",
                        display: "block",
                        textAlign: "center",
                        fontSize: "0.7rem",
                        fontWeight: 500,
                      }}
                    >
                      {formatRelativeTime(file.processedAt)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
          ))}
        </Box>
      </Box>
    )
  }

  // Show skeleton loading for QR codes
  if (loadingResults) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
        </Box>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="text" width={150} height={20} />
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #E5E7EB",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Skeleton variant="rectangular" width={120} height={120} sx={{ borderRadius: 2 }} />
                  </Box>
                  <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="80%" height={16} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={16} sx={{ mb: 2 }} />
                  <Skeleton variant="rounded" width={80} height={24} />
                </CardContent>
              </Card>
          ))}
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <IconButton
          onClick={() => {
            setSelectedFile(null)
            setQrCodes([])
            setFilter("ALL")
            setCurrentPage(1)
          }}
          sx={{
            color: "#7F5AF0",
            "&:hover": { bgcolor: "rgba(127, 90, 240, 0.1)" },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}
      >
        <Box>
          <Typography variant="h6" sx={{ color: "#1C1B1F", fontWeight: 600 }}>
            {selectedFile}
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
            {filteredHistory?.length} QR Codes
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, newFilter) => newFilter && setFilter(newFilter)}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              color: "#6B7280",
              borderColor: "#E5E7EB",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              bgcolor: "white",
              "&.Mui-selected": {
                background: "linear-gradient(135deg, #7F5AF0 0%, #9F7AEA 100%)",
                color: "white",
                borderColor: "#7F5AF0",
                "&:hover": {
                  background: "linear-gradient(135deg, #6B47DC 0%, #8B5FD6 100%)",
                },
              },
              "&:hover": {
                bgcolor: "#F9FAFB",
              },
            },
          }}
        >
          <ToggleButton value="ALL">All</ToggleButton>
          <ToggleButton value="VALID">Valid</ToggleButton>
          <ToggleButton value="INVALID">Invalid</ToggleButton>
          <ToggleButton value="UNREADABLE">Unreadable</ToggleButton>
          <ToggleButton value="DUPLICATE">Duplicate</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        {paginatedHistory?.map((qrCode) => {
          const statusColor = getStatusColor(qrCode.status)
          return (
            <Card
              key={qrCode._id}
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #E5E7EB",
                  transition: "all 0.2s",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    borderColor: "#7F5AF0",
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(127, 90, 240, 0.2)",
                  },
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  {/* QR Code Image */}
                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "1",
                      maxWidth: 160,
                      bgcolor: statusColor.bg,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `2px solid ${statusColor.border}`,
                      mx: "auto",
                      mb: 2,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={qrCode.imageBase64 || "/placeholder.svg"}
                      alt="QR Code"
                      style={{ 
                        width: "90%", 
                        height: "90%", 
                        objectFit: "contain",
                        borderRadius: 6 
                      }}
                    />
                  </Box>

                  {/* Status Badge */}
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Chip
                      icon={getStatusIcon(qrCode.status)}
                      label={qrCode.status}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: statusColor.bg,
                        color: statusColor.text,
                        border: `1px solid ${statusColor.border}`,
                        "& .MuiChip-icon": { color: statusColor.text },
                      }}
                    />
                  </Box>

                  {/* QR Code Data */}
                  <Box sx={{ mb: 2, flexGrow: 1 }}>
                    <Typography variant="caption" sx={{ color: "#6B7280", display: "block", mb: 0.5, fontWeight: 600 }}>
                      QR Code Data
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#1C1B1F",
                        fontWeight: 500,
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        wordBreak: "break-all",
                        lineHeight: 1.4,
                        maxHeight: "3.6em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {qrCode.qrValue || "N/A"}
                    </Typography>
                  </Box>

                  {/* File Info */}
                  <Box sx={{ borderTop: "1px solid #E5E7EB", pt: 2 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: "#6B7280", 
                        display: "block", 
                        mb: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Page {qrCode.pageNumber}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: "#9CA3AF", 
                        display: "block",
                        fontSize: "0.7rem",
                      }}
                    >
                      {qrCode.processedAt && formatDate(qrCode.processedAt)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
          )
        })}
      </Box>

      {filteredHistory?.length === 0 && (
        <Box
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "#F8FAFC",
            border: "1px dashed #E5E7EB",
            borderRadius: 3,
            gridColumn: "1 / -1",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1C1B1F", mb: 0.5 }}>
            No {filter === "ALL" ? "" : filter.charAt(0) + filter.slice(1).toLowerCase() + " "}QR Codes Found
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280" }}>
            {filter === "ALL" 
              ? "This file doesn't contain any QR codes."
              : "Try selecting a different filter to view other QR codes from this file."}
          </Typography>
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mt: 3, flexWrap: "wrap" }}>
          <Box
            component="button"
            onClick={() => goToPage(1)}
            disabled={clampedPage === 1}
            sx={btnSx(false, clampedPage === 1)}
          >
            First
          </Box>
          <Box
            component="button"
            onClick={() => goToPage(clampedPage - 1)}
            disabled={clampedPage === 1}
            sx={btnSx(false, clampedPage === 1)}
          >
            Previous
          </Box>

          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((p) => {
            const active = p === clampedPage
            return (
              <Box
                key={p}
                component="button"
                onClick={() => goToPage(p)}
                disabled={active}
                sx={btnSx(active, active)}
                aria-current={active ? "page" : undefined}
              >
                {p}
              </Box>
            )
          })}

          <Box
            component="button"
            onClick={() => goToPage(clampedPage + 1)}
            disabled={clampedPage === totalPages}
            sx={btnSx(false, clampedPage === totalPages)}
          >
            Next
          </Box>
          <Box
            component="button"
            onClick={() => goToPage(totalPages)}
            disabled={clampedPage === totalPages}
            sx={btnSx(false, clampedPage === totalPages)}
          >
            Last
          </Box>
        </Box>
      )}
    </Box>
  )
}
