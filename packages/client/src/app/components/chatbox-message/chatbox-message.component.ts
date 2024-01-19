import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { onlyHasEmoji } from '@app/utils/emoji/emoji';
import { emojify } from 'node-emoji';
import { ChatBoxComponent } from '@app/components/chatbox/chatbox.component';
import { PublicUser } from '@common/models/user';
import { UserService } from '@app/services/user-service/user.service';
import { ChatMessage } from '@common/models/chat/chat-message';
import { MINUTE } from '@app/constants/time-constant';
import { CHAT_TIME_FORMAT } from '@app/constants/chat-constants';

export type DisplayMessage = ChatMessage & { onlyEmoji: boolean };

export interface DisplayGroup {
    sender: PublicUser;
    isCurrentUser: boolean;
    messages: DisplayMessage[];
    date: Date;
    displayDate: boolean;
}

@Component({
    selector: 'app-chatbox-message',
    templateUrl: './chatbox-message.component.html',
    styleUrls: ['./chatbox-message.component.scss'],
})
export class ChatboxMessageComponent extends ChatBoxComponent {
    @Input() messages: ChatMessage[] = [];
    @Output() sendMessage: EventEmitter<string> = new EventEmitter();
    isInputEmpty: boolean = true;
    messageForm: FormGroup;
    onlyHasEmoji = onlyHasEmoji;
    timeFomat: string = CHAT_TIME_FORMAT;

    constructor(private readonly formBuilder: FormBuilder, private readonly userService: UserService) {
        super();
        this.messageForm = this.formBuilder.group({
            message: new FormControl('', [Validators.required]),
        });

        this.messageForm.valueChanges.subscribe(() => {
            this.isInputEmpty = this.messageForm.value.message.length === 0;
        });
    }

    getMessages(): DisplayGroup[] {
        return this.messages.reduce<DisplayGroup[]>((messages: DisplayGroup[], current) => {
            const last = messages[messages.length - 1];

            const newMessage: DisplayMessage = {
                ...current,
                content: emojify(current.content.trim()),
                onlyEmoji: onlyHasEmoji(current.content),
            };

            if (last) {
                const lastMessage = last.messages[last.messages.length - 1];
                const isRecent = current.date.getTime() - lastMessage.date.getTime() <= MINUTE;

                if (last.sender.username === current.sender.username && isRecent) {
                    last.messages.push(newMessage);
                } else {
                    messages.push({
                        sender: current.sender,
                        isCurrentUser: this.userService.isUser(current.sender),
                        messages: [newMessage],
                        date: current.date,
                        displayDate: !isRecent,
                    });
                }
                return messages;
            } else {
                return [
                    {
                        sender: current.sender,
                        isCurrentUser: this.userService.isUser(current.sender),
                        messages: [newMessage],
                        date: current.date,
                        displayDate: true,
                    },
                ];
            }
        }, []);
    }

    getLastUsersAvatarUrl(): [string?, string?] {
        let avatars: [string?, string?] = [undefined, undefined];

        for (const {
            sender: { avatar },
        } of this.messages) {
            if (!avatars[0]) avatars = [avatar, undefined];
            if (!avatars[1] && avatars[0] !== avatar) return [avatars[0], avatar];
        }

        return avatars;
    }

    addMessage(content: string): void {
        this.sendMessage.next(content);
    }

    onMessageSubmit(): void {
        if (!this.messageForm.valid) return;

        const content = this.messageForm.value.message.trim();

        if (content.length === 0) return;

        this.addMessage(content);
        this.messageForm.setValue({ message: '' });
    }

    onEmojiClick(emoji: string): void {
        this.addMessage(emoji);
    }

    onKeyPress(e: KeyboardEvent): void {
        e.stopPropagation();
    }
}
