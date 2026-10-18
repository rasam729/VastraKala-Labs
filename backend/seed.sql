-- ════════════════════════════════════════════════════════════════
-- VASTRA SHASTRA · SUPABASE MASTER SEED DATA
-- Run this in your Supabase SQL Editor to populate all curriculum,
-- formulas, lessons, colour palettes, skin tones, resources, and badges.
-- ════════════════════════════════════════════════════════════════

-- 1. COURSES
INSERT INTO courses (id, number, title, short, description, accent_color, image_url, image_credit, style_theme, difficulty, weeks, capstone_project, sort_order)
VALUES
('history-indian-costumes', '01', 'History of Indian Costumes', 'Costume, culture & identity', 
 'Trace the evolution of regional attire, draping systems and royal vestments—from Vedic antiquity and Mughal courts to the modern Indian runway.',
 '#b65a36', 'https://images.unsplash.com/photo-1714248376481-f3e37e023ec8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200', 'The Cleveland Museum of Art', 'indian', 'intermediate', 6,
 'Create an annotated visual atlas connecting five historic silhouettes to a contemporary collection concept.', 1),

('traditional-indian-textiles', '02', 'Traditional Indian Textiles', 'Weaves, silks & natural colour',
 'Explore the materials, looms and indigenous dye systems behind Banarasi, Kanjeevaram, Chanderi, Ikat, Bandhani and Ajrakh.',
 '#315c73', 'https://images.unsplash.com/photo-1717585679395-bbe39b5fb6bc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200', 'Jainica Dhingra', 'indian', 'intermediate', 6,
 'Develop a six-swatch textile library with fibre, origin, process, care and contemporary application notes.', 2),

('surface-ornamentation', '03', 'Indian Surface Ornamentation', 'Embroidery & embellishment',
 'Master the stitch language and material logic of Zardozi, Chikankari, Phulkari, Kantha and Gota Patti through guided studio practice.',
 '#31624e', 'https://images.unsplash.com/photo-1791598638960-7931c1f83290?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200', 'Bernd Dittrich', 'indian', 'intermediate', 6,
 'Design and execute a 30 cm narrative sampler combining two regional techniques without diluting their identity.', 3),

('ethnic-pattern-making', '04', 'Ethnic Pattern Making & Construction', 'Draft, fit & construct',
 'Build technical drafting and tailoring fluency for kurtas, fitted saree blouses, cholis, lehengas and structured sherwanis.',
 '#754058', 'https://images.unsplash.com/photo-1791962831671-c869576205f0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200', 'atelierbyvineeth', 'indian', 'intermediate', 6,
 'Draft, toile and document one fitted blouse block with two sleeve variations and a professional specification sheet.', 4),

('saree-draping', '05', 'Advanced Saree & Unstitched Draping', 'Structure without seams',
 'Study the physics of unstitched yardage through the Nivi drape, regional variations and experimental contemporary forms.',
 '#984916', 'https://images.unsplash.com/photo-1662909540324-c8c358c42aa8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200', 'The Wandering Frame', 'indian', 'advanced', 6,
 'Create a contemporary zero-waste drape, then record a step-by-step dressing map and movement test.', 5),

('craft-sustainability', '06', 'Craft Cluster & Sustainability', 'Fieldwork, ethics & enterprise',
 'Document living craft knowledge with care, collaborate with artisan communities and translate field research into viable modern collections.',
 '#245d63', 'https://images.unsplash.com/photo-1640292343595-889db1c8262e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200', 'Akhil Pawar', 'indian', 'advanced', 6,
 'Build a craft partnership proposal balancing design innovation, artisan authorship, fair costing and environmental impact.', 6)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  accent_color = EXCLUDED.accent_color,
  image_url = EXCLUDED.image_url;

-- 2. COURSE SKILLS
INSERT INTO course_skills (course_id, skill, sort_order) VALUES
('history-indian-costumes', 'Read garments as cultural evidence', 1),
('history-indian-costumes', 'Identify period-specific silhouettes', 2),
('history-indian-costumes', 'Build a visual costume timeline', 3),

('traditional-indian-textiles', 'Recognise regional textile signatures', 1),
('traditional-indian-textiles', 'Compare loom structures', 2),
('traditional-indian-textiles', 'Specify responsible material choices', 3),

('surface-ornamentation', 'Select stitches for fabric weight', 1),
('surface-ornamentation', 'Control motif rhythm and density', 2),
('surface-ornamentation', 'Finish embellished surfaces cleanly', 3),

('ethnic-pattern-making', 'Draft from body measurements', 1),
('ethnic-pattern-making', 'Calculate ease precisely', 2),
('ethnic-pattern-making', 'Resolve fit through toile corrections', 3),

('saree-draping', 'Control fall, pleat and tension', 1),
('saree-draping', 'Adapt drapes to body and fabric', 2),
('saree-draping', 'Document a repeatable draping method', 3),

('craft-sustainability', 'Conduct respectful documentation', 1),
('craft-sustainability', 'Map social and material impact', 2),
('craft-sustainability', 'Cost craft-led products transparently', 3)
ON CONFLICT DO NOTHING;

-- 3. MODULES
INSERT INTO modules (id, number, title, subtitle, icon, color, lesson_count, style_theme) VALUES
('foundations-of-form', '01', 'Foundations of Form', 'Silhouette, line & shape', 'thread', 'coral', 6, 'general'),
('colour-composition', '02', 'Colour & Composition', 'Harmony, mood & contrast', 'swatch', 'gold', 8, 'general'),
('pattern-mathematics', '03', 'Pattern Mathematics', 'Measure, draft & calculate', 'ruler', 'blue', 10, 'general'),
('textile-traditions', '04', 'Textile Traditions', 'Fibres, weaves & living craft', 'spark', 'green', 12, 'indian')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- 4. MODULE LESSONS
INSERT INTO lessons (id, module_id, number, title, subtitle, duration_minutes, video_url, principle, formula_label, formula_value, formula_note, has_canvas_exercise, has_quiz, sort_order) VALUES
('00000000-0000-0000-0001-000000000001', 'foundations-of-form', 1, 'Fabric grain lines', 'Warp, weft, and bias physics', 14, 'https://www.youtube.com/watch?v=ixXKYSklJb8', 'The grain line governs drape, stability, and movement across the body.', 'GRAIN RATIO', 'Warp × Weft = Structural stability; 45° = Max bias stretch', 'Always draft parallel to selvedge unless designing fluid bias cuts.', true, true, 1),
('00000000-0000-0000-0001-000000000002', 'foundations-of-form', 2, 'Shrinkage mathematics', 'Fabric consumption allowances', 12, 'https://www.youtube.com/watch?v=8k0QT0IXJZE', 'Account for fibre behaviour before you commit shears to cloth.', 'PRE-WASH LENGTH', 'Cut length = Finished length × (1 + shrinkage %)', 'Cotton: 5-8%, Khadi: 8-10%, Raw Silk: 3%', false, true, 2),
('00000000-0000-0000-0001-000000000003', 'foundations-of-form', 3, 'Silk, cotton & georgette', 'Drape coefficients and weave mechanics', 18, 'https://www.youtube.com/watch?v=NUkI2_FWF-M', 'Weave weight dictates seam structure and dart placement.', 'DRAPE COEFFICIENT', 'D = (Area_draped / Area_flat) × 100', 'Lower D indicates fluid cling; higher D indicates crisp structural hold.', true, true, 3),

('00000000-0000-0000-0002-000000000001', 'colour-composition', 1, 'Colour wheel & harmony', 'Analogous, complementary and triadic logic', 15, 'https://www.youtube.com/watch?v=Qj1FK8n7WgY', 'Colour harmony is geometry projected onto optical perception.', 'COMPLEMENTARY HUE', 'H_comp = (H_base + 180°) mod 360°', 'High contrast creates energetic focal points in ethnic ensembles.', true, true, 1),
('00000000-0000-0000-0002-000000000002', 'colour-composition', 2, 'Skin tone & colour pairing', 'Undertones and luminance contrast ratio', 20, 'https://www.youtube.com/watch?v=L1CK9bE3H9s', 'A garment must illuminate its wearer, never overpower or wash them out.', 'CONTRAST RATIO (WCAG)', 'CR = (L1 + 0.05) / (L2 + 0.05)', 'CR > 3.0 gives healthy visual definition against wheatish and deep undertones.', true, true, 2),
('00000000-0000-0000-0002-000000000003', 'colour-composition', 3, 'Indian natural dye palettes', 'Madder, indigo, turmeric and iron rust', 16, 'https://www.youtube.com/watch?v=tnOXBa1EkYI', 'Indigenous mineral and vegetal dyes harmonize naturally because of earthy undertones.', 'TRITONE BALANCE', '60% Dominant ground : 30% Secondary field : 10% Zari / Accent', 'Traditional proportion for sarees, lehengas, and achkans.', true, true, 3),

('00000000-0000-0000-0003-000000000001', 'pattern-mathematics', 1, 'Bust and waist ratios', 'Drafting starting proportions', 16, 'https://www.youtube.com/watch?v=q4hR7cGVmAQ', 'Precision is a form of respect for the human form.', 'QUARTER BUST + EASE', 'Quarter Bust = (Bust / 4) + 2.5 cm ease', 'Standard starting point for fitted bodice before dart manipulation.', true, true, 1),
('00000000-0000-0000-0003-000000000002', 'pattern-mathematics', 2, 'Armhole depth formulas', 'Translating bust volume to arm movement', 18, 'https://www.youtube.com/watch?v=q4hR7cGVmAQ', 'An armhole cut too deep limits arm elevation; cut too shallow restricts blood flow.', 'ARMHOLE DEPTH', 'Armhole Depth = (Bust / 6) + 7 cm', 'Starting formula for Indian blouse blocks. Verify on body with plumb line.', true, true, 2),
('00000000-0000-0000-0003-000000000003', 'pattern-mathematics', 3, 'Salwar flare calculations', 'Gathering ease and kalidar geometry', 20, 'https://www.youtube.com/watch?v=0Fg0tFqmRFk', 'Volume in Indian draping is engineered through diagonal panel multiplication.', 'FLARE WIDTH', 'Panel Width = (Hip / 4 + 10 cm) × flare_factor', 'Flare factor: 1.0 (straight), 2.5 (Patiala pleats), 4.0 (royal Kalidar).', true, true, 3),
('00000000-0000-0000-0003-000000000004', 'pattern-mathematics', 4, 'Chudidar ease & taper', 'Zero-tolerance bias fit mechanics', 18, 'https://www.youtube.com/watch?v=0Fg0tFqmRFk', 'A true chudidar hugs the calf like second skin only when cut on true 45° bias.', 'BIAS TAPER', 'Calf Ease = 0 cm (bias gives mechanical stretch of 25%)', 'Churis (gathers) require adding 25 to 45 cm to finished leg inseam.', true, true, 4)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  formula_label = EXCLUDED.formula_label,
  formula_value = EXCLUDED.formula_value,
  principle = EXCLUDED.principle;

-- 5. MATHEMATICS FORMULA LIBRARY
INSERT INTO formulas (id, category, name, formula_latex, formula_plain, variables, inputs, output_label, typical_range, notes, garment_types, region) VALUES
('quarter-bust-ease', 'bodice', 'Quarter Bust + Ease', 'QB = \frac{B}{4} + 2.5', 'QB = Bust / 4 + 2.5 cm', '{"B": "Full bust circumference in cm"}', ARRAY['bust'], 'Quarter bust with ease (cm)', '23.5 - 31.0 cm', '2.5 cm = standard wearing ease for woven fabric.', ARRAY['blouse', 'kurta', 'anarkali', 'sherwani'], 'general'),
('armhole-depth', 'bodice', 'Armhole Depth', 'AD = \frac{B}{6} + 7', 'AD = Bust / 6 + 7 cm', '{"B": "Full bust circumference in cm"}', ARRAY['bust'], 'Armhole depth (cm)', '18.0 - 24.5 cm', 'Add 1 cm for structured fabrics or winter velvet.', ARRAY['blouse', 'kurta', 'anarkali', 'sherwani'], 'indian'),
('dart-allowance', 'bodice', 'Dart Allowance', 'D = \frac{B - W}{8}', 'D = (Bust - Waist) / 8', '{"B": "Bust in cm", "W": "Waist in cm"}', ARRAY['bust', 'waist'], 'Single dart intake (cm)', '1.5 - 3.8 cm', 'Calculates waist-to-bust contour intake per dart.', ARRAY['blouse', 'choli', 'western-bodice'], 'general'),
('princess-seam-intake', 'bodice', 'Princess Seam Intake', '\Delta_{waist} = \frac{B - W}{8}', 'Intake per seam = (Bust - Waist) / 8', '{"B": "Bust in cm", "W": "Waist in cm"}', ARRAY['bust', 'waist'], 'Intake per seam curve (cm)', '1.2 - 3.5 cm', 'Smooth S-curve contour along apex line.', ARRAY['blouse', 'anarkali', 'evening-gown'], 'general'),
('sleeve-cap-height', 'sleeve', 'Sleeve Cap Height', 'SCH = AD - 3', 'Sleeve Cap Height = Armhole Depth - 3 cm', '{"AD": "Armhole depth in cm"}', ARRAY['bust'], 'Cap crown height (cm)', '14.0 - 19.5 cm', 'Reduce by 2.5 cm for puffed sleeve gathers.', ARRAY['blouse', 'kurta', 'sherwani'], 'general'),
('sleeve-width', 'sleeve', 'Sleeve Bicep Width', 'SW = \frac{UA}{2} + 4', 'Half Sleeve Width = Upper Arm / 2 + 4 cm ease', '{"UA": "Upper arm circumference in cm"}', ARRAY['upper_arm'], 'Half sleeve width (cm)', '16.0 - 22.0 cm', 'Ensures comfort during arm extension.', ARRAY['blouse', 'kurta', 'gown'], 'general'),
('lehenga-panel-width', 'skirt', 'Lehenga Panel Width', 'W_{hem} = (\frac{H}{4} + 10) \times k', 'Panel Hem = (Hip / 4 + 10) * flare_factor', '{"H": "Hip in cm", "k": "Flare multiplier"}', ARRAY['hip'], 'Width per panel at hem (cm)', '35.0 - 90.0 cm', 'Multiply across 6, 8, 12, or 16 kalis.', ARRAY['lehenga', 'anarkali'], 'indian'),
('circle-skirt-radius', 'skirt', 'Full Circle Skirt Radius', 'r = \frac{W}{2\pi}', 'Waist Radius = Waist / (2 * pi)', '{"W": "Waist in cm"}', ARRAY['waist'], 'Inner waist radius (cm)', '10.5 - 15.0 cm', 'Cut pattern along radial arc for 360-degree drape.', ARRAY['lehenga', 'circle-skirt', 'fusion-dress'], 'general'),
('half-circle-radius', 'skirt', 'Half Circle Skirt Radius', 'r = \frac{W}{\pi}', 'Waist Radius = Waist / pi', '{"W": "Waist in cm"}', ARRAY['waist'], 'Inner waist radius (cm)', '21.0 - 30.0 cm', 'Efficient for fabrics with single-direction border motifs.', ARRAY['lehenga', 'midi-skirt'], 'general'),
('contrast-ratio', 'colour', 'Luminance Contrast Ratio', 'CR = \frac{L_1 + 0.05}{L_2 + 0.05}', 'CR = (L1 + 0.05) / (L2 + 0.05)', '{"L1": "Lighter luminance", "L2": "Darker luminance"}', ARRAY['hex1', 'hex2'], 'Contrast ratio (X : 1)', '1.0 - 21.0', 'CR > 3.0 gives ideal definition between dress and skin tone.', ARRAY['all'], 'general')
ON CONFLICT (id) DO UPDATE SET
  formula_latex = EXCLUDED.formula_latex,
  formula_plain = EXCLUDED.formula_plain,
  output_label = EXCLUDED.output_label;

-- 6. COLOUR PALETTES
INSERT INTO colour_palettes (title, body, theory_type, colors, occasion, style_theme) VALUES
('Ajrakh Earth & Indigo', 'Rich madder crimson grounded with block-printed indigo and antique mustard.', 'analogous', 
 '[{"hex": "#d0523d", "name": "Madder Crimson"}, {"hex": "#1b4552", "name": "Kachchh Indigo"}, {"hex": "#d59d3f", "name": "Mustard Zari"}]',
 ARRAY['Festive', 'Cultural Fest', 'Evening'], 'indian'),

('Mughal Royal Contrast', 'Complementary jewel tones balancing midnight lapis with deep saffron gold.', 'complementary',
 '[{"hex": "#194b65", "name": "Lapis Lazuli"}, {"hex": "#e8b547", "name": "Royal Zari Gold"}, {"hex": "#c9513e", "name": "Sindoor Rust"}]',
 ARRAY['Bridal', 'Gala', 'Reception'], 'indian'),

('Chanderi Forest Whisper', 'Subtle earth tones allowing translucent metallic gossamer to take focal center.', 'split-complementary',
 '[{"hex": "#365540", "name": "Paan Green"}, {"hex": "#a86e46", "name": "Raw Silk Ochre"}, {"hex": "#eee6d6", "name": "Kora Unbleached"}]',
 ARRAY['Daytime Wedding', 'Office Chic', 'Exhibition'], 'fusion')
ON CONFLICT DO NOTHING;

-- 7. SKIN TONES
INSERT INTO skin_tone_library (id, name, hex, undertone, common_region, complementary_hues) VALUES
('fair-cool', 'Fair Porcelain', '#FDDCB5', 'cool', 'Kashmir / Himachal', ARRAY['#194b65', '#31624e', '#754058']),
('light-neutral', 'Light Ivory', '#F0C08A', 'neutral', 'Pan-Indian', ARRAY['#b65a36', '#315c73', '#984916']),
('wheatish-warm', 'Wheatish Golden', '#D4956A', 'warm', 'Central / Northern Plains', ARRAY['#d0523d', '#1b4552', '#d59d3f', '#365540']),
('medium-warm', 'Medium Warm Amber', '#C07B52', 'warm', 'Western / Deccan', ARRAY['#e8b547', '#194b65', '#245d63']),
('olive-neutral', 'Olive Sandalwood', '#9C6644', 'neutral', 'Eastern / Coastal', ARRAY['#b65a36', '#f0c570', '#31624e']),
('deep-warm', 'Deep Bronze', '#7D4E3D', 'warm', 'Southern Peninsular', ARRAY['#e8b547', '#c9513e', '#1b4552', '#eee6d6']),
('rich-espresso', 'Rich Espresso', '#4A2C2A', 'cool', 'Southern / Coastal', ARRAY['#e8b547', '#315c73', '#d0523d', '#ffffff'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  hex = EXCLUDED.hex,
  undertone = EXCLUDED.undertone;

-- 8. RESOURCES
INSERT INTO resources (title, description, type, url, size_label, icon, category, style_theme, is_downloadable, sort_order) VALUES
('Katori Blouse Blueprint', 'Complete printable drafting block with apex calculations and dart keys.', 'pdf', '/vastrashastra-pattern-blueprint.pdf', 'PDF · Printable A4 · 182 KB', 'ruler', 'patterns', 'indian', true, 1),
('Measurement Calculation Grid', 'Editable spreadsheet with 28 measurement parameters and auto-formulas.', 'csv', '/measurement-worksheet.csv', 'CSV · 28 Parameters · 4 KB', 'thread', 'calculations', 'general', true, 2),
('Indian Blouse Pattern Masterclass', '28-minute studio demonstration of katori cutting and toile verification.', 'video', 'https://www.youtube.com/watch?v=q4hR7cGVmAQ', 'External Video · HD', 'play', 'videos', 'indian', false, 3),
('Textile & Fibre Glossary', 'Comprehensive field guide to 86 Indian handloom weaves, silks, and finishes.', 'external', 'https://craftscouncilofindia.org/', 'Living Craft Archive · 86 Terms', 'spark', 'glossary', 'indian', false, 4),
('Salwar & Kalidar Pattern Math', 'Technical drafting breakdown for Patiala gathers and flared kalis.', 'video', 'https://www.youtube.com/watch?v=0Fg0tFqmRFk', 'Drafting Workshop · 22 min', 'play', 'videos', 'indian', false, 5)
ON CONFLICT DO NOTHING;

-- 9. BADGES
INSERT INTO badges (id, name, description, icon, category) VALUES
('master-draftsman', 'Master Draftsman', 'Scored 90%+ in precision pattern drafting and formulas.', 'ruler', 'math'),
('color-harmony-pro', 'Color Harmony Pro', 'Mastered skin-tone contrast and complementary palettes.', 'swatch', 'colour'),
('blouse-expert', 'Blouse Expert', 'Successfully drafted and verified a complex Katori block.', 'thread', 'general'),
('drape-architect', 'Drape Architect', 'Engineered contemporary fusion drapes from unstitched silk.', 'spark', 'general'),
('digital-couturier', 'Digital Couturier', 'Generated first complete 2D-to-3D AI garment model.', 'spark', 'ai'),
('mastercutter-dieline', 'Mastercutter', 'Achieved 95%+ dieline measurement accuracy vs AI reference.', 'ruler', 'dieline')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
