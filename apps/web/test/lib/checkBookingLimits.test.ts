import dayjs from "@calcom/dayjs";
import { checkBookingLimits, checkLimit } from "@calcom/lib/server";
import { BookingLimit } from "@calcom/types/Calendar";

import { prismaMock } from "../../../../tests/config/singleton";

type Mockdata = {
  id: number;
  startDate: Date;
  bookingLimits: BookingLimit;
};

const MOCK_DATA: Mockdata = {
  id: 1,
  startDate: dayjs("2022-09-30T09:00:00+01:00").toDate(),
  bookingLimits: {
    PER_DAY: 1,
  },
};

describe("Check Booking Limits Tests", () => {
  it("Should return no errors", async () => {
    prismaMock.booking.count.mockResolvedValue(0);
    expect(
      checkBookingLimits(MOCK_DATA.bookingLimits, MOCK_DATA.startDate, MOCK_DATA.id)
    ).resolves.toBeTruthy();
  });
  it("Should throw an error", async () => {
    // Mock there being two a day
    prismaMock.booking.count.mockResolvedValue(2);
    expect(
      checkBookingLimits(MOCK_DATA.bookingLimits, MOCK_DATA.startDate, MOCK_DATA.id)
    ).rejects.toThrowError();
  });

  it("Should pass with multiple booking limits", async () => {
    prismaMock.booking.count.mockResolvedValue(0);
    expect(
      checkBookingLimits(
        {
          PER_DAY: 1,
          PER_WEEK: 2,
        },
        MOCK_DATA.startDate,
        MOCK_DATA.id
      )
    ).resolves.toBeTruthy();
  });
  it("Should handle mutiple limits correctly", async () => {
    prismaMock.booking.count.mockResolvedValue(1);
    expect(
      checkLimit({
        key: "PER_DAY",
        limitingNumber: 2,
        eventStartDate: MOCK_DATA.startDate,
        eventId: MOCK_DATA.id,
      })
    ).resolves.not.toThrow();
    prismaMock.booking.count.mockResolvedValue(3);
    expect(
      checkLimit({
        key: "PER_WEEK",
        limitingNumber: 2,
        eventStartDate: MOCK_DATA.startDate,
        eventId: MOCK_DATA.id,
      })
    ).rejects.toThrowError();
  });
});
