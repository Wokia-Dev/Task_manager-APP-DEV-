"""
Utility helpers for the TaskFlow backend.
"""
import random


# List of pleasant, distinguishable avatar colors
AVATAR_COLORS = [
    '#6C63FF',  # Indigo
    '#00C9A7',  # Teal
    '#FF6B6B',  # Coral
    '#FFB347',  # Orange
    '#4ECDC4',  # Mint
    '#45B7D1',  # Sky blue
    '#96CEB4',  # Sage
    '#FFEAA7',  # Lemon
    '#DDA0DD',  # Plum
    '#98D8C8',  # Seafoam
]


def random_avatar_color() -> str:
    """Return a random avatar color hex code."""
    return random.choice(AVATAR_COLORS)
