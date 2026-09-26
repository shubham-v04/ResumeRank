"""
Tests for parser.py - pure text-processing functions, no file I/O,
no API key or network needed.
Run with: cd backend && pytest
"""

from parser import extract_entities, extract_years_of_experience, is_allowed_file


def test_extract_entities_finds_name_and_email():
    text = "John Smith\njohn.smith@example.com\nSenior Backend Developer"
    name, email = extract_entities(text)

    assert name == "John Smith"
    assert email == "john.smith@example.com"


def test_extract_entities_missing_name_returns_unknown():
    text = "Contact: someone@example.com, no name line here."
    name, email = extract_entities(text)

    assert name == "Unknown"
    assert email == "someone@example.com"


def test_extract_entities_missing_email_returns_not_found():
    text = "Jane Doe\nSoftware Engineer with 3 years of experience"
    name, email = extract_entities(text)

    assert name == "Jane Doe"
    assert email == "Not found"


def test_extract_years_of_experience_plain_years():
    assert extract_years_of_experience("5 years of experience in web development") == 5


def test_extract_years_of_experience_plus_and_abbreviation():
    assert extract_years_of_experience("3+ yrs experience with Python") == 3


def test_extract_years_of_experience_takes_the_largest_mention():
    text = "2 years as an intern, then 6 years as a full-time engineer"
    assert extract_years_of_experience(text) == 6


def test_extract_years_of_experience_ignores_obvious_junk():
    # A "100 years" mention (e.g. "founded 100 years ago") should be
    # ignored as junk rather than treated as someone's real experience.
    text = "Our company was founded 100 years ago. I have 4 years experience."
    assert extract_years_of_experience(text) == 4


def test_extract_years_of_experience_no_match_returns_none():
    assert extract_years_of_experience("No experience mentioned here.") is None


def test_is_allowed_file_accepts_pdf_and_docx():
    assert is_allowed_file("resume.pdf") is True
    assert is_allowed_file("resume.docx") is True
    assert is_allowed_file("RESUME.PDF") is True


def test_is_allowed_file_rejects_other_extensions():
    assert is_allowed_file("resume.txt") is False
    assert is_allowed_file("resume.exe") is False
    assert is_allowed_file("resume") is False
