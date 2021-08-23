import { GetServerSideProps } from "next";
import Shell from "@components/Shell";
import SettingsShell from "@components/Settings";
import { useEffect, useState } from "react";
import type { Session } from "next-auth";
import { useSession } from "next-auth/client";
import { UsersIcon } from "@heroicons/react/outline";
import TeamList from "@components/team/TeamList";
import TeamListItem from "@components/team/TeamListItem";
import Loader from "@components/Loader";
import { getSession } from "@lib/auth";
import EditTeam from "@components/team/EditTeam";
import MemberInvitationModal from "@components/team/MemberInvitationModal";

export default function Teams() {
  const [, loading] = useSession();
  const [teams, setTeams] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [editTeamEnabled, setEditTeamEnabled] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState();
  const [showMemberInvitationModal, setShowMemberInvitationModal] = useState(false);
  const [inviteModalTeam, setInviteModalTeam] = useState(false);

  const handleErrors = async (resp: any) => {
    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.message);
    }
    return resp.json();
  };

  const loadData = () => {
    fetch("/api/user/membership")
      .then(handleErrors)
      .then((data) => {
        setTeams(data.membership.filter((m: any) => m.role !== "INVITEE"));
        setInvites(data.membership.filter((m: any) => m.role === "INVITEE"));
      })
      .catch(console.log);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  const createTeam = (e: any) => {
    e.preventDefault();

    return fetch("/api/teams", {
      method: "POST",
      body: JSON.stringify({ name: e.target.elements["name"].value }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => {
      loadData();
      setShowCreateTeamModal(false);
    });
  };

  const editTeam = (team) => {
    setEditTeamEnabled(true);
    setTeamToEdit(team);
  };

  const inviteMember = (team: any) => {
    setShowMemberInvitationModal(true);
    setInviteModalTeam(team);
  };

  const onCloseEdit = () => {
    loadData();
    setEditTeamEnabled(false);
  };

  return (
    <Shell heading="Teams" subtitle="Create and manage teams to use collaborative features.">
      <SettingsShell>
        {!editTeamEnabled && (
          <div className="divide-y divide-gray-200 lg:col-span-9">
            <div className="py-6 lg:pb-8">
              <div className="flex flex-col justify-between md:flex-row">
                <div>
                  {!(invites.length || teams.length) && (
                    <div className="bg-gray-50 sm:rounded-sm">
                      <div className="pb-5 pr-4 sm:pb-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                          Create a team to get started
                        </h3>
                        <div className="max-w-xl mt-2 text-sm text-gray-500">
                          <p>Create your first team and invite other users to work together with you.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-start mb-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateTeamModal(true)}
                    className="btn btn-white">
                    <PlusIcon className="group-hover:text-black text-gray-700 w-3.5 h-3.5 mr-2 inline-block" />
                    New Team
                  </button>
                </div>
                {/* {!!(invites.length || teams.length) && (
                  <div>
                    <button className="mb-4 btn-sm btn-white" onClick={() => setShowCreateTeamModal(true)}>
                      + New Team
                    </button>
                  </div>
                )} */}
              </div>
              <div>
                {!!teams.length && (
                  <TeamList teams={teams} onChange={loadData} onEditTeam={editTeam}></TeamList>
                )}

                {!!invites.length && (
                  <div>
                    <h2 className="text-lg font-medium leading-6 text-gray-900">Open Invitations</h2>
                    <ul className="px-2 mt-2 mb-2 border divide-y divide-gray-200 rounded">
                      {invites.map((team) => (
                        <TeamListItem onChange={loadData} key={team.id} team={team}></TeamListItem>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/*{teamsLoaded && <div className="flex justify-between">
                <div>
                  <h2 className="mb-1 text-lg font-medium leading-6 text-gray-900">Transform account</h2>
                  <p className="mb-1 text-sm text-gray-500">
                    {membership.length !== 0 && "You cannot convert this account into a team until you leave all teams that you’re a member of."}
                    {membership.length === 0 && "A user account can be turned into a team, as a team ...."}
                  </p>
                </div>
                <div>
                  <button className="mt-2 opacity-50 cursor-not-allowed btn-sm btn-primary" disabled>Convert {session.user.username} into a team</button>
                </div>
              </div>}*/}
            </div>
          </div>
        )}
        {!!editTeamEnabled && <EditTeam team={teamToEdit} onCloseEdit={() => setEditTeamEnabled(false)} />}
        {showCreateTeamModal && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true">
            <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 z-0 transition-opacity bg-gray-500 bg-opacity-75"
                aria-hidden="true"></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <div className="inline-block px-4 pt-5 pb-4 text-left align-bottom transition-all transform bg-white rounded-sm shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="mb-4 sm:flex sm:items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto rounded-full bg-neutral-100 sm:mx-0 sm:h-10 sm:w-10">
                    <UsersIcon className="w-6 h-6 text-neutral-900" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                      Create a new team
                    </h3>
                    <div>
                      <p className="text-sm text-gray-400">Create a new team to collaborate with users.</p>
                    </div>
                  </div>
                </div>
                <form onSubmit={createTeam}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Acme Inc."
                      required
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm"
                    />
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button type="submit" className="btn btn-primary">
                      Create team
                    </button>
                    <button
                      onClick={() => setShowCreateTeamModal(false)}
                      type="button"
                      className="mr-2 btn btn-white">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {showMemberInvitationModal && (
          <MemberInvitationModal
            team={inviteModalTeam}
            onExit={() => setShowMemberInvitationModal(false)}></MemberInvitationModal>
        )}
      </SettingsShell>
    </Shell>
  );
}

// Export the `session` prop to use sessions with Server Side Rendering
export const getServerSideProps: GetServerSideProps<{ session: Session | null }> = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { permanent: false, destination: "/auth/login" } };
  }

  return {
    props: { session },
  };
};
