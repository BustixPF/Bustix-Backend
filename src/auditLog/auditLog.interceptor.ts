// src/audit/interceptors/audit.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AUDIT_ACTION_KEY } from './auditLog.decorator';
import { AuditLog } from './entity/auditLog.entity';



@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<string>(AUDIT_ACTION_KEY, context.getHandler());

    // Si el endpoint no tiene el decorador @AuditAction, continua sin registrar
    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, method, url, body, params, query, ip } = request;

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const log = this.auditRepo.create({
            userId: user?.sub || user?.id || null,
            userEmail: user?.email || null,
            userRole: user?.role || null,
            action,
            method,
            endpoint: url,
            payload: { body, params, query },
            response: responseData,
            ip,
          });

          await this.auditRepo.save(log);
        } catch (error) {
          console.error('Error al guardar el log de auditoría:', error);
        }
      }),
    );
  }
}