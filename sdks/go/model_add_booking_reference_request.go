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

// checks if the AddBookingReferenceRequest type satisfies the MappedNullable interface at compile time
var _ MappedNullable = &AddBookingReferenceRequest{}

// AddBookingReferenceRequest struct for AddBookingReferenceRequest
type AddBookingReferenceRequest struct {
	Type string `json:"type"`
	Uid string `json:"uid"`
	MeetingId *string `json:"meetingId,omitempty"`
	MeetingPassword *string `json:"meetingPassword,omitempty"`
	MeetingUrl *string `json:"meetingUrl,omitempty"`
	BookingId *bool `json:"bookingId,omitempty"`
	ExternalCalendarId *string `json:"externalCalendarId,omitempty"`
	Deleted *bool `json:"deleted,omitempty"`
	CredentialId *int32 `json:"credentialId,omitempty"`
}

type _AddBookingReferenceRequest AddBookingReferenceRequest

// NewAddBookingReferenceRequest instantiates a new AddBookingReferenceRequest object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewAddBookingReferenceRequest(type_ string, uid string) *AddBookingReferenceRequest {
	this := AddBookingReferenceRequest{}
	this.Type = type_
	this.Uid = uid
	return &this
}

// NewAddBookingReferenceRequestWithDefaults instantiates a new AddBookingReferenceRequest object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewAddBookingReferenceRequestWithDefaults() *AddBookingReferenceRequest {
	this := AddBookingReferenceRequest{}
	return &this
}

// GetType returns the Type field value
func (o *AddBookingReferenceRequest) GetType() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.Type
}

// GetTypeOk returns a tuple with the Type field value
// and a boolean to check if the value has been set.
func (o *AddBookingReferenceRequest) GetTypeOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.Type, true
}

// SetType sets field value
func (o *AddBookingReferenceRequest) SetType(v string) {
	o.Type = v
}

// GetUid returns the Uid field value
func (o *AddBookingReferenceRequest) GetUid() string {
	if o == nil {
		var ret string
		return ret
	}

	return o.Uid
}

// GetUidOk returns a tuple with the Uid field value
// and a boolean to check if the value has been set.
func (o *AddBookingReferenceRequest) GetUidOk() (*string, bool) {
	if o == nil {
		return nil, false
	}
	return &o.Uid, true
}

// SetUid sets field value
func (o *AddBookingReferenceRequest) SetUid(v string) {
	o.Uid = v
}

// GetMeetingId returns the MeetingId field value if set, zero value otherwise.
func (o *AddBookingReferenceRequest) GetMeetingId() string {
	if o == nil || IsNil(o.MeetingId) {
		var ret string
		return ret
	}
	return *o.MeetingId
}

// GetMeetingIdOk returns a tuple with the MeetingId field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *AddBookingReferenceRequest) GetMeetingIdOk() (*string, bool) {
	if o == nil || IsNil(o.MeetingId) {
		return nil, false
	}
	return o.MeetingId, true
}

// HasMeetingId returns a boolean if a field has been set.
func (o *AddBookingReferenceRequest) HasMeetingId() bool {
	if o != nil && !IsNil(o.MeetingId) {
		return true
	}

	return false
}

// SetMeetingId gets a reference to the given string and assigns it to the MeetingId field.
func (o *AddBookingReferenceRequest) SetMeetingId(v string) {
	o.MeetingId = &v
}

// GetMeetingPassword returns the MeetingPassword field value if set, zero value otherwise.
func (o *AddBookingReferenceRequest) GetMeetingPassword() string {
	if o == nil || IsNil(o.MeetingPassword) {
		var ret string
		return ret
	}
	return *o.MeetingPassword
}

// GetMeetingPasswordOk returns a tuple with the MeetingPassword field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *AddBookingReferenceRequest) GetMeetingPasswordOk() (*string, bool) {
	if o == nil || IsNil(o.MeetingPassword) {
		return nil, false
	}
	return o.MeetingPassword, true
}

// HasMeetingPassword returns a boolean if a field has been set.
func (o *AddBookingReferenceRequest) HasMeetingPassword() bool {
	if o != nil && !IsNil(o.MeetingPassword) {
		return true
	}

	return false
}

// SetMeetingPassword gets a reference to the given string and assigns it to the MeetingPassword field.
func (o *AddBookingReferenceRequest) SetMeetingPassword(v string) {
	o.MeetingPassword = &v
}

// GetMeetingUrl returns the MeetingUrl field value if set, zero value otherwise.
func (o *AddBookingReferenceRequest) GetMeetingUrl() string {
	if o == nil || IsNil(o.MeetingUrl) {
		var ret string
		return ret
	}
	return *o.MeetingUrl
}

// GetMeetingUrlOk returns a tuple with the MeetingUrl field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *AddBookingReferenceRequest) GetMeetingUrlOk() (*string, bool) {
	if o == nil || IsNil(o.MeetingUrl) {
		return nil, false
	}
	return o.MeetingUrl, true
}

// HasMeetingUrl returns a boolean if a field has been set.
func (o *AddBookingReferenceRequest) HasMeetingUrl() bool {
	if o != nil && !IsNil(o.MeetingUrl) {
		return true
	}

	return false
}

// SetMeetingUrl gets a reference to the given string and assigns it to the MeetingUrl field.
func (o *AddBookingReferenceRequest) SetMeetingUrl(v string) {
	o.MeetingUrl = &v
}

// GetBookingId returns the BookingId field value if set, zero value otherwise.
func (o *AddBookingReferenceRequest) GetBookingId() bool {
	if o == nil || IsNil(o.BookingId) {
		var ret bool
		return ret
	}
	return *o.BookingId
}

// GetBookingIdOk returns a tuple with the BookingId field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *AddBookingReferenceRequest) GetBookingIdOk() (*bool, bool) {
	if o == nil || IsNil(o.BookingId) {
		return nil, false
	}
	return o.BookingId, true
}

// HasBookingId returns a boolean if a field has been set.
func (o *AddBookingReferenceRequest) HasBookingId() bool {
	if o != nil && !IsNil(o.BookingId) {
		return true
	}

	return false
}

// SetBookingId gets a reference to the given bool and assigns it to the BookingId field.
func (o *AddBookingReferenceRequest) SetBookingId(v bool) {
	o.BookingId = &v
}

// GetExternalCalendarId returns the ExternalCalendarId field value if set, zero value otherwise.
func (o *AddBookingReferenceRequest) GetExternalCalendarId() string {
	if o == nil || IsNil(o.ExternalCalendarId) {
		var ret string
		return ret
	}
	return *o.ExternalCalendarId
}

// GetExternalCalendarIdOk returns a tuple with the ExternalCalendarId field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *AddBookingReferenceRequest) GetExternalCalendarIdOk() (*string, bool) {
	if o == nil || IsNil(o.ExternalCalendarId) {
		return nil, false
	}
	return o.ExternalCalendarId, true
}

// HasExternalCalendarId returns a boolean if a field has been set.
func (o *AddBookingReferenceRequest) HasExternalCalendarId() bool {
	if o != nil && !IsNil(o.ExternalCalendarId) {
		return true
	}

	return false
}

// SetExternalCalendarId gets a reference to the given string and assigns it to the ExternalCalendarId field.
func (o *AddBookingReferenceRequest) SetExternalCalendarId(v string) {
	o.ExternalCalendarId = &v
}

// GetDeleted returns the Deleted field value if set, zero value otherwise.
func (o *AddBookingReferenceRequest) GetDeleted() bool {
	if o == nil || IsNil(o.Deleted) {
		var ret bool
		return ret
	}
	return *o.Deleted
}

// GetDeletedOk returns a tuple with the Deleted field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *AddBookingReferenceRequest) GetDeletedOk() (*bool, bool) {
	if o == nil || IsNil(o.Deleted) {
		return nil, false
	}
	return o.Deleted, true
}

// HasDeleted returns a boolean if a field has been set.
func (o *AddBookingReferenceRequest) HasDeleted() bool {
	if o != nil && !IsNil(o.Deleted) {
		return true
	}

	return false
}

// SetDeleted gets a reference to the given bool and assigns it to the Deleted field.
func (o *AddBookingReferenceRequest) SetDeleted(v bool) {
	o.Deleted = &v
}

// GetCredentialId returns the CredentialId field value if set, zero value otherwise.
func (o *AddBookingReferenceRequest) GetCredentialId() int32 {
	if o == nil || IsNil(o.CredentialId) {
		var ret int32
		return ret
	}
	return *o.CredentialId
}

// GetCredentialIdOk returns a tuple with the CredentialId field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *AddBookingReferenceRequest) GetCredentialIdOk() (*int32, bool) {
	if o == nil || IsNil(o.CredentialId) {
		return nil, false
	}
	return o.CredentialId, true
}

// HasCredentialId returns a boolean if a field has been set.
func (o *AddBookingReferenceRequest) HasCredentialId() bool {
	if o != nil && !IsNil(o.CredentialId) {
		return true
	}

	return false
}

// SetCredentialId gets a reference to the given int32 and assigns it to the CredentialId field.
func (o *AddBookingReferenceRequest) SetCredentialId(v int32) {
	o.CredentialId = &v
}

func (o AddBookingReferenceRequest) MarshalJSON() ([]byte, error) {
	toSerialize,err := o.ToMap()
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(toSerialize)
}

func (o AddBookingReferenceRequest) ToMap() (map[string]interface{}, error) {
	toSerialize := map[string]interface{}{}
	toSerialize["type"] = o.Type
	toSerialize["uid"] = o.Uid
	if !IsNil(o.MeetingId) {
		toSerialize["meetingId"] = o.MeetingId
	}
	if !IsNil(o.MeetingPassword) {
		toSerialize["meetingPassword"] = o.MeetingPassword
	}
	if !IsNil(o.MeetingUrl) {
		toSerialize["meetingUrl"] = o.MeetingUrl
	}
	if !IsNil(o.BookingId) {
		toSerialize["bookingId"] = o.BookingId
	}
	if !IsNil(o.ExternalCalendarId) {
		toSerialize["externalCalendarId"] = o.ExternalCalendarId
	}
	if !IsNil(o.Deleted) {
		toSerialize["deleted"] = o.Deleted
	}
	if !IsNil(o.CredentialId) {
		toSerialize["credentialId"] = o.CredentialId
	}
	return toSerialize, nil
}

func (o *AddBookingReferenceRequest) UnmarshalJSON(bytes []byte) (err error) {
    // This validates that all required properties are included in the JSON object
	// by unmarshalling the object into a generic map with string keys and checking
	// that every required field exists as a key in the generic map.
	requiredProperties := []string{
		"type",
		"uid",
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

	varAddBookingReferenceRequest := _AddBookingReferenceRequest{}

	err = json.Unmarshal(bytes, &varAddBookingReferenceRequest)

	if err != nil {
		return err
	}

	*o = AddBookingReferenceRequest(varAddBookingReferenceRequest)

	return err
}

type NullableAddBookingReferenceRequest struct {
	value *AddBookingReferenceRequest
	isSet bool
}

func (v NullableAddBookingReferenceRequest) Get() *AddBookingReferenceRequest {
	return v.value
}

func (v *NullableAddBookingReferenceRequest) Set(val *AddBookingReferenceRequest) {
	v.value = val
	v.isSet = true
}

func (v NullableAddBookingReferenceRequest) IsSet() bool {
	return v.isSet
}

func (v *NullableAddBookingReferenceRequest) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableAddBookingReferenceRequest(val *AddBookingReferenceRequest) *NullableAddBookingReferenceRequest {
	return &NullableAddBookingReferenceRequest{value: val, isSet: true}
}

func (v NullableAddBookingReferenceRequest) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableAddBookingReferenceRequest) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


