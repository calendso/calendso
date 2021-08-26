import { UsersIcon } from "@heroicons/react/outline";
import { useState } from "react";
import Button from "@components/ui/Button";

export default function MemberInvitationModal(props) {
  const [errorMessage, setErrorMessage] = useState("");

  const handleError = async (res) => {
    const responseData = await res.json();

    if (res.ok === false) {
      setErrorMessage(responseData.message);
      throw new Error(responseData.message);
    }

    return responseData;
  };

  const inviteMember = (e) => {
    e.preventDefault();

    const payload = {
      role: e.target.elements["role"].value,
      usernameOrEmail: e.target.elements["inviteUser"].value,
      sendEmailInvitation: e.target.elements["sendInviteEmail"].checked,
    };

    return fetch("/api/teams/" + props.team.id + "/invite", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(handleError)
      .then(props.onExit)
      .catch(() => {
        // do nothing.
      });
  };

  return (
    <div
      className="fixed z-50 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 z-0 bg-opacity-75 transition-opacity"
          aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start mb-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-black bg-opacity-5 sm:mx-0 sm:h-10 sm:w-10">
              <UsersIcon className="h-6 w-6 text-black" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Invite a new member
              </h3>
              <div>
                <p className="text-sm text-gray-400">Invite someone to your team.</p>
              </div>
            </div>
          </div>
          <form onSubmit={inviteMember}>
            <div>
              <div className="mb-4">
                <label htmlFor="inviteUser" className="block text-sm font-medium text-gray-700">
                  Email or Username
                </label>
                <input
                  type="text"
                  name="inviteUser"
                  id="inviteUser"
                  placeholder="email@example.com"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block tracking-wide text-gray-700 text-sm font-medium mb-2" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  className="shadow-sm focus:ring-black focus:border-black mt-1 block w-full sm:text-sm border-gray-300 rounded-md">
                  <option value="MEMBER">Member</option>
                  <option value="OWNER">Owner</option>
                </select>
              </div>
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="sendInviteEmail"
                    defaultChecked
                    id="sendInviteEmail"
                    className="text-black shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <div className="ml-2 text-sm">
                  <label htmlFor="sendInviteEmail" className="font-medium text-gray-700">
                    Send an invite email
                  </label>
                </div>
              </div>
            </div>
            {errorMessage && (
              <p className="text-red-700 text-sm">
                <span className="font-bold">Error: </span>
                {errorMessage}
              </p>
            )}
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                color="primary">
                  Invite
              </Button>                 
              <Button
                type="button"
                color="secondary" 
                onClick={props.onExit}>
                  Cancel
              </Button>                 
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
