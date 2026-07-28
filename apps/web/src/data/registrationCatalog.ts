import { SelectOption } from '../components/shared/CustomSelect';

// DOCTOR DEPARTMENTS (30+ Clinical Departments grouped by discipline)
export const DOCTOR_DEPARTMENTS_OPTIONS: SelectOption[] = [
  // General & Primary
  { value: 'General Medicine', label: 'General Medicine', sublabel: 'Internal Medicine & Primary Care', category: 'General & Primary' },
  { value: 'Pediatrics', label: 'Pediatrics', sublabel: 'Infant, Child & Adolescent Health', category: 'General & Primary' },
  { value: 'Geriatrics', label: 'Geriatrics', sublabel: 'Elderly Care & Longevity Medicine', category: 'General & Primary' },
  { value: 'Preventive Medicine', label: 'Preventive Medicine', sublabel: 'Public Health & Wellness Audits', category: 'General & Primary' },

  // Cardiovascular & Pulmonary
  { value: 'Cardiology', label: 'Cardiology', sublabel: 'Heart & Vascular Clinical Care', category: 'Cardiovascular & Pulmonary' },
  { value: 'Pulmonology', label: 'Pulmonology', sublabel: 'Lung & Respiratory Medicine', category: 'Cardiovascular & Pulmonary' },
  { value: 'Cardiothoracic Surgery', label: 'Cardiothoracic Surgery', sublabel: 'Heart & Chest Surgical Procedures', category: 'Cardiovascular & Pulmonary' },
  { value: 'Vascular Surgery', label: 'Vascular Surgery', sublabel: 'Arterial & Venous Surgery', category: 'Cardiovascular & Pulmonary' },

  // Neurology & Brain
  { value: 'Neurology', label: 'Neurology', sublabel: 'Brain, Nerve & Spinal Cord Care', category: 'Neurology & Brain' },
  { value: 'Neurosurgery', label: 'Neurosurgery', sublabel: 'Brain & Spine Surgical Interventions', category: 'Neurology & Brain' },
  { value: 'Psychiatry', label: 'Psychiatry', sublabel: 'Mental & Behavioral Health', category: 'Neurology & Brain' },
  { value: 'Psychology', label: 'Psychology', sublabel: 'Clinical Psychotherapy & Assessment', category: 'Neurology & Brain' },

  // Musculoskeletal & Orthopedics
  { value: 'Orthopedics', label: 'Orthopedics', sublabel: 'Bone, Joint & Trauma Surgery', category: 'Musculoskeletal & Ortho' },
  { value: 'Rheumatology', label: 'Rheumatology', sublabel: 'Autoimmune & Joint Inflammation', category: 'Musculoskeletal & Ortho' },
  { value: 'Physical Medicine & Rehabilitation', label: 'Physical Medicine & Rehab', sublabel: 'Physiatry & Recovery Science', category: 'Musculoskeletal & Ortho' },
  { value: 'Physiotherapy', label: 'Physiotherapy', sublabel: 'Physical Therapy & Movement Rehab', category: 'Musculoskeletal & Ortho' },

  // Oncology & Hematology
  { value: 'Oncology', label: 'Oncology', sublabel: 'Cancer Diagnosis & Tumor Therapy', category: 'Oncology & Blood' },
  { value: 'Hematology', label: 'Hematology', sublabel: 'Blood Disorders & Bone Marrow', category: 'Oncology & Blood' },

  // Abdominal & Organs
  { value: 'Gastroenterology', label: 'Gastroenterology', sublabel: 'Digestive & Liver Health', category: 'Abdominal & Organs' },
  { value: 'Nephrology', label: 'Nephrology', sublabel: 'Kidney Health & Dialysis', category: 'Abdominal & Organs' },
  { value: 'Urology', label: 'Urology', sublabel: 'Urinary Tract & Male Health', category: 'Abdominal & Organs' },
  { value: 'Endocrinology', label: 'Endocrinology', sublabel: 'Hormone, Thyroid & Diabetes Care', category: 'Abdominal & Organs' },

  // Surgical & Specialty
  { value: 'General Surgery', label: 'General Surgery', sublabel: 'Laparoscopic & Abdominal Surgery', category: 'Surgical & Specialty' },
  { value: 'Plastic & Reconstructive Surgery', label: 'Plastic Surgery', sublabel: 'Cosmetic & Reconstructive Surgery', category: 'Surgical & Specialty' },
  { value: 'Dermatology', label: 'Dermatology', sublabel: 'Skin, Hair & Aesthetic Care', category: 'Surgical & Specialty' },
  { value: 'Gynecology & Obstetrics', label: 'Gynecology & Obstetrics', sublabel: 'Women Health & IVF Fertility', category: 'Surgical & Specialty' },

  // Head & Sensory Organs
  { value: 'Ophthalmology', label: 'Ophthalmology', sublabel: 'Eye Microsurgery & Vision Care', category: 'Head & Sensory Organs' },
  { value: 'ENT (Otorhinolaryngology)', label: 'ENT (Otorhinolaryngology)', sublabel: 'Ear, Nose, Throat & Head Surgery', category: 'Head & Sensory Organs' },
  { value: 'Dentistry', label: 'Dentistry', sublabel: 'Dental, Oral & Maxillofacial Care', category: 'Head & Sensory Organs' },

  // Emergency & ICU
  { value: 'Emergency Medicine', label: 'Emergency Medicine', sublabel: 'Acute Trauma & ER Operations', category: 'Emergency & ICU' },
  { value: 'Critical Care Medicine', label: 'Critical Care Medicine', sublabel: 'ICU & Critical Care Intensivist', category: 'Emergency & ICU' },
  { value: 'Anesthesiology', label: 'Anesthesiology', sublabel: 'Perioperative & Pain Management', category: 'Emergency & ICU' },
];

// DOCTOR SPECIALTIES (Mapped by Department or General Selection)
export const DOCTOR_SPECIALTIES_MAP: Record<string, SelectOption[]> = {
  'Cardiology': [
    { value: 'Interventional Cardiology', label: 'Interventional Cardiology', sublabel: 'Angioplasty & Stenting' },
    { value: 'Diagnostic Cardiology', label: 'Diagnostic Cardiology', sublabel: 'ECHO, TMT & Non-Invasive' },
    { value: 'Electrophysiology', label: 'Electrophysiology', sublabel: 'Pacemaker & Arrhythmias' },
    { value: 'Cardiac Surgery', label: 'Cardiac Surgery', sublabel: 'CABG Bypass & Valve Repair' },
    { value: 'Pediatric Cardiology', label: 'Pediatric Cardiology', sublabel: 'Congenital Heart Defects' },
  ],
  'Neurology': [
    { value: 'Stroke & Vascular Neurology', label: 'Stroke & Vascular Neurology', sublabel: 'Acute Stroke Interventions' },
    { value: 'Neurosurgery', label: 'Neurosurgery', sublabel: 'Brain & Spinal Cord Surgery' },
    { value: 'Cognitive & Memory Care', label: 'Cognitive & Memory Care', sublabel: 'Alzheimer & Dementia' },
    { value: 'Neuromuscular Medicine', label: 'Neuromuscular Medicine', sublabel: 'ALS & Peripheral Neuropathy' },
  ],
  'Pediatrics': [
    { value: 'General Pediatrics', label: 'General Pediatrics', sublabel: 'Infant Growth & Vaccinations' },
    { value: 'Pediatric Surgery', label: 'Pediatric Surgery', sublabel: 'Neonatal & Child Surgery' },
    { value: 'Pediatric Neurologist', label: 'Pediatric Neurologist', sublabel: 'Child Neurodevelopment' },
    { value: 'Neonatology', label: 'Neonatology', sublabel: 'NICU Premature Newborn Care' },
  ],
  'Orthopedics': [
    { value: 'Joint Replacement', label: 'Joint Replacement Specialist', sublabel: 'Robotic Knee & Hip Arthroplasty' },
    { value: 'Spine Surgery', label: 'Spine Surgery Specialist', sublabel: 'Minimally Invasive Spine Surgery' },
    { value: 'Sports Medicine', label: 'Sports Medicine Specialist', sublabel: 'Arthroscopy & Ligament Repair' },
    { value: 'Orthopedic Trauma', label: 'Orthopedic Trauma Specialist', sublabel: 'Complex Fracture Surgery' },
  ],
  'Oncology': [
    { value: 'Medical Oncology', label: 'Medical Oncology', sublabel: 'Chemotherapy & Targeted Immunotherapy' },
    { value: 'Surgical Oncology', label: 'Surgical Oncology', sublabel: 'Tumor Resection Surgery' },
    { value: 'Radiation Oncology', label: 'Radiation Oncology', sublabel: 'Stereotactic Radiotherapy' },
    { value: 'Hemato-Oncology', label: 'Hemato-Oncology', sublabel: 'Leukemia & Lymphoma Care' },
  ],
  'Dermatology': [
    { value: 'Cosmetic Dermatology', label: 'Cosmetic Dermatology', sublabel: 'Laser Therapy & Aesthetics' },
    { value: 'Dermatologic Surgery', label: 'Dermatologic Surgery', sublabel: 'Skin Cancer & Resection' },
    { value: 'Clinical Dermatology', label: 'Clinical Dermatology', sublabel: 'Psoriasis, Eczema & Acne' },
  ],
  'Gastroenterology': [
    { value: 'Clinical Gastroenterology', label: 'Clinical Gastroenterology', sublabel: 'Endoscopy & Colonoscopy' },
    { value: 'Hepatology', label: 'Hepatology Specialist', sublabel: 'Liver Disease & Cirrhosis Care' },
    { value: 'GI Surgery', label: 'Gastrointestinal Surgery', sublabel: 'Bariatric & Hepato-Biliary Surgery' },
  ],
  'Gynecology & Obstetrics': [
    { value: 'Obstetrics & High-Risk Pregnancy', label: 'Obstetrics & High-Risk Care', sublabel: 'Maternal-Fetal Medicine' },
    { value: 'Gynecology & IVF', label: 'Gynecology & IVF Specialist', sublabel: 'Infertility & Reproductive Health' },
    { value: 'Laparoscopic Gynecology', label: 'Laparoscopic Gynecology', sublabel: 'Minimally Invasive Gynae Surgery' },
  ],
};

// Fallback Default Doctor Specialties
export const DEFAULT_DOCTOR_SPECIALTIES: SelectOption[] = [
  { value: 'Clinical OPD Specialist', label: 'Clinical OPD Specialist', sublabel: 'Outpatient Consultations' },
  { value: 'Senior Consultant Physician', label: 'Senior Consultant Physician', sublabel: 'Inpatient & Specialist Care' },
  { value: 'Surgical Specialist', label: 'Surgical Specialist', sublabel: 'Operative Procedures' },
  { value: 'Diagnostics & Research Specialist', label: 'Diagnostics & Research Specialist', sublabel: 'Clinical Audits & Research' },
];

// LAB TECHNICIAN SPECIALTIES (Comprehensive industry-standard lab list)
export const LAB_SPECIALTIES_OPTIONS: SelectOption[] = [
  { value: 'Hematology', label: 'Hematology & Blood Audits', sublabel: 'CBC, Blood Smear & Cell Counting', category: 'Hematology & Blood' },
  { value: 'Transfusion Medicine', label: 'Immunohematology & Transfusion', sublabel: 'Blood Cross-Matching & Reserve Audits', category: 'Hematology & Blood' },
  { value: 'Coagulation', label: 'Coagulation & Hemostasis', sublabel: 'PT/INR & Clotting Factor Analysis', category: 'Hematology & Blood' },

  { value: 'Microbiology', label: 'Clinical Microbiology & Bacteriology', sublabel: 'Culture, Sensitivity & Bacterial Staining', category: 'Microbiology & Infection' },
  { value: 'Virology', label: 'Virology & Viral Diagnostics', sublabel: 'Viral Load & Antibody Screenings', category: 'Microbiology & Infection' },
  { value: 'Parasitology & Mycology', label: 'Parasitology & Mycology', sublabel: 'Fungal & Parasitic Organism Audits', category: 'Microbiology & Infection' },

  { value: 'Radiology', label: 'Radiology & Diagnostic Imaging', sublabel: 'X-Ray, CT Scan, MRI & Fluoroscopy', category: 'Radiology & Imaging' },
  { value: 'Ultrasound', label: 'Ultrasound & Sonography', sublabel: 'Doppler Sonography & Scan Audits', category: 'Radiology & Imaging' },
  { value: 'Nuclear Medicine', label: 'Nuclear Medicine & Isotope Scans', sublabel: 'PET-CT & Radioisotope Diagnostics', category: 'Radiology & Imaging' },

  { value: 'Genomics', label: 'Genomics & DNA Sequencing', sublabel: 'NGS Sequencing & Genetic Variant Screen', category: 'Genomics & Molecular' },
  { value: 'Molecular Pathology', label: 'Molecular Pathology & RT-PCR', sublabel: 'Gene Expression & Viral PCR Assays', category: 'Genomics & Molecular' },
  { value: 'Cytogenetics', label: 'Cytogenetics & Karyotyping', sublabel: 'Chromosome Analysis & Genetic Audits', category: 'Genomics & Molecular' },

  { value: 'Biochemistry', label: 'Clinical Biochemistry & Metabolic', sublabel: 'Liver/Renal Panels & Enzyme Assays', category: 'Biochemistry & Pathology' },
  { value: 'Pathology', label: 'Histopathology & Tissue Audit', sublabel: 'Biopsy Slide Processing & Tissue Staining', category: 'Biochemistry & Pathology' },
  { value: 'Cytology', label: 'Cytology & Cancer Screening', sublabel: 'PAP Smears & FNAC Fluid Analysis', category: 'Biochemistry & Pathology' },
  { value: 'Toxicology', label: 'Toxicology & Drug Monitoring', sublabel: 'Therapeutic Drug Levels & Screen', category: 'Biochemistry & Pathology' },

  { value: 'Immunology', label: 'Clinical Immunology & Serology', sublabel: 'Autoimmune Panels & ELISA Assays', category: 'Immunology & Serology' },
  { value: 'Flow Cytometry', label: 'Flow Cytometry & Cellular Markers', sublabel: 'CD4/CD8 Count & Lymphoma Profiling', category: 'Immunology & Serology' },
];

// NURSE ASSIGNED HOSPITAL WARDS (Comprehensive hospital ward list)
export const NURSE_WARDS_OPTIONS: SelectOption[] = [
  { value: 'ICU Ward', label: 'ICU Ward (Intensive Care Unit)', sublabel: 'Critical Bedside Care & Ventilators', category: 'Critical & Intensive Care' },
  { value: 'NICU Ward', label: 'NICU Ward (Neonatal Intensive Care)', sublabel: 'Premature Infant & Newborn Triage', category: 'Critical & Intensive Care' },
  { value: 'CCU Ward', label: 'CCU Ward (Coronary Care Unit)', sublabel: 'Post-Cardiac Event Intensive Care', category: 'Critical & Intensive Care' },
  { value: 'Surgical ICU', label: 'Cardiothoracic Surgical ICU', sublabel: 'Post-Bypass & Open-Heart Recovery', category: 'Critical & Intensive Care' },

  { value: 'Emergency Ward', label: 'Emergency & Trauma Triage Ward', sublabel: 'ER Resuscitation & Acute Triage', category: 'Emergency & Acute Triage' },
  { value: 'Acute Resuscitation Unit', label: 'Acute Resuscitation Unit', sublabel: 'High-Dependency Emergency Ward', category: 'Emergency & Acute Triage' },
  { value: 'Burn Care Unit', label: 'Burn Care & Isolation Unit', sublabel: 'Specialized Sterile Wound Care', category: 'Emergency & Acute Triage' },

  { value: 'Post-Op Ward', label: 'Post-Op & Surgical Recovery Ward', sublabel: 'Post-Surgery Vitals & Pain Control', category: 'Surgical & Specialty' },
  { value: 'General Surgery Ward', label: 'General Surgery Ward', sublabel: 'Pre & Post Operative Patient Care', category: 'Surgical & Specialty' },
  { value: 'Orthopedic Ward', label: 'Orthopedic Recovery Ward', sublabel: 'Joint & Spine Rehabilitation Care', category: 'Surgical & Specialty' },
  { value: 'Oncology Ward', label: 'Oncology & Chemotherapy Ward', sublabel: 'Infusion Monitoring & Palliative Care', category: 'Surgical & Specialty' },

  { value: 'Pediatric Ward', label: 'Pediatric & Adolescent Ward', sublabel: 'Child Healthcare & Inpatient Nursing', category: 'Maternity & Pediatrics' },
  { value: 'Maternity Ward', label: 'Maternity & Labor Delivery Ward', sublabel: 'Labor Support & Obstetric Care', category: 'Maternity & Pediatrics' },

  { value: 'General Medical Ward', label: 'General Medical Ward', sublabel: 'Inpatient Medicine & Routine Vitals', category: 'General & Outpatient' },
  { value: 'Dialysis Unit', label: 'Dialysis & Renal Care Unit', sublabel: 'Hemodialysis Monitoring & Care', category: 'General & Outpatient' },
  { value: 'Isolation Ward', label: 'Isolation & Infectious Disease Ward', sublabel: 'Sterile Barrier & Infection Protocol', category: 'General & Outpatient' },
];

// PATIENT BLOOD GROUPS
export const BLOOD_GROUP_OPTIONS: SelectOption[] = [
  { value: 'O+', label: 'O Positive (O+)', sublabel: 'Universal Red Blood Cell Donor' },
  { value: 'A+', label: 'A Positive (A+)', sublabel: 'Can donate to A+ and AB+' },
  { value: 'B+', label: 'B Positive (B+)', sublabel: 'Can donate to B+ and AB+' },
  { value: 'AB+', label: 'AB Positive (AB+)', sublabel: 'Universal Plasma Recipient' },
  { value: 'O-', label: 'O Negative (O-)', sublabel: 'Universal Emergency Donor' },
  { value: 'A-', label: 'A Negative (A-)', sublabel: 'Can donate to A-, A+, AB-, AB+' },
  { value: 'B-', label: 'B Negative (B-)', sublabel: 'Can donate to B-, B+, AB-, AB+' },
  { value: 'AB-', label: 'AB Negative (AB-)', sublabel: 'Rare Blood Group Type' },
];
