/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PharmacyItem {
  id: string;
  name: string;
  category: 'SPECIALTY_MEDICINE' | 'GENERAL_MEDICINE' | 'SURGICAL_SUPPLY' | 'LAB_REAGENT' | 'DIGITAL_DEVICE' | 'SYRUP_DROPPER' | 'EQUIPMENT_INSTRUMENT';
  price: number; // in ₹ (INR)
  unit: string;
  stock: number;
  batch: string;
  expiry: string;
  description: string;
}

export const MASTER_PHARMACY_CATALOG: PharmacyItem[] = [
  // 1. Digital Health Devices & Diagnostic Equipment
  { id: 'dev-1', name: 'Digital Blood Glucose Meter Kit (Glucometer + 50 Strips)', category: 'DIGITAL_DEVICE', price: 1450, unit: 'Kit', stock: 120, batch: 'DEV-GLU-901', expiry: 'Jan 2030', description: 'Accurate 5-Second Blood Glucose Monitor with Memory' },
  { id: 'dev-2', name: 'Smart Digital Weight & BMI Scale', category: 'DIGITAL_DEVICE', price: 1850, unit: 'Unit', stock: 85, batch: 'DEV-WGT-441', expiry: 'N/A', description: 'High-Precision Electronic Weight & Body Fat Analyzer' },
  { id: 'dev-3', name: 'Fingertip OLED Pulse Oximeter (SpO2 & Heart Rate)', category: 'DIGITAL_DEVICE', price: 1250, unit: 'Unit', stock: 150, batch: 'DEV-OXI-332', expiry: 'N/A', description: 'OLED Display Oxygen Saturation & Pulse Rate Monitor' },
  { id: 'dev-4', name: 'Automatic Upper Arm Digital BP Monitor', category: 'DIGITAL_DEVICE', price: 2200, unit: 'Unit', stock: 95, batch: 'DEV-BPM-112', expiry: 'N/A', description: 'Oscillometric Blood Pressure & Arrhythmia Indicator' },
  { id: 'dev-5', name: 'Ultrasonic Electric Nebulizer Machine', category: 'DIGITAL_DEVICE', price: 1950, unit: 'Unit', stock: 60, batch: 'DEV-NEB-501', expiry: 'N/A', description: 'Silent Aerosol Inhalation Medication Compressor' },
  { id: 'dev-6', name: 'Infrared Non-Contact Forehead Thermometer', category: 'DIGITAL_DEVICE', price: 1650, unit: 'Unit', stock: 140, batch: 'DEV-THM-101', expiry: 'N/A', description: 'Instant 1-Second Body & Surface Temperature Scanner' },
  { id: 'dev-7', name: 'Portable Medical Oxygen Concentrator 5L/min', category: 'EQUIPMENT_INSTRUMENT', price: 42000, unit: 'Unit', stock: 15, batch: 'EQP-OXY-900', expiry: 'N/A', description: 'Continuous Flow 93% Purity Hospital Grade Oxygen Unit' },

  // 2. Specialty & Chronic Care Medicines
  { id: 'pharm-1', name: 'Levetiracetam 500mg Tablets (Strip of 10)', category: 'SPECIALTY_MEDICINE', price: 280, unit: 'Strip', stock: 350, batch: 'BAT-NEURO-881', expiry: 'Dec 2027', description: 'Antiepileptic & Neurological Seizure Control' },
  { id: 'pharm-2', name: 'Donepezil 5mg Tablets (Strip of 10)', category: 'SPECIALTY_MEDICINE', price: 340, unit: 'Strip', stock: 180, batch: 'BAT-NEURO-442', expiry: 'Oct 2027', description: 'Alzheimer & Cognitive Function Therapy' },
  { id: 'pharm-3', name: 'Gabapentin 300mg Capsules (Strip of 10)', category: 'SPECIALTY_MEDICINE', price: 220, unit: 'Strip', stock: 240, batch: 'BAT-NEURO-991', expiry: 'Jan 2028', description: 'Neuropathic Pain & Nerve Care' },
  { id: 'pharm-4', name: 'Atorvastatin 10mg Tablets (Strip of 15)', category: 'SPECIALTY_MEDICINE', price: 180, unit: 'Strip', stock: 500, batch: 'BAT-CARD-112', expiry: 'May 2028', description: 'Lipid Lowering & Cholesterol Management' },
  { id: 'pharm-5', name: 'Amlodipine Besylate 5mg (Strip of 14)', category: 'SPECIALTY_MEDICINE', price: 95, unit: 'Strip', stock: 420, batch: 'BAT-CARD-331', expiry: 'Mar 2028', description: 'Antihypertensive Calcium Channel Blocker' },
  { id: 'pharm-6', name: 'Insulin Glargine 100 IU/ml Disposable Pen (3ml)', category: 'SPECIALTY_MEDICINE', price: 890, unit: 'Pen', stock: 95, batch: 'BAT-ENDO-201', expiry: 'Nov 2026', description: 'Long-Acting Basal Human Insulin Analog' },
  { id: 'pharm-7', name: 'Metformin HCl 500mg Sustained Release (Strip of 15)', category: 'SPECIALTY_MEDICINE', price: 65, unit: 'Strip', stock: 800, batch: 'BAT-ENDO-302', expiry: 'Jul 2028', description: 'First-Line Type 2 Diabetes Glycemic Control' },

  // 3. General Medicines, Capsules & Tablets
  { id: 'pharm-8', name: 'Paracetamol 650mg Tablets (Strip of 15)', category: 'GENERAL_MEDICINE', price: 35, unit: 'Strip', stock: 1200, batch: 'BAT-GEN-001', expiry: 'Dec 2028', description: 'Analgesic & Antipyretic Fever Control' },
  { id: 'pharm-9', name: 'Pantoprazole 40mg Gastro-Resistant Tablets (Strip of 10)', category: 'GENERAL_MEDICINE', price: 110, unit: 'Strip', stock: 850, batch: 'BAT-GEN-104', expiry: 'Nov 2028', description: 'Proton Pump Inhibitor for Acidity & GERD' },
  { id: 'pharm-10', name: 'Cetirizine 10mg Allergy Tablets (Strip of 10)', category: 'GENERAL_MEDICINE', price: 45, unit: 'Strip', stock: 950, batch: 'BAT-GEN-302', expiry: 'Feb 2028', description: 'Antihistamine Allergy & Rhinitis Relief' },
  { id: 'pharm-11', name: 'Multivitamin & Essential Minerals Capsules (Strip of 15)', category: 'GENERAL_MEDICINE', price: 160, unit: 'Strip', stock: 600, batch: 'BAT-GEN-551', expiry: 'Apr 2028', description: 'Immune Support & Vital Micronutrients' },
  { id: 'pharm-12', name: 'Amoxicillin + Clavulanate 625mg Antibiotic (Strip of 10)', category: 'GENERAL_MEDICINE', price: 210, unit: 'Strip', stock: 410, batch: 'BAT-ANT-409', expiry: 'Aug 2027', description: 'Broad-Spectrum Penicillin Antibiotic Therapy' },
  { id: 'pharm-13', name: 'Azithromycin 500mg Tablets (Strip of 5)', category: 'GENERAL_MEDICINE', price: 125, unit: 'Strip', stock: 380, batch: 'BAT-ANT-118', expiry: 'Sep 2027', description: 'Macrolide Antibiotic for Respiratory Infection' },
  { id: 'pharm-14', name: 'Omeprazole 20mg Hard Gelatin Capsules (Strip of 20)', category: 'GENERAL_MEDICINE', price: 85, unit: 'Strip', stock: 720, batch: 'BAT-GEN-880', expiry: 'Jan 2028', description: 'Antacid Capsule for Ulcer & Heartburn' },

  // 4. Syrups, Oral Suspensions & Eye/Ear Droppers
  { id: 'syr-1', name: 'Cough Suppressant Syrup (Dextromethorphan + Chlorpheniramine 100ml)', category: 'SYRUP_DROPPER', price: 115, unit: 'Bottle', stock: 240, batch: 'SYR-COF-01', expiry: 'Dec 2027', description: 'Dry Cough Relief & Antihistamine Elixir' },
  { id: 'syr-2', name: 'Paracetamol Paediatric Oral Suspension 250mg/5ml (60ml)', category: 'SYRUP_DROPPER', price: 55, unit: 'Bottle', stock: 310, batch: 'SYR-PED-04', expiry: 'Oct 2027', description: 'Child Fever & Pain Relief Syrup' },
  { id: 'syr-3', name: 'Antacid Sugar-Free Gel Syrup (Mint Flavor 200ml)', category: 'SYRUP_DROPPER', price: 140, unit: 'Bottle', stock: 190, batch: 'SYR-ACD-99', expiry: 'May 2028', description: 'Rapid Action Acidity Neutralizing Liquid' },
  { id: 'drop-1', name: 'Ciprofloxacin 0.3% Sterile Eye/Ear Drops (10ml)', category: 'SYRUP_DROPPER', price: 48, unit: 'Vial', stock: 280, batch: 'DRP-OPT-12', expiry: 'Jun 2027', description: 'Antibacterial Ophthalmic & Otic Solution' },
  { id: 'drop-2', name: 'Carboxymethylcellulose 0.5% Lubricating Eye Drops (10ml)', category: 'SYRUP_DROPPER', price: 165, unit: 'Vial', stock: 210, batch: 'DRP-OPT-88', expiry: 'Dec 2027', description: 'Artificial Tears for Dry Eye Syndrome' },
  { id: 'drop-3', name: 'Paediatric Saline Nasal Drops 0.9% (20ml)', category: 'SYRUP_DROPPER', price: 60, unit: 'Vial', stock: 340, batch: 'DRP-NAS-05', expiry: 'Apr 2028', description: 'Gentle Decongestant Nasal Spray & Dropper' },

  // 5. Surgical Tools, Instruments & Medical Equipment
  { id: 'surg-1', name: 'Stainless Steel Surgical Scalpel Handle #3 + 10 Blades', category: 'SURGICAL_SUPPLY', price: 350, unit: 'Set', stock: 65, batch: 'SURG-SCL-01', expiry: 'N/A', description: 'Autoclavable Surgical Precision Cutting Tool' },
  { id: 'surg-2', name: 'Mayo Dissecting Curved Scissors 6.75"', category: 'SURGICAL_SUPPLY', price: 520, unit: 'Unit', stock: 45, batch: 'SURG-SCS-12', expiry: 'N/A', description: 'German Grade Stainless Tissue Scissors' },
  { id: 'surg-3', name: 'Sterile Surgical Hemostatic Forceps (Artery Clamp 5.5")', category: 'SURGICAL_SUPPLY', price: 480, unit: 'Unit', stock: 70, batch: 'SURG-FCP-88', expiry: 'N/A', description: 'Locking Artery Forceps for Vascular Control' },
  { id: 'surg-4', name: 'Foley 2-Way Silicone Coated Catheter 16 Fr (Pack of 10)', category: 'SURGICAL_SUPPLY', price: 780, unit: 'Pack', stock: 40, batch: 'SURG-CTH-30', expiry: 'Nov 2028', description: 'Sterile Urinary Drainage Balloon Catheter' },
  { id: 'surg-5', name: 'Disposable IV Cannula 20G with Injection Port (Box of 50)', category: 'SURGICAL_SUPPLY', price: 1100, unit: 'Box', stock: 30, batch: 'SURG-CAN-50', expiry: 'Oct 2029', description: 'Radio-Opaque Venous Access Catheter' },
  { id: 'surg-6', name: 'Absorbable PGA Surgical Suture 2-0 with Needle (Box of 12)', category: 'SURGICAL_SUPPLY', price: 1450, unit: 'Box', stock: 25, batch: 'SURG-SUT-20', expiry: 'Feb 2028', description: 'Polyglycolic Acid Braided Synthetic Suture' },
  { id: 'surg-7', name: 'Heavy Duty Stainless Steel IV Drip Stand', category: 'EQUIPMENT_INSTRUMENT', price: 2400, unit: 'Unit', stock: 20, batch: 'EQP-STN-02', expiry: 'N/A', description: 'Height Adjustable 4-Hook Rolling Infusion Pole' },
  { id: 'surg-8', name: 'Littmann Classic III Stainless Cardiology Stethoscope', category: 'EQUIPMENT_INSTRUMENT', price: 9500, unit: 'Unit', stock: 18, batch: 'EQP-STH-99', expiry: 'N/A', description: 'Dual-Frequency High Acoustic Sensitivity Stethoscope' },
  { id: 'surg-9', name: 'Hospital Stainless Steel Instrument Tray with Lid', category: 'EQUIPMENT_INSTRUMENT', price: 850, unit: 'Unit', stock: 50, batch: 'EQP-TRY-10', expiry: 'N/A', description: 'Sterilization Organ Holder Box 12"x8"' },
  { id: 'surg-10', name: 'Single-Use Sterile Syringes 5ml (Pack of 50)', category: 'SURGICAL_SUPPLY', price: 450, unit: 'Pack', stock: 80, batch: 'SUP-SYR-001', expiry: 'Dec 2029', description: 'Luer Lock Disposable Syringes' },
  { id: 'surg-11', name: 'IV Saline Normal 0.9% 500ml (Box of 10)', category: 'SURGICAL_SUPPLY', price: 650, unit: 'Box', stock: 95, batch: 'SUP-IV-991', expiry: 'Oct 2027', description: 'Sterile Intravenous Fluid Solution' },
  { id: 'surg-12', name: 'Powder-Free Latex Surgical Gloves (Box of 100)', category: 'SURGICAL_SUPPLY', price: 850, unit: 'Box', stock: 110, batch: 'SUP-GLV-301', expiry: 'Aug 2029', description: 'Medical Grade Examination Gloves' },
];
