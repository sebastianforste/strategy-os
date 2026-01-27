"use client";

import React from 'react';
import dynamic from "next/dynamic";
import { Download } from "lucide-react";
import CarouselPDF from "./CarouselPDF";
import { Slide } from "../utils/carousel-generator";

// Dynamically import PDFDownloadLink with SSR false to ensure it only runs on client
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span className="text-xs">Loading...</span> }
);

interface CarouselDownloadButtonProps {
  slides: Slide[];
  fileName: string;
}

export default function CarouselDownloadButton({ slides, fileName }: CarouselDownloadButtonProps) {
  return (
    <div className="bg-white text-black px-4 py-2 rounded-lg font-bold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer">
      <Download className="w-4 h-4" />
      <PDFDownloadLink 
        document={<CarouselPDF slides={slides} />} 
        fileName={fileName}
      >
        {({ loading }: { loading: boolean }) => (loading ? "GENERATING..." : "DOWNLOAD PDF")}
      </PDFDownloadLink>
    </div>
  );
}
