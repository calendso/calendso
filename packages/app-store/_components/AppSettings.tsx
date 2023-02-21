import { AppSettingsComponentsMap } from "@calcom/app-store/apps.browser.generated";

import { DynamicComponent } from "./DynamicComponent";

export const AppSettings = (props: { slug: string }) => {
  return (
    <DynamicComponent<typeof AppSettingsComponentsMap>
      wrapperClassName="border-t border-gray-200 p-6"
      componentMap={AppSettingsComponentsMap}
      {...props}
    />
  );
};
