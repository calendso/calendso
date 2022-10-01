/**
    This file is autogenerated using the command `yarn app-store:build --watch`.
    Don't modify this file manually.
**/
import dynamic from "next/dynamic";

import { metadata as applecalendar_meta } from "./applecalendar/_metadata";
import { metadata as around_meta } from "./around/_metadata";
import { metadata as caldavcalendar_meta } from "./caldavcalendar/_metadata";
import { metadata as campfire_meta } from "./campfire/_metadata";
import { metadata as closecomothercalendar_meta } from "./closecomothercalendar/_metadata";
import { metadata as dailyvideo_meta } from "./dailyvideo/_metadata";
import { metadata as routing_forms_meta } from "./ee/routing-forms/_metadata";
import { appDataSchema as routing_forms_schema } from "./ee/routing-forms/zod";
import { metadata as exchange2013calendar_meta } from "./exchange2013calendar/_metadata";
import { metadata as exchange2016calendar_meta } from "./exchange2016calendar/_metadata";
import { metadata as exchangecalendar_meta } from "./exchangecalendar/_metadata";
import { metadata as giphy_meta } from "./giphy/_metadata";
import { appDataSchema as giphy_schema } from "./giphy/zod";
import { metadata as googlecalendar_meta } from "./googlecalendar/_metadata";
import { metadata as googlevideo_meta } from "./googlevideo/_metadata";
import { metadata as hubspotothercalendar_meta } from "./hubspotothercalendar/_metadata";
import { metadata as huddle01video_meta } from "./huddle01video/_metadata";
import { metadata as jitsivideo_meta } from "./jitsivideo/_metadata";
import { metadata as larkcalendar_meta } from "./larkcalendar/_metadata";
import { metadata as n8n_meta } from "./n8n/_metadata";
import { metadata as office365calendar_meta } from "./office365calendar/_metadata";
import { metadata as office365video_meta } from "./office365video/_metadata";
import { metadata as ping_meta } from "./ping/_metadata";
import { metadata as rainbow_meta } from "./rainbow/_metadata";
import { appDataSchema as rainbow_schema } from "./rainbow/zod";
import { metadata as raycast_meta } from "./raycast/_metadata";
import { metadata as riverside_meta } from "./riverside/_metadata";
import { metadata as slackmessaging_meta } from "./slackmessaging/_metadata";
import { metadata as stripepayment_meta } from "./stripepayment/_metadata";
import { appDataSchema as stripepayment_schema } from "./stripepayment/zod";
import { metadata as tandemvideo_meta } from "./tandemvideo/_metadata";
import { metadata as typeform_meta } from "./typeform/_metadata";
import { metadata as vital_meta } from "./vital/_metadata";
import { metadata as whereby_meta } from "./whereby/_metadata";
import { metadata as wipemycalother_meta } from "./wipemycalother/_metadata";
import { metadata as zapier_meta } from "./zapier/_metadata";
import { metadata as zoomvideo_meta } from "./zoomvideo/_metadata";

export const appStoreMetadata = {
  applecalendar: applecalendar_meta,
  around: around_meta,
  caldavcalendar: caldavcalendar_meta,
  campfire: campfire_meta,
  closecomothercalendar: closecomothercalendar_meta,
  dailyvideo: dailyvideo_meta,
  "routing-forms": routing_forms_meta,
  exchange2013calendar: exchange2013calendar_meta,
  exchange2016calendar: exchange2016calendar_meta,
  exchangecalendar: exchangecalendar_meta,
  giphy: giphy_meta,
  googlecalendar: googlecalendar_meta,
  googlevideo: googlevideo_meta,
  hubspotothercalendar: hubspotothercalendar_meta,
  huddle01video: huddle01video_meta,
  jitsivideo: jitsivideo_meta,
  larkcalendar: larkcalendar_meta,
  n8n: n8n_meta,
  office365calendar: office365calendar_meta,
  office365video: office365video_meta,
  ping: ping_meta,
  rainbow: rainbow_meta,
  raycast: raycast_meta,
  riverside: riverside_meta,
  slackmessaging: slackmessaging_meta,
  stripepayment: stripepayment_meta,
  tandemvideo: tandemvideo_meta,
  typeform: typeform_meta,
  vital: vital_meta,
  whereby: whereby_meta,
  wipemycalother: wipemycalother_meta,
  zapier: zapier_meta,
  zoomvideo: zoomvideo_meta,
};

export const appDataSchemas = {
  "routing-forms": routing_forms_schema,
  giphy: giphy_schema,
  rainbow: rainbow_schema,
  stripe: stripepayment_schema,
};

export const InstallAppButtonMap = {
  applecalendar: dynamic(() => import("./applecalendar/components/InstallAppButton")),
  around: dynamic(() => import("./around/components/InstallAppButton")),
  caldavcalendar: dynamic(() => import("./caldavcalendar/components/InstallAppButton")),
  closecomothercalendar: dynamic(() => import("./closecomothercalendar/components/InstallAppButton")),
  exchange2013calendar: dynamic(() => import("./exchange2013calendar/components/InstallAppButton")),
  exchange2016calendar: dynamic(() => import("./exchange2016calendar/components/InstallAppButton")),
  exchangecalendar: dynamic(() => import("./exchangecalendar/components/InstallAppButton")),
  googlecalendar: dynamic(() => import("./googlecalendar/components/InstallAppButton")),
  hubspotothercalendar: dynamic(() => import("./hubspotothercalendar/components/InstallAppButton")),
  huddle01video: dynamic(() => import("./huddle01video/components/InstallAppButton")),
  jitsivideo: dynamic(() => import("./jitsivideo/components/InstallAppButton")),
  larkcalendar: dynamic(() => import("./larkcalendar/components/InstallAppButton")),
  office365calendar: dynamic(() => import("./office365calendar/components/InstallAppButton")),
  office365video: dynamic(() => import("./office365video/components/InstallAppButton")),
  riverside: dynamic(() => import("./riverside/components/InstallAppButton")),
  slackmessaging: dynamic(() => import("./slackmessaging/components/InstallAppButton")),
  stripepayment: dynamic(() => import("./stripepayment/components/InstallAppButton")),
  tandemvideo: dynamic(() => import("./tandemvideo/components/InstallAppButton")),
  vital: dynamic(() => import("./vital/components/InstallAppButton")),
  whereby: dynamic(() => import("./whereby/components/InstallAppButton")),
  wipemycalother: dynamic(() => import("./wipemycalother/components/InstallAppButton")),
  zapier: dynamic(() => import("./zapier/components/InstallAppButton")),
  zoomvideo: dynamic(() => import("./zoomvideo/components/InstallAppButton")),
};
export const EventTypeAddonMap = {
  giphy: dynamic(() => import("./giphy/extensions/EventTypeAppCard")),
  rainbow: dynamic(() => import("./rainbow/extensions/EventTypeAppCard")),
  stripepayment: dynamic(() => import("./stripepayment/extensions/EventTypeAppCard")),
};
