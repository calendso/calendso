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

// checks if the EditUserByIdRequest type satisfies the MappedNullable interface at compile time
var _ MappedNullable = &EditUserByIdRequest{}

// EditUserByIdRequest struct for EditUserByIdRequest
type EditUserByIdRequest struct {
	// Email that belongs to the user being edited
	Email *string `json:"email,omitempty"`
	// Username for the user being edited
	Username *string `json:"username,omitempty"`
	// The user's brand color
	BrandColor *string `json:"brandColor,omitempty"`
	// The user's brand color for dark mode
	DarkBrandColor *string `json:"darkBrandColor,omitempty"`
	// Start of the week. Acceptable values are one of [SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY]
	WeekStart *string `json:"weekStart,omitempty"`
	// The user's time zone
	TimeZone *string `json:"timeZone,omitempty"`
	// Remove branding from the user's calendar page
	HideBranding *bool `json:"hideBranding,omitempty"`
	// Default theme for the user. Acceptable values are one of [DARK, LIGHT]
	Theme *string `json:"theme,omitempty"`
	// The user's time format. Acceptable values are one of [TWELVE, TWENTY_FOUR]
	TimeFormat *string `json:"timeFormat,omitempty"`
	// The user's locale. Acceptable values are one of [EN, FR, IT, RU, ES, DE, PT, RO, NL, PT_BR, ES_419, KO, JA, PL, AR, IW, ZH_CH, ZH_TW, CS, SR, SV, VI]
	Locale *string `json:"locale,omitempty"`
	// The user's avatar, in base64 format
	Avatar *string `json:"avatar,omitempty"`
}

// NewEditUserByIdRequest instantiates a new EditUserByIdRequest object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewEditUserByIdRequest() *EditUserByIdRequest {
	this := EditUserByIdRequest{}
	return &this
}

// NewEditUserByIdRequestWithDefaults instantiates a new EditUserByIdRequest object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewEditUserByIdRequestWithDefaults() *EditUserByIdRequest {
	this := EditUserByIdRequest{}
	return &this
}

// GetEmail returns the Email field value if set, zero value otherwise.
func (o *EditUserByIdRequest) GetEmail() string {
	if o == nil || IsNil(o.Email) {
		var ret string
		return ret
	}
	return *o.Email
}

// GetEmailOk returns a tuple with the Email field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EditUserByIdRequest) GetEmailOk() (*string, bool) {
	if o == nil || IsNil(o.Email) {
		return nil, false
	}
	return o.Email, true
}

// HasEmail returns a boolean if a field has been set.
func (o *EditUserByIdRequest) HasEmail() bool {
	if o != nil && !IsNil(o.Email) {
		return true
	}

	return false
}

// SetEmail gets a reference to the given string and assigns it to the Email field.
func (o *EditUserByIdRequest) SetEmail(v string) {
	o.Email = &v
}

// GetUsername returns the Username field value if set, zero value otherwise.
func (o *EditUserByIdRequest) GetUsername() string {
	if o == nil || IsNil(o.Username) {
		var ret string
		return ret
	}
	return *o.Username
}

// GetUsernameOk returns a tuple with the Username field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EditUserByIdRequest) GetUsernameOk() (*string, bool) {
	if o == nil || IsNil(o.Username) {
		return nil, false
	}
	return o.Username, true
}

// HasUsername returns a boolean if a field has been set.
func (o *EditUserByIdRequest) HasUsername() bool {
	if o != nil && !IsNil(o.Username) {
		return true
	}

	return false
}

// SetUsername gets a reference to the given string and assigns it to the Username field.
func (o *EditUserByIdRequest) SetUsername(v string) {
	o.Username = &v
}

// GetBrandColor returns the BrandColor field value if set, zero value otherwise.
func (o *EditUserByIdRequest) GetBrandColor() string {
	if o == nil || IsNil(o.BrandColor) {
		var ret string
		return ret
	}
	return *o.BrandColor
}

// GetBrandColorOk returns a tuple with the BrandColor field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EditUserByIdRequest) GetBrandColorOk() (*string, bool) {
	if o == nil || IsNil(o.BrandColor) {
		return nil, false
	}
	return o.BrandColor, true
}

// HasBrandColor returns a boolean if a field has been set.
func (o *EditUserByIdRequest) HasBrandColor() bool {
	if o != nil && !IsNil(o.BrandColor) {
		return true
	}

	return false
}

// SetBrandColor gets a reference to the given string and assigns it to the BrandColor field.
func (o *EditUserByIdRequest) SetBrandColor(v string) {
	o.BrandColor = &v
}

// GetDarkBrandColor returns the DarkBrandColor field value if set, zero value otherwise.
func (o *EditUserByIdRequest) GetDarkBrandColor() string {
	if o == nil || IsNil(o.DarkBrandColor) {
		var ret string
		return ret
	}
	return *o.DarkBrandColor
}

// GetDarkBrandColorOk returns a tuple with the DarkBrandColor field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EditUserByIdRequest) GetDarkBrandColorOk() (*string, bool) {
	if o == nil || IsNil(o.DarkBrandColor) {
		return nil, false
	}
	return o.DarkBrandColor, true
}

// HasDarkBrandColor returns a boolean if a field has been set.
func (o *EditUserByIdRequest) HasDarkBrandColor() bool {
	if o != nil && !IsNil(o.DarkBrandColor) {
		return true
	}

	return false
}

// SetDarkBrandColor gets a reference to the given string and assigns it to the DarkBrandColor field.
func (o *EditUserByIdRequest) SetDarkBrandColor(v string) {
	o.DarkBrandColor = &v
}

// GetWeekStart returns the WeekStart field value if set, zero value otherwise.
func (o *EditUserByIdRequest) GetWeekStart() string {
	if o == nil || IsNil(o.WeekStart) {
		var ret string
		return ret
	}
	return *o.WeekStart
}

// GetWeekStartOk returns a tuple with the WeekStart field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EditUserByIdRequest) GetWeekStartOk() (*string, bool) {
	if o == nil || IsNil(o.WeekStart) {
		return nil, false
	}
	return o.WeekStart, true
}

// HasWeekStart returns a boolean if a field has been set.
func (o *EditUserByIdRequest) HasWeekStart() bool {
	if o != nil && !IsNil(o.WeekStart) {
		return true
	}

	return false
}

// SetWeekStart gets a reference to the given string and assigns it to the WeekStart field.
func (o *EditUserByIdRequest) SetWeekStart(v string) {
	o.WeekStart = &v
}

// GetTimeZone returns the TimeZone field value if set, zero value otherwise.
func (o *EditUserByIdRequest) GetTimeZone() string {
	if o == nil || IsNil(o.TimeZone) {
		var ret string
		return ret
	}
	return *o.TimeZone
}

// GetTimeZoneOk returns a tuple with the TimeZone field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EditUserByIdRequest) GetTimeZoneOk() (*string, bool) {
	if o == nil || IsNil(o.TimeZone) {
		return nil, false
	}
	return o.TimeZone, true
}

// HasTimeZone returns a boolean if a field has been set.
func (o *EditUserByIdRequest) HasTimeZone() bool {
	if o != nil && !IsNil(o.TimeZone) {
		return true
	}

	return false
}

// SetTimeZone gets a reference to the given string and assigns it to the TimeZone field.
func (o *EditUserByIdRequest) SetTimeZone(v string) {
	o.TimeZone = &v
}

// GetHideBranding returns the HideBranding field value if set, zero value otherwise.
func (o *EditUserByIdRequest) GetHideBranding() bool {
	if o == nil || IsNil(o.HideBranding) {
		var ret bool
		return ret
	}
	return *o.HideBranding
}

// GetHideBrandingOk returns a tuple with the HideBranding field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EditUserByIdRequest) GetHideBrandingOk() (*bool, bool) {
	if o == nil || IsNil(o.HideBranding) {
		return nil, false
	}
	return o.HideBranding, true
}

// HasHideBranding returns a boolean if a field has been set.
func (o *EditUserByIdRequest) HasHideBranding() bool {
	if o != nil && !IsNil(o.HideBranding) {
		return true
	}

	return false
}

// SetHideBranding gets a reference to the given bool and assigns it to the HideBranding field.
func (o *EditUserByIdRequest) SetHideBranding(v bool) {
	o.HideBranding = &v
}

// GetTheme returns the Theme field value if set, zero value otherwise.
func (o *EditUserByIdRequest) GetTheme() string {
	if o == nil || IsNil(o.Theme) {
		var ret string
		return ret
	}
	return *o.Theme
}

// GetThemeOk returns a tuple with the Theme field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EditUserByIdRequest) GetThemeOk() (*string, bool) {
	if o == nil || IsNil(o.Theme) {
		return nil, false
	}
	return o.Theme, true
}

// HasTheme returns a boolean if a field has been set.
func (o *EditUserByIdRequest) HasTheme() bool {
	if o != nil && !IsNil(o.Theme) {
		return true
	}

	return false
}

// SetTheme gets a reference to the given string and assigns it to the Theme field.
func (o *EditUserByIdRequest) SetTheme(v string) {
	o.Theme = &v
}

// GetTimeFormat returns the TimeFormat field value if set, zero value otherwise.
func (o *EditUserByIdRequest) GetTimeFormat() string {
	if o == nil || IsNil(o.TimeFormat) {
		var ret string
		return ret
	}
	return *o.TimeFormat
}

// GetTimeFormatOk returns a tuple with the TimeFormat field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EditUserByIdRequest) GetTimeFormatOk() (*string, bool) {
	if o == nil || IsNil(o.TimeFormat) {
		return nil, false
	}
	return o.TimeFormat, true
}

// HasTimeFormat returns a boolean if a field has been set.
func (o *EditUserByIdRequest) HasTimeFormat() bool {
	if o != nil && !IsNil(o.TimeFormat) {
		return true
	}

	return false
}

// SetTimeFormat gets a reference to the given string and assigns it to the TimeFormat field.
func (o *EditUserByIdRequest) SetTimeFormat(v string) {
	o.TimeFormat = &v
}

// GetLocale returns the Locale field value if set, zero value otherwise.
func (o *EditUserByIdRequest) GetLocale() string {
	if o == nil || IsNil(o.Locale) {
		var ret string
		return ret
	}
	return *o.Locale
}

// GetLocaleOk returns a tuple with the Locale field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EditUserByIdRequest) GetLocaleOk() (*string, bool) {
	if o == nil || IsNil(o.Locale) {
		return nil, false
	}
	return o.Locale, true
}

// HasLocale returns a boolean if a field has been set.
func (o *EditUserByIdRequest) HasLocale() bool {
	if o != nil && !IsNil(o.Locale) {
		return true
	}

	return false
}

// SetLocale gets a reference to the given string and assigns it to the Locale field.
func (o *EditUserByIdRequest) SetLocale(v string) {
	o.Locale = &v
}

// GetAvatar returns the Avatar field value if set, zero value otherwise.
func (o *EditUserByIdRequest) GetAvatar() string {
	if o == nil || IsNil(o.Avatar) {
		var ret string
		return ret
	}
	return *o.Avatar
}

// GetAvatarOk returns a tuple with the Avatar field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EditUserByIdRequest) GetAvatarOk() (*string, bool) {
	if o == nil || IsNil(o.Avatar) {
		return nil, false
	}
	return o.Avatar, true
}

// HasAvatar returns a boolean if a field has been set.
func (o *EditUserByIdRequest) HasAvatar() bool {
	if o != nil && !IsNil(o.Avatar) {
		return true
	}

	return false
}

// SetAvatar gets a reference to the given string and assigns it to the Avatar field.
func (o *EditUserByIdRequest) SetAvatar(v string) {
	o.Avatar = &v
}

func (o EditUserByIdRequest) MarshalJSON() ([]byte, error) {
	toSerialize,err := o.ToMap()
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(toSerialize)
}

func (o EditUserByIdRequest) ToMap() (map[string]interface{}, error) {
	toSerialize := map[string]interface{}{}
	if !IsNil(o.Email) {
		toSerialize["email"] = o.Email
	}
	if !IsNil(o.Username) {
		toSerialize["username"] = o.Username
	}
	if !IsNil(o.BrandColor) {
		toSerialize["brandColor"] = o.BrandColor
	}
	if !IsNil(o.DarkBrandColor) {
		toSerialize["darkBrandColor"] = o.DarkBrandColor
	}
	if !IsNil(o.WeekStart) {
		toSerialize["weekStart"] = o.WeekStart
	}
	if !IsNil(o.TimeZone) {
		toSerialize["timeZone"] = o.TimeZone
	}
	if !IsNil(o.HideBranding) {
		toSerialize["hideBranding"] = o.HideBranding
	}
	if !IsNil(o.Theme) {
		toSerialize["theme"] = o.Theme
	}
	if !IsNil(o.TimeFormat) {
		toSerialize["timeFormat"] = o.TimeFormat
	}
	if !IsNil(o.Locale) {
		toSerialize["locale"] = o.Locale
	}
	if !IsNil(o.Avatar) {
		toSerialize["avatar"] = o.Avatar
	}
	return toSerialize, nil
}

type NullableEditUserByIdRequest struct {
	value *EditUserByIdRequest
	isSet bool
}

func (v NullableEditUserByIdRequest) Get() *EditUserByIdRequest {
	return v.value
}

func (v *NullableEditUserByIdRequest) Set(val *EditUserByIdRequest) {
	v.value = val
	v.isSet = true
}

func (v NullableEditUserByIdRequest) IsSet() bool {
	return v.isSet
}

func (v *NullableEditUserByIdRequest) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableEditUserByIdRequest(val *EditUserByIdRequest) *NullableEditUserByIdRequest {
	return &NullableEditUserByIdRequest{value: val, isSet: true}
}

func (v NullableEditUserByIdRequest) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableEditUserByIdRequest) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


