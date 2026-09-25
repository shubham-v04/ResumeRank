import { useState } from "react";

export default function SkillsInput({ skills, onChange }) {
  const [draft, setDraft] = useState("");

  const addSkill = () => {
    const clean = draft.trim();
    if (clean && !skills.includes(clean)) {
      onChange([...skills, clean]);
    }
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skillToRemove) => {
    onChange(skills.filter((s) => s !== skillToRemove));
  };

  return (
    <div>
      <label htmlFor="skills-input">Required Skills</label>
      <input
        id="skills-input"
        type="text"
        placeholder="Type a skill and press Enter"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addSkill}
        style={{
          width: "100%",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          boxSizing: "border-box",
        }}
      />
      {skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
          {skills.map((skill) => (
            <span
              key={skill}
              style={{
                background: "#e4f2ec",
                color: "#145c44",
                padding: "4px 10px",
                borderRadius: "16px",
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#145c44",
                  fontWeight: "bold",
                  padding: 0,
                  lineHeight: 1,
                }}
                aria-label={`Remove ${skill}`}
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}
      <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
        Checks each resume for these exact terms.
      </p>
    </div>
  );
}
