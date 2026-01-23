export interface Template {
  id: string;
  name: string;
  content: string;
  tags: string[];
  createdAt: number;
}

const STORAGE_KEY = "strategyos_templates";

export const getTemplates = (): Template[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load templates", e);
    return [];
  }
};

export const saveTemplate = (template: Omit<Template, "id" | "createdAt">) => {
  const templates = getTemplates();
  const newTemplate: Template = {
    ...template,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  templates.push(newTemplate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return newTemplate;
};

export const deleteTemplate = (id: string) => {
  const templates = getTemplates().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

// Regex to find {{variable}} pattern
export const extractVariables = (content: string): string[] => {
  const regex = /{{([^}]+)}}/g;
  const matches = [...content.matchAll(regex)];
  // Return unique variable names
  return Array.from(new Set(matches.map(m => m[1])));
};

// Replace variables in content with values
export const fillTemplate = (content: string, values: Record<string, string>): string => {
  let result = content;
  Object.entries(values).forEach(([key, value]) => {
     // Replace all occurrences of {{key}}
     // We construct a regex to replace globally
     result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return result;
};
