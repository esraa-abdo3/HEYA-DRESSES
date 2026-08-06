import dbConnect from "@/lib/dbConnect";
import Product from "@/models/productmodel";
import cloudinary from "@/lib/cloudinary";
import Cataroymodel from "@/models/Cataroymodel";
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

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return forbidden();
  await dbConnect();

  try {
    const formData = await req.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const priceAfterDiscount = formData.get("priceAfterDiscount");

    const category = formData.get("category");
    const isNew = formData.get("isNew");
    const isBestSeller = formData.get("isBestSeller");

  
    const images = formData.getAll("images").filter((f) => typeof f !== "string");

    if (!name || !price || !category || images.length === 0) {
      return Response.json(
        { message: "name, price, category, images required" },
        { status: 400 }
      );
    }

    if (images.length > 5) {
      return Response.json(
        { message: "You can upload a maximum of 5 images" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return Response.json(
        { message: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    const categoryExists = await Cataroymodel.findById(category);
    if (!categoryExists) {
      return Response.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    const parsedPrice = Number(price);
  

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return Response.json(
        { message: "Price must be a valid number" },
        { status: 400 }
      );
    }



    let parsedPriceAfterDiscount = null;
    if (priceAfterDiscount !== null && priceAfterDiscount !== "") {
      parsedPriceAfterDiscount = Number(priceAfterDiscount);

      if (isNaN(parsedPriceAfterDiscount) || parsedPriceAfterDiscount < 0) {
        return Response.json(
          { message: "priceAfterDiscount must be a valid number" },
          { status: 400 }
        );
      }

      if (parsedPriceAfterDiscount >= parsedPrice) {
        return Response.json(
          { message: "priceAfterDiscount must be less than price" },
          { status: 400 }
        );
      }
    }


    const uploadResults = await Promise.all(
      images.map(async (imageFile) => {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return uploadToCloudinary(buffer);
      })
    );

    const imageUrls = uploadResults.map((r) => r.secure_url);

    const product = await Product.create({
      name: name.trim(),
      description: description || "",
      price: parsedPrice,
      priceAfterDiscount: parsedPriceAfterDiscount,
      
      category: category.trim(),
      images: imageUrls,
      isNew: isNew === "true",
      isBestSeller: isBestSeller === "true",
    });

    return Response.json(
      { message: "Product created successfully", product },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  await dbConnect();

  try {
    const Products = await Product.find().populate("category");

    return Response.json(
      {
        message: "Products fetched successfully",
        data: Products,
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