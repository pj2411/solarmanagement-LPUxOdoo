export type ScreenId =
  | 'portal-dashboard'
  | 'operations-analytics'
  | 'quotation-engine'
  | 'site-survey-engineering'
  | 'installation-dispatch'
  | 'billing-payments'
  | 'service-warranty'
  | 'auth';

export type UserRole = 'Customer' | 'Technician' | 'Engineer' | 'Installer' | 'Admin';

export const HOTLINKED_IMAGES = {
  earthGlobe:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuByivwV0iJa-lGlaSlQumvNgOEsuyDSAspra_CgEr4aNe3me1qhjRb7Kx_qW-rk67e1iyylN29E7i0_h9kiP_l8uBG10av31gmzXF3ZUT3T4maM68Tvt5Sp48LYV1gkwIJPFfLtZn8hERD-c4-cSNkGT8zoH72UHsoM96l0Ur8b18fNoW3wr0mspP365ZSl0tanVFf0UcKmgj8EmYcX8fpcWCJpEFF3BRUVS_5ZllOJ',
  crewLeadMarcus:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBaO36Eaq9x0WRNxHXkWCl7em8Etjm41dahwsuiTlRFYZVJTgCQZbfeds50DA-lYJ0kbiTemDx0NH6bNE7teUGkST65XXfOWt6p6YxvazDyGWqZC42TAvkuqePI-Wf5wvy2gzLK27ZPJiGRw7-y8xqnmFqxoYg_69wcULFStv54fymuSeFZkVWBKi_DjUQTRGsp6GFn45bVBlELv2F-BD2cpfC_f1uMb8d_R94dnnmP',
  mountingRails:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCbQwSHSBGS7B0A3udzK2BJKw37pSr37Yh0jCvy51_SUXk_eE5kzB_bJVclaSYPBiFzA7D9p0MGJ7xG3iGSPDjrsp4vZxiAjXpcTekpjJ5sfRdILo5dW32qg1DQuesnFjxXmQsjaezHd7gOzp_tUF0QicMOBE_ZPjWe8Y58EwmVCaTfWdTX-U0lSnBVEzhC23G49WSB8vy9gnTTZX9DNvFcivHQy4KfanVQRt3Sv90e',
  pvArrayClamped:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDSBX552rfQjqJcR3wt2iJFo_hHmZwkf14N__icEAXNvdOwAqo43RSv7CIhdLiYReZK2fmldUBZjGle3yLQRVNUEpsom63a4MeZMsJnxnQuOw1mEQWj6EIwADxkDQCfxlr5DQJaHioolR9o5dxujtMVK0dnEqtrCBg8jSpx0iqCYayUOu_WKP8AH0DK--IflZmNeBGL8YenvSpzYHbpWrAcr8zphJfR9INJdk73ws-e',
  dcJunctionSpd:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBvByy0bw1jC884u8mkClp1eLSCpt43vWyUVjQQcxV2cr6pAV1G_NTTs5SVLwQWzspSC8BDQ6E3WNBsPAA7DCl8lb2Qmj-JSk_eivZC_Y9z1LAgqZCDhnDS2EwZUpP1u9v4eL24EXGP8pr770EBT0RjjNkIK1aZ_ES714QP5xVVGa_5WFT01wdB5MexkFL1G0xqqH8snjcDWA-3yI4uX2TWOfPI4UprqdzyxA2L8fKY',
  inverterTerminals:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDcb60r57hJ6nHQmWzxw1D4SpMUX_7nacP9FoS1A4z-2ui8a0gjTrA8QAnrfvvkEIwVTL1XkA6fhPaz3wVz5RZ3wwvLrzcyXBzCfkipGW-xTi79R47V7aNcheUr26-bmoiVmb_emwFPUNXwauYeYLP851f65UI8H4YqpnS-VyRqpz1v_ybKySk-QLnSWkloxGtY6UsNeHQNL__Amf6KDiaEDy5D0cQ9pESN_sCCk9ne',
  commissionedSiteAsset:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC4QBjrMeuabVLtxgE22cjmys57BGf2eoGX-FZIzOOknkaqRcZlZy_e95bNHyNRAWNcTcQrSZyVE2G9IDSbAEhcnf7a2a6DSkAJ3Hwgc8bnoaBkg1JlUg0IGJELQ5ROiLYfonv5YgcXOUnrY3yFDrtQKb-7UNXsfPWvYUTCcV4FQRb9ZpSgE0bV0CavdRkBCLyIDpSTdio5izOFuYMdjf2LQ83mabrpZLdJJTuvSyED',
  techAmitKumar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBTnb1zB3QE8sVCD0t5BZNw45sO1DbVzjmR9nfvb5Y_CtYU0z1kq-lwuYW_HFE8zp8UxpRDlz-L-30QkUVa3J0N5ZzoGA4jLbwq-qTN3k6GbJNtuOFPDhBoylxU3RntHSp_XBxf8S50fYYXB9QlcF2YVHeow6rbKaxRgcL8QS_8DxIwmfUzhEqW8d66TyEYm2RU1gmA2DpDO98kEOugewLIML98tDeCSKdqEmoJkWV5',
  techRameshPatel:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCwwcuUvB6KgQCt2nSH-7vs4ZPSiGfNIQVWpkRhLo7Ka9nPhq6r3UKmQWx5QDiPik2iIz2L1SXt5lO8U1AlYKZnhVBzbgL6ss7kCQasvCGYpOvpOUO4ZjXsJIlpasXHarY3UAtxmQ3HrR70fOwAxBoFRnTPfqJmedC4YIaCP7qlgODLpvc620liTVAoWUURQFAPpJVLSPH4M11Pq8s_rw2hS5x57x6DaUQfgb5cedZy',
  quoteAlmmPanels:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCIrjQ49kyMkypSt-fKNTOtZ9OdOQb5Smo0f9ebqe7eNVx1s-yPK8xN4fEc6lNWa9Do3bWmUH5xdpCZOlAZoJQbS6l2XDZik76sE_UhbjY1mFLzpSeqcqy9V-NsJrDTjtcMJm9fWCHIKaEzlMVvL2uZ-O72rO1mYLrjuFsEAoHH01SmQ5fIcukG5m6KK4pGrHsrByTzLpx-F_0kLCcF11SGEG3vf2lUmriWLBH9wb5E',
  quoteIotInverter:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDWSlFnzLpqYgW_4s_GMnUWuenBO-DDYBDYuYCn1W8qT3vTL6nmtCUwv6VMTJbhaP3pf8a0QfSDZzOrqM5iuau9-Dh5FtCGwXP7JuqdITBmfzTm9PBMrW9uOhTRvC3zSw3CyPFkTsvf2ykld31_EpPzhcS4WpvEI6ty4iK3kXuhjA75XtM9QkgXAiYZjioHAtblsEcAJkf4aaFDZxgSMxqXiO0mUI_kxqjlBKpQ8-qt',
  quoteAerialMapping:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDhlia3coxc9iH0fNkb9zr_XMASJMzkoyXYAzGTv9SlxAVbPDh4xCPOC5Ei5uvcXtsHIGHfJH4J_pwHIiKqrd_8LpN-VuOuyaXR0VBLyzElepc9DV67oC56xTWqeQZc8QD_rtQI4BoaJ-1A30upJpmok8dtCA7YrZ6NhJqQWtRiGDickMuKb0qJMf7vHvu2eRYAAtKKoHWjSBwvM0paHTYvWeAns1MRuIX4EFwvxcLW',
  surveyMarcusPortrait:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuChb795d63TfP37QHQz4taLQFXT2OcGXdukOWf_Votnq53mm5VFP211-FXuDwuOXo3PDwEPHlVKDQharkibLPgiI6qzIGMUxIzuGjSJ-RggSLoxFa7leKbPjC1NyWL9oBOu1GMPKoZi5L3vLilPdVlG1saiuqUPFgO4hzXPy-6vB0E2wm_JOw7cU643Qasja-eYa9NVt1umJfo10Mzv3-g-hB55NF2aXvC3smadpZ60',
  surveyDroneAerial:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAmCcYcascK2cW6FCiBFwhObb9ab7BuJuC3QjFMRY3l8nQjBwaJoGC3Zttzj0Z7dadEvJvWIYpc7Tj2y9flFItXf84hS0_JI1Ef-H4Gr8mr7YiLc5-JivSpKCoxr_7N28yftfoRsaKRAmyk_-JGY_1E01Sbym0a0TQyNSJbJ7xYJYYuNxoMUh3QQCwEXQrnh68Nzhjx9wpxE0xaRBF8g9F-E73glfHcHUOdIrdmmEep',
  surveyLtPanel:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDonSLyguw3njOmMeiFsg1YJmXRWwbOieqBW_hiLORgrAhBJ3qhlrjpJIeLkrpYGJ3o7nvm2EvC4jNFdRU_MALgukYKqE9uHFhzAWf24h2K31q0-NH4JSAbv_Nlps-GmNkQFpKJ7zOizo0RS3dqZWsXzfHa3ehsGdjrDwF_nBBdvELTnBO-GLMjGvZZ85A-vJDy32O8YfIilxr0RB3XnXkWnARFbgBaHP52D5pKwqcO',
  surveyAnchorTest:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAPSlQhmYBDZMVJRYfRCvJl9myxMm_zYtGEGrBHVZvXYhBUwqOp09orwdROgeFKvjw6bYz7oohuSRO6iA3V9CD14x4uMfQ8LsYiJyQ4Ws-w_a0KT5KYB90B0eKgYw_qW0JUj-yBkyMJoYTIkd0iQXxjjzI4inWmwfC2vaPlRKAPRwikmjbLrWPSHzYVJQmWi0LuUqrQwT2Xp6pSDR9RzPUwfBrw9-Cd-n17-X7dJDtd',
  surveyInverterWall:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAa5uqc1OyU-Gct61lhsNnxZOPqdSv8SF9W7K7wL2uOecne5_IdyTnolUtG77py58jcXDsB_GXumLDIqyRLu3apZHO37VHDOIQjwdPi6rA-DBTMN1J-ce3jWLqKuPry9Wy7iBbO01y6yrkMGQ0JXxYrap7Rq5xpuA4gYssqedqBWf6Q8Yb_cv__frq9tGhxk6bosJqGgEtYkjJC-S6yd-Aeqp69qmV2SsN86tT-X8jk',
} as const;

export interface SolarPackage {
  id: string;
  tierLabel: string;
  badgeLabel: string;
  title: string;
  description: string;
  specs: string[];
  netEstimate: string;
  grossStrike?: string;
  featured?: boolean;
  systemSelectValue: string;
}

export const SOLAR_PACKAGES: SolarPackage[] = [
  {
    id: '3kw-ecosync',
    tierLabel: 'Residential Starter',
    badgeLabel: 'On-Grid',
    title: '3kW EcoSync Pro',
    description: 'Perfect for 2-3 BHK homes consuming 300-450 units/month.',
    specs: [
      '6x 550W Mono PERC Half-Cut',
      '3kW 98.4% Efficiency Inverter',
      'Direct MNRE ₹78,000 Subsidy',
      '270 sq.ft roof space required',
    ],
    netEstimate: '₹1,12,000',
    grossStrike: '₹1,90,000',
    systemSelectValue: '3kW On-Grid Rooftop System (EcoSync)',
  },
  {
    id: '5kw-masterpower',
    tierLabel: 'Family Independent',
    badgeLabel: 'On-Grid Max',
    title: '5kW MasterPower',
    description: 'Cuts 85–95% of typical villa and multi-AC home electricity bills.',
    specs: [
      '9x 550W Bi-Facial TOPCon Panels',
      'Dual-MPPT Intelligent Inverter',
      'Direct MNRE ₹78,000 Subsidy',
      '420 sq.ft roof space required',
    ],
    netEstimate: '₹1,92,000',
    grossStrike: '₹2,70,000',
    featured: true,
    systemSelectValue: '5kW On-Grid MasterPower System',
  },
  {
    id: '5kw-hybrid',
    tierLabel: 'Uninterrupted Power',
    badgeLabel: 'Hybrid + LFP',
    title: '5kW SolarVault Hybrid',
    description: 'Seamless backup during grid cuts + export surplus to the DISCOM.',
    specs: [
      '9x 550W Tier-1 Panels',
      '5kW Hybrid Inverter + 5kWh LiFePO4',
      '10ms UPS grade power transfer',
      '450 sq.ft roof space required',
    ],
    netEstimate: '₹3,45,000',
    systemSelectValue: '5kW Hybrid Smart Inverter with Battery',
  },
];

export const CAPACITY_TABLE_ROWS = [
  { system: '1 kW Micro', roof: '~100 sq.ft', units: '120–140 kWh', subsidy: '₹30,000', net: '₹45,000 – ₹55,000' },
  { system: '2 kW Standard', roof: '~180 sq.ft', units: '240–280 kWh', subsidy: '₹60,000', net: '₹75,000 – ₹85,000' },
  { system: '3 kW Prime', roof: '~270 sq.ft', units: '360–420 kWh', subsidy: '₹78,000', net: '₹1,05,000 – ₹1,20,000', highlight: true },
  { system: '5 kW Villa', roof: '~450 sq.ft', units: '600–700 kWh', subsidy: '₹78,000', net: '₹1,85,000 – ₹2,10,000' },
  { system: '10 kW Commercial', roof: '~900 sq.ft', units: '1,200–1,400 kWh', subsidy: 'Custom / Tax Deprec.', net: '₹4,10,000 – ₹4,60,000' },
];

export interface HardwareRegistryItem {
  id: string;
  spec: string;
  subSpec: string;
  serialRange: string;
  verification: string;
  verifIcon: string;
  qualityGate: string;
  status: string;
  verified: boolean;
}

export const INITIAL_HARDWARE_REGISTRY: HardwareRegistryItem[] = [
  {
    id: 'hw-1',
    spec: '10x Monocrystalline PV Modules',
    subSpec: '545W Mono-PERC Tier-1 Bifacial Array',
    serialRange: 'PAN-882190 → PAN-882200',
    verification: 'QR Verified (10/10)',
    verifIcon: 'qr_code',
    qualityGate: 'EL Crack Passed',
    status: 'Staged On-Roof',
    verified: true,
  },
  {
    id: 'hw-2',
    spec: '1x 5kW SolarEdge String Inverter',
    subSpec: 'Single-Phase HD-Wave Technology • Wi-Fi Gateway',
    serialRange: 'INV-SE-9004812',
    verification: 'Firmware v4.12',
    verifIcon: 'cpu',
    qualityGate: 'Isolation 100% OK',
    status: 'Ready for Mount',
    verified: true,
  },
  {
    id: 'hw-3',
    spec: '1x Bi-Directional Discom Smart Meter',
    subSpec: 'Optical Port + 4G SIM Net Metering Unit',
    serialRange: 'MTR-DIS-33918',
    verification: 'DISCOM Lab Sealed',
    verifIcon: 'check',
    qualityGate: 'Accuracy Cl 0.5s',
    status: 'Custody Handover',
    verified: true,
  },
  {
    id: 'hw-4',
    spec: '1x DC Surge Protection Device (SPD)',
    subSpec: 'Type II 1000V DC Photovoltaic SPD with Pluggable Cartridges',
    serialRange: 'SPD-DC-T2-4418',
    verification: 'Barcode Verified',
    verifIcon: 'barcode',
    qualityGate: 'MOV Visual Green',
    status: 'In Enclosure DB',
    verified: true,
  },
];

export interface ServiceTicket {
  id: string;
  issueType: string;
  issueSub: string;
  customerName: string;
  capacityLocation: string;
  technician: string;
  technicianInitials: string;
  slaClock: string;
  status: 'Dispatched' | 'Resolved' | 'Investigation';
  statusLabel: string;
  severity: 'Low' | 'Medium' | 'High Priority';
}

export const INITIAL_SERVICE_TICKETS: ServiceTicket[] = [
  {
    id: '#TCK-8812',
    issueType: 'Annual Preventive Maint.',
    issueSub: 'Dust wash & bolt torque',
    customerName: 'Marcus Reed',
    capacityLocation: '5 kW · Vasant Kunj',
    technician: 'Amit Kumar',
    technicianInitials: 'AK',
    slaClock: '4h 18m left',
    status: 'Dispatched',
    statusLabel: 'Dispatched (2:00 PM)',
    severity: 'Medium',
  },
  {
    id: '#TCK-8790',
    issueType: 'Wi-Fi Dongle Re-pairing',
    issueSub: 'SSID router change',
    customerName: 'Sarah Jenkins',
    capacityLocation: '3 kW · Noida Sec-62',
    technician: 'Vikas Tiwari',
    technicianInitials: 'VT',
    slaClock: 'Completed (1h 12m)',
    status: 'Resolved',
    statusLabel: 'Resolved & Closed',
    severity: 'Low',
  },
  {
    id: '#TCK-8774',
    issueType: 'Net Meter Discrepancy',
    issueSub: 'BRPL export sync',
    customerName: 'Deepak Singhania',
    capacityLocation: '10 kW · DLF Phase 2',
    technician: 'Ramesh Patel',
    technicianInitials: 'RP',
    slaClock: 'DISCOM Review',
    status: 'Investigation',
    statusLabel: 'Under Investigation',
    severity: 'High Priority',
  },
];

export const SURVEY_PHOTOS = [
  {
    id: 'drone-scan',
    title: 'Drone Aerial Scan',
    meta: 'GEO: 28.5355° N, 77.2410° E',
    src: HOTLINKED_IMAGES.surveyDroneAerial,
    alt: 'Aerial drone view of a suburban concrete flat rooftop with parapet walls and open shadow-free space',
  },
  {
    id: 'lt-panel',
    title: 'Main LT Panel',
    meta: 'Busbar: 63A 3-Phase',
    src: HOTLINKED_IMAGES.surveyLtPanel,
    alt: 'Electrical distribution switchboard box with circuit breakers and DISCOM net meter cutouts',
  },
  {
    id: 'anchor-test',
    title: 'Anchor Testing',
    meta: 'Hilti M12 Chemical Anchor',
    src: HOTLINKED_IMAGES.surveyAnchorTest,
    alt: 'Reinforced concrete terrace slab with drilled anchor fasteners and galvanized mounting leg base',
  },
  {
    id: 'inverter-wall',
    title: 'Inverter Wall Zone',
    meta: 'IP65 Weather Cover OK',
    src: HOTLINKED_IMAGES.surveyInverterWall,
    alt: 'Shaded weatherproof masonry wall designated for inverter mounting with cable tray clearances',
  },
];

export const INSTALLATION_PROGRESS_PHOTOS = [
  {
    id: 'inst-rails',
    title: 'Mounting Rails',
    meta: '09:15 AM · 100% Complete',
    src: HOTLINKED_IMAGES.mountingRails,
    alt: 'Aluminum solar roof mounting rails bolted securely onto residential flat concrete rooftop',
  },
  {
    id: 'inst-panels',
    title: 'PV Array Clamped',
    meta: '11:40 AM · 10 Panels',
    src: HOTLINKED_IMAGES.pvArrayClamped,
    alt: 'Monocrystalline black solar panels aligned on rooftop mounting structure',
  },
  {
    id: 'inst-junction',
    title: 'DC Junction & SPD',
    meta: '01:05 PM · Cable Tagged',
    src: HOTLINKED_IMAGES.dcJunctionSpd,
    alt: 'Industrial electrical junction box and DC disconnect switch installed on exterior wall',
  },
  {
    id: 'inst-inverter',
    title: 'Inverter Terminals',
    meta: '02:18 PM · Live Feed',
    src: HOTLINKED_IMAGES.inverterTerminals,
    alt: 'Solar technician testing terminals on a modern wall-mounted solar inverter with multimeter',
  },
];
