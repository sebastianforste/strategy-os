# Gunnercooke Marketing - Engineering Explainer

**Project**: `gunnercooke marketing`
**Stack**: Markdown, Python (Minimal)
**Type**: Knowledge Base / Content Repository

## 1. Executive Overview
This project appears to be a repository of marketing knowledge, specifically containing summaries and notes from major business/marketing books (e.g., *Building a StoryBrand*, *Purple Cow*, *The Tipping Point*).

It contains a `src/` directory with an empty `__init__.py`, suggesting it may be the start of a Python-based RAG (Retrieval Augmented Generation) system or a simple script repository for processing these notes, but currently, it serves primarily as a dataset.

## 2. Directory Structure
```
gunnercooke marketing/
├── docs/           # Documentation folder
├── src/            # Python source (currently empty package)
├── tests/          # Test directory
├── *.md            # ~15 Book Summaries (Markdown)
└── README.md
```

## 3. Data Content
The root directory contains Markdown files representing high-quality ingestion data for a specialized Marketing concepts database.
Examples:
-   `Positioning-Al-Ries-and-Jack-Trout.md`
-   `Ogilvy-on-Advertising-David-Ogilvy.md`

## 4. Suggested Improvements
1.  **Structure**: Move all `.md` files into a `data/` or `books/` subdirectory to clean up the root.
2.  **Implementation**: If this is intended for RAG, implement a generic ingestion script in `src/` using `langchain` or `llama-index` to parse these markdown files.
