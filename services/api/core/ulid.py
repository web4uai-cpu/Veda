"""
VEDA — ULID Generation Utility
=================================
Generates ULID-based IDs with entity-type prefixes.
This is the canonical ID generator for ALL VEDA entities.

Usage:
    from core.ulid import generate_id
    
    scripture_id = generate_id("scp")  # "scp_01JXYZ..."
    verse_id = generate_id("vrs")      # "vrs_01JXYZ..."
"""

import time
import os
import struct

# ULID encoding alphabet (Crockford's Base32)
_ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

# Valid entity prefixes — must match @veda/types
VALID_PREFIXES = {
    "usr": "User",
    "scp": "Scripture",
    "bok": "Book",
    "chp": "Chapter",
    "vrs": "Verse",
    "cpt": "Concept",
    "prs": "Person",
    "dei": "Deity",
    "evt": "Event",
    "plc": "Place",
    "com": "Commentary",
    "upl": "Upload",
    "nts": "Note",
    "rpt": "Report",
    "col": "Collection",
    "bmk": "Bookmark",
    "vct": "VerseContent",
    "cli": "CollectionItem",
    "chk": "Chunk",
}


def _encode_ulid_timestamp(t_ms: int) -> str:
    """Encode a Unix timestamp in milliseconds to 10 Crockford Base32 chars."""
    chars = []
    for _ in range(10):
        chars.append(_ENCODING[t_ms & 0x1F])
        t_ms >>= 5
    return "".join(reversed(chars))


def _encode_ulid_random() -> str:
    """Generate 16 random Crockford Base32 chars (80 bits of randomness)."""
    random_bytes = os.urandom(10)
    # Convert 10 bytes (80 bits) to 16 base32 chars
    value = int.from_bytes(random_bytes, byteorder="big")
    chars = []
    for _ in range(16):
        chars.append(_ENCODING[value & 0x1F])
        value >>= 5
    return "".join(reversed(chars))


def generate_ulid() -> str:
    """Generate a raw ULID string (26 chars, time-sortable)."""
    t_ms = int(time.time() * 1000)
    return _encode_ulid_timestamp(t_ms) + _encode_ulid_random()


def generate_id(prefix: str) -> str:
    """
    Generate a prefixed ULID for a given entity type.
    
    Args:
        prefix: Entity type prefix (e.g., "scp", "vrs", "cpt")
        
    Returns:
        Prefixed ULID string (e.g., "scp_01JXYZ...")
        
    Raises:
        ValueError: If prefix is not in VALID_PREFIXES
    """
    if prefix not in VALID_PREFIXES:
        raise ValueError(
            f"Invalid prefix '{prefix}'. Valid prefixes: {', '.join(sorted(VALID_PREFIXES.keys()))}"
        )
    return f"{prefix}_{generate_ulid()}"


def extract_prefix(entity_id: str) -> str:
    """Extract the type prefix from a VEDA entity ID."""
    if "_" not in entity_id:
        raise ValueError(f"Invalid VEDA ID format: '{entity_id}' (missing prefix)")
    prefix = entity_id.split("_")[0]
    if prefix not in VALID_PREFIXES:
        raise ValueError(f"Unknown prefix '{prefix}' in ID '{entity_id}'")
    return prefix


def validate_id(entity_id: str, expected_prefix: str) -> bool:
    """
    Validate that an ID has the correct prefix and format.
    
    Args:
        entity_id: The ID to validate
        expected_prefix: The expected prefix (e.g., "scp")
        
    Returns:
        True if valid
        
    Raises:
        ValueError: If validation fails
    """
    if not entity_id:
        raise ValueError("ID cannot be empty")
    if not entity_id.startswith(f"{expected_prefix}_"):
        raise ValueError(
            f"Expected prefix '{expected_prefix}_' but got '{entity_id[:4]}'"
        )
    ulid_part = entity_id[len(expected_prefix) + 1:]
    if len(ulid_part) != 26:
        raise ValueError(
            f"ULID part must be 26 chars, got {len(ulid_part)} in '{entity_id}'"
        )
    return True
