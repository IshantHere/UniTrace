# UniTrace — AI Architecture & Matching Engine Specification

## 1. AI Vision & Multimodal Philosophy

UniTrace treats AI as an **explainable discovery and ranking copilot**, strictly maintaining that **statistical AI correlation is never treated as legal ownership proof**. 

The system relies on five coordinated AI subsystems:
1. **Visual Fingerprinting Engine (`VisionService`)**: Converts uncurated photos into structured, probabilistic attribute graphs with confidence scores.
2. **Dense Vector Embeddings (`EmbeddingService`)**: Generates high-dimensional semantic and multimodal embeddings.
3. **Multi-Signal Matching Engine (`MatchingService`)**: Weighted mathematical scoring model incorporating visual, semantic, categorical, spatial, and temporal dimensions.
4. **Explainable Evidence Generator (`EvidenceBuilder`)**: Translates vector similarity and attribute intersections into plain-English reasons understandable by students and security officers.
5. **Content Moderation & Spam Guard (`ModerationService`)**: Pre-filters inappropriate imagery, toxic text descriptions, and abusive reports.

---

## 2. Visual Fingerprint Data Structure

When an image is submitted, the vision model extracts the following structured JSON schema:

```json
{
  "category": "Electronics",
  "subcategory": "Audio Accessories",
  "primary_color": "White",
  "secondary_colors": ["Silver", "Gray"],
  "shape": "Curved Rectangular Compact",
  "material": "Glossy Plastic",
  "brand": "Apple",
  "visible_text": null,
  "logo": "Apple Embossed Case",
  "stickers": "Small blue circular sticker on top lid",
  "scratches": "Minor surface scuff near bottom hinge",
  "dents": "None",
  "unique_marks": "Slight blue ink transfer mark on rear casing",
  "accessories": "Silicone protective sleeve attached",
  "approximate_size": "6cm x 4.5cm x 2cm",
  "condition": "Used - Good Condition",
  "distinctive_features": [
    "Circular blue sticker on lid",
    "Surface scuff near bottom hinge"
  ],
  "confidence_scores": {
    "primary_color": 0.98,
    "brand": 0.94,
    "stickers": 0.91,
    "scratches": 0.82,
    "unique_marks": 0.78
  }
}
```

---

## 3. Multimodal Scoring Formulation

The composite match score \( S_{\text{overall}} \in [0.0, 1.0] \) between a lost item \( L \) and candidate found item \( F \) is formulated as:

$$S_{\text{overall}} = w_v \cdot S_{\text{visual}} + w_t \cdot S_{\text{semantic}} + w_a \cdot S_{\text{attributes}} + w_s \cdot S_{\text{spatial}} + w_\tau \cdot S_{\text{temporal}}$$

Where default tunable weights satisfy \( \sum w_i = 1.0 \):
* \( w_v = 0.30 \) (Visual Embedding / Image Cosine Similarity)
* \( w_t = 0.25 \) (Semantic Text Embedding Cosine Similarity)
* \( w_a = 0.20 \) (Structured Attribute & Distinctive Feature Overlap)
* \( w_s = 0.15 \) (Spatial Proximity Decay via Haversine Distance)
* \( w_\tau = 0.10 \) (Temporal Compatibility Decay)

### Sub-Score Formulations:
1. **Spatial Proximity Score (\( S_{\text{spatial}} \))**:
   $$S_{\text{spatial}}(d) = \max\left(0, 1 - \frac{d}{D_{\text{max}}}\right)$$
   Where \( d \) is the walking distance between locations, and \( D_{\text{max}} = 1500\,\text{meters} \). Items in the exact same building receive \( S_{\text{spatial}} = 1.0 \).
2. **Temporal Compatibility Score (\( S_{\text{temporal}} \))**:
   Found reports created before lost incident times are penalized unless within a grace period \( \Delta t_{\text{fuzz}} = 2\,\text{hours} \). Score decays smoothly over days:
   $$S_{\text{temporal}}(\Delta t) = \exp\left(-\lambda \cdot |\Delta t|\right)$$
3. **Attribute Match Score (\( S_{\text{attributes}} \))**:
   Calculates weighted Jaccard similarity across discrete features:
   * Category exact match: 1.0; mismatch in macro-category: 0.0.
   * Color compatibility (primary & secondary palettes).
   * Brand equality / alias compatibility.
   * Distinctive feature text token intersection (stickers, scratches, engravings).

---

## 4. Explainable Match Tiers & Evidence

Matches are grouped into 4 distinct confidence tiers:
* **`EXCEPTIONAL` (90% – 100%)**: Strong multi-signal alignment (e.g. identical visual appearance, matching unique sticker, same building, within 2 hours).
* **`HIGH` (75% – 89%)**: High visual and semantic similarity, compatible location, minor attribute variations.
* **`MEDIUM` (55% – 74%)**: Plausible candidate sharing color and general category, warranting staff or user inspection.
* **`LOW` (< 55%)**: Weak correlation, filtered out from high-priority notifications.

Every match returns an explicit list of **Evidence Cards**:
```
✓ Same Object Category: "Audio Accessories" (Confidence: 99%)
✓ Visual Appearance Similarity: Highly consistent white compact casing
✓ Distinctive Feature Match: "Blue sticker on lid" identified on both items
✓ Spatial Proximity: Locations are 140 meters apart (Library -> Library Entrance)
✓ Temporal Window: Found within 45 minutes of lost timestamp
```

---

## 5. Provider Abstraction & Fallbacks

All AI integrations are encapsulated behind the `AIService` interface:
* **Primary Production Engine**: Google Gemini API via `gemini-1.5-flash` / `gemini-2.5` for vision and `text-embedding-004` for vectors.
* **Local Deterministic Fallback (`MockAIService`)**: For offline development, isolated unit tests, and continuous integration without requiring live network access or active API billing.
* Zero hardcoded model assumptions: the prompt templates, temperature controls, and parser schemas are decoupled from UI components.
