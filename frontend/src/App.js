import "@/App.css";

function App() {
  return (
    <div
      data-testid="app-placeholder"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        color: "#333",
        background: "#fafafa",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ marginBottom: "0.5rem" }}>Novo site em construção</h1>
        <p style={{ color: "#666" }}>
          Painel administrativo disponível em{" "}
          <a href="/donaspainel/" data-testid="admin-panel-link">
            /donaspainel/
          </a>
        </p>
      </div>
    </div>
  );
}

export default App;
