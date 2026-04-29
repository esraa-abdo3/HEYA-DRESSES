import dbConnect from "@/lib/dbConnect";
import User from "@/models/Usermodel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export async function POST(req) {

  await dbConnect();

  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return Response.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  if (username.length < 2) {
    return Response.json(
      { message: "Name must be at least 2 characters" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return Response.json(
      { message: "Invalid email format" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return Response.json(
      { message: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return Response.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

    const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });
        const token = jwt.sign({ id: user._id, email: user.email}, process.env.JWT_SECRET,{ expiresIn: "7d" }
  );
console.log("user", user);

  return Response.json(
      { message: "User created successfully", data: { user } ,token},
    { status: 201 }
  );
}