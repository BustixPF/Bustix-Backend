import {
  EmailTemplateName,
  EmailTemplatesService,
} from './email-templates.service';

describe('EmailTemplatesService', () => {
  const service = new EmailTemplatesService();
  const templates: EmailTemplateName[] = [
    '01-registro-usuario.html',
    '02-solicitud-empresa.html',
    '03-empresa-aprobada.html',
    '04-empresa-rechazada.html',
    '05-cambio-rol.html',
    '06-solicitud-ruta.html',
    '07-ruta-aprobada.html',
    '08-solicitud-horario.html',
    '09-horario-aprobado.html',
    '10-compra-exitosa.html',
    '11-recordatorio-48h.html',
    '12-recordatorio-24h.html',
  ];
  const variables = {
    nombre: '<Usuario>',
    url_buscar: 'https://bustix.example/viajes?a=1&b=2',
    empresa: 'Empresa Demo',
    fecha_solicitud: '7 de agosto de 2026',
    numero_rutas: 0,
    url_panel: 'https://bustix.example/panel',
    motivo_rechazo: 'Documentacion incompleta',
    fecha_cambio: '7 de agosto de 2026',
    nuevo_rol: 'admin',
    rol_anterior: 'user',
    url_cuenta: 'https://bustix.example/cuenta',
    destino: 'Medellin',
    origen: 'Bogota',
    fecha_aprobacion: '7 de agosto de 2026',
    url_horarios: 'https://bustix.example/horarios',
    hora: '08:30 a. m.',
    cupos: 40,
    asiento: '3, 8',
    codigo_reserva: 'pay-123',
    fecha: '9 de agosto de 2026',
    url_tiquete: 'https://bustix.example/tiquetes/pay-123',
  };

  it.each(templates)('renders every placeholder in %s', (template) => {
    const html = service.render(template, variables);

    expect(html).not.toMatch(/\{\{[^}]+\}\}/);
    expect(html).not.toContain('href="#"');
  });

  it('escapes dynamic HTML values', () => {
    const html = service.render('01-registro-usuario.html', variables);

    expect(html).toContain('&lt;Usuario&gt;');
    expect(html).not.toContain('<Usuario>');
  });

  it('fails when a required variable is missing', () => {
    expect(() =>
      service.render('01-registro-usuario.html', { nombre: 'Usuario' }),
    ).toThrow('Falta la variable url_buscar');
  });
});
