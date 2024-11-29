import type { TFunction } from "next-i18next";
import { useQueryState } from "nuqs";
import { type ReactNode, useEffect, useMemo, useRef } from "react";
import { useInView } from "react-intersection-observer";

import { DataTableSkeleton } from "@calcom/features/data-table";
import classNames from "@calcom/lib/classNames";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc";
import {
  Avatar,
  ToggleGroup,
  Badge,
  Icon,
  Tooltip,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@calcom/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@calcom/ui/components/table/TableNew";

import { useFilterContext } from "../context/provider";

interface FormCardProps {
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
  children: ReactNode;
}

function FormCard({ selectedPeriod, onPeriodChange, children }: FormCardProps) {
  const { t } = useLocale();

  return (
    <div className="border-subtle w-full rounded-md border">
      <div className="flex flex-col">
        <div className="p-4">
          <ToggleGroup
            options={[
              { label: t("per_day"), value: "perDay" },
              { label: t("per_week"), value: "perWeek" },
              { label: t("per_month"), value: "perMonth" },
            ]}
            className="w-fit"
            value={selectedPeriod}
            onValueChange={(value) => value && onPeriodChange(value)}
          />
          {children}
        </div>
      </div>
    </div>
  );
}

type RoutedToTableRow = {
  id: number;
  name: string;
  avatarUrl: string | null;
  stats: { [key: string]: number };
  performance: "above_average" | "at_average" | "below_average" | "median" | "no_data";
  totalBookings: number;
};

const getPerformanceBadge = (performance: RoutedToTableRow["performance"], t: TFunction) => {
  switch (performance) {
    case "above_average":
      return (
        <Tooltip content={t("above_average")}>
          <Badge variant="success" className="w-fit gap-1">
            <Icon name="arrow-up" className="h-3 w-3" />
          </Badge>
        </Tooltip>
      );
    case "below_average":
      return (
        <Tooltip content={t("below_average")}>
          <Badge variant="red" className="w-fit gap-1">
            <Icon name="arrow-down" className="h-3 w-3" />
          </Badge>
        </Tooltip>
      );
    case "median":
      return (
        <Tooltip content={t("median")}>
          <Badge variant="orange" className="w-fit gap-1">
            <Icon name="dot" className="h-3 w-3" />
          </Badge>
        </Tooltip>
      );
    case "at_average":
      return (
        <Tooltip content={t("at_average")}>
          <Badge variant="blue" className="w-fit gap-1">
            <Icon name="arrow-right" className="h-3 w-3" />
          </Badge>
        </Tooltip>
      );
    default:
      return (
        <Tooltip content={t("no_data")}>
          <Badge variant="gray" className="w-fit gap-1">
            <Icon name="dot" className="h-3 w-3" />
          </Badge>
        </Tooltip>
      );
  }
};

export function RoutedToPerPeriod() {
  const { t } = useLocale();
  const { filter } = useFilterContext();
  const { selectedTeamId, isAll, selectedRoutingFormId, dateRange } = filter;
  const [selectedPeriod, setSelectedPeriod] = useQueryState("selectedPeriod", {
    defaultValue: "perWeek",
  });
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "300px",
  });
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } =
    trpc.viewer.insights.routedToPerPeriod.useInfiniteQuery(
      {
        teamId: selectedTeamId ?? undefined,
        startDate: dateRange[0]?.toISOString() ?? "",
        endDate: dateRange[1]?.toISOString() ?? "",
        period: selectedPeriod as "perDay" | "perWeek" | "perMonth",
        isAll: !!isAll,
        routingFormId: selectedRoutingFormId ?? undefined,
        limit: 10,
      },
      {
        getNextPageParam: (lastPage) => {
          if (!lastPage.users.nextCursor && !lastPage.periodStats.nextCursor) {
            return undefined;
          }

          return {
            userCursor: lastPage.users.nextCursor,
            periodCursor: lastPage.periodStats.nextCursor,
          };
        },
        enabled: !!dateRange[0] && !!dateRange[1],
      }
    );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const flattenedUsers = useMemo(() => {
    const userMap = new Map();
    data?.pages.forEach((page) => {
      page.users.data.forEach((user) => {
        if (!userMap.has(user.id)) {
          userMap.set(user.id, user);
        }
      });
    });
    return Array.from(userMap.values());
  }, [data?.pages]);

  const uniquePeriods = useMemo(() => {
    if (!data?.pages) return [];

    // Get all unique periods from all pages
    const periods = new Set<string>();
    data.pages.forEach((page) => {
      page.periodStats.data.forEach((stat) => {
        periods.add(stat.period_start.toISOString());
      });
    });

    return Array.from(periods)
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime());
  }, [data?.pages]);

  const processedData: RoutedToTableRow[] = useMemo(() => {
    if (!data?.pages) return [];

    // Create a map for quick lookup of stats
    const statsMap = new Map<string, number>();
    data.pages.forEach((page) => {
      page.periodStats.data.forEach((stat) => {
        const key = `${stat.userId}-${stat.period_start.toISOString()}`;
        statsMap.set(key, stat.total);
      });
    });

    return flattenedUsers.map((user) => {
      const stats = uniquePeriods.reduce((acc, period) => {
        const key = `${user.id}-${period.toISOString()}`;
        acc[period.toISOString()] = statsMap.get(key) ?? 0;
        return acc;
      }, {} as { [key: string]: number });

      return {
        id: user.id,
        name: user.name || "",
        avatarUrl: user.avatarUrl,
        stats,
        performance: user.performance,
        totalBookings: user.totalBookings,
      };
    });
  }, [data?.pages, flattenedUsers, uniquePeriods]);

  if (isLoading) {
    return (
      <div className="w-full text-sm">
        <div className="flex h-12 items-center">
          <h2 className="text-emphasis text-md font-semibold">{t("routed_to_per_period")}</h2>
        </div>

        <FormCard selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod}>
          <div className="mt-6">
            <DataTableSkeleton columns={5} columnWidths={[200, 120, 120, 120, 120]} />
          </div>
        </FormCard>
      </div>
    );
  }

  const isCurrentPeriod = (date: Date, today: Date, selectedPeriod: string): boolean => {
    if (selectedPeriod === "perDay") {
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    } else if (selectedPeriod === "perWeek") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return date >= weekStart && date <= weekEnd;
    } else if (selectedPeriod === "perMonth") {
      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }
    return false;
  };

  return (
    <div className="w-full text-sm">
      <div className="flex h-12 items-center">
        <h2 className="text-emphasis text-md font-semibold">{t("routed_to_per_period")}</h2>
      </div>

      <FormCard selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod}>
        <div className="mt-6">
          <div
            className="scrollbar-thin border-subtle relaitve relative h-[80dvh] overflow-auto rounded-md border"
            ref={tableContainerRef}>
            <Table className="border-0">
              <TableHeader className="bg-subtle sticky top-0 z-10">
                <TableRow>
                  <TableHead className="bg-subtle sticky left-0 z-30 w-[200px]">{t("user")}</TableHead>
                  {uniquePeriods.map((period, index) => {
                    const date = period;
                    const today = new Date();

                    const isCurrent = isCurrentPeriod(date, today, selectedPeriod);

                    return (
                      <TableHead
                        key={period.toISOString()}
                        className="text-center"
                        data-is-current={isCurrent}>
                        <span className={classNames(isCurrent && "font-bold")}>
                          {date.toLocaleDateString()}
                        </span>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody className="relative">
                {processedData.map((row, index) => {
                  return (
                    <TableRow
                      key={row.id}
                      ref={index === processedData.length - 1 ? ref : undefined}
                      className="divide-muted divide-x">
                      <TableCell className="bg-default w-[200px]">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="flex cursor-pointer items-center gap-2">
                              <Avatar size="sm" imageSrc={row.avatarUrl} alt={row.name} />
                              <div className="flex flex-col gap-1 truncate">
                                <span>{row.name}</span>
                              </div>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="p-3">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-default font-medium">{row.name}</span>
                                {getPerformanceBadge(row.performance, t)}
                              </div>
                              <div className="text-subtle flex flex-col text-sm">
                                <div>
                                  {t("total_bookings_per_period")}: <Badge>{row.totalBookings}</Badge>
                                </div>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      {uniquePeriods.map((period) => {
                        return (
                          <TableCell key={period.toISOString()} className="text-center">
                            {row.stats[period.toISOString()] === 0 ? null : (
                              <>{row.stats[period.toISOString()]}</>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </FormCard>
    </div>
  );
}
