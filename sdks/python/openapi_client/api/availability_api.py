# coding: utf-8

"""
    @calcom/api: Public API for Cal.com

    No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

    The version of the OpenAPI document: 1.0.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


import io
import warnings

from pydantic import validate_call, Field, StrictFloat, StrictStr, StrictInt
from typing import Dict, List, Optional, Tuple, Union, Any

try:
    from typing import Annotated
except ImportError:
    from typing_extensions import Annotated

from pydantic import Field
from typing_extensions import Annotated
from datetime import date

from pydantic import StrictInt, StrictStr

from typing import Any, Dict, Optional


from openapi_client.api_client import ApiClient
from openapi_client.api_response import ApiResponse
from openapi_client.rest import RESTResponseType


class AvailabilityApi:
    """NOTE: This class is auto generated by OpenAPI Generator
    Ref: https://openapi-generator.tech

    Do not edit the class manually.
    """

    def __init__(self, api_client=None) -> None:
        if api_client is None:
            api_client = ApiClient.get_default()
        self.api_client = api_client


    @validate_call
    def team_availability(
        self,
        api_key: Annotated[StrictStr, Field(description="Your API key")],
        team_id: Annotated[StrictInt, Field(description="ID of the team to fetch the availability for")],
        date_from: Annotated[Optional[date], Field(description="Start Date of the availability query")] = None,
        date_to: Annotated[Optional[date], Field(description="End Date of the availability query")] = None,
        event_type_id: Annotated[Optional[StrictInt], Field(description="Event Type ID of the event type to fetch the availability for")] = None,
        _request_timeout: Union[
            None,
            Annotated[StrictFloat, Field(gt=0)],
            Tuple[
                Annotated[StrictFloat, Field(gt=0)],
                Annotated[StrictFloat, Field(gt=0)]
            ]
        ] = None,
        _request_auth: Optional[Dict[StrictStr, Any]] = None,
        _content_type: Optional[StrictStr] = None,
        _headers: Optional[Dict[StrictStr, Any]] = None,
        _host_index: Annotated[StrictInt, Field(ge=0, le=0)] = 0,
    ) -> object:
        """Find team availability


        :param api_key: Your API key (required)
        :type api_key: str
        :param team_id: ID of the team to fetch the availability for (required)
        :type team_id: int
        :param date_from: Start Date of the availability query
        :type date_from: date
        :param date_to: End Date of the availability query
        :type date_to: date
        :param event_type_id: Event Type ID of the event type to fetch the availability for
        :type event_type_id: int
        :param _request_timeout: timeout setting for this request. If one
                                 number provided, it will be total request
                                 timeout. It can also be a pair (tuple) of
                                 (connection, read) timeouts.
        :type _request_timeout: int, tuple(int, int), optional
        :param _request_auth: set to override the auth_settings for an a single
                              request; this effectively ignores the
                              authentication in the spec for a single request.
        :type _request_auth: dict, optional
        :param _content_type: force content-type for the request.
        :type _content_type: str, Optional
        :param _headers: set to override the headers for a single
                         request; this effectively ignores the headers
                         in the spec for a single request.
        :type _headers: dict, optional
        :param _host_index: set to override the host_index for a single
                            request; this effectively ignores the host_index
                            in the spec for a single request.
        :type _host_index: int, optional
        :return: Returns the result object.
        """ # noqa: E501

        _param = self._team_availability_serialize(
            api_key=api_key,
            team_id=team_id,
            date_from=date_from,
            date_to=date_to,
            event_type_id=event_type_id,
            _request_auth=_request_auth,
            _content_type=_content_type,
            _headers=_headers,
            _host_index=_host_index
        )

        _response_types_map: Dict[str, Optional[str]] = {
            '200': "object",
            '401': None,
            '404': None,
        }
        response_data = self.api_client.call_api(
            *_param,
            _request_timeout=_request_timeout
        )
        response_data.read()
        return self.api_client.response_deserialize(
            response_data=response_data,
            response_types_map=_response_types_map,
        ).data


    @validate_call
    def team_availability_with_http_info(
        self,
        api_key: Annotated[StrictStr, Field(description="Your API key")],
        team_id: Annotated[StrictInt, Field(description="ID of the team to fetch the availability for")],
        date_from: Annotated[Optional[date], Field(description="Start Date of the availability query")] = None,
        date_to: Annotated[Optional[date], Field(description="End Date of the availability query")] = None,
        event_type_id: Annotated[Optional[StrictInt], Field(description="Event Type ID of the event type to fetch the availability for")] = None,
        _request_timeout: Union[
            None,
            Annotated[StrictFloat, Field(gt=0)],
            Tuple[
                Annotated[StrictFloat, Field(gt=0)],
                Annotated[StrictFloat, Field(gt=0)]
            ]
        ] = None,
        _request_auth: Optional[Dict[StrictStr, Any]] = None,
        _content_type: Optional[StrictStr] = None,
        _headers: Optional[Dict[StrictStr, Any]] = None,
        _host_index: Annotated[StrictInt, Field(ge=0, le=0)] = 0,
    ) -> ApiResponse[object]:
        """Find team availability


        :param api_key: Your API key (required)
        :type api_key: str
        :param team_id: ID of the team to fetch the availability for (required)
        :type team_id: int
        :param date_from: Start Date of the availability query
        :type date_from: date
        :param date_to: End Date of the availability query
        :type date_to: date
        :param event_type_id: Event Type ID of the event type to fetch the availability for
        :type event_type_id: int
        :param _request_timeout: timeout setting for this request. If one
                                 number provided, it will be total request
                                 timeout. It can also be a pair (tuple) of
                                 (connection, read) timeouts.
        :type _request_timeout: int, tuple(int, int), optional
        :param _request_auth: set to override the auth_settings for an a single
                              request; this effectively ignores the
                              authentication in the spec for a single request.
        :type _request_auth: dict, optional
        :param _content_type: force content-type for the request.
        :type _content_type: str, Optional
        :param _headers: set to override the headers for a single
                         request; this effectively ignores the headers
                         in the spec for a single request.
        :type _headers: dict, optional
        :param _host_index: set to override the host_index for a single
                            request; this effectively ignores the host_index
                            in the spec for a single request.
        :type _host_index: int, optional
        :return: Returns the result object.
        """ # noqa: E501

        _param = self._team_availability_serialize(
            api_key=api_key,
            team_id=team_id,
            date_from=date_from,
            date_to=date_to,
            event_type_id=event_type_id,
            _request_auth=_request_auth,
            _content_type=_content_type,
            _headers=_headers,
            _host_index=_host_index
        )

        _response_types_map: Dict[str, Optional[str]] = {
            '200': "object",
            '401': None,
            '404': None,
        }
        response_data = self.api_client.call_api(
            *_param,
            _request_timeout=_request_timeout
        )
        response_data.read()
        return self.api_client.response_deserialize(
            response_data=response_data,
            response_types_map=_response_types_map,
        )


    @validate_call
    def team_availability_without_preload_content(
        self,
        api_key: Annotated[StrictStr, Field(description="Your API key")],
        team_id: Annotated[StrictInt, Field(description="ID of the team to fetch the availability for")],
        date_from: Annotated[Optional[date], Field(description="Start Date of the availability query")] = None,
        date_to: Annotated[Optional[date], Field(description="End Date of the availability query")] = None,
        event_type_id: Annotated[Optional[StrictInt], Field(description="Event Type ID of the event type to fetch the availability for")] = None,
        _request_timeout: Union[
            None,
            Annotated[StrictFloat, Field(gt=0)],
            Tuple[
                Annotated[StrictFloat, Field(gt=0)],
                Annotated[StrictFloat, Field(gt=0)]
            ]
        ] = None,
        _request_auth: Optional[Dict[StrictStr, Any]] = None,
        _content_type: Optional[StrictStr] = None,
        _headers: Optional[Dict[StrictStr, Any]] = None,
        _host_index: Annotated[StrictInt, Field(ge=0, le=0)] = 0,
    ) -> RESTResponseType:
        """Find team availability


        :param api_key: Your API key (required)
        :type api_key: str
        :param team_id: ID of the team to fetch the availability for (required)
        :type team_id: int
        :param date_from: Start Date of the availability query
        :type date_from: date
        :param date_to: End Date of the availability query
        :type date_to: date
        :param event_type_id: Event Type ID of the event type to fetch the availability for
        :type event_type_id: int
        :param _request_timeout: timeout setting for this request. If one
                                 number provided, it will be total request
                                 timeout. It can also be a pair (tuple) of
                                 (connection, read) timeouts.
        :type _request_timeout: int, tuple(int, int), optional
        :param _request_auth: set to override the auth_settings for an a single
                              request; this effectively ignores the
                              authentication in the spec for a single request.
        :type _request_auth: dict, optional
        :param _content_type: force content-type for the request.
        :type _content_type: str, Optional
        :param _headers: set to override the headers for a single
                         request; this effectively ignores the headers
                         in the spec for a single request.
        :type _headers: dict, optional
        :param _host_index: set to override the host_index for a single
                            request; this effectively ignores the host_index
                            in the spec for a single request.
        :type _host_index: int, optional
        :return: Returns the result object.
        """ # noqa: E501

        _param = self._team_availability_serialize(
            api_key=api_key,
            team_id=team_id,
            date_from=date_from,
            date_to=date_to,
            event_type_id=event_type_id,
            _request_auth=_request_auth,
            _content_type=_content_type,
            _headers=_headers,
            _host_index=_host_index
        )

        _response_types_map: Dict[str, Optional[str]] = {
            '200': "object",
            '401': None,
            '404': None,
        }
        response_data = self.api_client.call_api(
            *_param,
            _request_timeout=_request_timeout
        )
        return response_data.response


    def _team_availability_serialize(
        self,
        api_key,
        team_id,
        date_from,
        date_to,
        event_type_id,
        _request_auth,
        _content_type,
        _headers,
        _host_index,
    ) -> Tuple:

        _host = None

        _collection_formats: Dict[str, str] = {
            
        }

        _path_params: Dict[str, str] = {}
        _query_params: List[Tuple[str, str]] = []
        _header_params: Dict[str, Optional[str]] = _headers or {}
        _form_params: List[Tuple[str, str]] = []
        _files: Dict[str, str] = {}
        _body_params: Optional[bytes] = None

        # process the path parameters
        if team_id is not None:
            _path_params['teamId'] = team_id
        # process the query parameters
        if api_key is not None:
            
            _query_params.append(('apiKey', api_key))
            
        if date_from is not None:
            if isinstance(date_from, date):
                _query_params.append(
                    (
                        'dateFrom',
                        date_from.strftime(
                            self.api_client.configuration.date_format
                        )
                    )
                )
            else:
                _query_params.append(('dateFrom', date_from))
            
        if date_to is not None:
            if isinstance(date_to, date):
                _query_params.append(
                    (
                        'dateTo',
                        date_to.strftime(
                            self.api_client.configuration.date_format
                        )
                    )
                )
            else:
                _query_params.append(('dateTo', date_to))
            
        if event_type_id is not None:
            
            _query_params.append(('eventTypeId', event_type_id))
            
        # process the header parameters
        # process the form parameters
        # process the body parameter


        # set the HTTP header `Accept`
        _header_params['Accept'] = self.api_client.select_header_accept(
            [
                'application/json'
            ]
        )


        # authentication setting
        _auth_settings: List[str] = [
            'ApiKeyAuth'
        ]

        return self.api_client.param_serialize(
            method='GET',
            resource_path='/teams/{teamId}/availability',
            path_params=_path_params,
            query_params=_query_params,
            header_params=_header_params,
            body=_body_params,
            post_params=_form_params,
            files=_files,
            auth_settings=_auth_settings,
            collection_formats=_collection_formats,
            _host=_host,
            _request_auth=_request_auth
        )




    @validate_call
    def user_availability(
        self,
        api_key: Annotated[StrictStr, Field(description="Your API key")],
        user_id: Annotated[Optional[StrictInt], Field(description="ID of the user to fetch the availability for")] = None,
        username: Annotated[Optional[StrictStr], Field(description="username of the user to fetch the availability for")] = None,
        date_from: Annotated[Optional[date], Field(description="Start Date of the availability query")] = None,
        date_to: Annotated[Optional[date], Field(description="End Date of the availability query")] = None,
        event_type_id: Annotated[Optional[StrictInt], Field(description="Event Type ID of the event type to fetch the availability for")] = None,
        _request_timeout: Union[
            None,
            Annotated[StrictFloat, Field(gt=0)],
            Tuple[
                Annotated[StrictFloat, Field(gt=0)],
                Annotated[StrictFloat, Field(gt=0)]
            ]
        ] = None,
        _request_auth: Optional[Dict[StrictStr, Any]] = None,
        _content_type: Optional[StrictStr] = None,
        _headers: Optional[Dict[StrictStr, Any]] = None,
        _host_index: Annotated[StrictInt, Field(ge=0, le=0)] = 0,
    ) -> object:
        """Find user availability


        :param api_key: Your API key (required)
        :type api_key: str
        :param user_id: ID of the user to fetch the availability for
        :type user_id: int
        :param username: username of the user to fetch the availability for
        :type username: str
        :param date_from: Start Date of the availability query
        :type date_from: date
        :param date_to: End Date of the availability query
        :type date_to: date
        :param event_type_id: Event Type ID of the event type to fetch the availability for
        :type event_type_id: int
        :param _request_timeout: timeout setting for this request. If one
                                 number provided, it will be total request
                                 timeout. It can also be a pair (tuple) of
                                 (connection, read) timeouts.
        :type _request_timeout: int, tuple(int, int), optional
        :param _request_auth: set to override the auth_settings for an a single
                              request; this effectively ignores the
                              authentication in the spec for a single request.
        :type _request_auth: dict, optional
        :param _content_type: force content-type for the request.
        :type _content_type: str, Optional
        :param _headers: set to override the headers for a single
                         request; this effectively ignores the headers
                         in the spec for a single request.
        :type _headers: dict, optional
        :param _host_index: set to override the host_index for a single
                            request; this effectively ignores the host_index
                            in the spec for a single request.
        :type _host_index: int, optional
        :return: Returns the result object.
        """ # noqa: E501

        _param = self._user_availability_serialize(
            api_key=api_key,
            user_id=user_id,
            username=username,
            date_from=date_from,
            date_to=date_to,
            event_type_id=event_type_id,
            _request_auth=_request_auth,
            _content_type=_content_type,
            _headers=_headers,
            _host_index=_host_index
        )

        _response_types_map: Dict[str, Optional[str]] = {
            '200': "object",
            '401': None,
            '404': None,
        }
        response_data = self.api_client.call_api(
            *_param,
            _request_timeout=_request_timeout
        )
        response_data.read()
        return self.api_client.response_deserialize(
            response_data=response_data,
            response_types_map=_response_types_map,
        ).data


    @validate_call
    def user_availability_with_http_info(
        self,
        api_key: Annotated[StrictStr, Field(description="Your API key")],
        user_id: Annotated[Optional[StrictInt], Field(description="ID of the user to fetch the availability for")] = None,
        username: Annotated[Optional[StrictStr], Field(description="username of the user to fetch the availability for")] = None,
        date_from: Annotated[Optional[date], Field(description="Start Date of the availability query")] = None,
        date_to: Annotated[Optional[date], Field(description="End Date of the availability query")] = None,
        event_type_id: Annotated[Optional[StrictInt], Field(description="Event Type ID of the event type to fetch the availability for")] = None,
        _request_timeout: Union[
            None,
            Annotated[StrictFloat, Field(gt=0)],
            Tuple[
                Annotated[StrictFloat, Field(gt=0)],
                Annotated[StrictFloat, Field(gt=0)]
            ]
        ] = None,
        _request_auth: Optional[Dict[StrictStr, Any]] = None,
        _content_type: Optional[StrictStr] = None,
        _headers: Optional[Dict[StrictStr, Any]] = None,
        _host_index: Annotated[StrictInt, Field(ge=0, le=0)] = 0,
    ) -> ApiResponse[object]:
        """Find user availability


        :param api_key: Your API key (required)
        :type api_key: str
        :param user_id: ID of the user to fetch the availability for
        :type user_id: int
        :param username: username of the user to fetch the availability for
        :type username: str
        :param date_from: Start Date of the availability query
        :type date_from: date
        :param date_to: End Date of the availability query
        :type date_to: date
        :param event_type_id: Event Type ID of the event type to fetch the availability for
        :type event_type_id: int
        :param _request_timeout: timeout setting for this request. If one
                                 number provided, it will be total request
                                 timeout. It can also be a pair (tuple) of
                                 (connection, read) timeouts.
        :type _request_timeout: int, tuple(int, int), optional
        :param _request_auth: set to override the auth_settings for an a single
                              request; this effectively ignores the
                              authentication in the spec for a single request.
        :type _request_auth: dict, optional
        :param _content_type: force content-type for the request.
        :type _content_type: str, Optional
        :param _headers: set to override the headers for a single
                         request; this effectively ignores the headers
                         in the spec for a single request.
        :type _headers: dict, optional
        :param _host_index: set to override the host_index for a single
                            request; this effectively ignores the host_index
                            in the spec for a single request.
        :type _host_index: int, optional
        :return: Returns the result object.
        """ # noqa: E501

        _param = self._user_availability_serialize(
            api_key=api_key,
            user_id=user_id,
            username=username,
            date_from=date_from,
            date_to=date_to,
            event_type_id=event_type_id,
            _request_auth=_request_auth,
            _content_type=_content_type,
            _headers=_headers,
            _host_index=_host_index
        )

        _response_types_map: Dict[str, Optional[str]] = {
            '200': "object",
            '401': None,
            '404': None,
        }
        response_data = self.api_client.call_api(
            *_param,
            _request_timeout=_request_timeout
        )
        response_data.read()
        return self.api_client.response_deserialize(
            response_data=response_data,
            response_types_map=_response_types_map,
        )


    @validate_call
    def user_availability_without_preload_content(
        self,
        api_key: Annotated[StrictStr, Field(description="Your API key")],
        user_id: Annotated[Optional[StrictInt], Field(description="ID of the user to fetch the availability for")] = None,
        username: Annotated[Optional[StrictStr], Field(description="username of the user to fetch the availability for")] = None,
        date_from: Annotated[Optional[date], Field(description="Start Date of the availability query")] = None,
        date_to: Annotated[Optional[date], Field(description="End Date of the availability query")] = None,
        event_type_id: Annotated[Optional[StrictInt], Field(description="Event Type ID of the event type to fetch the availability for")] = None,
        _request_timeout: Union[
            None,
            Annotated[StrictFloat, Field(gt=0)],
            Tuple[
                Annotated[StrictFloat, Field(gt=0)],
                Annotated[StrictFloat, Field(gt=0)]
            ]
        ] = None,
        _request_auth: Optional[Dict[StrictStr, Any]] = None,
        _content_type: Optional[StrictStr] = None,
        _headers: Optional[Dict[StrictStr, Any]] = None,
        _host_index: Annotated[StrictInt, Field(ge=0, le=0)] = 0,
    ) -> RESTResponseType:
        """Find user availability


        :param api_key: Your API key (required)
        :type api_key: str
        :param user_id: ID of the user to fetch the availability for
        :type user_id: int
        :param username: username of the user to fetch the availability for
        :type username: str
        :param date_from: Start Date of the availability query
        :type date_from: date
        :param date_to: End Date of the availability query
        :type date_to: date
        :param event_type_id: Event Type ID of the event type to fetch the availability for
        :type event_type_id: int
        :param _request_timeout: timeout setting for this request. If one
                                 number provided, it will be total request
                                 timeout. It can also be a pair (tuple) of
                                 (connection, read) timeouts.
        :type _request_timeout: int, tuple(int, int), optional
        :param _request_auth: set to override the auth_settings for an a single
                              request; this effectively ignores the
                              authentication in the spec for a single request.
        :type _request_auth: dict, optional
        :param _content_type: force content-type for the request.
        :type _content_type: str, Optional
        :param _headers: set to override the headers for a single
                         request; this effectively ignores the headers
                         in the spec for a single request.
        :type _headers: dict, optional
        :param _host_index: set to override the host_index for a single
                            request; this effectively ignores the host_index
                            in the spec for a single request.
        :type _host_index: int, optional
        :return: Returns the result object.
        """ # noqa: E501

        _param = self._user_availability_serialize(
            api_key=api_key,
            user_id=user_id,
            username=username,
            date_from=date_from,
            date_to=date_to,
            event_type_id=event_type_id,
            _request_auth=_request_auth,
            _content_type=_content_type,
            _headers=_headers,
            _host_index=_host_index
        )

        _response_types_map: Dict[str, Optional[str]] = {
            '200': "object",
            '401': None,
            '404': None,
        }
        response_data = self.api_client.call_api(
            *_param,
            _request_timeout=_request_timeout
        )
        return response_data.response


    def _user_availability_serialize(
        self,
        api_key,
        user_id,
        username,
        date_from,
        date_to,
        event_type_id,
        _request_auth,
        _content_type,
        _headers,
        _host_index,
    ) -> Tuple:

        _host = None

        _collection_formats: Dict[str, str] = {
            
        }

        _path_params: Dict[str, str] = {}
        _query_params: List[Tuple[str, str]] = []
        _header_params: Dict[str, Optional[str]] = _headers or {}
        _form_params: List[Tuple[str, str]] = []
        _files: Dict[str, str] = {}
        _body_params: Optional[bytes] = None

        # process the path parameters
        # process the query parameters
        if api_key is not None:
            
            _query_params.append(('apiKey', api_key))
            
        if user_id is not None:
            
            _query_params.append(('userId', user_id))
            
        if username is not None:
            
            _query_params.append(('username', username))
            
        if date_from is not None:
            if isinstance(date_from, date):
                _query_params.append(
                    (
                        'dateFrom',
                        date_from.strftime(
                            self.api_client.configuration.date_format
                        )
                    )
                )
            else:
                _query_params.append(('dateFrom', date_from))
            
        if date_to is not None:
            if isinstance(date_to, date):
                _query_params.append(
                    (
                        'dateTo',
                        date_to.strftime(
                            self.api_client.configuration.date_format
                        )
                    )
                )
            else:
                _query_params.append(('dateTo', date_to))
            
        if event_type_id is not None:
            
            _query_params.append(('eventTypeId', event_type_id))
            
        # process the header parameters
        # process the form parameters
        # process the body parameter


        # set the HTTP header `Accept`
        _header_params['Accept'] = self.api_client.select_header_accept(
            [
                'application/json'
            ]
        )


        # authentication setting
        _auth_settings: List[str] = [
            'ApiKeyAuth'
        ]

        return self.api_client.param_serialize(
            method='GET',
            resource_path='/availability',
            path_params=_path_params,
            query_params=_query_params,
            header_params=_header_params,
            body=_body_params,
            post_params=_form_params,
            files=_files,
            auth_settings=_auth_settings,
            collection_formats=_collection_formats,
            _host=_host,
            _request_auth=_request_auth
        )


