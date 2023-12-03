/*
@calcom/api: Public API for Cal.com

No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

API version: 1.0.0
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package openapi

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"net/url"
	"strings"
)


// AvailabilityAPIService AvailabilityAPI service
type AvailabilityAPIService service

type ApiTeamAvailabilityRequest struct {
	ctx context.Context
	ApiService *AvailabilityAPIService
	apiKey *string
	teamId int32
	dateFrom *string
	dateTo *string
	eventTypeId *int32
}

// Your API key
func (r ApiTeamAvailabilityRequest) ApiKey(apiKey string) ApiTeamAvailabilityRequest {
	r.apiKey = &apiKey
	return r
}

// Start Date of the availability query
func (r ApiTeamAvailabilityRequest) DateFrom(dateFrom string) ApiTeamAvailabilityRequest {
	r.dateFrom = &dateFrom
	return r
}

// End Date of the availability query
func (r ApiTeamAvailabilityRequest) DateTo(dateTo string) ApiTeamAvailabilityRequest {
	r.dateTo = &dateTo
	return r
}

// Event Type ID of the event type to fetch the availability for
func (r ApiTeamAvailabilityRequest) EventTypeId(eventTypeId int32) ApiTeamAvailabilityRequest {
	r.eventTypeId = &eventTypeId
	return r
}

func (r ApiTeamAvailabilityRequest) Execute() (map[string]interface{}, *http.Response, error) {
	return r.ApiService.TeamAvailabilityExecute(r)
}

/*
TeamAvailability Find team availability

 @param ctx context.Context - for authentication, logging, cancellation, deadlines, tracing, etc. Passed from http.Request or context.Background().
 @param teamId ID of the team to fetch the availability for
 @return ApiTeamAvailabilityRequest
*/
func (a *AvailabilityAPIService) TeamAvailability(ctx context.Context, teamId int32) ApiTeamAvailabilityRequest {
	return ApiTeamAvailabilityRequest{
		ApiService: a,
		ctx: ctx,
		teamId: teamId,
	}
}

// Execute executes the request
//  @return map[string]interface{}
func (a *AvailabilityAPIService) TeamAvailabilityExecute(r ApiTeamAvailabilityRequest) (map[string]interface{}, *http.Response, error) {
	var (
		localVarHTTPMethod   = http.MethodGet
		localVarPostBody     interface{}
		formFiles            []formFile
		localVarReturnValue  map[string]interface{}
	)

	localBasePath, err := a.client.cfg.ServerURLWithContext(r.ctx, "AvailabilityAPIService.TeamAvailability")
	if err != nil {
		return localVarReturnValue, nil, &GenericOpenAPIError{error: err.Error()}
	}

	localVarPath := localBasePath + "/teams/{teamId}/availability"
	localVarPath = strings.Replace(localVarPath, "{"+"teamId"+"}", url.PathEscape(parameterValueToString(r.teamId, "teamId")), -1)

	localVarHeaderParams := make(map[string]string)
	localVarQueryParams := url.Values{}
	localVarFormParams := url.Values{}
	if r.apiKey == nil {
		return localVarReturnValue, nil, reportError("apiKey is required and must be specified")
	}

	parameterAddToHeaderOrQuery(localVarQueryParams, "apiKey", r.apiKey, "")
	if r.dateFrom != nil {
		parameterAddToHeaderOrQuery(localVarQueryParams, "dateFrom", r.dateFrom, "")
	}
	if r.dateTo != nil {
		parameterAddToHeaderOrQuery(localVarQueryParams, "dateTo", r.dateTo, "")
	}
	if r.eventTypeId != nil {
		parameterAddToHeaderOrQuery(localVarQueryParams, "eventTypeId", r.eventTypeId, "")
	}
	// to determine the Content-Type header
	localVarHTTPContentTypes := []string{}

	// set Content-Type header
	localVarHTTPContentType := selectHeaderContentType(localVarHTTPContentTypes)
	if localVarHTTPContentType != "" {
		localVarHeaderParams["Content-Type"] = localVarHTTPContentType
	}

	// to determine the Accept header
	localVarHTTPHeaderAccepts := []string{"application/json"}

	// set Accept header
	localVarHTTPHeaderAccept := selectHeaderAccept(localVarHTTPHeaderAccepts)
	if localVarHTTPHeaderAccept != "" {
		localVarHeaderParams["Accept"] = localVarHTTPHeaderAccept
	}
	if r.ctx != nil {
		// API Key Authentication
		if auth, ok := r.ctx.Value(ContextAPIKeys).(map[string]APIKey); ok {
			if apiKey, ok := auth["ApiKeyAuth"]; ok {
				var key string
				if apiKey.Prefix != "" {
					key = apiKey.Prefix + " " + apiKey.Key
				} else {
					key = apiKey.Key
				}
				localVarQueryParams.Add("apiKey", key)
			}
		}
	}
	req, err := a.client.prepareRequest(r.ctx, localVarPath, localVarHTTPMethod, localVarPostBody, localVarHeaderParams, localVarQueryParams, localVarFormParams, formFiles)
	if err != nil {
		return localVarReturnValue, nil, err
	}

	localVarHTTPResponse, err := a.client.callAPI(req)
	if err != nil || localVarHTTPResponse == nil {
		return localVarReturnValue, localVarHTTPResponse, err
	}

	localVarBody, err := io.ReadAll(localVarHTTPResponse.Body)
	localVarHTTPResponse.Body.Close()
	localVarHTTPResponse.Body = io.NopCloser(bytes.NewBuffer(localVarBody))
	if err != nil {
		return localVarReturnValue, localVarHTTPResponse, err
	}

	if localVarHTTPResponse.StatusCode >= 300 {
		newErr := &GenericOpenAPIError{
			body:  localVarBody,
			error: localVarHTTPResponse.Status,
		}
		return localVarReturnValue, localVarHTTPResponse, newErr
	}

	err = a.client.decode(&localVarReturnValue, localVarBody, localVarHTTPResponse.Header.Get("Content-Type"))
	if err != nil {
		newErr := &GenericOpenAPIError{
			body:  localVarBody,
			error: err.Error(),
		}
		return localVarReturnValue, localVarHTTPResponse, newErr
	}

	return localVarReturnValue, localVarHTTPResponse, nil
}

type ApiUserAvailabilityRequest struct {
	ctx context.Context
	ApiService *AvailabilityAPIService
	apiKey *string
	userId *int32
	username *string
	dateFrom *string
	dateTo *string
	eventTypeId *int32
}

// Your API key
func (r ApiUserAvailabilityRequest) ApiKey(apiKey string) ApiUserAvailabilityRequest {
	r.apiKey = &apiKey
	return r
}

// ID of the user to fetch the availability for
func (r ApiUserAvailabilityRequest) UserId(userId int32) ApiUserAvailabilityRequest {
	r.userId = &userId
	return r
}

// username of the user to fetch the availability for
func (r ApiUserAvailabilityRequest) Username(username string) ApiUserAvailabilityRequest {
	r.username = &username
	return r
}

// Start Date of the availability query
func (r ApiUserAvailabilityRequest) DateFrom(dateFrom string) ApiUserAvailabilityRequest {
	r.dateFrom = &dateFrom
	return r
}

// End Date of the availability query
func (r ApiUserAvailabilityRequest) DateTo(dateTo string) ApiUserAvailabilityRequest {
	r.dateTo = &dateTo
	return r
}

// Event Type ID of the event type to fetch the availability for
func (r ApiUserAvailabilityRequest) EventTypeId(eventTypeId int32) ApiUserAvailabilityRequest {
	r.eventTypeId = &eventTypeId
	return r
}

func (r ApiUserAvailabilityRequest) Execute() (map[string]interface{}, *http.Response, error) {
	return r.ApiService.UserAvailabilityExecute(r)
}

/*
UserAvailability Find user availability

 @param ctx context.Context - for authentication, logging, cancellation, deadlines, tracing, etc. Passed from http.Request or context.Background().
 @return ApiUserAvailabilityRequest
*/
func (a *AvailabilityAPIService) UserAvailability(ctx context.Context) ApiUserAvailabilityRequest {
	return ApiUserAvailabilityRequest{
		ApiService: a,
		ctx: ctx,
	}
}

// Execute executes the request
//  @return map[string]interface{}
func (a *AvailabilityAPIService) UserAvailabilityExecute(r ApiUserAvailabilityRequest) (map[string]interface{}, *http.Response, error) {
	var (
		localVarHTTPMethod   = http.MethodGet
		localVarPostBody     interface{}
		formFiles            []formFile
		localVarReturnValue  map[string]interface{}
	)

	localBasePath, err := a.client.cfg.ServerURLWithContext(r.ctx, "AvailabilityAPIService.UserAvailability")
	if err != nil {
		return localVarReturnValue, nil, &GenericOpenAPIError{error: err.Error()}
	}

	localVarPath := localBasePath + "/availability"

	localVarHeaderParams := make(map[string]string)
	localVarQueryParams := url.Values{}
	localVarFormParams := url.Values{}
	if r.apiKey == nil {
		return localVarReturnValue, nil, reportError("apiKey is required and must be specified")
	}

	parameterAddToHeaderOrQuery(localVarQueryParams, "apiKey", r.apiKey, "")
	if r.userId != nil {
		parameterAddToHeaderOrQuery(localVarQueryParams, "userId", r.userId, "")
	}
	if r.username != nil {
		parameterAddToHeaderOrQuery(localVarQueryParams, "username", r.username, "")
	}
	if r.dateFrom != nil {
		parameterAddToHeaderOrQuery(localVarQueryParams, "dateFrom", r.dateFrom, "")
	}
	if r.dateTo != nil {
		parameterAddToHeaderOrQuery(localVarQueryParams, "dateTo", r.dateTo, "")
	}
	if r.eventTypeId != nil {
		parameterAddToHeaderOrQuery(localVarQueryParams, "eventTypeId", r.eventTypeId, "")
	}
	// to determine the Content-Type header
	localVarHTTPContentTypes := []string{}

	// set Content-Type header
	localVarHTTPContentType := selectHeaderContentType(localVarHTTPContentTypes)
	if localVarHTTPContentType != "" {
		localVarHeaderParams["Content-Type"] = localVarHTTPContentType
	}

	// to determine the Accept header
	localVarHTTPHeaderAccepts := []string{"application/json"}

	// set Accept header
	localVarHTTPHeaderAccept := selectHeaderAccept(localVarHTTPHeaderAccepts)
	if localVarHTTPHeaderAccept != "" {
		localVarHeaderParams["Accept"] = localVarHTTPHeaderAccept
	}
	if r.ctx != nil {
		// API Key Authentication
		if auth, ok := r.ctx.Value(ContextAPIKeys).(map[string]APIKey); ok {
			if apiKey, ok := auth["ApiKeyAuth"]; ok {
				var key string
				if apiKey.Prefix != "" {
					key = apiKey.Prefix + " " + apiKey.Key
				} else {
					key = apiKey.Key
				}
				localVarQueryParams.Add("apiKey", key)
			}
		}
	}
	req, err := a.client.prepareRequest(r.ctx, localVarPath, localVarHTTPMethod, localVarPostBody, localVarHeaderParams, localVarQueryParams, localVarFormParams, formFiles)
	if err != nil {
		return localVarReturnValue, nil, err
	}

	localVarHTTPResponse, err := a.client.callAPI(req)
	if err != nil || localVarHTTPResponse == nil {
		return localVarReturnValue, localVarHTTPResponse, err
	}

	localVarBody, err := io.ReadAll(localVarHTTPResponse.Body)
	localVarHTTPResponse.Body.Close()
	localVarHTTPResponse.Body = io.NopCloser(bytes.NewBuffer(localVarBody))
	if err != nil {
		return localVarReturnValue, localVarHTTPResponse, err
	}

	if localVarHTTPResponse.StatusCode >= 300 {
		newErr := &GenericOpenAPIError{
			body:  localVarBody,
			error: localVarHTTPResponse.Status,
		}
		return localVarReturnValue, localVarHTTPResponse, newErr
	}

	err = a.client.decode(&localVarReturnValue, localVarBody, localVarHTTPResponse.Header.Get("Content-Type"))
	if err != nil {
		newErr := &GenericOpenAPIError{
			body:  localVarBody,
			error: err.Error(),
		}
		return localVarReturnValue, localVarHTTPResponse, newErr
	}

	return localVarReturnValue, localVarHTTPResponse, nil
}
