"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import "./promocodes.css";
import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaSearch,
  FaPercent,
  FaTicketAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

export default function PromoCodesPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Action states
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editPromo, setEditPromo] = useState(null);
  const [newPromo, setNewPromo] = useState({ name: "", discount: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get("/api/promocode");
      setPromos(res.data.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load promo codes.");
    } finally {
      setLoading(false);
    }
  };

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = promos.length;
    const avgDiscount =
      promos.length > 0
        ? Math.round(
            promos.reduce((sum, p) => sum + Number(p.discount || 0), 0) /
              promos.length
          )
        : 0;

    return { total, avgDiscount };
  }, [promos]);

  // Handlers - Delete
  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setErrorMsg("");
    try {
      await axios.delete(`/api/promocode/${deleteId}`);
      setPromos((prev) => prev.filter((item) => item._id !== deleteId));
      setSuccessMsg("Promo code deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete promo code.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Handlers - Edit
  const handleEdit = (promo) => {
    setEditPromo({ ...promo });
    setModalError("");
    setShowEditPopup(true);
  };

  const handleSaveEdit = async () => {
    if (!editPromo.name.trim() || !editPromo.discount) {
      setModalError("Code name and discount percentage are required.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      const res = await axios.put(`/api/promocode/${editPromo._id}`, {
        name: editPromo.name,
        discount: editPromo.discount,
      });
      setPromos((prev) =>
        prev.map((item) => (item._id === editPromo._id ? res.data.data : item))
      );
      setSuccessMsg("Promo code updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
      setShowEditPopup(false);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to update promo code.");
    } finally {
      setSaving(false);
    }
  };

  // Handlers - Add
  const handleAdd = async () => {
    if (!newPromo.name.trim() || !newPromo.discount) {
      setModalError("Please provide promo code name and discount value.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      const res = await axios.post("/api/promocode", {
        name: newPromo.name,
        discount: Number(newPromo.discount),
      });

      if (res.data.status === 400) {
        setModalError(res.data.message || "Promo code already exists.");
        setSaving(false);
        return;
      }

      setPromos((prev) => [res.data.data, ...prev]);
      setSuccessMsg("Promo code created successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setNewPromo({ name: "", discount: "" });
      setShowAddPopup(false);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to add promo code.");
    } finally {
      setSaving(false);
    }
  };

  // Filter Logic
  const filteredPromos = useMemo(() => {
    if (!searchQuery.trim()) return promos;
    const q = searchQuery.toLowerCase().trim();
    return promos.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [promos, searchQuery]);

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
    <div className="promocodes-container dashboard-container">
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
            <div className="metric-icon"><FaPercent /></div>
          </div>
          <div className="metric-value">{metrics.total}</div>
          <div className="metric-label">Active Promo Codes</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon" style={{ color: "var(--accent-gold)" }}><FaTicketAlt /></div>
          </div>
          <div className="metric-value" style={{ color: "var(--accent-gold)" }}>{metrics.avgDiscount}%</div>
          <div className="metric-label">Average Discount Rate</div>
        </div>
      </div>

      {/* Control Bar */}
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
        <div style={{ position: "relative", minWidth: "260px", flex: 1 }}>
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
            placeholder="Search promo code by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: "40px" }}
          />
        </div>

        <button className="btn-primary" onClick={() => { setModalError(""); setShowAddPopup(true); }}>
          <FaPlus /> Create Promo Code
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Promo Code Name</th>
              <th>Discount Rate (%)</th>
              <th>Created Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="4">
                    <div className="skeleton-box skeleton-text" />
                  </td>
                </tr>
              ))
            ) : filteredPromos.length === 0 ? (
              <tr>
                <td colSpan="4">
                  <div className="empty-state-box">
                    <div className="empty-state-icon">🎟️</div>
                    <div className="empty-state-title">No promo codes found</div>
                    <p style={{ fontSize: "0.85rem" }}>
                      Create discounts to promote your products to customers.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPromos.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="badge badge-admin" style={{ fontSize: "0.9rem", padding: "6px 14px", letterSpacing: "0.08em" }}>
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--status-success)", fontSize: "1.05rem" }}>
                      {item.discount}% OFF
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(item)}
                        title="Edit Promo Code"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => setDeleteId(item._id)}
                        title="Delete Promo Code"
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

      {/* Add Modal */}
      {showAddPopup && (
        <div className="modal-overlay" onClick={() => setShowAddPopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="modal-header">
              <h3>New Promo Code</h3>
              <button className="modal-close" onClick={() => setShowAddPopup(false)}><FaTimes /></button>
            </div>

            {modalError && (
              <div className="alert-banner error">
                <FaExclamationTriangle />
                <span>{modalError}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label>Code Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. SUMMER20, HEYA10..."
                  value={newPromo.name}
                  onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label>Discount Percentage (%) <span className="required">*</span></label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 15"
                  min="1"
                  max="100"
                  value={newPromo.discount}
                  onChange={(e) => setNewPromo({ ...newPromo, discount: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddPopup(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAdd} disabled={saving}>
                {saving ? <span className="spinner-sm" /> : "Save Promo Code"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditPopup && editPromo && (
        <div className="modal-overlay" onClick={() => setShowEditPopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <div className="modal-header">
              <h3>Edit Promo Code</h3>
              <button className="modal-close" onClick={() => setShowEditPopup(false)}><FaTimes /></button>
            </div>

            {modalError && (
              <div className="alert-banner error">
                <FaExclamationTriangle />
                <span>{modalError}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label>Code Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editPromo.name}
                  onChange={(e) => setEditPromo({ ...editPromo, name: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label>Discount Percentage (%)</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="100"
                  value={editPromo.discount}
                  onChange={(e) => setEditPromo({ ...editPromo, discount: e.target.value })}
                />
              </div>
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
            <h3 style={{ margin: "0 0 10px 0" }}>Delete Promo Code?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
              Customers will no longer be able to use this discount code. Are you sure?
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteId(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn-danger" style={{ flex: 1 }} onClick={confirmDelete} disabled={deleting}>
                {deleting ? <span className="spinner-sm" /> : "Delete Promo Code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
