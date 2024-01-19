// /* eslint-disable no-unused-expressions */
// /* eslint-disable @typescript-eslint/no-unused-expressions */
// /* eslint-disable dot-notation */
// import { Container } from 'typedi';
// import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
// import VirtualPlayerProfilesService from './virtual-player-profile.service';
// import { expect } from 'chai';
// import * as chai from 'chai';
// import * as chaiAsPromised from 'chai-as-promised';
// import * as sinon from 'sinon';
// import { NAME_ALREADY_USED, NO_PROFILE_OF_LEVEL } from '@app/constants/services-errors';
// import { VirtualPlayer } from '@common/models/virtual-player';
// import { VirtualPlayerLevel } from '@common/models/virtual-player-level';

// chai.use(chaiAsPromised);

// const DEFAULT_VIRTUAL_PLAYER: VirtualPlayer = {
//     idVirtualPlayer: 1,
//     name: 'virtual',
//     level: 'débutant',
//     isDefault: false,
// };

// describe('VirtualPlayerProfilesService', () => {
//     let testingUnit: ServicesTestingUnit;
//     let virtualPlayerProfilesService: VirtualPlayerProfilesService;

//     beforeEach(async () => {
//         testingUnit = new ServicesTestingUnit();
//         await testingUnit.withMockDatabaseService();
//     });

//     beforeEach(() => {
//         virtualPlayerProfilesService = Container.get(VirtualPlayerProfilesService);
//     });

//     afterEach(() => {
//         testingUnit.restore();
//     });

//     describe('getAllVirtualPlayerProfiles', () => {
//         it('should return entries', async () => {
//             await virtualPlayerProfilesService['table'].insert(DEFAULT_VIRTUAL_PLAYER);

//             expect((await virtualPlayerProfilesService.getAllVirtualPlayerProfiles()).length).to.equal(1);
//         });
//     });

//     describe('getVirtualPlayerProfilesFromLevel', () => {
//         it('should return entries for level', async () => {
//             await virtualPlayerProfilesService['table'].insert(DEFAULT_VIRTUAL_PLAYER);

//             expect(
//                 (await virtualPlayerProfilesService.getVirtualPlayerProfilesFromLevel(DEFAULT_VIRTUAL_PLAYER.level as VirtualPlayerLevel)).length,
//             ).to.equal(1);
//         });

//         it('should not return entries for other level', async () => {
//             await virtualPlayerProfilesService['table'].insert(DEFAULT_VIRTUAL_PLAYER);

//             expect(
//                 (
//                     await virtualPlayerProfilesService.getVirtualPlayerProfilesFromLevel(
//                         (DEFAULT_VIRTUAL_PLAYER.level + 'no-level') as VirtualPlayerLevel,
//                     )
//                 ).length,
//             ).to.equal(0);
//         });
//     });

//     describe('getRandomVirtualPlayerName', () => {
//         it('should return entry', async () => {
//             await virtualPlayerProfilesService['table'].insert(DEFAULT_VIRTUAL_PLAYER);

//             expect(virtualPlayerProfilesService.getRandomVirtualPlayerName(DEFAULT_VIRTUAL_PLAYER.level as VirtualPlayerLevel)).to.exist;
//         });

//         it('should throw an error if no player', () => {
//             expect(virtualPlayerProfilesService.getRandomVirtualPlayerName('' as VirtualPlayerLevel)).to.be.rejectedWith(NO_PROFILE_OF_LEVEL);
//         });
//     });

//     describe('addVirtualPlayerProfile', () => {
//         it('should add a profile', async () => {
//             await virtualPlayerProfilesService.addVirtualPlayerProfile(DEFAULT_VIRTUAL_PLAYER);

//             expect((await virtualPlayerProfilesService['table'].select('*')).length).to.equal(1);
//         });

//         it('should throw if profile already exists with name', async () => {
//             await virtualPlayerProfilesService.addVirtualPlayerProfile(DEFAULT_VIRTUAL_PLAYER);

//             expect(virtualPlayerProfilesService.addVirtualPlayerProfile(DEFAULT_VIRTUAL_PLAYER)).to.be.rejectedWith(
//                 NAME_ALREADY_USED(DEFAULT_VIRTUAL_PLAYER.name),
//             );
//         });
//     });

//     describe('updateVirtualPlayerProfile', () => {
//         it('should change name', async () => {
//             await virtualPlayerProfilesService['table'].insert(DEFAULT_VIRTUAL_PLAYER);

//             const newName = 'new name';
//             await virtualPlayerProfilesService.updateVirtualPlayerProfile(newName, DEFAULT_VIRTUAL_PLAYER.idVirtualPlayer);

//             expect((await virtualPlayerProfilesService['table'].select('name'))[0].name).to.equal(newName);
//         });

//         it('should throw if name exists', async () => {
//             await virtualPlayerProfilesService['table'].insert(DEFAULT_VIRTUAL_PLAYER);

//             expect(
//                 virtualPlayerProfilesService.updateVirtualPlayerProfile(DEFAULT_VIRTUAL_PLAYER.name, DEFAULT_VIRTUAL_PLAYER.idVirtualPlayer),
//             ).to.be.rejectedWith(NAME_ALREADY_USED(DEFAULT_VIRTUAL_PLAYER.name));
//         });
//     });

//     describe('deleteVirtualPlayerProfile', () => {
//         it('should delete entry', async () => {
//             await virtualPlayerProfilesService['table'].insert(DEFAULT_VIRTUAL_PLAYER);
//             await virtualPlayerProfilesService.deleteVirtualPlayerProfile(DEFAULT_VIRTUAL_PLAYER.idVirtualPlayer);
//             expect((await virtualPlayerProfilesService['table'].select('*')).length).to.equal(0);
//         });
//     });

//     describe('resetVirtualPlayerProfiles', () => {
//         let populateDbStub: sinon.SinonStub;

//         beforeEach(() => {
//             populateDbStub = sinon.stub(virtualPlayerProfilesService, 'populateDb' as keyof VirtualPlayerProfilesService);
//         });

//         it('should delete all entries', async () => {
//             await virtualPlayerProfilesService['table'].insert(DEFAULT_VIRTUAL_PLAYER);
//             await virtualPlayerProfilesService.resetVirtualPlayerProfiles();
//             expect((await virtualPlayerProfilesService['table'].select('*')).length).to.equal(0);
//         });

//         it('should call populateDb', async () => {
//             await virtualPlayerProfilesService.resetVirtualPlayerProfiles();
//             expect(populateDbStub.called).to.be.true;
//         });
//     });
// });
