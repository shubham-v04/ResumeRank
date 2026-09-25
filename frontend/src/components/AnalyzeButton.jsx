export default function AnalyzeButton({ onClick, loading, disabled }) {
  return (
    <button className="btn-primary" onClick={onClick} disabled={disabled || loading}>
      {loading ? "Analyzing..." : "Analyze Resumes"}
    </button>
  );
}
