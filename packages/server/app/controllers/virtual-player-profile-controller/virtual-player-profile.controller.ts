// import { VirtualPlayerProfilesRequest } from '@app/classes/communication/request';
// import { HttpException } from '@app/classes/http-exception/http-exception';
// import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
// import { INVALID_LEVEL, MISSING_PARAMETER } from '@app/constants/services-errors';
// import VirtualPlayerProfileService from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
// import { Response, Router } from 'express';
// import { StatusCodes } from 'http-status-codes';
// import { Service } from 'typedi';
// import { BaseController } from '@app/controllers/base-controller';
// import { NoId } from '@common/types/id';
// import { VirtualPlayer } from '@common/models/virtual-player';

// @Service()
// export class VirtualPlayerProfilesController extends BaseController {
//     constructor(private virtualPlayerProfileService: VirtualPlayerProfileService) {
//         super('/api/virtualPlayerProfiles');
//     }

//     protected configure(router: Router): void {
//         router.get('/', async (req: VirtualPlayerProfilesRequest, res: Response, next) => {
//             try {
//                 const virtualPlayerProfiles = await this.virtualPlayerProfileService.getAllVirtualPlayerProfiles();
//                 res.status(StatusCodes.OK).send({ virtualPlayerProfiles });
//             } catch (exception) {
//                 next(exception);
//             }
//         });

//         router.get('/:level', async (req: VirtualPlayerProfilesRequest, res: Response, next) => {
//             try {
//                 const level: VirtualPlayerLevel = req.params.level as VirtualPlayerLevel;
//                 if (!Object.values(VirtualPlayerLevel).includes(level)) throw new HttpException(INVALID_LEVEL, StatusCodes.BAD_REQUEST);

//                 const virtualPlayerProfiles = await this.virtualPlayerProfileService.getVirtualPlayerProfilesFromLevel(level);
//                 res.status(StatusCodes.OK).send({ virtualPlayerProfiles });
//             } catch (exception) {
//                 next(exception);
//             }
//         });

//         router.post('/', async (req: VirtualPlayerProfilesRequest, res: Response, next) => {
//             try {
//                 const virtualPlayerData: NoId<VirtualPlayer> = req.body.virtualPlayerData;
//                 if (!virtualPlayerData) throw new HttpException(MISSING_PARAMETER, StatusCodes.BAD_REQUEST);

//                 await this.virtualPlayerProfileService.addVirtualPlayerProfile(virtualPlayerData);
//                 res.status(StatusCodes.CREATED).send();
//             } catch (exception) {
//                 next(exception);
//             }
//         });

//         router.patch('/:profileId', async (req: VirtualPlayerProfilesRequest, res: Response, next) => {
//             try {
//                 const profileId = req.params.profileId;
//                 const newName: string = req.body.profileData.name;
//                 if (!newName) throw new HttpException(MISSING_PARAMETER, StatusCodes.BAD_REQUEST);
//                 await this.virtualPlayerProfileService.updateVirtualPlayerProfile(newName, Number(profileId));
//                 res.status(StatusCodes.NO_CONTENT).send();
//             } catch (exception) {
//                 next(exception);
//             }
//         });

//         router.delete('/:profileId', async (req: VirtualPlayerProfilesRequest, res: Response, next) => {
//             try {
//                 const profileId = req.params.profileId;
//                 await this.virtualPlayerProfileService.deleteVirtualPlayerProfile(Number(profileId));
//                 res.status(StatusCodes.NO_CONTENT).send();
//             } catch (exception) {
//                 next(exception);
//             }
//         });

//         router.delete('/', async (req: VirtualPlayerProfilesRequest, res: Response, next) => {
//             try {
//                 await this.virtualPlayerProfileService.resetVirtualPlayerProfiles();
//                 res.status(StatusCodes.NO_CONTENT).send();
//             } catch (exception) {
//                 next(exception);
//             }
//         });
//     }
// }
