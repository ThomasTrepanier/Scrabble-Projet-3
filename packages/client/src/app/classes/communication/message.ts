export interface Message {
    content: string;
    senderId: string;
    gameId: string;
    isClickable?: boolean;
}
