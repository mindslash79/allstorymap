import "./globals.css";

export const metadata = {
  title: "AllStory MVP",
  description: "AllStory MVP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
