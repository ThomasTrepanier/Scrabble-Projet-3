export class Delay {
    static async for(time: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }
}
