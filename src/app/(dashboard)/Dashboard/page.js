"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import "../dashboard.css";

import {
  FaDollarSign,
  FaShoppingCart,
  FaBoxOpen,
  FaUsers,
  FaPercent,
  FaExclamationTriangle,
  FaArrowUp,
  FaPlus,
  FaEye,
  FaUserPlus,
  FaTicketAlt,
} from "react-icons/fa";

export default function DashboardHome() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [bookingsRes, productsRes, usersRes, catRes, promoRes] = await Promise.allSettled([
        axios.get("/api/Bookings/admin"),
        axios.get("/api/Products"),
        axios.get("/api/Users"),
        axios.get("/api/catagroy"),
        axios.get("/api/promocode"),
      ]);

      if (bookingsRes.status === "fulfilled") {
        setBookings(bookingsRes.value.data.data || []);
      }
      if (productsRes.status === "fulfilled") {
        setProducts(productsRes.value.data.data || []);
      }
      if (usersRes.status === "fulfilled") {
        setUsers(usersRes.value.data.data || []);
      }
      if (catRes.status === "fulfilled") {
        setCategories(catRes.value.data.data || []);
      }
      if (promoRes.status === "fulfilled") {
        setPromos(promoRes.value.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard metrics. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const stats = useMemo(() => {
    const paidBookings = bookings.filter((b) => b.paymentStatus === "paid");
    const completedBookings = bookings.filter((b) => b.paymentStatus === "completed");
    const pendingBookings = bookings.filter((b) => b.paymentStatus === "pending");
    const cancelledBookings = bookings.filter((b) => b.paymentStatus === "cancelled");

    const totalRevenue = [...paidBookings, ...completedBookings].reduce((sum, b) => {
      const price = b.productId?.priceAfterDiscount || b.productId?.price || 0;
      return sum + Number(price);
    }, 0);

    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 3);
    const outOfStockProducts = products.filter((p) => p.stock === 0);

    return {
      revenue: totalRevenue,
      totalBookings: bookings.length,
      paidCount: paidBookings.length,
      completedCount: completedBookings.length,
      pendingCount: pendingBookings.length,
      cancelledCount: cancelledBookings.length,
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalUsers: users.length,
      totalCategories: categories.length,
      totalPromos: promos.length,
      lowStockProducts,
    };
  }, [bookings, products, users, categories, promos]);

  const recentBookings = useMemo(() => {
    return bookings.slice(0, 5);
  }, [bookings]);

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="overview-header">
        <div className="welcome-banner">
          <div className="welcome-text">
            <h2>👋 Welcome back, Ayat!</h2>
            <p>
              Here's what's happening with your store today. Manage bookings, monitor product inventory, track revenue, and update order fulfillment.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert-banner error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {/* Revenue */}
        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon">
              <FaDollarSign />
            </div>
            <div className="metric-trend up">
              <FaArrowUp /> +14%
            </div>
          </div>
          {loading ? (
            <div className="skeleton-box skeleton-text" style={{ width: "60%", height: "28px" }} />
          ) : (
            <div className="metric-value">{stats.revenue.toLocaleString()} EGP</div>
          )}
          <div className="metric-label">Total Earned Revenue</div>
        </div>

        {/* Bookings */}
        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon">
              <FaShoppingCart />
            </div>
            <div className="metric-trend up">
              {stats.completedCount} Completed
            </div>
          </div>
          {loading ? (
            <div className="skeleton-box skeleton-text" style={{ width: "40%", height: "28px" }} />
          ) : (
            <div className="metric-value">{stats.totalBookings}</div>
          )}
          <div className="metric-label">Total Bookings Logged</div>
        </div>

        {/* Products */}
        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon">
              <FaBoxOpen />
            </div>
            {stats.outOfStockCount > 0 && (
              <div className="metric-trend warning">
                {stats.outOfStockCount} Out of Stock
              </div>
            )}
          </div>
          {loading ? (
            <div className="skeleton-box skeleton-text" style={{ width: "40%", height: "28px" }} />
          ) : (
            <div className="metric-value">{stats.totalProducts}</div>
          )}
          <div className="metric-label">Total Products</div>
        </div>

        {/* Total Users */}
        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon">
              <FaUsers />
            </div>
          </div>
          {loading ? (
            <div className="skeleton-box skeleton-text" style={{ width: "40%", height: "28px" }} />
          ) : (
            <div className="metric-value">{stats.totalUsers}</div>
          )}
          <div className="metric-label">Registered Customers</div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="dashboard-grid-2">
        {/* Left Column: Recent Bookings Table */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <h3>
              <FaShoppingCart style={{ color: "var(--accent-green)" }} />
              Recent Bookings
            </h3>
            <Link href="/Dashboard/Bookings" className="card-action-btn">
              View All Bookings →
            </Link>
          </div>

          <div className="table-wrapper" style={{ boxShadow: "none", margin: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Amount</th>
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
                ) : recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                      No bookings logged yet.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {b.address?.name || b.userId?.username || "Guest"}
                        </div>
                        <small style={{ color: "var(--text-secondary)" }}>
                          {b.address?.phone || "—"}
                        </small>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {b.productId?.images?.[0] && (
                            <img
                              src={b.productId.images[0]}
                              alt=""
                              style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }}
                            />
                          )}
                          <span style={{ fontSize: "0.85rem", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {b.productId?.name || "Item"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${b.paymentStatus}`}>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--accent-green)" }}>
                        {b.productId?.priceAfterDiscount || b.productId?.price || 0} EGP
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Status Progress & Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Booking Fulfillment Breakdown */}
          <div className="dashboard-card">
            <div className="card-header-flex">
              <h3>
                <FaPercent style={{ color: "var(--accent-green)" }} />
                Status Breakdown
              </h3>
            </div>

            <div className="status-progress-list">
              {/* Completed */}
              <div className="status-progress-item">
                <div className="status-progress-label">
                  <span>Completed ({stats.completedCount})</span>
                  <span>
                    {stats.totalBookings > 0
                      ? Math.round((stats.completedCount / stats.totalBookings) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="status-progress-bar-bg">
                  <div
                    className="status-progress-bar-fill bar-paid"
                    style={{
                      width: `${
                        stats.totalBookings > 0
                          ? (stats.completedCount / stats.totalBookings) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Paid */}
              <div className="status-progress-item">
                <div className="status-progress-label">
                  <span>Paid ({stats.paidCount})</span>
                  <span>
                    {stats.totalBookings > 0
                      ? Math.round((stats.paidCount / stats.totalBookings) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="status-progress-bar-bg">
                  <div
                    className="status-progress-bar-fill bar-paid"
                    style={{
                      width: `${
                        stats.totalBookings > 0
                          ? (stats.paidCount / stats.totalBookings) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Pending */}
              <div className="status-progress-item">
                <div className="status-progress-label">
                  <span>Pending ({stats.pendingCount})</span>
                  <span>
                    {stats.totalBookings > 0
                      ? Math.round((stats.pendingCount / stats.totalBookings) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="status-progress-bar-bg">
                  <div
                    className="status-progress-bar-fill bar-pending"
                    style={{
                      width: `${
                        stats.totalBookings > 0
                          ? (stats.pendingCount / stats.totalBookings) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Cancelled */}
              <div className="status-progress-item">
                <div className="status-progress-label">
                  <span>Cancelled ({stats.cancelledCount})</span>
                  <span>
                    {stats.totalBookings > 0
                      ? Math.round((stats.cancelledCount / stats.totalBookings) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="status-progress-bar-bg">
                  <div
                    className="status-progress-bar-fill bar-cancelled"
                    style={{
                      width: `${
                        stats.totalBookings > 0
                          ? (stats.cancelledCount / stats.totalBookings) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Admin Actions */}
          <div className="dashboard-card">
            <div className="card-header-flex">
              <h3>Quick Management</h3>
            </div>
            <div className="quick-actions-grid">
              <Link href="/Dashboard/Products" className="quick-action-card">
                <FaPlus />
                <span>Products</span>
              </Link>
              <Link href="/Dashboard/Bookings" className="quick-action-card">
                <FaEye />
                <span>Bookings</span>
              </Link>
              <Link href="/Dashboard/Users" className="quick-action-card">
                <FaUserPlus />
                <span>Users</span>
              </Link>
              <Link href="/Dashboard/promocodes" className="quick-action-card">
                <FaTicketAlt />
                <span>Promo codes</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}