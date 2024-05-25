export enum ErrorCode {
  PaymentCreationFailure = "payment_not_created_error",
  NoAvailableUsersFound = "no_available_users_found_error",
  ChargeCardFailure = "couldnt_charge_card_error",
  RequestBodyWithouEnd = "request_body_end_time_internal_error",
  AlreadySignedUpForBooking = "already_signed_up_for_this_booking_error",
  HostsUnavailableForBooking = "hosts_unavailable_for_booking",
  EventTypeNotFound = "event_type_not_found_error",
  BookingNotFound = "booking_not_found_error",
  BookingSeatsFull = "booking_seats_full_error",
  MissingPaymentCredential = "missing_payment_credential_error",
  MissingPaymentAppId = "missing_payment_app_id_error",
  NotEnoughAvailableSeats = "not_enough_available_seats_error",
  AvailabilityNotFoundInSchedule = "availability_not_found_in_schedule_error",
  CouldNotFoundOriginalBooking = "could_not_found_original_booking_error",
  CancelledBookingsCannotBeRescheduled = "cancelled_bookings_cannot_be_rescheduled",
  StartedBookingsCannotBeRescheduled = "started_bookings_cannot_be_rescheduled",
  UnableToSubscribeToThePlatform = "unable_to_subscribe_to_the_platform",
  UpdatingOauthClientError = "updating_oauth_client_error",
  CreatingOauthClientError = "creating_oauth_client_error",
}
