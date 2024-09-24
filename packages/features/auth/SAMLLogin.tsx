import { signIn } from "next-auth/react";
import type { Dispatch, SetStateAction } from "react";
import { useFormContext } from "react-hook-form";
import z from "zod";

import { HOSTED_CAL_FEATURES } from "@calcom/lib/constants";
import { useLastUsed, LastUsed } from "@calcom/lib/hooks/useLastUsed";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui";

interface Props {
  samlTenantID: string;
  samlProductID: string;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
}

const schema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
});

export function SAMLLogin({ samlTenantID, samlProductID, setErrorMessage }: Props) {
  const { t } = useLocale();
  const methods = useFormContext();
  const [lastUsed, setLastUsed] = useLastUsed();

  const mutation = trpc.viewer.public.samlTenantProduct.useMutation({
    onSuccess: async (data) => {
      setLastUsed("saml");
      await signIn("saml", {}, { tenant: data.tenant, product: data.product });
    },
    onError: (err) => {
      setErrorMessage(t(err.message));
    },
  });

  return (
    <Button
      color="minimal"
      data-testid="saml"
      className="text-brand-500 font-medium p-0 h-auto"
      onClick={async (event) => {
        event.preventDefault();

        if (!HOSTED_CAL_FEATURES) {
          await signIn("saml", {}, { tenant: samlTenantID, product: samlProductID });
          return;
        }

        // Hosted solution, fetch tenant and product from the backend
        const email = methods.getValues("email");
        const parsed = schema.safeParse({ email });

        if (!parsed.success) {
          const {
            fieldErrors: { email },
          } = parsed.error.flatten();

          setErrorMessage(email ? email[0] : null);
          return;
        }

        mutation.mutate({
          email,
        });
      }}>
      <span>{t("saml_sso")}</span>
    </Button>
  );
}
