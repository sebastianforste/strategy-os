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
  geminiModelId?: string; // e.g., "tunedModels/my-model-123"
  geminiOperationName?: string; // For tracking status
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

// ==================== Google Gemini Fine-tuning Integration ====================

interface TuningExample {
  text_input: string;
  output: string;
}

interface TuningDataset {
  examples: TuningExample[];
}

export async function prepareTrainingData(): Promise<TuningDataset> {
  const posts = await getTrainingPosts();
  
  if (posts.length < 10) {
    throw new Error('Minimum 10 posts required for training');
  }

  // Convert to Gemini format
  const examples: TuningExample[] = posts.map(post => ({
    text_input: "Write a high-status LinkedIn post about professional strategy in your unique voice.",
    output: post.content
  }));

  return { examples };
}

export async function startFineTuning(apiKey: string, modelName: string): Promise<TrainingModel> {
  const model = await createTrainingModel(modelName);

  try {
    const trainingData = await prepareTrainingData();

    // Direct REST call to tunedModels.create
    // https://ai.google.dev/api/tuning
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/tunedModels?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        displayName: modelName,
        baseModel: "models/gemini-1.5-flash-001-tuning",
        tuningTask: {
          hyperparameters: {
            batchSize: 4,
            learningRate: 0.001,
            epochCount: 5,
          },
          trainingData: trainingData
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Fine-tuning failed: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch (e) {
        // ignore json parse error
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // The API returns an Operation object or the TunedModel if immediate (unlikely)
    // Typically: { name: "tunedModels/...", metadata: { ... } }
    // Actually for 'create', it returns metadata about the operation.
    // Wait, the v1beta returns metadata including 'name' (operation name) and 'metadata.tunedModel' (the future model name).
    
    // Let's assume standard Operation format: "operations/..."
    if (!data.name) throw new Error("No operation name returned from Gemini API");

    // The 'metadata' field usually contains the 'tunedModel' name being created
    const pendingModelName = data.metadata?.tunedModel || ""; 

    await updateTrainingModel(model.id, {
      status: 'training',
      geminiOperationName: data.name,
      geminiModelId: pendingModelName 
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
  if (!model.geminiOperationName && !model.geminiModelId) throw new Error('No training operation found');

  // If we already have a model ID and it's marked completed, just return it.
  // But maybe we want to refresh status if we pressed "Check Status".
  
  // 1. If we have an operation name, check that first.
  if (model.geminiOperationName) {
    const opResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model.geminiOperationName}?key=${apiKey}`);
    
    if (opResponse.ok) {
        const opData = await opResponse.json();
        
        // Check if done
        if (opData.done) {
            if (opData.error) {
                 await updateTrainingModel(modelId, {
                    status: 'failed',
                    error: opData.error.message || "Training failed",
                    geminiOperationName: undefined // Clear op to stop checking
                });
            } else {
                 // Success!
                 // The result usually contains the TunedModel resource
                 const tunedModelName = opData.response?.name || opData.metadata?.tunedModel;
                 
                 await updateTrainingModel(modelId, {
                    status: 'completed',
                    geminiModelId: tunedModelName, 
                    completedAt: Date.now(),
                    geminiOperationName: undefined // Clear op
                });
            }
             return (await db.get('trainingModels', modelId))!;
        } else {
            // Still running
            return model;
        }
    }
  }

  // 2. If we only have a model ID (or operation check failed/expired), check the model resource directly
  if (model.geminiModelId) {
      const modelResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model.geminiModelId}?key=${apiKey}`);
      if (modelResponse.ok) {
          const modelData = await modelResponse.json();
          if (modelData.state === "ACTIVE") {
               await updateTrainingModel(modelId, {
                  status: 'completed',
                  completedAt: model.completedAt || Date.now()
              });
          } else if (modelData.state === "FAILED") {
               await updateTrainingModel(modelId, {
                  status: 'failed',
                  error: "Model state is FAILED"
              });
          }
      }
  }

  return (await db.get('trainingModels', modelId))!;
}

// ==================== Validation ====================

export function validateTrainingPost(content: string): { valid: boolean; error?: string } {
  const trimmed = content.trim();
  
  if (trimmed.length < 100) {
    return { valid: false, error: 'Post must be at least 100 characters' };
  }

  if (trimmed.length > 50000) { // Gemini can handle more ctx
    return { valid: false, error: 'Post must be less than 50000 characters' };
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
