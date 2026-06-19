"""
VEDA — PDF Processing Service
=================================
Extracts text from PDF files and chunks it for storage and search.
Uses PyMuPDF (fitz) for text extraction — handles text-based PDFs.
Scanned/image PDFs require OCR (deferred to a later phase).
"""

from __future__ import annotations

import logging
import re

logger = logging.getLogger("veda.services.pdf")

# Approximate tokens per word (conservative estimate for English/Sanskrit mix)
WORDS_PER_TOKEN = 0.75


def extract_text_from_pdf(pdf_bytes: bytes) -> list[dict]:
    """Extract text page by page from a PDF.

    Args:
        pdf_bytes: Raw PDF file content.

    Returns:
        List of {"page": int, "text": str} dicts, one per page.
        Pages with no extractable text are included with empty text.
    """
    import fitz  # PyMuPDF

    pages = []
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text") or ""
            pages.append({"page": page_num + 1, "text": text.strip()})
    finally:
        doc.close()

    non_empty = sum(1 for p in pages if p["text"])
    logger.info("Extracted %d pages (%d with text)", len(pages), non_empty)
    return pages


def _estimate_tokens(text: str) -> int:
    """Rough token count from word count."""
    return int(len(text.split()) / WORDS_PER_TOKEN)


def chunk_text(
    pages: list[dict],
    max_tokens: int = 800,
    overlap_tokens: int = 100,
) -> list[dict]:
    """Split extracted page text into overlapping chunks.

    Tries to split on paragraph boundaries. Each chunk records which
    pages it spans for citation provenance.

    Args:
        pages: Output of extract_text_from_pdf.
        max_tokens: Target max tokens per chunk.
        overlap_tokens: Overlap between consecutive chunks.

    Returns:
        List of {"chunk_index": int, "content": str,
                 "page_start": int, "page_end": int} dicts.
    """
    # Concatenate all pages into paragraphs with page tracking
    segments: list[tuple[str, int]] = []  # (paragraph, page_number)
    for p in pages:
        if not p["text"]:
            continue
        paragraphs = re.split(r"\n\s*\n", p["text"])
        for para in paragraphs:
            para = para.strip()
            if para:
                segments.append((para, p["page"]))

    if not segments:
        return []

    chunks: list[dict] = []
    chunk_index = 0
    i = 0

    while i < len(segments):
        current_parts: list[str] = []
        current_tokens = 0
        page_start = segments[i][1]
        page_end = page_start
        start_i = i

        while i < len(segments):
            para_text, page_num = segments[i]
            para_tokens = _estimate_tokens(para_text)

            if current_tokens + para_tokens > max_tokens and current_parts:
                break

            current_parts.append(para_text)
            current_tokens += para_tokens
            page_end = page_num
            i += 1

        content = "\n\n".join(current_parts)
        if content:
            chunks.append({
                "chunk_index": chunk_index,
                "content": content,
                "page_start": page_start,
                "page_end": page_end,
            })
            chunk_index += 1

        # Overlap: step back by overlap_tokens worth of segments
        if i < len(segments):
            overlap_accumulated = 0
            rewind = 0
            for j in range(i - 1, start_i, -1):
                overlap_accumulated += _estimate_tokens(segments[j][0])
                rewind += 1
                if overlap_accumulated >= overlap_tokens:
                    break
            i = i - rewind if rewind > 0 else i

    logger.info("Created %d chunks from %d segments", len(chunks), len(segments))
    return chunks
