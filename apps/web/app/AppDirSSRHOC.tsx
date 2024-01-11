import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import { notFound, redirect } from "next/navigation";

export const withAppDir =
  <T extends Record<string, any> | undefined>(getServerSideProps: GetServerSideProps<NonNullable<T>>) =>
  async (context: GetServerSidePropsContext): Promise<NonNullable<T>> => {
    const ssrResponse = await getServerSideProps(context);

    if ("redirect" in ssrResponse) {
      redirect(ssrResponse.redirect.destination);
    }

    if ("notFound" in ssrResponse) {
      notFound();
    }

    return {
      ...ssrResponse.props,
      // includes dehydratedState required for future page trpcPropvider
      ...("trpcState" in ssrResponse.props && { dehydratedState: ssrResponse.props.trpcState }),
    };
  };
