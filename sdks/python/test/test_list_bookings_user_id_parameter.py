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

from openapi_client.models.list_bookings_user_id_parameter import ListBookingsUserIdParameter

class TestListBookingsUserIdParameter(unittest.TestCase):
    """ListBookingsUserIdParameter unit test stubs"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def make_instance(self, include_optional) -> ListBookingsUserIdParameter:
        """Test ListBookingsUserIdParameter
            include_option is a boolean, when False only required
            params are included, when True both required and
            optional params are included """
        # uncomment below to create an instance of `ListBookingsUserIdParameter`
        """
        model = ListBookingsUserIdParameter()
        if include_optional:
            return ListBookingsUserIdParameter(
            )
        else:
            return ListBookingsUserIdParameter(
        )
        """

    def testListBookingsUserIdParameter(self):
        """Test ListBookingsUserIdParameter"""
        # inst_req_only = self.make_instance(include_optional=False)
        # inst_req_and_optional = self.make_instance(include_optional=True)

if __name__ == '__main__':
    unittest.main()
