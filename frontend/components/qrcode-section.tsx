import { useQRContext } from "@/context/qr-context"
import { Card, CardContent, Chip, Typography, Box, ToggleButtonGroup, ToggleButton } from "@mui/material"
import { QrCodeIcon } from 'lucide-react'
import { getStatusColor, getStatusIcon } from "./utils/status"
import { useState, useEffect } from "react"
import type { QRCodeStatus } from "@/types"

export const QrCodeSection = () => {
	const { allQRCodes } = useQRContext()
	const [currentPage, setCurrentPage] = useState(1)
	const [filter, setFilter] = useState<"ALL" | QRCodeStatus>("ALL")

	const pageSize = 8

	// Reset filter and page when new QR codes are loaded (new upload)
	useEffect(() => {
		setCurrentPage(1)
		setFilter("ALL")
	}, [allQRCodes?.length])

	// Reset to page 1 when filter changes
	useEffect(() => {
		setCurrentPage(1)
	}, [filter])

	const btnSx = (active = false, disabled = false) => ({
		px: 1.5,
		py: 0.75,
		borderRadius: 1,
		border: "1px solid",
		borderColor: active ? "#4F46E5" : "#E5E7EB",
		bgcolor: active ? "#EEF2FF" : "white",
		color: active ? "#4F46E5" : "#111827",
		fontSize: "0.875rem",
		fontWeight: 600,
		cursor: disabled ? "not-allowed" : "pointer",
		opacity: disabled ? 0.5 : 1,
		"&:hover": { bgcolor: active ? "#EEF2FF" : "#F9FAFB" },
	})

	// Filter QR codes by status
	const filteredQRCodes = allQRCodes?.filter((qrCode) => {
		if (filter === "ALL") return true
		return qrCode?.status === filter
	}) || []

	if (allQRCodes === null) {
		return (
			<Box>
				<Typography variant="h6" sx={{ mb: 3, color: "#1C1B1F", fontWeight: 600 }}>
					Detected QR Codes
				</Typography>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "repeat(1, 1fr)",
							sm: "repeat(2, 1fr)",
							md: "repeat(3, 1fr)",
							lg: "repeat(4, 1fr)",
						},
						gap: 3,
					}}
				>
					{Array.from({ length: pageSize }).map((_, index) => (
						<Card key={index} sx={{ bgcolor: "#F3F4F6", borderRadius: 3, height: 300 }}></Card>
					))}
				</Box>
			</Box>
		);
	}

	const totalPages = Math.max(1, Math.ceil(filteredQRCodes.length / pageSize))
	const clampedPage = Math.min(Math.max(currentPage, 1), totalPages)
	const start = (clampedPage - 1) * pageSize
	const end = start + pageSize

	const goToPage = (p: number) => {
		const target = Math.min(Math.max(p, 1), totalPages)
		setCurrentPage(target)
	}
	
	if (allQRCodes.length === 0) {
		return (
			<Box>
				<Typography variant="h6" sx={{ mb: 3, color: "#1C1B1F", fontWeight: 600 }}>
					Detected QR Codes (0)
				</Typography>
				<Box
					sx={{
						p: 4,
						textAlign: "center",
						bgcolor: "#F8FAFC",
						border: "1px dashed #E5E7EB",
						borderRadius: 3,
					}}
				>
					<Box
						sx={{
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							width: 72,
							height: 72,
							borderRadius: "50%",
							bgcolor: "#EEF2FF",
							mb: 1.5,
						}}
					>
						<QrCodeIcon color="#4F46E5" size={36} />
					</Box>
					<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
						No QR found
					</Typography>
					<Typography variant="body2" sx={{ color: "#6B7280" }}>
						Upload other PDF files to extract and validate QR codes
					</Typography>
				</Box>
			</Box>
		)
	}

	// Check if filtered results are empty
	if (filteredQRCodes.length === 0 && filter !== "ALL") {
		return (
			<Box>
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
					<Typography variant="h6" sx={{ color: "#1C1B1F", fontWeight: 600 }}>
						Detected QR Codes ({filteredQRCodes.length})
					</Typography>
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
						p: 4,
						textAlign: "center",
						bgcolor: "#F8FAFC",
						border: "1px dashed #E5E7EB",
						borderRadius: 3,
					}}
				>
					<Box
						sx={{
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							width: 72,
							height: 72,
							borderRadius: "50%",
							bgcolor: "#EEF2FF",
							mb: 1.5,
						}}
					>
						<QrCodeIcon color="#4F46E5" size={36} />
					</Box>
					<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
						No {filter.charAt(0) + filter.slice(1).toLowerCase()} QR Codes Found
					</Typography>
					<Typography variant="body2" sx={{ color: "#6B7280" }}>
						Try selecting a different filter to view other QR codes
					</Typography>
				</Box>
			</Box>
		)
	}

	// Compute a compact page range around the current page (max 5 buttons)
	const maxButtons = 5
	let startPage = Math.max(1, clampedPage - Math.floor(maxButtons / 2))
	let endPage = startPage + maxButtons - 1
	if (endPage > totalPages) {
		endPage = totalPages
		startPage = Math.max(1, endPage - maxButtons + 1)
	}

	return (
		<Box>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
				<Typography variant="h6" sx={{ color: "#1C1B1F", fontWeight: 600 }}>
					Detected QR Codes ({filteredQRCodes.length})
				</Typography>
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
				{filteredQRCodes
					.slice(start, end)
					.map((qrCode, index) => {
						const statusColor = getStatusColor(qrCode.status)
						const filename = qrCode.fileName.replace(/-\d+-\d+(\.[a-zA-Z0-9]+)$/, "$1")
						return (
							<Card
								key={index}
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
											bgcolor: statusColor?.bg,
											borderRadius: 2,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											border: `2px solid ${statusColor?.border}`,
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
												bgcolor: statusColor?.bg,
												color: statusColor?.text,
												border: `1px solid ${statusColor?.border}`,
												"& .MuiChip-icon": { color: statusColor?.text },
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
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
										>
											{filename}
										</Typography>
									</Box>
								</CardContent>
							</Card>
						)
					})}
			</Box>

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