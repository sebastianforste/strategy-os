// Native fetch is available in Node 18+

async function testGeneration(topic) {
  console.log(`\n--- Testing Topic: "${topic}" ---`);
  
  const response = await fetch('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: topic,
      apiKeys: { gemini: 'demo' }, // Use DEMO mode to test the pipeline without hitting Google's rate limits/latency
      personaId: 'cso',
      forceTrends: false,
      useRAG: false,
      platform: 'linkedin',
      fewShotExamples: ''
    })
  });

  if (!response.ok) {
    console.error(`FAILED: HTTP ${response.status}`);
    const text = await response.text();
    console.error(text);
    return;
  }

  const reader = response.body;
  // Node-fetch body is a stream
  let received = "";
  for await (const chunk of reader) {
    const text = chunk.toString();
    received += text;
    process.stdout.write(text.slice(0, 50) + "..."); // Print snippet
  }
  
  console.log(`\nSUCCESS. Received ${received.length} chars.`);
}

async function run() {
  await testGeneration("The death of the resume");
  await testGeneration("Remote work is a trap");
  await testGeneration("AI will replace middle management");
}

run();
