"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import "./catagories.css";
import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaSearch,
  FaTags,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

export default function CategoriesTable() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals & Action States
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get("/api/catagroy");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = categories.length;
    const latestCat = categories.length > 0 ? categories[0]?.name : "—";
    return { total, latestCat };
  }, [categories]);

  // Handlers - Delete
  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setErrorMsg("");
    try {
      await axios.delete(`/api/catagroy/${deleteId}`);
      setCategories((prev) => prev.filter((item) => item._id !== deleteId));
      setSuccessMsg("Category deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete category.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Handlers - Edit
  const handleEdit = (category) => {
    setEditCategory({ ...category });
    setModalError("");
    setShowEditPopup(true);
  };

  const handleSaveEdit = async () => {
    if (!editCategory.name.trim()) {
      setModalError("Category name cannot be empty.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      const res = await axios.put(`/api/catagroy/${editCategory._id}`, {
        name: editCategory.name,
      });
      setCategories((prev) =>
        prev.map((item) => (item._id === editCategory._id ? res.data.data : item))
      );
      setSuccessMsg("Category updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
      setShowEditPopup(false);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  // Handlers - Add
  const handleAdd = async () => {
    if (!newCategory.name.trim()) {
      setModalError("Category name is required.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      const res = await axios.post("/api/catagroy", { name: newCategory.name });
      setCategories((prev) => [res.data.data.catagroy || res.data.data, ...prev]);
      setSuccessMsg("Category created successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
      setNewCategory({ name: "" });
      setShowAddPopup(false);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to add category.");
    } finally {
      setSaving(false);
    }
  };

  // Filter & Sort Logic
  const filteredCategories = useMemo(() => {
    let data = [...categories];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      data = data.filter((c) => (c.name || "").toLowerCase().includes(q));
    }

    data.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return data;
  }, [categories, searchQuery, sortOrder]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
    <div className="products-container dashboard-container">
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
            <div className="metric-icon"><FaTags /></div>
          </div>
          <div className="metric-value">{metrics.total}</div>
          <div className="metric-label">Total Product Categories</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon" style={{ color: "var(--accent-gold)" }}><FaCalendarAlt /></div>
          </div>
          <div className="metric-value" style={{ fontSize: "1.3rem", color: "var(--accent-gold)" }}>
            {metrics.latestCat}
          </div>
          <div className="metric-label">Most Recently Added</div>
        </div>
      </div>

      {/* Search & Action Bar */}
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
              placeholder="Search category by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
              style={{ paddingLeft: "40px" }}
            />
          </div>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: "auto" }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <button className="btn-primary" onClick={() => { setModalError(""); setShowAddPopup(true); }}>
          <FaPlus /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Category Name</th>
              <th>Date Added</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="4">
                    <div className="skeleton-box skeleton-text" />
                  </td>
                </tr>
              ))
            ) : paginatedCategories.length === 0 ? (
              <tr>
                <td colSpan="4">
                  <div className="empty-state-box">
                    <div className="empty-state-icon">🏷️</div>
                    <div className="empty-state-title">No categories found</div>
                    <p style={{ fontSize: "0.85rem" }}>
                      Try creating a category to organize your products.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedCategories.map((item, index) => (
                <tr key={item._id}>
                  <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: "var(--accent-gold-glow)",
                          color: "var(--accent-gold)",
                          border: "1px solid rgba(201, 168, 107, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        {item.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{formatDate(item.createdAt)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(item)}
                        title="Edit category"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => setDeleteId(item._id)}
                        title="Delete category"
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

      {/* Add Modal */}
      {showAddPopup && (
        <div className="modal-overlay" onClick={() => setShowAddPopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="modal-header">
              <h3>Add Category</h3>
              <button className="modal-close" onClick={() => setShowAddPopup(false)}><FaTimes /></button>
            </div>

            {modalError && (
              <div className="alert-banner error">
                <FaExclamationTriangle />
                <span>{modalError}</span>
              </div>
            )}

            <div className="form-group">
              <label>Category Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Evening Gowns, Wedding Dresses..."
                value={newCategory.name}
                onChange={(e) => setNewCategory({ name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddPopup(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAdd} disabled={saving}>
                {saving ? <span className="spinner-sm" /> : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditPopup && editCategory && (
        <div className="modal-overlay" onClick={() => setShowEditPopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="modal-header">
              <h3>Edit Category</h3>
              <button className="modal-close" onClick={() => setShowEditPopup(false)}><FaTimes /></button>
            </div>

            {modalError && (
              <div className="alert-banner error">
                <FaExclamationTriangle />
                <span>{modalError}</span>
              </div>
            )}

            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                className="form-control"
                value={editCategory.name}
                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                autoFocus
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditPopup(false)} disabled={saving}>
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
            <h3 style={{ margin: "0 0 10px 0" }}>Delete Category?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
              Products under this category may become uncategorized. Are you sure?
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteId(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn-danger" style={{ flex: 1 }} onClick={confirmDelete} disabled={deleting}>
                {deleting ? <span className="spinner-sm" /> : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
