"""
Scoring logic, kept separate from the API layer on purpose.

Two scoring signals are combined:
  1. TF-IDF + cosine similarity  - general text relevance (v1 baseline)
  2. Explicit skill-overlap      - does the resume literally mention
                                    each required skill the recruiter listed

If the recruiter provides required skills, the final score is a
weighted blend of both. If not, it falls back to TF-IDF alone.
"""

import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

TFIDF_WEIGHT = 0.6
SKILL_WEIGHT = 0.4


def tfidf_scores(job_description: str, resume_texts: list[str]) -> list[float]:
    """Returns a similarity score (0-100) for each resume, TF-IDF based."""
    if not job_description.strip() or not resume_texts:
        return [0.0] * len(resume_texts)

    corpus = [job_description] + resume_texts
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(corpus)

    job_vector = tfidf_matrix[0]
    resume_vectors = tfidf_matrix[1:]

    scores = []
    for i in range(resume_vectors.shape[0]):
        similarity = cosine_similarity(job_vector, resume_vectors[i])[0][0]
        scores.append(round(float(similarity) * 100, 2))
    return scores


def match_skills(resume_text: str, required_skills: list[str]):
    """
    Checks which required skills literally appear in the resume text
    (case-insensitive, whole-word-ish match). Returns matched list,
    missing list, and a 0-100 percentage.
    """
    if not required_skills:
        return [], [], None

    text_lower = resume_text.lower()
    matched, missing = [], []

    for skill in required_skills:
        skill_clean = skill.strip()
        if not skill_clean:
            continue
        pattern = re.escape(skill_clean.lower())
        if re.search(rf"\b{pattern}\b", text_lower):
            matched.append(skill_clean)
        else:
            missing.append(skill_clean)

    total = len(matched) + len(missing)
    percent = round((len(matched) / total) * 100, 2) if total else None
    return matched, missing, percent


def score_resumes(job_description: str, resume_texts: list[str], required_skills: list[str] = None):
    """
    Returns a list of dicts, one per resume, each containing:
      final_score, tfidf_score, skill_match_percent, skills_matched, skills_missing
    """
    required_skills = required_skills or []
    tfidf = tfidf_scores(job_description, resume_texts)

    results = []
    for text, tfidf_score in zip(resume_texts, tfidf):
        matched, missing, skill_percent = match_skills(text, required_skills)

        if skill_percent is not None:
            final = round(float(TFIDF_WEIGHT * tfidf_score + SKILL_WEIGHT * skill_percent), 2)
        else:
            final = float(tfidf_score)

        results.append({
            "final_score": final,
            "tfidf_score": tfidf_score,
            "skill_match_percent": skill_percent,
            "skills_matched": matched,
            "skills_missing": missing,
        })

    return results
