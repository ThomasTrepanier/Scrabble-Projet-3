export default class Delay {
    static async for(delay: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
    }
}
