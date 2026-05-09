export default function ForbiddenPage() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      background: "#111",
      color: "white"
    }}>
      <h1>⛔ Access Denied</h1>
          <p>You don't have permission to access this page</p>
    
      <a href="/" style={{ color: "cyan", marginTop: "10px" }}>
        Go Home
      </a>
    </div>
  );
}