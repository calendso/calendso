import React from "react";
import { HttpException } from "@lib/core/error/http";

type Props = {
  hasRunOnServer: boolean;
};

const TestErrorRoute: React.FC<Props> = (props) => {
  if (!props.hasRunOnServer) {
    throw new HttpException({ status: 400, message: "test-error.tsx" });
  }
  return <>If you see this message, there is really something wrong ;)</>;
};

// Having a page that always throws error is very hard with nextjs
// because it will try to pre-render the page at build-time... and
// complain: 'you need to fix this'. So here because we want to always
// throw an error for monitoring, let's force server side generation
// all the time (the page won't be pre-generated, all cool).
export async function getServerSideProps() {
  return {
    props: {
      hasRunOnServer: false,
    },
  };
}

export default TestErrorRoute;
