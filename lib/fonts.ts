import { Archivo, Overpass_Mono } from "next/font/google";

export const archivo = Archivo({
  // Google's "latin" subset already covers French (é, à, ç, œ)
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

export const overpassMono = Overpass_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-overpass-mono",
});

export const fontVariables = `${archivo.variable} ${overpassMono.variable}`;
