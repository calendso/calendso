/* tslint:disable */
/* eslint-disable */
/**
 * @calcom/api: Public API for Cal.com
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { AddBookingRequestResponses } from './AddBookingRequestResponses';
import {
    AddBookingRequestResponsesFromJSON,
    AddBookingRequestResponsesFromJSONTyped,
    AddBookingRequestResponsesToJSON,
} from './AddBookingRequestResponses';

/**
 * 
 * @export
 * @interface AddBookingRequest
 */
export interface AddBookingRequest {
    /**
     * ID of the event type to book
     * @type {number}
     * @memberof AddBookingRequest
     */
    eventTypeId: number;
    /**
     * Start time of the Event
     * @type {Date}
     * @memberof AddBookingRequest
     */
    start: Date;
    /**
     * End time of the Event
     * @type {Date}
     * @memberof AddBookingRequest
     */
    end?: Date;
    /**
     * 
     * @type {AddBookingRequestResponses}
     * @memberof AddBookingRequest
     */
    responses: AddBookingRequestResponses;
    /**
     * Any metadata associated with the booking
     * @type {object}
     * @memberof AddBookingRequest
     */
    metadata: object;
    /**
     * TimeZone of the Attendee
     * @type {string}
     * @memberof AddBookingRequest
     */
    timeZone: string;
    /**
     * Language of the Attendee
     * @type {string}
     * @memberof AddBookingRequest
     */
    language: string;
    /**
     * Booking event title
     * @type {string}
     * @memberof AddBookingRequest
     */
    title?: string;
    /**
     * Recurring event ID if the event is recurring
     * @type {number}
     * @memberof AddBookingRequest
     */
    recurringEventId?: number;
    /**
     * Event description
     * @type {string}
     * @memberof AddBookingRequest
     */
    description?: string;
    /**
     * Acceptable values one of ["ACCEPTED", "PENDING", "CANCELLED", "REJECTED"]
     * @type {string}
     * @memberof AddBookingRequest
     */
    status?: string;
    /**
     * The number of seats for each time slot
     * @type {number}
     * @memberof AddBookingRequest
     */
    seatsPerTimeSlot?: number;
    /**
     * Share Attendee information in seats
     * @type {boolean}
     * @memberof AddBookingRequest
     */
    seatsShowAttendees?: boolean;
    /**
     * Show the number of available seats
     * @type {boolean}
     * @memberof AddBookingRequest
     */
    seatsShowAvailabilityCount?: boolean;
    /**
     * SMS reminder number
     * @type {number}
     * @memberof AddBookingRequest
     */
    smsReminderNumber?: number;
}

/**
 * Check if a given object implements the AddBookingRequest interface.
 */
export function instanceOfAddBookingRequest(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "eventTypeId" in value;
    isInstance = isInstance && "start" in value;
    isInstance = isInstance && "responses" in value;
    isInstance = isInstance && "metadata" in value;
    isInstance = isInstance && "timeZone" in value;
    isInstance = isInstance && "language" in value;

    return isInstance;
}

export function AddBookingRequestFromJSON(json: any): AddBookingRequest {
    return AddBookingRequestFromJSONTyped(json, false);
}

export function AddBookingRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): AddBookingRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'eventTypeId': json['eventTypeId'],
        'start': (new Date(json['start'])),
        'end': !exists(json, 'end') ? undefined : (new Date(json['end'])),
        'responses': AddBookingRequestResponsesFromJSON(json['responses']),
        'metadata': json['metadata'],
        'timeZone': json['timeZone'],
        'language': json['language'],
        'title': !exists(json, 'title') ? undefined : json['title'],
        'recurringEventId': !exists(json, 'recurringEventId') ? undefined : json['recurringEventId'],
        'description': !exists(json, 'description') ? undefined : json['description'],
        'status': !exists(json, 'status') ? undefined : json['status'],
        'seatsPerTimeSlot': !exists(json, 'seatsPerTimeSlot') ? undefined : json['seatsPerTimeSlot'],
        'seatsShowAttendees': !exists(json, 'seatsShowAttendees') ? undefined : json['seatsShowAttendees'],
        'seatsShowAvailabilityCount': !exists(json, 'seatsShowAvailabilityCount') ? undefined : json['seatsShowAvailabilityCount'],
        'smsReminderNumber': !exists(json, 'smsReminderNumber') ? undefined : json['smsReminderNumber'],
    };
}

export function AddBookingRequestToJSON(value?: AddBookingRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'eventTypeId': value.eventTypeId,
        'start': (value.start.toISOString()),
        'end': value.end === undefined ? undefined : (value.end.toISOString()),
        'responses': AddBookingRequestResponsesToJSON(value.responses),
        'metadata': value.metadata,
        'timeZone': value.timeZone,
        'language': value.language,
        'title': value.title,
        'recurringEventId': value.recurringEventId,
        'description': value.description,
        'status': value.status,
        'seatsPerTimeSlot': value.seatsPerTimeSlot,
        'seatsShowAttendees': value.seatsShowAttendees,
        'seatsShowAvailabilityCount': value.seatsShowAvailabilityCount,
        'smsReminderNumber': value.smsReminderNumber,
    };
}

