"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import "./Products.css";
import { FaTrash, FaEdit, FaPlus, FaImage } from "react-icons/fa";

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
  const [loading, setLoading] = useState(true);

  // Filters
  const [stockFilter, setStockFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortPrice, setSortPrice] = useState("none");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [newBookedDate, setNewBookedDate] = useState("");

  // Add form state
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Edit form image state (existing images to keep + new files to add)
  const [editKeepImages, setEditKeepImages] = useState([]);
  const [editNewFiles, setEditNewFiles] = useState([]);
  const [editNewPreviews, setEditNewPreviews] = useState([]);

  // All categories for dropdown
  const [allCategories, setAllCategories] = useState([]);

  const addImageRef = useRef();
  const editImageRef = useRef();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/Products");
      setProducts(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/catagroy");
      setAllCategories(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = (id) => setDeleteId(id);

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/Products/${deleteId}`);
      setProducts((prev) => prev.filter((item) => item._id !== deleteId));
    } catch (err) {
      console.log(err);
    } finally {
      setDeleteId(null);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────
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
    if (editTotalImages === 0) return;
    setSaving(true);
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
      setShowEditPopup(false);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Add ───────────────────────────────────────────────────────────────
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
    if (!newProduct.name || !newProduct.price || !newProduct.category || imageFiles.length === 0) return;
    setSaving(true);
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
      resetAddForm();
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const resetAddForm = () => {
    setNewProduct(emptyProduct);
    setImageFiles([]);
    setImagePreviews([]);
    setShowAddPopup(false);
  };

  // ── Filter + Sort ─────────────────────────────────────────────────────
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category?.name).filter(Boolean))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    let data = [...products];
    if (stockFilter === "in") data = data.filter((p) => p.stock > 0);
    else if (stockFilter === "out") data = data.filter((p) => p.stock === 0);
    if (categoryFilter !== "all")
      data = data.filter((p) => p.category?.name === categoryFilter);
    if (sortPrice === "low")
      data.sort((a, b) => (a.priceAfterDiscount || a.price) - (b.priceAfterDiscount || b.price));
    else if (sortPrice === "high")
      data.sort((a, b) => (b.priceAfterDiscount || b.price) - (a.priceAfterDiscount || a.price));
    return data;
  }, [products, stockFilter, categoryFilter, sortPrice]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAddDisabled =
    saving || !newProduct.name || !newProduct.price || !newProduct.category || imageFiles.length === 0;

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
    <div className="products-container">
      <div className="page-header">
        <div>
          <h2 className="title">Products</h2>
          <p className="subtitle">{products.length} products total</p>
        </div>
        <div className="header-actions">

          <button className="add-btn" onClick={() => setShowAddPopup(true)}>
            <FaPlus /> Add Product
          </button>
        </div>
      </div>



      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="5"><div className="skeleton" /></td>
                  </tr>
                ))
              : paginatedProducts.map((item) => {
                  const hasDiscount =
                    item.priceAfterDiscount !== null &&
                    item.priceAfterDiscount !== undefined &&
                    item.priceAfterDiscount !== 0;

                  return (
                    <tr key={item._id}>
                      <td>
                        <img src={item.images?.[0]} className="product-img" alt={item.name} />
                      </td>
                      <td className="product-name">{item.name}</td>
                      <td className="price">
                        {hasDiscount ? (
                          <div className="price-cell">
                            <span className="original-price">{item.price} EGP</span>
                            <span className="discount-price">{item.priceAfterDiscount} EGP</span>
                          </div>
                        ) : (
                          <span>{item.price} EGP</span>
                        )}
                      </td>
                      <td>
                        <span className={item.stock > 0 ? "stock in" : "stock out"}>
                          {item.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button className="action-btn edit-btn" onClick={() => handleEdit(item)} title="Edit">
                            <FaEdit />
                          </button>
                          <button className="action-btn delete-btn" onClick={() => handleDelete(item._id)} title="Delete">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

            {!loading && paginatedProducts.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-state">No products found.</td>
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
            <h3>Delete Product?</h3>
            <p>This action cannot be undone. Are you sure you want to permanently remove this product?</p>
            <div className="popup-buttons">
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-delete-confirm" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Product Modal ─────────────────────── */}
      {showAddPopup && (
        <div className="popup-overlay" onClick={resetAddForm}>
          <div className="popup popup-wide" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Add New Product</h3>
              <button className="popup-close" onClick={resetAddForm}>✕</button>
            </div>

            <div className="form-group">
              <label>
                Product Images <span className="required">*</span> <small>(1-5 images)</small>
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
                    <span>Add</span>
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
                  placeholder="e.g. iPhone 15 Pro"
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
                <label>Price (EGP) <span className="required">*</span></label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Price After Discount (EGP)</label>
                <input
                  type="number"
                  placeholder="Leave empty for no offer"
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
                  placeholder="0"
                  min="0"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tags</label>
                <div className="checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newProduct.isNew}
                      onChange={(e) => setNewProduct({ ...newProduct, isNew: e.target.checked })}
                    />
                    New Arrival
                  </label>
                  <label className="checkbox-label">
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
                placeholder="Product description (optional)"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="popup-buttons">
              <button className="btn-cancel" onClick={resetAddForm}>Cancel</button>
              <button className="btn-save" onClick={handleAddProduct} disabled={isAddDisabled}>
                {saving ? "Adding…" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ───────────────────────────── */}
      {showEditPopup && editProduct && (
        <div className="popup-overlay" onClick={() => setShowEditPopup(false)}>
          <div className="popup popup-wide" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Edit Product</h3>
              <button className="popup-close" onClick={() => setShowEditPopup(false)}>✕</button>
            </div>

            <div className="form-group">
              <label>
                Product Images <span className="required">*</span> <small>(1-5 images)</small>
              </label>
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
                    <span>Add</span>
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
              {editTotalImages === 0 && (
                <small style={{ color: "#c0392b" }}>Product must have at least 1 image</small>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
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
                      category: allCategories.find((c) => c._id === e.target.value) || e.target.value,
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
                <label>Price (EGP)</label>
                <input
                  type="number"
                  min="0"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Price After Discount (EGP)</label>
                <input
                  type="number"
                  placeholder="Leave empty for no offer"
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
                  min="0"
                  value={editProduct.stock}
                  onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tags</label>
                <div className="checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editProduct.isNew}
                      onChange={(e) => setEditProduct({ ...editProduct, isNew: e.target.checked })}
                    />
                    New Arrival
                  </label>
                  <label className="checkbox-label">
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
                placeholder="Product description (optional)"
                value={editProduct.description}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Booked Dates</label>
              <div className="booked-dates-manager">
                <div className="booked-dates-chips">
                  {(editProduct.bookedDates || []).length === 0 && (
                    <span className="empty-state" style={{ padding: 0 }}>No booked dates</span>
                  )}
                  {(editProduct.bookedDates || []).map((date) => (
                    <span key={date} className="booked-date-chip">
                      {new Date(date).toLocaleDateString()}
                      <button type="button" onClick={() => removeBookedDate(date)}>✕</button>
                    </span>
                  ))}
                </div>
                <div className="booked-dates-add">
                  <input
                    type="date"
                    value={newBookedDate}
                    onChange={(e) => setNewBookedDate(e.target.value)}
                  />
                  <button type="button" className="btn-cancel" onClick={addBookedDate}>
                    Add Date
                  </button>
                </div>
              </div>
            </div>

            <div className="popup-buttons">
              <button className="btn-cancel" onClick={() => setShowEditPopup(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSaveEdit} disabled={saving || editTotalImages === 0}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
