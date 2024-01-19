import ActionInfo from '@app/classes/actions/abstract-actions/action-info';
import { FeedbackMessage } from '@app/classes/communication/feedback-messages';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { ScoredWordPlacement, WordFindingUseCase } from '@app/classes/word-finding';
import { FOUND_WORDS, HINT_ACTION_NUMBER_OF_WORDS, NO_WORDS_FOUND } from '@app/constants/classes-constants';
import WordFindingService from '@app/services/word-finding-service/word-finding.service';
import { PlacementToString } from '@app/utils/placement-to-string/placement-to-string';
import { Container } from 'typedi';

export default class ActionHint extends ActionInfo {
    private wordFindingService: WordFindingService;
    private hintResult: ScoredWordPlacement[];

    constructor(player: Player, game: Game) {
        super(player, game);
        this.wordFindingService = Container.get(WordFindingService);
        this.hintResult = [];
    }

    execute(): GameUpdateData | void {
        const wordFindingInstance = this.wordFindingService.getWordFindingInstance(WordFindingUseCase.Hint, this.game.dictionarySummary.id, [
            this.game.board,
            this.player.tiles,
            {
                useCase: WordFindingUseCase.Hint,
            },
        ]);
        this.hintResult = wordFindingInstance.findWords();
    }

    getMessage(): FeedbackMessage {
        if (this.hintResult.length === 0) return { message: NO_WORDS_FOUND };

        let message = `${FOUND_WORDS} :<br>`;
        if (this.hintResult.length < HINT_ACTION_NUMBER_OF_WORDS) message += `*Seulement ${this.hintResult.length} mot(s) ont été trouvé(s)*<br>`;
        message += this.hintResult
            .map((placement) => `\`${PlacementToString.wordPlacementToCommandString(placement)}\` pour ${placement.score} points`)
            .join('<br>');
        return { message, isClickable: true };
    }

    getOpponentMessage(): FeedbackMessage {
        return {};
    }
}
