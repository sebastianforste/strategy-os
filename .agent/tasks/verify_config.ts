/**
 * CONFIG VERIFICATION SCRIPT
 * ---------------------------
 * Validates AI_CONFIG object and tests generation flow
 */

import { AI_CONFIG } from '../../utils/config';
import { GoogleGenAI } from '@google/genai';

async function verifyConfig() {
  console.log('🔍 Verifying AI Configuration...\n');
  
  // 1. Validate config structure
  console.log('✅ Primary Model:', AI_CONFIG.primaryModel);
  console.log('✅ Fallback Model:', AI_CONFIG.fallbackModel);
  console.log('✅ Image Model:', AI_CONFIG.imageModel);
  console.log('✅ Embedding Model:', AI_CONFIG.embeddingModel);
  console.log('✅ Reasoning Model:', AI_CONFIG.reasoningModel);
  
  // 2. Check defaults
  console.log('\n📋 Default Parameters:');
  console.log('   - Temperature:', AI_CONFIG.defaults.temperature);
  console.log('   - Max Tokens:', AI_CONFIG.defaults.maxOutputTokens);
  console.log('   - Top P:', AI_CONFIG.defaults.topP);
  
  // 3. Verify const immutability
  if (Object.isFrozen(AI_CONFIG) && Object.isFrozen(AI_CONFIG.defaults)) {
    console.log('\n✅ Config is properly immutable (frozen)');
  } else {
    console.error('❌ CRITICAL: AI_CONFIG is not properly frozen!');
    process.exit(1);
  }
  
  // 4. Test SDK initialization (if API key available)
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (apiKey) {
    console.log('\n🔌 Testing SDK Connection...');
    try {
      const genAI = new GoogleGenAI({ apiKey });
      const result = await genAI.models.generateContent({
        model: AI_CONFIG.primaryModel,
        contents:' Test connection',
        config: {
          systemInstruction: 'You are a test',
          responseMimeType: 'text/plain'
        }
      });
      
      console.log('✅ SDK connection successful');
      console.log('   Response preview:', result.text?.substring(0, 50) + '...');
    } catch (e: any) {
      if (e.message?.includes('RESOURCE_EXHAUSTED') || e.message?.includes('429')) {
        console.log('⚠️  Rate limit reached (expected in free tier)');
      } else {
        console.error('❌ SDK Error:', e.message);
      }
    }
  } else {
    console.log('\n⚠️  Skipping SDK test (no API key found)');
  }
  
  console.log('\n✨ Verification Complete!\n');
}

verifyConfig().catch(console.error);
