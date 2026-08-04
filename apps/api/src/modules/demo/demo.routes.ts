/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Router } from 'express';
import { DemoController } from './demo.controller.js';
import { validate } from '../../middleware/validate.js';
import { CreateDemoSchema, UpdateDemoSchema } from './demo.dto.js';

const router = Router();
const controller = new DemoController();

router.route('/')
  .get(controller.getMany)
  .post(validate(CreateDemoSchema), controller.create);

router.route('/:id')
  .get(controller.getOne)
  .put(validate(UpdateDemoSchema), controller.update)
  .delete(controller.delete);

export default router;

