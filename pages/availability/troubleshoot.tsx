import Head from "next/head";
import Shell from "../../components/Shell";
import { getSession, useSession } from "next-auth/client";
import { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { GetServerSideProps } from "next";
import prisma from "@lib/prisma";
import Loader from "@components/Loader";

dayjs.extend(utc);

export default function Troubleshoot({ user }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [session, loading] = useSession();
  const [availability, setAvailability] = useState([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedDate, setSelectedDate] = useState(dayjs());

  if (loading) {
    return <Loader />;
  }

  function convertMinsToHrsMins(mins) {
    let h = Math.floor(mins / 60);
    let m = mins % 60;
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    return `${h}:${m}`;
  }

  const fetchAvailability = (date) => {
    fetch(
      `/api/availability/${session.user.username}?dateFrom=${date
        .startOf("day")
        .utc()
        .startOf("day")
        .format()}&dateTo=${date.endOf("day").utc().endOf("day").format()}`
    )
      .then((res) => {
        return res.json();
      })
      .then((apires) => setAvailability(apires))
      .catch((e) => {
        console.error(e);
      });
  };

  fetchAvailability(selectedDate);

  return (
    <div>
      <Head>
        <title>Troubleshoot | Calendso</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Shell
        heading="Troubleshoot"
        subtitle="Understand why certain times are available and others are blocked.">
        <div className="bg-white max-w-md overflow-hidden shadow rounded-sm">
          <div className="px-4 py-5 sm:p-6">
            Here is an overview of your day on {selectedDate.format("D MMMM YYYY")}:
            <small className="block text-neutral-400">
              Tip: Hover over the bold times for a full timestamp
            </small>
            <div className="mt-4 space-y-4">
              <div className="bg-black overflow-hidden rounded-sm">
                <div className="px-4 sm:px-6 py-2 text-white">
                  Your day starts at {convertMinsToHrsMins(user.startTime)}
                </div>
              </div>
              {availability.map((slot) => (
                <div key={slot.start} className="bg-neutral-100 overflow-hidden rounded-sm">
                  <div className="px-4 py-5 sm:p-6 text-black">
                    Your calendar shows you as busy between{" "}
                    <span className="font-medium text-neutral-800" title={slot.start}>
                      {dayjs(slot.start).format("HH:mm")}
                    </span>{" "}
                    and{" "}
                    <span className="font-medium text-neutral-800" title={slot.end}>
                      {dayjs(slot.end).format("HH:mm")}
                    </span>{" "}
                    on {dayjs(slot.start).format("D MMMM YYYY")}
                  </div>
                </div>
              ))}
              {availability.length === 0 && <Loader />}
              <div className="bg-black overflow-hidden rounded-sm">
                <div className="px-4 sm:px-6 py-2 text-white">
                  Your day ends at {convertMinsToHrsMins(user.endTime)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { permanent: false, destination: "/auth/login" } };
  }

  const user = await prisma.user.findFirst({
    where: {
      username: session.user.username,
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  return {
    props: { user },
  };
};
