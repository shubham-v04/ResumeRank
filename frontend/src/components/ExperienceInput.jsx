export default function ExperienceInput({ value, onChange }) {
  return (
    <div>
      <label htmlFor="min-experience">Minimum Experience (Years)</label>
      <input
        id="min-experience"
        type="number"
        min="0"
        max="50"
        placeholder=""
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "120px",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          boxSizing: "border-box",
        }}
      />
      <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
        Estimated from the resume text - treat as approximate.
      </p>
    </div>
  );
}
