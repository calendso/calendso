# coding: utf-8

"""
    @calcom/api: Public API for Cal.com

    No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

    The version of the OpenAPI document: 1.0.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


import unittest

from openapi_client.api.payments_api import PaymentsApi


class TestPaymentsApi(unittest.TestCase):
    """PaymentsApi unit test stubs"""

    def setUp(self) -> None:
        self.api = PaymentsApi()

    def tearDown(self) -> None:
        pass

    def test_payments_get(self) -> None:
        """Test case for payments_get

        Find all payments
        """
        pass

    def test_payments_id_get(self) -> None:
        """Test case for payments_id_get

        Find a payment
        """
        pass


if __name__ == '__main__':
    unittest.main()
