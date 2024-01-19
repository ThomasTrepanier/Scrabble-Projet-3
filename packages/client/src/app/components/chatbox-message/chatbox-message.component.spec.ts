import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ChatBoxComponent } from '@app/components/chatbox/chatbox.component';
import { IconButtonComponent } from '@app/components/icon-button/icon-button.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { SrcDirective } from '@app/directives/src-directive/src.directive';
import { UserService } from '@app/services/user-service/user.service';
import { PublicUser } from '@common/models/user';
import { ChatboxMessageComponent } from './chatbox-message.component';

const USER_1: PublicUser = {
    username: '1',
    avatar: '1',
    email: '1',
};
const USER_2: PublicUser = {
    username: '2',
    avatar: '2',
    email: '2',
};

describe('ChatboxMessageComponent', () => {
    let component: ChatboxMessageComponent;
    let fixture: ComponentFixture<ChatboxMessageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, HttpClientTestingModule, MatSnackBarModule, MatDialogModule],
            providers: [FormBuilder, UserService],
            declarations: [ChatboxMessageComponent, ChatBoxComponent, IconComponent, IconButtonComponent, SrcDirective],
        }).compileComponents();

        TestBed.inject(UserService).user.next(USER_1);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatboxMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getMessages', () => {
        it('should return empty array if no messages', () => {
            expect(component.getMessages()).toHaveSize(0);
        });

        it('should group messages', () => {
            component.messages = [
                {
                    content: '',
                    sender: USER_1,
                    date: new Date(),
                },
                {
                    content: '',
                    sender: USER_1,
                    date: new Date(),
                },
                {
                    content: '',
                    sender: USER_2,
                    date: new Date(),
                },
            ];
            expect(component.getMessages()).toHaveSize(2);
        });
    });

    describe('getLastUsersAvatarUrl', () => {
        it('should return undefined of no messages', () => {
            const [a1, a2] = component.getLastUsersAvatarUrl();
            expect(a1).toBeUndefined();
            expect(a2).toBeUndefined();
        });

        it('should return 1 avatar if 1 unique', () => {
            component.messages = [
                {
                    content: '',
                    sender: USER_1,
                    date: new Date(),
                },
                {
                    content: '',
                    sender: USER_1,
                    date: new Date(),
                },
            ];
            const [a1, a2] = component.getLastUsersAvatarUrl();
            expect(a1).toEqual(USER_1.avatar);
            expect(a2).toBeUndefined();
        });

        it('should return avatars', () => {
            component.messages = [
                {
                    content: '',
                    sender: USER_1,
                    date: new Date(),
                },
                {
                    content: '',
                    sender: USER_1,
                    date: new Date(),
                },
                {
                    content: '',
                    sender: USER_2,
                    date: new Date(),
                },
            ];
            const [a1, a2] = component.getLastUsersAvatarUrl();
            expect(a1).toEqual(USER_1.avatar);
            expect(a2).toEqual(USER_2.avatar);
        });
    });

    describe('addMessage', () => {
        it('should emit sendMessage', () => {
            spyOn(component.sendMessage, 'next');
            component.addMessage('');
            expect(component.sendMessage.next).toHaveBeenCalled();
        });
    });

    describe('onMessageSubmit', () => {
        it('should call addMessage', () => {
            spyOn(component, 'addMessage');
            component.messageForm.setValue({ message: 'abc' });
            component.onMessageSubmit();
            expect(component.addMessage).toHaveBeenCalled();
        });
    });

    describe('onEmojiClick', () => {
        it('should call addMessage', () => {
            spyOn(component, 'addMessage');
            component.onEmojiClick('🐸');
            expect(component.addMessage).toHaveBeenCalled();
        });
    });
});
