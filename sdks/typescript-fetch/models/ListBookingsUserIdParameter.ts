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

/**
 * @type ListBookingsUserIdParameter
 * 
 * @export
 */
export type ListBookingsUserIdParameter = Array<number> | number;

export function ListBookingsUserIdParameterFromJSON(json: any): ListBookingsUserIdParameter {
    return ListBookingsUserIdParameterFromJSONTyped(json, false);
}

export function ListBookingsUserIdParameterFromJSONTyped(json: any, ignoreDiscriminator: boolean): ListBookingsUserIdParameter {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return { ...Array<number>FromJSONTyped(json, true), ...numberFromJSONTyped(json, true) };
}

export function ListBookingsUserIdParameterToJSON(value?: ListBookingsUserIdParameter | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }

    if (instanceOfArray<number>(value)) {
        return Array<number>ToJSON(value as Array<number>);
    }
    if (instanceOfnumber(value)) {
        return numberToJSON(value as number);
    }

    return {};
}

