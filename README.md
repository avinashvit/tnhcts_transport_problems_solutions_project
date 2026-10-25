# SchoolRoute TN — Tamil Nadu School Transport Decision Support Prototype

A clean, responsive, role-based prototype website to identify and resolve transportation bottlenecks faced by Tamil Nadu government school students.

---

## 🏛️ Role-Based Architecture

The application is structured into two dedicated portals:

### 1. 🎓 Student & School Commuter Portal (`Student Login`)
- **Report a Problem**: Simple, validated form to report public transit deficits, bus shortages, long walking distances, unsafe roads, or timing mismatches affecting rural and semi-urban government schools.
- **Track Reported Issues**: Read-only status tracker enabling students, parents, and village representatives to track whether an issue is *Reported*, *In Progress*, or *Resolved*, and view official department remarks.
- **Privacy by Design**: Strictly avoids collecting individual student names, phone numbers, or personal identifying information.

### 2. 🏛️ Government Official & Administrator Portal (`Admin Login`)
- **Dashboard**:
  - Exactly 4 summary metrics: *Reported Problems, Affected Students, High-Priority Issues, Resolved Issues*.
  - Interactive Leaflet OpenStreetMap showing feeder villages, destination schools, and connected transit corridors.
  - Short list of the 3 most urgent transport bottlenecks requiring immediate attention.
- **Transport Issues (Seeing the Reports)**:
  - Tabular register of all incoming school transport grievances.
  - Search by school, village, or district; filter by status or category.
  - Status update modal allowing officials to review full details, update status (*Reported ➔ In Progress ➔ Resolved*), and append official department notes.
- **Recommended Solutions (Giving Solutions)**:
  - Rule-based decision-support engine providing practical solutions (fleet augmentation, closer stop evaluation, peak-hour shuttles, road safety inspections, timetable synchronization).
  - Explicit *Why Generated* rationale explaining the commuter thresholds and trigger conditions.
  - Required on-site verification checklists before administrative execution.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm**

### 2. Running Locally
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The application will be accessible at **`http://localhost:5173/`**.

---

## 🔄 Quick Role Switching
For smooth evaluation and demonstration:
- Use the **"Switch to Admin" / "Switch to Student"** button in the header or sidebar to instantly switch between the Student intake view and the Admin resolution view.
