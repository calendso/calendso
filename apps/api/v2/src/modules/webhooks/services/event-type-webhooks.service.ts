import { CreateWebhookInputDto } from "@/modules/webhooks/inputs/create-webhook.input";
import { WebhooksRepository } from "@/modules/webhooks/webhooks.repository";
import { ConflictException, Injectable } from "@nestjs/common";

@Injectable()
export class EventTypeWebhooksService {
  constructor(private readonly webhooksRepository: WebhooksRepository) {}

  async createEventTypeWebhook(eventTypeId: number, body: CreateWebhookInputDto) {
    const existingWebhook = await this.webhooksRepository.getEventTypeWebhookByUrl(
      eventTypeId,
      body.subscriberUrl
    );
    if (existingWebhook) {
      throw new ConflictException("Webhook with this subscriber url already exists for this event type");
    }
    return this.webhooksRepository.createEventTypeWebhook(eventTypeId, {
      ...body,
      payloadTemplate: body.payloadTemplate ?? null,
      active: body.active ?? true,
      secret: body.secret ?? null,
    });
  }

  getEventTypeWebhooksPaginated(eventTypeId: number, skip: number, take: number) {
    return this.webhooksRepository.getEventTypeWebhooksPaginated(eventTypeId, skip, take);
  }

  async deleteAllEventTypeWebhooks(eventTypeId: number): Promise<{ count: number }> {
    return this.webhooksRepository.deleteAllEventTypeWebhooks(eventTypeId);
  }
}
