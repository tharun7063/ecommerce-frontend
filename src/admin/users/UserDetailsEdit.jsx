import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useStore from "../../store/useStore";

const UserDetailsEdit = () => {
  const { uid } = useParams(); // UID from URL
  const navigate = useNavigate();
  const backend_url = useStore((state) => state.backend_url);
  const token = useStore((state) => state.token);
  const refreshAuth = useStore((state) => state.refreshAuth);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching details for UID:", uid);

    const fetchUser = async () => {
      try {
        let authToken = await refreshAuth();
        if (!authToken) authToken = token;
        if (!authToken) return;

        const res = await fetch(`${backend_url}/auth/${uid}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [backend_url, token, refreshAuth, uid]);

  if (loading) return <p>Loading user details...</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <div>
      {/* Header with back icon */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-200"
          aria-label="Go Back"
        >
          {/* Back Arrow SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-semibold">Edit User</h2>
      </div>

      {/* User details table */}
      <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden shadow">
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-2 font-medium bg-gray-100 rounded-tl-lg">
              Email
            </td>
            <td className="px-4 py-2 rounded-tr-lg">{user.email}</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2 font-medium bg-gray-100">Role</td>
            <td className="px-4 py-2">{user.role_name}</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2 font-medium bg-gray-100">Phone</td>
            <td className="px-4 py-2">{user.phone_number}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-medium bg-gray-100 rounded-bl-lg">
              Country
            </td>
            <td className="px-4 py-2 rounded-br-lg">{user.country_code}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default UserDetailsEdit;
