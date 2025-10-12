"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Box, Card, CardContent, Typography, Chip, Snackbar, Alert, Grid, LinearProgress, Paper } from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import type { QRCode, QRCodeStatus } from "@/types"
import { useQRContext } from "@/context/qr-context"
import { QrCodeSection } from "./qrcode-section"
import { getStatusColor } from "./utils/status"

export default function UploadSection() {
	const [uploadingFile, setUploadingFile] = useState<{
		file: File
		progress: number
		status: "uploading" | "processing" | "complete"
	} | null>(null)
	const [processingQRCodes, setProcessingQRCodes] = useState<QRCode[]>([])
	const [qrProcessingProgress, setQrProcessingProgress] = useState<Record<string, number>>({})
	const [showSnackbar, setShowSnackbar] = useState(false)
	const [isDragging, setIsDragging] = useState(false)
	const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
	const { clearCurrentSession, addQRCodes, getCurrentSessionQRCodes } = useQRContext();
	const [currentFileName, setCurrentFileName] = useState<string | null>(null);
	const fetchedFilesRef = useRef<Set<string>>(new Set());

	const doUpload = async (file: File) => {
		const url = `${apiBase}/api/pdf/upload`
		const form = new FormData()
		form.append('file', file)

		try {
			const response = await fetch(url, {
				method: 'POST',
				body: form,
			})

			if (!response.ok) {
				throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
			}

			const json = await response.json()

			// Store the filename for filtering progress and results
			setCurrentFileName(json.fileName)

		} catch (err) {
			console.error('Upload error', err)
			setUploadingFile((prev) => (prev ? { ...prev, status: 'complete' } : prev))
		}
	}

	const fetchResults = useCallback(async (fileName: string) => {
		// Prevent duplicate fetches for the same file
		if (fetchedFilesRef.current.has(fileName)) {
			console.log(`Results for ${fileName} already fetched, skipping...`);
			return;
		}

		fetchedFilesRef.current.add(fileName);
		
		try {
			const res = await fetch(`${apiBase}/api/pdf/results?fileName=${encodeURIComponent(fileName)}`);
			const data = await res.json();

			if (Array.isArray(data) && data.length > 0) {
				addQRCodes(data);
				setUploadingFile((prev) => (prev ? { ...prev, status: 'complete', progress: 100 } : prev));
				setShowSnackbar(true);
			} else {
				console.warn("No QR codes found in results");
				addQRCodes([]);
			}
		} catch (err) {
			console.error("Error fetching results:", err);
			// Remove from set on error so it can be retried
			fetchedFilesRef.current.delete(fileName);
		}
	}, [apiBase, addQRCodes]);

	useEffect(() => {
		if (!currentFileName) return

		const sseUrl = `${apiBase}/api/pdf/progress?fileName=${encodeURIComponent(currentFileName)}`
		const es = new EventSource(sseUrl)
		let isDone = false

		es.onmessage = (e) => {
			try {
				const payload = JSON.parse(e.data)
				const { progress, status, fileName } = payload

				// Only process events for our current file
				if (fileName !== currentFileName) return

				// Update upload progress bar in realtime
				setUploadingFile((prev) =>
					prev
						? {
							...prev,
							progress: progress ?? prev.progress,
							status: status === 'done' ? 'complete' : prev.status,
						}
						: prev
				)

				// When done, fetch results for this specific file (only once)
				if (status === 'done' && !isDone) {
					isDone = true
					setTimeout(() => fetchResults(fileName), 500)
				}
			} catch (err) {
				console.error('SSE parse error', err)
			}
		}

		es.onerror = (err) => {
			console.error('SSE connection error', err)
			es.close()
		}

		return () => {
			es.close()
		}
	}, [currentFileName, fetchResults, apiBase])

	const handleFileUpload = useCallback((file: File) => {
		// Reset all previous data and clear the fetched files tracking
		fetchedFilesRef.current.clear();
		setUploadingFile({
			file,
			progress: 0,
			status: "uploading",
		})
		setCurrentFileName(null)
		clearCurrentSession();
		setQrProcessingProgress({})
		// start real upload
		doUpload(file)
	}, [clearCurrentSession, doUpload])

	useEffect(() => {
		if (uploadingFile?.status === 'complete') {
			const timer = setTimeout(() => {
				// setUploadingFile(null);
				// setCurrentFileName(null);
				setProcessingQRCodes([]);
				setQrProcessingProgress({});
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [uploadingFile]);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			setIsDragging(false)
			const file = e.dataTransfer.files[0]
			if (file && file.type === "application/pdf") {
				handleFileUpload(file)
			}
		},
		[handleFileUpload],
	)

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(true)
	}, [])

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
	}, [])

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0]
			if (file && file.type === "application/pdf") {
				handleFileUpload(file)
			}
		},
		[handleFileUpload],
	)

	return (
		<Box>
			<Card
				sx={{
					mb: 4,
					bgcolor: "white",
					borderRadius: 3,
					boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
					border: isDragging ? "2px dashed #7F5AF0" : "2px dashed transparent",
					transition: "all 0.3s",
				}}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
			>
				<CardContent sx={{ p: 4 }}>
					<Box sx={{ textAlign: "center" }}>
						<Box
							sx={{
								width: 80,
								height: 80,
								borderRadius: "50%",
								background: "linear-gradient(135deg, #F3E8FF 0%, #E0E7FF 100%)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								mx: "auto",
								mb: 3,
							}}
						>
							<CloudUploadIcon sx={{ fontSize: 40, color: "#7F5AF0" }} />
						</Box>
						<Typography variant="h6" sx={{ mb: 1, color: "#1C1B1F", fontWeight: 600 }}>
							Upload PDF File
						</Typography>
						<Typography variant="body2" sx={{ mb: 3, color: "#6B7280" }}>
							Drag and drop your PDF here, or click to browse
						</Typography>
						<input
							type="file"
							accept="application/pdf"
							onChange={handleFileSelect}
							style={{ display: "none" }}
							id="file-upload"
						/>
						<label htmlFor="file-upload">
							<Box
								component="span"
								sx={{
									display: "inline-block",
									px: 4,
									py: 1.5,
									borderRadius: 2,
									background: "linear-gradient(135deg, #7F5AF0 0%, #9F7AEA 100%)",
									color: "white",
									fontWeight: 600,
									cursor: "pointer",
									transition: "all 0.2s",
									"&:hover": {
										transform: "translateY(-2px)",
										boxShadow: "0 8px 16px rgba(127, 90, 240, 0.3)",
									},
								}}
							>
								Select PDF
							</Box>
						</label>
					</Box>

					{uploadingFile && (
						<Paper
							sx={{
								mt: 4,
								p: 3,
								bgcolor: "#F9FAFB",
								borderRadius: 2,
								border: "1px solid #E5E7EB",
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
								<InsertDriveFileIcon sx={{ color: "#7F5AF0", fontSize: 32 }} />
								<Box sx={{ flex: 1 }}>
									<Typography variant="body2" sx={{ fontWeight: 600, color: "#1C1B1F", mb: 0.5 }}>
										{uploadingFile.file.name}
									</Typography>
									<Typography variant="caption" sx={{ color: "#6B7280" }}>
										{(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB •{" "}
										{uploadingFile.status === "uploading"
											? "Uploading..."
											: uploadingFile.status === "processing"
												? "Processing QR codes..."
												: "Complete"}
									</Typography>
								</Box>
								<Typography variant="body2" sx={{ fontWeight: 600, color: "#7F5AF0" }}>
									{uploadingFile.progress.toFixed(0)}%
								</Typography>
							</Box>
							<LinearProgress
								variant="determinate"
								value={uploadingFile.progress}
								sx={{
									height: 8,
									borderRadius: 4,
									bgcolor: "#E5E7EB",
									"& .MuiLinearProgress-bar": {
										background: "linear-gradient(90deg, #7F5AF0 0%, #9F7AEA 100%)",
										borderRadius: 4,
									},
								}}
							/>
						</Paper>
					)}
				</CardContent>
			</Card>

			{uploadingFile?.status === "complete" && (
				<QrCodeSection />
			)}

			<Snackbar
				open={showSnackbar}
				autoHideDuration={2000}
				onClose={() => setShowSnackbar(false)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				<Alert
					severity="success"
					sx={{
						width: "100%",
						bgcolor: "#D1FAE5",
						color: "#065F46",
						"& .MuiAlert-icon": { color: "#065F46" },
						borderRadius: 2,
						boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
					}}
				>
					Processing complete
				</Alert>
			</Snackbar>
		</Box>
	)
}
