"use client";

import { useState } from "react";
import { Document, Page, Text, View, StyleSheet, pdf, Font } from "@react-pdf/renderer";
import { Loader2, FileText, Download } from "lucide-react";
import { generateCarouselStruct, CarouselData, CarouselSlide } from "../utils/carousel-service";

// Register custom fonts (optional, using standard fonts for now)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#000000', padding: 40 },
  slideContainer: { flex: 1, justifyContent: 'center', alignItems: 'flex-start' },
  title: { fontSize: 32, color: '#ffffff', marginBottom: 20, fontWeight: 'heavy' },
  body: { fontSize: 18, color: '#cccccc', lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 30, right: 40, fontSize: 10, color: '#666666' },
  watermark: { position: 'absolute', bottom: 30, left: 40, fontSize: 10, color: '#666666' },
});

// PDF Document Component
const CarouselDocument = ({ data }: { data: CarouselData }) => {
    const bgColors = {
        dark: "#000000",
        light: "#ffffff",
        navy: "#0a192f"
    };
    const textColors = {
        dark: "#ffffff",
        light: "#000000",
        navy: "#e6f1ff"
    };
    const subColors = {
        dark: "#999999",
        light: "#666666",
        navy: "#8892b0"
    };

    const bg = bgColors[data.theme] || bgColors.dark;
    const txt = textColors[data.theme] || textColors.dark;
    const sub = subColors[data.theme] || subColors.dark;

    return (
        <Document>
            {data.slides.map((slide, i) => (
                <Page key={i} size={[1080, 1080]} style={{ ...styles.page, backgroundColor: bg }}>
                    <View style={styles.slideContainer}>
                        <Text style={{ ...styles.title, color: txt }}>{slide.title}</Text>
                        <Text style={{ ...styles.body, color: sub }}>{slide.body}</Text>
                    </View>
                    <Text style={{ ...styles.footer, color: sub }}>
                        {slide.footer || `${i + 1} / ${data.slides.length}`} · StrategyOS
                    </Text>
                    {/* Optional User Handle Watermark */}
                </Page>
            ))}
        </Document>
    );
};

interface CarouselGeneratorProps {
  post: string;
  apiKey: string;
}

export default function CarouselGenerator({ post, apiKey }: CarouselGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CarouselData | null>(null);

  const handleGenerate = async () => {
      setLoading(true);
      const result = await generateCarouselStruct(post, apiKey);
      if (result) {
          setData(result);
      }
      setLoading(false);
  };

  const handleDownload = async () => {
      if (!data) return;
      const blob = await pdf(<CarouselDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carousel-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return (
    <div className="p-4 bg-black/40 border border-white/10 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
             <div className="p-1.5 bg-orange-500/10 rounded border border-orange-500/30">
                 <FileText className="w-4 h-4 text-orange-400" />
             </div>
             <h4 className="text-sm font-bold text-white">Carousel Factory</h4>
        </div>

        {!data ? (
            <div className="text-center py-8">
                <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                    CONVERT TO PDF CAROUSEL
                </button>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-neutral-400 font-mono uppercase">Slides: {data.slides.length}</span>
                        <span className="text-xs text-neutral-400 font-mono uppercase">Theme: {data.theme}</span>
                    </div>
                    <div className="aspect-square bg-neutral-900 rounded border border-white/10 flex items-center justify-center p-8 text-center">
                        <div>
                             <h5 className="text-white font-bold text-lg mb-2">{data.slides[0].title}</h5>
                             <p className="text-neutral-500 text-xs">{data.slides[0].body}</p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleDownload}
                    className="w-full bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                    <Download className="w-3 h-3" />
                    DOWNLOAD PDF
                </button>
            </div>
        )}
    </div>
  );
}
