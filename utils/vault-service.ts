
export type AssetType = 'viral_hook' | 'lead_magnet' | 'growth_scenario' | 'post_draft' | 'meeting_summary';

export interface VaultAsset {
    id: string;
    type: AssetType;
    content: any; // Flexible payload
    title: string;
    tags: string[];
    createdAt: number;
    isFavorite: boolean;
}

export class VaultService {
    private readonly STORAGE_KEY = 'strategy_os_vault_v1';

    getAllAssets(): VaultAsset[] {
        if (typeof window === 'undefined') return [];
        const raw = localStorage.getItem(this.STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    }

    getAssetsByType(type: AssetType): VaultAsset[] {
        return this.getAllAssets().filter(a => a.type === type);
    }

    saveAsset(type: AssetType, content: any, title: string, tags: string[] = []): VaultAsset {
        const assets = this.getAllAssets();
        const newAsset: VaultAsset = {
            id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            content,
            title,
            tags,
            createdAt: Date.now(),
            isFavorite: false
        };
        
        assets.unshift(newAsset); // Add to top
        this.persist(assets);
        return newAsset;
    }

    deleteAsset(id: string) {
        const assets = this.getAllAssets().filter(a => a.id !== id);
        this.persist(assets);
    }

    toggleFavorite(id: string) {
        const assets = this.getAllAssets().map(a => {
            if (a.id === id) {
                return { ...a, isFavorite: !a.isFavorite };
            }
            return a;
        });
        this.persist(assets);
    }

    private persist(assets: VaultAsset[]) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assets));
    }
}
