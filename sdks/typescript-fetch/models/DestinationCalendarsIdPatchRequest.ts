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
/**
 * 
 * @export
 * @interface DestinationCalendarsIdPatchRequest
 */
export interface DestinationCalendarsIdPatchRequest {
    /**
     * The integration
     * @type {string}
     * @memberof DestinationCalendarsIdPatchRequest
     */
    integration?: string;
    /**
     * The external ID of the integration
     * @type {string}
     * @memberof DestinationCalendarsIdPatchRequest
     */
    externalId?: string;
    /**
     * The ID of the eventType it is associated with
     * @type {number}
     * @memberof DestinationCalendarsIdPatchRequest
     */
    eventTypeId?: number;
    /**
     * The booking ID it is associated with
     * @type {number}
     * @memberof DestinationCalendarsIdPatchRequest
     */
    bookingId?: number;
}

/**
 * Check if a given object implements the DestinationCalendarsIdPatchRequest interface.
 */
export function instanceOfDestinationCalendarsIdPatchRequest(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function DestinationCalendarsIdPatchRequestFromJSON(json: any): DestinationCalendarsIdPatchRequest {
    return DestinationCalendarsIdPatchRequestFromJSONTyped(json, false);
}

export function DestinationCalendarsIdPatchRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): DestinationCalendarsIdPatchRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'integration': !exists(json, 'integration') ? undefined : json['integration'],
        'externalId': !exists(json, 'externalId') ? undefined : json['externalId'],
        'eventTypeId': !exists(json, 'eventTypeId') ? undefined : json['eventTypeId'],
        'bookingId': !exists(json, 'bookingId') ? undefined : json['bookingId'],
    };
}

export function DestinationCalendarsIdPatchRequestToJSON(value?: DestinationCalendarsIdPatchRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'integration': value.integration,
        'externalId': value.externalId,
        'eventTypeId': value.eventTypeId,
        'bookingId': value.bookingId,
    };
}

