import z from "zod";

import type { CloseComFieldOptions } from "@calcom/lib/CloseCom";
import CloseCom from "@calcom/lib/CloseCom";
import { getCustomActivityTypeInstanceData } from "@calcom/lib/CloseComeUtils";
import { symmetricDecrypt } from "@calcom/lib/crypto";
import logger from "@calcom/lib/logger";
import type { CalendarEvent } from "@calcom/types/Calendar";
import type { CredentialPayload } from "@calcom/types/Credential";
import type { CRM, ContactCreateInput, CrmEvent, Contact } from "@calcom/types/CrmService";

const apiKeySchema = z.object({
  encrypted: z.string(),
});

const CALENDSO_ENCRYPTION_KEY = process.env.CALENDSO_ENCRYPTION_KEY || "";

// Cal.com Custom Activity Fields
const calComCustomActivityFields: CloseComFieldOptions = [
  // Field name, field type, required?, multiple values?
  ["Attendees", "contact", false, true],
  ["Date & Time", "datetime", true, false],
  ["Time zone", "text", true, false],
  ["Organizer", "contact", true, false],
  ["Additional notes", "text", false, false],
];

/**
 * Authentication
 * Close.com requires Basic Auth for any request to their APIs, which is far from
 * ideal considering that such a strategy requires generating an API Key by the
 * user and input it in our system. A Setup page was created when trying to install
 * Close.com App in order to instruct how to create such resource and to obtain it.
 *
 * Meeting creation
 * Close.com does not expose a "Meeting" API, it may be available in the future.
 *
 * Per Close.com documentation (https://developer.close.com/resources/custom-activities):
 * "To work with Custom Activities, you will need to create a Custom Activity Type and
 * likely add one or more Activity Custom Fields to that type. Once the Custom Activity
 * Type is defined, you can create Custom Activity instances of that type as you would
 * any other activity."
 *
 * Contact creation
 * Every contact in Close.com need to belong to a Lead. When creating a contact in
 * Close.com as part of this integration, a new generic Lead will be created in order
 * to assign every contact created by this process, and it is named "From Cal.com"
 */
export default class CloseComCRMService implements CRM {
  private integrationName = "";
  private closeCom: CloseCom;
  private log: typeof logger;

  constructor(credential: CredentialPayload) {
    this.integrationName = "closecom_other_calendar";
    this.log = logger.getSubLogger({ prefix: [`[[lib] ${this.integrationName}`] });

    const parsedCredentialKey = apiKeySchema.safeParse(credential.key);

    let decrypted;
    if (parsedCredentialKey.success) {
      decrypted = symmetricDecrypt(parsedCredentialKey.data.encrypted, CALENDSO_ENCRYPTION_KEY);
      const { api_key } = JSON.parse(decrypted);
      this.closeCom = new CloseCom(api_key);
    } else {
      throw Error(
        `No API Key found for userId ${credential.userId} and appId ${credential.appId}: ${parsedCredentialKey.error}`
      );
    }
  }

  closeComUpdateCustomActivity = async (uid: string, event: CalendarEvent) => {
    const customActivityTypeInstanceData = await getCustomActivityTypeInstanceData(
      event,
      calComCustomActivityFields,
      this.closeCom
    );
    // Create Custom Activity type instance
    const customActivityTypeInstance = await this.closeCom.activity.custom.create(
      customActivityTypeInstanceData
    );
    return this.closeCom.activity.custom.update(uid, customActivityTypeInstance);
  };

  closeComDeleteCustomActivity = async (uid: string) => {
    return this.closeCom.activity.custom.delete(uid);
  };

  async createEvent(event: CalendarEvent): Promise<CrmEvent> {
    const customActivityTypeInstanceData = await getCustomActivityTypeInstanceData(
      event,
      calComCustomActivityFields,
      this.closeCom
    );
    // Create Custom Activity type instance
    const customActivityTypeInstance = await this.closeCom.activity.custom.create(
      customActivityTypeInstanceData
    );
    return Promise.resolve({
      uid: customActivityTypeInstance.id,
      id: customActivityTypeInstance.id,
      type: this.integrationName,
      password: "",
      url: "",
      additionalInfo: {
        customActivityTypeInstanceData,
      },
      success: true,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateEvent(uid: string, event: CalendarEvent): Promise<CrmEvent> {
    const updatedEvent = await this.closeComUpdateCustomActivity(uid, event);
    return {
      id: updatedEvent.id,
    };
  }

  async deleteEvent(uid: string): Promise<void> {
    await this.closeComDeleteCustomActivity(uid);
  }

  async getContacts(emails: string | string[]): Promise<Contact[]> {
    const contactsQuery = await this.closeCom.contact.search({
      emails: Array.isArray(emails) ? emails : [emails],
    });

    return contactsQuery.data.map((contact) => {
      return {
        id: contact.id,
        email: contact.emails[0].email,
        name: contact.name,
      };
    });
  }

  async createContacts(contactsToCreate: ContactCreateInput[]): Promise<Contact[]> {
    const createContactPromise = [];
    for (const contact of contactsToCreate) {
      createContactPromise.push(
        this.closeCom.contact.create({
          person: {
            email: contact.email,
            name: contact.name,
          },
        })
      );
    }
    const createdContacts = await Promise.all(createContactPromise);
    return createdContacts.map((contact) => {
      return {
        id: contact.id,
        email: contact.emails[0].email,
        name: contact.name,
      };
    });
  }
}
