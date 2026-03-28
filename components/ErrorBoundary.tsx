"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("React ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          padding: "24px",
          background: "#fee",
          border: "2px solid #f00",
          borderRadius: "12px",
          color: "#c00",
          fontFamily: "monospace",
          fontSize: "13px",
        }}>
          <strong style={{ fontSize: "16px" }}>⚠️ 组件渲染出错</strong>
          <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #f00" }} />
          <div style={{ marginBottom: "8px" }}><strong>错误信息：</strong></div>
          <div style={{ color: "#800", wordBreak: "break-all" }}>{this.state.error?.message}</div>
          <div style={{ marginTop: "12px", color: "#666", fontSize: "11px" }}>
            请截屏此页面发给开发者
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
