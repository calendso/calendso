import { CodeIcon, EyeIcon, SunIcon, ChevronRightIcon, ArrowLeftIcon } from "@heroicons/react/solid";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { components, ControlProps } from "react-select";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { EventType } from "@calcom/prisma/client";
import { Button, Switch } from "@calcom/ui";
import { Dialog, DialogContent, DialogClose } from "@calcom/ui/Dialog";
import { Input, InputLeading, Label, TextArea, TextField } from "@calcom/ui/form/fields";

import { trpc } from "@lib/trpc";

import NavTabs from "@components/NavTabs";
import ColorPicker from "@components/ui/colorpicker";
import CheckboxField from "@components/ui/form/CheckboxField";
import Select from "@components/ui/form/Select";

function getEmbedSnippetString() {
  let embedJsUrl = "https://cal.com/embed.js";
  let isLocal = false;
  if (location.hostname === "localhost") {
    embedJsUrl = "http://localhost:3100/dist/embed.umd.js";
    isLocal = true;
  }
  return `(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar); return; } p(cal, ar); }; })(window, "${embedJsUrl}", "init");
	Cal("init"${isLocal ? ', {origin:"http://localhost:3000/"}' : ""});
	`;
}

const EmbedTypesDialogContent = () => {
  const { t } = useLocale();
  const router = useRouter();
  return (
    <DialogContent size="l">
      <div className="mb-4">
        <h3 className="text-lg font-bold leading-6 text-gray-900" id="modal-title">
          {t("How do you want to add Cal to your site?")}
        </h3>
        <div>
          <p className="text-sm text-gray-500">
            {t("Choose one of the following ways to put Cal on your site.")}
          </p>
        </div>
      </div>
      <div className="flex">
        {[
          {
            title: "Inline Embed",
            subtitle: "Loads your Cal scheduling page directly inline with your other website content",
            type: "inline",
            illustration: (
              <svg
                width="308"
                height="265"
                viewBox="0 0 308 265"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0 1.99999C0 0.895423 0.895431 0 2 0H306C307.105 0 308 0.895431 308 2V263C308 264.105 307.105 265 306 265H2C0.895431 265 0 264.105 0 263V1.99999Z"
                  fill="white"
                />
                <rect x="24" width="260" height="38.5" rx="2" fill="#E1E1E1" />
                <rect x="24.5" y="51" width="139" height="163" rx="1.5" fill="#F8F8F8" />
                <rect opacity="0.8" x="48" y="74.5" width="80" height="8" rx="2" fill="#E1E1E1" />
                <rect x="48" y="86.5" width="48" height="4" rx="1" fill="#E1E1E1" />
                <rect x="49" y="99.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="61" y="99.5" width="6" height="6" rx="1" fill="#3E3E3E" />
                <rect x="73" y="99.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="85" y="99.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="97" y="99.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="109" y="99.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="121" y="99.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="133" y="99.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="85" y="113.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="97" y="113.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="109" y="113.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="121" y="113.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="133" y="113.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="49" y="125.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="61" y="125.5" width="6" height="6" rx="1" fill="#3E3E3E" />
                <path
                  d="M61 124.5H67V122.5H61V124.5ZM68 125.5V131.5H70V125.5H68ZM67 132.5H61V134.5H67V132.5ZM60 131.5V125.5H58V131.5H60ZM61 132.5C60.4477 132.5 60 132.052 60 131.5H58C58 133.157 59.3431 134.5 61 134.5V132.5ZM68 131.5C68 132.052 67.5523 132.5 67 132.5V134.5C68.6569 134.5 70 133.157 70 131.5H68ZM67 124.5C67.5523 124.5 68 124.948 68 125.5H70C70 123.843 68.6569 122.5 67 122.5V124.5ZM61 122.5C59.3431 122.5 58 123.843 58 125.5H60C60 124.948 60.4477 124.5 61 124.5V122.5Z"
                  fill="#3E3E3E"
                />
                <rect x="73" y="125.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="85" y="125.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="97" y="125.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="109" y="125.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="121" y="125.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="133" y="125.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="49" y="137.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="61" y="137.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="73" y="137.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="85" y="137.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="97" y="137.5" width="6" height="6" rx="1" fill="#3E3E3E" />
                <rect x="109" y="137.5" width="6" height="6" rx="1" fill="#3E3E3E" />
                <rect x="121" y="137.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="133" y="137.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="49" y="149.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="61" y="149.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="73" y="149.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="85" y="149.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="97" y="149.5" width="6" height="6" rx="1" fill="#3E3E3E" />
                <rect x="109" y="149.5" width="6" height="6" rx="1" fill="#3E3E3E" />
                <rect x="121" y="149.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="133" y="149.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="49" y="161.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="61" y="161.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="73" y="161.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="85" y="161.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="97" y="161.5" width="6" height="6" rx="1" fill="#3E3E3E" />
                <rect x="109" y="161.5" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="24.5" y="51" width="139" height="163" rx="1.5" stroke="#292929" />
                <rect x="176" y="50.5" width="108" height="164" rx="2" fill="#E1E1E1" />
                <rect x="24" y="226.5" width="260" height="38.5" rx="2" fill="#E1E1E1" />
                <path
                  d="M2 1H306V-1H2V1ZM307 2V263H309V2H307ZM306 264H2V266H306V264ZM1 263V1.99999H-1V263H1ZM2 264C1.44772 264 1 263.552 1 263H-1C-1 264.657 0.343147 266 2 266V264ZM307 263C307 263.552 306.552 264 306 264V266C307.657 266 309 264.657 309 263H307ZM306 1C306.552 1 307 1.44772 307 2H309C309 0.343145 307.657 -1 306 -1V1ZM2 -1C0.343151 -1 -1 0.343133 -1 1.99999H1C1 1.44771 1.44771 1 2 1V-1Z"
                  fill="#CFCFCF"
                />
              </svg>
            ),
          },
          {
            title: "Floating pop-up button",
            subtitle: "Adds a floating button on your site that launches Cal in a dialog.",
            type: "floating-popup",
            illustration: (
              <svg
                width="308"
                height="265"
                viewBox="0 0 308 265"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0 1.99999C0 0.895423 0.895431 0 2 0H306C307.105 0 308 0.895431 308 2V263C308 264.105 307.105 265 306 265H2C0.895431 265 0 264.105 0 263V1.99999Z"
                  fill="white"
                />
                <rect x="24" width="260" height="38.5" rx="2" fill="#E1E1E1" />
                <rect x="24" y="50.5" width="120" height="76" rx="2" fill="#E1E1E1" />
                <rect x="24" y="138.5" width="120" height="76" rx="2" fill="#E1E1E1" />
                <rect x="156" y="50.5" width="128" height="164" rx="2" fill="#E1E1E1" />
                <rect x="24" y="226.5" width="260" height="38.5" rx="2" fill="#E1E1E1" />
                <rect x="226" y="223.5" width="66" height="26" rx="2" fill="#292929" />
                <rect x="242" y="235.5" width="34" height="2" rx="1" fill="white" />
                <path
                  d="M2 1H306V-1H2V1ZM307 2V263H309V2H307ZM306 264H2V266H306V264ZM1 263V1.99999H-1V263H1ZM2 264C1.44772 264 1 263.552 1 263H-1C-1 264.657 0.343147 266 2 266V264ZM307 263C307 263.552 306.552 264 306 264V266C307.657 266 309 264.657 309 263H307ZM306 1C306.552 1 307 1.44772 307 2H309C309 0.343145 307.657 -1 306 -1V1ZM2 -1C0.343151 -1 -1 0.343133 -1 1.99999H1C1 1.44771 1.44771 1 2 1V-1Z"
                  fill="#CFCFCF"
                />
              </svg>
            ),
          },
          {
            title: "Pop up via element click",
            subtitle: "Open your Cal dialog when someone clicks an element.",
            type: "element-click",
            illustration: (
              <svg
                width="308"
                height="265"
                viewBox="0 0 308 265"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0 1.99999C0 0.895423 0.895431 0 2 0H306C307.105 0 308 0.895431 308 2V263C308 264.105 307.105 265 306 265H2C0.895431 265 0 264.105 0 263V1.99999Z"
                  fill="white"
                />
                <rect x="24" width="260" height="38.5" rx="2" fill="#E1E1E1" />
                <rect x="24" y="50.5" width="120" height="76" rx="2" fill="#E1E1E1" />
                <rect x="24" y="138.5" width="120" height="76" rx="2" fill="#E1E1E1" />
                <rect x="156" y="50.5" width="128" height="164" rx="2" fill="#E1E1E1" />
                <rect x="24" y="226.5" width="260" height="38.5" rx="2" fill="#E1E1E1" />
                <rect x="84.5" y="61.5" width="139" height="141" rx="1.5" fill="#F8F8F8" />
                <rect opacity="0.8" x="108" y="85" width="80" height="8" rx="2" fill="#E1E1E1" />
                <rect x="108" y="97" width="48" height="4" rx="1" fill="#E1E1E1" />
                <rect x="109" y="110" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="121" y="110" width="6" height="6" rx="1" fill="#3E3E3E" />
                <rect x="133" y="110" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="145" y="110" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="157" y="110" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="169" y="110" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="181" y="110" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="193" y="110" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="145" y="124" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="157" y="124" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="169" y="124" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="181" y="124" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="193" y="124" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="109" y="136" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="121" y="136" width="6" height="6" rx="1" fill="#3E3E3E" />
                <path
                  d="M121 135H127V133H121V135ZM128 136V142H130V136H128ZM127 143H121V145H127V143ZM120 142V136H118V142H120ZM121 143C120.448 143 120 142.552 120 142H118C118 143.657 119.343 145 121 145V143ZM128 142C128 142.552 127.552 143 127 143V145C128.657 145 130 143.657 130 142H128ZM127 135C127.552 135 128 135.448 128 136H130C130 134.343 128.657 133 127 133V135ZM121 133C119.343 133 118 134.343 118 136H120C120 135.448 120.448 135 121 135V133Z"
                  fill="#3E3E3E"
                />
                <rect x="133" y="136" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="145" y="136" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="157" y="136" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="169" y="136" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="181" y="136" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="193" y="136" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="109" y="148" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="121" y="148" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="133" y="148" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="145" y="148" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="157" y="148" width="6" height="6" rx="1" fill="#3E3E3E" />
                <rect x="169" y="148" width="6" height="6" rx="1" fill="#3E3E3E" />
                <rect x="181" y="148" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="193" y="148" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="109" y="160" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="121" y="160" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="133" y="160" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="145" y="160" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="157" y="160" width="6" height="6" rx="1" fill="#3E3E3E" />
                <rect x="169" y="160" width="6" height="6" rx="1" fill="#3E3E3E" />
                <rect x="181" y="160" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="193" y="160" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="109" y="172" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="121" y="172" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="133" y="172" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="145" y="172" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="157" y="172" width="6" height="6" rx="1" fill="#3E3E3E" />
                <rect x="169" y="172" width="6" height="6" rx="1" fill="#C6C6C6" />
                <rect x="84.5" y="61.5" width="139" height="141" rx="1.5" stroke="#292929" />
                <path
                  d="M2 1H306V-1H2V1ZM307 2V263H309V2H307ZM306 264H2V266H306V264ZM1 263V1.99999H-1V263H1ZM2 264C1.44772 264 1 263.552 1 263H-1C-1 264.657 0.343147 266 2 266V264ZM307 263C307 263.552 306.552 264 306 264V266C307.657 266 309 264.657 309 263H307ZM306 1C306.552 1 307 1.44772 307 2H309C309 0.343145 307.657 -1 306 -1V1ZM2 -1C0.343151 -1 -1 0.343133 -1 1.99999H1C1 1.44771 1.44771 1 2 1V-1Z"
                  fill="#CFCFCF"
                />
              </svg>
            ),
          },
        ].map((widget, index) => (
          <button
            className="mr-2 w-1/3 text-left"
            key={index}
            onClick={() => {
              router.push({
                query: {
                  ...router.query,
                  embedType: widget.type,
                  title: widget.title,
                },
              });
            }}>
            <div className="order-none  mx-0 my-3 box-border h-[20rem] flex-none rounded-sm border border-solid bg-white">
              {widget.illustration}
            </div>
            <div className="font-medium text-neutral-900">{widget.title}</div>
            <p className="text-sm text-gray-500">{widget.subtitle}</p>
          </button>
        ))}
      </div>
    </DialogContent>
  );
};

const EmbedNavBar = () => {
  const { t } = useLocale();
  const tabs = [
    {
      name: t("Embed"),
      tabName: "embed-code",
      icon: CodeIcon,
    },
    {
      name: t("Preview"),
      tabName: "embed-preview",
      icon: EyeIcon,
    },
  ];

  return <NavTabs tabs={tabs} linkProps={{ shallow: true }} />;
};
const ThemeSelectControl = ({ children, ...props }: ControlProps<any, any>) => {
  return (
    <components.Control {...props}>
      <SunIcon className="h-[32px] w-[32px] text-gray-500" />
      {children}
    </components.Control>
  );
};

/*
  FIXME: Title shouldn't be read from URL, it can be derived from URL 
  */
const EmbedTypeCodeAndPreviewDialogContent = ({ eventTypeId, embedType, title }) => {
  const { t } = useLocale();
  const router = useRouter();
  const iframeRef = useRef();
  const embedCode = useRef();
  const { data: eventType, isLoading } = trpc.useQuery([
    "viewer.eventTypes.get",
    {
      id: +eventTypeId,
    },
  ]);

  const [isEmbedCustomizationOpen, setIsEmbedCustomizationOpen] = useState(true);
  const [isBookingCustomizationOpen, setIsBookingCustomizationOpen] = useState(true);
  const [previewState, setPreviewState] = useState({
    inline: {
      width: "100%",
      height: "100%",
    },
    floatingPopup: {},
    elementClick: {},
    palette: {
      brandColor: "#000000",
    },
  });

  if (!router.query.tabName) {
    router.push({
      query: {
        ...router.query,
        tabName: "embed-code",
      },
    });
  }

  if (isLoading) {
    return null;
  }
  const calLink = `${eventType.teamId ? `team/${eventType.team.slug}` : eventType.users[0].username}/${
    eventType.slug
  }`;

  const getEmbedUIInstructionString = () => {
    return `Cal("ui", {
		${getThemeForSnippet() ? 'theme: "' + previewState.theme + '",\n    ' : ""}styles: {
		  branding: ${JSON.stringify(previewState.palette)}
		}
	  })`;
  };
  const getEmbedTypeSpecificString = ({ calLink }) => {
    if (embedType === "inline") {
      return `Cal("inline", {
	  elementOrSelector:"#my-cal-inline",
	  calLink: "${calLink}"
	})
	${getEmbedUIInstructionString()}`;
    } else if (embedType === "floating-popup") {
      let floatingButtonArg = {
        calLink,
        ...previewState.floatingPopup,
      };
      return `Cal("floatingButton", ${JSON.stringify(floatingButtonArg)});
		${getEmbedUIInstructionString()}`;
    } else if (embedType === "element-click") {
      return `//Important: Also, add data-cal-link="${calLink}" attribute to the element you want to open Cal on click
		${getEmbedUIInstructionString()}`;
    }
  };

  const getThemeForSnippet = () => {
    return previewState.theme !== "auto" ? previewState.theme : null;
  };

  const addToPalette = (update) => {
    setPreviewState((previewState) => {
      return {
        ...previewState,
        palette: {
          ...previewState.palette,
          ...update,
        },
      };
    });
  };

  const previewInstruction = (instruction) => {
    iframeRef.current?.contentWindow.postMessage(
      {
        mode: "cal:preview",
        type: "instruction",
        instruction,
      },
      "*"
    );
  };
  previewInstruction({
    name: "ui",
    arg: {
      theme: getThemeForSnippet(),
      styles: {
        branding: {
          ...previewState.palette,
        },
      },
    },
  });

  if (embedType === "floating-popup") {
    previewInstruction({
      name: "floatingButton",
      arg: {
        attributes: {
          id: "my-floating-button",
        },
        ...previewState.floatingPopup,
      },
    });
  }

  const ThemeOptions = [
    { value: "auto", label: "Auto Theme" },
    { value: "dark", label: "Dark Theme" },
    { value: "light", label: "Light Theme" },
  ];
  const FloatingPopupPositionOptions = [
    {
      value: "bottom-right",
      label: "Bottom Right",
    },
    {
      value: "bottom-left",
      label: "Bottom Left",
    },
  ];

  const getDimension = (dimension) => {
    if (dimension.match(/^\d+$/)) {
      dimension = `${dimension}%`;
    }
    return dimension;
  };
  return (
    <DialogContent size="xl">
      <div className="flex">
        <div className="flex w-1/3 flex-col bg-white p-6">
          <h3 className="mb-2 flex text-xl font-bold leading-6 text-gray-900" id="modal-title">
            <button
              onClick={() => {
                const newQuery = { ...router.query };
                delete newQuery.embedType;
                delete newQuery.tabName;
                router.push({
                  query: {
                    ...newQuery,
                  },
                });
              }}>
              <ArrowLeftIcon className="mr-4 w-4"></ArrowLeftIcon>
            </button>
            {title}
          </h3>
          <hr className={classNames("mt-4", embedType === "element-click" ? "hidden" : "")}></hr>
          <div className={classNames("mt-4 font-medium", embedType === "element-click" ? "hidden" : "")}>
            <Collapsible
              open={isEmbedCustomizationOpen}
              onOpenChange={() => setIsEmbedCustomizationOpen((val) => !val)}>
              <CollapsibleTrigger
                type="button"
                className="flex w-full items-center text-base font-medium text-neutral-900">
                <div>
                  {embedType === "inline"
                    ? "Inline Embed Customization"
                    : embedType === "floating-popup"
                    ? "Floating Popup Customization"
                    : "Element Click Customization"}
                </div>
                <ChevronRightIcon
                  className={`${
                    isEmbedCustomizationOpen ? "rotate-90 transform" : ""
                  } ml-auto h-5 w-5 text-neutral-500`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="text-sm">
                <div className={classNames("mt-6", embedType === "inline" ? "block" : "hidden")}>
                  {/*TODO: Add Auto/Fixed toggle from Figma */}
                  <div className="text-sm">Embed Window Sizing</div>
                  <div className="justify-left flex items-center">
                    <TextField
                      name="width"
                      labelProps={{ className: "hidden" }}
                      required
                      value={previewState.inline.width}
                      onChange={(e) => {
                        setPreviewState((previewState) => {
                          let width = e.target.value || "100%";

                          return {
                            ...previewState,
                            inline: {
                              ...previewState.inline,
                              width,
                            },
                          };
                        });
                      }}
                      addOnLeading={<InputLeading>W</InputLeading>}
                    />
                    <span className="p-2">x</span>
                    <TextField
                      labelProps={{ className: "hidden" }}
                      name="height"
                      value={previewState.inline.height}
                      required
                      onChange={(e) => {
                        const height = e.target.value || "100%";

                        setPreviewState((previewState) => {
                          return {
                            ...previewState,
                            inline: {
                              ...previewState.inline,
                              height,
                            },
                          };
                        });
                      }}
                      addOnLeading={<InputLeading>H</InputLeading>}
                    />
                  </div>
                </div>
                <div
                  className={classNames(
                    "mt-4 items-center justify-between",
                    embedType === "floating-popup" ? "flex" : "hidden"
                  )}>
                  <div className="text-sm">Button Text</div>
                  {/* Default Values should come from preview iframe */}
                  <TextField
                    onChange={(e) => {
                      setPreviewState((previewState) => {
                        return {
                          ...previewState,
                          floatingPopup: {
                            ...previewState.floatingPopup,
                            buttonText: e.target.value,
                          },
                        };
                      });
                    }}
                    defaultValue="Book my Cal"
                    required
                  />
                </div>
                <div
                  className={classNames(
                    "mt-4 flex items-center justify-between",
                    embedType === "floating-popup" ? "flex" : "hidden"
                  )}>
                  <div className="text-sm">Display Calendar Icon Button</div>
                  <Switch
                    defaultChecked={true}
                    onCheckedChange={(checked) => {
                      setPreviewState((previewState) => {
                        return {
                          ...previewState,
                          floatingPopup: {
                            ...previewState.floatingPopup,
                            hideButtonIcon: !checked,
                          },
                        };
                      });
                    }}></Switch>
                </div>
                <div
                  className={classNames(
                    "mt-4 flex items-center justify-between",
                    embedType === "floating-popup" ? "flex" : "hidden"
                  )}>
                  <div>Position of Button</div>
                  <Select
                    onChange={(position) => {
                      setPreviewState((previewState) => {
                        return {
                          ...previewState,
                          floatingPopup: {
                            ...previewState.floatingPopup,
                            buttonPosition: position.value,
                          },
                        };
                      });
                    }}
                    defaultValue={FloatingPopupPositionOptions[0]}
                    options={FloatingPopupPositionOptions}></Select>
                </div>
                <div
                  className={classNames(
                    "mt-4 flex items-center justify-between",
                    embedType === "floating-popup" ? "flex" : "hidden"
                  )}>
                  <div>Button Color</div>
                  <div className="w-36">
                    <ColorPicker
                      defaultValue="#000000"
                      onChange={(color) => {
                        setPreviewState((previewState) => {
                          return {
                            ...previewState,
                            floatingPopup: {
                              ...previewState.floatingPopup,
                              buttonColor: color,
                            },
                          };
                        });
                      }}></ColorPicker>
                  </div>
                </div>
                <div
                  className={classNames(
                    "mt-4 flex items-center justify-between",
                    embedType === "floating-popup" ? "flex" : "hidden"
                  )}>
                  <div>Text Color</div>
                  <div className="w-36">
                    <ColorPicker
                      defaultValue="#000000"
                      onChange={(color) => {
                        setPreviewState((previewState) => {
                          return {
                            ...previewState,
                            floatingPopup: {
                              ...previewState.floatingPopup,
                              buttonTextColor: color,
                            },
                          };
                        });
                      }}></ColorPicker>
                  </div>
                </div>
                <div
                  className={classNames(
                    "mt-4 flex hidden items-center justify-between",
                    embedType === "floating-popup" ? "flex" : "hidden"
                  )}>
                  <div>Button Color on Hover</div>
                  <div className="w-36">
                    <ColorPicker
                      defaultValue="#000000"
                      onChange={(color) => {
                        addToPalette({
                          "floating-popup-button-color-hover": color,
                        });
                      }}></ColorPicker>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <hr className="mt-4"></hr>
          <div className="mt-4 font-medium">
            <Collapsible
              open={isBookingCustomizationOpen}
              onOpenChange={() => setIsBookingCustomizationOpen((val) => !val)}>
              <CollapsibleTrigger className="flex w-full" type="button">
                <div className="text-base  font-medium text-neutral-900">Cal Booking Customization</div>
                <ChevronRightIcon
                  className={`${
                    isBookingCustomizationOpen ? "rotate-90 transform" : ""
                  } ml-auto h-5 w-5 text-neutral-500`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-6 text-sm">
                  <Label className="flex items-center justify-between">
                    <div>Theme</div>
                    <Select
                      className="w-36"
                      defaultValue={ThemeOptions[0]}
                      components={{
                        Control: ThemeSelectControl,
                      }}
                      onChange={(option) => {
                        setPreviewState((previewState) => {
                          return {
                            ...previewState,
                            theme: option.value,
                          };
                        });
                      }}
                      options={ThemeOptions}></Select>
                  </Label>
                  {[
                    { name: "brandColor", title: "Brand Color" },
                    // { name: "lightColor", title: "Light Color" },
                    // { name: "lighterColor", title: "Lighter Color" },
                    // { name: "lightestColor", title: "Lightest Color" },
                    // { name: "highlightColor", title: "Highlight Color" },
                    // { name: "medianColor", title: "Median Color" },
                  ].map((palette) => (
                    <Label key={palette.name} className="flex items-center justify-between">
                      <div>{palette.title}</div>
                      <div className="w-36">
                        <ColorPicker
                          defaultValue="#000000"
                          onChange={(color) => {
                            addToPalette({
                              [palette.name]: color,
                            });
                          }}></ColorPicker>
                      </div>
                    </Label>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        <div className="w-2/3 bg-gray-50 p-6">
          <EmbedNavBar />
          <div>
            <div
              className={classNames(router.query.tabName === "embed-code" ? "block" : "hidden", "h-[75vh]")}>
              <small className="flex py-4 text-neutral-500">
                {t("Place this code in your HTML where you want your Cal widget to appear.")}
              </small>
              <TextArea
                ref={embedCode}
                name="embed-code"
                className="h-[24rem]"
                readOnly
                value={
                  `<!-- Cal ${embedType} embed code begins -->\n` +
                  (embedType === "inline"
                    ? `<div style="width:${getDimension(previewState.inline.width)};height:${getDimension(
                        previewState.inline.height
                      )}" id="my-cal-inline"></div>`
                    : "") +
                  `
  <script type="text/javascript">
	${getEmbedSnippetString()}
	${getEmbedTypeSpecificString({ calLink: calLink })}
  </script>
  <!-- Cal ${embedType} embed code ends -->`
                }></TextArea>
              <p className="text-sm text-gray-500">
                {t(
                  "Need help? See our guides for embedding Cal on Wix, Squarespace, or WordPress, check our common questions, or explore advanced embed options."
                )}
              </p>
            </div>
            <div className={router.query.tabName == "embed-preview" ? "block" : "hidden"}>
              <iframe
                ref={iframeRef}
                className="border-1 h-[75vh] border"
                width="100%"
                height="100%"
                src={`http://localhost:3100/preview.html?embedType=${embedType}`}
              />
            </div>
          </div>
          <div className="mt-8 flex flex-row-reverse gap-x-2">
            <Button
              type="submit"
              onClick={() => {
                navigator.clipboard.writeText(embedCode.current?.value);
                showToast(t("link_copied"), "success");
              }}>
              {t("Copy Code")}
            </Button>
            <DialogClose asChild>
              <Button color="secondary">{t("Close")}</Button>
            </DialogClose>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export const EmbedDialog = () => {
  const router = useRouter();
  return (
    <Dialog name="embed" clearQueryParamsOnClose={["embedType", "title", "tabName", "eventTypeId"]}>
      {!router.query.embedType ? (
        <EmbedTypesDialogContent />
      ) : (
        <EmbedTypeCodeAndPreviewDialogContent
          eventTypeId={router.query.eventTypeId}
          embedType={router.query.embedType}
          title={router.query.title}
        />
      )}
    </Dialog>
  );
};

export const EmbedButton = ({
  eventTypeId,
  className = "",
  permalink,
  dark,
  ...props
}: {
  eventTypeId: EventType["id"];
  className: string;
  props: any[];
  dark?: boolean;
  permalink: string;
}) => {
  const { t } = useLocale();
  const router = useRouter();
  className = classNames(className, "hidden md:flex");
  const openEmbedModal = () => {
    const query = {
      ...router.query,
      dialog: "embed",
      eventTypeId,
    };
    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <Button
      type="button"
      color="minimal"
      size="sm"
      className={className}
      {...props}
      data-testid={"event-type-embed-" + eventTypeId}
      onClick={() => openEmbedModal()}>
      <CodeIcon
        className={classNames("h-4 w-4 ltr:mr-2 rtl:ml-2", dark ? "" : "text-neutral-500")}></CodeIcon>
      {t("Embed")}
    </Button>
  );
};
