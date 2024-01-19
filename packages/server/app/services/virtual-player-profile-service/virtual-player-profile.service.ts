// import { HttpException } from '@app/classes/http-exception/http-exception';
// import { DEFAULT_VIRTUAL_PLAYER_PROFILES_RELATIVE_PATH, VIRTUAL_PLAYER_TABLE } from '@app/constants/services-constants/database-const';
// import { NAME_ALREADY_USED, NO_PROFILE_OF_LEVEL } from '@app/constants/services-errors';
// import DatabaseService from '@app/services/database-service/database.service';
// import { Random } from '@app/utils/random/random';
// import { VirtualPlayer, VirtualPlayerProfilesData } from '@common/models/virtual-player';
// import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
// import { NoId } from '@common/types/id';
// import { promises } from 'fs';
// import { StatusCodes } from 'http-status-codes';
// import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
// import { join } from 'path';
// import { Service } from 'typedi';

// @Service()
// export default class VirtualPlayerProfilesService {
//     constructor(private databaseService: DatabaseService) {}

//     private get table() {
//         return this.databaseService.knex<VirtualPlayer>(VIRTUAL_PLAYER_TABLE);
//     }

//     private static async fetchDefaultVirtualPlayerProfiles(): Promise<NoId<VirtualPlayer>[]> {
//         const filePath = join(__dirname, DEFAULT_VIRTUAL_PLAYER_PROFILES_RELATIVE_PATH);
//         const dataBuffer = await promises.readFile(filePath, 'utf-8');
//         const defaultVirtualPlayerProfiles: VirtualPlayerProfilesData = JSON.parse(dataBuffer);
//         return defaultVirtualPlayerProfiles.virtualPlayerProfiles;
//     }

//     async getAllVirtualPlayerProfiles(): Promise<VirtualPlayer[]> {
//         return this.table.select('*');
//     }

//     async getVirtualPlayerProfilesFromLevel(level: VirtualPlayerLevel): Promise<VirtualPlayer[]> {
//         return this.table.select('*').where({ level });
//     }

//     async getRandomVirtualPlayerName(level: VirtualPlayerLevel): Promise<string> {
//         const virtualPlayerProfile = Random.getRandomElementsFromArray(await this.getVirtualPlayerProfilesFromLevel(level)).pop();
//         if (virtualPlayerProfile) return virtualPlayerProfile.name;
//         throw new HttpException(NO_PROFILE_OF_LEVEL, StatusCodes.NOT_FOUND);
//     }

//     async addVirtualPlayerProfile(newProfileData: NoId<VirtualPlayer>): Promise<void> {
//         if (await this.isNameAlreadyUsed(newProfileData.name))
// throw new HttpException(NAME_ALREADY_USED(newProfileData.name), StatusCodes.FORBIDDEN);

//         return await this.table.insert(newProfileData);
//     }

//     async updateVirtualPlayerProfile(newName: string, idVirtualPlayer: number): Promise<void> {
//         if (await this.isNameAlreadyUsed(newName)) throw new HttpException(NAME_ALREADY_USED(newName), StatusCodes.FORBIDDEN);

//         await this.table.update({ name: newName }).where({ idVirtualPlayer });
//     }

//     async deleteVirtualPlayerProfile(idVirtualPlayer: number): Promise<void> {
//         await this.table.delete().where({ idVirtualPlayer });
//     }

//     async resetVirtualPlayerProfiles(): Promise<void> {
//         await this.table.delete();
//         await this.populateDb();
//     }

//     private async populateDb(): Promise<void> {
//         await this.table.insert(await VirtualPlayerProfilesService.fetchDefaultVirtualPlayerProfiles());
//     }

//     private async isNameAlreadyUsed(name: string): Promise<boolean> {
//         const [{ count }] = (await this.table.count('*').where({ name })) as unknown as { count: number }[];
//         return count > 0;
//     }
// }
