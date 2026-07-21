/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Router } from 'express';
import { LabController } from './lab.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { CreateLabSchema, UpdateLabSchema } from './lab.dto.js';
import { PERMISSIONS } from '@medicore360/shared';

const router = Router();
const controller = new LabController();

router.use(authenticate);

router.route('/')
  .get(authorize(PERMISSIONS.PATIENT_READ), controller.getMany)
  .post(authorize(PERMISSIONS.PATIENT_CREATE), validate(CreateLabSchema), controller.create);

router.route('/:id')
  .get(authorize(PERMISSIONS.PATIENT_READ), controller.getOne)
  .put(authorize(PERMISSIONS.PATIENT_UPDATE), validate(UpdateLabSchema), controller.update)
  .delete(authorize(PERMISSIONS.PATIENT_DELETE), controller.delete);

export default router;

