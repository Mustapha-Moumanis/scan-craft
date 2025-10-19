const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://scan-craft.mustapha-moumanis.me/api/";

export interface QRCode {
  _id: string;
  fileName: string;
  pageNumber: number;
  qrValue: string;
  status: "VALID" | "INVALID" | "UNREADABLE" | "DUPLICATE";
  imageBase64: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryFile {
  fileName: string;
  qrCount: number;
  processedAt: string;
  validCount: number;
  invalidCount: number;
  unreadableCount: number;
  duplicateCount: number;
}

export interface UploadResponse {
  message: string;
  fileName: string;
}

// Upload PDF file
export const uploadPdf = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/pdf/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Fetch QR results for a specific file
export const fetchQRResults = async (fileName: string): Promise<QRCode[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/pdf/results?fileName=${encodeURIComponent(fileName)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch results: ${response.status}`);
  }

  return response.json();
};

// Fetch history of all processed files
export const fetchHistory = async (): Promise<HistoryFile[]> => {
  const response = await fetch(`${API_BASE_URL}/api/pdf/history`);

  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.status}`);
  }

  return response.json();
};

