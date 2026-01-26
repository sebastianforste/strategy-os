import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database Schema
interface VoiceTrainingDB extends DBSchema {
  trainingPosts: {
    key: string;
    value: TrainingPost;
  };
  trainingModels: {
    key: string;
    value: TrainingModel;
  };
}

export interface TrainingPost {
  id: string;
  content: string;
  source: 'manual' | 'linkedin' | 'file';
  createdAt: number;
}

export interface TrainingModel {
  id: string;
  name: string;
  status: 'preparing' | 'training' | 'completed' | 'failed';
  openaiModelId?: string; // e.g., "ft:gpt-4o-mini-2024-07-18:..."
  openaiJobId?: string;
  postCount: number;
  createdAt: number;
  completedAt?: number;
  error?: string;
}

const DB_NAME = 'strategyos-voice-training';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<VoiceTrainingDB> | null = null;

async function getDB(): Promise<IDBPDatabase<VoiceTrainingDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<VoiceTrainingDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('trainingPosts')) {
        db.createObjectStore('trainingPosts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('trainingModels')) {
        db.createObjectStore('trainingModels', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

// ==================== Training Posts ====================

export async function addTrainingPost(content: string, source: TrainingPost['source'] = 'manual'): Promise<TrainingPost> {
  const db = await getDB();
  
  const post: TrainingPost = {
    id: `post_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    content: content.trim(),
    source,
    createdAt: Date.now(),
  };

  await db.add('trainingPosts', post);
  return post;
}

export async function addTrainingPosts(posts: string[], source: TrainingPost['source'] = 'manual'): Promise<TrainingPost[]> {
  const db = await getDB();
  const tx = db.transaction('trainingPosts', 'readwrite');
  
  const trainingPosts = posts.map(content => ({
    id: `post_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    content: content.trim(),
    source,
    createdAt: Date.now(),
  }));

  await Promise.all(trainingPosts.map(post => tx.store.add(post)));
  await tx.done;

  return trainingPosts;
}

export async function getTrainingPosts(): Promise<TrainingPost[]> {
  const db = await getDB();
  return db.getAll('trainingPosts');
}

export async function deleteTrainingPost(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('trainingPosts', id);
}

export async function clearTrainingPosts(): Promise<void> {
  const db = await getDB();
  await db.clear('trainingPosts');
}

// ==================== Training Models ====================

export async function createTrainingModel(name: string): Promise<TrainingModel> {
  const db = await getDB();
  const posts = await getTrainingPosts();

  const model: TrainingModel = {
    id: `model_${Date.now()}`,
    name,
    status: 'preparing',
    postCount: posts.length,
    createdAt: Date.now(),
  };

  await db.add('trainingModels', model);
  return model;
}

export async function updateTrainingModel(id: string, updates: Partial<TrainingModel>): Promise<void> {
  const db = await getDB();
  const model = await db.get('trainingModels', id);
  
  if (!model) throw new Error('Model not found');

  const updated = { ...model, ...updates };
  await db.put('trainingModels', updated);
}

export async function getTrainingModels(): Promise<TrainingModel[]> {
  const db = await getDB();
  return db.getAll('trainingModels');
}

export async function getActiveModel(): Promise<TrainingModel | null> {
  const models = await getTrainingModels();
  return models.find(m => m.status === 'completed') || null;
}

export async function deleteTrainingModel(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('trainingModels', id);
}

// ==================== OpenAI Fine-tuning Integration ====================

export async function prepareTrainingData(): Promise<string> {
  const posts = await getTrainingPosts();
  
  if (posts.length < 10) {
    throw new Error('Minimum 10 posts required for training');
  }

  // Convert to OpenAI JSONL format
  // Each line is a complete training example
  const jsonlLines = posts.map(post => {
    return JSON.stringify({
      messages: [
        {
          role: "system",
          content: "You are a LinkedIn content creator. Write in this exact style and voice."
        },
        {
          role: "user",
          content: "Write a LinkedIn post about professional growth."
        },
        {
          role: "assistant",
          content: post.content
        }
      ]
    });
  });

  return jsonlLines.join('\n');
}

export async function startFineTuning(apiKey: string, modelName: string): Promise<TrainingModel> {
  const model = await createTrainingModel(modelName);

  try {
    // Prepare training data
    const trainingData = await prepareTrainingData();

    // Create a File object (for upload)
    const blob = new Blob([trainingData], { type: 'application/jsonl' });
    const file = new File([blob], 'training.jsonl', { type: 'application/jsonl' });

    // Upload training file to OpenAI
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'fine-tune');

    const uploadResponse = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(`File upload failed: ${error.error?.message || 'Unknown error'}`);
    }

    const uploadData = await uploadResponse.json();
    const fileId = uploadData.id;

    // Create fine-tuning job
    const jobResponse = await fetch('https://api.openai.com/v1/fine_tuning/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        training_file: fileId,
        model: 'gpt-4o-mini-2024-07-18',
        suffix: modelName.toLowerCase().replace(/\s+/g, '-'),
      }),
    });

    if (!jobResponse.ok) {
      const error = await jobResponse.json();
      throw new Error(`Fine-tuning job creation failed: ${error.error?.message || 'Unknown error'}`);
    }

    const jobData = await jobResponse.json();

    // Update model with job info
    await updateTrainingModel(model.id, {
      status: 'training',
      openaiJobId: jobData.id,
    });

    return model;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error during fine-tuning";
    await updateTrainingModel(model.id, {
      status: 'failed',
      error: errorMessage,
    });
    throw error;
  }
}

export async function checkTrainingStatus(modelId: string, apiKey: string): Promise<TrainingModel> {
  const db = await getDB();
  const model = await db.get('trainingModels', modelId);

  if (!model) throw new Error('Model not found');
  if (!model.openaiJobId) throw new Error('No training job found');

  const response = await fetch(`https://api.openai.com/v1/fine_tuning/jobs/${model.openaiJobId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to check training status');
  }

  const jobData = await response.json();

  // Update model based on job status
  if (jobData.status === 'succeeded' && jobData.fine_tuned_model) {
    await updateTrainingModel(modelId, {
      status: 'completed',
      openaiModelId: jobData.fine_tuned_model,
      completedAt: Date.now(),
    });
  } else if (jobData.status === 'failed') {
    await updateTrainingModel(modelId, {
      status: 'failed',
      error: jobData.error?.message || 'Training failed',
    });
  }

  return (await db.get('trainingModels', modelId))!;
}

// ==================== Validation ====================

export function validateTrainingPost(content: string): { valid: boolean; error?: string } {
  const trimmed = content.trim();
  
  if (trimmed.length < 100) {
    return { valid: false, error: 'Post must be at least 100 characters' };
  }

  if (trimmed.length > 3000) {
    return { valid: false, error: 'Post must be less than 3000 characters' };
  }

  return { valid: true };
}

export async function getTrainingStats() {
  const posts = await getTrainingPosts();
  const models = await getTrainingModels();
  
  return {
    totalPosts: posts.length,
    averageLength: posts.length > 0 
      ? Math.round(posts.reduce((sum, p) => sum + p.content.length, 0) / posts.length)
      : 0,
    totalModels: models.length,
    activeModel: models.find(m => m.status === 'completed') || null,
    canTrain: posts.length >= 10,
  };
}
