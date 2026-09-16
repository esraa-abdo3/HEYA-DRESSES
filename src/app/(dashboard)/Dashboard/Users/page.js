"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import "./Users.css";
import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaSearch,
  FaUsers,
  FaUserShield,
  FaUser,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

export default function UsersPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals & Action States
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalError, setModalError] = useState("");

  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "customer",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get("/api/Users");
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const adminCount = users.filter((u) => u.role === "admin").length;
    const customerCount = users.filter((u) => u.role === "customer").length;

    return { total, adminCount, customerCount };
  }, [users]);

  // Handlers - Delete
  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setErrorMsg("");
    try {
      await axios.delete(`/api/Users/${deleteId}`);
      setUsers((prev) => prev.filter((u) => u._id !== deleteId));
      setSuccessMsg("User removed successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete user.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Handlers - Edit
  const handleEdit = (user) => {
    setEditUser({ ...user });
    setModalError("");
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!editUser.username) {
      setModalError("Username is required.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      const res = await axios.put(`/api/Users/${editUser._id}`, editUser);
      setUsers((prev) =>
        prev.map((u) => (u._id === editUser._id ? res.data.data : u))
      );
      setSuccessMsg("User updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
      setShowEdit(false);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  // Handlers - Add
  const handleAdd = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setModalError("Please fill in username, email, and password.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      const res = await axios.post("/api/Users", newUser);
      setUsers((prev) => [res.data.data, ...prev]);
      setSuccessMsg("New user created successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
      resetAddForm();
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  const resetAddForm = () => {
    setNewUser({
      username: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      role: "customer",
    });
    setModalError("");
    setShowAdd(false);
  };

  // Search & Filter Logic
  const filteredUsers = useMemo(() => {
    let data = [...users];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      data = data.filter((u) => {
        const name = (u.username || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const phone = (u.phone || "").toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q);
      });
    }

    if (roleFilter !== "all") {
      data = data.filter((u) => u.role === roleFilter);
    }

    return data;
  }, [users, searchQuery, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (status === "loading") {
    return (
      <div className="auth-state">
        <div className="spinner-md" />
        <p>Checking permissions…</p>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return null;
  }

  return (
    <div className="users-container dashboard-container">
      {/* Toast Notifications */}
      {successMsg && (
        <div className="alert-banner success">
          <FaCheckCircle />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert-banner error">
          <FaExclamationTriangle />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon"><FaUsers /></div>
          </div>
          <div className="metric-value">{metrics.total}</div>
          <div className="metric-label">Total Accounts</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon" style={{ color: "var(--accent-gold)" }}><FaUserShield /></div>
          </div>
          <div className="metric-value" style={{ color: "var(--accent-gold)" }}>{metrics.adminCount}</div>
          <div className="metric-label">Administrators</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon" style={{ color: "var(--status-info)" }}><FaUser /></div>
          </div>
          <div className="metric-value" style={{ color: "var(--status-info)" }}>{metrics.customerCount}</div>
          <div className="metric-label">Customers</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
          {/* Search */}
          <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
            <FaSearch
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
              style={{ paddingLeft: "40px" }}
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: "auto" }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
          </select>
        </div>

        <button className="btn-primary" onClick={() => { setModalError(""); setShowAdd(true); }}>
          <FaPlus /> Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email Address</th>
              <th>Phone</th>
              <th>Role</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="5">
                    <div className="skeleton-box skeleton-text" />
                  </td>
                </tr>
              ))
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="empty-state-box">
                    <div className="empty-state-icon">👤</div>
                    <div className="empty-state-title">No users found</div>
                    <p style={{ fontSize: "0.85rem" }}>
                      Try adjusting your search filters or add a new account.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="user-avatar" style={{ width: "36px", height: "36px", fontSize: "0.85rem" }}>
                        {u.username?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div style={{ fontWeight: 600 }}>{u.username}</div>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{u.phone || "—"}</td>
                  <td>
                    <span className={`badge badge-${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(u)}
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => setDeleteId(u._id)}
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            ← Prev
          </button>
          <span className="page-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}

      {/* Add User Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={resetAddForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New User Account</h3>
              <button className="modal-close" onClick={resetAddForm}><FaTimes /></button>
            </div>

            {modalError && (
              <div className="alert-banner error">
                <FaExclamationTriangle />
                <span>{modalError}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label>Username <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. JohnDoe"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. john@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Password <span className="required">*</span></label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. +201000000000"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>User Role</label>
                  <select
                    className="form-select"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="customer">Customer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={resetAddForm} disabled={saving}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAdd} disabled={saving}>
                {saving ? <span className="spinner-sm" /> : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEdit && editUser && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User: {editUser.username}</h3>
              <button className="modal-close" onClick={() => setShowEdit(false)}><FaTimes /></button>
            </div>

            {modalError && (
              <div className="alert-banner error">
                <FaExclamationTriangle />
                <span>{modalError}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={editUser.username}
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editUser.phone || ""}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    className="form-select"
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  >
                    <option value="customer">Customer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowEdit(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveEdit} disabled={saving}>
                {saving ? <span className="spinner-sm" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px", color: "var(--status-danger)" }}>🗑️</div>
            <h3 style={{ margin: "0 0 10px 0" }}>Delete User Account?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
              This action cannot be undone. Are you sure you want to delete this user?
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteId(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn-danger" style={{ flex: 1 }} onClick={confirmDelete} disabled={deleting}>
                {deleting ? <span className="spinner-sm" /> : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}