/**
 * Workspace Service
 * Manages local multi-tenancy for Team Workspaces.
 */

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: number;
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: number;
  members: TeamMember[];
  settings?: {
    brandColor?: string;
    toneOfVoice?: string;
  };
}

const STORAGE_KEY_WORKSPACES = "strategyos_workspaces";
const STORAGE_KEY_ACTIVE_WORKSPACE = "strategyos_active_workspace_id";

const DEFAULT_WORKSPACE: Workspace = {
  id: "default",
  name: "Personal",
  createdAt: Date.now(),
  members: [
    {
      id: "me",
      name: "You",
      email: "you@example.com",
      role: "admin",
      joinedAt: Date.now(),
    }
  ]
};

export function getWorkspaces(): Workspace[] {
  if (typeof window === "undefined") return [DEFAULT_WORKSPACE];
  
  const stored = localStorage.getItem(STORAGE_KEY_WORKSPACES);
  if (!stored) {
    // Initialize with default
    localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify([DEFAULT_WORKSPACE]));
    return [DEFAULT_WORKSPACE];
  }
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [DEFAULT_WORKSPACE];
  }
}

export function getActiveWorkspaceId(): string {
  if (typeof window === "undefined") return "default";
  return localStorage.getItem(STORAGE_KEY_ACTIVE_WORKSPACE) || "default";
}

export function setActiveWorkspaceId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_ACTIVE_WORKSPACE, id);
  // Reload page to refresh all components (simple approach for MVP)
  window.location.reload(); 
}

export function createWorkspace(name: string): Workspace {
  const workspaces = getWorkspaces();
  const newWorkspace: Workspace = {
    id: "ws_" + Math.random().toString(36).substring(2, 9),
    name,
    createdAt: Date.now(),
    members: [
        {
          id: "me",
          name: "You",
          email: "you@example.com",
          role: "admin",
          joinedAt: Date.now(),
        }
    ]
  };
  
  workspaces.push(newWorkspace);
  localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(workspaces));
  
  // Auto-switch to new workspace
  setActiveWorkspaceId(newWorkspace.id);
  
  return newWorkspace;
}

export function updateWorkspace(id: string, updates: Partial<Workspace>): void {
  const workspaces = getWorkspaces();
  const index = workspaces.findIndex(w => w.id === id);
  if (index !== -1) {
    workspaces[index] = { ...workspaces[index], ...updates };
    localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(workspaces));
  }
}

export function addMember(workspaceId: string, email: string, role: TeamMember['role']): void {
    const workspaces = getWorkspaces();
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
        workspace.members.push({
            id: "mem_" + Math.random().toString(36).substring(2),
            name: email.split('@')[0], // Mock name from email
            email,
            role,
            joinedAt: Date.now()
        });
        localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(workspaces));
    }
}
