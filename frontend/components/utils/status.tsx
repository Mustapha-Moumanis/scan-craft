import { QRCodeStatus } from "@/types"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import WarningIcon from "@mui/icons-material/Warning"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"

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

export { getStatusColor, getStatusIcon }