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


from typing import Any, ClassVar, Dict, List, Optional
from pydantic import BaseModel, StrictBool, StrictStr
from pydantic import Field
try:
    from typing import Self
except ImportError:
    from typing_extensions import Self

class EditUserByIdRequest(BaseModel):
    """
    EditUserByIdRequest
    """ # noqa: E501
    email: Optional[StrictStr] = Field(default=None, description="Email that belongs to the user being edited")
    username: Optional[StrictStr] = Field(default=None, description="Username for the user being edited")
    brand_color: Optional[StrictStr] = Field(default=None, description="The user's brand color", alias="brandColor")
    dark_brand_color: Optional[StrictStr] = Field(default=None, description="The user's brand color for dark mode", alias="darkBrandColor")
    week_start: Optional[StrictStr] = Field(default=None, description="Start of the week. Acceptable values are one of [SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY]", alias="weekStart")
    time_zone: Optional[StrictStr] = Field(default=None, description="The user's time zone", alias="timeZone")
    hide_branding: Optional[StrictBool] = Field(default=None, description="Remove branding from the user's calendar page", alias="hideBranding")
    theme: Optional[StrictStr] = Field(default=None, description="Default theme for the user. Acceptable values are one of [DARK, LIGHT]")
    time_format: Optional[StrictStr] = Field(default=None, description="The user's time format. Acceptable values are one of [TWELVE, TWENTY_FOUR]", alias="timeFormat")
    locale: Optional[StrictStr] = Field(default=None, description="The user's locale. Acceptable values are one of [EN, FR, IT, RU, ES, DE, PT, RO, NL, PT_BR, ES_419, KO, JA, PL, AR, IW, ZH_CH, ZH_TW, CS, SR, SV, VI]")
    avatar: Optional[StrictStr] = Field(default=None, description="The user's avatar, in base64 format")
    __properties: ClassVar[List[str]] = ["email", "username", "brandColor", "darkBrandColor", "weekStart", "timeZone", "hideBranding", "theme", "timeFormat", "locale", "avatar"]

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
        """Create an instance of EditUserByIdRequest from a JSON string"""
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
        """Create an instance of EditUserByIdRequest from a dict"""
        if obj is None:
            return None

        if not isinstance(obj, dict):
            return cls.model_validate(obj)

        _obj = cls.model_validate({
            "email": obj.get("email"),
            "username": obj.get("username"),
            "brandColor": obj.get("brandColor"),
            "darkBrandColor": obj.get("darkBrandColor"),
            "weekStart": obj.get("weekStart"),
            "timeZone": obj.get("timeZone"),
            "hideBranding": obj.get("hideBranding"),
            "theme": obj.get("theme"),
            "timeFormat": obj.get("timeFormat"),
            "locale": obj.get("locale"),
            "avatar": obj.get("avatar")
        })
        return _obj


