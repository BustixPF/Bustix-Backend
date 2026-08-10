import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type EmailTemplateName =
  | '01-registro-usuario.html'
  | '02-solicitud-empresa.html'
  | '03-empresa-aprobada.html'
  | '04-empresa-rechazada.html'
  | '05-cambio-rol.html'
  | '06-solicitud-ruta.html'
  | '07-ruta-aprobada.html'
  | '08-solicitud-horario.html'
  | '09-horario-aprobado.html'
  | '10-compra-exitosa.html'
  | '11-recordatorio-48h.html'
  | '12-recordatorio-24h.html';

type TemplateValue = string | number;

@Injectable()
export class EmailTemplatesService {
  private readonly templates = new Map<EmailTemplateName, string>();

  render(
    templateName: EmailTemplateName,
    variables: Record<string, TemplateValue>,
  ): string {
    const template = this.load(templateName);

    return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key: string) => {
      if (!Object.prototype.hasOwnProperty.call(variables, key)) {
        throw new Error(
          `Falta la variable ${key} para la plantilla ${templateName}`,
        );
      }

      return this.escapeHtml(String(variables[key]));
    });
  }

  private load(templateName: EmailTemplateName): string {
    const cached = this.templates.get(templateName);
    if (cached) return cached;

    const paths = [
      join(__dirname, 'templates', templateName),
      join(__dirname, '..', '..', 'notifications', 'templates', templateName),
    ];
    const templatePath = paths.find((path) => existsSync(path));

    if (!templatePath) {
      throw new Error(
        `No se encontró la plantilla ${templateName}. Rutas revisadas: ${paths.join(', ')}`,
      );
    }

    const template = readFileSync(templatePath, 'utf8');
    this.templates.set(templateName, template);
    return template;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
