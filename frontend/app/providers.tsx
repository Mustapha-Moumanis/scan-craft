"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QRProvider } from "@/context/qr-context";
import { Suspense } from "react";

const theme = createTheme({
  palette: {
    primary: { main: "#7F5AF0" },
    background: { default: "#F8F9FF" },
  },
  typography: { fontFamily: "var(--font-geist-sans)" },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={<div>Loading...</div>}>
          <QRProvider>{children}</QRProvider>
        </Suspense>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
