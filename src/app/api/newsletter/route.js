import dbConnect from "@/lib/dbConnect";
import Newslettermodel from "@/models/Newslettermodel";

export async function POST(req) {
  try {
    await dbConnect();

    const { email } = await req.json();

    if (!email) {
      return Response.json({ message: "Email required" }, { status: 400 });
    }

    const exists = await Newslettermodel.findOne({ email });

    if (exists) {
      return Response.json({ message: "Already subscribed" });
    }

    await Newslettermodel.create({ email });

    return Response.json({ message: "Subscribed successfully" });
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}
export async function GET() {
  try {
    await dbConnect();

    const emails = await Newslettermodel.find({}, { email: 1, _id: 0 });

    return Response.json(emails);
  } catch (error) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}