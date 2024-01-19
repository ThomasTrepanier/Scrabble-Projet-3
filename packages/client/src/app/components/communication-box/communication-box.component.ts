import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { InitializeGameData } from '@app/classes/communication/game-config';
import { Message } from '@app/classes/communication/message';
import { FocusableComponent } from '@app/classes/focusable-component/focusable-component';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { CODE_HTML_TAG, IS_CLICKABLE_CLASS } from '@app/constants/components-constants';
import { INITIAL_MESSAGE } from '@app/constants/controller-constants';
import { LOCAL_PLAYER_ID, MAX_INPUT_LENGTH, OPPONENT_ID, SYSTEM_ERROR_ID, SYSTEM_ID } from '@app/constants/game-constants';
import { GameService, InputParserService } from '@app/services';
import { FocusableComponentsService } from '@app/services/focusable-components-service/focusable-components.service';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { MessageStorageService } from '@app/services/message-storage-service/message-storage.service';
import { marked } from 'marked';
import { Subject } from 'rxjs';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss', './communication-box-text.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationBoxComponent extends FocusableComponent<KeyboardEvent> implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('messageInput') messageInputElement: ElementRef;
    @ViewChild('textBoxContainer') textBoxContainer: ElementRef;
    @ViewChild('virtualScroll', { static: false }) scrollViewport: CdkVirtualScrollViewport;

    messages: Message[] = [];
    messageForm = new FormGroup({
        content: new FormControl('', [Validators.maxLength(MAX_INPUT_LENGTH), Validators.minLength(1)]),
    });
    lastPlacementPreview: string | undefined = '';

    private componentDestroyed$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private inputParser: InputParserService,
        private gameService: GameService,
        private focusableComponentsService: FocusableComponentsService,
        private changeDetectorRef: ChangeDetectorRef,
        private messageStorageService: MessageStorageService,
        private gameViewEventManagerService: GameViewEventManagerService,
        private tilePlacementService: TilePlacementService,
    ) {
        super();
        this.focusableComponentsService.setActiveKeyboardComponent(this);
        this.messageStorageService.initializeMessages();
    }

    ngOnInit(): void {
        this.gameViewEventManagerService.subscribeToGameViewEvent('newMessage', this.componentDestroyed$, (newMessage: Message | null) => {
            if (newMessage) this.onReceiveNewMessage(newMessage);
        });
        this.gameViewEventManagerService.subscribeToGameViewEvent(
            'gameInitialized',
            this.componentDestroyed$,
            (gameData: InitializeGameData | undefined) => {
                if (gameData) {
                    this.initializeMessages(gameData);
                }
            },
        );
    }

    ngAfterViewInit(): void {
        this.subscribeToFocusableEvents();
    }

    ngOnDestroy(): void {
        this.unsubscribeToFocusableEvents();
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
        this.messageStorageService.resetMessages();
    }

    onSendMessage(): void {
        const message = this.messageForm.get('content')?.value;
        if (message && message.length > 0) {
            this.inputParser.handleInput(message);
            this.messageForm.reset({ content: '' });
        }
    }

    getLettersLeft(): TileReserveData[] {
        return this.gameService.tileReserve;
    }

    getNumberOfTilesLeft(): number {
        return this.gameService.getTotalNumberOfTilesLeft();
    }

    onContainerClick(): void {
        this.focusableComponentsService.setActiveKeyboardComponent(this);
    }

    onMessageClicked(event: MouseEvent): void {
        const element: HTMLElement = event.target as HTMLElement;
        if (!element.innerText) return;
        if (!this.isElementClickable(element)) return;

        this.inputParser.handleInput(element.innerText);
    }

    onMessageHovered(event: MouseEvent): void {
        if (!this.gameService.isLocalPlayerPlaying()) return;
        const element: HTMLElement = event.target as HTMLElement;
        if (!element.innerText) return;
        if (!this.isElementClickable(element)) return;

        const input = element.innerText;

        if (!this.inputParser.isAction(input)) return;
        if (this.lastPlacementPreview === input) return;

        this.lastPlacementPreview = input;

        try {
            const action = this.inputParser.getPlaceActionPayload(input);

            if (!action) return;

            this.tilePlacementService.resetTiles();
            this.tilePlacementService.propagateTilePlacementToOpponents = false;
            this.tilePlacementService.placeTileFromPlacePayload(action);
            this.tilePlacementService.propagateTilePlacementToOpponents = true;
        } catch {
            // nothing to do
        }
    }

    onMessageHoveredOut(): void {
        this.tilePlacementService.propagateTilePlacementToOpponents = true;
        if (this.lastPlacementPreview) {
            this.lastPlacementPreview = undefined;
            this.tilePlacementService.resetTiles();
        }
    }

    protected onFocusableEvent(event: KeyboardEvent): void {
        if (!this.isCtrlC(event)) this.messageInputElement?.nativeElement?.focus();
    }

    private initializeMessages(gameData: InitializeGameData): void {
        const storedMessages = this.messageStorageService.getMessages();
        if (storedMessages.length > 0 && this.messages.length === 0) {
            const localGameMessages: Message[] = storedMessages.filter((message: Message) => message.gameId === gameData.startGameData.gameId);
            localGameMessages.forEach((message: Message) => (message.content = marked.parseInline(message.content)));
            this.messages = this.messages.concat(localGameMessages);
        }

        if (this.messages.length === 0) this.onReceiveNewMessage({ ...INITIAL_MESSAGE, gameId: this.gameService.getGameId() });
    }

    private createVisualMessage(newMessage: Message): Message {
        switch (newMessage.senderId) {
            case this.gameService.getLocalPlayerId():
                newMessage.senderId = LOCAL_PLAYER_ID;
                break;
            case SYSTEM_ID:
            case SYSTEM_ERROR_ID:
                break;
            default:
                newMessage.senderId = OPPONENT_ID;
                break;
        }

        return { ...newMessage, content: marked.parseInline(newMessage.content) };
    }

    private onReceiveNewMessage(newMessage: Message): void {
        if (newMessage.gameId !== this.gameService.getGameId()) return;

        this.messages = [...this.messages, this.createVisualMessage(newMessage)];
        this.changeDetectorRef.detectChanges();
        this.scrollToBottom();
        this.messageStorageService.saveMessage(newMessage);
    }

    private isCtrlC(event: KeyboardEvent): boolean {
        return event.key === 'c' && (event.ctrlKey || event.metaKey);
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            this.scrollViewport.scrollTo({
                bottom: 0,
                behavior: 'auto',
            });
        }, 0);
    }

    private isElementClickable(element: HTMLElement): boolean {
        const isElementClickable: boolean = element.classList.contains(IS_CLICKABLE_CLASS);
        const isParentClickable: boolean =
            element.parentElement !== null && (element.parentElement as HTMLElement).classList.contains(IS_CLICKABLE_CLASS);
        const isElementCodeTag: boolean = element.tagName === CODE_HTML_TAG;
        return isElementCodeTag && (isElementClickable || isParentClickable);
    }
}
