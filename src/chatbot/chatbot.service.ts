import { Injectable, BadGatewayException, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { environment } from '../config/environment';
import { SendMessageDto } from './dto/send-message.dto';

const SYSTEM_PROMPT = `Sos el asistente virtual de BusTix, una plataforma para comprar pasajes de bus en toda Colombia.

Tu trabajo es resolver dudas de los pasajeros de forma cordial, clara y precisa, en español.

Sabés lo siguiente sobre BusTix:
- Los usuarios se registran como "Pasajero" o como "Empresa de transporte".
- Para comprar un pasaje: el usuario busca un viaje por origen/destino/fecha, elige uno o varios asientos disponibles, y paga con tarjeta a través de Stripe.
- Los pagos se procesan en pesos colombianos (COP).
- Una vez confirmado el pago, se genera un tiquete con el asiento y la fecha de salida, visible en el dashboard del usuario.
- Las empresas de transporte pueden cargar sus rutas y horarios, sujetos a aprobación.

Reglas importantes:
- No tenés acceso a los datos reales de la cuenta de la persona que te escribe (no podés ver sus compras, pasajes ni pagos concretos). Si te preguntan algo específico de su cuenta, explicá amablemente que no podés consultar esa información y sugerí que revisen su dashboard o contacten soporte humano.
- Nunca inventes información sobre rutas, horarios o precios específicos que no conocés.
- Sé breve y directo, evitá respuestas larguísimas.
- Si no sabés algo, decilo con honestidad en vez de inventar.`;

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly client: GoogleGenAI;

  constructor() {
    if (!environment.GEMINI_API_KEY) {
      throw new Error('Falta configurar GEMINI_API_KEY en el .env');
    }
    this.client = new GoogleGenAI({ apiKey: environment.GEMINI_API_KEY });
  }

  async sendMessage(dto: SendMessageDto) {
    const contents = [
      ...(dto.history ?? []).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: dto.message }] },
    ];

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
        },
      });

      return {
        reply:
          response.text ?? 'No pude generar una respuesta, intentá de nuevo.',
      };
    } catch (error) {
      this.logger.error('Error llamando a la API de Gemini', error);
      throw new BadGatewayException(
        'No se pudo conectar con el asistente en este momento. Intentá de nuevo en unos segundos.',
      );
    }
  }
}
