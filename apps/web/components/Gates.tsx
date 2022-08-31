import { Dispatch, useState, useEffect } from "react";
import { JSONObject } from "superjson/dist/types";

import RainbowGate from "@calcom/app-store/rainbow/components/RainbowKit";

import { GateState } from "@components/booking/pages/AvailabilityPage";

export type Gate = undefined | "rainbow"; // Add more like ` | "geolocation" | "payment"`

type GateProps = {
  children: React.ReactNode;
  gates: Gate[];
  metadata: JSONObject;
  dispatch: Dispatch<Partial<GateState>>;
};

// To add a new Gate just add the gate logic to the switch statement
const Gates: React.FC<GateProps> = ({ children, gates, metadata, dispatch }) => {
  const [rainbowToken, setRainbowToken] = useState<string>();

  useEffect(() => {
    dispatch({ rainbowToken });
  }, [rainbowToken, dispatch]);

  let gateWrappers = <>{children}</>;

  // Recursively wraps the `gateWrappers` with new gates allowing for multiple gates
  for (const gate of gates) {
    switch (gate) {
      case "rainbow":
        if (metadata.blockchainId && metadata.smartContractAddress && !rainbowToken) {
          gateWrappers = (
            <RainbowGate
              setToken={setRainbowToken}
              chainId={metadata.blockchainId as number}
              tokenAddress={metadata.smartContractAddress as string}>
              {gateWrappers}
            </RainbowGate>
          );
        }
    }
  }

  return gateWrappers;
};

export default Gates;
