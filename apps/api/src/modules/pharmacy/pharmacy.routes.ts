import { Router } from 'express';
import { PharmacyController } from './pharmacy.controller.js';

const router = Router();
const controller = new PharmacyController();

router.get('/', controller.getMany);
router.post('/', controller.create);
router.get('/:id', controller.getOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

router.post('/sync', controller.syncCatalog);
router.post('/update-stock', controller.updateStock);

export default router;
