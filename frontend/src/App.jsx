import { useEffect, useState } from "react";
import JobDescriptionInput from "./components/JobDescriptionInput";
import SkillsInput from "./components/SkillsInput";
import ExperienceInput from "./components/ExperienceInput";
import ResumeUpload from "./components/ResumeUpload";
import AnalyzeButton from "./components/AnalyzeButton";
import ResultsTable from "./components/ResultsTable";
import DownloadButtons from "./components/DownloadButtons";
import ErrorBanner from "./components/ErrorBanner";
import ResetButton from "./components/ResetButton";
import { analyzeResumes } from "./api";

const DRAFT_KEY = "resumerank_draft";

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const draft = loadDraft();

  const [jobDescription, setJobDescription] = useState(draft?.jobDescription || "");
  const [skills, setSkills] = useState(draft?.skills || []);
  const [minExperience, setMinExperience] = useState(draft?.minExperience || "");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ jobDescription, skills, minExperience })
    );
  }, [jobDescription, skills, minExperience]);

  const handleFilesChange = (newFiles, rejectedCount) => {
    setFiles(newFiles);
    if (rejectedCount) {
      setError(`${rejectedCount} file(s) were skipped - only PDF and Word (.docx) files are supported.`);
    }
  };

  const handleAnalyze = async () => {
    setError("");

    if (!jobDescription.trim()) {
      setError("Please enter a job description first.");
      return;
    }
    if (files.length === 0) {
      setError("Please upload at least one resume.");
      return;
    }

    setLoading(true);
    try {
      const data = await analyzeResumes(jobDescription, files, skills, minExperience);
      setResults(data.results);

      if (data.skipped && data.skipped.length > 0) {
        setError(
          `Note: ${data.skipped.length} file(s) could not be read and were skipped: ${data.skipped.join(", ")}`
        );
      }
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJobDescription("");
    setSkills([]);
    setMinExperience("");
    setFiles([]);
    setResults([]);
    setError("");
    localStorage.removeItem(DRAFT_KEY);
  };

  return (
    <div className="page">
      <header className="site-header">
        <div className="inner-wrap">
          <span className="wordmark">ResumeRank</span>
          <span className="tagline">Rank resumes against a job in minutes</span>
        </div>
      </header>

      <section className="hero">
        <h1>Find your best-fit candidates faster</h1>
        <p>Paste a job description, drop in resumes, and get a scored, ranked shortlist you can export.</p>
      </section>

      <main>
        <div className="tool-panel">
          <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
          <SkillsInput skills={skills} onChange={setSkills} />
          <ExperienceInput value={minExperience} onChange={setMinExperience} />
          <ResumeUpload files={files} onChange={handleFilesChange} />

          <div className="button-row">
            <AnalyzeButton onClick={handleAnalyze} loading={loading} />
            <ResetButton onClick={handleReset} />
          </div>

          {loading && <p className="loading-text">Reading and scoring resumes, please wait...</p>}

          <ErrorBanner message={error} />

          <ResultsTable results={results} />
          <DownloadButtons visible={results.length > 0} />
        </div>
      </main>

      <footer className="site-footer">
        ResumeRank - a personal project. Runs entirely on your machine, no data leaves your laptop.
      </footer>
    </div>
  );
}
