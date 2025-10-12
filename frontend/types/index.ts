export type QRCodeStatus = "VALID" | "INVALID" | "UNREADABLE" | "DUPLICATE"

export interface QRCode {
  _id: string
  qrValue: string
  status: QRCodeStatus
  pageNumber: number
  imageBase64: string
  processedAt?: Date
  createdAt?: Date
  fileName: string
}

export interface UploadingFile {
  id: string
  file: File
  progress: number
  status: "uploading" | "processing" | "complete" | "error"
  qrCodes: QRCode[]
}
