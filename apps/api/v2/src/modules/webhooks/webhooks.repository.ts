import { PrismaReadService } from "@/modules/prisma/prisma-read.service";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

import { PrismaWriteService } from "../prisma/prisma-write.service";
import { CreateWebhookInputDto } from "./inputs/create-webhook.input";

@Injectable()
export class WebhooksRepository {
  constructor(private readonly dbRead: PrismaReadService, private readonly dbWrite: PrismaWriteService) {}

  async createUserWebhook(userId: number, data: CreateWebhookInputDto) {
    const id = uuidv4();
    return this.dbWrite.prisma.webhook.create({
      data: { ...data, id, userId },
    });
  }

  async createEventTypeWebhook(eventTypeId: number, data: CreateWebhookInputDto) {
    const id = uuidv4();
    return this.dbWrite.prisma.webhook.create({
      data: { ...data, id, eventTypeId },
    });
  }

  async updateWebhook(webhookId: string, data: Partial<CreateWebhookInputDto>) {
    return this.dbWrite.prisma.webhook.update({
      where: { id: webhookId },
      data,
    });
  }

  async getWebhookById(webhookId: string) {
    return this.dbRead.prisma.webhook.findFirst({
      where: { id: webhookId },
    });
  }

  async getUserWebhooksPaginated(userId: number, skip: number, take: number) {
    return this.dbRead.prisma.webhook.findMany({
      where: { userId },
      skip,
      take,
    });
  }

  async getEventTypeWebhooksPaginated(eventTypeId: number, skip: number, take: number) {
    return this.dbRead.prisma.webhook.findMany({
      where: { eventTypeId },
      skip,
      take,
    });
  }

  async getUserWebhookByUrl(userId: number, subscriberUrl: string) {
    return this.dbRead.prisma.webhook.findFirst({
      where: { userId, subscriberUrl },
    });
  }

  async getEventTypeWebhookByUrl(eventTypeId: number, subscriberUrl: string) {
    return this.dbRead.prisma.webhook.findFirst({
      where: { eventTypeId, subscriberUrl },
    });
  }

  async deleteWebhook(webhookId: string) {
    return this.dbWrite.prisma.webhook.delete({
      where: { id: webhookId },
    });
  }
}
