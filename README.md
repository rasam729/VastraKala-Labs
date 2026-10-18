# VastraKala Labs (VastraShastra)
### *The Science & Soul of Indian Couture*

[![React 19](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite 8](https://img.shields.io/badge/Vite-8.3-646cff?logo=vite)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r174-black?logo=three.js)](https://threejs.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-orange?logo=google)](https://ai.google.dev/)

---

## 🌟 Overview

**VastraKala Labs** is an intelligent, immersive digital design school and AI atelier engineered to preserve, teach, and modernize India's living textile heritage and haute couture traditions. 

Blending classical Indian draping mechanics with cutting-edge artificial intelligence, 3D computer graphics, and rigorous pattern mathematics, VastraKala Labs transforms passive video watching into active, hands-on atelier practice.

From calculating exact armhole depths and dart intakes to synthesizing photorealistic garments from rough sketches and testing 3D digital twins across continuous skin tone spectrums, VastraKala Labs equips the next generation of designers with both technical precision and cultural reverence.

---

## ✨ Key Features & Architecture

### 1. Unified AI Experimentation Studio (`/ai-studio`)
A single four-quadrant laboratory for creative exploration and design computation:
- **Sketch & Design Studio**:
  - Interactive grid canvas with draw, erase, undo, and clear controls.
  - User sketch upload & analysis via Google Gemini Vision.
  - Multi-attribute style nuances (sleeve, collar, hemline, fabric, and color customization).
  - High-resolution dress synthesis with instant PNG export.
- **Colour Theory & Skin Testing Lab**:
  - 2D contrast harmony workbench evaluating garments against 8 canonical Indian skin tones.
  - Real-time WCAG contrast ratio (CR) and undertone compatibility scoring.
- **Technical Dieline Studio**:
  - Image-to-CAD pattern drafting pipeline.
  - Gemini Vision automatically classifies garments (kurti, anarkali, blouse, pants, lehenga) and generates production-ready vector SVG cutting blueprints.
  - Dynamic measurement blanks for quarter bust, waist dart, armhole depth, and seam allowances.
- **3D Model Testing Environment**:
  - Three.js white studio environment with orbit navigation and shadow mapping.
  - Anatomical SMPL human body mannequin.
  - Continuous **0–100% skin-tone spectrum scrollbar** (Porcelain White to Dark Ebony) with live hexadecimal readout and custom colour picker.
  - Multi-layer garment visualization with independent X/Y/Z position, rotation, and scale manipulation.
  - Zero-shot **3D Mesh Generation** using HuggingFace TRELLIS Gradio Space bridged through Cloudinary.

---

### 2. Diagnostic Placement & Tailoring-Stitch Learning Path (`/progress`)
- **6 Diagnostic Placement Variants**:
  - Randomized placement tests assessing 6 core disciplines: *Fashion History, Living Weaves, Pattern Mathematics, Colour Science, Garment Construction, and Sustainability*.
  - Objective-weighted tier assignment: **Foundation**, **Intermediate**, or **Advanced**.
- **Wavy Tailoring-Stitch Learning Path**:
  - An SVG-rendered game-level track featuring a dashed tailor's chalk / needle-and-thread stitch line.
  - Milestones with direct embedded YouTube masterclasses and curated museum/research documents.
- **Continuous Progress Checkpoints**:
  - Tests strategically interspersed between learning modules:
    - *Mode 01*: Prompt-to-Dress Challenge
    - *Mode 02*: Skin Tone Harmony Checkpoint
    - *Mode 03*: Reverse Pattern Engineering Exam
    - *Mode 04*: Indo-Western Blend & Fusion Challenge
    - *Mode 05*: 10-Question Speed Recognition Sprint
    - *Mode 06*: Comprehensive 3-Stage Capstone Jury Case Study

---

### 3. Core Indian Fashion Curriculum
Comprehensive syllabus spanning 6 foundational courses (30 studio units):
1. **History of Indian Costumes**: Vedic antiquity, Mughal courtly attire (Jama, Angrakha), colonial exchange, and modern runway revival.
2. **Traditional Indian Textiles**: Fibre-to-yarn science, Banarasi, Kanjeevaram Korvai, Chanderi, Ikat resist, and Ajrakh block printing.
3. **Surface Ornamentation**: Zardozi metallic relief, Lucknowi Chikankari shadow work, Punjabi Phulkari, and Rajasthani Gota Patti.
4. **Ethnic Pattern Making**: Body measurement ratios, kurta blocks, Katori blouse drafting, and sherwani tailoring.
5. **Advanced Saree Draping**: Yardage mechanics, Nivi pleat architecture, Nauvari, and fusion silhouette draping.
6. **Craft Cluster & Sustainability**: Field documentation ethics, artisan attribution, fair-trade standards, and circular fashion systems.

---

### 4. Stitch — Resident AI Master Atelier Mentor
- Floating companion featuring the custom atelier avatar (`Cat.png`).
- Powered by **Google Gemini 1.5 Flash**.
- Context-aware: dynamically updates tips and conversation prompts based on the student's active screen and actions.
- Answers questions on mathematical drafting formulas, historical textile origins, skin undertones, and tool assistance.
- Resilient offline fallback knowledge base ensuring uninterrupted learning even without active network keys.

---

### 5. Authentication & Multi-User State
- **Sign In / Sign Up Modal**: Built-in modal gating placement tests and saving progress.
- **Zero-State Guarantee**: New learners start with clean progress (0% complete, fresh learning path).
- **Dual Persistence Architecture**: Supabase Auth and Database integration with automatic LocalStorage fallback for seamless offline resilience.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Core Framework** | React 19, TypeScript 5.7, Vite 8 |
| **Styling** | Tailwind CSS v4, `@tailwindcss/vite`, Custom Serif & Sans typography |
| **3D Graphics** | Three.js (r174), OrbitControls, GLTFLoader |
| **Artificial Intelligence** | Google Gemini 1.5 Flash (`@google/generative-ai`), TRELLIS 3D API |
| **Media & Assets** | Cloudinary Upload API, Custom SVG CAD generator |
| **Database & Auth** | Supabase (`@supabase/supabase-js`), LocalStorage / IndexedDB |
| **Icons & UI** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [pnpm](https://pnpm.io/) or `npm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rasam729/VastraKala-Labs.git
   cd VastraKala-Labs
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   VITE_GEMINI_API_KEY=<your-gemini-api-key>
   VITE_HF_API_KEY=<your-huggingface-token>
   VITE_CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   VITE_CLOUDINARY_UPLOAD_PRESET=<your-upload-preset>
   ```

4. **Launch the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🗄️ Database Setup (Optional Cloud Sync)

To enable multi-device cloud synchronization on Supabase, run this in the Supabase SQL Editor:

```sql
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  placement_done boolean default false,
  placement_score integer default 0,
  placement_level text default 'foundation',
  learning_path jsonb default '[]'::jsonb,
  streak_days integer default 0,
  completed_modules jsonb default '[]'::jsonb,
  quiz_history jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.user_profiles enable row level security;

create policy "Users can manage own profile"
  on public.user_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

---

## 🏛️ Credits & Acknowledgements

Developed for **Craft N Code Karnataka 2026** by:
- **Mantradi Sameeksha Rao** (Team Leader) — *R. V. College of Engineering (CSE AIML)*
- **Mantradi Prateeksha Rao** — *R. N. S. Institute of Technology*
- **Sanjana H V** — *R. V. College of Engineering (CSE AIML)*

Special thanks to the artisans, weavers, and craft custodians across India whose generational wisdom inspires every line of code in this project.