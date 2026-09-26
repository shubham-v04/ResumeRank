# ResumeRank

A local tool for recruiters: paste a job description, upload multiple resumes
(PDF or Word), and get a ranked, scored, downloadable shortlist.

## How it works

1. Paste or type a job description (with word-count guidance for better matching)
2. Optionally add required skills as tags and a minimum years-of-experience threshold
3. Upload multiple resumes (PDF or .docx)
4. Click Analyze - the backend extracts text from each resume, pulls out a
   candidate's name/email/years of experience, scores it against the job
   description using TF-IDF + cosine similarity blended with skill-overlap
   matching, and returns a ranked list
5. Click straight through to view any candidate's original resume file
6. Download the results as a styled Excel or PDF

No login, no database - everything happens in memory/on disk for the
current run.

## Project structure

```
ResumeRank/
├── README.md
├── .gitignore
├── backend/
│   ├── main.py           # FastAPI app + routes
│   ├── parser.py         # PDF/DOCX text extraction + name/email/experience extraction
│   ├── scorer.py         # TF-IDF + cosine similarity + skill-overlap scoring
│   ├── exporters.py      # styled Excel and PDF generation
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── components/    # one component per feature
│   └── package.json
└── sample-data/            # 10 sample resumes + a sample job description, covering a range of match strengths
```

## Setup

### Backend
```
cd backend
python -m venv venv
venv\Scripts\activate.bat        (Windows cmd)
pip install -r requirements.txt
uvicorn main:app --reload
```
Runs at http://localhost:8000

### Frontend
```
cd frontend
npm install
npm run dev
```
Runs at http://localhost:5173

Open the frontend URL in your browser - it talks to the backend automatically.

## Features

1. Job description input with word-count guidance
2. Required skills as tags, checked for exact presence in each resume
3. Minimum years-of-experience threshold (estimated from resume text)
4. Multi-file resume upload (PDF/Word)
5. Ranked results table with match score, skill match breakdown, and experience flag
6. Candidate name, email, and years of experience extracted automatically
7. Click through to view the original resume file
8. Download results as a styled Excel or PDF
9. Job description, skills, and experience threshold auto-saved as a draft (localStorage) so a refresh doesn't lose your work
10. Reset button to start over

## Notes / known limitations

- Name/email extraction uses simple regex, not full NLP - works best on
  resumes with a clear "Firstname Lastname" near the top and a standard email.
- Years-of-experience is a regex heuristic ("N years" phrases in the text) -
  treat it as approximate.
- Scoring blends TF-IDF keyword overlap with skill matching - not a fully
  semantic match (a resume that says "led a team" won't automatically
  match a JD asking for "team leadership").
- Only .pdf and .docx are supported; scanned/image-only PDFs will be
  skipped since there's no OCR yet.
- Uploaded resumes are kept on disk only for the current run and are
  never committed to git.