
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useSession } from "next-auth/react";
// import axios from "axios";
// import "./Products.css";
// import { FaTrash, FaEdit } from "react-icons/fa";

// export default function ProductsTable() {
//   const { data: session, status } = useSession();
//   const isAdmin = session?.user?.role === "admin";

//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [stockFilter, setStockFilter] = useState("all");
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [sortPrice, setSortPrice] = useState("none");

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   const [showPopup, setShowPopup] = useState(false);
//   const [editProduct, setEditProduct] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [deleteId, setDeleteId] = useState(null);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const res = await axios.get("/api/Products");
//       setProducts(res.data.data);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//     }
//   };



//   // ── Handlers ───────────────────────────────────────────────────────────────
//   const handleDelete = (id) => setDeleteId(id);

//   const confirmDelete = async () => {
//     try {
//       await axios.delete(`/api/Products/${deleteId}`);
//       setProducts((prev) => prev.filter((item) => item._id !== deleteId));
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setDeleteId(null);
//     }
//   };

//   const handleEdit = (product) => {
//     setEditProduct(product);
//     setShowPopup(true);
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const formData = new FormData();
//       formData.append("name", editProduct.name);
//       formData.append("price", editProduct.price);
//       formData.append("stock", editProduct.stock);
//       formData.append("category", editProduct.category._id);

//       const res = await axios.put(`/api/Products/${editProduct._id}`, formData);
//       setProducts((prev) =>
//         prev.map((item) => (item._id === editProduct._id ? res.data.data : item))
//       );
//       setShowPopup(false);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const categories = useMemo(
//     () => [...new Set(products.map((p) => p.category?.name))],
//     [products]
//   );

//   const filteredProducts = useMemo(() => {
//     let data = [...products];
//     if (stockFilter === "in") data = data.filter((p) => p.stock > 0);
//     else if (stockFilter === "out") data = data.filter((p) => p.stock === 0);
//     if (categoryFilter !== "all")
//       data = data.filter((p) => p.category?.name === categoryFilter);
//     if (sortPrice === "low") data.sort((a, b) => a.price - b.price);
//     else if (sortPrice === "high") data.sort((a, b) => b.price - a.price);
//     return data;
//   }, [products, stockFilter, categoryFilter, sortPrice]);

//   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
//   const paginatedProducts = filteredProducts.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );
//     // ── Guard: not logged in or not admin ──────────────────────────────────────
//   if (status === "loading") {
//     return (
//       <div className="auth-state">
//         <div className="auth-spinner" />
//         <p>Checking permissions…</p>
//       </div>
//     );
//   }

//   if (!session || !isAdmin) {
//     return (
//       <div className="forbidden-screen">
//         <div className="forbidden-card">
//           <div className="forbidden-icon">⛔</div>
//           <h2>Access Denied</h2>
//           <p>
//             {!session
//               ? "You must be signed in to view this page."
//               : "You don't have permission to access this area. Admins only."}
//           </p>
//           {!session && (
//             <a href="/api/Auth/signin" className="signin-btn">
//               Sign In
//             </a>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="products-container">
//       <div className="page-header">
//         <h2 className="title">Products</h2>
//         <span className="admin-badge">Admin Panel</span>
//       </div>

//       {/* Filters */}
//       <div className="filters">
//         <select onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}>
//           <option value="all">All Stock</option>
//           <option value="in">In Stock</option>
//           <option value="out">Out of Stock</option>
//         </select>

//         <select onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}>
//           <option value="all">All Categories</option>
//           {categories.map((cat, i) => (
//             <option key={i} value={cat}>{cat}</option>
//           ))}
//         </select>

//         <select onChange={(e) => setSortPrice(e.target.value)}>
//           <option value="none">Sort by Price</option>
//           <option value="low">Low → High</option>
//           <option value="high">High → Low</option>
//         </select>
//       </div>

//       {/* Table */}
//       <div className="table-wrapper">
//         <table className="table">
//           <thead>
//             <tr>
//               <th>Image</th>
//               <th>Name</th>
//               <th>Price</th>
//               <th>Stock</th>
//               <th>Category</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading
//               ? Array.from({ length: 5 }).map((_, i) => (
//                   <tr key={i}>
//                     <td colSpan="6">
//                       <div className="skeleton" />
//                     </td>
//                   </tr>
//                 ))
//               : paginatedProducts.map((item) => (
//                   <tr key={item._id}>
//                     <td>
//                       <img src={item.image} className="product-img" alt={item.name} />
//                     </td>
//                     <td className="product-name">{item.name}</td>
//                     <td className="price">{item.price} EGP</td>
//                     <td>
//                       <span className={item.stock > 0 ? "stock in" : "stock out"}>
//                         {item.stock > 0 ? "In Stock" : "Out of Stock"}
//                       </span>
//                     </td>
//                     <td>
//                       <span className="category-tag">{item.category?.name}</span>
//                     </td>
//                     <td>
//                       <div className="actions">
//                         <button
//                           className="action-btn edit-btn"
//                           onClick={() => handleEdit(item)}
//                           title="Edit product"
//                         >
//                           <FaEdit />
//                         </button>
//                         <button
//                           className="action-btn delete-btn"
//                           onClick={() => handleDelete(item._id)}
//                           title="Delete product"
//                         >
//                           <FaTrash />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="pagination">
//         <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
//           ← Prev
//         </button>
//         <span className="page-info">
//           Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
//         </span>
//         <button
//           disabled={currentPage === totalPages || totalPages === 0}
//           onClick={() => setCurrentPage((p) => p + 1)}
//         >
//           Next →
//         </button>
//       </div>

//       {/* ── Delete Confirm Modal ─────────────────────────── */}
//       {deleteId && (
//         <div className="popup-overlay" onClick={() => setDeleteId(null)}>
//           <div className="popup delete-popup" onClick={(e) => e.stopPropagation()}>
//             <div className="delete-icon-big">🗑️</div>
//             <h3>Delete Product?</h3>
//             <p>This action cannot be undone. Are you sure you want to permanently remove this product?</p>
//             <div className="popup-buttons">
//               <button className="btn-cancel" onClick={() => setDeleteId(null)}>
//                 Cancel
//               </button>
//               <button className="btn-delete-confirm" onClick={confirmDelete}>
//                 Yes, Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Edit Modal ──────────────────────────────────── */}
//       {showPopup && (
//         <div className="popup-overlay" onClick={() => setShowPopup(false)}>
//           <div className="popup" onClick={(e) => e.stopPropagation()}>
//             <div className="popup-header">
//               <h3>Edit Product</h3>
//               <button className="popup-close" onClick={() => setShowPopup(false)}>✕</button>
//             </div>

//             <div className="form-group">
//               <label>Product Name</label>
//               <input
//                 type="text"
//                 placeholder="Name"
//                 value={editProduct.name}
//                 onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
//               />
//             </div>

//             <div className="form-group">
//               <label>Price (EGP)</label>
//               <input
//                 type="number"
//                 placeholder="Price"
//                 value={editProduct.price}
//                 onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
//               />
//             </div>

//             <div className="form-group">
//               <label>Stock Quantity</label>
//               <input
//                 type="number"
//                 placeholder="Stock"
//                 value={editProduct.stock}
//                 onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
//               />
//             </div>

//             <div className="popup-buttons">
//               <button className="btn-cancel" onClick={() => setShowPopup(false)}>
//                 Cancel
//               </button>
//               <button className="btn-save" onClick={handleSave} disabled={saving}>
//                 {saving ? "Saving…" : "Save Changes"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import "./Products.css";
import { FaTrash, FaEdit, FaPlus, FaImage } from "react-icons/fa";

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

  // Add form state
  const [newProduct, setNewProduct] = useState({
    name: "", description: "", price: "", stock: "", category: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Edit image state
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

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



  // ── Handlers ──────────────────────────────────────────────────────────────
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

  const handleEdit = (product) => {
    setEditProduct({ ...product });
    setEditImageFile(null);
    setEditImagePreview(null);
    setShowEditPopup(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", editProduct.name);
      formData.append("price", editProduct.price);
      formData.append("stock", editProduct.stock);
      formData.append("category", editProduct.category?._id || editProduct.category);
      if (editImageFile) formData.append("image", editImageFile);

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

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category || !imageFile) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price);
      formData.append("stock", newProduct.stock || "0");
      formData.append("category", newProduct.category);
      formData.append("image", imageFile);

      const res = await axios.post("/api/Products", formData);
      setProducts((prev) => [res.data.product, ...prev]);
      setNewProduct({ name: "", description: "", price: "", stock: "", category: "" });
      setImageFile(null);
      setImagePreview(null);
      setShowAddPopup(false);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (type === "add") {
      setImageFile(file);
      setImagePreview(preview);
    } else {
      setEditImageFile(file);
      setEditImagePreview(preview);
    }
  };

  const resetAddForm = () => {
    setNewProduct({ name: "", description: "", price: "", stock: "", category: "" });
    setImageFile(null);
    setImagePreview(null);
    setShowAddPopup(false);
  };

  // ── Filter + Sort ─────────────────────────────────────────────────────────
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
    if (sortPrice === "low") data.sort((a, b) => a.price - b.price);
    else if (sortPrice === "high") data.sort((a, b) => b.price - a.price);
    return data;
  }, [products, stockFilter, categoryFilter, sortPrice]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAddDisabled = saving || !newProduct.name || !newProduct.price || !newProduct.category || !imageFile;

  return (
    <div className="products-container">
      <div className="page-header">
        <div>
          <h2 className="title">Products</h2>
          <p className="subtitle">{products.length} products total</p>
        </div>
        <div className="header-actions">
          <span className="admin-badge">Admin Panel</span>
          <button className="add-btn" onClick={() => setShowAddPopup(true)}>
            <FaPlus /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <select onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}>
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        <select onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}>
          <option value="all">All Categories</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>

        <select onChange={(e) => setSortPrice(e.target.value)}>
          <option value="none">Sort by Price</option>
          <option value="low">Low → High</option>
          <option value="high">High → Low</option>
        </select>
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
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6"><div className="skeleton" /></td>
                  </tr>
                ))
              : paginatedProducts.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <img src={item.image} className="product-img" alt={item.name} />
                    </td>
                    <td className="product-name">{item.name}</td>
                    <td className="price">{item.price} EGP</td>
                    <td>
                      <span className={item.stock > 0 ? "stock in" : "stock out"}>
                        {item.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td>
                      <span className="category-tag">{item.category?.name}</span>
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
                ))}

            {!loading && paginatedProducts.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">No products found.</td>
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

            <div
              className="image-upload-area"
              onClick={() => addImageRef.current.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} className="image-preview" alt="preview" />
              ) : (
                <div className="image-placeholder">
                  <FaImage className="image-placeholder-icon" />
                  <span>Click to upload image</span>
                  <small>JPG, PNG, WEBP</small>
                </div>
              )}
              <input
                ref={addImageRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleImageChange(e, "add")}
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
                <label>Stock Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
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

            <div
              className="image-upload-area"
              onClick={() => editImageRef.current.click()}
            >
              {editImagePreview || editProduct.image ? (
                <>
                  <img
                    src={editImagePreview || editProduct.image}
                    className="image-preview"
                    alt="preview"
                  />
                  {editImagePreview && (
                    <div className="image-change-badge">✓ New image selected</div>
                  )}
                </>
              ) : (
                <div className="image-placeholder">
                  <FaImage className="image-placeholder-icon" />
                  <span>Click to change image</span>
                </div>
              )}
              <input
                ref={editImageRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleImageChange(e, "edit")}
              />
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
                <label>Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={editProduct.stock}
                  onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="popup-buttons">
              <button className="btn-cancel" onClick={() => setShowEditPopup(false)}>Cancel</button>
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
