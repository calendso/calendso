import { useForm } from "react-hook-form";

import SectionBottomActions from "@calcom/features/settings/SectionBottomActions";
import { getLayout } from "@calcom/features/settings/layouts/SettingsLayout";
import { validateIntervalLimitOrder, parseBookingLimit } from "@calcom/lib";
import { APP_NAME } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import type { RouterOutputs } from "@calcom/trpc/react";
import type { IntervalLimit } from "@calcom/types/Calendar";
import { Button, Form, Meta, SkeletonContainer, SkeletonText, showToast } from "@calcom/ui";

import PageWrapper from "@components/PageWrapper";
import { BookingLimits } from "@components/eventtype/EventLimitsTab";

const SkeletonLoader = ({ title, description }: { title: string; description: string }) => {
  return (
    <SkeletonContainer>
      <Meta title={title} description={description} borderInShellHeader={false} />
      <div className="border-subtle mt-6 flex flex-col rounded-lg border px-4 py-6 sm:px-6">
        <SkeletonText className="h-6 w-1/4" />
        <SkeletonText className="mt-2 h-6 w-2/5" />
      </div>
    </SkeletonContainer>
  );
};

const BookingsView = ({ data }: { data: RouterOutputs["viewer"]["globalSettings"] }) => {
  const { t } = useLocale();
  const { globalSettings } = data;
  const bookingsLimitFormMethods = useForm({
    defaultValues: {
      bookingLimits: globalSettings?.bookingLimits,
    },
  });

  const utils = trpc.useContext();
  const updateProfileMutation = trpc.viewer.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.viewer.globalSettings.invalidate();
      bookingsLimitFormMethods.reset(bookingsLimitFormMethods.getValues());
    },
    onError: () => {
      showToast(t("failed_to_save_global_settings"), "error");
    },
  });

  const watchBookingLimits = bookingsLimitFormMethods.watch("bookingLimits");

  const showLimitFrequency = Object.keys(watchBookingLimits ?? {}).length > 0;

  return (
    <div>
      <Meta
        title={t("bookings")}
        description={t("bookings_settings_description", { appName: APP_NAME })}
        borderInShellHeader={false}
      />
      <Form
        form={bookingsLimitFormMethods}
        handleSubmit={async (values) => {
          const { bookingLimits } = values;
          const parsedBookingLimits = parseBookingLimit(bookingLimits) || {};
          if (bookingLimits) {
            const isValid = validateIntervalLimitOrder(parsedBookingLimits);
            if (!isValid) throw new Error(t("event_setup_booking_limits_error"));
          }
          updateProfileMutation.mutate({ ...values, bookingLimits: parsedBookingLimits });
        }}>
        <BookingLimits
          sectionDescription="global_limit_booking_frequency_description"
          settingsToggleClass="rounded-b-none"
          onCheckedChange={(key: string, value: IntervalLimit, shouldDirty: boolean) =>
            bookingsLimitFormMethods.setValue(key as "bookingLimits", value, { shouldDirty })
          }
          childrenContainerClassName="rounded-none border-b-0"
        />
        <SectionBottomActions align="end" className={!showLimitFrequency ? "border-t-0" : ""}>
          <Button
            color="primary"
            type="submit"
            loading={updateProfileMutation.isPending}
            disabled={!bookingsLimitFormMethods.formState.dirtyFields.bookingLimits}>
            {t("update")}
          </Button>
        </SectionBottomActions>
      </Form>
    </div>
  );
};

const BookingsViewWrapper = () => {
  const { data, isPending } = trpc.viewer.globalSettings.useQuery();

  const { t } = useLocale();

  if (isPending || !data)
    return (
      <SkeletonLoader
        title={t("bookings")}
        description={t("bookings_settings_description", { appName: APP_NAME })}
      />
    );

  return <BookingsView data={data} />;
};

BookingsViewWrapper.getLayout = getLayout;
BookingsViewWrapper.PageWrapper = PageWrapper;

export default BookingsViewWrapper;
