import { Dictionary } from '@app/classes/dictionary';
import { AbstractWordFinding } from '@app/classes/word-finding';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { GameHistoriesController } from '@app/controllers/game-history-controller/game-history.controller';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import WordFindingService from '@app/services/word-finding-service/word-finding.service';
import { Router } from 'express';
import * as mock from 'mock-fs';
import { createSandbox, SinonSandbox, SinonStub, SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import TestingDatabaseService from '@app/services/database-service/testing-database.service.spec';
import * as authenticateToken from '@app/middlewares/authentificate-token';

// eslint-disable-next-line @typescript-eslint/ban-types
type ClassType<T> = Function & { prototype: T };

type StubbedMember<T> = T extends (...args: infer TArgs) => infer TReturnValue ? SinonStub<TArgs, TReturnValue> : T;

type ClassOverride<TType> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof TType]?: StubbedMember<TType[K]> | (TType[K] extends (...args: any[]) => infer R ? R : TType[K]);
};

type ClassAttributesOverrides<T> = {
    [K in keyof T]?: T[K];
};

type DirectoryItem = string | Buffer | (() => File) | DirectoryItems;

interface DirectoryItems {
    [name: string]: DirectoryItem;
}

const CONTROLLERS: ClassType<unknown>[] = [GameDispatcherController, GameHistoriesController, GamePlayController];

export class ServicesTestingUnit {
    private sandbox: SinonSandbox;
    private stubbedInstances: Map<ClassType<unknown>, SinonStubbedInstance<unknown>>;

    constructor() {
        this.sandbox = createSandbox();
        this.stubbedInstances = new Map();

        Container.reset();
    }

    withStubbed<T>(constructor: ClassType<T>, overrides?: ClassOverride<T>, attributesOverrides?: ClassAttributesOverrides<T>): ServicesTestingUnit {
        this.setStubbed(constructor, overrides, attributesOverrides);
        return this;
    }

    withStubbedPrototypes<T>(
        constructor: ClassType<T>,
        overrides: ClassOverride<T>,
        stubAction: 'returns' | 'callsFake' = 'returns',
    ): ServicesTestingUnit {
        for (const key of Object.keys(overrides)) {
            this.sandbox.stub(constructor.prototype, key)[stubAction](overrides[key]);
        }
        return this;
    }

    async withMockDatabaseService(): Promise<void> {
        const databaseService = new TestingDatabaseService();
        Container.set(DatabaseService, databaseService);
        await databaseService.setup();
    }

    withStubbedDictionaryService(): ServicesTestingUnit {
        const dictionaryStub = this.sandbox.createStubInstance(Dictionary);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stubbedInstance = this.sandbox.createStubInstance<any>(DictionaryService, {
            getDictionary: dictionaryStub as unknown as Dictionary,
            initializeDictionary: Promise.resolve(),
        });

        Container.set(DictionaryService, stubbedInstance);

        this.stubbedInstances.set(Dictionary, dictionaryStub);
        this.stubbedInstances.set(DictionaryService, stubbedInstance);
        return this;
    }

    withStubbedControllers(...exceptions: ClassType<unknown>[]): ServicesTestingUnit {
        for (const controller of CONTROLLERS.filter((c) => !exceptions.includes(c))) {
            this.withStubbed(controller, {}, { router: Router() });
        }
        return this;
    }

    withMockedFileSystem(paths: DirectoryItems): ServicesTestingUnit {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mock(paths as any);
        return this;
    }

    withMockedAuthentification(): ServicesTestingUnit {
        this.sandbox.stub(authenticateToken, 'authenticateToken').callsFake((req, res, next) => next());
        return this;
    }

    setStubbedWordFindingService(): [instance: SinonStubbedInstance<AbstractWordFinding>, service: SinonStubbedInstance<WordFindingService>] {
        const instance = this.sandbox.createStubInstance(AbstractWordFinding, {
            findWords: [],
        });
        const service = this.setStubbed(WordFindingService, {
            getWordFindingInstance: instance as unknown as AbstractWordFinding,
        });

        return [instance, service];
    }

    setStubbed<T>(
        constructor: ClassType<T>,
        overrides?: ClassOverride<T>,
        attributesOverrides?: ClassAttributesOverrides<T>,
    ): SinonStubbedInstance<T> {
        const instance = this.sandbox.createStubInstance(constructor, overrides);
        Container.set(constructor, instance);
        this.stubbedInstances.set(constructor, instance);

        if (attributesOverrides)
            for (const key of Object.keys(attributesOverrides)) {
                instance[key] = attributesOverrides[key];
            }

        return instance;
    }

    getStubbedInstance<T>(constructor: ClassType<T>): SinonStubbedInstance<T> {
        const instance: SinonStubbedInstance<T> | undefined = this.stubbedInstances.get(constructor) as SinonStubbedInstance<T>;

        if (instance) return instance;
        throw new Error(`No stubbed instance for ${constructor.name}`);
    }

    restore() {
        this.sandbox.restore();
        mock.restore();
    }
}
