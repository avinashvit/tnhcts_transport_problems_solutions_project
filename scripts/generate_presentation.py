import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_slide_layout = prs.slide_layouts[6]

    # Color Palette Definitions
    COLOR_NAVY = RGBColor(15, 23, 42)       # #0f172a
    COLOR_BLUE = RGBColor(37, 99, 235)      # #2563eb
    COLOR_LIGHT_BG = RGBColor(248, 250, 252) # #f8fafc
    COLOR_WHITE = RGBColor(255, 255, 255)
    COLOR_TEXT_DARK = RGBColor(30, 41, 59)  # #1e293b
    COLOR_TEXT_MUTED = RGBColor(100, 116, 139) # #64748b
    COLOR_GREEN = RGBColor(22, 163, 74)     # #16a34a
    COLOR_RED = RGBColor(220, 38, 38)       # #dc2626
    COLOR_BORDER = RGBColor(203, 213, 225)  # #cbd5e1
    COLOR_CARD_BG = RGBColor(255, 255, 255)
    COLOR_ACCENT_BG = RGBColor(239, 246, 255) # #eff6ff

    def add_header(slide, title_text, category_text, slide_num):
        # Header background bar
        hdr_box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.1))
        hdr_box.fill.solid()
        hdr_box.fill.fore_color.rgb = COLOR_NAVY
        hdr_box.line.color.rgb = COLOR_NAVY

        # Accent bottom line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.08), Inches(13.333), Inches(0.04))
        line.fill.solid()
        line.fill.fore_color.rgb = COLOR_BLUE
        line.line.color.rgb = COLOR_BLUE

        # Category pill
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.18), Inches(3.2), Inches(0.28))
        pill.fill.solid()
        pill.fill.fore_color.rgb = COLOR_BLUE
        pill.line.fill.background()
        tf_pill = pill.text_frame
        tf_pill.word_wrap = True
        p_pill = tf_pill.paragraphs[0]
        p_pill.text = category_text.upper()
        p_pill.font.size = Pt(9.5)
        p_pill.font.bold = True
        p_pill.font.color.rgb = COLOR_WHITE
        p_pill.alignment = PP_ALIGN.CENTER

        # Title text
        txBox = slide.shapes.add_textbox(Inches(0.8), Inches(0.48), Inches(10.5), Inches(0.55))
        tf = txBox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = COLOR_WHITE

        # Slide Number
        numBox = slide.shapes.add_textbox(Inches(11.5), Inches(0.35), Inches(1.2), Inches(0.4))
        tf_num = numBox.text_frame
        p_num = tf_num.paragraphs[0]
        p_num.text = f"{slide_num:02d} / 20"
        p_num.font.size = Pt(13)
        p_num.font.bold = True
        p_num.font.color.rgb = COLOR_BORDER
        p_num.alignment = PP_ALIGN.RIGHT

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_LIGHT_BG
        bg.line.fill.background()
        return bg

    # ==================== SLIDE 1: TITLE SLIDE ====================
    slide1 = prs.slides.add_slide(blank_slide_layout)
    bg1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = COLOR_NAVY
    bg1.line.fill.background()

    # Decorative top bar
    bar1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.15))
    bar1.fill.solid()
    bar1.fill.fore_color.rgb = COLOR_BLUE
    bar1.line.fill.background()

    # Title Box
    t_box = slide1.shapes.add_textbox(Inches(1.0), Inches(1.2), Inches(11.333), Inches(2.2))
    tf1 = t_box.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "TAMIL NADU SCHOOL TRANSPORT DECISION SUPPORT PROTOTYPE"
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_BLUE

    p1 = tf1.add_paragraph()
    p1.text = "SchoolRoute TN"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_WHITE
    p1.space_before = Pt(8)

    p2 = tf1.add_paragraph()
    p2.text = "Smart Digital Transit & Attendance Safety Monitoring System for Government School Commuters"
    p2.font.size = Pt(20)
    p2.font.color.rgb = RGBColor(226, 232, 240)
    p2.space_before = Pt(10)

    # 4 Key Badges Banner
    badges = [
        ("G.O. Ms. No. 42 COMPLIANT", COLOR_BLUE),
        ("ZERO-PHONE ARCHITECTURE", COLOR_GREEN),
        ("MoRTH AIS-140 PANIC HARDWARE", COLOR_RED),
        ("LIVE CELLULAR GSM SMS DISPATCH", RGBColor(147, 51, 234))
    ]
    badge_w = Inches(2.65)
    badge_start_x = Inches(1.0)
    for i, (b_text, b_color) in enumerate(badges):
        b_shape = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, badge_start_x + i * (badge_w + Inches(0.24)), Inches(3.7), badge_w, Inches(0.48))
        b_shape.fill.solid()
        b_shape.fill.fore_color.rgb = b_color
        b_shape.line.fill.background()
        tf_b = b_shape.text_frame
        tf_b.word_wrap = True
        pb = tf_b.paragraphs[0]
        pb.text = b_text
        pb.font.size = Pt(10)
        pb.font.bold = True
        pb.font.color.rgb = COLOR_WHITE
        pb.alignment = PP_ALIGN.CENTER

    # Project metadata cards
    m_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(4.5), Inches(11.333), Inches(2.3))
    m_card.fill.solid()
    m_card.fill.fore_color.rgb = RGBColor(30, 41, 59)
    m_card.line.color.rgb = RGBColor(51, 65, 85)
    tf_m = m_card.text_frame
    tf_m.word_wrap = True

    pm1 = tf_m.paragraphs[0]
    pm1.text = "ACADEMIC & INNOVATION CREDENTIALS"
    pm1.font.size = Pt(12)
    pm1.font.bold = True
    pm1.font.color.rgb = COLOR_BLUE

    pm2 = tf_m.add_paragraph()
    pm2.text = "Institution: Vellore Institute of Technology (VIT), Vellore\nCourse: Innovative Projects (PHY1901) • Fall Semester 2026-2027\nPrincipal Investigator: Avinash M. (23BCE1042) | Team Members: Kavya S., Praveen Kumar R., Naveen Chandran T., Sanjay Vignesh K.\nProject Faculty Guide: Prof. Dr. S. K. Meenakshi Sundaram (SCOPE, VIT)"
    pm2.font.size = Pt(13)
    pm2.font.color.rgb = COLOR_WHITE
    pm2.space_before = Pt(8)

    # ==================== SLIDE 2: PROBLEM STATEMENT ====================
    slide2 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide2)
    add_header(slide2, "Problem Statement: Rural Government School Transit Crisis", "Societal Context & Challenges", 2)

    # 3 Column Cards
    col_w = Inches(3.6)
    gap = Inches(0.26)
    start_x = Inches(0.8)
    card_y = Inches(1.4)
    card_h = Inches(5.6)

    cards_data_s2 = [
        ("1. The Rural Transit Bottleneck", COLOR_RED, [
            "Overcrowded State Buses: Millions of rural students travel under TN G.O. Ms. No. 42 (100% Free Bus Concession), but peak-hour buses are dangerously packed.",
            "Skipped Intermediate Halts: State drivers under schedule pressure frequently bypass village stops, leaving rural children stranded on state highways.",
            "Footboard Hazards: Severe overcrowding forces young students to travel standing on bus footboards, leading to tragic falls and severe injuries."
        ]),
        ("2. The Zero-Visibility Black Box", COLOR_BLUE, [
            "Anxiety of Working Parents: Rural parents working as daily-wage laborers or in agricultural fields have zero communication once their child leaves home.",
            "No Boarding or Dropped Confirmation: Parents cannot verify if their child boarded the morning bus or safely entered the school gate.",
            "Late School Arrivals & Penalties: Bypassed buses cause repeated late arrivals, leading to missed prayer bells, disciplinary action, and missed exams."
        ]),
        ("3. Severe Educational Fallout", RGBColor(217, 119, 6), [
            "Surging Rural Dropout Rates: Long, unsafe, and unreliable commutes are the primary driver of student dropouts after 8th and 10th standards in rural districts.",
            "Gender Disparity for Girls: Parents often pull daughters out of secondary school due to harassment risks, unmonitored stops, and isolated rural walking routes.",
            "Unheard Grievances: Students and village panchayats have no structured channel to escalate bus shortages to District Transport Officers (DTO)."
        ])
    ]

    for i, (ctitle, ccolor, bullets) in enumerate(cards_data_s2):
        bx = start_x + i * (col_w + gap)
        card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, bx, card_y, col_w, card_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD_BG
        card.line.color.rgb = ccolor
        card.line.width = Pt(2)
        tf_c = card.text_frame
        tf_c.word_wrap = True

        p_ct = tf_c.paragraphs[0]
        p_ct.text = ctitle
        p_ct.font.size = Pt(14)
        p_ct.font.bold = True
        p_ct.font.color.rgb = ccolor

        for b in bullets:
            pb = tf_c.add_paragraph()
            pb.text = "• " + b
            pb.font.size = Pt(11)
            pb.font.color.rgb = COLOR_TEXT_DARK
            pb.space_before = Pt(10)

    # ==================== SLIDE 3: THE DIGITAL DIVIDE PARADOX ====================
    slide3 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide3)
    add_header(slide3, "The Core Dilemma: The Digital Divide Paradox", "Why Conventional Solutions Fail", 3)

    # 2 Comparison Columns
    w_comp = Inches(5.6)
    left_x = Inches(0.8)
    right_x = Inches(6.933)

    # Left: Private School Apps (Why they fail in public schools)
    c_priv = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_x, Inches(1.4), w_comp, Inches(5.6))
    c_priv.fill.solid()
    c_priv.fill.fore_color.rgb = RGBColor(254, 242, 242)
    c_priv.line.color.rgb = COLOR_RED
    c_priv.line.width = Pt(2)
    tf_pr = c_priv.text_frame
    tf_pr.word_wrap = True

    p = tf_pr.paragraphs[0]
    p.text = "❌ Conventional Private School Apps"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_RED

    priv_points = [
        "Mandatory Smartphone Dependency: Demands each student carry an expensive 4G/5G smartphone with active cellular data plans.",
        "Mobile App Friction: Requires downloading bulky iOS/Android apps, creating parent accounts, and navigating complex interfaces.",
        "Cost-Prohibitive Proprietary Hardware: Relies on expensive RFID smart gates, turnstiles, and GPS vehicle kiosks costing lakhs per bus.",
        "School Regulatory Violations: Direct violation of Tamil Nadu Government School policy which strictly prohibits student smartphones on campus.",
        "Excludes Underprivileged Families: Completely abandons families who only possess basic 2G feature phones or keypad handsets."
    ]
    for pt in priv_points:
        pb = tf_pr.add_paragraph()
        pb.text = "• " + pt
        pb.font.size = Pt(11.5)
        pb.font.color.rgb = COLOR_TEXT_DARK
        pb.space_before = Pt(12)

    # Right: The SchoolRoute TN Paradigm Shift
    c_pub = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x, Inches(1.4), w_comp, Inches(5.6))
    c_pub.fill.solid()
    c_pub.fill.fore_color.rgb = RGBColor(240, 253, 244)
    c_pub.line.color.rgb = COLOR_GREEN
    c_pub.line.width = Pt(2)
    tf_pub = c_pub.text_frame
    tf_pub.word_wrap = True

    p = tf_pub.paragraphs[0]
    p.text = "✅ SchoolRoute TN: Zero-Phone Commute"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = COLOR_GREEN

    pub_points = [
        "Zero-Phone Architecture: The student commuter carries ONLY a durable, laminated paper/cardstock QR pass costing under ₹2.",
        "Zero Battery & Zero Network Requirement for Child: Operates flawlessly without requiring the student to have battery, screen, or SIM card.",
        "Sub-Second Camera Scanning (jsQR): Bus driver or conductor scans the pass with an ordinary Android device within milliseconds.",
        "Universal Cellular GSM SMS Alerts: Cloud serverless proxy dispatches automated SMS alerts directly to basic keypad phones without mobile data.",
        "Statutory Compliance: Fully aligned with Tamil Nadu G.O. Ms. No. 42 (Free Student Concessions) and national MoRTH AIS-140 safety standards."
    ]
    for pt in pub_points:
        pb = tf_pub.add_paragraph()
        pb.text = "• " + pt
        pb.font.size = Pt(11.5)
        pb.font.color.rgb = COLOR_TEXT_DARK
        pb.space_before = Pt(12)

    # ==================== SLIDE 4: PROPOSED SOLUTIONS ====================
    slide4 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide4)
    add_header(slide4, "Proposed Engineering Solutions: 6 Architectural Pillars", "Technical & Operational Blueprint", 4)

    # 6 Grid Cards (2 rows x 3 columns)
    grid_w = Inches(3.6)
    grid_h = Inches(2.65)
    gx_gap = Inches(0.26)
    gy_gap = Inches(0.2)
    gx_start = Inches(0.8)
    gy_start = Inches(1.4)

    pillars = [
        ("Pillar 1: Laminated QR Pass", COLOR_BLUE, "Tamper-resistant 2D QR matrix card encoding student EMIS ID, assigned bus, and parent phone; printable on standard paper."),
        ("Pillar 2: jsQR Video Stream", COLOR_GREEN, "Continuous in-browser camera scanner on driver's mobile; sub-second boarding validation with non-blocking animation frames."),
        ("Pillar 3: Cellular SMS Dispatch", RGBColor(147, 51, 234), "Automated SMSMobileAPI / Fast2SMS gateway via Vercel serverless proxy; sends instant texts to basic 2G feature phones."),
        ("Pillar 4: MoRTH AIS-140 SOS", COLOR_RED, "Wall-mounted tactile panic button simulator inside the bus triggering alarms to Police 112, TNSTC Depot, and driver cabin."),
        ("Pillar 5: Cohort Segregation", RGBColor(217, 119, 6), "Arrival algorithm partitioning students into 'Safely Arrived at Gate' vs. 'Bus Missed' cohorts with targeted dual SMS alerts."),
        ("Pillar 6: GIS Admin Radar", COLOR_NAVY, "District Transport Officer (DTO) console with Leaflet.js live bus radar, student roster management, and official Secretariat petitions.")
    ]

    for idx, (p_title, p_color, p_desc) in enumerate(pillars):
        row = idx // 3
        col = idx % 3
        px = gx_start + col * (grid_w + gx_gap)
        py = gy_start + row * (grid_h + gy_gap)

        card = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, px, py, grid_w, grid_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD_BG
        card.line.color.rgb = p_color
        card.line.width = Pt(1.5)
        tf = card.text_frame
        tf.word_wrap = True

        pt = tf.paragraphs[0]
        pt.text = p_title
        pt.font.size = Pt(13)
        pt.font.bold = True
        pt.font.color.rgb = p_color

        pd = tf.add_paragraph()
        pd.text = p_desc
        pd.font.size = Pt(10.5)
        pd.font.color.rgb = COLOR_TEXT_DARK
        pd.space_before = Pt(8)

    # ==================== SLIDE 5: SYSTEM ARCHITECTURE & WORKFLOW ====================
    slide5 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide5)
    add_header(slide5, "System Operational Lifecycle & Flowchart", "End-to-End Operational Sequence", 5)

    # 5 Horizontal Lifecycle Steps
    step_w = Inches(2.15)
    step_h = Inches(5.5)
    step_gap = Inches(0.24)
    step_start_x = Inches(0.8)
    step_y = Inches(1.4)

    steps = [
        ("Step 1: Boarding & Scan", COLOR_BLUE, [
            "Bus halts at designated village stop (e.g. Morappur).",
            "Student presents laminated QR pass at bus entry step.",
            "Driver camera captures QR in <150ms using jsQR engine.",
            "Web Audio API plays cheerful two-tone verification chime."
        ]),
        ("Step 2: Instant SMS Alert", COLOR_GREEN, [
            "Payload sent to Vercel Serverless Function.",
            "Bypasses CORS restrictions via cloud proxy.",
            "Dispatches cellular GSM SMS to parent: 'Student boarded Bus 14A'.",
            "Parent receives SMS on standard keypad feature phone."
        ]),
        ("Step 3: GIS Live Telemetry", RGBColor(147, 51, 234), [
            "Driver console broadcasts live GPS coordinates and speed.",
            "Parent opens live Leaflet.js radar map to view bus marker.",
            "Stop-by-stop visual progress timeline updates in real time.",
            "Distance countdown and dynamic ETA calculated live."
        ]),
        ("Step 4: AIS-140 SOS Safety", COLOR_RED, [
            "If hazard occurs (rash driving, route deviation, harassment):",
            "Student presses wall-mounted tactile red panic button.",
            "Driver cabin receives flashing red emergency siren.",
            "Emergency telemetry routed to Police 112 & TNSTC Depot."
        ]),
        ("Step 5: School Arrival", RGBColor(217, 119, 6), [
            "Bus reaches Government Higher Secondary School gate.",
            "Driver taps 'Mark Arrived at School Gate'.",
            "Classification engine splits students into 2 cohorts:",
            "Boarded: Safe Campus Arrival SMS.",
            "Unboarded: Urgent 'BUS MISSED' SMS."
        ])
    ]

    for i, (stitle, scolor, sbullets) in enumerate(steps):
        sx = step_start_x + i * (step_w + step_gap)
        scard = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, step_y, step_w, step_h)
        scard.fill.solid()
        scard.fill.fore_color.rgb = COLOR_CARD_BG
        scard.line.color.rgb = scolor
        scard.line.width = Pt(2)
        tf = scard.text_frame
        tf.word_wrap = True

        st = tf.paragraphs[0]
        st.text = stitle
        st.font.size = Pt(12)
        st.font.bold = True
        st.font.color.rgb = scolor

        for sb in sbullets:
            sp = tf.add_paragraph()
            sp.text = "• " + sb
            sp.font.size = Pt(10)
            sp.font.color.rgb = COLOR_TEXT_DARK
            sp.space_before = Pt(8)

    # ==================== SLIDES 6 to 17: SCREENSHOT WALKTHROUGH ====================
    screenshots_meta = [
        {
            "screen_num": 1,
            "slide_num": 6,
            "title": "Screen 1: Centralized Role-Based Authentication Gateway",
            "category": "Website Output • Access Control",
            "img_file": "01_login_portal.png",
            "role": "Multi-Role Portal: Student, Parent, Driver Crew & Depot Officer",
            "highlights": [
                "Role-Specific Switcher: Clean Neo-Brutalist toggle between Student Commuter, Bus Driver / Crew, and Depot Transport Officer (Admin).",
                "Commuter Identification: Students authenticate via unique EMIS ID (e.g. STU-101) or parent registered mobile (+91 73059 40480) with secure PIN.",
                "TNSTC Crew Verification: Driver login validates crew registration against the depot roster and synchronizes assigned feeder bus schedules.",
                "District Transport Officer Oversight: High-security administrative master login reserved for the DTO for statewide fleet command."
            ],
            "govt_impact": "Ensures privacy and prevents unauthorized access, while allowing rural students with only an EMIS number to view their transit pass and parent alerts.",
            "tech_note": "Built with React session persistence in localStorage under schoolroute_tn_active_role_clean_v7."
        },
        {
            "screen_num": 2,
            "slide_num": 7,
            "title": "Screen 2: Parent Live GPS Satellite Fleet Tracker",
            "category": "Website Output • Student/Parent Portal",
            "img_file": "02_parent_live_tracker.png",
            "role": "Parent & Commuter Live Monitoring Dashboard",
            "highlights": [
                "Real-Time Progress & ETA: Displays exact kilometers remaining to the school gate with live estimated time of arrival updated as the bus moves.",
                "Telemetry KPI Cards: Live indicators for safe operating speed (e.g. 38 km/h), passenger crowd status, and assigned TNSTC depot.",
                "Stop-by-Stop Visual Progress: Dynamic timeline tracking completed halts (Morappur, Kadayampatti), active next stop, and destination school.",
                "Commuter Boarding Status: Live roster card confirming whether the student is currently 'Waiting at Stop' or verified 'On Board'."
            ],
            "govt_impact": "Working-class parents can verify bus approach and child boarding from any browser without calling the driver or leaving farm/factory jobs.",
            "tech_note": "Powered by ParentLiveTracker.jsx and reactive LiveDatabaseContext synchronization."
        },
        {
            "screen_num": 3,
            "slide_num": 8,
            "title": "Screen 3: MoRTH AIS-140 Physical Panic SOS Simulator",
            "category": "Website Output • Safety Hardware Interface",
            "img_file": "03_ais140_panic_modal.png",
            "role": "On-Bus Wall-Mounted Stanchion Emergency Telemetry",
            "highlights": [
                "Physical Wall-Mounted Button Simulation: Simulates tactile red push-buttons mounted on interior stanchions adjacent to Seat #4 and emergency exit.",
                "4 Emergency Incident Categories: Instant classification: (1) Rash Driving, (2) Route Deviation, (3) Vehicle Breakdown, (4) In-Transit Harassment.",
                "Statutory MoRTH AIS-140 Targets: Direct satellite emergency broadcast to Police Control Room (Dial 112 / ERSS) and TNSTC Depot Command.",
                "Cabin Flashing Siren & Safe Pull-Over: Triggers an intense visual and audio alarm on the driver dashboard, mandating immediate roadside halt."
            ],
            "govt_impact": "Protects students who do not carry phones; gives rural girls and young children an immediate voice if safety or driving standards are compromised.",
            "tech_note": "Executes studentReportIrregularBehavior() in LiveDatabaseContext.jsx; triggers Web Audio siren chime."
        },
        {
            "screen_num": 4,
            "slide_num": 9,
            "title": "Screen 4: Statutory Digital Smart Bus Pass (G.O. Ms. No. 42)",
            "category": "Website Output • Zero-Phone Smart ID",
            "img_file": "04_student_bus_pass.png",
            "role": "Printable Physical Concessional Commuter Pass",
            "highlights": [
                "Reed-Solomon 2D QR Matrix: Embeds tamper-resistant encrypted payload (EMIS ID, student name, route, pickup stop, parent phone).",
                "Zero-Phone Commuter Card: Formatted for standard paper/cardstock printing and plastic lamination; 100% zero battery or phone needed by child.",
                "Statutory Scheme Compliance: Officially adheres to Tamil Nadu Government Order G.O. Ms. No. 42 (100% Free Travel Concession Scheme).",
                "Live Trip Status Badge: Embedded status chip dynamically reflects 'Waiting at Stop', 'On Board', or 'Safely Arrived at School Gate'."
            ],
            "govt_impact": "Eliminates daily arguments between conductors and rural students over ticket concessions; provides a durable, waterproof ID for every child.",
            "tech_note": "Engineered in StudentBusPass.jsx using the qrcode NPM package with Error Correction Level M."
        },
        {
            "screen_num": 5,
            "slide_num": 10,
            "title": "Screen 5: Interactive GIS Feeder Route Map",
            "category": "Website Output • Geospatial Corridor Radar",
            "img_file": "05_live_bus_map.png",
            "role": "Leaflet.js OpenStreetMap Live Fleet Tracker",
            "highlights": [
                "Dynamic Pulsing Bus Marker: Live GPS marker displaying vehicle position along the state highway corridor with route orientation.",
                "Feeder Village Stop Geocoding: Color-coded stop pins indicating completed stops (green), current stop (blue), and destination school (red).",
                "Smooth Route Polyline: High-contrast path overlay mapping the exact legal route traveled by the TNSTC school feeder bus.",
                "Interactive Halts & Popups: Clicking any marker reveals pickup timings, distance milestones, student count, and driver emergency contacts."
            ],
            "govt_impact": "Brings geospatial transparency to rural transit, allowing parents and headmasters to see exactly where the feeder bus is on the highway.",
            "tech_note": "Implemented in LiveBusMap.jsx with OpenStreetMap tile layer and custom Leaflet SVG div-icons."
        },
        {
            "screen_num": 6,
            "slide_num": 11,
            "title": "Screen 6: Feeder Bus Timetable & Corridor Schedule",
            "category": "Website Output • Public Commuter Timings",
            "img_file": "06_bus_timetable.png",
            "role": "Rural Feeder Corridor Schedule Explorer",
            "highlights": [
                "Dual-Shift Transit Schedules: Morning School Pickup runs (07:30 AM – 08:30 AM) and Evening Outbound Return runs (04:15 PM – 05:15 PM).",
                "Punctuality & Synchronization: Highlights synchronized connections preventing students from missing morning prayer bells or board exams.",
                "Multi-Route Coverage: Instant switching between Route 14A (Morappur – Dharmapuri), Route 7B (Kadayampatti), and Route 21 (Pennagaram).",
                "1-Click Satellite Sync: Dedicated action button to immediately track any timetable route directly on the live geospatial map."
            ],
            "govt_impact": "Provides rural families reliable departure schedules, preventing children from standing by desolate highway shoulders for hours.",
            "tech_note": "Engineered in BusTimetable.jsx with static corridor timetable and reactive live vehicle status."
        },
        {
            "screen_num": 7,
            "slide_num": 12,
            "title": "Screen 7: Driver Cabin Telemetry & Boarding Console",
            "category": "Website Output • Crew Operations Workspace",
            "img_file": "07_driver_console.png",
            "role": "Dedicated Mobile/Tablet Console for TNSTC Driver & Conductor",
            "highlights": [
                "One-Touch Tactile Trip Controls: Large buttons designed for one-handed operation: 'Start Feeder Trip', 'Advance Next Stop', 'Arrived at School Gate'.",
                "Speed & Crowd Telemetry Sliders: Driver updates operating speed (km/h) and passenger crowd level (Normal / Packed / Overcrowded) in real time.",
                "Highway Delay Broadcast: Pre-configured delay triggers (Railway Gate Closed, Heavy Congestion, Mechanical Repair) updating parent map.",
                "Interactive Boarding Roster: Commuter list with 1-click manual boarding toggle for students whose physical cards are temporarily misplaced."
            ],
            "govt_impact": "Empowers state bus drivers with an ultra-simple interface that requires minimal training and works reliably even on bumpy rural roads.",
            "tech_note": "Built in DriverConsole.jsx; state updates broadcast instantaneously via LiveDatabaseContext.jsx."
        },
        {
            "screen_num": 8,
            "slide_num": 13,
            "title": "Screen 8: In-Browser jsQR Real-Time Camera Scanner",
            "category": "Website Output • High-Speed Attendance Engine",
            "img_file": "08_driver_qr_scanner_modal.png",
            "role": "Ultra-Low-Latency Web Video Stream Pass Scanner",
            "highlights": [
                "Continuous Video Frame Loop: Uses requestAnimationFrame(scanVideoLoop) unconditionally on every frame; unrecognized codes never freeze the stream.",
                "Sub-Second Boarding Verification: Instantly extracts student payload, marks commuter 'On Board', and triggers parent cellular SMS.",
                "Frame Throttling & 2-Second Debounce: Prevents rapid duplicate scans and multiple telecom SMS charges using React useRef timestamp locks.",
                "Manual EMIS ID Fallback: Includes instant text entry for student numbers if pass is torn, laminated surface is smudged, or camera is dirty."
            ],
            "govt_impact": "Enables 50+ students to board within 2-3 minutes at crowded village stops without holding up highway traffic.",
            "tech_note": "Implemented in DriverConsole.jsx with pure JavaScript jsQR library and Web Audio API two-tone chime."
        },
        {
            "screen_num": 9,
            "slide_num": 14,
            "title": "Screen 9: School Arrival Classification & Real-Time Push SMS Banner",
            "category": "Website Output • Automated Arrival Intelligence",
            "img_file": "09_school_arrival_and_sms_banner.png",
            "role": "Destination Classification & Cellular SMS Dispatch Pipeline",
            "highlights": [
                "Real-Time Sliding SMS Banner: Visual banner simulating cellular SMS delivery to parent mobile (+91 73059 40480) via Vercel serverless proxy.",
                "Boarded Commuters Safe Arrival SMS: Green badge & SMS: 'Bus 14A safely reached School Gate. Your ward Prem has entered campus.'",
                "Unboarded Commuters 'Bus Missed' Alert: Absent students receive urgent red alert: 'Bus 14A reached School Gate. Ward was NOT boarded (BUS MISSED).'",
                "Late Board Override: Allows driver to retroactively mark a student as late-boarded if picked up en route, correcting attendance records immediately."
            ],
            "govt_impact": "Completely eliminates false security: parents know immediately if their child missed the bus, enabling swift family intervention.",
            "tech_note": "Engineered in driverArriveAtSchool() in LiveDatabaseContext.jsx; dispatches via /api/smsmobile.js."
        },
        {
            "screen_num": 10,
            "slide_num": 15,
            "title": "Screen 10: Central Admin Fleet Command Desk & Student Enrollment",
            "category": "Website Output • Administrative Management",
            "img_file": "10_admin_console_students.png",
            "role": "District Transport Officer (DTO) Statewide Command Console",
            "highlights": [
                "4 At-A-Glance Metric Cards: Tracks Registered Students (5), Active On-Board Count, Total Feeder Buses (1), and Open Grievances.",
                "New Student Registration Engine: Administrative modal to enroll rural commuters with auto-generated EMIS IDs, pickup stops, and phone numbers.",
                "Multi-Parameter Search & Filter: Instant search by student name, EMIS registration number, feeder stop, or destination government school.",
                "Roster Record Control: Full administrative authority to update contact details, reassign feeder buses, or print replacement passes."
            ],
            "govt_impact": "Provides district education officers and transport authorities accurate student commuter rosters for budgeting free bus passes.",
            "tech_note": "Implemented in AdminConsole.jsx; synchronization triggers live state updates across all connected roles."
        },
        {
            "screen_num": 11,
            "slide_num": 16,
            "title": "Screen 11: Admin Driver Duty Allocation & Standby Roster",
            "category": "Website Output • Depot Crew Management",
            "img_file": "11_admin_driver_assignments.png",
            "role": "TNSTC Depot Crew Roster & Reserve Management",
            "highlights": [
                "Route-To-Driver Duty Allocation: Assigns certified state drivers to specific school feeder routes (e.g. assigning Driver 1 to Bus 14A).",
                "Standby Certified Driver Pool: Maintains standby reserve drivers ready for instant emergency dispatch during crew illness or vehicle issues.",
                "Live Cabin Session Synchronization: Reassigning a driver immediately updates the active driver cabin console without requiring manual re-login.",
                "Driver Safety Profile Verification: Tracks driver years of experience, official heavy-vehicle license numbers, and lifetime route safety ratings."
            ],
            "govt_impact": "Ensures no rural school route is left unserved due to sudden driver absence; guarantees qualified, vetted drivers on student routes.",
            "tech_note": "Engineered in assignDriverToBus() in LiveDatabaseContext.jsx with cross-session broadcasting."
        },
        {
            "screen_num": 12,
            "slide_num": 17,
            "title": "Screen 12: Admin Grievance Redressal Desk & Secretariat Petitions",
            "category": "Website Output • Administrative Compliance",
            "img_file": "12_admin_grievances_desk.png",
            "role": "Public Grievance Redressal & Official Secretariat Petition Desk",
            "highlights": [
                "Public Bottleneck Ingestion: Ingests student and panchayat grievances regarding bypassed stops, footboard overcrowding, and timing mismatches.",
                "Status Progression Lifecycle: Tracks grievance workflow from 'Reported' ➔ 'Under Dept Review' ➔ 'Resolved (Action Taken)'.",
                "Official Secretariat Petition Generator: Generates formal Tamil Nadu Secretariat administrative petitions formatted for the Principal Secretary.",
                "SMS Audit Log Inspection: Inspects historical cellular SMS dispatch logs confirming parent telecom message delivery timestamps."
            ],
            "govt_impact": "Converts everyday student suffering into binding legal and administrative petitions for additional buses and new bus stops.",
            "tech_note": "Implemented in AdminConsole.jsx and OfficialPetitionModal.jsx; produces clean printable petition formats."
        }
    ]

    base_img_path = r"c:\Users\avina\Desktop\Innovative Projects\screenshots"

    for sm in screenshots_meta:
        slide = prs.slides.add_slide(blank_slide_layout)
        set_slide_background(slide)
        add_header(slide, sm["title"], sm["category"], sm["slide_num"])

        # Layout: Left side screenshot (width: 7.2 inches), Right side description card (width: 4.3 inches)
        img_x = Inches(0.8)
        img_y = Inches(1.35)
        img_w = Inches(7.4)
        img_h = Inches(5.7)

        # Draw frame around image
        frame = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, img_x, img_y, img_w, img_h)
        frame.fill.solid()
        frame.fill.fore_color.rgb = COLOR_NAVY
        frame.line.color.rgb = COLOR_BLUE
        frame.line.width = Pt(2)

        img_path = os.path.join(base_img_path, sm["img_file"])
        if os.path.exists(img_path):
            slide.shapes.add_picture(img_path, img_x + Inches(0.08), img_y + Inches(0.08), width=img_w - Inches(0.16), height=img_h - Inches(0.16))

        # Right Card: Description & Engineering
        card_x = Inches(8.45)
        card_y = Inches(1.35)
        card_w = Inches(4.1)
        card_h = Inches(5.7)

        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, card_x, card_y, card_w, card_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD_BG
        card.line.color.rgb = COLOR_BORDER
        card.line.width = Pt(1.5)
        tf = card.text_frame
        tf.word_wrap = True

        # Header role
        p_role = tf.paragraphs[0]
        p_role.text = sm["role"]
        p_role.font.size = Pt(11)
        p_role.font.bold = True
        p_role.font.color.rgb = COLOR_BLUE

        # Key Features title
        p_ft = tf.add_paragraph()
        p_ft.text = "KEY OPERATIONAL CAPABILITIES:"
        p_ft.font.size = Pt(10)
        p_ft.font.bold = True
        p_ft.font.color.rgb = COLOR_NAVY
        p_ft.space_before = Pt(8)

        for h in sm["highlights"]:
            ph = tf.add_paragraph()
            ph.text = "• " + h
            ph.font.size = Pt(9.5)
            ph.font.color.rgb = COLOR_TEXT_DARK
            ph.space_before = Pt(5)

        # Govt School Impact Box
        p_gi = tf.add_paragraph()
        p_gi.text = "GOVERNMENT SCHOOL STUDENT IMPACT:"
        p_gi.font.size = Pt(10)
        p_gi.font.bold = True
        p_gi.font.color.rgb = COLOR_GREEN
        p_gi.space_before = Pt(10)

        p_gt = tf.add_paragraph()
        p_gt.text = sm["govt_impact"]
        p_gt.font.size = Pt(9.5)
        p_gt.font.color.rgb = COLOR_TEXT_DARK
        p_gt.space_before = Pt(3)

        # Technical Pill
        p_tp = tf.add_paragraph()
        p_tp.text = "Tech: " + sm["tech_note"]
        p_tp.font.size = Pt(8.5)
        p_tp.font.italic = True
        p_tp.font.color.rgb = COLOR_TEXT_MUTED
        p_tp.space_before = Pt(8)

    # ==================== SLIDE 18: HOW IT HELPS GOVT SCHOOL STUDENTS ====================
    slide18 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide18)
    add_header(slide18, "How SchoolRoute TN Empowers Government School Students", "Targeted Solutions for Underprivileged Commuters", 18)

    # 4 Thematic Cards (2x2 Grid)
    cw18 = Inches(5.6)
    ch18 = Inches(2.7)
    gx18_start = Inches(0.8)
    gx18_gap = Inches(0.533)
    gy18_start = Inches(1.4)
    gy18_gap = Inches(0.2)

    empowerment_cards = [
        ("1. Eliminating the 'No Smartphone' Barrier", COLOR_BLUE, [
            "Students carry only a laminated physical QR pass costing under ₹2; fully compatible with strict government school mobile bans.",
            "Requires ZERO battery, ZERO screen, and ZERO internet data pack from the child.",
            "Conductor camera scans the card on the bus step in under 150 milliseconds without slowing boarding."
        ]),
        ("2. Eradicating Parental Anxiety with 2G SMS", COLOR_GREEN, [
            "Sends direct cellular GSM SMS notifications to parents' basic keypad feature phones via SMSMobileAPI.",
            "Daily-wage and agricultural laborer parents working in fields receive instant texts when their child boards the bus.",
            "Automatic Safe School Gate arrival confirmation ensures parents know their child is safe inside campus."
        ]),
        ("3. Eliminating Bus Misses & Halts Bypassed", RGBColor(217, 119, 6), [
            "Driver console requires drivers to log stops, preventing drivers from bypassing crowded intermediate village halts.",
            "Automated 'BUS MISSED' SMS immediately alerts parents if a child was left behind at the stop, preventing missing-child panic.",
            "District Transport Officer radar tracks vehicle punctuality against official TNSTC schedules."
        ]),
        ("4. AIS-140 Physical Panic SOS Safety for Girls", COLOR_RED, [
            "Physical wall-mounted tactile red push buttons allow students without phones to trigger instant emergency alarms.",
            "Immediate alert sent to Police ERSS 112, TNSTC Depot, and driver cabin siren in cases of harassment or rash driving.",
            "Instills immense confidence in rural parents, directly curbing female dropout rates after 8th and 10th standard."
        ])
    ]

    for idx, (etitle, ecolor, ebullets) in enumerate(empowerment_cards):
        r = idx // 2
        c = idx % 2
        ex = gx18_start + c * (cw18 + gx18_gap)
        ey = gy18_start + r * (ch18 + gy18_gap)

        ecard = slide18.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ex, ey, cw18, ch18)
        ecard.fill.solid()
        ecard.fill.fore_color.rgb = COLOR_CARD_BG
        ecard.line.color.rgb = ecolor
        ecard.line.width = Pt(2)
        tf = ecard.text_frame
        tf.word_wrap = True

        pt = tf.paragraphs[0]
        pt.text = etitle
        pt.font.size = Pt(13.5)
        pt.font.bold = True
        pt.font.color.rgb = ecolor

        for eb in ebullets:
            pe = tf.add_paragraph()
            pe.text = "• " + eb
            pe.font.size = Pt(10.5)
            pe.font.color.rgb = COLOR_TEXT_DARK
            pe.space_before = Pt(6)

    # ==================== SLIDE 19: SOCIETAL IMPACT & MEASURABLE OUTCOMES ====================
    slide19 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide19)
    add_header(slide19, "Measurable Societal Impact & Educational Equity", "Quantitative & Qualitative Transformation", 19)

    # 4 Metric Highlights on Top + Detailed Transformation Table on Bottom
    metrics_data = [
        ("100%", "ZERO-PHONE COMPLIANCE", "Zero smartphones or data packs required from students", COLOR_BLUE),
        ("< 150 ms", "BOARDING LATENCY", "Sub-second camera scanning prevents bus route delays", COLOR_GREEN),
        ("100%", "2G SMS DELIVERY", "Direct GSM cellular texts to basic parent keypad phones", RGBColor(147, 51, 234)),
        ("0 ₹", "STUDENT COST BARRIER", "Free concessional travel preserved under G.O. Ms. No. 42", COLOR_RED)
    ]

    mw = Inches(2.7)
    mh = Inches(1.5)
    mgap = Inches(0.18)
    m_start_x = Inches(0.8)

    for i, (mval, mlabel, msub, mcol) in enumerate(metrics_data):
        mx = m_start_x + i * (mw + mgap)
        mcard = slide19.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, mx, Inches(1.35), mw, mh)
        mcard.fill.solid()
        mcard.fill.fore_color.rgb = COLOR_CARD_BG
        mcard.line.color.rgb = mcol
        mcard.line.width = Pt(2)
        tf_m = mcard.text_frame
        tf_m.word_wrap = True

        pv = tf_m.paragraphs[0]
        pv.text = mval
        pv.font.size = Pt(22)
        pv.font.bold = True
        pv.font.color.rgb = mcol
        pv.alignment = PP_ALIGN.CENTER

        pl = tf_m.add_paragraph()
        pl.text = mlabel
        pl.font.size = Pt(9.5)
        pl.font.bold = True
        pl.font.color.rgb = COLOR_NAVY
        pl.alignment = PP_ALIGN.CENTER

        ps = tf_m.add_paragraph()
        ps.text = msub
        ps.font.size = Pt(8.5)
        ps.font.color.rgb = COLOR_TEXT_MUTED
        ps.alignment = PP_ALIGN.CENTER

    # Transformation Summary Card below
    t_box = slide19.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(3.05), Inches(11.733), Inches(4.0))
    t_box.fill.solid()
    t_box.fill.fore_color.rgb = COLOR_CARD_BG
    t_box.line.color.rgb = COLOR_BORDER
    t_box.line.width = Pt(1.5)
    tf_tb = t_box.text_frame
    tf_tb.word_wrap = True

    ptb = tf_tb.paragraphs[0]
    ptb.text = "KEY SYSTEM TRANSFORMATION SUMMARY FOR TAMIL NADU GOVERNMENT SCHOOLS"
    ptb.font.size = Pt(13)
    ptb.font.bold = True
    ptb.font.color.rgb = COLOR_NAVY

    trans_points = [
        "Curbing Rural Dropout Rates: Eliminates transit uncertainty as a cause of school abandonment, particularly for adolescent girls traveling from remote hamlets.",
        "Dignity for Concessional Commuters: Replaces contentious paper inspections with seamless 2D QR validation, upholding the dignity of underprivileged students.",
        "Accountability for Public Transport: DTO administrative radar prevents bus drivers from skipping village halts and provides live data on route crowding.",
        "Institutional Bridge to Secretariat: The Official Petition Generator transforms student complaints into formal government petitions submitted directly to the Education Secretary for fleet augmentation.",
        "Zero Recurring Burden: Free for students and schools; utilizes standard open-source web technologies (React, Leaflet, jsQR) and low-cost Vercel serverless execution."
    ]

    for tp in trans_points:
        pt = tf_tb.add_paragraph()
        pt.text = "✔ " + tp
        pt.font.size = Pt(11)
        pt.font.color.rgb = COLOR_TEXT_DARK
        pt.space_before = Pt(8)

    # ==================== SLIDE 20: CONCLUSION & FUTURE ROADMAP ====================
    slide20 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(slide20)
    add_header(slide20, "Conclusion & Future Technological Roadmap", "Summary & Next Steps", 20)

    # Left: Conclusion Summary Card
    c_left = slide20.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(5.7), Inches(5.6))
    c_left.fill.solid()
    c_left.fill.fore_color.rgb = RGBColor(240, 253, 244)
    c_left.line.color.rgb = COLOR_GREEN
    c_left.line.width = Pt(2)
    tf_l = c_left.text_frame
    tf_l.word_wrap = True

    pl = tf_l.paragraphs[0]
    pl.text = "🏁 Project Conclusion"
    pl.font.size = Pt(16)
    pl.font.bold = True
    pl.font.color.rgb = COLOR_GREEN

    concl_points = [
        "Demonstrated Viability: Proves that enterprise-grade transit tracking, student safety, and real-time parent notifications can be delivered without requiring smartphones from underprivileged students.",
        "Seamless Hardware-Software Integration: Successfully bridges laminated paper QR tokens, mobile camera computer vision (jsQR), cellular DLT SMS gateways, and MoRTH AIS-140 panic hardware.",
        "Full Policy Alignment: Conforms to Tamil Nadu Government Order G.O. Ms. No. 42 (100% Free Concessional Travel) and national ITS vehicle safety standards.",
        "Ready for Deployment: Deployed and tested live on Vercel with real cellular GSM phone verification (+91 73059 40480), robust audio sirens, and reactive multi-role synchronization."
    ]
    for cp in concl_points:
        p = tf_l.add_paragraph()
        p.text = "• " + cp
        p.font.size = Pt(11.5)
        p.font.color.rgb = COLOR_TEXT_DARK
        p.space_before = Pt(12)

    # Right: Future Roadmap Card
    c_right = slide20.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.6))
    c_right.fill.solid()
    c_right.fill.fore_color.rgb = COLOR_ACCENT_BG
    c_right.line.color.rgb = COLOR_BLUE
    c_right.line.width = Pt(2)
    tf_r = c_right.text_frame
    tf_r.word_wrap = True

    pr = tf_r.paragraphs[0]
    pr.text = "🚀 Future Technological Roadmap"
    pr.font.size = Pt(16)
    pr.font.bold = True
    pr.font.color.rgb = COLOR_BLUE

    road_points = [
        "Physical ESP32 / CAN-Bus Prototype: Build an embedded ESP32 microcontroller with a physical illuminated red stanchion push button interfacing directly into the bus CAN-bus OBD-II telemetry unit.",
        "Automated Tamil Voice Audio Announcements: Integrate cabin-mounted speaker units providing automated bilingual (Tamil & English) audio announcements as the bus approaches village halts.",
        "Predictive AI Corridor Demand Models: Implement machine-learning forecasting to anticipate feeder corridor overcrowding based on seasonal agricultural cycles, monsoon rains, and board exam timetables.",
        "Solar-Powered Village Stop Beacons: Deploy low-cost solar electronic ink arrival countdown boards at major rural feeder junctions to show approaching bus ETA to waiting students."
    ]
    for rp in road_points:
        p = tf_r.add_paragraph()
        p.text = "• " + rp
        p.font.size = Pt(11.5)
        p.font.color.rgb = COLOR_TEXT_DARK
        p.space_before = Pt(12)

    output_filename = "SchoolRoute_TN_Presentation.pptx"
    prs.save(output_filename)
    print(f"Successfully generated PowerPoint presentation: {output_filename}")

if __name__ == "__main__":
    create_presentation()
