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


import * as runtime from '../runtime';

export interface MembershipsUserIdTeamIdDeleteRequest {
    userId: number;
    teamId: number;
}

export interface MembershipsUserIdTeamIdGetRequest {
    userId: number;
    teamId: number;
}

export interface MembershipsUserIdTeamIdPatchRequest {
    userId: number;
    teamId: number;
}

/**
 * 
 */
export class MembershipsApi extends runtime.BaseAPI {

    /**
     * Find all memberships
     */
    async membershipsGetRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["apiKey"] = this.configuration.apiKey("apiKey"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/memberships`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Find all memberships
     */
    async membershipsGet(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.membershipsGetRaw(initOverrides);
    }

    /**
     * Creates a new membership
     */
    async membershipsPostRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["apiKey"] = this.configuration.apiKey("apiKey"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/memberships`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Creates a new membership
     */
    async membershipsPost(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.membershipsPostRaw(initOverrides);
    }

    /**
     * Remove an existing membership
     */
    async membershipsUserIdTeamIdDeleteRaw(requestParameters: MembershipsUserIdTeamIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.userId === null || requestParameters.userId === undefined) {
            throw new runtime.RequiredError('userId','Required parameter requestParameters.userId was null or undefined when calling membershipsUserIdTeamIdDelete.');
        }

        if (requestParameters.teamId === null || requestParameters.teamId === undefined) {
            throw new runtime.RequiredError('teamId','Required parameter requestParameters.teamId was null or undefined when calling membershipsUserIdTeamIdDelete.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["apiKey"] = this.configuration.apiKey("apiKey"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/memberships/{userId}_{teamId}`.replace(`{${"userId"}}`, encodeURIComponent(String(requestParameters.userId))).replace(`{${"teamId"}}`, encodeURIComponent(String(requestParameters.teamId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Remove an existing membership
     */
    async membershipsUserIdTeamIdDelete(requestParameters: MembershipsUserIdTeamIdDeleteRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.membershipsUserIdTeamIdDeleteRaw(requestParameters, initOverrides);
    }

    /**
     * Find a membership by userID and teamID
     */
    async membershipsUserIdTeamIdGetRaw(requestParameters: MembershipsUserIdTeamIdGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.userId === null || requestParameters.userId === undefined) {
            throw new runtime.RequiredError('userId','Required parameter requestParameters.userId was null or undefined when calling membershipsUserIdTeamIdGet.');
        }

        if (requestParameters.teamId === null || requestParameters.teamId === undefined) {
            throw new runtime.RequiredError('teamId','Required parameter requestParameters.teamId was null or undefined when calling membershipsUserIdTeamIdGet.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["apiKey"] = this.configuration.apiKey("apiKey"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/memberships/{userId}_{teamId}`.replace(`{${"userId"}}`, encodeURIComponent(String(requestParameters.userId))).replace(`{${"teamId"}}`, encodeURIComponent(String(requestParameters.teamId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Find a membership by userID and teamID
     */
    async membershipsUserIdTeamIdGet(requestParameters: MembershipsUserIdTeamIdGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.membershipsUserIdTeamIdGetRaw(requestParameters, initOverrides);
    }

    /**
     * Edit an existing membership
     */
    async membershipsUserIdTeamIdPatchRaw(requestParameters: MembershipsUserIdTeamIdPatchRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.userId === null || requestParameters.userId === undefined) {
            throw new runtime.RequiredError('userId','Required parameter requestParameters.userId was null or undefined when calling membershipsUserIdTeamIdPatch.');
        }

        if (requestParameters.teamId === null || requestParameters.teamId === undefined) {
            throw new runtime.RequiredError('teamId','Required parameter requestParameters.teamId was null or undefined when calling membershipsUserIdTeamIdPatch.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            queryParameters["apiKey"] = this.configuration.apiKey("apiKey"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/memberships/{userId}_{teamId}`.replace(`{${"userId"}}`, encodeURIComponent(String(requestParameters.userId))).replace(`{${"teamId"}}`, encodeURIComponent(String(requestParameters.teamId))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Edit an existing membership
     */
    async membershipsUserIdTeamIdPatch(requestParameters: MembershipsUserIdTeamIdPatchRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.membershipsUserIdTeamIdPatchRaw(requestParameters, initOverrides);
    }

}
