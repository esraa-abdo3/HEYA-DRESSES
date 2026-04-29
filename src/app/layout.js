import "./globals.css";
import Navbar from "./componets/navabar/Navbar";
import AuthProvider from "./providers/AuthProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
