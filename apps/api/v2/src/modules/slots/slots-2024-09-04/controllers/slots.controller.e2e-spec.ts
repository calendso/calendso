import { bootstrap } from "@/app";
import { AppModule } from "@/app.module";
import { SchedulesModule_2024_06_11 } from "@/ee/schedules/schedules_2024_06_11/schedules.module";
import { SchedulesService_2024_06_11 } from "@/ee/schedules/schedules_2024_06_11/services/schedules.service";
import { PermissionsGuard } from "@/modules/auth/guards/permissions/permissions.guard";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { GetSlotsOutput_2024_09_04 } from "@/modules/slots/slots-2024-09-04/outputs/get-slots.output";
import { ReserveSlotOutput_2024_09_04 } from "@/modules/slots/slots-2024-09-04/outputs/reserve-slot.output";
import { SlotsModule_2024_09_04 } from "@/modules/slots/slots-2024-09-04/slots.module";
import { TokensModule } from "@/modules/tokens/tokens.module";
import { UsersModule } from "@/modules/users/users.module";
import { INestApplication } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { User } from "@prisma/client";
import * as request from "supertest";
import { BookingsRepositoryFixture } from "test/fixtures/repository/bookings.repository.fixture";
import { EventTypesRepositoryFixture } from "test/fixtures/repository/event-types.repository.fixture";
import { MembershipRepositoryFixture } from "test/fixtures/repository/membership.repository.fixture";
import { OrganizationRepositoryFixture } from "test/fixtures/repository/organization.repository.fixture";
import { ProfileRepositoryFixture } from "test/fixtures/repository/profiles.repository.fixture";
import { SelectedSlotsRepositoryFixture } from "test/fixtures/repository/selected-slots.repository.fixture";
import { TeamRepositoryFixture } from "test/fixtures/repository/team.repository.fixture";
import { UserRepositoryFixture } from "test/fixtures/repository/users.repository.fixture";
import { withApiAuth } from "test/utils/withApiAuth";

import { CAL_API_VERSION_HEADER, SUCCESS_STATUS, VERSION_2024_09_04 } from "@calcom/platform-constants";
import {
  CreateScheduleInput_2024_06_11,
  ReserveSlotOutput_2024_09_04 as ReserveSlotOutputData_2024_09_04,
} from "@calcom/platform-types";
import { Team } from "@calcom/prisma/client";

const expectedSlotsUTC = {
  "2050-09-05": [
    "2050-09-05T07:00:00.000Z",
    "2050-09-05T08:00:00.000Z",
    "2050-09-05T09:00:00.000Z",
    "2050-09-05T10:00:00.000Z",
    "2050-09-05T11:00:00.000Z",
    "2050-09-05T12:00:00.000Z",
    "2050-09-05T13:00:00.000Z",
    "2050-09-05T14:00:00.000Z",
  ],
  "2050-09-06": [
    "2050-09-06T07:00:00.000Z",
    "2050-09-06T08:00:00.000Z",
    "2050-09-06T09:00:00.000Z",
    "2050-09-06T10:00:00.000Z",
    "2050-09-06T11:00:00.000Z",
    "2050-09-06T12:00:00.000Z",
    "2050-09-06T13:00:00.000Z",
    "2050-09-06T14:00:00.000Z",
  ],
  "2050-09-07": [
    "2050-09-07T07:00:00.000Z",
    "2050-09-07T08:00:00.000Z",
    "2050-09-07T09:00:00.000Z",
    "2050-09-07T10:00:00.000Z",
    "2050-09-07T11:00:00.000Z",
    "2050-09-07T12:00:00.000Z",
    "2050-09-07T13:00:00.000Z",
    "2050-09-07T14:00:00.000Z",
  ],
  "2050-09-08": [
    "2050-09-08T07:00:00.000Z",
    "2050-09-08T08:00:00.000Z",
    "2050-09-08T09:00:00.000Z",
    "2050-09-08T10:00:00.000Z",
    "2050-09-08T11:00:00.000Z",
    "2050-09-08T12:00:00.000Z",
    "2050-09-08T13:00:00.000Z",
    "2050-09-08T14:00:00.000Z",
  ],
  "2050-09-09": [
    "2050-09-09T07:00:00.000Z",
    "2050-09-09T08:00:00.000Z",
    "2050-09-09T09:00:00.000Z",
    "2050-09-09T10:00:00.000Z",
    "2050-09-09T11:00:00.000Z",
    "2050-09-09T12:00:00.000Z",
    "2050-09-09T13:00:00.000Z",
    "2050-09-09T14:00:00.000Z",
  ],
};

const expectedSlotsRome = {
  "2050-09-05": [
    "2050-09-05T09:00:00.000+02:00",
    "2050-09-05T10:00:00.000+02:00",
    "2050-09-05T11:00:00.000+02:00",
    "2050-09-05T12:00:00.000+02:00",
    "2050-09-05T13:00:00.000+02:00",
    "2050-09-05T14:00:00.000+02:00",
    "2050-09-05T15:00:00.000+02:00",
    "2050-09-05T16:00:00.000+02:00",
  ],
  "2050-09-06": [
    "2050-09-06T09:00:00.000+02:00",
    "2050-09-06T10:00:00.000+02:00",
    "2050-09-06T11:00:00.000+02:00",
    "2050-09-06T12:00:00.000+02:00",
    "2050-09-06T13:00:00.000+02:00",
    "2050-09-06T14:00:00.000+02:00",
    "2050-09-06T15:00:00.000+02:00",
    "2050-09-06T16:00:00.000+02:00",
  ],
  "2050-09-07": [
    "2050-09-07T09:00:00.000+02:00",
    "2050-09-07T10:00:00.000+02:00",
    "2050-09-07T11:00:00.000+02:00",
    "2050-09-07T12:00:00.000+02:00",
    "2050-09-07T13:00:00.000+02:00",
    "2050-09-07T14:00:00.000+02:00",
    "2050-09-07T15:00:00.000+02:00",
    "2050-09-07T16:00:00.000+02:00",
  ],
  "2050-09-08": [
    "2050-09-08T09:00:00.000+02:00",
    "2050-09-08T10:00:00.000+02:00",
    "2050-09-08T11:00:00.000+02:00",
    "2050-09-08T12:00:00.000+02:00",
    "2050-09-08T13:00:00.000+02:00",
    "2050-09-08T14:00:00.000+02:00",
    "2050-09-08T15:00:00.000+02:00",
    "2050-09-08T16:00:00.000+02:00",
  ],
  "2050-09-09": [
    "2050-09-09T09:00:00.000+02:00",
    "2050-09-09T10:00:00.000+02:00",
    "2050-09-09T11:00:00.000+02:00",
    "2050-09-09T12:00:00.000+02:00",
    "2050-09-09T13:00:00.000+02:00",
    "2050-09-09T14:00:00.000+02:00",
    "2050-09-09T15:00:00.000+02:00",
    "2050-09-09T16:00:00.000+02:00",
  ],
};

describe("Slots Endpoints", () => {
  describe("Individual user slots", () => {
    let app: INestApplication;

    let userRepositoryFixture: UserRepositoryFixture;
    let schedulesService: SchedulesService_2024_06_11;
    let eventTypesRepositoryFixture: EventTypesRepositoryFixture;
    let selectedSlotsRepositoryFixture: SelectedSlotsRepositoryFixture;
    let bookingsRepositoryFixture: BookingsRepositoryFixture;

    const userEmail = "slotss-controller-e2e@api.com";
    let user: User;
    let eventTypeId: number;
    let eventTypeSlug: string;
    let reservedSlotUid: string;

    beforeAll(async () => {
      const moduleRef = await withApiAuth(
        userEmail,
        Test.createTestingModule({
          imports: [
            AppModule,
            PrismaModule,
            UsersModule,
            TokensModule,
            SchedulesModule_2024_06_11,
            SlotsModule_2024_09_04,
          ],
        })
      )
        .overrideGuard(PermissionsGuard)
        .useValue({
          canActivate: () => true,
        })
        .compile();

      userRepositoryFixture = new UserRepositoryFixture(moduleRef);
      schedulesService = moduleRef.get<SchedulesService_2024_06_11>(SchedulesService_2024_06_11);
      eventTypesRepositoryFixture = new EventTypesRepositoryFixture(moduleRef);
      selectedSlotsRepositoryFixture = new SelectedSlotsRepositoryFixture(moduleRef);
      bookingsRepositoryFixture = new BookingsRepositoryFixture(moduleRef);

      user = await userRepositoryFixture.create({
        email: userEmail,
        name: "slots controller e2e",
        username: "slots-controller-e2e",
      });

      const userSchedule: CreateScheduleInput_2024_06_11 = {
        name: "working time",
        timeZone: "Europe/Rome",
        isDefault: true,
      };
      // note(Lauris): this creates default schedule monday to friday from 9AM to 5PM in Europe/Rome timezone
      await schedulesService.createUserSchedule(user.id, userSchedule);

      const event = await eventTypesRepositoryFixture.create(
        { title: "frisbee match", slug: "frisbee-match", length: 60 },
        user.id
      );
      eventTypeId = event.id;
      eventTypeSlug = event.slug;

      app = moduleRef.createNestApplication();
      bootstrap(app as NestExpressApplication);

      await app.init();
    });

    it("should get slots in UTC by event type id", async () => {
      return request(app.getHttpServer())
        .get(`/api/v2/slots/available?eventTypeId=${eventTypeId}&start=2050-09-05&end=2050-09-09`)
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200)
        .then(async (response) => {
          const responseBody: GetSlotsOutput_2024_09_04 = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);
          const slots = responseBody.data;

          expect(slots).toBeDefined();
          const days = Object.keys(slots);
          expect(days.length).toEqual(5);
          expect(slots).toEqual(expectedSlotsUTC);
        });
    });

    it("should get slots in specified time zone by event type id", async () => {
      return request(app.getHttpServer())
        .get(
          `/api/v2/slots/available?eventTypeId=${eventTypeId}&start=2050-09-05&end=2050-09-09&timeZone=Europe/Rome`
        )
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200)
        .then(async (response) => {
          const responseBody: GetSlotsOutput_2024_09_04 = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);
          const slots = responseBody.data;

          expect(slots).toBeDefined();
          const days = Object.keys(slots);
          expect(days.length).toEqual(5);
          expect(slots).toEqual(expectedSlotsRome);
        });
    });

    it("should get slots in UTC by event type slug", async () => {
      return request(app.getHttpServer())
        .get(`/api/v2/slots/available?eventTypeSlug=${eventTypeSlug}&start=2050-09-05&end=2050-09-09`)
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200)
        .then(async (response) => {
          const responseBody: GetSlotsOutput_2024_09_04 = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);
          const slots = responseBody.data;

          expect(slots).toBeDefined();
          const days = Object.keys(slots);
          expect(days.length).toEqual(5);
          expect(slots).toEqual(expectedSlotsUTC);
        });
    });

    it("should get slots in specified time zone by event type slug", async () => {
      return request(app.getHttpServer())
        .get(
          `/api/v2/slots/available?eventTypeSlug=${eventTypeSlug}&start=2050-09-05&end=2050-09-09&timeZone=Europe/Rome`
        )
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200)
        .then(async (response) => {
          const responseBody: GetSlotsOutput_2024_09_04 = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);
          const slots = responseBody.data;

          expect(slots).toBeDefined();
          const days = Object.keys(slots);
          expect(days.length).toEqual(5);

          expect(slots).toEqual(expectedSlotsRome);
        });
    });

    it("should get slots by event type id and with start hours specified", async () => {
      return request(app.getHttpServer())
        .get(
          `/api/v2/slots/available?eventTypeId=${eventTypeId}&start=2050-09-05T09:00:00.000Z&end=2050-09-09`
        )
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200)
        .then(async (response) => {
          const responseBody: GetSlotsOutput_2024_09_04 = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);
          const slots = responseBody.data;

          expect(slots).toBeDefined();
          const days = Object.keys(slots);
          expect(days.length).toEqual(5);

          const expectedSlotsUTC2050_09_05 = expectedSlotsUTC["2050-09-05"].slice(2);
          expect(slots).toEqual({ ...expectedSlotsUTC, "2050-09-05": expectedSlotsUTC2050_09_05 });
        });
    });

    it("should get slots by event type id and with end hours specified", async () => {
      return request(app.getHttpServer())
        .get(
          `/api/v2/slots/available?eventTypeId=${eventTypeId}&start=2050-09-05&end=2050-09-09T12:00:00.000Z`
        )
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200)
        .then(async (response) => {
          const responseBody: GetSlotsOutput_2024_09_04 = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);
          const slots = responseBody.data;

          expect(slots).toBeDefined();
          const days = Object.keys(slots);
          expect(days.length).toEqual(5);

          const expectedSlotsUTC2050_09_09 = expectedSlotsUTC["2050-09-09"].slice(0, 5);
          expect(slots).toEqual({ ...expectedSlotsUTC, "2050-09-09": expectedSlotsUTC2050_09_09 });
        });
    });

    it("should get slots in specified time zone by event type id and with start hours specified", async () => {
      return request(app.getHttpServer())
        .get(
          `/api/v2/slots/available?eventTypeId=${eventTypeId}&start=2050-09-05T09:00:00.000Z&end=2050-09-09&timeZone=Europe/Rome`
        )
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200)
        .then(async (response) => {
          const responseBody: GetSlotsOutput_2024_09_04 = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);
          const slots = responseBody.data;

          expect(slots).toBeDefined();
          const days = Object.keys(slots);
          expect(days.length).toEqual(5);

          const expectedSlotsRome2050_09_05 = expectedSlotsRome["2050-09-05"].slice(2);
          expect(slots).toEqual({ ...expectedSlotsRome, "2050-09-05": expectedSlotsRome2050_09_05 });
        });
    });

    it("should get slots in specified time zone by event type id and with end hours specified", async () => {
      return request(app.getHttpServer())
        .get(
          `/api/v2/slots/available?eventTypeId=${eventTypeId}&start=2050-09-05&end=2050-09-09T12:00:00.000Z&timeZone=Europe/Rome`
        )
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200)
        .then(async (response) => {
          const responseBody: GetSlotsOutput_2024_09_04 = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);
          const slots = responseBody.data;

          expect(slots).toBeDefined();
          const days = Object.keys(slots);
          expect(days.length).toEqual(5);

          const expectedSlotsRome2050_09_09 = expectedSlotsRome["2050-09-09"].slice(0, 5);
          expect(slots).toEqual({ ...expectedSlotsRome, "2050-09-09": expectedSlotsRome2050_09_09 });
        });
    });

    it("should reserve a slot and it should not appear in available slots", async () => {
      const slotStartTime = "2050-09-05T10:00:00.000Z";
      const reserveResponse = await request(app.getHttpServer())
        .post(`/api/v2/slots`)
        .send({
          eventTypeId,
          start: slotStartTime,
        })
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(201);

      const reserveResponseBody: ReserveSlotOutput_2024_09_04 = reserveResponse.body;
      expect(reserveResponseBody.status).toEqual(SUCCESS_STATUS);
      const reservedSlot: ReserveSlotOutputData_2024_09_04 = reserveResponseBody.data;
      expect(reservedSlot.uid).toBeDefined();
      if (!reservedSlot.uid) {
        throw new Error("Reserved slot uid is undefined");
      }
      reservedSlotUid = reservedSlot.uid;

      const response = await request(app.getHttpServer())
        .get(`/api/v2/slots/available?eventTypeId=${eventTypeId}&start=2050-09-05&end=2050-09-09`)
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200);

      const responseBody: GetSlotsOutput_2024_09_04 = response.body;
      expect(responseBody.status).toEqual(SUCCESS_STATUS);
      const slots = responseBody.data;

      expect(slots).toBeDefined();
      const days = Object.keys(slots);
      expect(days.length).toEqual(5);

      const expectedSlotsUTC2050_09_05 = expectedSlotsUTC["2050-09-05"].filter(
        (slot) => slot !== slotStartTime
      );
      expect(slots).toEqual({ ...expectedSlotsUTC, "2050-09-05": expectedSlotsUTC2050_09_05 });
    });

    it("should delete reserved slot", async () => {
      await request(app.getHttpServer())
        .delete(`/api/v2/slots/${reservedSlotUid}`)
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200);
    });

    it("should do a booking and slot should not be available at that time", async () => {
      const startTime = "2050-09-05T11:00:00.000Z";
      await bookingsRepositoryFixture.create({
        uid: `booking-uid-${eventTypeId}`,
        title: "booking title",
        startTime,
        endTime: "2050-09-05T12:00:00.000Z",
        eventType: {
          connect: {
            id: eventTypeId,
          },
        },
        metadata: {},
        responses: {
          name: "tester",
          email: "tester@example.com",
          guests: [],
        },
        user: {
          connect: {
            id: user.id,
          },
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v2/slots/available?eventTypeId=${eventTypeId}&start=2050-09-05&end=2050-09-09`)
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200);

      const responseBody: GetSlotsOutput_2024_09_04 = response.body;
      expect(responseBody.status).toEqual(SUCCESS_STATUS);
      const slots = responseBody.data;

      expect(slots).toBeDefined();
      const days = Object.keys(slots);
      expect(days.length).toEqual(5);

      const expectedSlotsUTC2050_09_05 = expectedSlotsUTC["2050-09-05"].filter((slot) => slot !== startTime);
      expect(slots).toEqual({ ...expectedSlotsUTC, "2050-09-05": expectedSlotsUTC2050_09_05 });
    });

    afterAll(async () => {
      await userRepositoryFixture.deleteByEmail(user.email);
      await selectedSlotsRepositoryFixture.deleteByUId(reservedSlotUid);
      await bookingsRepositoryFixture.deleteAllBookings(user.id, user.email);

      await app.close();
    });
  });

  describe("Team event slots", () => {
    let app: INestApplication;

    let userRepositoryFixture: UserRepositoryFixture;
    let schedulesService: SchedulesService_2024_06_11;
    let teamRepositoryFixture: TeamRepositoryFixture;
    let eventTypesRepositoryFixture: EventTypesRepositoryFixture;
    let profileRepositoryFixture: ProfileRepositoryFixture;
    let membershipsRepositoryFixture: MembershipRepositoryFixture;
    let organizationsRepositoryFixture: OrganizationRepositoryFixture;
    let bookingsRepositoryFixture: BookingsRepositoryFixture;

    const userEmailOne = "slot-owner-one-e2e@api.com";
    const userEmailTwo = "slot-owner-two-e2e@api.com";

    let organization: Team;
    let team: Team;
    let userOne: User;
    let userTwo: User;
    let collectiveEventTypeId: number;
    let roundRobinEventTypeId: number;
    let collectiveBookingId: number;
    let roundRobinBookingId: number;
    let fullyBookedRoundRobinBookingIdOne: number;
    let fullyBookedRoundRobinBookingIdTwo: number;

    beforeAll(async () => {
      const moduleRef = await withApiAuth(
        userEmailOne,
        Test.createTestingModule({
          imports: [
            AppModule,
            PrismaModule,
            UsersModule,
            TokensModule,
            SchedulesModule_2024_06_11,
            SlotsModule_2024_09_04,
          ],
        })
      )
        .overrideGuard(PermissionsGuard)
        .useValue({
          canActivate: () => true,
        })
        .compile();

      userRepositoryFixture = new UserRepositoryFixture(moduleRef);
      schedulesService = moduleRef.get<SchedulesService_2024_06_11>(SchedulesService_2024_06_11);
      teamRepositoryFixture = new TeamRepositoryFixture(moduleRef);
      organizationsRepositoryFixture = new OrganizationRepositoryFixture(moduleRef);
      eventTypesRepositoryFixture = new EventTypesRepositoryFixture(moduleRef);
      profileRepositoryFixture = new ProfileRepositoryFixture(moduleRef);
      membershipsRepositoryFixture = new MembershipRepositoryFixture(moduleRef);
      bookingsRepositoryFixture = new BookingsRepositoryFixture(moduleRef);

      userOne = await userRepositoryFixture.create({
        email: userEmailOne,
        name: "teammate one",
        username: "teammate-one",
      });

      userTwo = await userRepositoryFixture.create({
        email: userEmailTwo,
        name: "teammate two",
        username: "teammate-two",
      });

      organization = await organizationsRepositoryFixture.create({
        name: "Testy Organization",
        isOrganization: true,
      });

      await profileRepositoryFixture.create({
        uid: `usr-${userOne.id}`,
        username: "teammate-one",
        organization: {
          connect: {
            id: organization.id,
          },
        },
        user: {
          connect: {
            id: userOne.id,
          },
        },
      });

      team = await teamRepositoryFixture.create({
        name: "Testy org team",
        isOrganization: false,
        parent: { connect: { id: organization.id } },
      });

      await membershipsRepositoryFixture.create({
        role: "MEMBER",
        user: { connect: { id: userOne.id } },
        team: { connect: { id: team.id } },
        accepted: true,
      });

      await membershipsRepositoryFixture.create({
        role: "MEMBER",
        user: { connect: { id: userTwo.id } },
        team: { connect: { id: team.id } },
        accepted: true,
      });

      const collectiveEventType = await eventTypesRepositoryFixture.createTeamEventType({
        schedulingType: "COLLECTIVE",
        team: {
          connect: { id: team.id },
        },
        title: "Collective Event Type",
        slug: "collective-event-type",
        length: 60,
        assignAllTeamMembers: true,
        bookingFields: [],
        locations: [],
        users: {
          connect: [{ id: userOne.id }, { id: userTwo.id }],
        },
      });
      collectiveEventTypeId = collectiveEventType.id;

      const roundRobinEventType = await eventTypesRepositoryFixture.createTeamEventType({
        schedulingType: "ROUND_ROBIN",
        team: {
          connect: { id: team.id },
        },
        title: "RR Event Type",
        slug: "rr-event-type",
        length: 60,
        assignAllTeamMembers: true,
        bookingFields: [],
        locations: [],
        users: {
          connect: [{ id: userOne.id }, { id: userTwo.id }],
        },
      });
      roundRobinEventTypeId = roundRobinEventType.id;

      const userSchedule: CreateScheduleInput_2024_06_11 = {
        name: "working time",
        timeZone: "Europe/Rome",
        isDefault: true,
      };
      // note(Lauris): this creates default schedule monday to friday from 9AM to 5PM in Europe/Rome timezone
      await schedulesService.createUserSchedule(userOne.id, userSchedule);
      await schedulesService.createUserSchedule(userTwo.id, userSchedule);

      app = moduleRef.createNestApplication();
      bootstrap(app as NestExpressApplication);

      await app.init();
    });

    it("should get collective team event slots in UTC", async () => {
      return request(app.getHttpServer())
        .get(`/api/v2/slots/available?eventTypeId=${collectiveEventTypeId}&start=2050-09-05&end=2050-09-09`)
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200)
        .then(async (response) => {
          const responseBody: GetSlotsOutput_2024_09_04 = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);
          const slots = responseBody.data;

          expect(slots).toBeDefined();
          const days = Object.keys(slots);
          expect(days.length).toEqual(5);
          expect(slots).toEqual(expectedSlotsUTC);
        });
    });

    it("should get round robin team event slots in UTC", async () => {
      return request(app.getHttpServer())
        .get(`/api/v2/slots/available?eventTypeId=${roundRobinEventTypeId}&start=2050-09-05&end=2050-09-09`)
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200)
        .then(async (response) => {
          const responseBody: GetSlotsOutput_2024_09_04 = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);
          const slots = responseBody.data;

          expect(slots).toBeDefined();
          const days = Object.keys(slots);
          expect(days.length).toEqual(5);
          expect(slots).toEqual(expectedSlotsUTC);
        });
    });

    it("should book collective event type and slot should not be available at that time", async () => {
      const startTime = "2050-09-05T11:00:00.000Z";
      const booking = await bookingsRepositoryFixture.create({
        uid: `booking-uid-${collectiveEventTypeId}`,
        title: "booking title",
        startTime,
        endTime: "2050-09-05T12:00:00.000Z",
        eventType: {
          connect: {
            id: collectiveEventTypeId,
          },
        },
        metadata: {},
        responses: {
          name: "tester",
          email: "tester@example.com",
          guests: [],
        },
        user: {
          connect: {
            id: userOne.id,
          },
        },
      });
      collectiveBookingId = booking.id;

      const response = await request(app.getHttpServer())
        .get(`/api/v2/slots/available?eventTypeId=${collectiveEventTypeId}&start=2050-09-05&end=2050-09-09`)
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200);

      const responseBody: GetSlotsOutput_2024_09_04 = response.body;
      expect(responseBody.status).toEqual(SUCCESS_STATUS);
      const slots = responseBody.data;

      expect(slots).toBeDefined();
      const days = Object.keys(slots);
      expect(days.length).toEqual(5);

      const expectedSlotsUTC2050_09_05 = expectedSlotsUTC["2050-09-05"].filter((slot) => slot !== startTime);
      expect(slots).toEqual({ ...expectedSlotsUTC, "2050-09-05": expectedSlotsUTC2050_09_05 });
      bookingsRepositoryFixture.deleteById(booking.id);
    });

    it("should book round robin event type and slot should be available at that time", async () => {
      const startTime = "2050-09-05T11:00:00.000Z";
      const booking = await bookingsRepositoryFixture.create({
        uid: `booking-uid-${roundRobinEventTypeId}`,
        title: "booking title",
        startTime,
        endTime: "2050-09-05T12:00:00.000Z",
        eventType: {
          connect: {
            id: roundRobinEventTypeId,
          },
        },
        metadata: {},
        responses: {
          name: "tester",
          email: "tester@example.com",
          guests: [],
        },
        user: {
          connect: {
            id: userOne.id,
          },
        },
      });
      roundRobinBookingId = booking.id;

      const response = await request(app.getHttpServer())
        .get(`/api/v2/slots/available?eventTypeId=${roundRobinEventTypeId}&start=2050-09-05&end=2050-09-09`)
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200);

      const responseBody: GetSlotsOutput_2024_09_04 = response.body;
      expect(responseBody.status).toEqual(SUCCESS_STATUS);
      const slots = responseBody.data;

      expect(slots).toBeDefined();
      const days = Object.keys(slots);
      expect(days.length).toEqual(5);

      expect(slots).toEqual(expectedSlotsUTC);
      bookingsRepositoryFixture.deleteById(booking.id);
    });

    it("should fully book round robin event type and slot should not be available at that time", async () => {
      const startTime = "2050-09-05T11:00:00.000Z";
      const bookingOne = await bookingsRepositoryFixture.create({
        uid: `booking-uid-${roundRobinEventTypeId}-1`,
        title: "booking title",
        startTime,
        endTime: "2050-09-05T12:00:00.000Z",
        eventType: {
          connect: {
            id: roundRobinEventTypeId,
          },
        },
        metadata: {},
        responses: {
          name: "tester",
          email: "tester@example.com",
          guests: [],
        },
        user: {
          connect: {
            id: userOne.id,
          },
        },
      });
      fullyBookedRoundRobinBookingIdOne = bookingOne.id;

      const bookingTwo = await bookingsRepositoryFixture.create({
        uid: `booking-uid-${roundRobinEventTypeId}-2`,
        title: "booking title",
        startTime,
        endTime: "2050-09-05T12:00:00.000Z",
        eventType: {
          connect: {
            id: roundRobinEventTypeId,
          },
        },
        metadata: {},
        responses: {
          name: "tester",
          email: "tester@example.com",
          guests: [],
        },
        user: {
          connect: {
            id: userTwo.id,
          },
        },
      });
      fullyBookedRoundRobinBookingIdTwo = bookingTwo.id;

      const response = await request(app.getHttpServer())
        .get(`/api/v2/slots/available?eventTypeId=${roundRobinEventTypeId}&start=2050-09-05&end=2050-09-09`)
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200);

      const responseBody: GetSlotsOutput_2024_09_04 = response.body;
      expect(responseBody.status).toEqual(SUCCESS_STATUS);
      const slots = responseBody.data;

      expect(slots).toBeDefined();
      const days = Object.keys(slots);
      expect(days.length).toEqual(5);

      const expectedSlotsUTC2050_09_05 = expectedSlotsUTC["2050-09-05"].filter((slot) => slot !== startTime);
      expect(slots).toEqual({ ...expectedSlotsUTC, "2050-09-05": expectedSlotsUTC2050_09_05 });
      bookingsRepositoryFixture.deleteById(bookingOne.id);
      bookingsRepositoryFixture.deleteById(bookingTwo.id);
    });

    afterAll(async () => {
      await userRepositoryFixture.deleteByEmail(userOne.email);
      await userRepositoryFixture.deleteByEmail(userTwo.email);
      await teamRepositoryFixture.delete(team.id);
      await organizationsRepositoryFixture.delete(organization.id);
      await bookingsRepositoryFixture.deleteById(collectiveBookingId);
      await bookingsRepositoryFixture.deleteById(roundRobinBookingId);
      await bookingsRepositoryFixture.deleteById(fullyBookedRoundRobinBookingIdOne);
      await bookingsRepositoryFixture.deleteById(fullyBookedRoundRobinBookingIdTwo);
      await app.close();
    });
  });

  describe("Dynamic users slots", () => {
    let app: INestApplication;

    let userRepositoryFixture: UserRepositoryFixture;
    let schedulesService: SchedulesService_2024_06_11;

    const userEmailOne = "slot-owner-one-e2e@api.com";
    const userEmailTwo = "slot-owner-two-e2e@api.com";

    let userOne: User;
    let userTwo: User;

    beforeAll(async () => {
      const moduleRef = await withApiAuth(
        userEmailOne,
        Test.createTestingModule({
          imports: [
            AppModule,
            PrismaModule,
            UsersModule,
            TokensModule,
            SchedulesModule_2024_06_11,
            SlotsModule_2024_09_04,
          ],
        })
      )
        .overrideGuard(PermissionsGuard)
        .useValue({
          canActivate: () => true,
        })
        .compile();

      userRepositoryFixture = new UserRepositoryFixture(moduleRef);
      schedulesService = moduleRef.get<SchedulesService_2024_06_11>(SchedulesService_2024_06_11);

      userOne = await userRepositoryFixture.create({
        email: userEmailOne,
        name: "slots owner one",
        username: "slots-owner-one",
      });

      userTwo = await userRepositoryFixture.create({
        email: userEmailTwo,
        name: "slots owner two",
        username: "slots-owner-two",
      });

      const userSchedule: CreateScheduleInput_2024_06_11 = {
        name: "working time",
        timeZone: "Europe/Rome",
        isDefault: true,
      };
      // note(Lauris): this creates default schedule monday to friday from 9AM to 5PM in Europe/Rome timezone
      await schedulesService.createUserSchedule(userOne.id, userSchedule);
      await schedulesService.createUserSchedule(userTwo.id, userSchedule);

      app = moduleRef.createNestApplication();
      bootstrap(app as NestExpressApplication);

      await app.init();
    });

    it("should get slots in UTC by usernames", async () => {
      return request(app.getHttpServer())
        .get(
          `/api/v2/slots/available?usernames=${userOne.username},${userTwo.username}&start=2050-09-05&end=2050-09-09&duration=60`
        )
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200)
        .then(async (response) => {
          const responseBody: GetSlotsOutput_2024_09_04 = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);
          const slots = responseBody.data;

          expect(slots).toBeDefined();
          const days = Object.keys(slots);
          expect(days.length).toEqual(5);
          expect(slots).toEqual(expectedSlotsUTC);
        });
    });

    it("should get slots in specified timezone and in specified duration by usernames", async () => {
      return request(app.getHttpServer())
        .get(
          `/api/v2/slots/available?usernames=${userOne.username},${userTwo.username}&start=2050-09-05&end=2050-09-09&duration=60&timeZone=Europe/Rome`
        )
        .set(CAL_API_VERSION_HEADER, VERSION_2024_09_04)
        .expect(200)
        .then(async (response) => {
          const responseBody: GetSlotsOutput_2024_09_04 = response.body;
          expect(responseBody.status).toEqual(SUCCESS_STATUS);
          const slots = responseBody.data;

          expect(slots).toBeDefined();
          const days = Object.keys(slots);
          expect(days.length).toEqual(5);
          expect(slots).toEqual(expectedSlotsRome);
        });
    });

    afterAll(async () => {
      await userRepositoryFixture.deleteByEmail(userOne.email);
      await userRepositoryFixture.deleteByEmail(userTwo.email);
      await app.close();
    });
  });
});
