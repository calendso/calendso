## Version 1.0
### Release Plan
  1. Read the document(domain-wide-delegation.md) and acknowledge it.
  2. Deploy the migrations PR first.
  3. Deploy the PR(without Calendar Cache Support)
  3. Deploy:
     1. Follow "Setting up Domain-Wide Delegation for Google Calendar API" in domain-wide-delegation.md to create Service Account and create a workspace.
     2. Merge PR and then deploy.
  4. Enable for i.cal.com:
     1. Disable Calendar Cache for i.cal.com
     2. Enable DWD for i.cal.com first and then test there
     3. Wait for 1-2 days and keep monitoring the errors in Sentry and Axiom.
  5. Merge & Deploy the Calendar Cache support(with DWD) PR
     1. Enable Calendar Cache back for i.cal.com
     2. Observe the errors in Sentry and Axiom.
  6. Enable for a big customer:
     1. Wait for a week and keep monitoring the errors in Sentry and Axiom.
  7. Use delegatedCredentialsFirst instead of delegatedCredentialsLast in EventManager.ts
    - Observe errors in Sentry and Axiom.

## Manual Testing
  - V2/V1 APIs - There could be problem if DWD credentials aren't supported there. Because as organization enables DWD and new users won't need to connect their calendars in the old way. e.g. getBusyCalendarTimes seem to be used there in V2.
  - [ ] Isolation of DWD credentials for different organizations
    - [ ] Using same domain name for different organization isn't allowed. It is restricted during creation of DWD.
  - [ ] Location Change of a booking  to Google Meet(from Cal Video)
  - [ ] Onboarding
    - [ ] When DWD is not enabled, the flow works.
    - [ ] When DWD is enabled, Google Calendar is pre-installed and Destination Calendar and Selected Calendar are configurable. On next step, Google Meet is pre-installed and shown at the top and could be set as default.
  - [ ] Event Type Selected Calendar and Destination Calendar
  - [ ] Owner must have verified email to enable DWD
  - [x] RR Team Event
    - [x] Booking
      - Unavailable slot isn't available for booking. Unavailable user isn't used.
    - [x] Reroute
    - [x] Reassign
  - [ ] Calendar Cache
    - [ ] Event Type Selected Calendar caching test
    - [ ] User Selected Calendar caching test
  - [x] Troubleshooter
      - [x] Shows busy times from Calendar

### Important
  - Bugs
    - [ ] For RR event, if I am able to see the slots for a blocked day in calendar(by temporarily unselecting the calendar), and then we enable the calendar back, the blocked day can be booked.
      - [ ] Not using Goole Meet with Default conferencing app.
    - [x] Duplicate Calendar Events in Google Calendar when choosing non-primary calendar as destination. No idea why this is happening.
        - The issue was in getAttendees in Google CalendarService not using externalCalendarId.
    - [ ] Restrict toggling
    - [x] Duplicate Calendar connections in 'apps/installed' if a user already had connected calendar and DWD is enabled.
    - [x] Calendar Cache has credentialId column which isn't applicable for DWD(Solution: Added userId there)
    - [x] Troubleshooter
      - [x] Shows busy times from Claendar
    - [x] If a user has connected a calendar, and then DWD is enabled.
      - Tested various scenarios for it
    - [x] Inviting a new user. 
      - Verified that Google Calendar is shown pre-installed. 
      - How about Google Meet(which depends on Google Calendar) - Correctly shows up as installed.
  - TODO:
    - [ ] Performance
      - [x] Available Slots and booking flow shouldn't slow down. Right now the querying logic is not optimized. We query per team member, we should do one query.
    - [ ] Tag all DWD related logs and errors with "DWD:"
    - [x] Troubleshooter
    - [x] Google CalendarService unit tests to verify that if DWD credential is provided it uses impersonation to access API otherwise it uses regular user credential API.
    - [x] setDestinationCalendar.handler.ts tests to verify that when DWD is enabled it still correctly sets the destination calendar. 
    - [x] getConnectedDestinationCalendars tests.
  - [x] Creating DWD shouldn't immediately enable it. Enabling has separate check to confirm if it is actually configured in google workspace
  - [x] Added check to avoid adding same domain for a workspace platform in another organization if it is already enabled in some other organization
  - [x] Don't show dwd in menu for non-org-admin users - It errors with something_went_wrong right now
  - [x] Don't allow disabled platform to be selected in the UI for creation.
    - We have disabled coming the disabled platform to be coming into the list that effectively disables edit of existing dwd and creation of new dwd for that platform.
  - [x] Where should we show the user the client ID to enable domain wide delegation?
    - [x] It must be shown to the organization owner/admin only
    - [x] There could be multiple checkboxes per domain to enable domain wide delegation for a domain
  - [x] Which domain to allow
    - Any domain can be added by a user
  - [x] Support multiple domains in DomainWideDelegation schema for an organization
    - [x] Use the domain as well to identify if the domain wide delegation is enabled
  - [x] Before enabling Domain-wide delegation, there should be a check to ensure that the clientID has been added to the Workspace Platform
  - [x] We should allow setting default conferencing app during onboarding

### Follow-up release
  - [ ] Confirmation for DwD deletion and disabling
  - [ ] If DWD is enabled and the org member doesn't exist in Google Workspace, and the user has connected personal account, should we correctly use the personal account?

### Security
  - [x] We don't let any one user see the added service account key from UI.
  - [ ] We intend to implement Workload Identity Federation in the future.
  
### Documentation
- After enabling domain-wide delegation, the credential is shown pre-installed and the connection can't be removed(or the app can't be uninstalled by user)
- Steps
  - App admin will first create a Workspace Platform and then organization owner/admin can enable domain-wide delegation for a domain
  - As soon as domain-wide delegation is created, it would start taking preference over the personal credentials of the organization members and it would be used for that. 

Version-2.0
- Workload Identity Federation to ensure that the service account key is never stored in DB.



