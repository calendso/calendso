import { useQuery } from "@tanstack/react-query";

import { BASE_URL, API_VERSION, V2_ENDPOINTS, SUCCESS_STATUS } from "@calcom/platform-constants";
import type { EventTypesPublic } from "@calcom/platform-libraries";
import type { ApiResponse } from "@calcom/platform-types";

import http from "../../lib/http";

export const QUERY_KEY = "get-private-events";
export const useEventTypesPublic = (username: string) => {
  const endpoint = new URL(BASE_URL);

  endpoint.pathname = `api/${API_VERSION}/${V2_ENDPOINTS.eventTypes}/${username}/public`;

  return useQuery({
    queryKey: [QUERY_KEY, username],
    queryFn: () => {
      return http?.get<ApiResponse<EventTypesPublic>>(endpoint.toString()).then((res) => {
        if (res.data.status === SUCCESS_STATUS) {
          return res.data;
        }
        throw new Error(res.data.error.message);
      });
    },
  });
};
