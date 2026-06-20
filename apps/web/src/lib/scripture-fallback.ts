import type { Scripture } from './api';

const ts = '2026-01-01T00:00:00Z';
const s = (
  slug: string, name: string, sanskrit_name: string, category: string,
  metadata: Record<string, unknown> = {},
): Scripture => ({
  id: `scp_${slug}`, slug, name, sanskrit_name, category,
  language: 'sanskrit', period: null, description: null,
  is_canonical: true, metadata, created_at: ts,
  chapter_count: 0, verse_count: 0,
});

export const FALLBACK_SCRIPTURES: Scripture[] = [
  // 4 Vedas
  s('rigveda', 'Rigveda', 'ऋग्वेद', 'veda', { total_mantras: 10552, canonical_abbreviation: 'RV' }),
  s('samaveda', 'Samaveda', 'सामवेद', 'veda', { total_mantras: 1875, canonical_abbreviation: 'SV' }),
  s('yajurveda', 'Yajurveda', 'यजुर्वेद', 'veda', { total_mantras: 1975, canonical_abbreviation: 'YV' }),
  s('atharvaveda', 'Atharvaveda', 'अथर्ववेद', 'veda', { total_mantras: 5977, canonical_abbreviation: 'AV' }),

  // Bhagavad Gita
  s('bhagavad-gita', 'Bhagavad Gita', 'भगवद्गीता', 'gita', { total_chapters: 18, total_verses: 700 }),

  // Itihasa
  s('ramayana', 'Ramayana', 'रामायण', 'ramayana', { total_shlokas: 24000 }),
  s('mahabharata', 'Mahabharata', 'महाभारत', 'mahabharata', { total_shlokas: 100000 }),

  // 13 Upanishads
  s('isha-upanishad', 'Isha Upanishad', 'ईशोपनिषद्', 'upanishad', { total_mantras: 18, parent_veda: 'Shukla Yajurveda' }),
  s('kena-upanishad', 'Kena Upanishad', 'केनोपनिषद्', 'upanishad', { total_verses: 35, parent_veda: 'Samaveda' }),
  s('katha-upanishad', 'Katha Upanishad', 'कठोपनिषद्', 'upanishad', { total_verses: 119, parent_veda: 'Krishna Yajurveda' }),
  s('prashna-upanishad', 'Prashna Upanishad', 'प्रश्नोपनिषद्', 'upanishad', { total_prashnas: 6, parent_veda: 'Atharvaveda' }),
  s('mundaka-upanishad', 'Mundaka Upanishad', 'मुण्डकोपनिषद्', 'upanishad', { total_mantras: 64, parent_veda: 'Atharvaveda' }),
  s('mandukya-upanishad', 'Mandukya Upanishad', 'माण्डूक्योपनिषद्', 'upanishad', { total_mantras: 12, parent_veda: 'Atharvaveda' }),
  s('taittiriya-upanishad', 'Taittiriya Upanishad', 'तैत्तिरीयोपनिषद्', 'upanishad', { total_vallis: 3, parent_veda: 'Krishna Yajurveda' }),
  s('aitareya-upanishad', 'Aitareya Upanishad', 'ऐतरेयोपनिषद्', 'upanishad', { total_chapters: 3, parent_veda: 'Rigveda' }),
  s('chandogya-upanishad', 'Chandogya Upanishad', 'छान्दोग्योपनिषद्', 'upanishad', { total_prapathakas: 8, parent_veda: 'Samaveda' }),
  s('brihadaranyaka-upanishad', 'Brihadaranyaka Upanishad', 'बृहदारण्यकोपनिषद्', 'upanishad', { total_adhyayas: 6, parent_veda: 'Shukla Yajurveda' }),
  s('shvetashvatara-upanishad', 'Shvetashvatara Upanishad', 'श्वेताश्वतरोपनिषद्', 'upanishad', { total_adhyayas: 6, parent_veda: 'Krishna Yajurveda' }),
  s('kaushitaki-upanishad', 'Kaushitaki Upanishad', 'कौषीतकिब्राह्मणोपनिषद्', 'upanishad', { total_adhyayas: 4, parent_veda: 'Rigveda' }),
  s('maitri-upanishad', 'Maitri Upanishad', 'मैत्र्युपनिषद्', 'upanishad', { total_prapathakas: 7, parent_veda: 'Krishna Yajurveda' }),

  // 18 Puranas
  s('brahma-purana', 'Brahma Purana', 'ब्रह्मपुराण', 'purana', { total_shlokas: 10000, group: 'Brahma' }),
  s('padma-purana', 'Padma Purana', 'पद्मपुराण', 'purana', { total_shlokas: 55000, group: 'Brahma' }),
  s('vishnu-purana', 'Vishnu Purana', 'विष्णुपुराण', 'purana', { total_shlokas: 23000, group: 'Vishnu' }),
  s('shiva-purana', 'Shiva Purana', 'शिवपुराण', 'purana', { total_shlokas: 24000, group: 'Shiva' }),
  s('bhagavata-purana', 'Bhagavata Purana', 'भागवतपुराण', 'purana', { total_shlokas: 18000, group: 'Vishnu' }),
  s('narada-purana', 'Narada Purana', 'नारदपुराण', 'purana', { total_shlokas: 25000, group: 'Vishnu' }),
  s('markandeya-purana', 'Markandeya Purana', 'मार्कण्डेयपुराण', 'purana', { total_shlokas: 9000, group: 'Brahma' }),
  s('agni-purana', 'Agni Purana', 'अग्निपुराण', 'purana', { total_shlokas: 15400, group: 'Brahma' }),
  s('bhavishya-purana', 'Bhavishya Purana', 'भविष्यपुराण', 'purana', { total_shlokas: 14500, group: 'Brahma' }),
  s('brahma-vaivarta-purana', 'Brahma Vaivarta Purana', 'ब्रह्मवैवर्तपुराण', 'purana', { total_shlokas: 18000, group: 'Vishnu' }),
  s('linga-purana', 'Linga Purana', 'लिङ्गपुराण', 'purana', { total_shlokas: 11000, group: 'Shiva' }),
  s('varaha-purana', 'Varaha Purana', 'वराहपुराण', 'purana', { total_shlokas: 10000, group: 'Vishnu' }),
  s('skanda-purana', 'Skanda Purana', 'स्कन्दपुराण', 'purana', { total_shlokas: 81100, group: 'Shiva' }),
  s('vamana-purana', 'Vamana Purana', 'वामनपुराण', 'purana', { total_shlokas: 10000, group: 'Shiva' }),
  s('kurma-purana', 'Kurma Purana', 'कूर्मपुराण', 'purana', { total_shlokas: 17000, group: 'Vishnu' }),
  s('matsya-purana', 'Matsya Purana', 'मत्स्यपुराण', 'purana', { total_shlokas: 14000, group: 'Vishnu' }),
  s('garuda-purana', 'Garuda Purana', 'गरुडपुराण', 'purana', { total_shlokas: 19000, group: 'Vishnu' }),
  s('brahmanda-purana', 'Brahmanda Purana', 'ब्रह्माण्डपुराण', 'purana', { total_shlokas: 12000, group: 'Brahma' }),

  // 14 Shastras
  s('arthashastra', 'Arthashastra', 'अर्थशास्त्र', 'shastra', { author: 'Kautilya', total_chapters: 150 }),
  s('manusmriti', 'Manusmriti', 'मनुस्मृति', 'shastra', { author: 'Manu', total_shlokas: 2694 }),
  s('natyashastra', 'Natyashastra', 'नाट्यशास्त्र', 'shastra', { author: 'Bharata Muni', total_shlokas: 6000 }),
  s('kamasutra', 'Kamasutra', 'कामसूत्र', 'shastra', { author: 'Vatsyayana', total_chapters: 36 }),
  s('yoga-sutras', 'Yoga Sutras', 'योगसूत्र', 'shastra', { author: 'Patanjali', total_sutras: 196 }),
  s('brahma-sutras', 'Brahma Sutras', 'ब्रह्मसूत्र', 'shastra', { author: 'Badarayana', total_sutras: 555 }),
  s('nyaya-sutras', 'Nyaya Sutras', 'न्यायसूत्र', 'shastra', { author: 'Gautama', total_sutras: 528 }),
  s('vaisheshika-sutras', 'Vaisheshika Sutras', 'वैशेषिकसूत्र', 'shastra', { author: 'Kanada', total_sutras: 370 }),
  s('mimamsa-sutras', 'Mimamsa Sutras', 'मीमांसासूत्र', 'shastra', { author: 'Jaimini', total_sutras: 2745 }),
  s('sankhya-karika', 'Sankhya Karika', 'सांख्यकारिका', 'shastra', { author: 'Ishvarakrishna', total_karikas: 72 }),
  s('ashtadhyayi', 'Ashtadhyayi', 'अष्टाध्यायी', 'shastra', { author: 'Panini', total_sutras: 3959 }),
  s('amarakosha', 'Amarakosha', 'अमरकोश', 'shastra', { author: 'Amarasimha', total_kandas: 3 }),
  s('charaka-samhita', 'Charaka Samhita', 'चरकसंहिता', 'shastra', { author: 'Charaka', total_chapters: 120 }),
  s('sushruta-samhita', 'Sushruta Samhita', 'सुश्रुतसंहिता', 'shastra', { author: 'Sushruta', total_chapters: 186 }),
];
