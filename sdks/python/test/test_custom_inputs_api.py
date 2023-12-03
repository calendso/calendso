# coding: utf-8

"""
    @calcom/api: Public API for Cal.com

    No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

    The version of the OpenAPI document: 1.0.0
    Generated by OpenAPI Generator (https://openapi-generator.tech)

    Do not edit the class manually.
"""  # noqa: E501


import unittest

from openapi_client.api.custom_inputs_api import CustomInputsApi


class TestCustomInputsApi(unittest.TestCase):
    """CustomInputsApi unit test stubs"""

    def setUp(self) -> None:
        self.api = CustomInputsApi()

    def tearDown(self) -> None:
        pass

    def test_custom_inputs_get(self) -> None:
        """Test case for custom_inputs_get

        Find all eventTypeCustomInputs
        """
        pass

    def test_custom_inputs_id_delete(self) -> None:
        """Test case for custom_inputs_id_delete

        Remove an existing eventTypeCustomInput
        """
        pass

    def test_custom_inputs_id_get(self) -> None:
        """Test case for custom_inputs_id_get

        Find a eventTypeCustomInput
        """
        pass

    def test_custom_inputs_id_patch(self) -> None:
        """Test case for custom_inputs_id_patch

        Edit an existing eventTypeCustomInput
        """
        pass

    def test_custom_inputs_post(self) -> None:
        """Test case for custom_inputs_post

        Creates a new eventTypeCustomInput
        """
        pass


if __name__ == '__main__':
    unittest.main()
