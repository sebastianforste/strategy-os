export interface TrendResult {
  title: string;
  source: string;
  snippet: string;
  url: string;
}

export async function findTrends(topic: string, apiKey?: string): Promise<TrendResult[]> {
  // Check for Demo Mode
  if (!apiKey || apiKey.toLowerCase().trim() === "demo") {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));
    
    return [
      {
        title: `Big Move in ${topic} Markets`,
        source: "Bloomberg (Demo)",
        snippet: "In a surprise shift today, analysts confirm that the sector is pivoting...",
        url: "https://bloomberg.com/demo",
      },
      {
        title: `Why ${topic} is Overhyped`,
        source: "Reuters (Demo)",
        snippet: "Contrarian investors are shorting the trend, citing lack of fundamentals...",
        url: "https://reuters.com/demo",
      },
      {
         title: "The Silent Crash",
         source: "WSJ (Demo)",
         snippet: "While headlines look good, the underlying metrics tell a different story...",
         url: "https://wsj.com/demo"
      }
    ];
  }

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: `${topic} news business strategy last 24 hours`,
        num: 3,
        gl: "us",
        hl: "en"
      }),
    });

    if (!res.ok) {
       console.error(`Serper API Error: ${res.status} ${res.statusText}`);
       // Fallback to empty, don't crash
       return [];
    }

    const data = await res.json();
    
    // Serper returns { organic: [...], news: [...] }
    // We prefer news, but fallback to organic if needed
    const items = data.news || data.organic || [];
    
    return items.map((item: any) => ({
      title: item.title,
      source: item.source || item.siteName || "Web",
      snippet: item.snippet,
      url: item.link
    })).slice(0, 3);

  } catch (error) {
    console.error("Trend Hunt Failed:", error);
    return [];
  }
}
