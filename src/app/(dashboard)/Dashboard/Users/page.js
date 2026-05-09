"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Users.css";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // modals
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [editUser, setEditUser] = useState(null);

  // pagination + filter
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [roleFilter, setRoleFilter] = useState("all");

  // add user
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "customer",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/Users");
      setUsers(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };


  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/Users/${deleteId}`);
      setUsers((prev) => prev.filter((u) => u._id !== deleteId));
    } catch (err) {
      console.log(err);
    } finally {
      setDeleteId(null);
    }
  };

  


  const handleEdit = (user) => {
    setEditUser(user);
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(
        `/api/Users/${editUser._id}`,
        editUser
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === editUser._id ? res.data.data : u))
      );

      setShowEdit(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="users-container">

  
      <div className="page-header">
        <h2>Users</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </select>


        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="5">
                      <div className="skeleton"></div>
                    </td>
                  </tr>
                ))
              : paginatedUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || "-"}</td>
                    <td>
                      <span className={`role ${u.role}`}>
                        {u.role}
                      </span>
                    </td>

                    <td>
                      <div className="actions">
                        <button onClick={() => handleEdit(u)}>
                          <FaEdit />
                        </button>

                        <button onClick={() => setDeleteId(u._id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

        <span>
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* ── ADD USER ── */}
      {showAdd && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Add User</h3>

            <input
              placeholder="Username"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
            />

            <input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />

            <input
              placeholder="Password"
              type="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />

            <input
              placeholder="Phone"
              value={newUser.phone}
              onChange={(e) =>
                setNewUser({ ...newUser, phone: e.target.value })
              }
            />

            <input
              placeholder="Address"
              value={newUser.address}
              onChange={(e) =>
                setNewUser({ ...newUser, address: e.target.value })
              }
            />

            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>

            <div className="popup-buttons">
              <button onClick={() => setShowAdd(false)}>Cancel</button>
              <button onClick={handleAdd}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT USER ── */}
      {showEdit && editUser && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Edit User</h3>

            <input
              value={editUser.username}
              onChange={(e) =>
                setEditUser({ ...editUser, username: e.target.value })
              }
            />

            <input
              value={editUser.phone || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, phone: e.target.value })
              }
            />

            <input
              value={editUser.address || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, address: e.target.value })
              }
            />

            <select
              value={editUser.role}
              onChange={(e) =>
                setEditUser({ ...editUser, role: e.target.value })
              }
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>

            <div className="popup-buttons">
              <button onClick={() => setShowEdit(false)}>Cancel</button>
              <button onClick={handleSaveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE ── */}
      {deleteId && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Delete User?</h3>

            <div className="popup-buttons">
              <button onClick={() => setDeleteId(null)}>Cancel</button>
              <button onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}