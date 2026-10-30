import "./globals.css";
import ReduxProvider from "@/redux/Provider";

export const metadata = {
  title: "Doctor Tracker",
  description: "Doctor and Patient Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}