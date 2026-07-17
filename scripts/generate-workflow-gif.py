#!/usr/bin/env python3
"""
Generate a 16:9 animated GIF explaining how the engineering-docs plugin works.
Shows the complete technical workflow from idea to documentation.
"""

import math
from PIL import Image, ImageDraw, ImageFont
import os

# ── Configuration ────────────────────────────────────────────────────────────
WIDTH = 1280
HEIGHT = 720
FPS = 10
OUTPUT_FILE = "assets/plugin-workflow.gif"

# Dark theme colors
BG_COLOR = (15, 23, 42)  # Slate-900
CARD_BG = (30, 41, 59)   # Slate-800
CARD_BORDER = (51, 65, 85)  # Slate-700
ACCENT_CYAN = (6, 182, 212)
ACCENT_GREEN = (34, 197, 94)
ACCENT_PURPLE = (168, 85, 247)
ACCENT_ORANGE = (251, 146, 60)
ACCENT_PINK = (236, 72, 153)
TEXT_WHITE = (248, 250, 252)
TEXT_GRAY = (148, 163, 184)
TEXT_DIM = (100, 116, 139)

# Animation phases
PHASES = [
    {
        "title": "1. User Gives Idea",
        "subtitle": "The agent receives a raw business concept",
        "highlight": "user",
        "duration": 3
    },
    {
        "title": "2. Orchestrator Activates",
        "subtitle": "using-engineering-docs skill triggers automatically",
        "highlight": "orchestrator",
        "duration": 3
    },
    {
        "title": "3. Mode Detection",
        "subtitle": "Greenfield (new) vs Brownfield (existing) detection",
        "highlight": "mode",
        "duration": 2
    },
    {
        "title": "4. Interview Phase",
        "subtitle": "Tool-call questions with context loading",
        "highlight": "interview",
        "duration": 3
    },
    {
        "title": "5. Document Generation",
        "subtitle": "Sequential generation with 22 specialized skills",
        "highlight": "generation",
        "duration": 4
    },
    {
        "title": "6. Cross-Document Consistency",
        "subtitle": "Verify entity names, roles, decisions match across docs",
        "highlight": "consistency",
        "duration": 3
    },
    {
        "title": "7. Master Index Created",
        "subtitle": "Complete blueprint ready for implementation",
        "highlight": "complete",
        "duration": 3
    }
]


def draw_rounded_rect(draw, x1, y1, x2, y2, radius, fill, outline=None, width=1):
    """Draw a rounded rectangle."""
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill, outline=outline, width=width)


def draw_icon(draw, x, y, icon_type, color, size=24):
    """Draw a simple icon."""
    if icon_type == "user":
        # Person icon
        draw.ellipse([x - size // 3, y - size // 2, x + size // 3, y - size // 6], fill=color)
        draw.arc([x - size // 2, y - size // 6, x + size // 2, y + size // 2], 0, 180, fill=color, width=2)
    elif icon_type == "doc":
        # Document icon
        draw.rectangle([x - size // 3, y - size // 2, x + size // 3, y + size // 2], fill=color, outline=TEXT_WHITE, width=1)
        draw.line([(x - size // 4, y - size // 4), (x + size // 4, y - size // 4)], fill=TEXT_WHITE, width=1)
        draw.line([(x - size // 4, y), (x + size // 4, y)], fill=TEXT_WHITE, width=1)
        draw.line([(x - size // 4, y + size // 4), (x + size // 4, y + size // 4)], fill=TEXT_WHITE, width=1)
    elif icon_type == "check":
        # Checkmark
        draw.line([(x - size // 3, y), (x - size // 6, y + size // 3)], fill=color, width=3)
        draw.line([(x - size // 6, y + size // 3), (x + size // 3, y - size // 3)], fill=color, width=3)
    elif icon_type == "arrow":
        # Arrow right
        draw.line([(x - size // 2, y), (x + size // 2, y)], fill=color, width=2)
        draw.line([(x + size // 4, y - size // 4), (x + size // 2, y)], fill=color, width=2)
        draw.line([(x + size // 4, y + size // 4), (x + size // 2, y)], fill=color, width=2)


def draw_progress_bar(draw, x, y, width, height, progress, color):
    """Draw a progress bar."""
    # Background
    draw_rounded_rect(draw, x, y, x + width, y + height, height // 2, CARD_BG, CARD_BORDER, 1)
    # Fill
    fill_width = int(width * progress)
    if fill_width > 0:
        draw_rounded_rect(draw, x, y, x + fill_width, y + height, height // 2, color)


def create_frame(phase_idx, sub_step=0):
    """Create a single frame of the animation."""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    phase = PHASES[phase_idx]

    # ── Header ───────────────────────────────────────────────────────────
    draw.text((40, 25), "Engineering Docs Plugin", fill=TEXT_WHITE)
    draw.text((40, 50), "How It Works — Technical Workflow", fill=TEXT_GRAY)

    # Progress indicator
    for i in range(len(PHASES)):
        color = ACCENT_CYAN if i <= phase_idx else CARD_BORDER
        draw.ellipse([WIDTH - 200 + i * 25, 35, WIDTH - 200 + i * 25 + 12, 47], fill=color)

    # ── Main Content Area ────────────────────────────────────────────────
    # Left panel: Workflow steps
    left_x = 40
    left_y = 100

    draw.text((left_x, left_y), "WORKFLOW", fill=TEXT_DIM)
    left_y += 30

    steps = [
        ("💡", "User Idea", ACCENT_CYAN),
        ("🎯", "Orchestrator", ACCENT_GREEN),
        ("🔍", "Mode Detection", ACCENT_PURPLE),
        ("💬", "Interview", ACCENT_ORANGE),
        ("📝", "Document Gen", ACCENT_PINK),
        ("✅", "Consistency", ACCENT_GREEN),
        ("📊", "Master Index", ACCENT_CYAN),
    ]

    for i, (emoji, name, color) in enumerate(steps):
        y_pos = left_y + i * 55
        is_active = i == phase_idx
        is_done = i < phase_idx

        # Step card
        bg = color if is_active else (CARD_BG if not is_done else (20, 30, 50))
        border = color if is_active else (ACCENT_GREEN if is_done else CARD_BORDER)
        draw_rounded_rect(draw, left_x, y_pos, left_x + 200, y_pos + 45, 8, bg, border, 2)

        # Status icon
        if is_done:
            draw.text((left_x + 10, y_pos + 12), "✓", fill=ACCENT_GREEN)
        elif is_active:
            draw.text((left_x + 10, y_pos + 12), "►", fill=TEXT_WHITE)
        else:
            draw.text((left_x + 10, y_pos + 12), "○", fill=TEXT_DIM)

        # Step name
        text_color = TEXT_WHITE if is_active or is_done else TEXT_DIM
        draw.text((left_x + 35, y_pos + 12), name, fill=text_color)

        # Connection line
        if i < len(steps) - 1:
            line_color = ACCENT_GREEN if is_done else CARD_BORDER
            draw.line([(left_x + 100, y_pos + 45), (left_x + 100, y_pos + 55)], fill=line_color, width=2)

    # ── Center panel: Current phase details ──────────────────────────────
    center_x = 280
    center_y = 100

    # Phase title card
    draw_rounded_rect(draw, center_x, center_y, center_x + 450, center_y + 60, 12, phase.get("highlight", ACCENT_CYAN) if isinstance(phase.get("highlight"), tuple) else ACCENT_CYAN, ACCENT_CYAN, 2)
    draw.text((center_x + 20, center_y + 15), phase["title"], fill=TEXT_WHITE)
    draw.text((center_x + 20, center_y + 38), phase["subtitle"], fill=TEXT_GRAY)

    # Phase-specific content
    content_y = center_y + 80

    if phase_idx == 0:  # User Idea
        draw_rounded_rect(draw, center_x, content_y, center_x + 450, content_y + 200, 12, CARD_BG, CARD_BORDER, 1)
        draw.text((center_x + 20, content_y + 15), "User Input:", fill=ACCENT_CYAN)
        draw.text((center_x + 20, content_y + 40), '"I want to build a landing page for', fill=TEXT_WHITE)
        draw.text((center_x + 20, content_y + 60), ' f-commerce business owners in Bangladesh"', fill=TEXT_WHITE)
        draw.text((center_x + 20, content_y + 95), "Agent detects:", fill=ACCENT_GREEN)
        draw.text((center_x + 20, content_y + 120), "  → using-engineering-docs skill", fill=TEXT_GRAY)
        draw.text((center_x + 20, content_y + 140), "  → Mode: Greenfield (new product)", fill=TEXT_GRAY)
        draw.text((center_x + 20, content_y + 160), "  → 22 skills available", fill=TEXT_GRAY)

    elif phase_idx == 1:  # Orchestrator
        draw_rounded_rect(draw, center_x, content_y, center_x + 450, content_y + 250, 12, CARD_BG, CARD_BORDER, 1)
        draw.text((center_x + 20, content_y + 15), "Orchestrator Actions:", fill=ACCENT_GREEN)
        actions = [
            "1. Load context from prior documents",
            "2. Detect Mode (A: Greenfield / B: Brownfield)",
            "3. Select applicable skills (8-12 typical)",
            "4. Create progress ledger (index.md)",
            "5. Begin sequential document generation"
        ]
        for i, action in enumerate(actions):
            draw.text((center_x + 20, content_y + 45 + i * 25), action, fill=TEXT_WHITE)

    elif phase_idx == 2:  # Mode Detection
        draw_rounded_rect(draw, center_x, content_y, center_x + 450, content_y + 200, 12, CARD_BG, CARD_BORDER, 1)
        draw.text((center_x + 20, content_y + 15), "Mode A — Greenfield", fill=ACCENT_GREEN)
        draw.text((center_x + 20, content_y + 40), "• No existing .engineering-docs/", fill=TEXT_WHITE)
        draw.text((center_x + 20, content_y + 60), "• Full pipeline runs", fill=TEXT_WHITE)
        draw.text((center_x + 20, content_y + 80), "• Starts from business concept", fill=TEXT_WHITE)

        draw.text((center_x + 20, content_y + 115), "Mode B — Brownfield", fill=ACCENT_ORANGE)
        draw.text((center_x + 20, content_y + 140), "• Existing .engineering-docs/ found", fill=TEXT_WHITE)
        draw.text((center_x + 20, content_y + 160), "• Only relevant subset of skills", fill=TEXT_WHITE)

    elif phase_idx == 3:  # Interview
        draw_rounded_rect(draw, center_x, content_y, center_x + 450, content_y + 280, 12, CARD_BG, CARD_BORDER, 1)
        draw.text((center_x + 20, content_y + 15), "Interview Process:", fill=ACCENT_ORANGE)
        draw.text((center_x + 20, content_y + 45), "Tool-call based (not inline)", fill=TEXT_WHITE)
        draw.text((center_x + 20, content_y + 65), "• One question per tool call", fill=TEXT_GRAY)
        draw.text((center_x + 20, content_y + 85), "• Multiple-choice preferred", fill=TEXT_GRAY)
        draw.text((center_x + 20, content_y + 105), "• Max 2-3 questions per skill", fill=TEXT_GRAY)

        draw.text((center_x + 20, content_y + 140), "Context Loading:", fill=ACCENT_GREEN)
        draw.text((center_x + 20, content_y + 165), "• Read ALL prior documents first", fill=TEXT_WHITE)
        draw.text((center_x + 20, content_y + 185), "• Never re-ask known information", fill=TEXT_WHITE)
        draw.text((center_x + 20, content_y + 205), "• Extract team, budget, timeline", fill=TEXT_WHITE)

        draw.text((center_x + 20, content_y + 240), "Escape hatch: 'I don't know, you decide'", fill=TEXT_DIM)

    elif phase_idx == 4:  # Document Generation
        draw_rounded_rect(draw, center_x, content_y, center_x + 450, content_y + 300, 12, CARD_BG, CARD_BORDER, 1)
        draw.text((center_x + 20, content_y + 15), "Sequential Generation:", fill=ACCENT_PINK)

        docs = [
            ("1-business-plan.md", ACCENT_CYAN),
            ("2-project-plan.md", ACCENT_GREEN),
            ("3-user-personas.md", ACCENT_PURPLE),
            ("5-technical-spec.md", ACCENT_ORANGE),
            ("7-system-architecture.md", ACCENT_PINK),
            ("9-api-design.md", ACCENT_CYAN),
            ("14-implementation-plan.md", ACCENT_GREEN),
            ("15-test-strategy.md", ACCENT_PURPLE),
            ("16-deployment-plan.md", ACCENT_ORANGE),
        ]

        for i, (doc, color) in enumerate(docs):
            x_pos = center_x + 20 + (i % 3) * 145
            y_pos = content_y + 50 + (i // 3) * 55
            draw_rounded_rect(draw, x_pos, y_pos, x_pos + 135, y_pos + 40, 6, color, color, 1)
            draw.text((x_pos + 8, y_pos + 12), doc[:18], fill=TEXT_WHITE)

    elif phase_idx == 5:  # Consistency
        draw_rounded_rect(draw, center_x, content_y, center_x + 450, content_y + 250, 12, CARD_BG, CARD_BORDER, 1)
        draw.text((center_x + 20, content_y + 15), "Cross-Document Checks:", fill=ACCENT_GREEN)

        checks = [
            "✓ Entity names match across docs",
            "✓ API endpoints have DB entities",
            "✓ Security covers all API surfaces",
            "✓ Test strategy references blueprints",
            "✓ Terminology consistent",
        ]

        for i, check in enumerate(checks):
            draw.text((center_x + 20, content_y + 50 + i * 30), check, fill=ACCENT_GREEN)

        draw.text((center_x + 20, content_y + 210), "Incremental: after each document", fill=TEXT_DIM)
        draw.text((center_x + 20, content_y + 230), "Final: complete pass before handoff", fill=TEXT_DIM)

    elif phase_idx == 6:  # Complete
        draw_rounded_rect(draw, center_x, content_y, center_x + 450, content_y + 300, 12, ACCENT_GREEN, ACCENT_GREEN, 2)
        draw.text((center_x + 20, content_y + 15), "✅ Blueprint Complete!", fill=TEXT_WHITE)

        draw.text((center_x + 20, content_y + 50), "Generated Documents:", fill=ACCENT_CYAN)
        draw.text((center_x + 20, content_y + 75), "• 9-12 documentation files", fill=TEXT_WHITE)
        draw.text((center_x + 20, content_y + 95), "• Master index (index.md)", fill=TEXT_WHITE)
        draw.text((center_x + 20, content_y + 115), "• Progress ledger", fill=TEXT_WHITE)

        draw.text((center_x + 20, content_y + 150), "Ready for:", fill=ACCENT_PURPLE)
        draw.text((center_x + 20, content_y + 175), "• AI coding agent to implement", fill=TEXT_WHITE)
        draw.text((center_x + 20, content_y + 195), "• Human developer to build", fill=TEXT_WHITE)
        draw.text((center_x + 20, content_y + 215), "• Team to review and approve", fill=TEXT_WHITE)

        draw.text((center_x + 20, content_y + 255), "22 Skills | 4 Agents | 14 Platforms", fill=TEXT_DIM)

    # ── Right panel: Skills & Agents ─────────────────────────────────────
    right_x = 770
    right_y = 100

    draw.text((right_x, right_y), "SKILLS LIBRARY", fill=TEXT_DIM)
    right_y += 25

    skill_categories = [
        ("Discovery", ["business-concept", "project-plan", "user-personas"], ACCENT_CYAN),
        ("Specification", ["technical-spec", "feasibility-study"], ACCENT_GREEN),
        ("Architecture", ["system-arch", "db-design", "api-design", "ADR"], ACCENT_PURPLE),
        ("Quality", ["security-threat", "test-strategy", "impl-plan"], ACCENT_ORANGE),
        ("Delivery", ["deploy-plan", "runbook", "DR-plan", "SLO"], ACCENT_PINK),
    ]

    for cat_name, skills, color in skill_categories:
        draw_rounded_rect(draw, right_x, right_y, right_x + 220, right_y + 30 + len(skills) * 22, 8, CARD_BG, color, 1)
        draw.text((right_x + 10, right_y + 8), cat_name, fill=color)
        for i, skill in enumerate(skills):
            draw.text((right_x + 20, right_y + 30 + i * 22), f"• {skill}", fill=TEXT_GRAY)
        right_y += 40 + len(skills) * 22

    # ── Bottom bar: Key features ─────────────────────────────────────────
    bottom_y = HEIGHT - 60
    draw.line([(40, bottom_y), (WIDTH - 40, bottom_y)], fill=CARD_BORDER, width=1)

    features = [
        ("🎯 Context Loading", "Never re-ask known info"),
        ("💬 Tool Calls", "Not inline questions"),
        ("✅ Quality Gates", "Per-document verification"),
        ("📊 Progress Ledger", "Survives compaction"),
        ("🔄 Consistency", "Cross-document checks"),
    ]

    for i, (title, desc) in enumerate(features):
        x_pos = 40 + i * 240
        draw.text((x_pos, bottom_y + 15), title, fill=ACCENT_CYAN)
        draw.text((x_pos, bottom_y + 35), desc, fill=TEXT_DIM)

    return img


def generate_gif():
    """Generate the animated GIF."""
    frames = []

    # Generate frames for each phase
    for phase_idx in range(len(PHASES)):
        phase = PHASES[phase_idx]
        num_frames = phase["duration"] * FPS

        for frame_num in range(num_frames):
            # Add smooth transition effect
            sub_step = frame_num / num_frames
            frame = create_frame(phase_idx, sub_step)
            frames.append(frame)

    # Add a few extra frames at the end showing the complete state
    for _ in range(FPS * 2):  # 2 seconds of complete state
        frames.append(create_frame(len(PHASES) - 1))

    # Save as GIF
    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), OUTPUT_FILE)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Convert to P mode for GIF
    frames_p = []
    for frame in frames:
        frames_p.append(frame.convert('P', palette=Image.ADAPTIVE, colors=128))

    frames_p[0].save(
        output_path,
        save_all=True,
        append_images=frames_p[1:],
        duration=1000 // FPS,
        loop=0,
        optimize=True
    )

    file_size = os.path.getsize(output_path)
    print(f"✅ GIF saved to: {output_path}")
    print(f"   Size: {file_size / 1024:.1f} KB ({file_size / (1024*1024):.2f} MB)")
    print(f"   Frames: {len(frames)}")
    print(f"   Dimensions: {WIDTH}x{HEIGHT}")
    print(f"   Duration: {len(frames) / FPS:.1f} seconds")


if __name__ == "__main__":
    generate_gif()
