import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { App } from "@calcom/types/App";

import AppCard from "./AppCard";
import Slider from "./Slider";

const TrendingAppsSlider = <T extends App>({ items }: { items: T[] }) => {
  const { t } = useLocale();

  return (
    <Slider<T>
      className="mb-16"
      title={t("trending_apps")}
      items={items.filter((app) => !!app.trending)}
      itemKey={(app) => app.name}
      options={{
        perView: 3,
        breakpoints: {
          768 /* and below */: {
            perView: 1,
          },
        },
      }}
      renderItem={(app) => (
        <AppCard
          key={app.name}
          name={app.name}
          slug={app.slug}
          description={app.description}
          logo={app.logo}
          rating={app.rating}
          reviews={app.reviews}
          isProOnly={app.isProOnly}
        />
      )}
    />
  );
};

export default TrendingAppsSlider;
