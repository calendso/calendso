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

from openapi_client.models.booking_payment_inner import BookingPaymentInner

class TestBookingPaymentInner(unittest.TestCase):
    """BookingPaymentInner unit test stubs"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def make_instance(self, include_optional) -> BookingPaymentInner:
        """Test BookingPaymentInner
            include_option is a boolean, when False only required
            params are included, when True both required and
            optional params are included """
        # uncomment below to create an instance of `BookingPaymentInner`
        """
        model = BookingPaymentInner()
        if include_optional:
            return BookingPaymentInner(
                id = 1,
                success = True,
                payment_option = 'ON_BOOKING'
            )
        else:
            return BookingPaymentInner(
        )
        """

    def testBookingPaymentInner(self):
        """Test BookingPaymentInner"""
        # inst_req_only = self.make_instance(include_optional=False)
        # inst_req_and_optional = self.make_instance(include_optional=True)

if __name__ == '__main__':
    unittest.main()
