export interface VirtualPlayer {
    idVirtualPlayer: number;
    name: string;
    level: string;
    isDefault: boolean;
}

export interface VirtualPlayerData extends Omit<VirtualPlayer, 'idVirtualPlayer' | 'isDefault'> {
    idVirtualPlayer?: number;
}

export interface VirtualPlayerProfilesData {
    virtualPlayerProfiles: VirtualPlayer[];
}
