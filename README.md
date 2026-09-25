# ResumeRank

A local tool for recruiters: paste a job description, upload multiple resumes
(PDF or Word), and get a ranked, scored, downloadable shortlist.

## How it works

1. Paste/type a job description
2. Upload multiple resumes (PDF or .docx)
3. Click Analyze - the backend extracts text from each resume, scores it
   against the job description using TF-IDF + cosine similarity, and
   returns a ranked list with name/email pulled out automatically
4. Download the results as Excel or PDF

No login, no database - everything happens in memory for the current run.

## Project structure

```
ResumeRank/
├── backend/
│   ├── main.py           # FastAPI app + routes
│   ├── parser.py         # PDF/DOCX text extraction + name/email extraction
│   ├── scorer.py         # TF-IDF + cosine similarity scoring
│   ├── exporters.py      # Excel and PDF generation
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js
    │   └── components/    # one component per feature
    └── package.json
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

## Notes / known limitations (v1)

- Name/email extraction uses simple regex, not full NLP - works best on
  resumes with a clear "Firstname Lastname" near the top and a standard email.
- Scoring is TF-IDF based (keyword overlap), not semantic - a resume that
  says "led a team" won't automatically match a JD asking for "team
  leadership." Upgrading to sentence-transformers embeddings is a natural v2.
- Only .pdf and .docx are supported; scanned/image-only PDFs will be
  skipped since there's no OCR yet.
