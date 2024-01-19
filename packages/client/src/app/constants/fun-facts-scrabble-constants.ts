import { Random } from '@app/utils/random/random';

export const FUN_FACTS: string[] = [
    'MONOPRIX, UNIPRIX et PRISUNIC : ces noms déposés de magasins sont considérés comme des noms communs et donc acceptés au Scrabble.',

    'Bien que les mots DROÏDE et CYBORG soient issus de la science-fiction, ils sont tous les deux valables au Scrabble.',

    "Le scrabble de huit lettres le plus cher est WHISKEYS placé sur deux cases « Mot compte triple » et avec le K placé sur la case \
    « Lettre compte double ». Placé ainsi, ce mot rapporte 482 points. Ceci s'appelle un nonuple, car le score du mot est multiplié \
    par trois à deux reprises, c'est-à-dire par neuf.",

    "En 1931, le nom original de Scrabble était « Lexico ». Elle n'avait pas de plateau et se jouait uniquement avec des tuiles.",

    "L'inventeur du Scrabble, Alfred Butts, a décidé de la fréquence et de la distribution des lettres en analysant la première \
    page du New York Times.",

    'Le jeu Scrabble est vendu dans 121 pays et est disponible en 31 langues différentes.',

    'Au Scrabble anglophone, le joueur compétition Benjamin Woo a déjà récolté 1782 en un seul tour. Pour obtenir ces points, il \
    a formé le mot OXYPHENBUTAZONE dans le haut du tableau, frappant trois cases « Mot compte triple » tout en faisant sept mots \
    croisés vers le bas.',

    "Les jeux de Scrabble n'ont pas tous le même nombre de tuiles! La plupart des éditions possèdent 100 jetons, comme la \
    version anglaise originale. L'édition en français en comporte 102, et celle en arménien en compte 146!",

    "La version portugaise du jeu Scrabble n'a pas de K, de W ni de Y, mais possède un Ç.",

    "En 1985, deux militaires ont joué au Scrabble pendant cinq jours consécutifs pour passer le temps alors qu'ils étaient tous \
    les deux piégés dans une crevasse en Antarctique.",

    'Dans la version francophone, il y a 81 mots de 2 lettres acceptés : aa, ah, ai, aï, an, as, au, ay, ba, bê, bi, bu, çà, ça, ce, \
    ci, da, de, dé, do, du, dû, dû, eh, en, es, ès, et, eu, ex, fa, fi, go, ha, hé, hi, ho, if, il, in, je, ka, la, là, la, le, lé, li, \
    lu, ma, me, mi, mu, mû, na, ne, né, né, ni, nô, nu, oc, oh, om, on, or, os, ou, où, pi, pu, qi, ra, ré, ri, ru, sa, se, si, su, ta, \
    te, té, to, tô, tu, ud, un, us, ut, va, vé, vs, vu, wu et xi.',

    'Dans la version anglophone du Scrabble, il y a seulement 2 lettres qui valent 10 points : Q et Z. Dans la version francophone, il y en a \
    5 : K, W, X, Y et Z.',

    "Il y a 19 tuiles portant la lettre A dans la version malaisienne du Scrabble. Cela représente près d'un cinquième du nombre total \
    de tuiles du jeu!",

    "En 1993, le champion du monde anglophone Mark Nyman, du Royaume-Uni, a appris 10 000 mots de l'American Dictionary afin de \
    se préparer pour le tournoi à venir.",

    'Le Québécois Francis Desjardins a été couronné Champion du monde de Scrabble Classique de 2019.',

    'Le champion du monde de Scrabble Classique de 2019, le Québécois Francis Desjardins, conseille de « bien apprendre les mots \
    de deux à cinq lettres qui sont formés avec les lettres chères, les fameux J, K, Q, W, X, Y, Z. Il n’y en a pas tant que ça \
    et ces mots peuvent permettre de faire beaucoup de points contre l’adversaire. » En effet, des mots comme kyu, dzo ou \
    qi (accepté depuis janvier 2020) peuvent rapporter beaucoup, surtout s’ils sont posés sur des cases bonus.',

    "Le Néo-Zélandais Nigel Richards a remporté plusieurs fois le championnat du monde de Scrabble francophone même s'il ne parle \
    pas du tout français! Le secret de sa victoire : il a mémorisé tous les mots de l’Officiel du Scrabble.",

    'Une bonne connaissance des préfixes et suffixes de la langue française n’est pas à dédaigner. Par exemple, ajouter un « pré » \
    en début de mot ou un « eur » à la fin d’un autre peut aider à faire des points rapidement.',

    'Les suffixes verbaux sont particulièrement utiles. En ajoutant un « i », un « it », ou un « ient », on peut allonger aisément \
    un verbe à la troisième personne du singulier et engranger de précieux points! C’est vrai aussi pour des temps de verbe comme \
    l’imparfait du subjonctif ou d’autres qui ne sont pas tellement utilisés dans la vie de tous les jours, mais qui sont bien \
    connus par les scrabbleurs.',

    "Il est important d'essayer de garder un bon ratio voyelles/consonnes. Avoir trop de consonnes sur son chevalet rend difficile \
    la tâche de trouver un mot à placer. Au contraire, avoir seulement des voyelles empêche de faire beaucoup de points.",

    "Plusieurs bruits d'animaux sont des mots acceptés au Scrabble : COINCOIN, CUICUI, GRRR, HIHAN, HOP.",

    'Votre adversaire vient de jouer un vilain coup? Exprimez vos émotions avec ces onomatopées acceptés au Scrabble francophone : \
    ARGH, BERK, BEURK, BIGRE, BORDEL, BOUH, CALMOS, CARAMBA, DIANTRE, HOULA, JARNICOTON.',

    'Au Scrabble francophone, 44% des tuiles sont des voyelles.',

    'Les 5 meilleurs mots à jouer au Scrabble francophone sont WHISKEYS, OXYDIEZ, JOCKEYS, JUKEBOX, KWANZAS.',
];

export const getRandomFact = () => {
    return Random.getRandomElementsFromArray(FUN_FACTS, 1)[0];
};
