"use client";

import { useState } from "react";
import Link from "next/link";
import "../Signup/Signup.css"
import Image from 'next/image'
import Cookies from "js-cookie";
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation";


export default function loginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
 
  });

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError({});
     let errors = {};
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
    if (Object.keys(errors).length > 0) {
    setError(errors);
    return;
  }
  
  setLoading(true);

  const res = await signIn("credentials", {
    email: form.email,
    password: form.password,
    redirect: false,
  });
     localStorage.removeItem("guestId");
    router.push("/")

  if (res?.error) {
    setError({
      server: res.error || "Invalid email or password",
    });
    setLoading(false);

    
    return;
  }

  setLoading(false);


};
  return (
    <>
      <div className="auth-signup">

  
          <div className="auth-container">
           <div className="text">
       <h2>Welcome Back 👋</h2>
  <p>
    Great to see you again! Log in to continue where you left off, 
    manage your profile, and enjoy a seamless shopping experience tailored just for you.
  </p>
           </div>

      <form  className="auth-form" onSubmit={handleSubmit}>

   

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

 {error.server&& <p style={{ color: "red"  , padding:"0" , textAlign:"center"}}>{error.server}</p>}
        

   <button type="submit" >  {loading ? <span className="loader"></span> : "sign in"}</button>
            <button  type="button"className="google-button" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={() => {signIn("google", { callbackUrl: "/" })
                
    }}
            >
          <Image
      src="/google.png"
       width={25}
       height={25}
      alt="Picture of the author"
              />
      <p style={{ paddingLeft: "10px" }} >sign with google</p></button>
            
            
      </form>

      <p className="options">
        Don't have account{" "}
        <Link href="/Auth/Signup">Sign up now</Link>
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