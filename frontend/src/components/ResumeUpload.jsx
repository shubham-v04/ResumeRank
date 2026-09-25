import { useRef, useState } from "react";

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

function isAllowed(file) {
  return ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
}

export default function ResumeUpload({ files, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (newFiles) => {
    const incoming = Array.from(newFiles);
    const valid = incoming.filter(isAllowed);
    const rejectedCount = incoming.length - valid.length;

  
    const existingNames = new Set(files.map((f) => f.name));
    const merged = [...files, ...valid.filter((f) => !existingNames.has(f.name))];
    onChange(merged, rejectedCount);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (nameToRemove) => {
    onChange(files.filter((f) => f.name !== nameToRemove));
  };

  return (
    <div>
      <label>Upload Resumes (PDF or Docx)</label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        style={{
          border: `2px dashed ${isDragging ? "#1f7a5c" : "#ccc"}`,
          borderRadius: "8px",
          padding: "24px",
          textAlign: "center",
          cursor: "pointer",
          background: isDragging ? "#e4f2ec" : "#fafafa",
          transition: "border-color 0.2s, background-color 0.2s",
        }}
      >
        <p style={{ margin: 0, color: "#555" }}>
          Drag and drop resumes here, or click to browse
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          multiple
          style={{ display: "none" }}
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
          {files.map((file) => (
            <li
              key={file.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 10px",
                background: "#f4f5f7",
                borderRadius: "6px",
                marginBottom: "4px",
                fontSize: "13px",
              }}
            >
              <span>
                {file.name} <span style={{ color: "#888" }}>({(file.size / 1024).toFixed(0)} KB)</span>
              </span>
              <button
                type="button"
                onClick={() => removeFile(file.name)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#b91c1c",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
