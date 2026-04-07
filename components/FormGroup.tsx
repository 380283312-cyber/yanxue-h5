"use client";

export function FormGroup({ label, labelHint, children }: { label: string; labelHint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          color: "#374151",
          fontSize: "13px",
          fontWeight: 500,
          marginBottom: "6px",
          flexWrap: "wrap",
        }}
      >
        {label}
        {labelHint && (
          <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 500 }}>{labelHint}</span>
        )}
      </label>
      {children}
    </div>
  );
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        marginBottom: "12px",
      }}
    >
      {children}
    </div>
  );
}
