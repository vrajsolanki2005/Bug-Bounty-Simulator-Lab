import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch
import numpy as np

# Create figure and axis
fig, ax = plt.subplots(1, 1, figsize=(14, 10))
ax.set_xlim(0, 10)
ax.set_ylim(0, 12)
ax.axis('off')

# Define colors
primary_color = '#2563eb'
secondary_color = '#7c3aed'
accent_color = '#059669'
danger_color = '#dc2626'

# Helper function to create rounded rectangles
def create_box(ax, x, y, width, height, text, color, text_color='white'):
    box = FancyBboxPatch((x, y), width, height,
                         boxstyle="round,pad=0.1",
                         facecolor=color,
                         edgecolor='white',
                         linewidth=2)
    ax.add_patch(box)
    ax.text(x + width/2, y + height/2, text,
            ha='center', va='center',
            fontsize=10, fontweight='bold',
            color=text_color, wrap=True)

# Helper function to draw arrows
def draw_arrow(ax, start_x, start_y, end_x, end_y, color='white'):
    ax.annotate('', xy=(end_x, end_y), xytext=(start_x, start_y),
                arrowprops=dict(arrowstyle='->', color=color, lw=2))

# Title
ax.text(5, 11.5, 'Bug Bounty Simulator Lab - Workflow', 
        ha='center', va='center', fontsize=16, fontweight='bold', color='white')

# Landing Page
create_box(ax, 4, 10, 2, 0.8, 'Landing Page\n(index.html)', primary_color)

# Authentication
create_box(ax, 1.5, 8.5, 1.8, 0.8, 'Registration\n/register', secondary_color)
create_box(ax, 6.7, 8.5, 1.8, 0.8, 'Login\n/login', secondary_color)

# Dashboard
create_box(ax, 4, 7, 2, 0.8, 'Dashboard\n(12 Labs)', accent_color)

# Lab Categories
create_box(ax, 0.5, 5.5, 1.5, 0.8, 'XSS Labs\n(Stored/Reflected)', danger_color)
create_box(ax, 2.5, 5.5, 1.5, 0.8, 'SQL Injection\nLabs', danger_color)
create_box(ax, 4.5, 5.5, 1.5, 0.8, 'CSRF\nLabs', danger_color)
create_box(ax, 6.5, 5.5, 1.5, 0.8, 'XXE/LFI\nLabs', danger_color)
create_box(ax, 8, 5.5, 1.5, 0.8, 'Advanced\nLabs', danger_color)

# VulnShop
create_box(ax, 4, 4, 2, 0.8, 'VulnShop\n(Practice Environment)', primary_color)

# AI Assistant
create_box(ax, 0.5, 2.5, 2, 0.8, 'AI Assistant\n(Mohanlal)', accent_color)

# Flag System
create_box(ax, 4, 2.5, 2, 0.8, 'Flag Submission\n& Scoring', secondary_color)

# Leaderboard
create_box(ax, 7.5, 2.5, 2, 0.8, 'Leaderboard\n& Progress', accent_color)

# Profile Management
create_box(ax, 1.5, 1, 1.8, 0.8, 'Profile\nManagement', primary_color)
create_box(ax, 6.7, 1, 1.8, 0.8, 'Admin Panel\n(Optional)', danger_color)

# Draw arrows
# Landing to Auth
draw_arrow(ax, 4.5, 10, 2.4, 9.3)
draw_arrow(ax, 5.5, 10, 7.6, 9.3)

# Auth to Dashboard
draw_arrow(ax, 2.4, 8.5, 4.5, 7.8)
draw_arrow(ax, 7.6, 8.5, 5.5, 7.8)

# Dashboard to Labs
draw_arrow(ax, 4.2, 7, 1.2, 6.3)
draw_arrow(ax, 4.5, 7, 3.2, 6.3)
draw_arrow(ax, 5, 7, 5.2, 6.3)
draw_arrow(ax, 5.5, 7, 7.2, 6.3)
draw_arrow(ax, 5.8, 7, 8.7, 6.3)

# Labs to VulnShop
draw_arrow(ax, 3.2, 5.5, 4.5, 4.8)
draw_arrow(ax, 5.2, 5.5, 5, 4.8)
draw_arrow(ax, 7.2, 5.5, 5.5, 4.8)

# VulnShop to Flag System
draw_arrow(ax, 5, 4, 5, 3.3)

# Flag System to Leaderboard
draw_arrow(ax, 6, 2.9, 7.5, 2.9)

# Dashboard to AI Assistant
draw_arrow(ax, 4, 7.4, 2.5, 3.3)

# Set background color
fig.patch.set_facecolor('#1e293b')
ax.set_facecolor('#1e293b')

# Add legend
legend_elements = [
    patches.Patch(color=primary_color, label='Core Pages'),
    patches.Patch(color=secondary_color, label='Authentication'),
    patches.Patch(color=accent_color, label='Features'),
    patches.Patch(color=danger_color, label='Vulnerability Labs')
]
ax.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(0.98, 0.98))

plt.tight_layout()
plt.savefig('workflow_diagram.png', dpi=300, bbox_inches='tight', 
            facecolor='#1e293b', edgecolor='none')
plt.show()

print("Workflow diagram saved as 'workflow_diagram.png'")