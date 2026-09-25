const EXAMPLE_JD = `Backend Developer - Job Description

We are looking for a Backend Developer to join our engineering team.

Responsibilities:
- Design and build RESTful APIs using Python and FastAPI
- Work with PostgreSQL and SQL databases for data modeling and queries
- Write clean, tested, maintainable code and use Git for version control
- Collaborate with frontend developers to integrate APIs

Required Skills:
- Strong proficiency in Python
- Experience with FastAPI or Flask
- Solid understanding of REST API design
- Experience with SQL / PostgreSQL
- Familiarity with Git and version control workflows`;

const MIN_RECOMMENDED_WORDS = 30;

export default function JobDescriptionInput({ value, onChange }) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const isShort = wordCount > 0 && wordCount < MIN_RECOMMENDED_WORDS;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label htmlFor="job-description" style={{ marginBottom: 0 }}>
          Job Description
        </label>
        <button
          type="button"
          onClick={() => onChange(EXAMPLE_JD)}
          style={{
            background: "none",
            border: "none",
            color: "#1f7a5c",
            cursor: "pointer",
            fontSize: "13px",
            padding: 0,
            fontWeight: 600,
          }}
        >
        </button>
      </div>
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
