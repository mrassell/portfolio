import matplotlib.pyplot as plt
import os

def main():
    weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10"]
    attendance = [8, 6, 7, 5, 18, 15, 17, 14, 16, 20]

    plt.figure(figsize=(10, 6))
    plt.plot(weeks, attendance, marker="o", linewidth=2, markersize=8)
    plt.title("Attendance Across Weeks 1-10", fontsize=14, fontweight='bold')
    plt.xlabel("Week", fontsize=12)
    plt.ylabel("Number of Attendees", fontsize=12)
    plt.grid(True, linestyle="--", linewidth=0.5, alpha=0.7)
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()

    output_dir = "public/artifacts"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "cs_workshop_attendance.png")
    plt.savefig(output_path)
    plt.close()

    print(f"Saved attendance chart to {output_path}")

if __name__ == "__main__":
    main()
