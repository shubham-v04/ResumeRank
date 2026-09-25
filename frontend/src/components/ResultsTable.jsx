const API_BASE = "http://localhost:8000";

const badgeStyle = {
  display: "inline-block",
  fontSize: "11px",
  padding: "2px 8px",
  borderRadius: "10px",
  marginRight: "4px",
  marginTop: "4px",
};

function SkillCell({ row }) {
  if (row.skill_match_percent === null || row.skill_match_percent === undefined) {
    return <span style={{ color: "#aaa" }}>-</span>;
  }
  const total = row.skills_matched.length + row.skills_missing.length;
  return (
    <div>
      <div>{row.skill_match_percent}% ({row.skills_matched.length}/{total})</div>
      {row.skills_missing.length > 0 && (
        <div>
          {row.skills_missing.map((skill) => (
            <span
              key={skill}
              style={{ ...badgeStyle, background: "#fee2e2", color: "#991b1b" }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ExperienceCell({ row }) {
  if (row.years_experience === null || row.years_experience === undefined) {
    return <span style={{ color: "#aaa" }}>Unknown</span>;
  }
  if (row.meets_experience === null || row.meets_experience === undefined) {
    return <span>{row.years_experience} yrs</span>;
  }
  const color = row.meets_experience ? "#16a34a" : "#b91c1c";
  const icon = row.meets_experience ? "\u2713" : "\u2717";
  return (
    <span style={{ color, fontWeight: 500 }}>
      {icon} {row.years_experience} yrs
    </span>
  );
}

export default function ResultsTable({ results }) {
  if (results.length === 0) return null;

  return (
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Email</th>
          <th>Match Score</th>
          <th>Skill Match</th>
          <th>Experience</th>
          <th>Resume</th>
        </tr>
      </thead>
      <tbody>
        {results.map((r, i) => (
          <tr key={r.filename + i}>
            <td>{i + 1}</td>
            <td>{r.name}</td>
            <td>{r.email}</td>
            <td>{r.score}%</td>
            <td><SkillCell row={r} /></td>
            <td><ExperienceCell row={r} /></td>
            <td>
              <a
                href={`${API_BASE}${r.resume_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-view-resume"
                title={r.filename}
              >
                View
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
