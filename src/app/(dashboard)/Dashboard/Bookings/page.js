"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import "./Bookings.css";
import {
  FaTrash,
  FaEdit,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTimes,
  FaDollarSign,
  FaCheckDouble,
  FaShoppingCart,
} from "react-icons/fa";

export default function BookingsTable() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & Action States
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editBooking, setEditBooking] = useState(null);
  const [saving, setSaving] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (isAdmin) fetchBookings();
  }, [isAdmin]);

  const fetchBookings = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.get("/api/Bookings/admin");
      setBookings(res.data.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    const total = bookings.length;
    const paid = bookings.filter((b) => b.paymentStatus === "paid");
    const completed = bookings.filter((b) => b.paymentStatus === "completed");
    const pending = bookings.filter((b) => b.paymentStatus === "pending");

    const totalRevenue = [...paid, ...completed].reduce((sum, b) => {
      const p = b.productId?.priceAfterDiscount || b.productId?.price || 0;
      return sum + Number(p);
    }, 0);

    return {
      total,
      paidCount: paid.length,
      completedCount: completed.length,
      pendingCount: pending.length,
      revenue: totalRevenue,
    };
  }, [bookings]);

  // Handlers - Complete Booking
  const handleMarkComplete = async (bookingId) => {
    setCompletingId(bookingId);
    setErrorMsg("");
    try {
      const res = await axios.patch(`/api/Bookings/admin/${bookingId}/complete`);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? res.data.data : b))
      );
      setSuccessMsg("Booking marked as Completed! Reserved dates freed.");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to complete booking.");
    } finally {
      setCompletingId(null);
    }
  };

  // Handlers - Delete/Cancel
  const handleDelete = (id) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setErrorMsg("");
    try {
      const res = await axios.delete(`/api/Bookings/admin/${deleteId}`);
      setBookings((prev) =>
        prev.map((b) => (b._id === deleteId ? res.data.data : b))
      );
      setSuccessMsg("Booking cancelled successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Handlers - Edit
  const handleEdit = (booking) => {
    setEditBooking({
      ...booking,
      bookingDate: booking.bookingDate
        ? new Date(booking.bookingDate).toISOString().slice(0, 10)
        : "",
      note: booking.note || "",
    });
    setEditError("");
    setShowEditPopup(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    setEditError("");
    try {
      // If paymentStatus set to completed via edit popup, use the complete endpoint to free up dates
      if (editBooking.paymentStatus === "completed") {
        const res = await axios.patch(`/api/Bookings/admin/${editBooking._id}/complete`);
        setBookings((prev) =>
          prev.map((b) => (b._id === editBooking._id ? res.data.data : b))
        );
      } else {
        const res = await axios.patch(`/api/Bookings/admin/${editBooking._id}`, {
          note: editBooking.note,
          bookingDate: editBooking.bookingDate,
          paymentStatus: editBooking.paymentStatus,
        });
        setBookings((prev) =>
          prev.map((b) => (b._id === editBooking._id ? res.data.data : b))
        );
      }

      setSuccessMsg("Booking updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
      setShowEditPopup(false);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update booking.";
      setEditError(message);
    } finally {
      setSaving(false);
    }
  };

  // Filter & Search Logic
  const filteredBookings = useMemo(() => {
    let data = [...bookings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      data = data.filter((b) => {
        const customerName = (b.address?.name || b.userId?.username || "").toLowerCase();
        const phone = (b.address?.phone || "").toLowerCase();
        const note = (b.note || "").toLowerCase();
        const productName = (b.productId?.name || "").toLowerCase();
        return (
          customerName.includes(q) ||
          phone.includes(q) ||
          note.includes(q) ||
          productName.includes(q)
        );
      });
    }

    if (statusFilter !== "all") {
      data = data.filter((b) => b.paymentStatus === statusFilter);
    }

    if (dateFilter) {
      data = data.filter(
        (b) =>
          b.bookingDate &&
          new Date(b.bookingDate).toISOString().slice(0, 10) === dateFilter
      );
    }

    return data;
  }, [bookings, searchQuery, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
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
    <div className="bookings-container dashboard-container">
      {/* Toast Alert Notifications */}
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

      {/* KPI Header Bar */}
      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon"><FaShoppingCart /></div>
          </div>
          <div className="metric-value">{metrics.total}</div>
          <div className="metric-label">Total Bookings</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon" style={{ color: "var(--status-success)" }}><FaCheckDouble /></div>
          </div>
          <div className="metric-value" style={{ color: "var(--status-success)" }}>{metrics.completedCount}</div>
          <div className="metric-label">Completed Bookings</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon" style={{ color: "var(--status-warning)" }}><FaClock /></div>
          </div>
          <div className="metric-value" style={{ color: "var(--status-warning)" }}>{metrics.pendingCount}</div>
          <div className="metric-label">Pending Bookings</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon"><FaDollarSign /></div>
          </div>
          <div className="metric-value">{metrics.revenue.toLocaleString()} EGP</div>
          <div className="metric-label">Revenue (Paid & Completed)</div>
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
          {/* Search Input */}
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
              placeholder="Search by customer, phone, item..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
              style={{ paddingLeft: "40px" }}
            />
          </div>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: "auto", minWidth: "160px" }}
          >
            <option value="all">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="form-control"
            style={{ width: "auto" }}
          />

          {(searchQuery || statusFilter !== "all" || dateFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setDateFilter("");
                setCurrentPage(1);
              }}
              className="btn-secondary"
              style={{ padding: "8px 14px", fontSize: "0.82rem" }}
            >
              Reset Filters
            </button>
          )}
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Showing <strong>{filteredBookings.length}</strong> bookings
        </div>
      </div>

      {/* Bookings Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Product Item</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Note</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="7">
                    <div className="skeleton-box skeleton-text" />
                  </td>
                </tr>
              ))
            ) : paginatedBookings.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state-box">
                    <div className="empty-state-icon">🛒</div>
                    <div className="empty-state-title">No bookings found</div>
                    <p style={{ fontSize: "0.85rem" }}>
                      Try adjusting your search query or reset the filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedBookings.map((booking) => (
                <tr key={booking._id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {booking.bookingDate
                      ? new Date(booking.bookingDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {booking.address?.name || booking.userId?.username || "Guest Customer"}
                    </div>
                    <small style={{ color: "var(--text-secondary)" }}>
                      {booking.address?.phone || "No phone registered"}
                    </small>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {booking.productId?.images?.[0] ? (
                        <img
                          src={booking.productId.images[0]}
                          alt=""
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: "1px solid var(--border-color)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "8px",
                            background: "var(--bg-input)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          N/A
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                          {booking.productId?.name || "Product"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--accent-green)" }}>
                    {booking.productId?.priceAfterDiscount || booking.productId?.price || 0} EGP
                  </td>
                  <td>
                    <span className={`badge badge-${booking.paymentStatus}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td style={{ maxWidth: "180px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    {booking.note || "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      {/* Mark as Completed Quick Action Button */}
                      {booking.paymentStatus !== "completed" && booking.paymentStatus !== "cancelled" && (
                        <button
                          className="action-btn edit-btn"
                          style={{ background: "var(--status-success-bg)", color: "var(--status-success)" }}
                          onClick={() => handleMarkComplete(booking._id)}
                          disabled={completingId === booking._id}
                          title="Mark as Completed"
                        >
                          {completingId === booking._id ? <span className="spinner-sm" /> : <FaCheckDouble />}
                        </button>
                      )}

                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(booking)}
                        title={booking.paymentStatus === "completed" || booking.paymentStatus === "cancelled" ? "View Booking Details" : "Edit Booking"}
                      >
                        <FaEdit />
                      </button>

                      {booking.paymentStatus !== "completed" && booking.paymentStatus !== "cancelled" && (
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(booking._id)}
                          title="Cancel Booking"
                        >
                          <FaTrash />
                        </button>
                      )}
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
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="page-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Delete / Cancel Confirm Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px", color: "var(--status-danger)" }}>
              ⚠️
            </div>
            <h3 style={{ margin: "0 0 10px 0" }}>Cancel Booking?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
              This will update the booking status to <strong>cancelled</strong> and return the item slot back to available stock.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteId(null)} disabled={deleting}>
                Close
              </button>
              <button className="btn-danger" style={{ flex: 1 }} onClick={confirmDelete} disabled={deleting}>
                {deleting ? <span className="spinner-sm" /> : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / View Booking Modal */}
      {showEditPopup && editBooking && (
        (() => {
          const isReadOnly = editBooking.paymentStatus === "completed" || editBooking.paymentStatus === "cancelled";
          return (
            <div className="modal-overlay" onClick={() => setShowEditPopup(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>
                    {isReadOnly ? "View Booking" : "Edit Booking"} #{editBooking._id.slice(-6)}
                  </h3>
                  <button className="modal-close" onClick={() => setShowEditPopup(false)}>
                    <FaTimes />
                  </button>
                </div>

                {isReadOnly && (
                  <div className="alert-banner" style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#3b82f6", marginBottom: "16px" }}>
                    <FaExclamationTriangle />
                    <span>This booking is <strong>{editBooking.paymentStatus}</strong> and cannot be modified.</span>
                  </div>
                )}

                {editError && (
                  <div className="alert-banner error">
                    <FaExclamationTriangle />
                    <span>{editError}</span>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Customer Details Summary */}
                  {(editBooking.customerName || editBooking.customerPhone || editBooking.customerAddress) && (
                    <div style={{ background: "var(--bg-input)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "0.88rem" }}>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>Customer Details:</div>
                      <div>👤 <strong>{editBooking.customerName}</strong> ({editBooking.customerPhone})</div>
                      {editBooking.customerAddress && <div style={{ color: "var(--text-secondary)", marginTop: "2px" }}>📍 {editBooking.customerAddress}</div>}
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Booking Date</label>
                      <input
                        type="date"
                        className="form-control"
                        disabled={isReadOnly}
                        value={editBooking.bookingDate}
                        onChange={(e) =>
                          setEditBooking({ ...editBooking, bookingDate: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Payment Status</label>
                      <select
                        className="form-select"
                        disabled={isReadOnly}
                        value={editBooking.paymentStatus}
                        onChange={(e) =>
                          setEditBooking({ ...editBooking, paymentStatus: e.target.value })
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Admin Note</label>
                    <textarea
                      className="form-control"
                      disabled={isReadOnly}
                      placeholder="Write a note about this booking..."
                      rows={4}
                      value={editBooking.note}
                      onChange={(e) =>
                        setEditBooking({ ...editBooking, note: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                  {isReadOnly ? (
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditPopup(false)}>
                      Close
                    </button>
                  ) : (
                    <>
                      <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditPopup(false)} disabled={saving}>
                        Cancel
                      </button>
                      <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveEdit} disabled={saving}>
                        {saving ? <span className="spinner-sm" /> : "Save Changes"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
