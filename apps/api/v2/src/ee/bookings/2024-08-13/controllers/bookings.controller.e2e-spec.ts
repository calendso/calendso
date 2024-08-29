import { bootstrap } from "@/app";
import { AppModule } from "@/app.module";
import { CreateBookingOutput_2024_08_13 } from "@/ee/bookings/2024-08-13/outputs/create-booking.output";
import { GetBookingOutput_2024_08_13 } from "@/ee/bookings/2024-08-13/outputs/get-booking.output";
import { GetBookingsOutput_2024_08_13 } from "@/ee/bookings/2024-08-13/outputs/get-bookings.output";
import { MarkAbsentBookingOutput_2024_08_13 } from "@/ee/bookings/2024-08-13/outputs/mark-absent.output";
import { RescheduleBookingOutput_2024_08_13 } from "@/ee/bookings/2024-08-13/outputs/reschedule-booking.output";
import { CreateScheduleInput_2024_04_15 } from "@/ee/schedules/schedules_2024_04_15/inputs/create-schedule.input";
import { SchedulesModule_2024_04_15 } from "@/ee/schedules/schedules_2024_04_15/schedules.module";
import { SchedulesService_2024_04_15 } from "@/ee/schedules/schedules_2024_04_15/services/schedules.service";
import { PermissionsGuard } from "@/modules/auth/guards/permissions/permissions.guard";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { UsersModule } from "@/modules/users/users.module";
import { INestApplication } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { User } from "@prisma/client";
import * as request from "supertest";
import { BookingsRepositoryFixture } from "test/fixtures/repository/bookings.repository.fixture";
import { EventTypesRepositoryFixture } from "test/fixtures/repository/event-types.repository.fixture";
import { HostsRepositoryFixture } from "test/fixtures/repository/hosts.repository.fixture";
import { MembershipRepositoryFixture } from "test/fixtures/repository/membership.repository.fixture";
import { OAuthClientRepositoryFixture } from "test/fixtures/repository/oauth-client.repository.fixture";
import { OrganizationRepositoryFixture } from "test/fixtures/repository/organization.repository.fixture";
import { ProfileRepositoryFixture } from "test/fixtures/repository/profiles.repository.fixture";
import { TeamRepositoryFixture } from "test/fixtures/repository/team.repository.fixture";
import { UserRepositoryFixture } from "test/fixtures/repository/users.repository.fixture";
import { withApiAuth } from "test/utils/withApiAuth";

import {
  CAL_API_VERSION_HEADER,
  SUCCESS_STATUS,
  VERSION_2024_08_13,
  X_CAL_CLIENT_ID,
} from "@calcom/platform-constants";
import {
  CreateBookingInput_2024_08_13,
  BookingOutput_2024_08_13,
  CreateRecurringBookingInput_2024_08_13,
  RecurringBookingOutput_2024_08_13,
  RescheduleBookingInput_2024_08_13,
  MarkAbsentBookingInput_2024_08_13,
} from "@calcom/platform-types";
import { CancelBookingInput_2024_08_13 } from "@calcom/platform-types";
import { Booking, PlatformOAuthClient, Team } from "@calcom/prisma/client";

describe("Bookings Endpoints 2024-08-13", () => {
  describe("User bookings", () => {
    let app: INestApplication;
    let organization: Team;

    let userRepositoryFixture: UserRepositoryFixture;
    let bookingsRepositoryFixture: BookingsRepositoryFixture;
    let schedulesService: SchedulesService_2024_04_15;
    let eventTypesRepositoryFixture: EventTypesRepositoryFixture;
    let oauthClientRepositoryFixture: OAuthClientRepositoryFixture;
    let oAuthClient: PlatformOAuthClient;
    let teamRepositoryFixture: TeamRepositoryFixture;

    const userEmail = "bookings-controller-e2e@api.com";
    let user: User;

    let eventTypeId: number;
    let recurringEventTypeId: number;

    let createdBooking: BookingOutput_2024_08_13;
    let rescheduledBooking: BookingOutput_2024_08_13;
    let createdRecurringBooking: RecurringBookingOutput_2024_08_13[];

    let bookingInThePast: Booking;

    beforeAll(async () => {
      const moduleRef = await withApiAuth(
        userEmail,
        Test.createTestingModule({
          imports: [AppModule, PrismaModule, UsersModule, SchedulesModule_2024_04_15],
        })
      )
        .overrideGuard(PermissionsGuard)
        .useValue({
          canActivate: () => true,
        })
        .compile();

      userRepositoryFixture = new UserRepositoryFixture(moduleRef);
      bookingsRepositoryFixture = new BookingsRepositoryFixture(moduleRef);
      eventTypesRepositoryFixture = new EventTypesRepositoryFixture(moduleRef);
      oauthClientRepositoryFixture = new OAuthClientRepositoryFixture(moduleRef);
      teamRepositoryFixture = new TeamRepositoryFixture(moduleRef);
      schedulesService = moduleRef.get<SchedulesService_2024_04_15>(SchedulesService_2024_04_15);

      organization = await teamRepositoryFixture.create({ name: "organization bookings" });
      oAuthClient = await createOAuthClient(organization.id);

      user = await userRepositoryFixture.create({
        email: userEmail,
      });

      const userSchedule: CreateScheduleInput_2024_04_15 = {
        name: "working time",
        timeZone: "Europe/Rome",
        isDefault: true,
      };
      await schedulesService.createUserSchedule(user.id, userSchedule);
      const event = await eventTypesRepositoryFixture.create(
        { title: "peer coding", slug: "peer-coding", length: 60 },
        user.id
      );
      eventTypeId = event.id;

      const recurringEvent = await eventTypesRepositoryFixture.create(
        // note(Lauris): freq 2 means weekly, interval 1 means every week and count 3 means 3 weeks in a row
        {
          title: "peer coding recurring",
          slug: "peer-coding-recurring",
          length: 60,
          recurringEvent: { freq: 2, count: 3, interval: 1 },
        },
        user.id
      );
      recurringEventTypeId = recurringEvent.id;

      bookingInThePast = await bookingsRepositoryFixture.create({
        user: {
          connect: {
            id: user.id,
          },
        },
        startTime: new Date(Date.UTC(2020, 0, 8, 13, 0, 0)),
        endTime: new Date(Date.UTC(2020, 0, 8, 14, 0, 0)),
        title: "peer coding lets goo",
        uid: "booking-in-the-past",
        eventType: {
          connect: {
            id: eventTypeId,
          },
        },
        location: "integrations:daily",
        customInputs: {},
        metadata: {},
        responses: {
          name: "Oldie",
          email: "oldie@gmail.com",
        },
        attendees: {
          create: {
            email: "oldie@gmail.com",
            name: "Oldie",
            locale: "lv",
            timeZone: "Europe/Rome",
          },
        },
      });

      app = moduleRef.createNestApplication();
      bootstrap(app as NestExpressApplication);

      await app.init();
    });

    async function createOAuthClient(organizationId: number) {
      const data = {
        logo: "logo-url",
        name: "name",
        redirectUris: ["http://localhost:5555"],
        permissions: 32,
      };
      const secret = "secret";

      const client = await oauthClientRepositoryFixture.create(organizationId, data, secret);
      return client;
    }

    it("should be defined", () => {
      expect(userRepositoryFixture).toBeDefined();
      expect(user).toBeDefined();
    });

    describe("create bookings", () => {
      it("should create a booking", async () => {
        const body: CreateBookingInput_2024_08_13 = {
          start: new Date(Date.UTC(2030, 0, 8, 13, 0, 0)).toISOString(),
          eventTypeId,
          attendee: {
            name: "Mr Proper",
            email: "mr_proper@gmail.com",
            timeZone: "Europe/Rome",
            language: "it",
          },
          meetingUrl: "https://meet.google.com/abc-def-ghi",
        };

        return request(app.getHttpServer())
          .post("/v2/bookings")
          .send(body)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(201)
          .then(async (response) => {
            const responseBody: CreateBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            expect(responseDataIsBooking(responseBody.data)).toBe(true);

            if (responseDataIsBooking(responseBody.data)) {
              const data: BookingOutput_2024_08_13 = responseBody.data;
              expect(data.id).toBeDefined();
              expect(data.uid).toBeDefined();
              expect(data.hostId).toEqual(user.id);
              expect(data.status).toEqual("accepted");
              expect(data.start).toEqual(body.start);
              expect(data.end).toEqual(new Date(Date.UTC(2030, 0, 8, 14, 0, 0)).toISOString());
              expect(data.duration).toEqual(60);
              expect(data.eventTypeId).toEqual(eventTypeId);
              expect(data.attendee).toEqual({ ...body.attendee, absent: false });
              expect(data.meetingUrl).toEqual(body.meetingUrl);
              expect(data.absentHost).toEqual(false);
              createdBooking = data;
            } else {
              throw new Error(
                "Invalid response data - expected booking but received array of possibily recurring bookings"
              );
            }
          });
      });

      it("should create a recurring booking", async () => {
        const body: CreateRecurringBookingInput_2024_08_13 = {
          start: new Date(Date.UTC(2030, 1, 4, 13, 0, 0)).toISOString(),
          eventTypeId: recurringEventTypeId,
          attendee: {
            name: "Mr Proper Recurring",
            email: "mr_proper_recurring@gmail.com",
            timeZone: "Europe/Rome",
            language: "it",
          },
          meetingUrl: "https://meet.google.com/abc-def-ghi",
        };

        return request(app.getHttpServer())
          .post("/v2/bookings")
          .send(body)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(201)
          .then(async (response) => {
            const responseBody: CreateBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            expect(responseDataIsRecurringBooking(responseBody.data)).toBe(true);

            if (responseDataIsRecurringBooking(responseBody.data)) {
              const data: RecurringBookingOutput_2024_08_13[] = responseBody.data;
              expect(data.length).toEqual(3);

              const firstBooking = data[0];
              expect(firstBooking.id).toBeDefined();
              expect(firstBooking.uid).toBeDefined();
              expect(firstBooking.hostId).toEqual(user.id);
              expect(firstBooking.status).toEqual("accepted");
              expect(firstBooking.start).toEqual(new Date(Date.UTC(2030, 1, 4, 13, 0, 0)).toISOString());
              expect(firstBooking.end).toEqual(new Date(Date.UTC(2030, 1, 4, 14, 0, 0)).toISOString());
              expect(firstBooking.duration).toEqual(60);
              expect(firstBooking.eventTypeId).toEqual(recurringEventTypeId);
              expect(firstBooking.attendee).toEqual({ ...body.attendee, absent: false });
              expect(firstBooking.meetingUrl).toEqual(body.meetingUrl);
              expect(firstBooking.recurringBookingUid).toBeDefined();
              expect(firstBooking.absentHost).toEqual(false);

              const secondBooking = data[1];
              expect(secondBooking.id).toBeDefined();
              expect(secondBooking.uid).toBeDefined();
              expect(secondBooking.hostId).toEqual(user.id);
              expect(secondBooking.status).toEqual("accepted");
              expect(secondBooking.start).toEqual(new Date(Date.UTC(2030, 1, 11, 13, 0, 0)).toISOString());
              expect(secondBooking.end).toEqual(new Date(Date.UTC(2030, 1, 11, 14, 0, 0)).toISOString());
              expect(secondBooking.duration).toEqual(60);
              expect(secondBooking.eventTypeId).toEqual(recurringEventTypeId);
              expect(secondBooking.recurringBookingUid).toBeDefined();
              expect(secondBooking.attendee).toEqual({ ...body.attendee, absent: false });
              expect(secondBooking.meetingUrl).toEqual(body.meetingUrl);
              expect(secondBooking.absentHost).toEqual(false);

              const thirdBooking = data[2];
              expect(thirdBooking.id).toBeDefined();
              expect(thirdBooking.uid).toBeDefined();
              expect(thirdBooking.hostId).toEqual(user.id);
              expect(thirdBooking.status).toEqual("accepted");
              expect(thirdBooking.start).toEqual(new Date(Date.UTC(2030, 1, 18, 13, 0, 0)).toISOString());
              expect(thirdBooking.end).toEqual(new Date(Date.UTC(2030, 1, 18, 14, 0, 0)).toISOString());
              expect(thirdBooking.duration).toEqual(60);
              expect(thirdBooking.eventTypeId).toEqual(recurringEventTypeId);
              expect(thirdBooking.recurringBookingUid).toBeDefined();
              expect(thirdBooking.attendee).toEqual({ ...body.attendee, absent: false });
              expect(thirdBooking.meetingUrl).toEqual(body.meetingUrl);
              expect(thirdBooking.absentHost).toEqual(false);

              createdRecurringBooking = data;
            } else {
              throw new Error(
                "Invalid response data - expected recurring booking but received non array response"
              );
            }
          });
      });
    });

    describe("get individual booking", () => {
      it("should should get a booking", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings/${createdBooking.uid}`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            expect(responseDataIsBooking(responseBody.data)).toBe(true);

            if (responseDataIsBooking(responseBody.data)) {
              const data: BookingOutput_2024_08_13 = responseBody.data;
              expect(data.id).toEqual(createdBooking.id);
              expect(data.uid).toEqual(createdBooking.uid);
              expect(data.hostId).toEqual(user.id);
              expect(data.status).toEqual(createdBooking.status);
              expect(data.start).toEqual(createdBooking.start);
              expect(data.end).toEqual(createdBooking.end);
              expect(data.duration).toEqual(createdBooking.duration);
              expect(data.eventTypeId).toEqual(createdBooking.eventTypeId);
              expect(data.attendee).toEqual(createdBooking.attendee);
              expect(data.meetingUrl).toEqual(createdBooking.meetingUrl);
              expect(data.absentHost).toEqual(createdBooking.absentHost);
            } else {
              throw new Error(
                "Invalid response data - expected booking but received array of possibily recurring bookings"
              );
            }
          });
      });

      it("should should get 1 recurrence of a recurring booking", async () => {
        const recurrenceUid = createdRecurringBooking[0].uid;
        return request(app.getHttpServer())
          .get(`/v2/bookings/${recurrenceUid}`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            expect(responseDataIsRecurranceBooking(responseBody.data)).toBe(true);

            if (responseDataIsRecurranceBooking(responseBody.data)) {
              const data: RecurringBookingOutput_2024_08_13 = responseBody.data;
              expect(data.id).toEqual(createdRecurringBooking[0].id);
              expect(data.uid).toEqual(createdRecurringBooking[0].uid);
              expect(data.hostId).toEqual(user.id);
              expect(data.status).toEqual(createdRecurringBooking[0].status);
              expect(data.start).toEqual(createdRecurringBooking[0].start);
              expect(data.end).toEqual(createdRecurringBooking[0].end);
              expect(data.duration).toEqual(createdRecurringBooking[0].duration);
              expect(data.eventTypeId).toEqual(createdRecurringBooking[0].eventTypeId);
              expect(data.recurringBookingUid).toEqual(createdRecurringBooking[0].recurringBookingUid);
              expect(data.attendee).toEqual(createdRecurringBooking[0].attendee);
              expect(data.meetingUrl).toEqual(createdRecurringBooking[0].meetingUrl);
              expect(data.absentHost).toEqual(createdRecurringBooking[0].absentHost);
            } else {
              throw new Error(
                "Invalid response data - expected booking but received array of possibily recurring bookings"
              );
            }
          });
      });

      it("should should get all recurrences of the recurring bookings", async () => {
        const recurringBookingUid = createdRecurringBooking[0].recurringBookingUid;
        return request(app.getHttpServer())
          .get(`/v2/bookings/${recurringBookingUid}`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: CreateBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            expect(responseDataIsRecurringBooking(responseBody.data)).toBe(true);

            if (responseDataIsRecurringBooking(responseBody.data)) {
              const data: RecurringBookingOutput_2024_08_13[] = responseBody.data;
              expect(data.length).toEqual(3);

              const firstBooking = data[0];
              expect(firstBooking.id).toEqual(createdRecurringBooking[0].id);
              expect(firstBooking.uid).toEqual(createdRecurringBooking[0].uid);
              expect(firstBooking.hostId).toEqual(user.id);
              expect(firstBooking.status).toEqual(createdRecurringBooking[0].status);
              expect(firstBooking.start).toEqual(createdRecurringBooking[0].start);
              expect(firstBooking.end).toEqual(createdRecurringBooking[0].end);
              expect(firstBooking.duration).toEqual(createdRecurringBooking[0].duration);
              expect(firstBooking.eventTypeId).toEqual(createdRecurringBooking[0].eventTypeId);
              expect(firstBooking.recurringBookingUid).toEqual(recurringBookingUid);
              expect(firstBooking.attendee).toEqual(createdRecurringBooking[0].attendee);
              expect(firstBooking.meetingUrl).toEqual(createdRecurringBooking[0].meetingUrl);
              expect(firstBooking.absentHost).toEqual(createdRecurringBooking[0].absentHost);

              const secondBooking = data[1];
              expect(secondBooking.id).toEqual(createdRecurringBooking[1].id);
              expect(secondBooking.uid).toEqual(createdRecurringBooking[1].uid);
              expect(secondBooking.hostId).toEqual(user.id);
              expect(secondBooking.status).toEqual(createdRecurringBooking[1].status);
              expect(secondBooking.start).toEqual(createdRecurringBooking[1].start);
              expect(secondBooking.end).toEqual(createdRecurringBooking[1].end);
              expect(secondBooking.duration).toEqual(createdRecurringBooking[1].duration);
              expect(secondBooking.eventTypeId).toEqual(createdRecurringBooking[1].eventTypeId);
              expect(secondBooking.recurringBookingUid).toEqual(recurringBookingUid);
              expect(secondBooking.attendee).toEqual(createdRecurringBooking[1].attendee);
              expect(secondBooking.meetingUrl).toEqual(createdRecurringBooking[1].meetingUrl);
              expect(secondBooking.absentHost).toEqual(createdRecurringBooking[1].absentHost);

              const thirdBooking = data[2];
              expect(thirdBooking.id).toEqual(createdRecurringBooking[2].id);
              expect(thirdBooking.uid).toEqual(createdRecurringBooking[2].uid);
              expect(thirdBooking.hostId).toEqual(user.id);
              expect(thirdBooking.status).toEqual(createdRecurringBooking[2].status);
              expect(thirdBooking.start).toEqual(createdRecurringBooking[2].start);
              expect(thirdBooking.end).toEqual(createdRecurringBooking[2].end);
              expect(thirdBooking.duration).toEqual(createdRecurringBooking[2].duration);
              expect(thirdBooking.eventTypeId).toEqual(createdRecurringBooking[2].eventTypeId);
              expect(thirdBooking.recurringBookingUid).toEqual(recurringBookingUid);
              expect(thirdBooking.attendee).toEqual(createdRecurringBooking[2].attendee);
              expect(thirdBooking.meetingUrl).toEqual(createdRecurringBooking[2].meetingUrl);
              expect(thirdBooking.absentHost).toEqual(createdRecurringBooking[2].absentHost);

              createdRecurringBooking = data;
            } else {
              throw new Error(
                "Invalid response data - expected recurring booking but received non array response"
              );
            }
          });
      });
    });

    describe("get bookings", () => {
      it("should should get all bookings", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(5);
          });
      });

      it("should should take bookings", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?take=3`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(3);
          });
      });

      it("should should skip bookings", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?skip=2`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(3);
          });
      });

      it("should should get upcoming bookings", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?status=upcoming`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(4);
          });
      });

      it("should should get past bookings", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?status=past`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(1);
          });
      });

      it("should should get upcoming and past bookings", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?status=upcoming,past`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(5);
          });
      });

      it("should should get recurring booking recurrences", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?status=recurring`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(3);
          });
      });

      it("should should get bookings by attendee email", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?attendeeEmail=mr_proper@gmail.com`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(1);
          });
      });

      it("should should get bookings by attendee name", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?attendeeName=Mr Proper Recurring`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(3);
          });
      });

      it("should should get bookings by eventTypeId", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?eventTypeId=${eventTypeId}`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(2);
          });
      });

      it("should should get bookings by eventTypeIds", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?eventTypeIds[]=${eventTypeId}&eventTypeIds[]=${recurringEventTypeId}`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(5);
          });
      });

      it("should should get bookings by after specified start time", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?afterStart=${createdRecurringBooking[1].start}`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(2);
          });
      });

      it("should should get bookings by before specified end time", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?afterStart=${createdRecurringBooking[0].start}`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(3);
          });
      });

      it("should should sort bookings by start in descending order", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?eventTypeId=${eventTypeId}&sortStart=desc`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(2);
            expect(data[0].start).toEqual(createdBooking.start);
            expect(data[1].start).toEqual(bookingInThePast.startTime.toISOString());
          });
      });

      it("should should sort bookings by start in ascending order", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?eventTypeId=${eventTypeId}&sortStart=asc`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(2);
            expect(data[0].start).toEqual(bookingInThePast.startTime.toISOString());
            expect(data[1].start).toEqual(createdBooking.start);
          });
      });

      it("should should sort bookings by end in descending order", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?eventTypeId=${eventTypeId}&sortEnd=desc`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(2);
            expect(data[0].start).toEqual(createdBooking.start);
            expect(data[1].start).toEqual(bookingInThePast.startTime.toISOString());
          });
      });

      it("should should sort bookings by end in ascending order", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?eventTypeId=${eventTypeId}&sortEnd=asc`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(2);
            expect(data[0].start).toEqual(bookingInThePast.startTime.toISOString());
            expect(data[1].start).toEqual(createdBooking.start);
          });
      });

      it("should should sort bookings by created in descending order", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?eventTypeId=${eventTypeId}&sortCreated=desc`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(2);
            expect(data[0].start).toEqual(createdBooking.start);
            expect(data[1].start).toEqual(bookingInThePast.startTime.toISOString());
          });
      });

      it("should should sort bookings by created in ascending order", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?eventTypeId=${eventTypeId}&sortCreated=asc`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(2);
            expect(data[0].start).toEqual(bookingInThePast.startTime.toISOString());
            expect(data[1].start).toEqual(createdBooking.start);
          });
      });
    });

    describe("reschedule bookings", () => {
      it("should should reschedule normal booking", async () => {
        const body: RescheduleBookingInput_2024_08_13 = {
          start: new Date(Date.UTC(2035, 0, 8, 14, 0, 0)).toISOString(),
          reschedulingReason: "Flying to mars that day",
        };

        return request(app.getHttpServer())
          .post(`/v2/bookings/${createdBooking.uid}/reschedule`)
          .send(body)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(201)
          .then(async (response) => {
            const responseBody: RescheduleBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: BookingOutput_2024_08_13 = responseBody.data;
            expect(data.reschedulingReason).toEqual(body.reschedulingReason);
            expect(data.start).toEqual(body.start);
            expect(data.end).toEqual(new Date(Date.UTC(2035, 0, 8, 15, 0, 0)).toISOString());
            expect(data.rescheduledFromUid).toEqual(createdBooking.uid);
            expect(data.id).toBeDefined();
            expect(data.uid).toBeDefined();
            expect(data.hostId).toEqual(user.id);
            expect(data.status).toEqual(createdBooking.status);
            expect(data.duration).toEqual(createdBooking.duration);
            expect(data.eventTypeId).toEqual(createdBooking.eventTypeId);
            expect(data.attendee).toEqual(createdBooking.attendee);
            expect(data.meetingUrl).toEqual(createdBooking.meetingUrl);
            expect(data.absentHost).toEqual(createdBooking.absentHost);

            rescheduledBooking = data;
          });
      });

      it("should point rescheduled booking to the new one", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings/${createdBooking.uid}`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: RescheduleBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: BookingOutput_2024_08_13 = responseBody.data;
            expect(data.rescheduledToUid).toEqual(rescheduledBooking.uid);
            expect(data.status).toEqual("rescheduled");

            createdBooking = data;
          });
      });

      it("should reschedule recurrence of a recurring booking", async () => {
        const body: RescheduleBookingInput_2024_08_13 = {
          start: new Date(Date.UTC(2035, 0, 9, 14, 0, 0)).toISOString(),
          reschedulingReason: "Flying to mars again",
        };

        return request(app.getHttpServer())
          .post(`/v2/bookings/${createdRecurringBooking[0].uid}/reschedule`)
          .send(body)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(201)
          .then(async (response) => {
            const responseBody: RescheduleBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const data: RecurringBookingOutput_2024_08_13 = responseBody.data;
            expect(data.id).toBeDefined();
            expect(data.uid).toBeDefined();
            expect(data.hostId).toEqual(user.id);
            expect(data.status).toEqual(createdRecurringBooking[0].status);
            expect(data.start).toEqual(body.start);
            expect(data.end).toEqual(new Date(Date.UTC(2035, 0, 9, 15, 0, 0)).toISOString());
            expect(data.duration).toEqual(createdRecurringBooking[0].duration);
            expect(data.recurringBookingUid).toEqual(createdRecurringBooking[0].recurringBookingUid);
            expect(data.eventTypeId).toEqual(createdRecurringBooking[0].eventTypeId);
            expect(data.attendee).toEqual(createdRecurringBooking[0].attendee);
            expect(data.meetingUrl).toEqual(createdRecurringBooking[0].meetingUrl);
            expect(data.absentHost).toEqual(createdRecurringBooking[0].absentHost);

            const oldBooking = await bookingsRepositoryFixture.getByUid(createdRecurringBooking[0].uid);
            expect(oldBooking).toBeDefined();
            expect(oldBooking?.status).toEqual("CANCELLED");
          });
      });

      it("should get recurring booking recurrences after rescheduling one", async () => {
        const recurringBookingUid = createdRecurringBooking[0].recurringBookingUid;
        return request(app.getHttpServer())
          .get(`/v2/bookings/${recurringBookingUid}`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: CreateBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            expect(responseDataIsRecurringBooking(responseBody.data)).toBe(true);

            if (responseDataIsRecurringBooking(responseBody.data)) {
              const data: RecurringBookingOutput_2024_08_13[] = responseBody.data;
              expect(data.length).toEqual(4);
              const cancelled = data.find((booking) => booking.status === "cancelled");
              expect(cancelled).toBeDefined();
              const rescheduledNew = data.find(
                (booking) => booking.start === new Date(Date.UTC(2035, 0, 9, 14, 0, 0)).toISOString()
              );
              expect(rescheduledNew).toBeDefined();
              createdRecurringBooking = data;
            } else {
              throw new Error(
                "Invalid response data - expected recurring booking but received non array response"
              );
            }
          });
      });
    });

    describe("mark absent", () => {
      it("should mark host absent", async () => {
        const body: MarkAbsentBookingInput_2024_08_13 = {
          host: true,
        };

        return request(app.getHttpServer())
          .post(`/v2/bookings/${createdRecurringBooking[1].uid}/mark-absent`)
          .send(body)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: MarkAbsentBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const data: RecurringBookingOutput_2024_08_13 = responseBody.data;
            const booking = createdRecurringBooking[1];
            expect(data.absentHost).toEqual(true);

            expect(data.id).toEqual(booking.id);
            expect(data.uid).toEqual(booking.uid);
            expect(data.hostId).toEqual(user.id);
            expect(data.status).toEqual(booking.status);
            expect(data.start).toEqual(booking.start);
            expect(data.end).toEqual(booking.end);
            expect(data.duration).toEqual(booking.duration);
            expect(data.eventTypeId).toEqual(booking.eventTypeId);
            expect(data.attendee).toEqual(booking.attendee);
            expect(data.meetingUrl).toEqual(booking.meetingUrl);
          });
      });

      it("should mark attendee absent", async () => {
        const body: MarkAbsentBookingInput_2024_08_13 = {
          attendees: ["mr_proper_recurring@gmail.com"],
        };

        return request(app.getHttpServer())
          .post(`/v2/bookings/${createdRecurringBooking[2].uid}/mark-absent`)
          .send(body)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: MarkAbsentBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const data: RecurringBookingOutput_2024_08_13 = responseBody.data;
            const booking = createdRecurringBooking[2];

            expect(data.id).toEqual(booking.id);
            expect(data.uid).toEqual(booking.uid);
            expect(data.hostId).toEqual(user.id);
            expect(data.status).toEqual(booking.status);
            expect(data.start).toEqual(booking.start);
            expect(data.end).toEqual(booking.end);
            expect(data.duration).toEqual(booking.duration);
            expect(data.eventTypeId).toEqual(booking.eventTypeId);
            expect(data.attendee.absent).toEqual(true);
            expect(data.absentHost).toEqual(booking.absentHost);
            expect(data.meetingUrl).toEqual(booking.meetingUrl);
          });
      });
    });
    describe("cancel bookings", () => {
      it("should cancel booking", async () => {
        const body: CancelBookingInput_2024_08_13 = {
          cancellationReason: "Going on a vacation",
        };

        const booking = await bookingsRepositoryFixture.getByUid(rescheduledBooking.uid);
        expect(booking).toBeDefined();
        expect(booking?.status).toEqual("ACCEPTED");

        return request(app.getHttpServer())
          .post(`/v2/bookings/${rescheduledBooking.uid}/cancel`)
          .send(body)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .set(X_CAL_CLIENT_ID, oAuthClient.id)
          .expect(200)
          .then(async (response) => {
            const responseBody: RescheduleBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const data: RecurringBookingOutput_2024_08_13 = responseBody.data;
            expect(data.id).toBeDefined();
            expect(data.uid).toBeDefined();
            expect(data.hostId).toEqual(user.id);
            expect(data.status).toEqual("cancelled");
            expect(data.cancellationReason).toEqual(body.cancellationReason);
            expect(data.start).toEqual(rescheduledBooking.start);
            expect(data.end).toEqual(rescheduledBooking.end);
            expect(data.duration).toEqual(rescheduledBooking.duration);
            expect(data.eventTypeId).toEqual(rescheduledBooking.eventTypeId);
            expect(data.attendee).toEqual(rescheduledBooking.attendee);
            expect(data.meetingUrl).toEqual(rescheduledBooking.meetingUrl);
            expect(data.absentHost).toEqual(rescheduledBooking.absentHost);

            const cancelledBooking = await bookingsRepositoryFixture.getByUid(rescheduledBooking.uid);
            expect(cancelledBooking).toBeDefined();
            expect(cancelledBooking?.status).toEqual("CANCELLED");
          });
      });
    });

    function responseDataIsBooking(data: any): data is BookingOutput_2024_08_13 {
      return !Array.isArray(data) && typeof data === "object" && data && "id" in data;
    }

    function responseDataIsRecurranceBooking(data: any): data is RecurringBookingOutput_2024_08_13 {
      return (
        !Array.isArray(data) &&
        typeof data === "object" &&
        data &&
        "id" in data &&
        "recurringBookingUid" in data
      );
    }

    function responseDataIsRecurringBooking(data: any): data is RecurringBookingOutput_2024_08_13[] {
      return Array.isArray(data);
    }

    afterAll(async () => {
      await oauthClientRepositoryFixture.delete(oAuthClient.id);
      await teamRepositoryFixture.delete(organization.id);
      await userRepositoryFixture.deleteByEmail(user.email);
      await bookingsRepositoryFixture.deleteAllBookings(user.id, user.email);
      await app.close();
    });
  });

  describe("Team bookings", () => {
    let app: INestApplication;
    let organization: Team;
    let team1: Team;
    let team2: Team;

    let userRepositoryFixture: UserRepositoryFixture;
    let bookingsRepositoryFixture: BookingsRepositoryFixture;
    let schedulesService: SchedulesService_2024_04_15;
    let eventTypesRepositoryFixture: EventTypesRepositoryFixture;
    let oauthClientRepositoryFixture: OAuthClientRepositoryFixture;
    let oAuthClient: PlatformOAuthClient;
    let teamRepositoryFixture: TeamRepositoryFixture;
    let membershipsRepositoryFixture: MembershipRepositoryFixture;
    let hostsRepositoryFixture: HostsRepositoryFixture;
    let organizationsRepositoryFixture: OrganizationRepositoryFixture;
    let profileRepositoryFixture: ProfileRepositoryFixture;

    const teamUserEmail = "orgUser1team1@api.com";
    let teamUser: User;

    let team1EventTypeId: number;
    let team2EventTypeId: number;

    beforeAll(async () => {
      const moduleRef = await withApiAuth(
        teamUserEmail,
        Test.createTestingModule({
          imports: [AppModule, PrismaModule, UsersModule, SchedulesModule_2024_04_15],
        })
      )
        .overrideGuard(PermissionsGuard)
        .useValue({
          canActivate: () => true,
        })
        .compile();

      userRepositoryFixture = new UserRepositoryFixture(moduleRef);
      bookingsRepositoryFixture = new BookingsRepositoryFixture(moduleRef);
      eventTypesRepositoryFixture = new EventTypesRepositoryFixture(moduleRef);
      oauthClientRepositoryFixture = new OAuthClientRepositoryFixture(moduleRef);
      teamRepositoryFixture = new TeamRepositoryFixture(moduleRef);
      organizationsRepositoryFixture = new OrganizationRepositoryFixture(moduleRef);
      profileRepositoryFixture = new ProfileRepositoryFixture(moduleRef);
      membershipsRepositoryFixture = new MembershipRepositoryFixture(moduleRef);
      hostsRepositoryFixture = new HostsRepositoryFixture(moduleRef);
      schedulesService = moduleRef.get<SchedulesService_2024_04_15>(SchedulesService_2024_04_15);

      organization = await organizationsRepositoryFixture.create({ name: "organization team bookings" });
      team1 = await teamRepositoryFixture.create({
        name: "team 1",
        isOrganization: false,
        parent: { connect: { id: organization.id } },
      });

      team2 = await teamRepositoryFixture.create({
        name: "team 2",
        isOrganization: false,
        parent: { connect: { id: organization.id } },
      });

      oAuthClient = await createOAuthClient(organization.id);

      teamUser = await userRepositoryFixture.create({
        email: teamUserEmail,
      });

      const userSchedule: CreateScheduleInput_2024_04_15 = {
        name: "working time",
        timeZone: "Europe/Rome",
        isDefault: true,
      };
      await schedulesService.createUserSchedule(teamUser.id, userSchedule);

      await profileRepositoryFixture.create({
        uid: `usr-${teamUser.id}`,
        username: teamUserEmail,
        organization: {
          connect: {
            id: organization.id,
          },
        },
        user: {
          connect: {
            id: teamUser.id,
          },
        },
      });

      await membershipsRepositoryFixture.create({
        role: "MEMBER",
        user: { connect: { id: teamUser.id } },
        team: { connect: { id: team1.id } },
        accepted: true,
      });

      await membershipsRepositoryFixture.create({
        role: "MEMBER",
        user: { connect: { id: teamUser.id } },
        team: { connect: { id: team2.id } },
        accepted: true,
      });

      const team1EventType = await eventTypesRepositoryFixture.createTeamEventType({
        schedulingType: "COLLECTIVE",
        team: {
          connect: { id: team1.id },
        },
        title: "Collective Event Type",
        slug: "collective-event-type",
        length: 60,
        assignAllTeamMembers: true,
        bookingFields: [],
        locations: [],
      });

      team1EventTypeId = team1EventType.id;

      const team2EventType = await eventTypesRepositoryFixture.createTeamEventType({
        schedulingType: "COLLECTIVE",
        team: {
          connect: { id: team2.id },
        },
        title: "Collective Event Type 2",
        slug: "collective-event-type-2",
        length: 60,
        assignAllTeamMembers: true,
        bookingFields: [],
        locations: [],
      });

      team2EventTypeId = team2EventType.id;

      await hostsRepositoryFixture.create({
        isFixed: true,
        user: {
          connect: {
            id: teamUser.id,
          },
        },
        eventType: {
          connect: {
            id: team1EventType.id,
          },
        },
      });

      await hostsRepositoryFixture.create({
        isFixed: true,
        user: {
          connect: {
            id: teamUser.id,
          },
        },
        eventType: {
          connect: {
            id: team2EventType.id,
          },
        },
      });

      app = moduleRef.createNestApplication();
      bootstrap(app as NestExpressApplication);

      await app.init();
    });

    describe("create team bookings", () => {
      it("should create a team 1 booking", async () => {
        const body: CreateBookingInput_2024_08_13 = {
          start: new Date(Date.UTC(2030, 0, 8, 13, 0, 0)).toISOString(),
          eventTypeId: team1EventTypeId,
          attendee: {
            name: "alice",
            email: "alice@gmail.com",
            timeZone: "Europe/Madrid",
            language: "es",
          },
          meetingUrl: "https://meet.google.com/abc-def-ghi",
        };

        return request(app.getHttpServer())
          .post("/v2/bookings")
          .send(body)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(201)
          .then(async (response) => {
            const responseBody: CreateBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            expect(responseDataIsBooking(responseBody.data)).toBe(true);

            if (responseDataIsBooking(responseBody.data)) {
              const data: BookingOutput_2024_08_13 = responseBody.data;
              expect(data.id).toBeDefined();
              expect(data.uid).toBeDefined();
              expect(data.hostId).toBeDefined();
              expect(data.status).toEqual("accepted");
              expect(data.start).toEqual(body.start);
              expect(data.end).toEqual(new Date(Date.UTC(2030, 0, 8, 14, 0, 0)).toISOString());
              expect(data.duration).toEqual(60);
              expect(data.eventTypeId).toEqual(team1EventTypeId);
              expect(data.attendee).toEqual({ ...body.attendee, absent: false });
              expect(data.meetingUrl).toEqual(body.meetingUrl);
              expect(data.absentHost).toEqual(false);
            } else {
              throw new Error(
                "Invalid response data - expected booking but received array of possibily recurring bookings"
              );
            }
          });
      });

      it("should create a team 2 booking", async () => {
        const body: CreateBookingInput_2024_08_13 = {
          start: new Date(Date.UTC(2030, 0, 8, 10, 0, 0)).toISOString(),
          eventTypeId: team2EventTypeId,
          attendee: {
            name: "bob",
            email: "bob@gmail.com",
            timeZone: "Europe/Rome",
            language: "it",
          },
          meetingUrl: "https://meet.google.com/abc-def-ghi",
        };

        return request(app.getHttpServer())
          .post("/v2/bookings")
          .send(body)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(201)
          .then(async (response) => {
            const responseBody: CreateBookingOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            expect(responseDataIsBooking(responseBody.data)).toBe(true);

            if (responseDataIsBooking(responseBody.data)) {
              const data: BookingOutput_2024_08_13 = responseBody.data;
              expect(data.id).toBeDefined();
              expect(data.uid).toBeDefined();
              expect(data.hostId).toBeDefined();
              expect(data.status).toEqual("accepted");
              expect(data.start).toEqual(body.start);
              expect(data.end).toEqual(new Date(Date.UTC(2030, 0, 8, 11, 0, 0)).toISOString());
              expect(data.duration).toEqual(60);
              expect(data.eventTypeId).toEqual(team2EventTypeId);
              expect(data.attendee).toEqual({ ...body.attendee, absent: false });
              expect(data.meetingUrl).toEqual(body.meetingUrl);
              expect(data.absentHost).toEqual(false);
            } else {
              throw new Error(
                "Invalid response data - expected booking but received array of possibily recurring bookings"
              );
            }
          });
      });
    });

    describe("get team bookings", () => {
      it("should should get bookings by teamId", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?teamId=${team1.id}`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(1);
            expect(data[0].eventTypeId).toEqual(team1EventTypeId);
          });
      });

      it("should should get bookings by teamId", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?teamId=${team2.id}`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(1);
            expect(data[0].eventTypeId).toEqual(team2EventTypeId);
          });
      });

      it("should should get bookings by teamIds", async () => {
        return request(app.getHttpServer())
          .get(`/v2/bookings?teamIds[]=${team1.id}&teamIds[]=${team2.id}`)
          .set(CAL_API_VERSION_HEADER, VERSION_2024_08_13)
          .expect(200)
          .then(async (response) => {
            const responseBody: GetBookingsOutput_2024_08_13 = response.body;
            expect(responseBody.status).toEqual(SUCCESS_STATUS);
            expect(responseBody.data).toBeDefined();
            const data: (BookingOutput_2024_08_13 | RecurringBookingOutput_2024_08_13)[] = responseBody.data;
            expect(data.length).toEqual(2);
            expect(data.find((booking) => booking.eventTypeId === team1EventTypeId)).toBeDefined();
            expect(data.find((booking) => booking.eventTypeId === team2EventTypeId)).toBeDefined();
          });
      });
    });

    async function createOAuthClient(organizationId: number) {
      const data = {
        logo: "logo-url",
        name: "name",
        redirectUris: ["http://localhost:5555"],
        permissions: 32,
      };
      const secret = "secret";

      const client = await oauthClientRepositoryFixture.create(organizationId, data, secret);
      return client;
    }

    function responseDataIsBooking(data: any): data is BookingOutput_2024_08_13 {
      return !Array.isArray(data) && typeof data === "object" && data && "id" in data;
    }

    afterAll(async () => {
      await oauthClientRepositoryFixture.delete(oAuthClient.id);
      await teamRepositoryFixture.delete(organization.id);
      await userRepositoryFixture.deleteByEmail(teamUser.email);
      await bookingsRepositoryFixture.deleteAllBookings(teamUser.id, teamUser.email);
      await app.close();
    });
  });
});
