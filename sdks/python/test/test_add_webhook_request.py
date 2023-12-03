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

from openapi_client.models.add_webhook_request import AddWebhookRequest

class TestAddWebhookRequest(unittest.TestCase):
    """AddWebhookRequest unit test stubs"""

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def make_instance(self, include_optional) -> AddWebhookRequest:
        """Test AddWebhookRequest
            include_option is a boolean, when False only required
            params are included, when True both required and
            optional params are included """
        # uncomment below to create an instance of `AddWebhookRequest`
        """
        model = AddWebhookRequest()
        if include_optional:
            return AddWebhookRequest(
                subscriber_url = '',
                event_triggers = 'BOOKING_CREATED',
                active = True,
                payload_template = '',
                event_type_id = 1.337,
                secret = ''
            )
        else:
            return AddWebhookRequest(
                subscriber_url = '',
                event_triggers = 'BOOKING_CREATED',
                active = True,
        )
        """

    def testAddWebhookRequest(self):
        """Test AddWebhookRequest"""
        # inst_req_only = self.make_instance(include_optional=False)
        # inst_req_and_optional = self.make_instance(include_optional=True)

if __name__ == '__main__':
    unittest.main()
