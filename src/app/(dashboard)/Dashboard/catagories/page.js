"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import "./catagories.css";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";

export default function CategoriesTable() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "" });
  const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
        const res = await axios.get("/api/catagroy");
        console.log("tst152",res.data.data)
      setCategories(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };



  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDelete = (id) => setDeleteId(id);

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/catagroy/${deleteId}`);
      setCategories((prev) => prev.filter((item) => item._id !== deleteId));
    } catch (err) {
      console.log(err);
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (category) => {
    setEditCategory({ ...category });
    setShowEditPopup(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
   

      const res = await axios.put(`/api/catagroy/${editCategory._id}`, { name:editCategory.name});
      setCategories((prev) =>
        prev.map((item) => (item._id === editCategory._id ? res.data.data : item))
      );
      setShowEditPopup(false);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newCategory.name.trim()) return;
    setSaving(true);
    try {
    

        const res = await axios.post("/api/catagroy", { name: newCategory.name });
        console.log(res)
      setCategories((prev) => [res.data.data.catagroy, ...prev]);
      setNewCategory({ name: "" });
      setShowAddPopup(false);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sortedCategories = useMemo(() => {
    const data = [...categories];
    data.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    return data;
  }, [categories, sortOrder]);
      // ── Guard ─────────────────────────────────────────────────────────────────




  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const paginatedCategories = sortedCategories.slice(
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

  return (
    <div className="products-container">
      <div className="page-header">
        <div>
          <h2 className="title">Categories</h2>
          <p className="subtitle">{categories.length} categories total</p>
        </div>
        <div className="header-actions">
   
          <button className="add-btn" onClick={() => setShowAddPopup(true)}>
            <FaPlus /> Add Category
          </button>
        </div>
      </div>

      {/* Sort filter */}
      <div className="filters">
        <select
          value={sortOrder}
          onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Category Name</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="4">
                      <div className="skeleton" />
                    </td>
                  </tr>
                ))
              : paginatedCategories.map((item, index) => (
                  <tr key={item._id}>
                    <td className="row-num">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="product-name">
                      <div className="cat-name-cell">
                        <div className="cat-initial">
                          {item.name?.charAt(0)?.toUpperCase()}
                        </div>
                        {item.name}
                      </div>
                    </td>
                    <td className="date-cell">{formatDate(item.createdAt)}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(item)}
                          title="Edit category"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(item._id)}
                          title="Delete category"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

            {!loading && paginatedCategories.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-state">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
          ← Prev
        </button>
        <span className="page-info">
          Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
        </span>
        <button
          disabled={currentPage >= totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next →
        </button>
      </div>

      {/* ── Delete Confirm Modal ─────────────────────────── */}
      {deleteId && (
        <div className="popup-overlay" onClick={() => setDeleteId(null)}>
          <div className="popup delete-popup" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon-big">🗑️</div>
            <h3>Delete Category?</h3>
            <p>
              This action cannot be undone. Products linked to this category may be
              affected.
            </p>
            <div className="popup-buttons">
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="btn-delete-confirm" onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Modal ────────────────────────────────────── */}
      {showAddPopup && (
        <div className="popup-overlay" onClick={() => setShowAddPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Add Category</h3>
              <button className="popup-close" onClick={() => setShowAddPopup(false)}>✕</button>
            </div>

            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                placeholder="e.g. Electronics"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                autoFocus
              />
            </div>

            <div className="popup-buttons">
              <button className="btn-cancel" onClick={() => setShowAddPopup(false)}>
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleAdd}
                disabled={saving || !newCategory.name.trim()}
              >
                {saving ? "Adding…" : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ───────────────────────────────────── */}
      {showEditPopup && (
        <div className="popup-overlay" onClick={() => setShowEditPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Edit Category</h3>
              <button className="popup-close" onClick={() => setShowEditPopup(false)}>✕</button>
            </div>

            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                placeholder="Category name"
                value={editCategory.name}
                onChange={(e) =>
                  setEditCategory({ ...editCategory, name: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                autoFocus
              />
            </div>

            <div className="popup-buttons">
              <button className="btn-cancel" onClick={() => setShowEditPopup(false)}>
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveEdit}
                disabled={saving || !editCategory.name.trim()}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
