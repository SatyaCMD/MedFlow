import { Router } from 'express';
import { AIController } from './ai.controller.js';

const router = Router();
const controller = new AIController();

// CRUD operations
router.post('/', controller.createAi);
router.get('/', controller.getAllAis);
router.post('/soap-note', controller.generateSoapNote);

router.get('/:id', controller.getAiById);
router.put('/:id', controller.updateAi);
router.delete('/:id', controller.deleteAi);

export default router;
