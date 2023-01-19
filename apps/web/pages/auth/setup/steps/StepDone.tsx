import { useRouter } from "next/router";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Icon } from "@calcom/ui";

const StepDone = (props: { currentStep: number; nextStepPath: string }) => {
  const router = useRouter();
  const { t } = useLocale();

  return (
    <form
      id={`wizard-step-${props.currentStep}`}
      name={`wizard-step-${props.currentStep}`}
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        router.replace(props.nextStepPath);
      }}>
      <div className="min-h-36 my-6 flex flex-col items-center justify-center">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gray-600 dark:bg-white">
          <Icon.FiCheck className="inline-block h-10 w-10 text-white dark:bg-white dark:text-gray-600" />
        </div>
        <div className="max-w-[420px] text-center">
          <h2 className="mt-6 mb-1 text-lg font-medium dark:text-gray-300">{t("all_done")}</h2>
        </div>
      </div>
    </form>
  );
};

export default StepDone;
