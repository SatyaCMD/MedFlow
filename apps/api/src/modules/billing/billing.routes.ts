/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Router } from 'express';
import { BillingController } from './billing.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { CreateBillingSchema, UpdateBillingSchema } from './billing.dto.js';
import { PERMISSIONS } from '@medicore360/shared';

const router = Router();
const controller = new BillingController();

router.use(authenticate);

router.route('/')
  .get(authorize(PERMISSIONS.PATIENT_READ), controller.getMany)
  .post(authorize(PERMISSIONS.PATIENT_CREATE), validate(CreateBillingSchema), controller.create);

router.route('/:id')
  .get(authorize(PERMISSIONS.PATIENT_READ), controller.getOne)
  .put(authorize(PERMISSIONS.PATIENT_UPDATE), validate(UpdateBillingSchema), controller.update)
  .delete(authorize(PERMISSIONS.PATIENT_DELETE), controller.delete);

export default router;

