/*
@calcom/api: Public API for Cal.com

No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

API version: 1.0.0
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package openapi

import (
	"encoding/json"
	"fmt"
)

// checks if the CustomInputsPostRequest type satisfies the MappedNullable interface at compile time
var _ MappedNullable = &CustomInputsPostRequest{}

// CustomInputsPostRequest struct for CustomInputsPostRequest
type CustomInputsPostRequest struct {
	// ID of the event type to which the custom input is being added
	EventTypeId int32 `json:"eventTypeId"`
	// Label of the custom input
	Label string `json:"label"`
	// Type of the custom input. The value is ENUM; one of [TEXT, TEXTLONG, NUMBER, BOOL, RADIO, PHONE]
	Type string `json:"type"`
	Options *CustomInputsPostRequestOptions `json:"options,omitempty"`
	// If the custom input is required before booking
	Required bool `json:"required"`
	// Placeholder text for the custom input
	Placeholder string `json:"placeholder"`
}

type _CustomInputsPostRequest CustomInputsPostRequest

// NewCustomInputsPostRequest instantiates a new CustomInputsPostRequest object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewCustomInputsPostRequest(eventTypeId int32, label string, type_ string, required bool, placeholder string) *CustomInputsPostRequest {
	this := CustomInputsPostRequest{}
	this.EventTypeId = eventTypeId
	this.Label = label
	this.Type = type_
	this.Required = required
	this.Placeholder = placeholder
	return &this
}

// NewCustomInputsPostRequestWithDefaults instantiates a new CustomInputsPostRequest object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewCustomInputsPostRequestWithDefaults() *CustomInputsPostRequest {
	this := CustomInputsPostRequest{}
	return &this
}

// GetEventTypeId returns the EventTypeId field value
func (o *CustomInputsPostRequest) GetEventTypeId() int32 {
	if o == nil {
		var ret int32
		return ret
	}

	return o.EventTypeId
}

// GetEventTypeIdOk returns a tuple with the EventTypeId field value
// and a boolean to check if the value has been set.
func (o *CustomInputsPostRequest) GetEventTypeIdOk() (*int32, bool) {
	if o == nil {
		return nil, false
	}
	return &o.EventTypeId, true
}

// SetEventTypeId sets field value
func (o *CustomInputsPostRequest) SetEventTypeId(v int32) {
	o.EventTypeId = v
}

// GetLabel returns the Label field value
func (o *CustomInputsPostRequest) GetLabel() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.Label
}

// GetLabelOk returns a tuple with the Label field value
// and a boolean to check if the value has been set.
func (o *CustomInputsPostRequest) GetLabelOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.Label, true
}

// SetLabel sets field value
func (o *CustomInputsPostRequest) SetLabel(v string) {
	o.Label = v
}

// GetType returns the Type field value
func (o *CustomInputsPostRequest) GetType() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.Type
}

// GetTypeOk returns a tuple with the Type field value
// and a boolean to check if the value has been set.
func (o *CustomInputsPostRequest) GetTypeOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.Type, true
}

// SetType sets field value
func (o *CustomInputsPostRequest) SetType(v string) {
	o.Type = v
}

// GetOptions returns the Options field value if set, zero value otherwise.
func (o *CustomInputsPostRequest) GetOptions() CustomInputsPostRequestOptions {
	if o == nil || IsNil(o.Options) {
		var ret CustomInputsPostRequestOptions
		return ret
	}
	return *o.Options
}

// GetOptionsOk returns a tuple with the Options field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *CustomInputsPostRequest) GetOptionsOk() (*CustomInputsPostRequestOptions, bool) {
	if o == nil || IsNil(o.Options) {
		return nil, false
	}
	return o.Options, true
}

// HasOptions returns a boolean if a field has been set.
func (o *CustomInputsPostRequest) HasOptions() bool {
	if o != nil && !IsNil(o.Options) {
		return true
	}

	return false
}

// SetOptions gets a reference to the given CustomInputsPostRequestOptions and assigns it to the Options field.
func (o *CustomInputsPostRequest) SetOptions(v CustomInputsPostRequestOptions) {
	o.Options = &v
}

// GetRequired returns the Required field value
func (o *CustomInputsPostRequest) GetRequired() bool {
	if o == nil {
		var ret bool
		return ret
	}

	return o.Required
}

// GetRequiredOk returns a tuple with the Required field value
// and a boolean to check if the value has been set.
func (o *CustomInputsPostRequest) GetRequiredOk() (*bool, bool) {
	if o == nil {
		return nil, false
	}
	return &o.Required, true
}

// SetRequired sets field value
func (o *CustomInputsPostRequest) SetRequired(v bool) {
	o.Required = v
}

// GetPlaceholder returns the Placeholder field value
func (o *CustomInputsPostRequest) GetPlaceholder() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.Placeholder
}

// GetPlaceholderOk returns a tuple with the Placeholder field value
// and a boolean to check if the value has been set.
func (o *CustomInputsPostRequest) GetPlaceholderOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.Placeholder, true
}

// SetPlaceholder sets field value
func (o *CustomInputsPostRequest) SetPlaceholder(v string) {
	o.Placeholder = v
}

func (o CustomInputsPostRequest) MarshalJSON() ([]byte, error) {
	toSerialize,err := o.ToMap()
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(toSerialize)
}

func (o CustomInputsPostRequest) ToMap() (map[string]interface{}, error) {
	toSerialize := map[string]interface{}{}
	toSerialize["eventTypeId"] = o.EventTypeId
	toSerialize["label"] = o.Label
	toSerialize["type"] = o.Type
	if !IsNil(o.Options) {
		toSerialize["options"] = o.Options
	}
	toSerialize["required"] = o.Required
	toSerialize["placeholder"] = o.Placeholder
	return toSerialize, nil
}

func (o *CustomInputsPostRequest) UnmarshalJSON(bytes []byte) (err error) {
    // This validates that all required properties are included in the JSON object
	// by unmarshalling the object into a generic map with string keys and checking
	// that every required field exists as a key in the generic map.
	requiredProperties := []string{
		"eventTypeId",
		"label",
		"type",
		"required",
		"placeholder",
	}

	allProperties := make(map[string]interface{})

	err = json.Unmarshal(bytes, &allProperties)

	if err != nil {
		return err;
	}

	for _, requiredProperty := range(requiredProperties) {
		if _, exists := allProperties[requiredProperty]; !exists {
			return fmt.Errorf("no value given for required property %v", requiredProperty)
		}
	}

	varCustomInputsPostRequest := _CustomInputsPostRequest{}

	err = json.Unmarshal(bytes, &varCustomInputsPostRequest)

	if err != nil {
		return err
	}

	*o = CustomInputsPostRequest(varCustomInputsPostRequest)

	return err
}

type NullableCustomInputsPostRequest struct {
	value *CustomInputsPostRequest
	isSet bool
}

func (v NullableCustomInputsPostRequest) Get() *CustomInputsPostRequest {
	return v.value
}

func (v *NullableCustomInputsPostRequest) Set(val *CustomInputsPostRequest) {
	v.value = val
	v.isSet = true
}

func (v NullableCustomInputsPostRequest) IsSet() bool {
	return v.isSet
}

func (v *NullableCustomInputsPostRequest) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableCustomInputsPostRequest(val *CustomInputsPostRequest) *NullableCustomInputsPostRequest {
	return &NullableCustomInputsPostRequest{value: val, isSet: true}
}

func (v NullableCustomInputsPostRequest) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableCustomInputsPostRequest) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


