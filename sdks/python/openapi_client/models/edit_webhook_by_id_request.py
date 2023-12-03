# coding: utf-8

"""
    @calcom/api: Public API for Cal.com

    No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

    The version of the OpenAPI document: 1.0.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


from __future__ import annotations
import pprint
import re  # noqa: F401
import json


from typing import Any, ClassVar, Dict, List, Optional, Union
from pydantic import BaseModel, StrictBool, StrictFloat, StrictInt, StrictStr, field_validator
from pydantic import Field
try:
    from typing import Self
except ImportError:
    from typing_extensions import Self

class EditWebhookByIdRequest(BaseModel):
    """
    EditWebhookByIdRequest
    """ # noqa: E501
    subscriber_url: Optional[StrictStr] = Field(default=None, description="The URL to subscribe to this webhook", alias="subscriberUrl")
    event_triggers: Optional[StrictStr] = Field(default=None, description="The events which should trigger this webhook call", alias="eventTriggers")
    active: Optional[StrictBool] = Field(default=None, description="Whether the webhook is active and should trigger on associated trigger events")
    payload_template: Optional[StrictStr] = Field(default=None, description="The template of the webhook's payload", alias="payloadTemplate")
    event_type_id: Optional[Union[StrictFloat, StrictInt]] = Field(default=None, description="The event type ID if this webhook should be associated with only that event type", alias="eventTypeId")
    secret: Optional[StrictStr] = Field(default=None, description="The secret to verify the authenticity of the received payload")
    __properties: ClassVar[List[str]] = ["subscriberUrl", "eventTriggers", "active", "payloadTemplate", "eventTypeId", "secret"]

    @field_validator('event_triggers')
    def event_triggers_validate_enum(cls, value):
        """Validates the enum"""
        if value is None:
            return value

        if value not in ('BOOKING_CREATED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED', 'MEETING_ENDED'):
            raise ValueError("must be one of enum values ('BOOKING_CREATED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED', 'MEETING_ENDED')")
        return value

    model_config = {
        "populate_by_name": True,
        "validate_assignment": True,
        "protected_namespaces": (),
    }


    def to_str(self) -> str:
        """Returns the string representation of the model using alias"""
        return pprint.pformat(self.model_dump(by_alias=True))

    def to_json(self) -> str:
        """Returns the JSON representation of the model using alias"""
        # TODO: pydantic v2: use .model_dump_json(by_alias=True, exclude_unset=True) instead
        return json.dumps(self.to_dict())

    @classmethod
    def from_json(cls, json_str: str) -> Self:
        """Create an instance of EditWebhookByIdRequest from a JSON string"""
        return cls.from_dict(json.loads(json_str))

    def to_dict(self) -> Dict[str, Any]:
        """Return the dictionary representation of the model using alias.

        This has the following differences from calling pydantic's
        `self.model_dump(by_alias=True)`:

        * `None` is only added to the output dict for nullable fields that
          were set at model initialization. Other fields with value `None`
          are ignored.
        """
        _dict = self.model_dump(
            by_alias=True,
            exclude={
            },
            exclude_none=True,
        )
        return _dict

    @classmethod
    def from_dict(cls, obj: Dict) -> Self:
        """Create an instance of EditWebhookByIdRequest from a dict"""
        if obj is None:
            return None

        if not isinstance(obj, dict):
            return cls.model_validate(obj)

        _obj = cls.model_validate({
            "subscriberUrl": obj.get("subscriberUrl"),
            "eventTriggers": obj.get("eventTriggers"),
            "active": obj.get("active"),
            "payloadTemplate": obj.get("payloadTemplate"),
            "eventTypeId": obj.get("eventTypeId"),
            "secret": obj.get("secret")
        })
        return _obj


