import { Achievement } from '@common/models/achievement';

export const ACHIEVEMENT_COMPLETED_GAMES: Achievement = {
    name: 'Parties complétées',
    description: 'Nombres de parties complétées',
    defaultImage: 'https://ucarecdn.com/98e747fd-296e-492f-99ca-ef11d55c7c03/',
    zeroValue: 0,
    levels: [
        {
            value: 1,
            image: 'https://ucarecdn.com/7b28f1de-ac28-4611-8a9b-3ac45b518744/',
        },
        {
            value: 10,
            image: 'https://ucarecdn.com/207e8251-e839-4741-b6b1-9d4618530fe3/',
        },
        {
            value: 25,
            image: 'https://ucarecdn.com/2c4a1bae-0d31-42a7-a153-5b6d2c610c68/',
        },
        {
            value: 50,
            image: 'https://ucarecdn.com/4becb1c5-637d-4309-bca2-f10761540069/',
        },
    ],
};

export const ACHIEVEMENT_WON_GAMES: Achievement = {
    name: 'Parties gagnées',
    description: 'Nombres de parties gagnées',
    defaultImage: 'https://ucarecdn.com/69f05dfb-888a-45ff-94b6-d183f106f27c/',
    zeroValue: 0,
    levels: [
        {
            value: 1,
            image: 'https://ucarecdn.com/cc06479d-f5c3-425e-b3a6-d0e6ead4c9a1/',
        },
        {
            value: 5,
            image: 'https://ucarecdn.com/366254e3-4843-45a1-89d8-8bd3cac3f61c/',
        },
        {
            value: 15,
            image: 'https://ucarecdn.com/d3c1b951-2442-4fbf-90e4-2e50ad1b0b99/',
        },
        {
            value: 25,
            image: 'https://ucarecdn.com/aa9a30e5-79fa-4bd5-b1e2-40a06137b937/',
        },
    ],
};

export const ACHIEVEMENT_CONSECUTIVE_DAYS: Achievement = {
    name: 'Jours consécutifs',
    description: 'Nombre de jours consécutifs avec une partie jouée (les journées changent à 8 P.M.)',
    defaultImage: 'https://ucarecdn.com/a779d441-8640-43b8-bba8-9d72c3121c8a/',
    zeroValue: 0,
    levels: [
        {
            value: 3,
            image: 'https://ucarecdn.com/bb6375cb-e79c-4823-834e-a495f56b0742/',
        },
        {
            value: 5,
            image: 'https://ucarecdn.com/203af1de-5fdf-48e7-84a4-b1a7f40788ea/',
        },
        {
            value: 10,
            image: 'https://ucarecdn.com/293b29c3-0d49-4ff1-892b-219ae636ced7/',
        },
        {
            value: 15,
            image: 'https://ucarecdn.com/3387815a-0833-4f54-9f23-e71998ca62e2/',
        },
    ],
};

export const ACHIEVEMENT_POINTS: Achievement = {
    name: 'Points accumulés',
    description: 'Nombre total de points accumulés durant les parties',
    defaultImage: 'https://ucarecdn.com/7f1f63cd-2234-4fd6-931d-156267f6e2a8/',
    zeroValue: 0,
    levels: [
        {
            value: 100,
            image: 'https://ucarecdn.com/77b5908a-4a8b-4bfa-88fc-3f2b806803c2/',
        },
        {
            value: 500,
            image: 'https://ucarecdn.com/e6cdba80-07c4-49d6-9465-40984e51ea38/',
        },
        {
            value: 2500,
            image: 'https://ucarecdn.com/e5ac7d4d-e30e-46e9-9cda-01cdc14ac9d6/',
        },
        {
            value: 5000,
            image: 'https://ucarecdn.com/d664a103-ea73-4bb1-b7f6-24414cd64120/',
        },
    ],
};

export const ACHIEVEMENT_BINGO: Achievement = {
    name: 'Bingo complétés',
    description: 'Nombre de fois où les 7 tuiles ont été utilisées pour former un mot',
    defaultImage: 'https://ucarecdn.com/bf9f4210-cf9d-425d-bd01-5e9e43a84cd7/',
    zeroValue: 0,
    levels: [
        {
            value: 1,
            image: 'https://ucarecdn.com/533fe4ef-1d98-485e-b16c-4d37ad30e03b/',
        },
        {
            value: 5,
            image: 'https://ucarecdn.com/d7de84cb-723b-40b4-a895-1f79dd812fe3/',
        },
        {
            value: 10,
            image: 'https://ucarecdn.com/d522239e-154d-4291-98f0-7a79eff7a634/',
        },
        {
            value: 20,
            image: 'https://ucarecdn.com/85e717c0-68ab-4369-87bc-413608f5963f/',
        },
    ],
};

export const ACHIEVEMENT_ELO: Achievement = {
    name: 'Sommet personnel',
    description: 'Valeur de ELO maximale atteinte',
    defaultImage: 'https://ucarecdn.com/8e17c136-1beb-4dc7-aabe-f9321b9c61b2/',
    zeroValue: 1000,
    levels: [
        {
            value: 1050,
            image: 'https://ucarecdn.com/d4d66dd1-95ef-4363-865f-64b0394f8f6f/',
        },
        {
            value: 1200,
            image: 'https://ucarecdn.com/ad7fa8c5-66ce-4115-8e16-ddfce33273f2/',
        },
        {
            value: 1400,
            image: 'https://ucarecdn.com/6b2750e6-b9d0-4539-acd3-9b84522897cd/',
        },
        {
            value: 1600,
            image: 'https://ucarecdn.com/90665ea4-4241-4ba5-99cb-7cef45e978e9/',
        },
    ],
};

export const ACHIEVEMENTS: Achievement[] = [
    ACHIEVEMENT_COMPLETED_GAMES,
    ACHIEVEMENT_WON_GAMES,
    ACHIEVEMENT_CONSECUTIVE_DAYS,
    ACHIEVEMENT_POINTS,
    ACHIEVEMENT_BINGO,
    ACHIEVEMENT_ELO,
];
