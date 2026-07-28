import { Router } from 'express';
import { BloodBankController } from './bloodBank.controller.js';

const router = Router();
const controller = new BloodBankController();

router.get('/inventory', controller.getInventory);
router.get('/history', controller.getExchangeHistory);
router.post('/exchange', controller.processExchange);
router.get('/', controller.getInventory);
router.post('/', controller.create);
router.get('/:id', controller.getOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
