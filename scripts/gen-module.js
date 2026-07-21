import fs from 'fs';
import path from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
  // eslint-disable-next-line no-console
  console.error('❌ Please provide a module name: node scripts/gen-module.js <name>');
  process.exit(1);
}

const formatCamel = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const nameLower = moduleName.toLowerCase();
const nameCamel = formatCamel(nameLower);

const baseDir = path.resolve(process.cwd(), `apps/api/src/modules/${nameLower}`);

const templates = {
  // Model template
  [`${nameLower}.model.ts`]: `import { Schema, model, Document } from 'mongoose';

export interface I${nameCamel} extends Document {
  hospitalId: string;
  name: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ${nameLower}Schema = new Schema<I${nameCamel}>(
  {
    hospitalId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const ${nameCamel} = model<I${nameCamel}>('${nameCamel}', ${nameLower}Schema);
`,

  // Repository template
  [`${nameLower}.repository.ts`]: `import { BaseRepository } from '../BaseRepository.js';
import { ${nameCamel}, I${nameCamel} } from './${nameLower}.model.js';

export class ${nameCamel}Repository extends BaseRepository<I${nameCamel}> {
  constructor() {
    super(${nameCamel});
  }
}
`,

  // DTO template
  [`${nameLower}.dto.ts`]: `import { z } from 'zod';

export const Create${nameCamel}Schema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
  }),
});

export const Update${nameCamel}Schema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID parameter is required'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  }),
});

export type Create${nameCamel}Input = z.infer<typeof Create${nameCamel}Schema>;
`,

  // Service template
  [`${nameLower}.service.ts`]: `import { ${nameCamel}Repository } from './${nameLower}.repository.js';
import { AppError } from '../../middleware/errorHandler.js';

export class ${nameCamel}Service {
  private repository = new ${nameCamel}Repository();

  async get${nameCamel}List(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async get${nameCamel}ById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('${nameCamel} not found', 404, 'NOT_FOUND');
    return item;
  }

  async create${nameCamel}(data: any, hospitalId: string) {
    return this.repository.create(data, hospitalId);
  }

  async update${nameCamel}(id: string, data: any, hospitalId: string) {
    await this.get${nameCamel}ById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async delete${nameCamel}(id: string, hospitalId: string) {
    await this.get${nameCamel}ById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}
`,

  // Controller template
  [`${nameLower}.controller.ts`]: `import { Request, Response, NextFunction } from 'express';
import { ${nameCamel}Service } from './${nameLower}.service.js';

export class ${nameCamel}Controller {
  private service = new ${nameCamel}Service();

  getMany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      const { page, limit, sortBy, sortOrder, ...filters } = req.query;
      
      const results = await this.service.get${nameCamel}List(
        filters,
        { page, limit, sortBy, sortOrder },
        hospitalId
      );
      
      res.status(200).json({
        success: true,
        data: results.items,
        meta: results.meta,
      });
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      const result = await this.service.get${nameCamel}ById(req.params.id, hospitalId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      const result = await this.service.create${nameCamel}(req.body, hospitalId);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      const result = await this.service.update${nameCamel}(req.params.id, req.body, hospitalId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      await this.service.delete${nameCamel}(req.params.id, hospitalId);
      res.status(200).json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  };
}
`,

  // Routes template
  [`${nameLower}.routes.ts`]: `import { Router } from 'express';
import { ${nameCamel}Controller } from './${nameLower}.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { Create${nameCamel}Schema, Update${nameCamel}Schema } from './${nameLower}.dto.js';
import { PERMISSIONS } from '@medicore360/shared';

const router = Router();
const controller = new ${nameCamel}Controller();

router.use(authenticate);

router.route('/')
  .get(authorize(PERMISSIONS.PATIENT_READ), controller.getMany)
  .post(authorize(PERMISSIONS.PATIENT_CREATE), validate(Create${nameCamel}Schema), controller.create);

router.route('/:id')
  .get(authorize(PERMISSIONS.PATIENT_READ), controller.getOne)
  .put(authorize(PERMISSIONS.PATIENT_UPDATE), validate(Update${nameCamel}Schema), controller.update)
  .delete(authorize(PERMISSIONS.PATIENT_DELETE), controller.delete);

export default router;
`,
};

// Create target directory
fs.mkdirSync(baseDir, { recursive: true });

// Write all file templates
Object.entries(templates).forEach(([fileName, content]) => {
  const filePath = path.join(baseDir, fileName);
  fs.writeFileSync(filePath, content, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`✅ Created: ${filePath}`);
});

// eslint-disable-next-line no-console
console.log(`\n🎉 Module "${nameCamel}" scaffolded successfully under Clean Architecture patterns!`);
