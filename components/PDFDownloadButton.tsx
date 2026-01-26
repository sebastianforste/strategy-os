"use client";

import dynamic from "next/dynamic";
import { Download } from "lucide-react";
import React from 'react';

// Dynamically import the renderer components
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span className="text-xs">Loading...</span> }
);

interface PDFDownloadButtonProps {
  document: React.ReactElement;
  fileName: string;
}

export default function PDFDownloadButton({ document, fileName }: PDFDownloadButtonProps) {
  return (
    <div className="bg-white text-black px-4 py-2 rounded-lg font-bold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer">
      <Download className="w-4 h-4" />
      <PDFDownloadLink document={document} fileName={fileName}>
        {/* @ts-ignore */}
        {({ loading }) => (loading ? "GENERATING..." : "DOWNLOAD PDF")}
      </PDFDownloadLink>
    </div>
  );
}
