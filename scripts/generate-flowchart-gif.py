#!/usr/bin/env python3
"""
Generate an animated GIF of the engineering-docs workflow flowchart.
Shows each step appearing sequentially with smooth animations.
"""

import math
from PIL import Image, ImageDraw, ImageFont
import imageio
import os

# ── Configuration ────────────────────────────────────────────────────────────
WIDTH = 1200
HEIGHT = 200
FPS = 15
NUM_COLORS = 128
OUTPUT_FILE = "assets/workflow-animation.gif"

# Colors
BG_COLOR = (255, 255, 255)
NODE_COLOR = (6, 182, 212)  # Cyan
NODE_BORDER = (8, 145, 178)
TEXT_COLOR = (255, 255, 255)
ARROW_COLOR = (100, 100, 100)
HIGHLIGHT_COLOR = (34, 197, 94)  # Green for active node
DIAMOND_COLOR = (251, 191, 36)  # Yellow for diamond

# Node definitions
NODES = [
    {"id": "A", "text": "Your Idea", "x": 50, "y": 80, "w": 90, "h": 40, "shape": "rect"},
    {"id": "B", "text": "Orchestrator", "x": 180, "y": 80, "w": 100, "h": 40, "shape": "rect"},
    {"id": "C", "text": "Interview", "x": 320, "y": 80, "w": 80, "h": 40, "shape": "diamond"},
    {"id": "D", "text": "Business\nConcept", "x": 440, "y": 80, "w": 90, "h": 40, "shape": "rect"},
    {"id": "E", "text": "Project\nPlan", "x": 570, "y": 80, "w": 80, "h": 40, "shape": "rect"},
    {"id": "F", "text": "Technical\nSpec", "x": 690, "y": 80, "w": 80, "h": 40, "shape": "rect"},
    {"id": "G", "text": "System\nArchitecture", "x": 810, "y": 80, "w": 100, "h": 40, "shape": "rect"},
    {"id": "H", "text": "API\nDesign", "x": 950, "y": 80, "w": 80, "h": 40, "shape": "rect"},
    {"id": "I", "text": "Implementation\nPlan", "x": 1070, "y": 80, "w": 110, "h": 40, "shape": "rect"},
]

NODES2 = [
    {"id": "J", "text": "Test\nStrategy", "x": 50, "y": 160, "w": 80, "h": 40, "shape": "rect"},
    {"id": "K", "text": "Deployment\nPlan", "x": 180, "y": 160, "w": 100, "h": 40, "shape": "rect"},
    {"id": "L", "text": "Master\nIndex", "x": 320, "y": 160, "w": 80, "h": 40, "shape": "rect"},
]

# Arrows connecting nodes
ARROWS = [
    ("A", "B"), ("B", "C"), ("C", "D"), ("D", "E"), ("E", "F"),
    ("F", "G"), ("G", "H"), ("H", "I"), ("I", "J"), ("J", "K"), ("K", "L")
]

# Arrow from I (bottom) to J (top)
ARROW_I_TO_J = {"from": "I", "to": "J", "type": "down"}


def get_node_by_id(node_id):
    """Find node by ID in either row."""
    for n in NODES + NODES2:
        if n["id"] == node_id:
            return n
    return None


def draw_rounded_rect(draw, x1, y1, x2, y2, radius, fill, outline, width=2):
    """Draw a rounded rectangle."""
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill, outline=outline, width=width)


def draw_diamond(draw, cx, cy, w, h, fill, outline, width=2):
    """Draw a diamond shape."""
    points = [
        (cx, cy - h // 2),  # top
        (cx + w // 2, cy),  # right
        (cx, cy + h // 2),  # bottom
        (cx - w // 2, cy),  # left
    ]
    draw.polygon(points, fill=fill, outline=outline, width=width)


def draw_arrow(draw, x1, y1, x2, y2, color, width=2):
    """Draw an arrow from (x1,y1) to (x2,y2)."""
    draw.line([(x1, y1), (x2, y2)], fill=color, width=width)
    # Arrowhead
    angle = math.atan2(y2 - y1, x2 - x1)
    arrow_len = 10
    arrow_angle = math.pi / 6
    ax1 = x2 - arrow_len * math.cos(angle - arrow_angle)
    ay1 = y2 - arrow_len * math.sin(angle - arrow_angle)
    ax2 = x2 - arrow_len * math.cos(angle + arrow_angle)
    ay2 = y2 - arrow_len * math.sin(angle + arrow_angle)
    draw.polygon([(x2, y2), (ax1, ay1), (ax2, ay2)], fill=color)


def draw_node(draw, node, active=False, alpha=1.0):
    """Draw a single node."""
    x, y, w, h = node["x"], node["y"], node["w"], node["h"]
    fill = HIGHLIGHT_COLOR if active else NODE_COLOR
    if node["shape"] == "diamond":
        draw_diamond(draw, x, y, w, h, fill, NODE_BORDER, width=3)
    else:
        draw_rounded_rect(draw, x - w // 2, y - h // 2, x + w // 2, y + h // 2,
                         radius=8, fill=fill, outline=NODE_BORDER, width=3)

    # Draw text
    lines = node["text"].split("\n")
    total_height = len(lines) * 16
    start_y = y - total_height // 2
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line)
        tw = bbox[2] - bbox[0]
        draw.text((x - tw // 2, start_y + i * 16), line, fill=TEXT_COLOR)


def draw_connection(draw, from_node, to_node, color=ARROW_COLOR, width=2):
    """Draw arrow between two nodes."""
    x1 = from_node["x"] + from_node["w"] // 2
    y1 = from_node["y"]
    x2 = to_node["x"] - to_node["w"] // 2
    y2 = to_node["y"]
    draw_arrow(draw, x1, y1, x2, y2, color, width)


def draw_down_arrow(draw, from_node, to_node, color=ARROW_COLOR, width=2):
    """Draw arrow going down from bottom of from_node to top of to_node."""
    x1 = from_node["x"]
    y1 = from_node["y"] + from_node["h"] // 2
    x2 = to_node["x"]
    y2 = to_node["y"] - to_node["h"] // 2
    # Draw with a curve
    draw.line([(x1, y1), (x1, y1 + 20)], fill=color, width=width)
    draw.line([(x1, y1 + 20), (x2, y2 - 20)], fill=color, width=width)
    draw.line([(x2, y2 - 20), (x2, y2)], fill=color, width=width)
    draw_arrow(draw, x2, y2 - 20, x2, y2, color, width)


def create_frame(visible_nodes, active_node=None, highlight_arrows=None):
    """Create a single frame of the animation."""
    img = Image.new('RGB', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Draw title
    draw.text((WIDTH // 2 - 100, 10), "Engineering Docs Workflow", fill=(50, 50, 50))

    # Draw all visible arrows first (behind nodes)
    if highlight_arrows:
        for from_id, to_id in highlight_arrows:
            from_node = get_node_by_id(from_id)
            to_node = get_node_by_id(to_id)
            if from_node and to_node:
                if from_id == "I" and to_id == "J":
                    draw_down_arrow(draw, from_node, to_node, HIGHLIGHT_COLOR, 3)
                else:
                    draw_connection(draw, from_node, to_node, HIGHLIGHT_COLOR, 3)

    # Draw all visible nodes
    for node in NODES + NODES2:
        if node["id"] in visible_nodes:
            is_active = node["id"] == active_node
            draw_node(draw, node, active=is_active)

    return img


def generate_gif():
    """Generate the animated GIF."""
    all_node_ids = [n["id"] for n in NODES + NODES2]
    frames = []

    # Frame 1: Empty
    frames.append(create_frame([]))

    # Frames: Show each node sequentially
    visible = []
    for i, node_id in enumerate(all_node_ids):
        visible.append(node_id)

        # Highlight arrow to this node
        highlight = []
        if i > 0:
            prev_id = all_node_ids[i - 1]
            highlight.append((prev_id, node_id))

        # Show node appearing (3 frames for smooth animation)
        for _ in range(3):
            frames.append(create_frame(visible, active_node=node_id, highlight_arrows=highlight))

        # Show node settled (2 frames)
        frames.append(create_frame(visible))

    # Final frame: All nodes visible, no highlights
    frames.append(create_frame(all_node_ids))
    frames.append(create_frame(all_node_ids))
    frames.append(create_frame(all_node_ids))

    # Save as GIF
    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), OUTPUT_FILE)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Convert to RGB and save
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=1000 // FPS,
        loop=0,
        optimize=True
    )

    print(f"✅ GIF saved to: {output_path}")
    print(f"   Size: {os.path.getsize(output_path) / 1024:.1f} KB")
    print(f"   Frames: {len(frames)}")
    print(f"   Dimensions: {WIDTH}x{HEIGHT}")


if __name__ == "__main__":
    generate_gif()
