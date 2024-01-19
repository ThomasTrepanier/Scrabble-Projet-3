// import { DictionaryRequest } from '@app/classes/communication/request';
// import { DictionaryData } from '@app/classes/dictionary';
// import { BasicDictionaryData, DictionarySummary, DictionaryUpdateInfo } from '@app/classes/communication/dictionary-data';
// import DictionaryService from '@app/services/dictionary-service/dictionary.service';
// import { Response, Router } from 'express';
// import { StatusCodes } from 'http-status-codes';
// import { Service } from 'typedi';
// import { BaseController } from '@app/controllers/base-controller';

// @Service()
// export class DictionaryController extends BaseController {
//     constructor(private dictionaryService: DictionaryService) {
//         super('/api/dictionaries');
//     }

//     protected configure(router: Router): void {
//         router.post('/', async (req: DictionaryRequest, res: Response, next) => {
//             const dictionaryData: DictionaryData = req.body.dictionaryData;
//             try {
//                 await this.dictionaryService.addNewDictionary(dictionaryData);
//                 res.status(StatusCodes.CREATED).send();
//             } catch (exception) {
//                 next(exception);
//             }
//         });

//         router.patch('/', async (req: DictionaryRequest, res: Response, next) => {
//             const dictionaryUpdateInfo: DictionaryUpdateInfo = req.body.dictionaryUpdateInfo;

//             try {
//                 await this.dictionaryService.updateDictionary(dictionaryUpdateInfo);
//                 res.status(StatusCodes.NO_CONTENT).send();
//             } catch (exception) {
//                 next(exception);
//             }
//         });

//         router.delete('/', async (req: DictionaryRequest, res: Response, next) => {
//             const dictionaryId: string = req.query.dictionaryId as string;
//             try {
//                 await this.dictionaryService.deleteDictionary(dictionaryId);
//                 res.status(StatusCodes.NO_CONTENT).send();
//             } catch (exception) {
//                 next(exception);
//             }
//         });

//         router.get('/summary', async (req: DictionaryRequest, res: Response, next) => {
//             try {
//                 const dictionarySummaries: DictionarySummary[] = await this.dictionaryService.getAllDictionarySummaries();
//                 res.status(StatusCodes.OK).send(dictionarySummaries);
//             } catch (exception) {
//                 next(exception);
//             }
//         });

//         router.get('/:dictionaryId', async (req: DictionaryRequest, res: Response, next) => {
//             const { dictionaryId } = req.params;

//             try {
//                 const dictionaryData: DictionaryData = await this.dictionaryService.getDictionaryData(dictionaryId);
//                 const dictionaryToSend: BasicDictionaryData = {
//                     title: dictionaryData.title,
//                     description: dictionaryData.description,
//                     words: dictionaryData.words,
//                 };

//                 res.status(StatusCodes.OK).send(dictionaryToSend);
//             } catch (exception) {
//                 next(exception);
//             }
//         });

//         router.delete('/reset', async (req: DictionaryRequest, res: Response, next) => {
//             try {
//                 await this.dictionaryService.restoreDictionaries();
//                 res.status(StatusCodes.NO_CONTENT).send();
//             } catch (exception) {
//                 next(exception);
//             }
//         });
//     }
// }
