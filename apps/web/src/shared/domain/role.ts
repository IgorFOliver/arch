import { z } from 'zod';
import { ROLES } from '@4basearch/domain-types';

export const roleSchema = z.enum(ROLES);
