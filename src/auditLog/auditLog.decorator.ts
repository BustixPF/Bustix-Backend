import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'audit_action';
export const AuditAction = (actionName: string) =>
  SetMetadata(AUDIT_ACTION_KEY, actionName);
