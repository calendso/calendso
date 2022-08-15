import CloseComCalendarService from "@calcom/closecom/lib/CalendarService";
import CloseCom from "@calcom/lib/CloseCom";
import { CalendarEvent } from "@calcom/types/Calendar";

jest.mock("@calcom/lib/CloseCom", () => {
  return class {
    constructor() {
      /* Mock */
    }
  };
});

afterEach(() => {
  jest.resetAllMocks();
});

const mockedCredential = {
  id: 1,
  key: "",
  appId: "",
  type: "",
  userId: 1,
};

// getCloseComGenericLeadId
test("check generic lead generator: already exists", async () => {
  CloseCom.prototype.lead = {
    list: () => ({
      data: [{ name: "From Cal.com", id: "abc" }],
    }),
  } as any;

  const closeComCalendarService = new CloseComCalendarService(mockedCredential);
  const spy = jest.spyOn(closeComCalendarService, "getCloseComGenericLeadId");
  const mockedGetCloseComGenericLeadId = spy.getMockImplementation();
  if (mockedGetCloseComGenericLeadId) {
    const id = await mockedGetCloseComGenericLeadId();
    expect(id).toEqual("abc");
  }
});

// getCloseComGenericLeadId
test("check generic lead generator: doesn't exist", async () => {
  CloseCom.prototype.lead = {
    list: () => ({
      data: [],
    }),
    create: () => ({ id: "def" }),
  } as any;

  const closeComCalendarService = new CloseComCalendarService(mockedCredential);
  const spy = jest.spyOn(closeComCalendarService, "getCloseComGenericLeadId");
  const mockedGetCloseComGenericLeadId = spy.getMockImplementation();
  if (mockedGetCloseComGenericLeadId) {
    const id = await mockedGetCloseComGenericLeadId();
    expect(id).toEqual("def");
  }
});

// getCloseComContactIds
test("retrieve contact IDs: all exist", async () => {
  const attendees = [
    { email: "test1@example.com", id: "test1" },
    { email: "test2@example.com", id: "test2" },
  ];

  const event = {
    attendees,
  } as CalendarEvent;

  CloseCom.prototype.contact = {
    search: () => ({ data: attendees }),
  } as any;

  const closeComCalendarService = new CloseComCalendarService(mockedCredential);
  const spy = jest.spyOn(closeComCalendarService, "getCloseComContactIds");
  const mockedGetCloseComContactIds = spy.getMockImplementation();
  if (mockedGetCloseComContactIds) {
    const contactIds = await mockedGetCloseComContactIds(event, "leadId");
    expect(contactIds).toEqual(["test1", "test2"]);
  }
});

// getCloseComContactIds
test("retrieve contact IDs: some don't exist", async () => {
  const attendees = [{ email: "test1@example.com", id: "test1" }, { email: "test2@example.com" }];

  const event = {
    attendees,
  } as CalendarEvent;

  CloseCom.prototype.contact = {
    search: () => ({ data: [{ emails: [{ email: "test1@example.com" }], id: "test1" }] }),
    create: () => ({ id: "test3" }),
  } as any;

  const closeComCalendarService = new CloseComCalendarService(mockedCredential);
  const spy = jest.spyOn(closeComCalendarService, "getCloseComContactIds");
  const mockedGetCloseComContactIds = spy.getMockImplementation();
  if (mockedGetCloseComContactIds) {
    const contactIds = await mockedGetCloseComContactIds(event, "leadId");
    expect(contactIds).toEqual(["test1", "test3"]);
  }
});

// getCloseComCustomActivityTypeFieldsIds
test("retrieve custom fields for custom activity type: type doesn't exist, no field created", async () => {
  CloseCom.prototype.activity = {
    type: {
      get: () => [],
    },
  } as any;

  CloseCom.prototype.customActivity = {
    type: {
      get: () => ({ data: [] }),
      create: () => ({ id: "type1" }),
    },
  } as any;

  CloseCom.prototype.customField = {
    activity: {
      create: (data: { name: string }) => ({ id: `field${data.name.length}${data.name[0]}` }),
    },
  } as any;

  const closeComCalendarService = new CloseComCalendarService(mockedCredential);
  const spy = jest.spyOn(closeComCalendarService, "getCloseComCustomActivityTypeFieldsIds");
  const mockedGetCloseComCustomActivityTypeFieldsIds = spy.getMockImplementation();
  if (mockedGetCloseComCustomActivityTypeFieldsIds) {
    const contactIds = await mockedGetCloseComCustomActivityTypeFieldsIds();
    expect(contactIds).toEqual({
      activityType: "type1",
      fields: {
        attendee: "field9A",
        dateTime: "field11D",
        timezone: "field9T",
        organizer: "field9O",
        additionalNotes: "field16A",
      },
    });
  }
});

// getCloseComCustomActivityTypeFieldsIds
test("retrieve custom fields for custom activity type: type exists, no field created", async () => {
  CloseCom.prototype.activity = {
    type: {
      get: () => [],
    },
  } as any;

  CloseCom.prototype.customActivity = {
    type: {
      get: () => ({ data: [{ id: "typeX", name: "Cal.com Activity" }] }),
    },
  } as any;

  CloseCom.prototype.customField = {
    activity: {
      get: () => ({ data: [{ id: "fieldY", custom_activity_type_id: "typeX", name: "Attendees" }] }),
      create: (data: { name: string }) => ({ id: `field${data.name.length}${data.name[0]}` }),
    },
  } as any;

  const closeComCalendarService = new CloseComCalendarService(mockedCredential);
  const spy = jest.spyOn(closeComCalendarService, "getCloseComCustomActivityTypeFieldsIds");
  const mockedGetCloseComCustomActivityTypeFieldsIds = spy.getMockImplementation();
  if (mockedGetCloseComCustomActivityTypeFieldsIds) {
    const contactIds = await mockedGetCloseComCustomActivityTypeFieldsIds();
    expect(contactIds).toEqual({
      activityType: "typeX",
      fields: {
        attendee: "fieldY",
        dateTime: "field11D",
        timezone: "field9T",
        organizer: "field9O",
        additionalNotes: "field16A",
      },
    });
  }
});

// getCustomActivityTypeInstanceData
test("prepare data to create custom activity type instance: two attendees, no additional notes", async () => {
  const attendees = [
    { email: "test1@example.com", id: "test1", timeZone: "America/Montevideo" },
    { email: "test2@example.com" },
  ];

  const now = new Date();

  const event = {
    attendees,
    startTime: now.toISOString(),
  } as CalendarEvent;

  CloseCom.prototype.activity = {
    type: {
      get: () => [],
    },
  } as any;

  CloseCom.prototype.customActivity = {
    type: {
      get: () => ({ data: [] }),
      create: () => ({ id: "type1" }),
    },
  } as any;

  CloseCom.prototype.customField = {
    activity: {
      create: (data: { name: string }) => ({ id: `field${data.name.length}${data.name[0]}` }),
    },
  } as any;

  CloseCom.prototype.lead = {
    list: () => ({
      data: [],
    }),
    create: () => ({ id: "def" }),
  } as any;

  const closeComCalendarService = new CloseComCalendarService(mockedCredential);
  const spy = jest.spyOn(closeComCalendarService, "getCustomActivityTypeInstanceData");
  const mockedGetCustomActivityTypeInstanceData = spy.getMockImplementation();
  if (mockedGetCustomActivityTypeInstanceData) {
    const data = await mockedGetCustomActivityTypeInstanceData(event);
    expect(data).toEqual({
      custom_activity_type_id: "type1",
      lead_id: "def",
      "custom.field9A": ["test3"],
      "custom.field11D": now.toISOString(),
      "custom.field9T": "America/Montevideo",
      "custom.field9O": "test1",
      "custom.field16A": null,
    });
  }
});

// getCustomActivityTypeInstanceData
test("prepare data to create custom activity type instance: one attendees, with additional notes", async () => {
  const attendees = [{ email: "test1@example.com", id: "test1", timeZone: "America/Montevideo" }];

  const now = new Date();

  const event = {
    attendees,
    startTime: now.toISOString(),
    additionalNotes: "Some comment!",
  } as CalendarEvent;

  CloseCom.prototype.activity = {
    type: {
      get: () => [],
    },
  } as any;

  CloseCom.prototype.customActivity = {
    type: {
      get: () => ({ data: [] }),
      create: () => ({ id: "type1" }),
    },
  } as any;

  CloseCom.prototype.customField = {
    activity: {
      create: (data: { name: string }) => ({ id: `field${data.name.length}${data.name[0]}` }),
    },
  } as any;

  CloseCom.prototype.lead = {
    list: () => ({
      data: [{ name: "From Cal.com", id: "abc" }],
    }),
  } as any;

  const closeComCalendarService = new CloseComCalendarService(mockedCredential);
  const spy = jest.spyOn(closeComCalendarService, "getCustomActivityTypeInstanceData");
  const mockedGetCustomActivityTypeInstanceData = spy.getMockImplementation();
  if (mockedGetCustomActivityTypeInstanceData) {
    const data = await mockedGetCustomActivityTypeInstanceData(event);
    expect(data).toEqual({
      custom_activity_type_id: "type1",
      lead_id: "abc",
      "custom.field9A": null,
      "custom.field11D": now.toISOString(),
      "custom.field9T": "America/Montevideo",
      "custom.field9O": "test1",
      "custom.field16A": "Some comment!",
    });
  }
});
