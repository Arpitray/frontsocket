"use client";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function GoogleButton() {
  const { login } = useAuth();

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              credential: credentialResponse.credential,
            }),
          });

          const data = await res.json();
          if (res.ok && data.token) login(data.token);
        }}
        onError={() => console.log("Google login failed")}
      />
    </GoogleOAuthProvider>
  );
}
