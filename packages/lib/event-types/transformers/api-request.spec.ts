import slugify from "@calcom/lib/slugify";
import type { BookingField, Location } from "@calcom/platform-types";

import type { CommonField, OptionsField } from "./api-request";
import {
  transformApiEventTypeLocations,
  transformApiEventTypeBookingFields,
  transformSelectOptions,
} from "./api-request";

describe("transformApiEventTypeLocations", () => {
  it("should transform address", () => {
    const input: Location[] = [
      {
        type: "address",
        address: "London road 10-1",
      },
    ];

    const expectedOutput = [{ type: "inPerson", address: "London road 10-1" }];

    const result = transformApiEventTypeLocations(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform link", () => {
    const input: Location[] = [
      {
        type: "link",
        link: "https://customvideo.com/join/123456",
      },
    ];

    const expectedOutput = input;

    const result = transformApiEventTypeLocations(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform integration", () => {
    const input: Location[] = [
      {
        type: "integration",
        integration: "cal-video",
      },
    ];

    const expectedOutput = [{ type: "integrations:daily" }];

    const result = transformApiEventTypeLocations(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform phone", () => {
    const input: Location[] = [
      {
        type: "phone",
        phone: "+37120993151",
      },
    ];

    const expectedOutput = [{ type: "userPhone", hostPhoneNumber: "+37120993151" }];

    const result = transformApiEventTypeLocations(input);

    expect(result).toEqual(expectedOutput);
  });
});

describe("transformApiEventTypeBookingFields", () => {
  it("should transform name field", () => {
    const bookingField: BookingField = {
      type: "name",
      label: "Your name",
      required: true,
      placeholder: "alice",
    };

    const input: BookingField[] = [bookingField];

    const expectedOutput: CommonField[] = [
      {
        name: slugify(bookingField.label),
        type: bookingField.type,
        label: bookingField.label,
        sources: [
          {
            id: "user",
            type: "user",
            label: "User",
            fieldRequired: true,
          },
        ],
        editable: "user",
        required: bookingField.required,
        placeholder: bookingField.placeholder,
      },
    ];

    const result = transformApiEventTypeBookingFields(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform email field", () => {
    const bookingField: BookingField = {
      type: "email",
      label: "Your email",
      required: true,
      placeholder: "example@example.com",
    };

    const input: BookingField[] = [bookingField];

    const expectedOutput: CommonField[] = [
      {
        name: slugify(bookingField.label),
        type: bookingField.type,
        label: bookingField.label,
        sources: [
          {
            id: "user",
            type: "user",
            label: "User",
            fieldRequired: true,
          },
        ],
        editable: "user",
        required: bookingField.required,
        placeholder: bookingField.placeholder,
      },
    ];

    const result = transformApiEventTypeBookingFields(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform phone field", () => {
    const bookingField: BookingField = {
      type: "phone",
      label: "Your phone number",
      required: true,
      placeholder: "123456789",
    };

    const input: BookingField[] = [bookingField];

    const expectedOutput: CommonField[] = [
      {
        name: slugify(bookingField.label),
        type: bookingField.type,
        label: bookingField.label,
        sources: [
          {
            id: "user",
            type: "user",
            label: "User",
            fieldRequired: true,
          },
        ],
        editable: "user",
        required: bookingField.required,
        placeholder: bookingField.placeholder,
      },
    ];

    const result = transformApiEventTypeBookingFields(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform address field", () => {
    const bookingField: BookingField = {
      type: "address",
      label: "Your address",
      required: true,
      placeholder: "1234 Main St",
    };

    const input: BookingField[] = [bookingField];

    const expectedOutput: CommonField[] = [
      {
        name: slugify(bookingField.label),
        type: bookingField.type,
        label: bookingField.label,
        sources: [
          {
            id: "user",
            type: "user",
            label: "User",
            fieldRequired: true,
          },
        ],
        editable: "user",
        required: bookingField.required,
        placeholder: bookingField.placeholder,
      },
    ];

    const result = transformApiEventTypeBookingFields(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform text field", () => {
    const bookingField: BookingField = {
      type: "text",
      label: "Your text",
      required: true,
      placeholder: "Enter your text",
    };

    const input: BookingField[] = [bookingField];

    const expectedOutput: CommonField[] = [
      {
        name: slugify(bookingField.label),
        type: bookingField.type,
        label: bookingField.label,
        sources: [
          {
            id: "user",
            type: "user",
            label: "User",
            fieldRequired: true,
          },
        ],
        editable: "user",
        required: bookingField.required,
        placeholder: bookingField.placeholder,
      },
    ];

    const result = transformApiEventTypeBookingFields(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform number field", () => {
    const bookingField: BookingField = {
      type: "number",
      label: "Your number",
      required: true,
      placeholder: "100",
    };

    const input: BookingField[] = [bookingField];

    const expectedOutput: CommonField[] = [
      {
        name: slugify(bookingField.label),
        type: bookingField.type,
        label: bookingField.label,
        sources: [
          {
            id: "user",
            type: "user",
            label: "User",
            fieldRequired: true,
          },
        ],
        editable: "user",
        required: bookingField.required,
        placeholder: bookingField.placeholder,
      },
    ];

    const result = transformApiEventTypeBookingFields(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform textarea field", () => {
    const bookingField: BookingField = {
      type: "textarea",
      label: "Your detailed information",
      required: true,
      placeholder: "Detailed description here...",
    };

    const input: BookingField[] = [bookingField];

    const expectedOutput: CommonField[] = [
      {
        name: slugify(bookingField.label),
        type: bookingField.type,
        label: bookingField.label,
        sources: [
          {
            id: "user",
            type: "user",
            label: "User",
            fieldRequired: true,
          },
        ],
        editable: "user",
        required: bookingField.required,
        placeholder: bookingField.placeholder,
      },
    ];

    const result = transformApiEventTypeBookingFields(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform select field", () => {
    const bookingField: BookingField = {
      type: "select",
      label: "Your selection",
      required: true,
      placeholder: "Select...",
      options: ["Option 1", "Option 2"],
    };

    const input: BookingField[] = [bookingField];

    const expectedOutput: OptionsField[] = [
      {
        name: slugify(bookingField.label),
        type: bookingField.type,
        label: bookingField.label,
        sources: [
          {
            id: "user",
            type: "user",
            label: "User",
            fieldRequired: true,
          },
        ],
        editable: "user",
        required: bookingField.required,
        placeholder: bookingField.placeholder,
        options: transformSelectOptions(bookingField.options),
      },
    ];

    const result = transformApiEventTypeBookingFields(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform multiselect field", () => {
    const bookingField: BookingField = {
      type: "multiselect",
      label: "Your multiple selections",
      required: true,
      options: ["Option 1", "Option 2"],
    };

    const input: BookingField[] = [bookingField];

    const expectedOutput: OptionsField[] = [
      {
        name: slugify(bookingField.label),
        type: bookingField.type,
        label: bookingField.label,
        sources: [
          {
            id: "user",
            type: "user",
            label: "User",
            fieldRequired: true,
          },
        ],
        editable: "user",
        required: bookingField.required,
        placeholder: "",
        options: transformSelectOptions(bookingField.options),
      },
    ];

    const result = transformApiEventTypeBookingFields(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform multiemail field", () => {
    const bookingField: BookingField = {
      type: "multiemail",
      label: "Your multiple emails",
      required: true,
      placeholder: "example@example.com",
    };

    const input: BookingField[] = [bookingField];

    const expectedOutput: CommonField[] = [
      {
        name: slugify(bookingField.label),
        type: bookingField.type,
        label: bookingField.label,
        sources: [
          {
            id: "user",
            type: "user",
            label: "User",
            fieldRequired: true,
          },
        ],
        editable: "user",
        required: bookingField.required,
        placeholder: bookingField.placeholder,
      },
    ];

    const result = transformApiEventTypeBookingFields(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform checkbox field", () => {
    const bookingField: BookingField = {
      type: "checkbox",
      label: "Your checkboxes",
      required: true,
      options: ["Checkbox 1", "Checkbox 2"],
    };

    const input: BookingField[] = [bookingField];

    const expectedOutput: OptionsField[] = [
      {
        name: slugify(bookingField.label),
        type: bookingField.type,
        label: bookingField.label,
        sources: [
          {
            id: "user",
            type: "user",
            label: "User",
            fieldRequired: true,
          },
        ],
        editable: "user",
        required: bookingField.required,
        placeholder: "",
        options: transformSelectOptions(bookingField.options),
      },
    ];

    const result = transformApiEventTypeBookingFields(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform radio field", () => {
    const bookingField: BookingField = {
      type: "radio",
      label: "Your radio buttons",
      required: true,
      options: ["Radio 1", "Radio 2"],
    };

    const input: BookingField[] = [bookingField];

    const expectedOutput: OptionsField[] = [
      {
        name: slugify(bookingField.label),
        type: bookingField.type,
        label: bookingField.label,
        sources: [
          {
            id: "user",
            type: "user",
            label: "User",
            fieldRequired: true,
          },
        ],
        editable: "user",
        required: bookingField.required,
        placeholder: "",
        options: transformSelectOptions(bookingField.options),
      },
    ];

    const result = transformApiEventTypeBookingFields(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should transform boolean field", () => {
    const bookingField: BookingField = {
      type: "boolean",
      label: "Agree to terms?",
      required: true,
    };

    const input: BookingField[] = [bookingField];

    const expectedOutput: CommonField[] = [
      {
        name: slugify(bookingField.label),
        type: bookingField.type,
        label: bookingField.label,
        sources: [
          {
            id: "user",
            type: "user",
            label: "User",
            fieldRequired: true,
          },
        ],
        editable: "user",
        required: bookingField.required,
        placeholder: "",
      },
    ];

    const result = transformApiEventTypeBookingFields(input);

    expect(result).toEqual(expectedOutput);
  });
});
