import dbConnect from "@/lib/dbConnect";
import productmodel from "@/models/productmodel";
import Cataroymodel from "@/models/Cataroymodel";
import cloudinary from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function forbidden() {
  return Response.json(
    { message: "Forbidden: Admins only" },
    { status: 403 }
  );
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") return null;
  return session;
}

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "products" }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(buffer);
  });
}

function getPublicIdFromUrl(url) {
  try {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const publicId = fileName.split(".")[0];
    return `${folder}/${publicId}`;
  } catch {
    return null;
  }
}

async function deleteImagesFromCloudinary(urls) {
  await Promise.all(
    urls.map(async (url) => {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Failed to delete image from Cloudinary:", publicId, err.message);
        }
      }
    })
  );
}

export async function GET(req, { params }) {
  await dbConnect();

  const { id } = await params;

  try {
    const product = await productmodel.findById(id).populate("category");

    if (!product) {
      return Response.json(
        { message: "product not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: "product fetched successfully",
        data: product,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const session = await requireAdmin();
  if (!session) return forbidden();
  await dbConnect();

  const { id } = await params;

  try {
    const product = await productmodel.findOneAndDelete({ _id: id });

    if (!product) {
      return Response.json(
        { message: "product not found" },
        { status: 404 }
      );
    }

    // امسح الصور بتاعته من Cloudinary كمان
    if (product.images?.length > 0) {
      await deleteImagesFromCloudinary(product.images);
    }

    return Response.json(
      {
        message: "product deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const session = await requireAdmin();
  if (!session) return forbidden();
  await dbConnect();

  const { id } = await params;

  try {
    const formData = await req.formData();
    const updateData = {};

    if (formData.has("name")) {
      const name = formData.get("name");
      if (typeof name !== "string" || name.trim().length < 2) {
        return Response.json(
          { message: "Name must be at least 2 characters" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (formData.has("description")) {
      updateData.description = formData.get("description") || "";
    }

    if (formData.has("price")) {
      const parsedPrice = Number(formData.get("price"));
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return Response.json(
          { message: "Price must be a valid number" },
          { status: 400 }
        );
      }
      updateData.price = parsedPrice;
    }





    if (formData.has("priceAfterDiscount")) {
      const raw = formData.get("priceAfterDiscount");

      if (raw === "" || raw === "null") {
        updateData.priceAfterDiscount = null;
      } else {
        const parsedDiscount = Number(raw);
        if (isNaN(parsedDiscount) || parsedDiscount < 0) {
          return Response.json(
            { message: "priceAfterDiscount must be a valid number" },
            { status: 400 }
          );
        }

        const currentPrice =
          updateData.price ?? (await productmodel.findById(id))?.price;

        if (currentPrice != null && parsedDiscount >= currentPrice) {
          return Response.json(
            { message: "priceAfterDiscount must be less than price" },
            { status: 400 }
          );
        }

        updateData.priceAfterDiscount = parsedDiscount;
      }
    }

    if (formData.has("category")) {
      const category = formData.get("category");
      const categoryExists = await Cataroymodel.findById(category);
      if (!categoryExists) {
        return Response.json(
          { message: "Category not found" },
          { status: 404 }
        );
      }
      updateData.category = category.trim();
    }

    if (formData.has("isNew")) {
      updateData.isNew = formData.get("isNew") === "true";
    }

    if (formData.has("isBestSeller")) {
      updateData.isBestSeller = formData.get("isBestSeller") === "true";
    }

    if (formData.has("bookedDates")) {
      try {
        const raw = formData.get("bookedDates");
        const parsed = JSON.parse(raw); // array of "YYYY-MM-DD" strings
        if (Array.isArray(parsed)) {
          updateData.bookedDates = parsed
            .filter((d) => !isNaN(new Date(d).getTime()))
            .map((d) => new Date(d));
        }
      } catch (e) {
        return Response.json(
          { message: "Invalid bookedDates format" },
          { status: 400 }
        );
      }
    }

    // ================== إدارة الصور (الخيار 3) ==================
    // keepImages: روابط الصور القديمة اللي عايز تسيبها
    // images: ملفات جديدة هتتضاف
    if (formData.has("images") || formData.has("keepImages")) {
      const existingProduct = await productmodel.findById(id);
      if (!existingProduct) {
        return Response.json(
          { message: "product not found" },
          { status: 404 }
        );
      }

      const keepImages = formData.getAll("keepImages"); // strings (URLs)
      const newImageFiles = formData
        .getAll("images")
        .filter((f) => typeof f !== "string"); // files فقط

      const totalCount = keepImages.length + newImageFiles.length;

      if (totalCount === 0) {
        return Response.json(
          { message: "Product must have at least 1 image" },
          { status: 400 }
        );
      }

      if (totalCount > 5) {
        return Response.json(
          { message: "You can have a maximum of 5 images in total" },
          { status: 400 }
        );
      }

      // ارفع الصور الجديدة على Cloudinary
      let newImageUrls = [];
      if (newImageFiles.length > 0) {
        const uploadResults = await Promise.all(
          newImageFiles.map(async (imageFile) => {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            return uploadToCloudinary(buffer);
          })
        );
        newImageUrls = uploadResults.map((r) => r.secure_url);
      }

      // حدد الصور اللي اتشالت (مكنتش في keepImages) عشان تتمسح من Cloudinary
      const removedImages = existingProduct.images.filter(
        (url) => !keepImages.includes(url)
      );

      if (removedImages.length > 0) {
        await deleteImagesFromCloudinary(removedImages);
      }

      updateData.images = [...keepImages, ...newImageUrls];
    }
    // ==============================================================

    const product = await productmodel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("category");

    if (!product) {
      return Response.json(
        { message: "product not found" },
        { status: 404 }
      );
    }

    return Response.json({
      message: "product updated successfully",
      data: product,
    });
  } catch (error) {
    return Response.json(
      {
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}