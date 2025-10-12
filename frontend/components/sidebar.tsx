"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material"
import DashboardIcon from "@mui/icons-material/Dashboard"
import HistoryIcon from "@mui/icons-material/History"
import MenuIcon from "@mui/icons-material/Menu"

const drawerWidth = 260

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "History", icon: <HistoryIcon />, path: "/history" },
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo/Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >

		<Image src="/logo.svg" alt="ScanCraft logo" width={32} height={32} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#1C1B1F",
            letterSpacing: "-0.02em",
          }}
        >
          Scan Craft
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 3 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  bgcolor: isActive ? "rgba(127, 90, 240, 0.1)" : "transparent",
                  color: isActive ? "#7F5AF0" : "#6B7280",
                  "&:hover": {
                    bgcolor: isActive ? "rgba(127, 90, 240, 0.15)" : "rgba(0, 0, 0, 0.04)",
                  },
                  transition: "all 0.2s",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#7F5AF0" : "#6B7280",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
          }}
        >
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              bgcolor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "&:hover": {
                bgcolor: "#F9FAFB",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            bgcolor: "white",
            borderRight: "1px solid #E5E7EB",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            bgcolor: "white",
            borderRight: "1px solid #E5E7EB",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  )
}
