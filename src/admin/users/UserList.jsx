import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useStore from "../../store/useStore";

const UserList = () => {
  const backend_url = useStore((state) => state.backend_url);
  const token = useStore((state) => state.token);
  const refreshAuth = useStore((state) => state.refreshAuth);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let authToken = await refreshAuth();
        if (!authToken) authToken = token;
        if (!authToken) return;

        const res = await fetch(`${backend_url}/auth`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [backend_url, token, refreshAuth]);

  if (loading) return <p>Loading users...</p>;
  if (users.length === 0) return <p>No users found.</p>;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.auth_type.toLowerCase().includes(search.toLowerCase()) ||
      user.role_name.toLowerCase().includes(search.toLowerCase()) ||
      (user.phone_number || "").includes(search) ||
      (user.country_code || "").includes(search);

    const matchesRole =
      filterRole === "All" ? true : user.role_name.toLowerCase() === filterRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Users List</h2>

      {/* Search & Filter */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-1 rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border px-3 py-1 rounded"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option>All</option>
          <option>Seller</option>
          <option>Admin</option>
          <option>Support</option>
          <option>Customer</option>
        </select>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border text-left">Auth Type</th>
              <th className="px-4 py-2 border text-left">Email</th>
              <th className="px-4 py-2 border text-left">Role</th>
              <th className="px-4 py-2 border text-left">Country</th>
              <th className="px-4 py-2 border text-left">Phone</th>
              <th className="px-4 py-2 border text-right">Verified</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.uid}>
                <td className="px-4 py-2 border text-left">
                  <Link
                    to={`/admin/user/${user.uid}`} // Pass UID
                    className="text-orange-600 hover:underline"
                  >
                    {user.auth_type}
                  </Link>
                </td>
                <td className="px-4 py-2 border text-left">{user.email}</td>
                <td className="px-4 py-2 border text-left">{user.role_name}</td>
                <td className="px-4 py-2 border text-left">{user.country_code || "-"}</td>
                <td className="px-4 py-2 border text-left">{user.phone_number || "-"}</td>
                <td className="px-4 py-2 border text-right">{user.is_verified ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
