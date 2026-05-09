"use client";

import { useState } from "react";
import Link from "next/link";
import "./Signup.css"
import Image from 'next/image'
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
    const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    setError({})
    e.preventDefault();
      let errors = {};
   // Name validation
  if (!form.name) {
    errors.name = "Name is required";
  } else if (form.name.length <= 2) {
    errors.name = "Name must be more than 2 characters";
  }

    // Email validation
  if (!form.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = "Invalid email format";
  }


  if (!form.password) {
    errors.password = "Password is required";
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  // Confirm password validation
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (Object.keys(errors).length > 0) {
    setError(errors);
    return;
    }
     setLoading(true); 
    const body = {
      username: form.name,
      email: form.email,
      password:form.password
      
    }
    try {
      let res = await axios.post("/api/auth/register", body)
      console.log(res)
      setLoading(false)
      Cookies.set("token", res.data.token, { expires: 1 });
   
      await signIn("credentials", {
  email: form.email,
  password: form.password,
  redirect: false,
      });
         router.push("/")
          localStorage.removeItem("guestId");
  
    }
    catch (error) {
      console.log(error)

  setError({
    server:
      error.response?.data?.message || "Something went wrong",
  });

      setLoading(false)
      
    }

    console.log("Signup Data:", form);
  };

  return (
    <>
      <div className="auth-signup">

  
          <div className="auth-container">
           <div className="text">
        <h2>Sign Up now</h2>
            <p>
         Create your account and join our community to enjoy a personalized shopping experience. 
         Stay connected, save your favorite products.
           </p>
           </div>

      <form onSubmit={handleSubmit} className="auth-form">

        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          value={form.name}
      
            />
                    {error.name && <p style={{ color: "red" }}>{error.name}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={form.email}
        
            />
            {error.email && <p style={{ color: "red" }}>{error.email}</p>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          value={form.password}
        
            />
                {error.password&& <p style={{ color: "red" }}>{error.password}</p>}

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}
          value={form.confirmPassword}
      
        />
   {error.confirmPassword&& <p style={{ color: "red"  , padding:"0"}}>{error.confirmPassword}</p>}
        

            <button type="submit">  {loading ? <span className="loader"></span> : "Create Account"}</button>
            {error.server&& <p style={{ color: "red"  , padding:"0"}}>{error.server}</p>}
            
      </form>

      <p className="options">
        Already have an account?{" "}
        <Link href="/Auth/login">Login</Link>
      </p>
        </div>
        <div className="image">
              <Image
      src="/signimg.png"
      fill
    style={{ objectFit: "cover" }}
      alt="Picture of the author"
    />
          </div>

          

            </div>
    </>

  );
}