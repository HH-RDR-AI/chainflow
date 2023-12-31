import "@/src/scss/index.scss";
import styles from "./layout.module.scss";
import { Sora, IBM_Plex_Sans_Condensed } from "next/font/google";
import Navigation from "@/src/components/Navigation";

import { Providers } from "./providers";
import { CSSProperties } from "react";

const fontSora = Sora({
  weight: ["400", "500"],
  subsets: ["latin-ext"],
  variable: "--font-sora",
});
const fontIbm = IBM_Plex_Sans_Condensed({
  weight: ["400", "500"],
  subsets: ["latin-ext"],
  variable: "--font-ibm",
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={
          {
            "--font-sora": fontSora.style.fontFamily,
            "--font-ibm": fontIbm.style.fontFamily,
          } as CSSProperties
        }
      >
        <Providers>
          <div className={styles.container}>
            <div className={styles.panel}>
              <Navigation />
            </div>
            <div className={styles.content}>{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
