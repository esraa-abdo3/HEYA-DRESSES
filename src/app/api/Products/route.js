import dbConnect from "@/lib/dbConnect";
import Product from "@/models/productmodel";
import cloudinary from "@/lib/cloudinary";
import Cataroymodel from "@/models/Cataroymodel";

export async function POST(req) {
  await dbConnect();

  try {
    const formData = await req.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const stock = formData.get("stock");
    const category = formData.get("category");
    const image = formData.get("image");


    if (!name || !price || !category || !image) {
      return Response.json(
        { message: "name, price, category, image required" },
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
    console.log(categoryExists)

if (!categoryExists) {
  return Response.json(
    { message: "Category not found" },
    { status: 404 }
  );
}


    const parsedPrice = Number(price);
    const parsedStock = Number(stock || 0);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return Response.json(
        { message: "Price must be a valid number" },
        { status: 400 }
      );
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      return Response.json(
        { message: "Stock must be a valid number" },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "products" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(buffer);
    });

    const product = await Product.create({
      name: name.trim(),
      description: description || "",
      price: parsedPrice,
      stock: parsedStock,
      category: category.trim(),
      image: uploadResult.secure_url,
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
    const Products = await Product.find().populate("category");;


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