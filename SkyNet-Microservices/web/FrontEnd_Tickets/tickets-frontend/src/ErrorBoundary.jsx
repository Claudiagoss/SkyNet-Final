import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24 }}>
          <h1 style={{ color: "crimson" }}>Error en la página</h1>
          <pre style={{ whiteSpace: "pre-wrap", background: "#fee", padding: 12, borderRadius: 6 }}>
            {String(this.state.error)}
            {this.state.info ? "\n\n" + JSON.stringify(this.state.info, null, 2) : ""}
          </pre>
          <p>Revisa la consola para más detalles.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
