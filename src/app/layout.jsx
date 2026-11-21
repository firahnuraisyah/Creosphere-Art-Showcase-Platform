import "./globals.css";

export const metadata = {
  title: {
    default: "creosphere — Pameran Seni Digital Global",
    template: "%s — creosphere",
  },
  description:
    "Ruang global bagi seniman untuk berbagi, memamerkan, dan mengapresiasi kreativitas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-light-background text-light-on-background selection:bg-light-primary-container selection:text-light-on-primary-container">
        {children}
      </body>
    </html>
  );
}
