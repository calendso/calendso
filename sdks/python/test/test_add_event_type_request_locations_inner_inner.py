# coding: utf-8

"""
    @calcom/api: Public API for Cal.com

    No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

    The version of the OpenAPI document: 1.0.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


import unittest
import datetime

from openapi_client.models.add_event_type_request_locations_inner_inner import AddEventTypeRequestLocationsInnerInner

class TestAddEventTypeRequestLocationsInnerInner(unittest.TestCase):
    """AddEventTypeRequestLocationsInnerInner unit test stubs"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def make_instance(self, include_optional) -> AddEventTypeRequestLocationsInnerInner:
        """Test AddEventTypeRequestLocationsInnerInner
            include_option is a boolean, when False only required
            params are included, when True both required and
            optional params are included """
        # uncomment below to create an instance of `AddEventTypeRequestLocationsInnerInner`
        """
        model = AddEventTypeRequestLocationsInnerInner()
        if include_optional:
            return AddEventTypeRequestLocationsInnerInner(
                type = 'integrations:daily',
                address = '',
                display_location_publicly = True,
                link = ''
            )
        else:
            return AddEventTypeRequestLocationsInnerInner(
        )
        """

    def testAddEventTypeRequestLocationsInnerInner(self):
        """Test AddEventTypeRequestLocationsInnerInner"""
        # inst_req_only = self.make_instance(include_optional=False)
        # inst_req_and_optional = self.make_instance(include_optional=True)

if __name__ == '__main__':
    unittest.main()
