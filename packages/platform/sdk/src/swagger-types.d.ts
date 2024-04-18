/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/health": {
    get: operations["AppController_getHealth"];
  };
  "/v2/events/public": {
    get: operations["EventsController_getPublicEvent"];
  };
  "/v2/oauth-clients/{clientId}/users": {
    post: operations["OAuthClientUsersController_createUser"];
  };
  "/v2/oauth-clients/{clientId}/users/{userId}": {
    get: operations["OAuthClientUsersController_getUserById"];
    delete: operations["OAuthClientUsersController_deleteUser"];
    patch: operations["OAuthClientUsersController_updateUser"];
  };
  "/v2/oauth-clients": {
    /**
     * @description ⚠️ First, this endpoint requires `Cookie: next-auth.session-token=eyJhbGciOiJ` header. Log into Cal web app using owner of organization that was created after visiting `/settings/organizations/new`, refresh swagger docs, and the cookie will be added to requests automatically to pass the NextAuthGuard.
     * Second, make sure that the logged in user has organizationId set to pass the OrganizationRolesGuard guard.
     */
    get: operations["OAuthClientsController_getOAuthClients"];
    /**
     * @description ⚠️ First, this endpoint requires `Cookie: next-auth.session-token=eyJhbGciOiJ` header. Log into Cal web app using owner of organization that was created after visiting `/settings/organizations/new`, refresh swagger docs, and the cookie will be added to requests automatically to pass the NextAuthGuard.
     * Second, make sure that the logged in user has organizationId set to pass the OrganizationRolesGuard guard.
     */
    post: operations["OAuthClientsController_createOAuthClient"];
  };
  "/v2/oauth-clients/{clientId}": {
    /**
     * @description ⚠️ First, this endpoint requires `Cookie: next-auth.session-token=eyJhbGciOiJ` header. Log into Cal web app using owner of organization that was created after visiting `/settings/organizations/new`, refresh swagger docs, and the cookie will be added to requests automatically to pass the NextAuthGuard.
     * Second, make sure that the logged in user has organizationId set to pass the OrganizationRolesGuard guard.
     */
    get: operations["OAuthClientsController_getOAuthClientById"];
    /**
     * @description ⚠️ First, this endpoint requires `Cookie: next-auth.session-token=eyJhbGciOiJ` header. Log into Cal web app using owner of organization that was created after visiting `/settings/organizations/new`, refresh swagger docs, and the cookie will be added to requests automatically to pass the NextAuthGuard.
     * Second, make sure that the logged in user has organizationId set to pass the OrganizationRolesGuard guard.
     */
    delete: operations["OAuthClientsController_deleteOAuthClient"];
    /**
     * @description ⚠️ First, this endpoint requires `Cookie: next-auth.session-token=eyJhbGciOiJ` header. Log into Cal web app using owner of organization that was created after visiting `/settings/organizations/new`, refresh swagger docs, and the cookie will be added to requests automatically to pass the NextAuthGuard.
     * Second, make sure that the logged in user has organizationId set to pass the OrganizationRolesGuard guard.
     */
    patch: operations["OAuthClientsController_updateOAuthClient"];
  };
  "/v2/oauth/{clientId}/authorize": {
    /**
     * Authorize an OAuth client
     * @description Redirects the user to the specified 'redirect_uri' with an authorization code in query parameter if the client is authorized successfully. The code is then exchanged for access and refresh tokens via the `/exchange` endpoint.
     */
    post: operations["OAuthFlowController_authorize"];
  };
  "/v2/oauth/{clientId}/exchange": {
    /**
     * Exchange authorization code for access tokens
     * @description Exchanges the authorization code received from the `/authorize` endpoint for access and refresh tokens. The authorization code should be provided in the 'Authorization' header prefixed with 'Bearer '.
     */
    post: operations["OAuthFlowController_exchange"];
  };
  "/v2/oauth/{clientId}/refresh": {
    post: operations["OAuthFlowController_refreshAccessToken"];
  };
  "/v2/event-types": {
    get: operations["EventTypesController_getEventTypes"];
    post: operations["EventTypesController_createEventType"];
  };
  "/v2/event-types/{eventTypeId}": {
    get: operations["EventTypesController_getEventType"];
  };
  "/v2/event-types/{username}/public": {
    get: operations["EventTypesController_getPublicEventTypes"];
  };
  "/v2/gcal/oauth/auth-url": {
    get: operations["GcalController_redirect"];
  };
  "/v2/gcal/oauth/save": {
    get: operations["GcalController_save"];
  };
  "/v2/gcal/check": {
    get: operations["GcalController_check"];
  };
  "/v2/provider/{clientId}": {
    get: operations["CalProviderController_verifyClientId"];
  };
  "/v2/provider/{clientId}/access-token": {
    get: operations["CalProviderController_verifyAccessToken"];
  };
  "/v2/schedules": {
    get: operations["SchedulesController_getSchedules"];
    post: operations["SchedulesController_createSchedule"];
  };
  "/v2/schedules/default": {
    get: operations["SchedulesController_getDefaultSchedule"];
  };
  "/v2/schedules/time-zones": {
    get: operations["SchedulesController_getTimeZones"];
  };
  "/v2/schedules/{scheduleId}": {
    get: operations["SchedulesController_getSchedule"];
    delete: operations["SchedulesController_deleteSchedule"];
    patch: operations["SchedulesController_updateSchedule"];
  };
  "/v2/me": {
    get: operations["MeController_getMe"];
    patch: operations["MeController_updateMe"];
  };
  "/v2/calendars/busy-times": {
    get: operations["CalendarsController_getBusyTimes"];
  };
  "/v2/calendars": {
    get: operations["CalendarsController_getCalendars"];
  };
  "/v2/bookings": {
    post: operations["BookingsController_createBooking"];
  };
  "/v2/bookings/recurring": {
    post: operations["BookingsController_createRecurringBooking"];
  };
  "/v2/bookings/instant": {
    post: operations["BookingsController_createInstantBooking"];
  };
  "/v2/slots/reserve": {
    post: operations["SlotsController_reserveSlot"];
  };
  "/v2/slots/selected-slot": {
    delete: operations["SlotsController_deleteSelectedSlot"];
  };
  "/v2/slots/available": {
    get: operations["SlotsController_getAvailableSlots"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    CreateManagedPlatformUserInput: {
      email: string;
      name?: string;
      timeFormat?: number;
      weekStart?: string;
      timeZone?: string;
    };
    UpdateManagedPlatformUserInput: {
      email?: string;
      name?: string;
      timeFormat?: number;
      defaultScheduleId?: number;
      weekStart?: string;
      timeZone?: string;
    };
    CreateOAuthClientInput: Record<string, never>;
    DataDto: {
      /** @example clsx38nbl0001vkhlwin9fmt0 */
      clientId: string;
      /** @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoib2F1dGgtY2xpZW50Iiwi */
      clientSecret: string;
    };
    CreateOAuthClientResponseDto: {
      /**
       * @example success
       * @enum {string}
       */
      status: "success" | "error";
      /**
       * @example {
       *   "clientId": "clsx38nbl0001vkhlwin9fmt0",
       *   "clientSecret": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoib2F1dGgtY2xpZW50Iiwi"
       * }
       */
      data: components["schemas"]["DataDto"];
    };
    PlatformOAuthClientDto: {
      /** @example clsx38nbl0001vkhlwin9fmt0 */
      id: string;
      /** @example MyClient */
      name: string;
      /** @example secretValue */
      secret: string;
      /** @example 3 */
      permissions: number;
      /** @example https://example.com/logo.png */
      logo?: Record<string, never>;
      /**
       * @example [
       *   "https://example.com/callback"
       * ]
       */
      redirectUris: string[];
      /** @example 1 */
      organizationId: number;
      /**
       * Format: date-time
       * @example 2024-03-23T08:33:21.851Z
       */
      createdAt: string;
    };
    GetOAuthClientsResponseDto: {
      /**
       * @example success
       * @enum {string}
       */
      status: "success" | "error";
      data: components["schemas"]["PlatformOAuthClientDto"][];
    };
    GetOAuthClientResponseDto: {
      /**
       * @example success
       * @enum {string}
       */
      status: "success" | "error";
      data: components["schemas"]["PlatformOAuthClientDto"];
    };
    UpdateOAuthClientInput: {
      logo?: string;
      name?: string;
      /** @default [] */
      redirectUris?: string[];
    };
    OAuthAuthorizeInput: {
      redirectUri: string;
    };
    ExchangeAuthorizationCodeInput: {
      clientSecret: string;
    };
    KeysDto: {
      /** @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 */
      accessToken: string;
      /** @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 */
      refreshToken: string;
    };
    KeysResponseDto: {
      /**
       * @example success
       * @enum {string}
       */
      status: "success" | "error";
      data: components["schemas"]["KeysDto"];
    };
    RefreshTokenInput: {
      refreshToken: string;
    };
    CreateEventTypeInput: {
      length: number;
      slug: string;
      title: string;
    };
    CreateAvailabilityInput: {
      days: number[];
      /** Format: date-time */
      startTime: string;
      /** Format: date-time */
      endTime: string;
    };
    CreateScheduleInput: {
      name: string;
      timeZone: string;
      availabilities?: components["schemas"]["CreateAvailabilityInput"][];
      /** @default true */
      isDefault: Record<string, never>;
    };
    UpdateScheduleInput: Record<string, never>;
    CreateBookingInput: {
      end?: string;
      start: string;
      eventTypeId: number;
      eventTypeSlug?: string;
      rescheduleUid?: string;
      recurringEventId?: string;
      timeZone: string;
      user?: string[];
      language: string;
      bookingUid?: string;
      metadata: Record<string, never>;
      hasHashedBookingLink?: boolean;
      hashedLink: string | null;
      seatReferenceUid?: string;
    };
    ReserveSlotInput: Record<string, never>;
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {
  AppController_getHealth: {
    responses: {
      200: {
        content: {
          "application/json": string;
        };
      };
    };
  };
  EventsController_getPublicEvent: {
    parameters: {
      query: {
        username: string;
        eventSlug: string;
        isTeamEvent?: boolean;
        org?: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  OAuthClientUsersController_createUser: {
    parameters: {
      path: {
        clientId: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateManagedPlatformUserInput"];
      };
    };
    responses: {
      201: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  OAuthClientUsersController_getUserById: {
    parameters: {
      path: {
        clientId: string;
        userId: number;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  OAuthClientUsersController_deleteUser: {
    parameters: {
      path: {
        clientId: string;
        userId: number;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  OAuthClientUsersController_updateUser: {
    parameters: {
      path: {
        clientId: string;
        userId: number;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateManagedPlatformUserInput"];
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  /**
   * @description ⚠️ First, this endpoint requires `Cookie: next-auth.session-token=eyJhbGciOiJ` header. Log into Cal web app using owner of organization that was created after visiting `/settings/organizations/new`, refresh swagger docs, and the cookie will be added to requests automatically to pass the NextAuthGuard.
   * Second, make sure that the logged in user has organizationId set to pass the OrganizationRolesGuard guard.
   */
  OAuthClientsController_getOAuthClients: {
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["GetOAuthClientsResponseDto"];
        };
      };
    };
  };
  /**
   * @description ⚠️ First, this endpoint requires `Cookie: next-auth.session-token=eyJhbGciOiJ` header. Log into Cal web app using owner of organization that was created after visiting `/settings/organizations/new`, refresh swagger docs, and the cookie will be added to requests automatically to pass the NextAuthGuard.
   * Second, make sure that the logged in user has organizationId set to pass the OrganizationRolesGuard guard.
   */
  OAuthClientsController_createOAuthClient: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateOAuthClientInput"];
      };
    };
    responses: {
      /** @description Create an OAuth client */
      201: {
        content: {
          "application/json": components["schemas"]["CreateOAuthClientResponseDto"];
        };
      };
    };
  };
  /**
   * @description ⚠️ First, this endpoint requires `Cookie: next-auth.session-token=eyJhbGciOiJ` header. Log into Cal web app using owner of organization that was created after visiting `/settings/organizations/new`, refresh swagger docs, and the cookie will be added to requests automatically to pass the NextAuthGuard.
   * Second, make sure that the logged in user has organizationId set to pass the OrganizationRolesGuard guard.
   */
  OAuthClientsController_getOAuthClientById: {
    parameters: {
      path: {
        clientId: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["GetOAuthClientResponseDto"];
        };
      };
    };
  };
  /**
   * @description ⚠️ First, this endpoint requires `Cookie: next-auth.session-token=eyJhbGciOiJ` header. Log into Cal web app using owner of organization that was created after visiting `/settings/organizations/new`, refresh swagger docs, and the cookie will be added to requests automatically to pass the NextAuthGuard.
   * Second, make sure that the logged in user has organizationId set to pass the OrganizationRolesGuard guard.
   */
  OAuthClientsController_deleteOAuthClient: {
    parameters: {
      path: {
        clientId: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["GetOAuthClientResponseDto"];
        };
      };
    };
  };
  /**
   * @description ⚠️ First, this endpoint requires `Cookie: next-auth.session-token=eyJhbGciOiJ` header. Log into Cal web app using owner of organization that was created after visiting `/settings/organizations/new`, refresh swagger docs, and the cookie will be added to requests automatically to pass the NextAuthGuard.
   * Second, make sure that the logged in user has organizationId set to pass the OrganizationRolesGuard guard.
   */
  OAuthClientsController_updateOAuthClient: {
    parameters: {
      path: {
        clientId: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateOAuthClientInput"];
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["GetOAuthClientResponseDto"];
        };
      };
    };
  };
  /**
   * Authorize an OAuth client
   * @description Redirects the user to the specified 'redirect_uri' with an authorization code in query parameter if the client is authorized successfully. The code is then exchanged for access and refresh tokens via the `/exchange` endpoint.
   */
  OAuthFlowController_authorize: {
    parameters: {
      path: {
        clientId: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["OAuthAuthorizeInput"];
      };
    };
    responses: {
      /** @description The user is redirected to the 'redirect_uri' with an authorization code in query parameter e.g. `redirectUri?code=secretcode.` */
      200: {
        content: never;
      };
      /** @description Bad request if the OAuth client is not found, if the redirect URI is invalid, or if the user has already authorized the client. */
      400: {
        content: never;
      };
    };
  };
  /**
   * Exchange authorization code for access tokens
   * @description Exchanges the authorization code received from the `/authorize` endpoint for access and refresh tokens. The authorization code should be provided in the 'Authorization' header prefixed with 'Bearer '.
   */
  OAuthFlowController_exchange: {
    parameters: {
      header: {
        Authorization: string;
      };
      path: {
        clientId: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ExchangeAuthorizationCodeInput"];
      };
    };
    responses: {
      /** @description Successfully exchanged authorization code for access and refresh tokens. */
      200: {
        content: {
          "application/json": components["schemas"]["KeysResponseDto"];
        };
      };
      /** @description Bad request if the authorization code is missing, invalid, or if the client ID and secret do not match. */
      400: {
        content: never;
      };
    };
  };
  OAuthFlowController_refreshAccessToken: {
    parameters: {
      header: {
        "x-cal-secret-key": string;
      };
      path: {
        clientId: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RefreshTokenInput"];
      };
    };
    responses: {
      200: {
        content: {
          "application/json": components["schemas"]["KeysResponseDto"];
        };
      };
    };
  };
  EventTypesController_getEventTypes: {
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  EventTypesController_createEventType: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateEventTypeInput"];
      };
    };
    responses: {
      201: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  EventTypesController_getEventType: {
    parameters: {
      path: {
        eventTypeId: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  EventTypesController_getPublicEventTypes: {
    parameters: {
      path: {
        username: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  GcalController_redirect: {
    parameters: {
      header: {
        Authorization: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  GcalController_save: {
    parameters: {
      query: {
        state: string;
        code: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  GcalController_check: {
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  CalProviderController_verifyClientId: {
    parameters: {
      path: {
        clientId: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  CalProviderController_verifyAccessToken: {
    parameters: {
      path: {
        clientId: string;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  SchedulesController_getSchedules: {
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  SchedulesController_createSchedule: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateScheduleInput"];
      };
    };
    responses: {
      201: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  SchedulesController_getDefaultSchedule: {
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  SchedulesController_getTimeZones: {
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  SchedulesController_getSchedule: {
    parameters: {
      path: {
        scheduleId: number;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  SchedulesController_deleteSchedule: {
    parameters: {
      path: {
        scheduleId: number;
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  SchedulesController_updateSchedule: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateScheduleInput"];
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  MeController_getMe: {
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  MeController_updateMe: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdateManagedPlatformUserInput"];
      };
    };
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  CalendarsController_getBusyTimes: {
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  CalendarsController_getCalendars: {
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  BookingsController_createBooking: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateBookingInput"];
      };
    };
    responses: {
      201: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  BookingsController_createRecurringBooking: {
    requestBody: {
      content: {
        "application/json": string[];
      };
    };
    responses: {
      201: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  BookingsController_createInstantBooking: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreateBookingInput"];
      };
    };
    responses: {
      201: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  SlotsController_reserveSlot: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["ReserveSlotInput"];
      };
    };
    responses: {
      201: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  SlotsController_deleteSelectedSlot: {
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
  SlotsController_getAvailableSlots: {
    responses: {
      200: {
        content: {
          "application/json": Record<string, never>;
        };
      };
    };
  };
}
