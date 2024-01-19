import { Application, Router } from 'express';
import { Token } from 'typedi';

export const controllerToken = new Token<BaseController>('controllers');

export abstract class BaseController {
    private router: Router;
    private path: string;

    constructor(path: string) {
        this.router = Router();
        this.path = path;

        this.configure(this.router);
    }

    route(app: Application): void {
        app.use(this.path, this.router);
    }

    protected abstract configure(router: Router): void;
}
