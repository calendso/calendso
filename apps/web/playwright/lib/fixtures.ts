import { test as base } from "@playwright/test";

import { createBookingsFixture } from "../fixtures/bookings";
import { createPaymentsFixture } from "../fixtures/payments";
import { createUsersFixture } from "../fixtures/users";

interface Fixtures {
  users: ReturnType<typeof createUsersFixture>;
  bookings: ReturnType<typeof createBookingsFixture>;
  payments: ReturnType<typeof createPaymentsFixture>;
}

export const test = base.extend<Fixtures>({
  users: async ({ page }, use) => {
    const usersFixture = createUsersFixture(page);
    await use(usersFixture);
  },
  bookings: async ({ page }, use) => {
    const bookingsFixture = createBookingsFixture(page);
    await use(bookingsFixture);
  },
  payments: async ({ page }, use) => {
    const payemntsFixture = createPaymentsFixture(page);
    await use(payemntsFixture);
  },
});
