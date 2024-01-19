export interface Achievement {
    name: string;
    description: string;
    defaultImage: string;
    zeroValue: number;
    levels: AchievementLevel[];
}

export interface AchievementLevel {
    value: number;
    image: string;
}

export interface UserAchievement {
    achievement: Achievement;
    level: AchievementLevel | undefined;
    levelIndex: number | undefined;
    value: number;
}
