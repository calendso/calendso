import { useQuery } from "@tanstack/react-query";

import { SUCCESS_STATUS } from "@calcom/platform-constants";
import type { TeamEventTypeOutput_2024_06_14 } from "@calcom/platform-types";
import type { ApiResponse, ApiSuccessResponse } from "@calcom/platform-types";

import http from "../../../lib/http";
import { useAtomsContext } from "../../useAtomsContext";

export const QUERY_KEY = "use-team-event-types";
export const useTeamEventTypes = (teamId: number) => {
  const { orgId } = useAtomsContext();
  const pathname = `/organizations/${orgId}/teams/${teamId}/event-types`;

  return useQuery({
    queryKey: [QUERY_KEY, orgId, teamId],
    queryFn: () => {
      return http?.get<ApiResponse<TeamEventTypeOutput_2024_06_14[]>>(pathname).then((res) => {
        if (res.data.status === SUCCESS_STATUS) {
          return (res.data as ApiSuccessResponse<TeamEventTypeOutput_2024_06_14[]>).data;
        }
        throw new Error(res.data.error.message);
      });
    },
    enabled: !!orgId && !!teamId,
  });
};
