export const metadata = { title: "Walkthrough | WES", description: "Site walkthrough and bid calculator" };
export const viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false };
export default function RootLayout({ children }) {
  return (<html lang="en"><head><meta name="apple-mobile-web-app-capable" content="yes"/><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/></head><body style={{margin:0,background:"#f1f5f9",WebkitOverflowScrolling:"touch"}}>{children}</body></html>);
}
