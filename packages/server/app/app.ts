import { HttpException } from '@app/classes/http-exception/http-exception';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as logger from 'morgan';
import { join } from 'path';
import { Container, Service } from 'typedi';
import { BaseController } from './controllers/base-controller';
import { authenticateToken } from './middlewares/authentificate-token';
import { errorHandler } from './middlewares/error-handler';
import { ClassType, PRIVATE_CONTROLLERS, PUBLIC_CONTROLLERS } from './routes/routes.module';
import { ChatService } from './services/chat-service/chat.service';
import DatabaseService from './services/database-service/database.service';

@Service()
export class Application {
    app: express.Application;

    constructor(private readonly databaseService: DatabaseService, private readonly chatService: ChatService) {
        this.app = express();

        this.config();

        this.setPublicDirectory();
    }

    bindRoutes(controllers: ClassType<BaseController>[]): void {
        for (const controller of controllers) {
            Container.get(controller).route(this.app);
        }
    }

    async setupServices(): Promise<void> {
        await this.databaseService.setup();
        await this.chatService.initialize();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(logger('dev'));
        this.app.use(express.json({ limit: '10MB' }));
        this.app.use(express.urlencoded({ limit: '10MB', parameterLimit: 100000, extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());

        this.bindRoutes(PUBLIC_CONTROLLERS);

        this.app.use(authenticateToken);

        this.bindRoutes(PRIVATE_CONTROLLERS);

        this.errorHandling();
    }

    private setPublicDirectory(): void {
        const path = join(__dirname, '../public');
        this.app.use('/public', express.static(path));
    }

    private errorHandling(): void {
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            next(new HttpException(`Cannot ${req.method} ${req.path}`, StatusCodes.NOT_FOUND));
        });

        this.app.use(errorHandler);
    }
}
