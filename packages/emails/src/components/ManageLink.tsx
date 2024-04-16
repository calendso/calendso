import { getCancelLink, getRescheduleLink, getBookingUrl } from "@calcom/lib/CalEventParser";
import type { CalendarEvent, Person } from "@calcom/types/Calendar";

export function ManageLink(props: { calEvent: CalendarEvent; attendee: Person }) {
  // Only the original attendee can make changes to the event
  // Guests cannot
  const t = props.attendee.language.translate;
  const cancelLink = getCancelLink(props.calEvent);
  const rescheduleLink = getRescheduleLink(props.calEvent);
  const bookingLink = getBookingUrl(props.calEvent);
  if (
    (props.attendee.email === props.calEvent.attendees[0]?.email ||
      props.calEvent.organizer.email === props.attendee.email) &&
    (Boolean(cancelLink) ||
      (!props.calEvent.recurringEvent && Boolean(rescheduleLink)) ||
      Boolean(bookingLink))
  ) {
    return (
      <div
        style={{
          fontFamily: "Roboto, Helvetica, sans-serif",
          fontSize: "16px",
          fontWeight: 500,
          lineHeight: "0px",
          textAlign: "left",
          color: "#101010",
        }}>
        <p
          style={{
            fontWeight: 400,
            lineHeight: "24px",
            textAlign: "center",
            width: "100%",
          }}>
          <>{t("need_to_make_a_change")}</>

          {!props.calEvent.recurringEvent && Boolean(rescheduleLink) && (
            <span>
              <a
                href={rescheduleLink}
                style={{
                  color: "#374151",
                  marginLeft: "5px",
                  marginRight: "5px",
                  textDecoration: "underline",
                }}>
                <>{t("reschedule")}</>
              </a>
              <>{t("or_lowercase")}</>
            </span>
          )}
          {Boolean(cancelLink) && (
            <span>
              <a
                href={cancelLink}
                style={{
                  color: "#374151",
                  marginLeft: "5px",
                  textDecoration: "underline",
                }}>
                <>{t("cancel")}</>
              </a>
            </span>
          )}

          {!Boolean(cancelLink) &&
            (props.calEvent.recurringEvent || !Boolean(rescheduleLink)) &&
            Boolean(bookingLink) && (
              <span>
                <a
                  href={bookingLink}
                  style={{
                    color: "#374151",
                    marginLeft: "5px",
                    textDecoration: "underline",
                  }}>
                  <>{t("check_here")}</>
                </a>
              </span>
            )}
        </p>
      </div>
    );
  }

  // Dont have the rights to the manage link
  return null;
}
