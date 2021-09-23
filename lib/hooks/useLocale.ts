import { useEffect } from "react";
import { useTranslation } from "next-i18next";

type LocaleProps = {
  localeProp: string;
};

export const useLocale = (props: LocaleProps) => {
  const { i18n, t } = useTranslation("common");

  useEffect(() => {
    (async () => await i18n.changeLanguage(props.localeProp))();
  }, [i18n, props.localeProp]);

  return {
    i18n,
    locale: props.localeProp,
    t,
  };
};
