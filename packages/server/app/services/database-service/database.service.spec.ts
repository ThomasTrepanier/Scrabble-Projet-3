/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { Container } from 'typedi';
import DatabaseService from './database.service';
chai.use(chaiAsPromised);

describe('Database service', () => {
    let databaseService: DatabaseService;

    beforeEach(async () => {
        databaseService = Container.get(DatabaseService);
    });

    it('should create', () => {
        expect(databaseService).not.null;
    });
});
