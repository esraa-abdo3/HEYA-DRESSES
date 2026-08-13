"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import "./Bookings.css";
import { FaTrash, FaEdit } from "react-icons/fa";

export default function BookingsTable() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editBooking, setEditBooking] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (isAdmin) fetchBookings();
  }, [isAdmin]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("/api/Bookings/admin");
      setBookings(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleDelete = (id) => setDeleteId(id);

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/Bookings/admin/${deleteId}`);
      setBookings((prev) => prev.filter((b) => b._id !== deleteId));
    } catch (err) {
      console.log(err);
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (booking) => {
    setEditBooking({
      ...booking,
      bookingDate: booking.bookingDate
        ? new Date(booking.bookingDate).toISOString().slice(0, 10)
        : "",
      note: booking.note || "",
    });
    setShowEditPopup(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await axios.patch(`/api/Bookings/admin/${editBooking._id}`, {
        note: editBooking.note,
        bookingDate: editBooking.bookingDate,
        paymentStatus: editBooking.paymentStatus,
      });
      setBookings((prev) =>
        prev.map((b) => (b._id === editBooking._id ? res.data.data : b))
      );
      setShowEditPopup(false);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    let data = [...bookings];
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
  }, [bookings, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (status === "loading") {
    return (
      <div className="auth-state">
        <div className="auth-spinner" />
        <p>Checking permissions…</p>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <div className="forbidden-screen">
        <div className="forbidden-card">
          <div className="forbidden-icon">⛔</div>
          <h2>Access Denied</h2>
          <p>
            {!session
              ? "You must be signed in to view this page."
              : "You don't have permission to access this area. Admins only."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <div className="page-header">
        <div>
          <h2 className="title">Bookings</h2>
          <p className="subtitle">{bookings.length} bookings total</p>
        </div>
        <div className="header-actions">
          <span className="admin-badge">Admin Panel</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <select
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
          <option value="failed">Failed</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setCurrentPage(1);
          }}
        />
        {dateFilter && (
          <button className="btn-cancel" onClick={() => setDateFilter("")}>
            Clear date
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Booking Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="7">
                      <div className="skeleton" />
                    </td>
                  </tr>
                ))
              : paginatedBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      {booking.bookingDate
                        ? new Date(booking.bookingDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      {booking.address?.name || booking.userId?.username || "Guest"}
                      <br />
                      <small>{booking.address?.phone}</small>
                    </td>
                    <td className="booking-items">
                      {booking.items?.map((item, i) => (
                        <span key={i}>
                          {item.productId?.name || "Deleted product"} × {item.quantity}
                        </span>
                      ))}
                    </td>
                    <td className="price">{booking.totalPrice} EGP</td>
                    <td>
                      <span className={`status ${booking.paymentStatus}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="note-cell">{booking.note || "—"}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(booking)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(booking._id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

            {!loading && paginatedBookings.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-state">
                  No bookings found.
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

      {/* ── Delete Modal ─────────────────────────── */}
      {deleteId && (
        <div className="popup-overlay" onClick={() => setDeleteId(null)}>
          <div className="popup delete-popup" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon-big">🗑️</div>
            <h3>Delete Booking?</h3>
            <p>
              This will cancel the booking and return the reserved items back to stock.
              This action cannot be undone.
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

      {/* ── Edit Modal ───────────────────────────── */}
      {showEditPopup && editBooking && (
        <div className="popup-overlay" onClick={() => setShowEditPopup(false)}>
          <div className="popup popup-wide" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Edit Booking</h3>
              <button className="popup-close" onClick={() => setShowEditPopup(false)}>
                ✕
              </button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Booking Date</label>
                <input
                  type="date"
                  value={editBooking.bookingDate}
                  onChange={(e) =>
                    setEditBooking({ ...editBooking, bookingDate: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-select"
                  value={editBooking.paymentStatus}
                  onChange={(e) =>
                    setEditBooking({ ...editBooking, paymentStatus: e.target.value })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Note</label>
              <textarea
                placeholder="Write a note about this booking (optional)"
                value={editBooking.note}
                onChange={(e) => setEditBooking({ ...editBooking, note: e.target.value })}
                rows={4}
              />
            </div>

            <div className="popup-buttons">
              <button className="btn-cancel" onClick={() => setShowEditPopup(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveEdit} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
