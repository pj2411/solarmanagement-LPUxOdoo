/**
 * Comprehensive Synthetic Datasets for SunPower ERP
 * Covers Modules 1 through 13 with realistic Indian Rooftop Solar Engineering Data.
 */

export const DEFAULT_INVENTORY = [
  {
    "sku": "BAT-TUB-150AH",
    "name": "150Ah C10 Tall Tubular Solar Battery",
    "category": "BATTERIES",
    "unit_cost_inr": 11000.0,
    "selling_price_inr": 14500.0,
    "stock_qty": 185,
    "reorder_threshold": 10,
    "id": 8
  },
  {
    "sku": "BAT-LI-200AH",
    "name": "48V 100Ah (5kWh) Wall-Mount LiFePO4 Battery Pack",
    "category": "BATTERIES",
    "unit_cost_inr": 72000.0,
    "selling_price_inr": 95000.0,
    "stock_qty": 9,
    "reorder_threshold": 3,
    "id": 9
  },
  {
    "sku": "INV-GT-1KW",
    "name": "1kW Single-Phase Grid-Tie String Inverter",
    "category": "INVERTERS",
    "unit_cost_inr": 14000.0,
    "selling_price_inr": 18500.0,
    "stock_qty": 18,
    "reorder_threshold": 5,
    "id": 3
  },
  {
    "sku": "INV-GT-3KW",
    "name": "3kW Smart Grid-Tie Inverter with WiFi Dongle",
    "category": "INVERTERS",
    "unit_cost_inr": 24000.0,
    "selling_price_inr": 32000.0,
    "stock_qty": 24,
    "reorder_threshold": 6,
    "id": 4
  },
  {
    "sku": "INV-GT-5KW",
    "name": "5kW High-Efficiency Dual MPPT On-Grid Inverter",
    "category": "INVERTERS",
    "unit_cost_inr": 36000.0,
    "selling_price_inr": 48000.0,
    "stock_qty": 14,
    "reorder_threshold": 5,
    "id": 5
  },
  {
    "sku": "INV-HYB-3KW",
    "name": "3kW Hybrid Off-Grid/On-Grid Solar Inverter",
    "category": "INVERTERS",
    "unit_cost_inr": 32000.0,
    "selling_price_inr": 42000.0,
    "stock_qty": 12,
    "reorder_threshold": 4,
    "id": 6
  },
  {
    "sku": "INV-HYB-5KW",
    "name": "5kW Solar Hybrid Inverter 48V Pure Sine Wave",
    "category": "INVERTERS",
    "unit_cost_inr": 48000.0,
    "selling_price_inr": 62000.0,
    "stock_qty": 8,
    "reorder_threshold": 4,
    "id": 7
  },
  {
    "sku": "STR-HDG-4P",
    "name": "Hot-Dip Galvanized Elevated Structure (4 Panels)",
    "category": "MOUNTING_STRUCTURES",
    "unit_cost_inr": 4200.0,
    "selling_price_inr": 6000.0,
    "stock_qty": 60,
    "reorder_threshold": 15,
    "id": 10
  },
  {
    "sku": "STR-AL-TILT",
    "name": "Anodized Aluminum Universal Roof Rail & Clamps Kit",
    "category": "MOUNTING_STRUCTURES",
    "unit_cost_inr": 2800.0,
    "selling_price_inr": 4000.0,
    "stock_qty": 80,
    "reorder_threshold": 20,
    "id": 11
  },
  {
    "sku": "PNL-MONO-540W",
    "name": "540W Mono-PERC Half-Cut Tier-1 Solar Panel",
    "category": "PANELS",
    "unit_cost_inr": 11500.0,
    "selling_price_inr": 14800.0,
    "stock_qty": 980,
    "reorder_threshold": 30,
    "id": 1
  },
  {
    "sku": "PNL-POLY-330W",
    "name": "330W Polycrystalline Solar Panel",
    "category": "PANELS",
    "unit_cost_inr": 7200.0,
    "selling_price_inr": 9200.0,
    "stock_qty": 95,
    "reorder_threshold": 20,
    "id": 2
  },
  {
    "sku": "SAF-EARTH-2M",
    "name": "2 Meter Copper-Bonded Chemical Earthing Electrode Kit",
    "category": "SAFETY_EQUIPMENT",
    "unit_cost_inr": 2600.0,
    "selling_price_inr": 3900.0,
    "stock_qty": 45,
    "reorder_threshold": 12,
    "id": 15
  },
  {
    "sku": "SAF-LA-COPPER",
    "name": "Pure Copper Lightning Arrestor Spike with Base & Counter",
    "category": "SAFETY_EQUIPMENT",
    "unit_cost_inr": 3400.0,
    "selling_price_inr": 5200.0,
    "stock_qty": 30,
    "reorder_threshold": 10,
    "id": 16
  },
  {
    "sku": "CAB-DC-4MM",
    "name": "4 sq.mm UV-Resistant Dual-Insulated Copper DC Cable (100m)",
    "category": "WIRES_CONNECTORS",
    "unit_cost_inr": 3200.0,
    "selling_price_inr": 4800.0,
    "stock_qty": 40,
    "reorder_threshold": 10,
    "id": 12
  },
  {
    "sku": "CON-MC4-P10",
    "name": "IP68 Waterproof MC4 Male/Female Connector Set (10 Pairs)",
    "category": "WIRES_CONNECTORS",
    "unit_cost_inr": 650.0,
    "selling_price_inr": 1100.0,
    "stock_qty": 110,
    "reorder_threshold": 25,
    "id": 13
  },
  {
    "sku": "BOX-ACDC-SPD",
    "name": "Pre-wired ACDB + DCDB Box with Type-II Surge Protection",
    "category": "WIRES_CONNECTORS",
    "unit_cost_inr": 4800.0,
    "selling_price_inr": 6800.0,
    "stock_qty": 22,
    "reorder_threshold": 8,
    "id": 14
  }
];

export const DEFAULT_BOM_TEMPLATES = [
  {
    "id": 1,
    "capacity_kw": 1.0,
    "system_type": "ON_GRID",
    "installation_charge_inr": 12000.0,
    "description": "1 kW Rooftop On-Grid Solar Package",
    "items": [
      {
        "id": 1,
        "template_id": 1,
        "inventory_item_id": 1,
        "quantity": 2,
        "inventory_item": {
          "sku": "PNL-MONO-540W",
          "name": "540W Mono-PERC Half-Cut Tier-1 Solar Panel",
          "category": "PANELS",
          "unit_cost_inr": 11500.0,
          "selling_price_inr": 14800.0,
          "stock_qty": 980,
          "reorder_threshold": 30,
          "id": 1
        }
      },
      {
        "id": 2,
        "template_id": 1,
        "inventory_item_id": 3,
        "quantity": 1,
        "inventory_item": {
          "sku": "INV-GT-1KW",
          "name": "1kW Single-Phase Grid-Tie String Inverter",
          "category": "INVERTERS",
          "unit_cost_inr": 14000.0,
          "selling_price_inr": 18500.0,
          "stock_qty": 18,
          "reorder_threshold": 5,
          "id": 3
        }
      },
      {
        "id": 3,
        "template_id": 1,
        "inventory_item_id": 10,
        "quantity": 1,
        "inventory_item": {
          "sku": "STR-HDG-4P",
          "name": "Hot-Dip Galvanized Elevated Structure (4 Panels)",
          "category": "MOUNTING_STRUCTURES",
          "unit_cost_inr": 4200.0,
          "selling_price_inr": 6000.0,
          "stock_qty": 60,
          "reorder_threshold": 15,
          "id": 10
        }
      },
      {
        "id": 4,
        "template_id": 1,
        "inventory_item_id": 12,
        "quantity": 1,
        "inventory_item": {
          "sku": "CAB-DC-4MM",
          "name": "4 sq.mm UV-Resistant Dual-Insulated Copper DC Cable (100m)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 3200.0,
          "selling_price_inr": 4800.0,
          "stock_qty": 40,
          "reorder_threshold": 10,
          "id": 12
        }
      },
      {
        "id": 5,
        "template_id": 1,
        "inventory_item_id": 13,
        "quantity": 1,
        "inventory_item": {
          "sku": "CON-MC4-P10",
          "name": "IP68 Waterproof MC4 Male/Female Connector Set (10 Pairs)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 650.0,
          "selling_price_inr": 1100.0,
          "stock_qty": 110,
          "reorder_threshold": 25,
          "id": 13
        }
      },
      {
        "id": 6,
        "template_id": 1,
        "inventory_item_id": 14,
        "quantity": 1,
        "inventory_item": {
          "sku": "BOX-ACDC-SPD",
          "name": "Pre-wired ACDB + DCDB Box with Type-II Surge Protection",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 4800.0,
          "selling_price_inr": 6800.0,
          "stock_qty": 22,
          "reorder_threshold": 8,
          "id": 14
        }
      },
      {
        "id": 7,
        "template_id": 1,
        "inventory_item_id": 15,
        "quantity": 1,
        "inventory_item": {
          "sku": "SAF-EARTH-2M",
          "name": "2 Meter Copper-Bonded Chemical Earthing Electrode Kit",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 2600.0,
          "selling_price_inr": 3900.0,
          "stock_qty": 45,
          "reorder_threshold": 12,
          "id": 15
        }
      },
      {
        "id": 8,
        "template_id": 1,
        "inventory_item_id": 16,
        "quantity": 1,
        "inventory_item": {
          "sku": "SAF-LA-COPPER",
          "name": "Pure Copper Lightning Arrestor Spike with Base & Counter",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 3400.0,
          "selling_price_inr": 5200.0,
          "stock_qty": 30,
          "reorder_threshold": 10,
          "id": 16
        }
      }
    ]
  },
  {
    "id": 2,
    "capacity_kw": 2.0,
    "system_type": "ON_GRID",
    "installation_charge_inr": 15000.0,
    "description": "2 kW Rooftop On-Grid Solar Package",
    "items": [
      {
        "id": 9,
        "template_id": 2,
        "inventory_item_id": 1,
        "quantity": 4,
        "inventory_item": {
          "sku": "PNL-MONO-540W",
          "name": "540W Mono-PERC Half-Cut Tier-1 Solar Panel",
          "category": "PANELS",
          "unit_cost_inr": 11500.0,
          "selling_price_inr": 14800.0,
          "stock_qty": 980,
          "reorder_threshold": 30,
          "id": 1
        }
      },
      {
        "id": 10,
        "template_id": 2,
        "inventory_item_id": 4,
        "quantity": 1,
        "inventory_item": {
          "sku": "INV-GT-3KW",
          "name": "3kW Smart Grid-Tie Inverter with WiFi Dongle",
          "category": "INVERTERS",
          "unit_cost_inr": 24000.0,
          "selling_price_inr": 32000.0,
          "stock_qty": 24,
          "reorder_threshold": 6,
          "id": 4
        }
      },
      {
        "id": 11,
        "template_id": 2,
        "inventory_item_id": 10,
        "quantity": 1,
        "inventory_item": {
          "sku": "STR-HDG-4P",
          "name": "Hot-Dip Galvanized Elevated Structure (4 Panels)",
          "category": "MOUNTING_STRUCTURES",
          "unit_cost_inr": 4200.0,
          "selling_price_inr": 6000.0,
          "stock_qty": 60,
          "reorder_threshold": 15,
          "id": 10
        }
      },
      {
        "id": 12,
        "template_id": 2,
        "inventory_item_id": 12,
        "quantity": 1,
        "inventory_item": {
          "sku": "CAB-DC-4MM",
          "name": "4 sq.mm UV-Resistant Dual-Insulated Copper DC Cable (100m)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 3200.0,
          "selling_price_inr": 4800.0,
          "stock_qty": 40,
          "reorder_threshold": 10,
          "id": 12
        }
      },
      {
        "id": 13,
        "template_id": 2,
        "inventory_item_id": 13,
        "quantity": 2,
        "inventory_item": {
          "sku": "CON-MC4-P10",
          "name": "IP68 Waterproof MC4 Male/Female Connector Set (10 Pairs)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 650.0,
          "selling_price_inr": 1100.0,
          "stock_qty": 110,
          "reorder_threshold": 25,
          "id": 13
        }
      },
      {
        "id": 14,
        "template_id": 2,
        "inventory_item_id": 14,
        "quantity": 1,
        "inventory_item": {
          "sku": "BOX-ACDC-SPD",
          "name": "Pre-wired ACDB + DCDB Box with Type-II Surge Protection",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 4800.0,
          "selling_price_inr": 6800.0,
          "stock_qty": 22,
          "reorder_threshold": 8,
          "id": 14
        }
      },
      {
        "id": 15,
        "template_id": 2,
        "inventory_item_id": 15,
        "quantity": 2,
        "inventory_item": {
          "sku": "SAF-EARTH-2M",
          "name": "2 Meter Copper-Bonded Chemical Earthing Electrode Kit",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 2600.0,
          "selling_price_inr": 3900.0,
          "stock_qty": 45,
          "reorder_threshold": 12,
          "id": 15
        }
      },
      {
        "id": 16,
        "template_id": 2,
        "inventory_item_id": 16,
        "quantity": 1,
        "inventory_item": {
          "sku": "SAF-LA-COPPER",
          "name": "Pure Copper Lightning Arrestor Spike with Base & Counter",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 3400.0,
          "selling_price_inr": 5200.0,
          "stock_qty": 30,
          "reorder_threshold": 10,
          "id": 16
        }
      }
    ]
  },
  {
    "id": 3,
    "capacity_kw": 3.0,
    "system_type": "ON_GRID",
    "installation_charge_inr": 18000.0,
    "description": "3 kW Rooftop On-Grid Solar Package (PM Surya Ghar Subsidy Eligible)",
    "items": [
      {
        "id": 17,
        "template_id": 3,
        "inventory_item_id": 1,
        "quantity": 6,
        "inventory_item": {
          "sku": "PNL-MONO-540W",
          "name": "540W Mono-PERC Half-Cut Tier-1 Solar Panel",
          "category": "PANELS",
          "unit_cost_inr": 11500.0,
          "selling_price_inr": 14800.0,
          "stock_qty": 980,
          "reorder_threshold": 30,
          "id": 1
        }
      },
      {
        "id": 18,
        "template_id": 3,
        "inventory_item_id": 4,
        "quantity": 1,
        "inventory_item": {
          "sku": "INV-GT-3KW",
          "name": "3kW Smart Grid-Tie Inverter with WiFi Dongle",
          "category": "INVERTERS",
          "unit_cost_inr": 24000.0,
          "selling_price_inr": 32000.0,
          "stock_qty": 24,
          "reorder_threshold": 6,
          "id": 4
        }
      },
      {
        "id": 19,
        "template_id": 3,
        "inventory_item_id": 10,
        "quantity": 2,
        "inventory_item": {
          "sku": "STR-HDG-4P",
          "name": "Hot-Dip Galvanized Elevated Structure (4 Panels)",
          "category": "MOUNTING_STRUCTURES",
          "unit_cost_inr": 4200.0,
          "selling_price_inr": 6000.0,
          "stock_qty": 60,
          "reorder_threshold": 15,
          "id": 10
        }
      },
      {
        "id": 20,
        "template_id": 3,
        "inventory_item_id": 12,
        "quantity": 1,
        "inventory_item": {
          "sku": "CAB-DC-4MM",
          "name": "4 sq.mm UV-Resistant Dual-Insulated Copper DC Cable (100m)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 3200.0,
          "selling_price_inr": 4800.0,
          "stock_qty": 40,
          "reorder_threshold": 10,
          "id": 12
        }
      },
      {
        "id": 21,
        "template_id": 3,
        "inventory_item_id": 13,
        "quantity": 2,
        "inventory_item": {
          "sku": "CON-MC4-P10",
          "name": "IP68 Waterproof MC4 Male/Female Connector Set (10 Pairs)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 650.0,
          "selling_price_inr": 1100.0,
          "stock_qty": 110,
          "reorder_threshold": 25,
          "id": 13
        }
      },
      {
        "id": 22,
        "template_id": 3,
        "inventory_item_id": 14,
        "quantity": 1,
        "inventory_item": {
          "sku": "BOX-ACDC-SPD",
          "name": "Pre-wired ACDB + DCDB Box with Type-II Surge Protection",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 4800.0,
          "selling_price_inr": 6800.0,
          "stock_qty": 22,
          "reorder_threshold": 8,
          "id": 14
        }
      },
      {
        "id": 23,
        "template_id": 3,
        "inventory_item_id": 15,
        "quantity": 2,
        "inventory_item": {
          "sku": "SAF-EARTH-2M",
          "name": "2 Meter Copper-Bonded Chemical Earthing Electrode Kit",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 2600.0,
          "selling_price_inr": 3900.0,
          "stock_qty": 45,
          "reorder_threshold": 12,
          "id": 15
        }
      },
      {
        "id": 24,
        "template_id": 3,
        "inventory_item_id": 16,
        "quantity": 1,
        "inventory_item": {
          "sku": "SAF-LA-COPPER",
          "name": "Pure Copper Lightning Arrestor Spike with Base & Counter",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 3400.0,
          "selling_price_inr": 5200.0,
          "stock_qty": 30,
          "reorder_threshold": 10,
          "id": 16
        }
      }
    ]
  },
  {
    "id": 4,
    "capacity_kw": 4.0,
    "system_type": "ON_GRID",
    "installation_charge_inr": 22000.0,
    "description": "4 kW Rooftop On-Grid Solar Package",
    "items": [
      {
        "id": 25,
        "template_id": 4,
        "inventory_item_id": 1,
        "quantity": 8,
        "inventory_item": {
          "sku": "PNL-MONO-540W",
          "name": "540W Mono-PERC Half-Cut Tier-1 Solar Panel",
          "category": "PANELS",
          "unit_cost_inr": 11500.0,
          "selling_price_inr": 14800.0,
          "stock_qty": 980,
          "reorder_threshold": 30,
          "id": 1
        }
      },
      {
        "id": 26,
        "template_id": 4,
        "inventory_item_id": 5,
        "quantity": 1,
        "inventory_item": {
          "sku": "INV-GT-5KW",
          "name": "5kW High-Efficiency Dual MPPT On-Grid Inverter",
          "category": "INVERTERS",
          "unit_cost_inr": 36000.0,
          "selling_price_inr": 48000.0,
          "stock_qty": 14,
          "reorder_threshold": 5,
          "id": 5
        }
      },
      {
        "id": 27,
        "template_id": 4,
        "inventory_item_id": 10,
        "quantity": 2,
        "inventory_item": {
          "sku": "STR-HDG-4P",
          "name": "Hot-Dip Galvanized Elevated Structure (4 Panels)",
          "category": "MOUNTING_STRUCTURES",
          "unit_cost_inr": 4200.0,
          "selling_price_inr": 6000.0,
          "stock_qty": 60,
          "reorder_threshold": 15,
          "id": 10
        }
      },
      {
        "id": 28,
        "template_id": 4,
        "inventory_item_id": 12,
        "quantity": 2,
        "inventory_item": {
          "sku": "CAB-DC-4MM",
          "name": "4 sq.mm UV-Resistant Dual-Insulated Copper DC Cable (100m)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 3200.0,
          "selling_price_inr": 4800.0,
          "stock_qty": 40,
          "reorder_threshold": 10,
          "id": 12
        }
      },
      {
        "id": 29,
        "template_id": 4,
        "inventory_item_id": 13,
        "quantity": 3,
        "inventory_item": {
          "sku": "CON-MC4-P10",
          "name": "IP68 Waterproof MC4 Male/Female Connector Set (10 Pairs)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 650.0,
          "selling_price_inr": 1100.0,
          "stock_qty": 110,
          "reorder_threshold": 25,
          "id": 13
        }
      },
      {
        "id": 30,
        "template_id": 4,
        "inventory_item_id": 14,
        "quantity": 1,
        "inventory_item": {
          "sku": "BOX-ACDC-SPD",
          "name": "Pre-wired ACDB + DCDB Box with Type-II Surge Protection",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 4800.0,
          "selling_price_inr": 6800.0,
          "stock_qty": 22,
          "reorder_threshold": 8,
          "id": 14
        }
      },
      {
        "id": 31,
        "template_id": 4,
        "inventory_item_id": 15,
        "quantity": 2,
        "inventory_item": {
          "sku": "SAF-EARTH-2M",
          "name": "2 Meter Copper-Bonded Chemical Earthing Electrode Kit",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 2600.0,
          "selling_price_inr": 3900.0,
          "stock_qty": 45,
          "reorder_threshold": 12,
          "id": 15
        }
      },
      {
        "id": 32,
        "template_id": 4,
        "inventory_item_id": 16,
        "quantity": 1,
        "inventory_item": {
          "sku": "SAF-LA-COPPER",
          "name": "Pure Copper Lightning Arrestor Spike with Base & Counter",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 3400.0,
          "selling_price_inr": 5200.0,
          "stock_qty": 30,
          "reorder_threshold": 10,
          "id": 16
        }
      }
    ]
  },
  {
    "id": 5,
    "capacity_kw": 5.0,
    "system_type": "ON_GRID",
    "installation_charge_inr": 26000.0,
    "description": "5 kW High Capacity On-Grid Solar Package",
    "items": [
      {
        "id": 33,
        "template_id": 5,
        "inventory_item_id": 1,
        "quantity": 10,
        "inventory_item": {
          "sku": "PNL-MONO-540W",
          "name": "540W Mono-PERC Half-Cut Tier-1 Solar Panel",
          "category": "PANELS",
          "unit_cost_inr": 11500.0,
          "selling_price_inr": 14800.0,
          "stock_qty": 980,
          "reorder_threshold": 30,
          "id": 1
        }
      },
      {
        "id": 34,
        "template_id": 5,
        "inventory_item_id": 5,
        "quantity": 1,
        "inventory_item": {
          "sku": "INV-GT-5KW",
          "name": "5kW High-Efficiency Dual MPPT On-Grid Inverter",
          "category": "INVERTERS",
          "unit_cost_inr": 36000.0,
          "selling_price_inr": 48000.0,
          "stock_qty": 14,
          "reorder_threshold": 5,
          "id": 5
        }
      },
      {
        "id": 35,
        "template_id": 5,
        "inventory_item_id": 10,
        "quantity": 3,
        "inventory_item": {
          "sku": "STR-HDG-4P",
          "name": "Hot-Dip Galvanized Elevated Structure (4 Panels)",
          "category": "MOUNTING_STRUCTURES",
          "unit_cost_inr": 4200.0,
          "selling_price_inr": 6000.0,
          "stock_qty": 60,
          "reorder_threshold": 15,
          "id": 10
        }
      },
      {
        "id": 36,
        "template_id": 5,
        "inventory_item_id": 12,
        "quantity": 2,
        "inventory_item": {
          "sku": "CAB-DC-4MM",
          "name": "4 sq.mm UV-Resistant Dual-Insulated Copper DC Cable (100m)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 3200.0,
          "selling_price_inr": 4800.0,
          "stock_qty": 40,
          "reorder_threshold": 10,
          "id": 12
        }
      },
      {
        "id": 37,
        "template_id": 5,
        "inventory_item_id": 13,
        "quantity": 3,
        "inventory_item": {
          "sku": "CON-MC4-P10",
          "name": "IP68 Waterproof MC4 Male/Female Connector Set (10 Pairs)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 650.0,
          "selling_price_inr": 1100.0,
          "stock_qty": 110,
          "reorder_threshold": 25,
          "id": 13
        }
      },
      {
        "id": 38,
        "template_id": 5,
        "inventory_item_id": 14,
        "quantity": 1,
        "inventory_item": {
          "sku": "BOX-ACDC-SPD",
          "name": "Pre-wired ACDB + DCDB Box with Type-II Surge Protection",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 4800.0,
          "selling_price_inr": 6800.0,
          "stock_qty": 22,
          "reorder_threshold": 8,
          "id": 14
        }
      },
      {
        "id": 39,
        "template_id": 5,
        "inventory_item_id": 15,
        "quantity": 3,
        "inventory_item": {
          "sku": "SAF-EARTH-2M",
          "name": "2 Meter Copper-Bonded Chemical Earthing Electrode Kit",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 2600.0,
          "selling_price_inr": 3900.0,
          "stock_qty": 45,
          "reorder_threshold": 12,
          "id": 15
        }
      },
      {
        "id": 40,
        "template_id": 5,
        "inventory_item_id": 16,
        "quantity": 1,
        "inventory_item": {
          "sku": "SAF-LA-COPPER",
          "name": "Pure Copper Lightning Arrestor Spike with Base & Counter",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 3400.0,
          "selling_price_inr": 5200.0,
          "stock_qty": 30,
          "reorder_threshold": 10,
          "id": 16
        }
      }
    ]
  },
  {
    "id": 6,
    "capacity_kw": 1.0,
    "system_type": "OFF_GRID",
    "installation_charge_inr": 16000.0,
    "description": "1 kW Off-Grid Solar Package with Battery Backup",
    "items": [
      {
        "id": 41,
        "template_id": 6,
        "inventory_item_id": 1,
        "quantity": 2,
        "inventory_item": {
          "sku": "PNL-MONO-540W",
          "name": "540W Mono-PERC Half-Cut Tier-1 Solar Panel",
          "category": "PANELS",
          "unit_cost_inr": 11500.0,
          "selling_price_inr": 14800.0,
          "stock_qty": 980,
          "reorder_threshold": 30,
          "id": 1
        }
      },
      {
        "id": 42,
        "template_id": 6,
        "inventory_item_id": 6,
        "quantity": 1,
        "inventory_item": {
          "sku": "INV-HYB-3KW",
          "name": "3kW Hybrid Off-Grid/On-Grid Solar Inverter",
          "category": "INVERTERS",
          "unit_cost_inr": 32000.0,
          "selling_price_inr": 42000.0,
          "stock_qty": 12,
          "reorder_threshold": 4,
          "id": 6
        }
      },
      {
        "id": 43,
        "template_id": 6,
        "inventory_item_id": 8,
        "quantity": 1,
        "inventory_item": {
          "sku": "BAT-TUB-150AH",
          "name": "150Ah C10 Tall Tubular Solar Battery",
          "category": "BATTERIES",
          "unit_cost_inr": 11000.0,
          "selling_price_inr": 14500.0,
          "stock_qty": 185,
          "reorder_threshold": 10,
          "id": 8
        }
      },
      {
        "id": 44,
        "template_id": 6,
        "inventory_item_id": 10,
        "quantity": 1,
        "inventory_item": {
          "sku": "STR-HDG-4P",
          "name": "Hot-Dip Galvanized Elevated Structure (4 Panels)",
          "category": "MOUNTING_STRUCTURES",
          "unit_cost_inr": 4200.0,
          "selling_price_inr": 6000.0,
          "stock_qty": 60,
          "reorder_threshold": 15,
          "id": 10
        }
      },
      {
        "id": 45,
        "template_id": 6,
        "inventory_item_id": 12,
        "quantity": 1,
        "inventory_item": {
          "sku": "CAB-DC-4MM",
          "name": "4 sq.mm UV-Resistant Dual-Insulated Copper DC Cable (100m)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 3200.0,
          "selling_price_inr": 4800.0,
          "stock_qty": 40,
          "reorder_threshold": 10,
          "id": 12
        }
      },
      {
        "id": 46,
        "template_id": 6,
        "inventory_item_id": 13,
        "quantity": 1,
        "inventory_item": {
          "sku": "CON-MC4-P10",
          "name": "IP68 Waterproof MC4 Male/Female Connector Set (10 Pairs)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 650.0,
          "selling_price_inr": 1100.0,
          "stock_qty": 110,
          "reorder_threshold": 25,
          "id": 13
        }
      },
      {
        "id": 47,
        "template_id": 6,
        "inventory_item_id": 14,
        "quantity": 1,
        "inventory_item": {
          "sku": "BOX-ACDC-SPD",
          "name": "Pre-wired ACDB + DCDB Box with Type-II Surge Protection",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 4800.0,
          "selling_price_inr": 6800.0,
          "stock_qty": 22,
          "reorder_threshold": 8,
          "id": 14
        }
      },
      {
        "id": 48,
        "template_id": 6,
        "inventory_item_id": 15,
        "quantity": 1,
        "inventory_item": {
          "sku": "SAF-EARTH-2M",
          "name": "2 Meter Copper-Bonded Chemical Earthing Electrode Kit",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 2600.0,
          "selling_price_inr": 3900.0,
          "stock_qty": 45,
          "reorder_threshold": 12,
          "id": 15
        }
      },
      {
        "id": 49,
        "template_id": 6,
        "inventory_item_id": 16,
        "quantity": 1,
        "inventory_item": {
          "sku": "SAF-LA-COPPER",
          "name": "Pure Copper Lightning Arrestor Spike with Base & Counter",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 3400.0,
          "selling_price_inr": 5200.0,
          "stock_qty": 30,
          "reorder_threshold": 10,
          "id": 16
        }
      }
    ]
  },
  {
    "id": 7,
    "capacity_kw": 2.0,
    "system_type": "OFF_GRID",
    "installation_charge_inr": 19000.0,
    "description": "2 kW Off-Grid Solar Package with Dual Battery Storage",
    "items": [
      {
        "id": 50,
        "template_id": 7,
        "inventory_item_id": 1,
        "quantity": 4,
        "inventory_item": {
          "sku": "PNL-MONO-540W",
          "name": "540W Mono-PERC Half-Cut Tier-1 Solar Panel",
          "category": "PANELS",
          "unit_cost_inr": 11500.0,
          "selling_price_inr": 14800.0,
          "stock_qty": 980,
          "reorder_threshold": 30,
          "id": 1
        }
      },
      {
        "id": 51,
        "template_id": 7,
        "inventory_item_id": 6,
        "quantity": 1,
        "inventory_item": {
          "sku": "INV-HYB-3KW",
          "name": "3kW Hybrid Off-Grid/On-Grid Solar Inverter",
          "category": "INVERTERS",
          "unit_cost_inr": 32000.0,
          "selling_price_inr": 42000.0,
          "stock_qty": 12,
          "reorder_threshold": 4,
          "id": 6
        }
      },
      {
        "id": 52,
        "template_id": 7,
        "inventory_item_id": 8,
        "quantity": 2,
        "inventory_item": {
          "sku": "BAT-TUB-150AH",
          "name": "150Ah C10 Tall Tubular Solar Battery",
          "category": "BATTERIES",
          "unit_cost_inr": 11000.0,
          "selling_price_inr": 14500.0,
          "stock_qty": 185,
          "reorder_threshold": 10,
          "id": 8
        }
      },
      {
        "id": 53,
        "template_id": 7,
        "inventory_item_id": 10,
        "quantity": 1,
        "inventory_item": {
          "sku": "STR-HDG-4P",
          "name": "Hot-Dip Galvanized Elevated Structure (4 Panels)",
          "category": "MOUNTING_STRUCTURES",
          "unit_cost_inr": 4200.0,
          "selling_price_inr": 6000.0,
          "stock_qty": 60,
          "reorder_threshold": 15,
          "id": 10
        }
      },
      {
        "id": 54,
        "template_id": 7,
        "inventory_item_id": 12,
        "quantity": 1,
        "inventory_item": {
          "sku": "CAB-DC-4MM",
          "name": "4 sq.mm UV-Resistant Dual-Insulated Copper DC Cable (100m)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 3200.0,
          "selling_price_inr": 4800.0,
          "stock_qty": 40,
          "reorder_threshold": 10,
          "id": 12
        }
      },
      {
        "id": 55,
        "template_id": 7,
        "inventory_item_id": 13,
        "quantity": 2,
        "inventory_item": {
          "sku": "CON-MC4-P10",
          "name": "IP68 Waterproof MC4 Male/Female Connector Set (10 Pairs)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 650.0,
          "selling_price_inr": 1100.0,
          "stock_qty": 110,
          "reorder_threshold": 25,
          "id": 13
        }
      },
      {
        "id": 56,
        "template_id": 7,
        "inventory_item_id": 14,
        "quantity": 1,
        "inventory_item": {
          "sku": "BOX-ACDC-SPD",
          "name": "Pre-wired ACDB + DCDB Box with Type-II Surge Protection",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 4800.0,
          "selling_price_inr": 6800.0,
          "stock_qty": 22,
          "reorder_threshold": 8,
          "id": 14
        }
      },
      {
        "id": 57,
        "template_id": 7,
        "inventory_item_id": 15,
        "quantity": 2,
        "inventory_item": {
          "sku": "SAF-EARTH-2M",
          "name": "2 Meter Copper-Bonded Chemical Earthing Electrode Kit",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 2600.0,
          "selling_price_inr": 3900.0,
          "stock_qty": 45,
          "reorder_threshold": 12,
          "id": 15
        }
      },
      {
        "id": 58,
        "template_id": 7,
        "inventory_item_id": 16,
        "quantity": 1,
        "inventory_item": {
          "sku": "SAF-LA-COPPER",
          "name": "Pure Copper Lightning Arrestor Spike with Base & Counter",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 3400.0,
          "selling_price_inr": 5200.0,
          "stock_qty": 30,
          "reorder_threshold": 10,
          "id": 16
        }
      }
    ]
  },
  {
    "id": 8,
    "capacity_kw": 3.0,
    "system_type": "OFF_GRID",
    "installation_charge_inr": 23000.0,
    "description": "3 kW Off-Grid Solar Package with 4-Battery Storage",
    "items": [
      {
        "id": 59,
        "template_id": 8,
        "inventory_item_id": 1,
        "quantity": 6,
        "inventory_item": {
          "sku": "PNL-MONO-540W",
          "name": "540W Mono-PERC Half-Cut Tier-1 Solar Panel",
          "category": "PANELS",
          "unit_cost_inr": 11500.0,
          "selling_price_inr": 14800.0,
          "stock_qty": 980,
          "reorder_threshold": 30,
          "id": 1
        }
      },
      {
        "id": 60,
        "template_id": 8,
        "inventory_item_id": 6,
        "quantity": 1,
        "inventory_item": {
          "sku": "INV-HYB-3KW",
          "name": "3kW Hybrid Off-Grid/On-Grid Solar Inverter",
          "category": "INVERTERS",
          "unit_cost_inr": 32000.0,
          "selling_price_inr": 42000.0,
          "stock_qty": 12,
          "reorder_threshold": 4,
          "id": 6
        }
      },
      {
        "id": 61,
        "template_id": 8,
        "inventory_item_id": 8,
        "quantity": 4,
        "inventory_item": {
          "sku": "BAT-TUB-150AH",
          "name": "150Ah C10 Tall Tubular Solar Battery",
          "category": "BATTERIES",
          "unit_cost_inr": 11000.0,
          "selling_price_inr": 14500.0,
          "stock_qty": 185,
          "reorder_threshold": 10,
          "id": 8
        }
      },
      {
        "id": 62,
        "template_id": 8,
        "inventory_item_id": 10,
        "quantity": 2,
        "inventory_item": {
          "sku": "STR-HDG-4P",
          "name": "Hot-Dip Galvanized Elevated Structure (4 Panels)",
          "category": "MOUNTING_STRUCTURES",
          "unit_cost_inr": 4200.0,
          "selling_price_inr": 6000.0,
          "stock_qty": 60,
          "reorder_threshold": 15,
          "id": 10
        }
      },
      {
        "id": 63,
        "template_id": 8,
        "inventory_item_id": 12,
        "quantity": 1,
        "inventory_item": {
          "sku": "CAB-DC-4MM",
          "name": "4 sq.mm UV-Resistant Dual-Insulated Copper DC Cable (100m)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 3200.0,
          "selling_price_inr": 4800.0,
          "stock_qty": 40,
          "reorder_threshold": 10,
          "id": 12
        }
      },
      {
        "id": 64,
        "template_id": 8,
        "inventory_item_id": 13,
        "quantity": 2,
        "inventory_item": {
          "sku": "CON-MC4-P10",
          "name": "IP68 Waterproof MC4 Male/Female Connector Set (10 Pairs)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 650.0,
          "selling_price_inr": 1100.0,
          "stock_qty": 110,
          "reorder_threshold": 25,
          "id": 13
        }
      },
      {
        "id": 65,
        "template_id": 8,
        "inventory_item_id": 14,
        "quantity": 1,
        "inventory_item": {
          "sku": "BOX-ACDC-SPD",
          "name": "Pre-wired ACDB + DCDB Box with Type-II Surge Protection",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 4800.0,
          "selling_price_inr": 6800.0,
          "stock_qty": 22,
          "reorder_threshold": 8,
          "id": 14
        }
      },
      {
        "id": 66,
        "template_id": 8,
        "inventory_item_id": 15,
        "quantity": 2,
        "inventory_item": {
          "sku": "SAF-EARTH-2M",
          "name": "2 Meter Copper-Bonded Chemical Earthing Electrode Kit",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 2600.0,
          "selling_price_inr": 3900.0,
          "stock_qty": 45,
          "reorder_threshold": 12,
          "id": 15
        }
      },
      {
        "id": 67,
        "template_id": 8,
        "inventory_item_id": 16,
        "quantity": 1,
        "inventory_item": {
          "sku": "SAF-LA-COPPER",
          "name": "Pure Copper Lightning Arrestor Spike with Base & Counter",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 3400.0,
          "selling_price_inr": 5200.0,
          "stock_qty": 30,
          "reorder_threshold": 10,
          "id": 16
        }
      }
    ]
  },
  {
    "id": 9,
    "capacity_kw": 4.0,
    "system_type": "OFF_GRID",
    "installation_charge_inr": 27000.0,
    "description": "4 kW Off-Grid Solar Package with Lithium Storage",
    "items": [
      {
        "id": 68,
        "template_id": 9,
        "inventory_item_id": 1,
        "quantity": 8,
        "inventory_item": {
          "sku": "PNL-MONO-540W",
          "name": "540W Mono-PERC Half-Cut Tier-1 Solar Panel",
          "category": "PANELS",
          "unit_cost_inr": 11500.0,
          "selling_price_inr": 14800.0,
          "stock_qty": 980,
          "reorder_threshold": 30,
          "id": 1
        }
      },
      {
        "id": 69,
        "template_id": 9,
        "inventory_item_id": 7,
        "quantity": 1,
        "inventory_item": {
          "sku": "INV-HYB-5KW",
          "name": "5kW Solar Hybrid Inverter 48V Pure Sine Wave",
          "category": "INVERTERS",
          "unit_cost_inr": 48000.0,
          "selling_price_inr": 62000.0,
          "stock_qty": 8,
          "reorder_threshold": 4,
          "id": 7
        }
      },
      {
        "id": 70,
        "template_id": 9,
        "inventory_item_id": 9,
        "quantity": 1,
        "inventory_item": {
          "sku": "BAT-LI-200AH",
          "name": "48V 100Ah (5kWh) Wall-Mount LiFePO4 Battery Pack",
          "category": "BATTERIES",
          "unit_cost_inr": 72000.0,
          "selling_price_inr": 95000.0,
          "stock_qty": 9,
          "reorder_threshold": 3,
          "id": 9
        }
      },
      {
        "id": 71,
        "template_id": 9,
        "inventory_item_id": 10,
        "quantity": 2,
        "inventory_item": {
          "sku": "STR-HDG-4P",
          "name": "Hot-Dip Galvanized Elevated Structure (4 Panels)",
          "category": "MOUNTING_STRUCTURES",
          "unit_cost_inr": 4200.0,
          "selling_price_inr": 6000.0,
          "stock_qty": 60,
          "reorder_threshold": 15,
          "id": 10
        }
      },
      {
        "id": 72,
        "template_id": 9,
        "inventory_item_id": 12,
        "quantity": 2,
        "inventory_item": {
          "sku": "CAB-DC-4MM",
          "name": "4 sq.mm UV-Resistant Dual-Insulated Copper DC Cable (100m)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 3200.0,
          "selling_price_inr": 4800.0,
          "stock_qty": 40,
          "reorder_threshold": 10,
          "id": 12
        }
      },
      {
        "id": 73,
        "template_id": 9,
        "inventory_item_id": 13,
        "quantity": 3,
        "inventory_item": {
          "sku": "CON-MC4-P10",
          "name": "IP68 Waterproof MC4 Male/Female Connector Set (10 Pairs)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 650.0,
          "selling_price_inr": 1100.0,
          "stock_qty": 110,
          "reorder_threshold": 25,
          "id": 13
        }
      },
      {
        "id": 74,
        "template_id": 9,
        "inventory_item_id": 14,
        "quantity": 1,
        "inventory_item": {
          "sku": "BOX-ACDC-SPD",
          "name": "Pre-wired ACDB + DCDB Box with Type-II Surge Protection",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 4800.0,
          "selling_price_inr": 6800.0,
          "stock_qty": 22,
          "reorder_threshold": 8,
          "id": 14
        }
      },
      {
        "id": 75,
        "template_id": 9,
        "inventory_item_id": 15,
        "quantity": 2,
        "inventory_item": {
          "sku": "SAF-EARTH-2M",
          "name": "2 Meter Copper-Bonded Chemical Earthing Electrode Kit",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 2600.0,
          "selling_price_inr": 3900.0,
          "stock_qty": 45,
          "reorder_threshold": 12,
          "id": 15
        }
      },
      {
        "id": 76,
        "template_id": 9,
        "inventory_item_id": 16,
        "quantity": 1,
        "inventory_item": {
          "sku": "SAF-LA-COPPER",
          "name": "Pure Copper Lightning Arrestor Spike with Base & Counter",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 3400.0,
          "selling_price_inr": 5200.0,
          "stock_qty": 30,
          "reorder_threshold": 10,
          "id": 16
        }
      }
    ]
  },
  {
    "id": 10,
    "capacity_kw": 5.0,
    "system_type": "OFF_GRID",
    "installation_charge_inr": 32000.0,
    "description": "5 kW Heavy Duty Off-Grid Solar Package with Lithium Storage",
    "items": [
      {
        "id": 77,
        "template_id": 10,
        "inventory_item_id": 1,
        "quantity": 10,
        "inventory_item": {
          "sku": "PNL-MONO-540W",
          "name": "540W Mono-PERC Half-Cut Tier-1 Solar Panel",
          "category": "PANELS",
          "unit_cost_inr": 11500.0,
          "selling_price_inr": 14800.0,
          "stock_qty": 980,
          "reorder_threshold": 30,
          "id": 1
        }
      },
      {
        "id": 78,
        "template_id": 10,
        "inventory_item_id": 7,
        "quantity": 1,
        "inventory_item": {
          "sku": "INV-HYB-5KW",
          "name": "5kW Solar Hybrid Inverter 48V Pure Sine Wave",
          "category": "INVERTERS",
          "unit_cost_inr": 48000.0,
          "selling_price_inr": 62000.0,
          "stock_qty": 8,
          "reorder_threshold": 4,
          "id": 7
        }
      },
      {
        "id": 79,
        "template_id": 10,
        "inventory_item_id": 9,
        "quantity": 1,
        "inventory_item": {
          "sku": "BAT-LI-200AH",
          "name": "48V 100Ah (5kWh) Wall-Mount LiFePO4 Battery Pack",
          "category": "BATTERIES",
          "unit_cost_inr": 72000.0,
          "selling_price_inr": 95000.0,
          "stock_qty": 9,
          "reorder_threshold": 3,
          "id": 9
        }
      },
      {
        "id": 80,
        "template_id": 10,
        "inventory_item_id": 8,
        "quantity": 2,
        "inventory_item": {
          "sku": "BAT-TUB-150AH",
          "name": "150Ah C10 Tall Tubular Solar Battery",
          "category": "BATTERIES",
          "unit_cost_inr": 11000.0,
          "selling_price_inr": 14500.0,
          "stock_qty": 185,
          "reorder_threshold": 10,
          "id": 8
        }
      },
      {
        "id": 81,
        "template_id": 10,
        "inventory_item_id": 10,
        "quantity": 3,
        "inventory_item": {
          "sku": "STR-HDG-4P",
          "name": "Hot-Dip Galvanized Elevated Structure (4 Panels)",
          "category": "MOUNTING_STRUCTURES",
          "unit_cost_inr": 4200.0,
          "selling_price_inr": 6000.0,
          "stock_qty": 60,
          "reorder_threshold": 15,
          "id": 10
        }
      },
      {
        "id": 82,
        "template_id": 10,
        "inventory_item_id": 12,
        "quantity": 2,
        "inventory_item": {
          "sku": "CAB-DC-4MM",
          "name": "4 sq.mm UV-Resistant Dual-Insulated Copper DC Cable (100m)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 3200.0,
          "selling_price_inr": 4800.0,
          "stock_qty": 40,
          "reorder_threshold": 10,
          "id": 12
        }
      },
      {
        "id": 83,
        "template_id": 10,
        "inventory_item_id": 13,
        "quantity": 3,
        "inventory_item": {
          "sku": "CON-MC4-P10",
          "name": "IP68 Waterproof MC4 Male/Female Connector Set (10 Pairs)",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 650.0,
          "selling_price_inr": 1100.0,
          "stock_qty": 110,
          "reorder_threshold": 25,
          "id": 13
        }
      },
      {
        "id": 84,
        "template_id": 10,
        "inventory_item_id": 14,
        "quantity": 1,
        "inventory_item": {
          "sku": "BOX-ACDC-SPD",
          "name": "Pre-wired ACDB + DCDB Box with Type-II Surge Protection",
          "category": "WIRES_CONNECTORS",
          "unit_cost_inr": 4800.0,
          "selling_price_inr": 6800.0,
          "stock_qty": 22,
          "reorder_threshold": 8,
          "id": 14
        }
      },
      {
        "id": 85,
        "template_id": 10,
        "inventory_item_id": 15,
        "quantity": 3,
        "inventory_item": {
          "sku": "SAF-EARTH-2M",
          "name": "2 Meter Copper-Bonded Chemical Earthing Electrode Kit",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 2600.0,
          "selling_price_inr": 3900.0,
          "stock_qty": 45,
          "reorder_threshold": 12,
          "id": 15
        }
      },
      {
        "id": 86,
        "template_id": 10,
        "inventory_item_id": 16,
        "quantity": 1,
        "inventory_item": {
          "sku": "SAF-LA-COPPER",
          "name": "Pure Copper Lightning Arrestor Spike with Base & Counter",
          "category": "SAFETY_EQUIPMENT",
          "unit_cost_inr": 3400.0,
          "selling_price_inr": 5200.0,
          "stock_qty": 30,
          "reorder_threshold": 10,
          "id": 16
        }
      }
    ]
  }
];

export const DEFAULT_SERIAL_UNITS = [
  {
    "serial_number": "INV-TEST-2026-999",
    "order_id": 1,
    "lead_id": 1,
    "inventory_item_id": 4,
    "component_type": "INVERTER",
    "packed_status": true,
    "dispatched_at": "2026-11-21T10:19:23.041561",
    "delivery_confirmed": true,
    "warranty_years": 2,
    "warranty_start_date": "2026-11-21",
    "warranty_expiry_date": "2028-11-20",
    "lead": {
      "id": 1,
      "customer_name": "Arvind Sharma",
      "phone": "+91 98101 23456",
      "email": "arvind.sharma@gmail.com",
      "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
      "capacity_kw": 3.0,
      "system_type": "ON_GRID",
      "subsidy_requested": true,
      "monthly_bill_inr": 4200.0,
      "grid_suitable": true,
      "pipeline_stage": "INSTALLED",
      "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
      "created_at": "2025-05-10T00:00:00"
    },
    "inventory_item": {
      "sku": "INV-GT-3KW",
      "name": "3kW Smart Grid-Tie Inverter with WiFi Dongle",
      "category": "INVERTERS",
      "unit_cost_inr": 24000.0,
      "selling_price_inr": 32000.0,
      "stock_qty": 24,
      "reorder_threshold": 6,
      "id": 4
    }
  },
  {
    "serial_number": "INV-2026-9021",
    "order_id": 2,
    "lead_id": 2,
    "inventory_item_id": 5,
    "component_type": "INVERTER",
    "packed_status": true,
    "dispatched_at": "2026-11-19T07:19:06.512189",
    "delivery_confirmed": true,
    "warranty_years": 2,
    "warranty_start_date": "2026-11-21",
    "warranty_expiry_date": "2028-11-20",
    "lead": {
      "id": 2,
      "customer_name": "Sunita Rao",
      "phone": "+91 98202 88776",
      "email": "sunita.rao@outlook.com",
      "address": "Villa 14, Palm Meadows, Whitefield, Bengaluru, Karnataka 560066",
      "capacity_kw": 5.0,
      "system_type": "ON_GRID",
      "subsidy_requested": true,
      "monthly_bill_inr": 7800.0,
      "grid_suitable": true,
      "pipeline_stage": "WON",
      "follow_up_notes": "5 kW system confirmed. Customer paid 50% advance. Materials dispatched.",
      "created_at": "2026-11-21T07:19:06.511326"
    },
    "inventory_item": {
      "sku": "INV-GT-5KW",
      "name": "5kW High-Efficiency Dual MPPT On-Grid Inverter",
      "category": "INVERTERS",
      "unit_cost_inr": 36000.0,
      "selling_price_inr": 48000.0,
      "stock_qty": 14,
      "reorder_threshold": 5,
      "id": 5
    }
  },
  {
    "serial_number": "INV-2025-0518",
    "order_id": 1,
    "lead_id": 1,
    "inventory_item_id": 4,
    "component_type": "INVERTER",
    "packed_status": true,
    "dispatched_at": "2025-05-25T00:00:00",
    "delivery_confirmed": true,
    "warranty_years": 2,
    "warranty_start_date": "2025-05-30",
    "warranty_expiry_date": "2027-05-30",
    "lead": {
      "id": 1,
      "customer_name": "Arvind Sharma",
      "phone": "+91 98101 23456",
      "email": "arvind.sharma@gmail.com",
      "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
      "capacity_kw": 3.0,
      "system_type": "ON_GRID",
      "subsidy_requested": true,
      "monthly_bill_inr": 4200.0,
      "grid_suitable": true,
      "pipeline_stage": "INSTALLED",
      "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
      "created_at": "2025-05-10T00:00:00"
    },
    "inventory_item": {
      "sku": "INV-GT-3KW",
      "name": "3kW Smart Grid-Tie Inverter with WiFi Dongle",
      "category": "INVERTERS",
      "unit_cost_inr": 24000.0,
      "selling_price_inr": 32000.0,
      "stock_qty": 24,
      "reorder_threshold": 6,
      "id": 4
    }
  },
  {
    "serial_number": "PNL-2025-0911",
    "order_id": 1,
    "lead_id": 1,
    "inventory_item_id": 1,
    "component_type": "PANEL",
    "packed_status": true,
    "dispatched_at": "2025-05-25T00:00:00",
    "delivery_confirmed": true,
    "warranty_years": 20,
    "warranty_start_date": "2025-05-30",
    "warranty_expiry_date": "2045-05-25",
    "lead": {
      "id": 1,
      "customer_name": "Arvind Sharma",
      "phone": "+91 98101 23456",
      "email": "arvind.sharma@gmail.com",
      "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
      "capacity_kw": 3.0,
      "system_type": "ON_GRID",
      "subsidy_requested": true,
      "monthly_bill_inr": 4200.0,
      "grid_suitable": true,
      "pipeline_stage": "INSTALLED",
      "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
      "created_at": "2025-05-10T00:00:00"
    },
    "inventory_item": {
      "sku": "PNL-MONO-540W",
      "name": "540W Mono-PERC Half-Cut Tier-1 Solar Panel",
      "category": "PANELS",
      "unit_cost_inr": 11500.0,
      "selling_price_inr": 14800.0,
      "stock_qty": 980,
      "reorder_threshold": 30,
      "id": 1
    }
  },
  {
    "serial_number": "BAT-2023-0104",
    "order_id": 1,
    "lead_id": 1,
    "inventory_item_id": 8,
    "component_type": "BATTERY",
    "packed_status": true,
    "dispatched_at": "2024-04-25T00:00:00",
    "delivery_confirmed": true,
    "warranty_years": 2,
    "warranty_start_date": "2024-04-25",
    "warranty_expiry_date": "2026-04-25",
    "lead": {
      "id": 1,
      "customer_name": "Arvind Sharma",
      "phone": "+91 98101 23456",
      "email": "arvind.sharma@gmail.com",
      "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
      "capacity_kw": 3.0,
      "system_type": "ON_GRID",
      "subsidy_requested": true,
      "monthly_bill_inr": 4200.0,
      "grid_suitable": true,
      "pipeline_stage": "INSTALLED",
      "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
      "created_at": "2025-05-10T00:00:00"
    },
    "inventory_item": {
      "sku": "BAT-TUB-150AH",
      "name": "150Ah C10 Tall Tubular Solar Battery",
      "category": "BATTERIES",
      "unit_cost_inr": 11000.0,
      "selling_price_inr": 14500.0,
      "stock_qty": 185,
      "reorder_threshold": 10,
      "id": 8
    }
  }
];

export const DEFAULT_ORDERS = [
  {
    "id": 2,
    "quotation_id": 2,
    "lead_id": 2,
    "total_amount_inr": 190000.0,
    "advance_paid_inr": 100000.0,
    "balance_due_inr": 90000.0,
    "payment_status": "ADVANCE_PAID",
    "subsidy_tracking_status": "APPLIED",
    "bom_deducted": true,
    "created_at": "2026-11-21T07:19:06.511950",
    "quotation": {
      "id": 2,
      "lead_id": 2,
      "survey_id": 2,
      "capacity_kw": 5.0,
      "system_type": "ON_GRID",
      "hardware_total_inr": 242000.0,
      "installation_charge_inr": 26000.0,
      "subsidy_discount_inr": 78000.0,
      "grand_total_inr": 190000.0,
      "status": "APPROVED_BY_CUSTOMER",
      "created_at": "2026-11-21T07:19:06.511857",
      "lead": {
        "id": 2,
        "customer_name": "Sunita Rao",
        "phone": "+91 98202 88776",
        "email": "sunita.rao@outlook.com",
        "address": "Villa 14, Palm Meadows, Whitefield, Bengaluru, Karnataka 560066",
        "capacity_kw": 5.0,
        "system_type": "ON_GRID",
        "subsidy_requested": true,
        "monthly_bill_inr": 7800.0,
        "grid_suitable": true,
        "pipeline_stage": "WON",
        "follow_up_notes": "5 kW system confirmed. Customer paid 50% advance. Materials dispatched.",
        "created_at": "2026-11-21T07:19:06.511326"
      }
    },
    "lead": {
      "id": 2,
      "customer_name": "Sunita Rao",
      "phone": "+91 98202 88776",
      "email": "sunita.rao@outlook.com",
      "address": "Villa 14, Palm Meadows, Whitefield, Bengaluru, Karnataka 560066",
      "capacity_kw": 5.0,
      "system_type": "ON_GRID",
      "subsidy_requested": true,
      "monthly_bill_inr": 7800.0,
      "grid_suitable": true,
      "pipeline_stage": "WON",
      "follow_up_notes": "5 kW system confirmed. Customer paid 50% advance. Materials dispatched.",
      "created_at": "2026-11-21T07:19:06.511326"
    }
  },
  {
    "id": 1,
    "quotation_id": 1,
    "lead_id": 1,
    "total_amount_inr": 86000.0,
    "advance_paid_inr": 266000.0,
    "balance_due_inr": 0.0,
    "payment_status": "FULLY_PAID",
    "subsidy_tracking_status": "DISBURSED",
    "bom_deducted": true,
    "created_at": "2026-11-21T07:19:06.509182",
    "quotation": {
      "id": 1,
      "lead_id": 1,
      "survey_id": 1,
      "capacity_kw": 3.0,
      "system_type": "ON_GRID",
      "hardware_total_inr": 146000.0,
      "installation_charge_inr": 18000.0,
      "subsidy_discount_inr": 78000.0,
      "grand_total_inr": 86000.0,
      "status": "APPROVED_BY_CUSTOMER",
      "created_at": "2026-11-21T07:19:06.508890",
      "lead": {
        "id": 1,
        "customer_name": "Arvind Sharma",
        "phone": "+91 98101 23456",
        "email": "arvind.sharma@gmail.com",
        "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
        "capacity_kw": 3.0,
        "system_type": "ON_GRID",
        "subsidy_requested": true,
        "monthly_bill_inr": 4200.0,
        "grid_suitable": true,
        "pipeline_stage": "INSTALLED",
        "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
        "created_at": "2025-05-10T00:00:00"
      }
    },
    "lead": {
      "id": 1,
      "customer_name": "Arvind Sharma",
      "phone": "+91 98101 23456",
      "email": "arvind.sharma@gmail.com",
      "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
      "capacity_kw": 3.0,
      "system_type": "ON_GRID",
      "subsidy_requested": true,
      "monthly_bill_inr": 4200.0,
      "grid_suitable": true,
      "pipeline_stage": "INSTALLED",
      "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
      "created_at": "2025-05-10T00:00:00"
    }
  }
];

export const DEFAULT_INSTALLATIONS = [
  {
    "id": 2,
    "order_id": 2,
    "technician_id": 8,
    "scheduled_date": "2026-11-21",
    "start_time": "09:00 AM",
    "end_time": "Pending",
    "hours_logged": 5.0,
    "progress_pct": 60,
    "verified_kw": 0.0,
    "system_tested_ok": false,
    "voc_voltage": 0.0,
    "isc_current": 0.0,
    "earth_resistance_ohms": 0.0,
    "install_photo_url": "/photos/install_complete_default.jpg",
    "customer_signature_base64": "",
    "is_completed": false,
    "completion_notes": "Mounting structure erected. 10 panels mounted. Inverter wiring in progress.",
    "created_at": "2026-11-21T07:19:06.512607",
    "technician": {
      "name": "Amit Patel",
      "email": "tech.amit.patel@sunpower.in",
      "role": "TECHNICIAN",
      "hourly_rate": 420.0,
      "attendance_status": "PRESENT",
      "leave_status": "ACTIVE",
      "id": 8
    },
    "order": {
      "id": 2,
      "quotation_id": 2,
      "lead_id": 2,
      "total_amount_inr": 190000.0,
      "advance_paid_inr": 100000.0,
      "balance_due_inr": 90000.0,
      "payment_status": "ADVANCE_PAID",
      "subsidy_tracking_status": "APPLIED",
      "bom_deducted": true,
      "created_at": "2026-11-21T07:19:06.511950",
      "quotation": {
        "id": 2,
        "lead_id": 2,
        "survey_id": 2,
        "capacity_kw": 5.0,
        "system_type": "ON_GRID",
        "hardware_total_inr": 242000.0,
        "installation_charge_inr": 26000.0,
        "subsidy_discount_inr": 78000.0,
        "grand_total_inr": 190000.0,
        "status": "APPROVED_BY_CUSTOMER",
        "created_at": "2026-11-21T07:19:06.511857",
        "lead": {
          "id": 2,
          "customer_name": "Sunita Rao",
          "phone": "+91 98202 88776",
          "email": "sunita.rao@outlook.com",
          "address": "Villa 14, Palm Meadows, Whitefield, Bengaluru, Karnataka 560066",
          "capacity_kw": 5.0,
          "system_type": "ON_GRID",
          "subsidy_requested": true,
          "monthly_bill_inr": 7800.0,
          "grid_suitable": true,
          "pipeline_stage": "WON",
          "follow_up_notes": "5 kW system confirmed. Customer paid 50% advance. Materials dispatched.",
          "created_at": "2026-11-21T07:19:06.511326"
        }
      },
      "lead": {
        "id": 2,
        "customer_name": "Sunita Rao",
        "phone": "+91 98202 88776",
        "email": "sunita.rao@outlook.com",
        "address": "Villa 14, Palm Meadows, Whitefield, Bengaluru, Karnataka 560066",
        "capacity_kw": 5.0,
        "system_type": "ON_GRID",
        "subsidy_requested": true,
        "monthly_bill_inr": 7800.0,
        "grid_suitable": true,
        "pipeline_stage": "WON",
        "follow_up_notes": "5 kW system confirmed. Customer paid 50% advance. Materials dispatched.",
        "created_at": "2026-11-21T07:19:06.511326"
      }
    }
  },
  {
    "id": 1,
    "order_id": 1,
    "technician_id": 6,
    "scheduled_date": "2025-05-30",
    "start_time": "08:30 AM",
    "end_time": "04:30 PM",
    "hours_logged": 12.0,
    "progress_pct": 100,
    "verified_kw": 3.12,
    "system_tested_ok": true,
    "voc_voltage": 415.0,
    "isc_current": 11.0,
    "earth_resistance_ohms": 3.2,
    "install_photo_url": "/photos/install_arvind_sharma.jpg",
    "customer_signature_base64": "data:image/png;base64,iVBORw0KGgo...",
    "is_completed": true,
    "completion_notes": "Handover accepted",
    "created_at": "2026-11-21T07:19:06.510923",
    "technician": {
      "name": "Ramesh Sharma",
      "email": "tech.ramesh.sharma@sunpower.in",
      "role": "TECHNICIAN",
      "hourly_rate": 380.0,
      "attendance_status": "PRESENT",
      "leave_status": "ACTIVE",
      "id": 6
    },
    "order": {
      "id": 1,
      "quotation_id": 1,
      "lead_id": 1,
      "total_amount_inr": 86000.0,
      "advance_paid_inr": 266000.0,
      "balance_due_inr": 0.0,
      "payment_status": "FULLY_PAID",
      "subsidy_tracking_status": "DISBURSED",
      "bom_deducted": true,
      "created_at": "2026-11-21T07:19:06.509182",
      "quotation": {
        "id": 1,
        "lead_id": 1,
        "survey_id": 1,
        "capacity_kw": 3.0,
        "system_type": "ON_GRID",
        "hardware_total_inr": 146000.0,
        "installation_charge_inr": 18000.0,
        "subsidy_discount_inr": 78000.0,
        "grand_total_inr": 86000.0,
        "status": "APPROVED_BY_CUSTOMER",
        "created_at": "2026-11-21T07:19:06.508890",
        "lead": {
          "id": 1,
          "customer_name": "Arvind Sharma",
          "phone": "+91 98101 23456",
          "email": "arvind.sharma@gmail.com",
          "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
          "capacity_kw": 3.0,
          "system_type": "ON_GRID",
          "subsidy_requested": true,
          "monthly_bill_inr": 4200.0,
          "grid_suitable": true,
          "pipeline_stage": "INSTALLED",
          "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
          "created_at": "2025-05-10T00:00:00"
        }
      },
      "lead": {
        "id": 1,
        "customer_name": "Arvind Sharma",
        "phone": "+91 98101 23456",
        "email": "arvind.sharma@gmail.com",
        "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
        "capacity_kw": 3.0,
        "system_type": "ON_GRID",
        "subsidy_requested": true,
        "monthly_bill_inr": 4200.0,
        "grid_suitable": true,
        "pipeline_stage": "INSTALLED",
        "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
        "created_at": "2025-05-10T00:00:00"
      }
    }
  }
];

export const DEFAULT_TICKETS = [
  {
    "id": 73,
    "lead_id": 1,
    "serial_number": "BAT-2023-0104",
    "fault_code": "B02-LOW-VOLTAGE",
    "issue_description": "Battery cells degraded after 3 years",
    "is_under_warranty": false,
    "assigned_technician_id": null,
    "resolution_type": "REPAIR",
    "parts_cost_inr": 4800.0,
    "labor_cost_inr": 1500.0,
    "billed_invoice_amount_inr": 6300.0,
    "status": "OPEN",
    "created_at": "2026-11-21T10:19:23.049778",
    "lead": {
      "id": 1,
      "customer_name": "Arvind Sharma",
      "phone": "+91 98101 23456",
      "email": "arvind.sharma@gmail.com",
      "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
      "capacity_kw": 3.0,
      "system_type": "ON_GRID",
      "subsidy_requested": true,
      "monthly_bill_inr": 4200.0,
      "grid_suitable": true,
      "pipeline_stage": "INSTALLED",
      "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
      "created_at": "2025-05-10T00:00:00"
    },
    "assigned_technician": null
  },
  {
    "id": 72,
    "lead_id": 1,
    "serial_number": "INV-2025-0518",
    "fault_code": "E04-GRID-LOSS",
    "issue_description": "Grid sync intermittent error code",
    "is_under_warranty": true,
    "assigned_technician_id": null,
    "resolution_type": "REPAIR",
    "parts_cost_inr": 3500.0,
    "labor_cost_inr": 1200.0,
    "billed_invoice_amount_inr": 0.0,
    "status": "OPEN",
    "created_at": "2026-11-21T10:19:23.046592",
    "lead": {
      "id": 1,
      "customer_name": "Arvind Sharma",
      "phone": "+91 98101 23456",
      "email": "arvind.sharma@gmail.com",
      "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
      "capacity_kw": 3.0,
      "system_type": "ON_GRID",
      "subsidy_requested": true,
      "monthly_bill_inr": 4200.0,
      "grid_suitable": true,
      "pipeline_stage": "INSTALLED",
      "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
      "created_at": "2025-05-10T00:00:00"
    },
    "assigned_technician": null
  },
  {
    "id": 71,
    "lead_id": 1,
    "serial_number": "BAT-2023-0104",
    "fault_code": "B02-LOW-VOLTAGE",
    "issue_description": "Battery cells degraded after 3 years",
    "is_under_warranty": false,
    "assigned_technician_id": null,
    "resolution_type": "REPAIR",
    "parts_cost_inr": 4800.0,
    "labor_cost_inr": 1500.0,
    "billed_invoice_amount_inr": 6300.0,
    "status": "OPEN",
    "created_at": "2026-11-21T10:18:52.436926",
    "lead": {
      "id": 1,
      "customer_name": "Arvind Sharma",
      "phone": "+91 98101 23456",
      "email": "arvind.sharma@gmail.com",
      "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
      "capacity_kw": 3.0,
      "system_type": "ON_GRID",
      "subsidy_requested": true,
      "monthly_bill_inr": 4200.0,
      "grid_suitable": true,
      "pipeline_stage": "INSTALLED",
      "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
      "created_at": "2025-05-10T00:00:00"
    },
    "assigned_technician": null
  },
  {
    "id": 70,
    "lead_id": 1,
    "serial_number": "INV-2025-0518",
    "fault_code": "E04-GRID-LOSS",
    "issue_description": "Grid sync intermittent error code",
    "is_under_warranty": true,
    "assigned_technician_id": null,
    "resolution_type": "REPAIR",
    "parts_cost_inr": 3500.0,
    "labor_cost_inr": 1200.0,
    "billed_invoice_amount_inr": 0.0,
    "status": "OPEN",
    "created_at": "2026-11-21T10:18:52.433345",
    "lead": {
      "id": 1,
      "customer_name": "Arvind Sharma",
      "phone": "+91 98101 23456",
      "email": "arvind.sharma@gmail.com",
      "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
      "capacity_kw": 3.0,
      "system_type": "ON_GRID",
      "subsidy_requested": true,
      "monthly_bill_inr": 4200.0,
      "grid_suitable": true,
      "pipeline_stage": "INSTALLED",
      "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
      "created_at": "2025-05-10T00:00:00"
    },
    "assigned_technician": null
  },
  {
    "id": 69,
    "lead_id": 1,
    "serial_number": "BAT-2023-0104",
    "fault_code": "B02-LOW-VOLTAGE",
    "issue_description": "Battery cells degraded after 3 years",
    "is_under_warranty": false,
    "assigned_technician_id": null,
    "resolution_type": "REPAIR",
    "parts_cost_inr": 4800.0,
    "labor_cost_inr": 1500.0,
    "billed_invoice_amount_inr": 6300.0,
    "status": "OPEN",
    "created_at": "2026-11-21T10:15:11.699127",
    "lead": {
      "id": 1,
      "customer_name": "Arvind Sharma",
      "phone": "+91 98101 23456",
      "email": "arvind.sharma@gmail.com",
      "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
      "capacity_kw": 3.0,
      "system_type": "ON_GRID",
      "subsidy_requested": true,
      "monthly_bill_inr": 4200.0,
      "grid_suitable": true,
      "pipeline_stage": "INSTALLED",
      "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
      "created_at": "2025-05-10T00:00:00"
    },
    "assigned_technician": null
  },
  {
    "id": 68,
    "lead_id": 1,
    "serial_number": "INV-2025-0518",
    "fault_code": "E04-GRID-LOSS",
    "issue_description": "Grid sync intermittent error code",
    "is_under_warranty": true,
    "assigned_technician_id": null,
    "resolution_type": "REPAIR",
    "parts_cost_inr": 3500.0,
    "labor_cost_inr": 1200.0,
    "billed_invoice_amount_inr": 0.0,
    "status": "OPEN",
    "created_at": "2026-11-21T10:15:11.696198",
    "lead": {
      "id": 1,
      "customer_name": "Arvind Sharma",
      "phone": "+91 98101 23456",
      "email": "arvind.sharma@gmail.com",
      "address": "B-42, Sector 15, Noida, Uttar Pradesh 201301",
      "capacity_kw": 3.0,
      "system_type": "ON_GRID",
      "subsidy_requested": true,
      "monthly_bill_inr": 4200.0,
      "grid_suitable": true,
      "pipeline_stage": "INSTALLED",
      "follow_up_notes": "Completed rooftop installation under PM Surya Ghar. Very satisfied customer.",
      "created_at": "2025-05-10T00:00:00"
    },
    "assigned_technician": null
  }
];

export const DEFAULT_EMPLOYEES = [
  {
    "name": "Ramesh Sharma",
    "email": "tech.ramesh.sharma@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 380.0,
    "attendance_status": "PRESENT",
    "leave_status": "ACTIVE",
    "id": 6
  },
  {
    "name": "Suresh Verma",
    "email": "tech.suresh.verma@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 350.0,
    "attendance_status": "PRESENT",
    "leave_status": "ACTIVE",
    "id": 7
  },
  {
    "name": "Amit Patel",
    "email": "tech.amit.patel@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 420.0,
    "attendance_status": "PRESENT",
    "leave_status": "ACTIVE",
    "id": 8
  },
  {
    "name": "Rajesh Kumar",
    "email": "tech.rajesh.kumar@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 360.0,
    "attendance_status": "PRESENT",
    "leave_status": "ACTIVE",
    "id": 9
  },
  {
    "name": "Deepak Singh",
    "email": "tech.deepak.singh@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 400.0,
    "attendance_status": "ON_LEAVE",
    "leave_status": "ACTIVE",
    "id": 10
  },
  {
    "name": "Manoj Yadav",
    "email": "tech.manoj.yadav@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 340.0,
    "attendance_status": "PRESENT",
    "leave_status": "ACTIVE",
    "id": 11
  },
  {
    "name": "Vikram Rathore",
    "email": "tech.vikram.rathore@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 450.0,
    "attendance_status": "PRESENT",
    "leave_status": "ACTIVE",
    "id": 12
  },
  {
    "name": "Sanjay Gupta",
    "email": "tech.sanjay.gupta@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 370.0,
    "attendance_status": "PRESENT",
    "leave_status": "ACTIVE",
    "id": 13
  },
  {
    "name": "Pradeep Joshi",
    "email": "tech.pradeep.joshi@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 390.0,
    "attendance_status": "PRESENT",
    "leave_status": "ACTIVE",
    "id": 14
  },
  {
    "name": "Rahul Tiwari",
    "email": "tech.rahul.tiwari@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 360.0,
    "attendance_status": "PRESENT",
    "leave_status": "ACTIVE",
    "id": 15
  },
  {
    "name": "Dinesh Chandra",
    "email": "tech.dinesh.chandra@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 350.0,
    "attendance_status": "PRESENT",
    "leave_status": "ACTIVE",
    "id": 16
  },
  {
    "name": "Vinod Maurya",
    "email": "tech.vinod.maurya@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 340.0,
    "attendance_status": "ABSENT",
    "leave_status": "ACTIVE",
    "id": 17
  },
  {
    "name": "Ashok Saini",
    "email": "tech.ashok.saini@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 380.0,
    "attendance_status": "PRESENT",
    "leave_status": "ACTIVE",
    "id": 18
  },
  {
    "name": "Harish Choudhary",
    "email": "tech.harish.choudhary@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 410.0,
    "attendance_status": "PRESENT",
    "leave_status": "ACTIVE",
    "id": 19
  },
  {
    "name": "Pankaj Mishra",
    "email": "tech.pankaj.mishra@sunpower.in",
    "role": "TECHNICIAN",
    "hourly_rate": 390.0,
    "attendance_status": "PRESENT",
    "leave_status": "ACTIVE",
    "id": 20
  }
];

export const DEFAULT_ANALYTICS = {
  "total_revenue_inr": 366000.0,
  "total_expenses_inr": 313910.0,
  "net_profit_inr": 52090.0,
  "pending_payments_inr": 90000.0,
  "inventory_valuation_inr": 17737100.0,
  "low_stock_items_count": 0,
  "subsidy_tracking": {
    "NOT_APPLIED": 0,
    "APPLIED": 1,
    "INSPECTED": 0,
    "DISBURSED": 1
  },
  "tickets_summary": {
    "total": 73,
    "open": 72,
    "in_warranty": 37,
    "expired_warranty": 36
  },
  "projects_pnl": [
    {
      "order_id": 1,
      "project_name": "Arvind Sharma (3.0kW ON_GRID)",
      "customer_name": "Arvind Sharma",
      "capacity_kw": 3.0,
      "system_type": "ON_GRID",
      "payment_status": "FULLY_PAID",
      "collected_revenue_inr": 266000.0,
      "balance_due_inr": 0.0,
      "bom_hardware_cost_inr": 119300.0,
      "installation_hours": 12.0,
      "technician_hourly_rate": 380.0,
      "labor_cost_inr": 4560.0,
      "total_project_cost_inr": 123860.0,
      "project_profit_inr": 142140.0,
      "profit_margin_pct": 53.4
    },
    {
      "order_id": 2,
      "project_name": "Sunita Rao (5.0kW ON_GRID)",
      "customer_name": "Sunita Rao",
      "capacity_kw": 5.0,
      "system_type": "ON_GRID",
      "payment_status": "ADVANCE_PAID",
      "collected_revenue_inr": 100000.0,
      "balance_due_inr": 90000.0,
      "bom_hardware_cost_inr": 187950.0,
      "installation_hours": 5.0,
      "technician_hourly_rate": 420.0,
      "labor_cost_inr": 2100.0,
      "total_project_cost_inr": 190050.0,
      "project_profit_inr": -90050.0,
      "profit_margin_pct": -90.0
    }
  ]
};

