"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import "./Products.css";
import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaImage,
  FaSearch,
  FaBoxOpen,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaTag,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
} from "react-icons/fa";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  priceAfterDiscount: "",
  stock: "",
  category: "",
  isNew: false,
  isBestSeller: false,
};

export default function ProductsTable() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortPrice, setSortPrice] = useState("none");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals & States
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [newBookedDate, setNewBookedDate] = useState("");

  // Booking Modal State (Customer Info)
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingTargetProduct, setBookingTargetProduct] = useState(null);
  const [bookingCustomerName, setBookingCustomerName] = useState("");
  const [bookingCustomerPhone, setBookingCustomerPhone] = useState("");
  const [bookingCustomerAddress, setBookingCustomerAddress] = useState("");
  const [bookingCustomerEmail, setBookingCustomerEmail] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingModalError, setBookingModalError] = useState("");
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  // Add Form Image State
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Edit Form Image State
  const [editKeepImages, setEditKeepImages] = useState([]);
  const [editNewFiles, setEditNewFiles] = useState([]);
  const [editNewPreviews, setEditNewPreviews] = useState([]);

  const addImageRef = useRef();
  const editImageRef = useRef();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBookings();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/Products");
      setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/catagroy");
      setAllCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get("/api/Bookings/admin");
      setBookings(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getProductBookings = (productId) => {
    return bookings.filter(
      (b) =>
        (b.productId?._id === productId || b.productId === productId) &&
        b.paymentStatus !== "cancelled"
    );
  };

  const handleOpenBookingModal = (product) => {
    setBookingTargetProduct(product);
    setBookingCustomerName("");
    setBookingCustomerPhone("");
    setBookingCustomerAddress("");
    setBookingCustomerEmail("");
    setBookingDate(new Date().toISOString().slice(0, 10));
    setBookingNote("");
    setBookingModalError("");
    setShowBookingModal(true);
  };

  const handleSaveBooking = async () => {
    if (!bookingTargetProduct) return;

    if (
      !bookingCustomerName.trim() ||
      !bookingCustomerPhone.trim() ||
      !bookingCustomerAddress.trim() ||
      !bookingDate
    ) {
      setBookingModalError(
        "Customer Name, Phone, Address, and Booking Date are required."
      );
      return;
    }

    setBookingSaving(true);
    setBookingModalError("");

    try {
      const payload = {
        productId: bookingTargetProduct._id,
        customerName: bookingCustomerName.trim(),
        customerPhone: bookingCustomerPhone.trim(),
        customerAddress: bookingCustomerAddress.trim(),
        customerEmail: bookingCustomerEmail.trim() || undefined,
        bookingDate: bookingDate,
        note: bookingNote.trim() || undefined,
      };

      const res = await axios.post("/api/Bookings/admin", payload);
      const newBooking = res.data.data;

      setBookings((prev) => [newBooking, ...prev]);

      // Refresh product list to sync product's bookedDates
      const prodRes = await axios.get("/api/Products");
      setProducts(prodRes.data.data || []);

      setSuccessMsg("Booking created successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
      setShowBookingModal(false);

      if (editProduct && editProduct._id === bookingTargetProduct._id) {
        const formattedDate = new Date(bookingDate).toISOString().slice(0, 10);
        if (!editProduct.bookedDates?.includes(formattedDate)) {
          setEditProduct((prev) => ({
            ...prev,
            bookedDates: [...(prev?.bookedDates || []), formattedDate].sort(),
          }));
        }
      }
    } catch (err) {
      console.error(err);
      setBookingModalError(
        err.response?.data?.message || "Failed to create booking."
      );
    } finally {
      setBookingSaving(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setCancellingBookingId(bookingId);
    try {
      const res = await axios.delete(`/api/Bookings/admin/${bookingId}`);
      const updatedBooking = res.data.data;

      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? updatedBooking : b))
      );

      const prodRes = await axios.get("/api/Products");
      setProducts(prodRes.data.data || []);

      setSuccessMsg("Booking cancelled successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancellingBookingId(null);
    }
  };

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.stock > 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 3).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;

    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  // Handlers - Delete
  const handleDelete = (id) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setErrorMsg("");
    try {
      await axios.delete(`/api/Products/${deleteId}`);
      setProducts((prev) => prev.filter((item) => item._id !== deleteId));
      setSuccessMsg("Product deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete product.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Handlers - Edit
  const handleEdit = (product) => {
    setEditProduct({
      ...product,
      description: product.description || "",
      priceAfterDiscount: product.priceAfterDiscount ?? "",
      isNew: !!product.isNew,
      isBestSeller: !!product.isBestSeller,
      bookedDates: (product.bookedDates || []).map((d) =>
        new Date(d).toISOString().slice(0, 10)
      ),
    });
    setEditKeepImages([...(product.images || [])]);
    setEditNewFiles([]);
    setEditNewPreviews([]);
    setNewBookedDate("");
    setModalError("");
    setShowEditPopup(true);
  };

  const handleEditImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - editKeepImages.length - editNewFiles.length;
    const filesToAdd = files.slice(0, Math.max(remainingSlots, 0));

    setEditNewFiles((prev) => [...prev, ...filesToAdd]);
    setEditNewPreviews((prev) => [
      ...prev,
      ...filesToAdd.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  };

  const removeKeepImage = (url) => {
    setEditKeepImages((prev) => prev.filter((u) => u !== url));
  };

  const removeNewEditImage = (index) => {
    setEditNewFiles((prev) => prev.filter((_, i) => i !== index));
    setEditNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addBookedDate = () => {
    if (!newBookedDate) return;
    if (editProduct.bookedDates.includes(newBookedDate)) {
      setNewBookedDate("");
      return;
    }
    setEditProduct({
      ...editProduct,
      bookedDates: [...editProduct.bookedDates, newBookedDate].sort(),
    });
    setNewBookedDate("");
  };

  const removeBookedDate = (date) => {
    setEditProduct({
      ...editProduct,
      bookedDates: editProduct.bookedDates.filter((d) => d !== date),
    });
  };

  const editTotalImages = editKeepImages.length + editNewFiles.length;

  const handleSaveEdit = async () => {
    if (editTotalImages === 0) {
      setModalError("Product must have at least 1 image.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      const formData = new FormData();
      formData.append("name", editProduct.name);
      formData.append("description", editProduct.description || "");
      formData.append("price", editProduct.price);
      formData.append(
        "priceAfterDiscount",
        editProduct.priceAfterDiscount === "" ? "" : editProduct.priceAfterDiscount
      );
      formData.append("stock", editProduct.stock);
      formData.append("category", editProduct.category?._id || editProduct.category);
      formData.append("isNew", editProduct.isNew ? "true" : "false");
      formData.append("isBestSeller", editProduct.isBestSeller ? "true" : "false");
      formData.append("bookedDates", JSON.stringify(editProduct.bookedDates || []));

      editKeepImages.forEach((url) => formData.append("keepImages", url));
      editNewFiles.forEach((file) => formData.append("images", file));

      const res = await axios.put(`/api/Products/${editProduct._id}`, formData);
      setProducts((prev) =>
        prev.map((item) => (item._id === editProduct._id ? res.data.data : item))
      );
      setSuccessMsg("Product updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
      setShowEditPopup(false);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to save product changes.");
    } finally {
      setSaving(false);
    }
  };

  // Handlers - Add
  const handleAddImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const combined = [...imageFiles, ...files].slice(0, 5);
    setImageFiles(combined);
    setImagePreviews(combined.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category || imageFiles.length === 0) {
      setModalError("Please fill in all required fields and upload at least 1 image.");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price);
      formData.append("priceAfterDiscount", newProduct.priceAfterDiscount || "");
      formData.append("stock", newProduct.stock || "0");
      formData.append("category", newProduct.category);
      formData.append("isNew", newProduct.isNew ? "true" : "false");
      formData.append("isBestSeller", newProduct.isBestSeller ? "true" : "false");
      imageFiles.forEach((file) => formData.append("images", file));

      const res = await axios.post("/api/Products", formData);
      setProducts((prev) => [res.data.product, ...prev]);
      setSuccessMsg("Product created successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
      resetAddForm();
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to add product.");
    } finally {
      setSaving(false);
    }
  };

  const resetAddForm = () => {
    setNewProduct(emptyProduct);
    setImageFiles([]);
    setImagePreviews([]);
    setModalError("");
    setShowAddPopup(false);
  };

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    let data = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      data = data.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const cat = (p.category?.name || "").toLowerCase();
        return name.includes(q) || cat.includes(q);
      });
    }

    if (stockFilter === "in") data = data.filter((p) => p.stock > 0);
    else if (stockFilter === "low") data = data.filter((p) => p.stock > 0 && p.stock <= 3);
    else if (stockFilter === "out") data = data.filter((p) => p.stock === 0);

    if (categoryFilter !== "all") {
      data = data.filter((p) => p.category?._id === categoryFilter || p.category?.name === categoryFilter);
    }

    if (sortPrice === "low") {
      data.sort((a, b) => (a.priceAfterDiscount || a.price) - (b.priceAfterDiscount || b.price));
    } else if (sortPrice === "high") {
      data.sort((a, b) => (b.priceAfterDiscount || b.price) - (a.priceAfterDiscount || a.price));
    }

    return data;
  }, [products, searchQuery, stockFilter, categoryFilter, sortPrice]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
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
    <div className="products-container dashboard-container">
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

      {/* KPI Metrics */}
      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon"><FaBoxOpen /></div>
          </div>
          <div className="metric-value">{metrics.total}</div>
          <div className="metric-label">Total Inventory Products</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon" style={{ color: "var(--status-success)" }}><FaCheckCircle /></div>
          </div>
          <div className="metric-value" style={{ color: "var(--status-success)" }}>{metrics.inStock}</div>
          <div className="metric-label">In Stock Items</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon" style={{ color: "var(--status-warning)" }}><FaExclamationTriangle /></div>
          </div>
          <div className="metric-value" style={{ color: "var(--status-warning)" }}>{metrics.lowStock}</div>
          <div className="metric-label">Low Stock Alerts (≤3)</div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon" style={{ color: "var(--status-danger)" }}><FaTimes /></div>
          </div>
          <div className="metric-value" style={{ color: "var(--status-danger)" }}>{metrics.outOfStock}</div>
          <div className="metric-label">Out of Stock</div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Add Action */}
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
          <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
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
              placeholder="Search products by name or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
              style={{ paddingLeft: "40px" }}
            />
          </div>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: "auto" }}
          >
            <option value="all">All Stock Statuses</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock (≤3)</option>
            <option value="out">Out of Stock</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: "auto" }}
          >
            <option value="all">All Categories</option>
            {allCategories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Price Sorting */}
          <select
            value={sortPrice}
            onChange={(e) => setSortPrice(e.target.value)}
            className="form-select"
            style={{ width: "auto" }}
          >
            <option value="none">Sort by Price</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>

        <button className="btn-primary" onClick={() => { setModalError(""); setShowAddPopup(true); }}>
          <FaPlus /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="6">
                    <div className="skeleton-box skeleton-text" />
                  </td>
                </tr>
              ))
            ) : paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state-box">
                    <div className="empty-state-icon">👗</div>
                    <div className="empty-state-title">No products found</div>
                    <p style={{ fontSize: "0.85rem" }}>
                      Try adjusting your search criteria or add a new product.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedProducts.map((item) => {
                const hasDiscount =
                  item.priceAfterDiscount !== null &&
                  item.priceAfterDiscount !== undefined &&
                  item.priceAfterDiscount !== 0;

                return (
                  <tr key={item._id}>
                    <td>
                      <img
                        src={item.images?.[0] || "/placeholder.jpg"}
                        className="product-img"
                        alt={item.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          border: "1px solid var(--border-color)",
                        }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                        {item.isNew && <span style={{color:"green" , fontWeight:"bold"}} >New</span>}
                        {item.isBestSeller && <span style={{color:"orange", fontWeight:"bold"}}>Best Seller</span>}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}>
                        {item.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td>
                      {hasDiscount ? (
                        <div>
                          <span style={{ textDecoration: "line-through", color: "var(--text-muted)", fontSize: "0.8rem", marginRight: "6px" }}>
                            {item.price} EGP
                          </span>
                          <span style={{ fontWeight: 700, color: "var(--accent-gold)" }}>
                            {item.priceAfterDiscount} EGP
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{item.price} EGP</span>
                      )}
                    </td>
                    <td>
                      {item.stock > 3 ? (
                        <span className="badge badge-in-stock">In Stock ({item.stock})</span>
                      ) : item.stock > 0 ? (
                        <span className="badge badge-low-stock">Low Stock ({item.stock})</span>
                      ) : (
                        <span className="badge badge-out-of-stock">Out of Stock</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          className="action-btn edit-btn"
                          style={{ color: "#eab308" }}
                          onClick={() => handleOpenBookingModal(item)}
                          title="Add Customer Booking"
                        >
                          <FaCalendarAlt />
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(item)}
                          title="Edit Product"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(item._id)}
                          title="Delete Product"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px", color: "var(--status-danger)" }}>🗑️</div>
            <h3 style={{ margin: "0 0 10px 0" }}>Delete Product?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
              This action cannot be undone. Are you sure you want to permanently delete this product?
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteId(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn-danger" style={{ flex: 1 }} onClick={confirmDelete} disabled={deleting}>
                {deleting ? <span className="spinner-sm" /> : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddPopup && (
        <div className="modal-overlay" onClick={resetAddForm}>
          <div className="modal-content" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Product</h3>
              <button className="modal-close" onClick={resetAddForm}><FaTimes /></button>
            </div>

            {modalError && (
              <div className="alert-banner error">
                <FaExclamationTriangle />
                <span>{modalError}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Product Images */}
              <div className="form-group">
                <label>
                  Product Images <span className="required">*</span> <small>(Up to 5 images)</small>
                </label>
                <div className="image-gallery-grid">
                  {imagePreviews.map((src, i) => (
                    <div className="image-thumb" key={i}>
                      <img src={src} alt="" />
                      <button type="button" className="remove-img-btn" onClick={() => removeNewImage(i)}>✕</button>
                    </div>
                  ))}
                  {imageFiles.length < 5 && (
                    <div className="image-gallery-add-tile" onClick={() => addImageRef.current.click()}>
                      <FaImage />
                      <span>Upload</span>
                    </div>
                  )}
                </div>
                <input
                  ref={addImageRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleAddImagesChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Product Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Silk Evening Dress"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Category <span className="required">*</span></label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select category</option>
                    {allCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Original Price (EGP) <span className="required">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Discount Price (EGP)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Leave empty if no discount"
                    min="0"
                    value={newProduct.priceAfterDiscount}
                    onChange={(e) => setNewProduct({ ...newProduct, priceAfterDiscount: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Tags & Highlights</label>
                  <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                      <input
                        type="checkbox"
                        checked={newProduct.isNew}
                        onChange={(e) => setNewProduct({ ...newProduct, isNew: e.target.checked })}
                      />
                      New Arrival
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                      <input
                        type="checkbox"
                        checked={newProduct.isBestSeller}
                        onChange={(e) => setNewProduct({ ...newProduct, isBestSeller: e.target.checked })}
                      />
                      Best Seller
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  placeholder="Enter detailed description of the dress..."
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={resetAddForm} disabled={saving}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddProduct} disabled={saving}>
                {saving ? <span className="spinner-sm" /> : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditPopup && editProduct && (
        <div className="modal-overlay" onClick={() => setShowEditPopup(false)}>
          <div className="modal-content" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Product: {editProduct.name}</h3>
              <button className="modal-close" onClick={() => setShowEditPopup(false)}><FaTimes /></button>
            </div>

            {modalError && (
              <div className="alert-banner error">
                <FaExclamationTriangle />
                <span>{modalError}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Product Images */}
              <div className="form-group">
                <label>Product Images <span className="required">*</span></label>
                <div className="image-gallery-grid">
                  {editKeepImages.map((url, i) => (
                    <div className="image-thumb" key={`keep-${i}`}>
                      <img src={url} alt="" />
                      <button type="button" className="remove-img-btn" onClick={() => removeKeepImage(url)}>✕</button>
                    </div>
                  ))}
                  {editNewPreviews.map((src, i) => (
                    <div className="image-thumb" key={`new-${i}`}>
                      <img src={src} alt="" />
                      <span className="new-badge">New</span>
                      <button type="button" className="remove-img-btn" onClick={() => removeNewEditImage(i)}>✕</button>
                    </div>
                  ))}
                  {editTotalImages < 5 && (
                    <div className="image-gallery-add-tile" onClick={() => editImageRef.current.click()}>
                      <FaImage />
                      <span>Upload</span>
                    </div>
                  )}
                </div>
                <input
                  ref={editImageRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleEditImagesChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editProduct.category?._id || editProduct.category}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        category: e.target.value,
                      })
                    }
                    className="form-select"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Original Price (EGP)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Discount Price (EGP)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={editProduct.priceAfterDiscount}
                    onChange={(e) => setEditProduct({ ...editProduct, priceAfterDiscount: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Tags</label>
                  <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                      <input
                        type="checkbox"
                        checked={editProduct.isNew}
                        onChange={(e) => setEditProduct({ ...editProduct, isNew: e.target.checked })}
                      />
                      New Arrival
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                      <input
                        type="checkbox"
                        checked={editProduct.isBestSeller}
                        onChange={(e) => setEditProduct({ ...editProduct, isBestSeller: e.target.checked })}
                      />
                      Best Seller
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={editProduct.description}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                />
              </div>

              {/* Reserved Dates & Customer Bookings Manager */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ margin: 0 }}>Reserved Dates & Customer Bookings</label>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "5px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}
                    onClick={() => handleOpenBookingModal(editProduct)}
                  >
                    <FaCalendarAlt /> + Add Customer Booking
                  </button>
                </div>

                <div className="product-bookings-list">
                  {getProductBookings(editProduct._id).length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0" }}>
                      No active customer bookings found for this product.
                    </p>
                  ) : (
                    getProductBookings(editProduct._id).map((b) => (
                      <div key={b._id} className="product-booking-card">
                        <div className="booking-card-info">
                          <div className="booking-card-date">
                            <FaCalendarAlt /> {new Date(b.bookingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            <span className={`badge badge-${b.paymentStatus}`} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                              {b.paymentStatus}
                            </span>
                          </div>
                          <div className="booking-card-customer">
                             <strong>{b.customerName}</strong> ({b.customerPhone})
                          </div>
                          {b.customerAddress && (
                            <div className="booking-card-address">
                               {b.customerAddress}
                            </div>
                          )}
                        </div>
                        {b.paymentStatus != "completed" && (
                             <button
                          type="button"
                          className="action-btn delete-btn"
                          onClick={() => handleCancelBooking(b._id)}
                          disabled={cancellingBookingId === b._id}
                          title="Cancel Booking"
                        >
                          {cancellingBookingId === b._id ? <span className="spinner-sm" /> : <FaTrash />}
                        </button>
                        ) }
                     
                      </div>
                    ))
                  )}
                </div>
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

      {/* Add Booking Modal */}
      {showBookingModal && bookingTargetProduct && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Add Booking for Product</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#eab308", fontWeight: 600 }}>
                  {bookingTargetProduct.name} ({bookingTargetProduct.priceAfterDiscount || bookingTargetProduct.price} EGP)
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowBookingModal(false)}><FaTimes /></button>
            </div>

            {bookingModalError && (
              <div className="alert-banner error">
                <FaExclamationTriangle />
                <span>{bookingModalError}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name <span className="required">*</span></label>
                  <div style={{ position: "relative" }}>
                    <FaUser style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      type="text"
                      className="form-control"
                      style={{ paddingLeft: "36px" }}
                      placeholder="e.g. Sarah Ahmed"
                      value={bookingCustomerName}
                      onChange={(e) => setBookingCustomerName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number <span className="required">*</span></label>
                  <div style={{ position: "relative" }}>
                    <FaPhone style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      type="tel"
                      className="form-control"
                      style={{ paddingLeft: "36px" }}
                      placeholder="e.g. 01012345678"
                      value={bookingCustomerPhone}
                      onChange={(e) => setBookingCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Delivery Address <span className="required">*</span></label>
                <div style={{ position: "relative" }}>
                  <FaMapMarkerAlt style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: "36px" }}
                    placeholder="e.g. Cairo, Nasr City, Street 15, Building 4"
                    value={bookingCustomerAddress}
                    onChange={(e) => setBookingCustomerAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Booking Date <span className="required">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    min={new Date().toISOString().slice(0, 10)}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Customer Email <small>(Optional)</small></label>
                  <div style={{ position: "relative" }}>
                    <FaEnvelope style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                      type="email"
                      className="form-control"
                      style={{ paddingLeft: "36px" }}
                      placeholder="e.g. customer@example.com"
                      value={bookingCustomerEmail}
                      onChange={(e) => setBookingCustomerEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Admin Note / Details <small>(Optional)</small></label>
                <textarea
                  className="form-control"
                  placeholder="Special requests, fitting notes..."
                  rows={3}
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowBookingModal(false)} disabled={bookingSaving}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveBooking} disabled={bookingSaving}>
                {bookingSaving ? <span className="spinner-sm" /> : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
