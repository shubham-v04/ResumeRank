const MIN_RECOMMENDED_WORDS = 30;

export default function JobDescriptionInput({ value, onChange }) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const isShort = wordCount > 0 && wordCount < MIN_RECOMMENDED_WORDS;

  return (
    <div>
      <label htmlFor="job-description">Job Description</label>
      <textarea
        id="job-description"
        rows={8}
        placeholder="Paste or type the job requirements here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p style={{ fontSize: "12px", color: isShort ? "#b45309" : "#888", marginTop: "4px" }}>
        {wordCount} word{wordCount === 1 ? "" : "s"}
        {isShort && ` - add more detail (aim for ${MIN_RECOMMENDED_WORDS}+ words) for better matching`}
      </p>
    </div>
  );
}
