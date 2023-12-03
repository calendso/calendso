/*
@calcom/api: Public API for Cal.com

No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)

API version: 1.0.0
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package openapi

import (
	"encoding/json"
)

// checks if the EditScheduleByIdRequest type satisfies the MappedNullable interface at compile time
var _ MappedNullable = &EditScheduleByIdRequest{}

// EditScheduleByIdRequest struct for EditScheduleByIdRequest
type EditScheduleByIdRequest struct {
	// Name of the schedule
	Name *string `json:"name,omitempty"`
	// The timezone for this schedule
	TimeZone *string `json:"timeZone,omitempty"`
}

// NewEditScheduleByIdRequest instantiates a new EditScheduleByIdRequest object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewEditScheduleByIdRequest() *EditScheduleByIdRequest {
	this := EditScheduleByIdRequest{}
	return &this
}

// NewEditScheduleByIdRequestWithDefaults instantiates a new EditScheduleByIdRequest object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewEditScheduleByIdRequestWithDefaults() *EditScheduleByIdRequest {
	this := EditScheduleByIdRequest{}
	return &this
}

// GetName returns the Name field value if set, zero value otherwise.
func (o *EditScheduleByIdRequest) GetName() string {
	if o == nil || IsNil(o.Name) {
		var ret string
		return ret
	}
	return *o.Name
}

// GetNameOk returns a tuple with the Name field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EditScheduleByIdRequest) GetNameOk() (*string, bool) {
	if o == nil || IsNil(o.Name) {
		return nil, false
	}
	return o.Name, true
}

// HasName returns a boolean if a field has been set.
func (o *EditScheduleByIdRequest) HasName() bool {
	if o != nil && !IsNil(o.Name) {
		return true
	}

	return false
}

// SetName gets a reference to the given string and assigns it to the Name field.
func (o *EditScheduleByIdRequest) SetName(v string) {
	o.Name = &v
}

// GetTimeZone returns the TimeZone field value if set, zero value otherwise.
func (o *EditScheduleByIdRequest) GetTimeZone() string {
	if o == nil || IsNil(o.TimeZone) {
		var ret string
		return ret
	}
	return *o.TimeZone
}

// GetTimeZoneOk returns a tuple with the TimeZone field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EditScheduleByIdRequest) GetTimeZoneOk() (*string, bool) {
	if o == nil || IsNil(o.TimeZone) {
		return nil, false
	}
	return o.TimeZone, true
}

// HasTimeZone returns a boolean if a field has been set.
func (o *EditScheduleByIdRequest) HasTimeZone() bool {
	if o != nil && !IsNil(o.TimeZone) {
		return true
	}

	return false
}

// SetTimeZone gets a reference to the given string and assigns it to the TimeZone field.
func (o *EditScheduleByIdRequest) SetTimeZone(v string) {
	o.TimeZone = &v
}

func (o EditScheduleByIdRequest) MarshalJSON() ([]byte, error) {
	toSerialize,err := o.ToMap()
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(toSerialize)
}

func (o EditScheduleByIdRequest) ToMap() (map[string]interface{}, error) {
	toSerialize := map[string]interface{}{}
	if !IsNil(o.Name) {
		toSerialize["name"] = o.Name
	}
	if !IsNil(o.TimeZone) {
		toSerialize["timeZone"] = o.TimeZone
	}
	return toSerialize, nil
}

type NullableEditScheduleByIdRequest struct {
	value *EditScheduleByIdRequest
	isSet bool
}

func (v NullableEditScheduleByIdRequest) Get() *EditScheduleByIdRequest {
	return v.value
}

func (v *NullableEditScheduleByIdRequest) Set(val *EditScheduleByIdRequest) {
	v.value = val
	v.isSet = true
}

func (v NullableEditScheduleByIdRequest) IsSet() bool {
	return v.isSet
}

func (v *NullableEditScheduleByIdRequest) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableEditScheduleByIdRequest(val *EditScheduleByIdRequest) *NullableEditScheduleByIdRequest {
	return &NullableEditScheduleByIdRequest{value: val, isSet: true}
}

func (v NullableEditScheduleByIdRequest) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableEditScheduleByIdRequest) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


