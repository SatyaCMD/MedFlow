import { Router } from 'express';
import { AuditController } from './audit.controller.js';

const router = Router();

router.post('/', AuditController.createAudit);
router.get('/', AuditController.getAllAudits);

router.get('/:id', AuditController.getAuditById);
router.put('/:id', AuditController.updateAudit);
router.delete('/:id', AuditController.deleteAudit);

export default router;
