/**
 * Bills of Lading test data fixtures and factories
 * Provides mock data for testing BL-related functionality
 */

import type { BillOfLading, BLContainer, ShippingCompany } from '@/types/bl/core';
import type { BLStatus, FreightTerms, ChargeType } from '@/types/bl/enums';
import type { FreightCharge } from '@/types/bl/charges';

/**
 * Creates mock shipping company data
 */
export function createMockShippingCompanyData(overrides: Partial<ShippingCompany> = {}): Omit<ShippingCompany, 'id' | 'created_at' | 'updated_at'> {
  const defaults: Omit<ShippingCompany, 'id' | 'created_at' | 'updated_at'> = {
    name: 'Test Shipping Lines',
    code: 'TSL',
    scac_code: 'TSLU',
    contact_info: {
      email: 'operations@testshipping.com',
      phone: '+1234567890',
      website: 'https://testshipping.com'
    },
    address: {
      street: '123 Port Street',
      city: 'Test Harbor',
      postal_code: '12345',
      country: 'US',
      region: 'Test State'
    },
    is_active: true,
    services: ['ocean_freight', 'container_shipping'],
    metadata: {
      test_company: true,
      created_for: 'automated_testing'
    }
  };

  return {
    ...defaults,
    ...overrides,
    contact_info: {
      ...defaults.contact_info,
      ...overrides.contact_info
    },
    address: {
      ...defaults.address,
      ...overrides.address
    },
    metadata: {
      ...defaults.metadata,
      ...overrides.metadata
    }
  };
}

/**
 * Creates mock container data
 */
export function createMockBLContainerData(overrides: Partial<BLContainer> = {}): Omit<BLContainer, 'id'> {
  const defaults: Omit<BLContainer, 'id'> = {
    bill_of_lading_id: 'test-bl-id',
    container_number: `TSTU${Math.random().toString().slice(2, 9)}0`,
    container_type: '20GP',
    seal_numbers: [`SL${Math.random().toString().slice(2, 8)}`],
    gross_weight_kg: 15000,
    net_weight_kg: 12000,
    volume_m3: 33.2,
    cargo_description: 'Test Cargo - General Merchandise',
    marks_and_numbers: 'TEST/001-100',
    package_count: 100,
    package_type: 'CTNS',
    status: 'loaded',
    temperature_controlled: false,
    hazardous_materials: false,
    customs_hold: false,
    damage_reported: false,
    metadata: {
      test_container: true,
      loading_port: 'TEST',
      discharge_port: 'DEST'
    }
  };

  return {
    ...defaults,
    ...overrides,
    metadata: {
      ...defaults.metadata,
      ...overrides.metadata
    }
  };
}

/**
 * Creates mock freight charge data
 */
export function createMockFreightChargeData(overrides: Partial<FreightCharge> = {}): Omit<FreightCharge, 'id'> {
  const defaults: Omit<FreightCharge, 'id'> = {
    bill_of_lading_id: 'test-bl-id',
    charge_type: 'ocean_freight',
    description: 'Ocean Freight Charges',
    amount: 1500.00,
    currency: 'USD',
    quantity: 1,
    rate: 1500.00,
    unit: 'per_container',
    is_prepaid: true,
    charge_category: 'freight',
    applicable_to: 'all_containers',
    metadata: {
      test_charge: true,
      rate_type: 'standard'
    }
  };

  return {
    ...defaults,
    ...overrides,
    metadata: {
      ...defaults.metadata,
      ...overrides.metadata
    }
  };
}

/**
 * Creates mock bill of lading data
 */
export function createMockBillOfLadingData(overrides: Partial<BillOfLading> = {}): Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'> {
  const blNumber = `TST${Date.now().toString().slice(-6)}`;
  
  const defaults: Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'> = {
    bl_number: blNumber,
    master_bl_number: `MST${blNumber.slice(3)}`,
    house_bl_number: null,
    status: 'issued',
    freight_terms: 'prepaid',
    bl_type: 'original',
    
    // Parties
    shipper: {
      name: 'Test Shipper Company',
      address: {
        street: '456 Shipper Avenue',
        city: 'Origin City',
        postal_code: '54321',
        country: 'US',
        region: 'Origin State'
      },
      contact_info: {
        email: 'shipper@testcompany.com',
        phone: '+1987654321'
      }
    },
    
    consignee: {
      name: 'Test Consignee Ltd',
      address: {
        street: '789 Consignee Road',
        city: 'Destination City',
        postal_code: '98765',
        country: 'DE',
        region: 'Destination Region'
      },
      contact_info: {
        email: 'consignee@testcompany.de',
        phone: '+49123456789'
      }
    },
    
    notify_party: {
      name: 'Test Notify Party',
      address: {
        street: '321 Notify Street',
        city: 'Notification City',
        postal_code: '11223',
        country: 'DE'
      },
      contact_info: {
        email: 'notify@testparty.de'
      }
    },

    // Shipping details
    shipping_company_id: 'test-shipping-company-id',
    vessel_name: 'TEST VESSEL',
    voyage_number: 'TV001',
    
    port_of_loading: {
      code: 'USNYC',
      name: 'New York',
      country: 'US'
    },
    
    port_of_discharge: {
      code: 'DEHAM',
      name: 'Hamburg',
      country: 'DE'
    },
    
    place_of_receipt: {
      code: 'USNYC',
      name: 'New York Container Terminal'
    },
    
    place_of_delivery: {
      code: 'DEHAM',
      name: 'Hamburg Container Port'
    },

    // Dates
    date_of_receipt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    shipped_on_board_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    estimated_departure: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    estimated_arrival: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now

    // Cargo details
    cargo_description: 'Test Merchandise - General Cargo',
    total_containers: 2,
    total_packages: 200,
    total_gross_weight: 30000,
    total_net_weight: 24000,
    total_volume: 66.4,
    
    freight_and_charges_summary: {
      total_freight: 3000.00,
      total_charges: 500.00,
      currency: 'USD',
      prepaid_amount: 3500.00,
      collect_amount: 0.00
    },

    // Administrative
    issued_date: new Date().toISOString(),
    issued_at: 'New York',
    issued_by: 'Test Agent',
    number_of_originals: 3,
    
    special_instructions: 'Handle with care. Test shipment for automated testing.',
    
    tags: ['test', 'automated', 'sample'],
    
    // Tracking and status
    is_released: false,
    release_date: null,
    telex_release: false,
    amendment_count: 0,
    
    // Metadata
    metadata: {
      test_bl: true,
      created_by_test_suite: true,
      test_scenario: 'standard_shipment'
    },

    // Audit fields
    created_by: 'test-user-id',
    updated_by: 'test-user-id',
    deleted_at: null,
    deletion_reason: null
  };

  return {
    ...defaults,
    ...overrides,
    shipper: {
      ...defaults.shipper,
      ...overrides.shipper,
      address: {
        ...defaults.shipper.address,
        ...overrides.shipper?.address
      },
      contact_info: {
        ...defaults.shipper.contact_info,
        ...overrides.shipper?.contact_info
      }
    },
    consignee: {
      ...defaults.consignee,
      ...overrides.consignee,
      address: {
        ...defaults.consignee.address,
        ...overrides.consignee?.address
      },
      contact_info: {
        ...defaults.consignee.contact_info,
        ...overrides.consignee?.contact_info
      }
    },
    notify_party: overrides.notify_party ? {
      ...defaults.notify_party,
      ...overrides.notify_party,
      address: {
        ...defaults.notify_party!.address,
        ...overrides.notify_party?.address
      },
      contact_info: {
        ...defaults.notify_party!.contact_info,
        ...overrides.notify_party?.contact_info
      }
    } : defaults.notify_party,
    freight_and_charges_summary: {
      ...defaults.freight_and_charges_summary,
      ...overrides.freight_and_charges_summary
    },
    metadata: {
      ...defaults.metadata,
      ...overrides.metadata
    }
  };
}

/**
 * Creates mock draft bill of lading
 */
export function createMockDraftBillOfLadingData(overrides: Partial<BillOfLading> = {}): Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'> {
  return createMockBillOfLadingData({
    status: 'draft',
    bl_number: `DFT${Date.now().toString().slice(-6)}`,
    issued_date: null,
    shipped_on_board_date: null,
    is_released: false,
    ...overrides
  });
}

/**
 * Creates mock telex release bill of lading
 */
export function createMockTelexReleaseBillOfLadingData(overrides: Partial<BillOfLading> = {}): Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'> {
  return createMockBillOfLadingData({
    telex_release: true,
    is_released: true,
    release_date: new Date().toISOString(),
    number_of_originals: 0, // No physical originals for telex release
    special_instructions: 'TELEX RELEASE - No original BL required for cargo release',
    ...overrides
  });
}

/**
 * Creates mock express bill of lading
 */
export function createMockExpressBillOfLadingData(overrides: Partial<BillOfLading> = {}): Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'> {
  return createMockBillOfLadingData({
    bl_type: 'express',
    telex_release: true,
    is_released: true,
    release_date: new Date().toISOString(),
    special_instructions: 'EXPRESS RELEASE - Consignee can collect cargo without presenting original BL',
    ...overrides
  });
}

/**
 * Factory class for creating multiple related Bills of Lading
 */
export class BillOfLadingFactory {
  private counter: number = 0;
  private baseShippingCompanyId: string;

  constructor(baseShippingCompanyId: string = 'test-shipping-company') {
    this.baseShippingCompanyId = baseShippingCompanyId;
  }

  /**
   * Creates a batch of BLs with different statuses
   */
  createStatusVarietyBatch(count: number = 6): Array<Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'>> {
    const statuses: BLStatus[] = ['draft', 'issued', 'shipped', 'in_transit', 'delivered', 'released'];
    const bls: Array<Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'>> = [];

    for (let i = 0; i < count; i++) {
      const status = statuses[i % statuses.length];
      const blNumber = `BATCH${this.counter++}${status.toUpperCase().slice(0, 3)}`;
      
      bls.push(createMockBillOfLadingData({
        bl_number: blNumber,
        status,
        shipping_company_id: this.baseShippingCompanyId,
        cargo_description: `Test cargo batch ${i + 1} - ${status} status`,
        metadata: {
          test_bl: true,
          batch_index: i,
          status_test: true
        }
      }));
    }

    return bls;
  }

  /**
   * Creates a batch of BLs with different freight terms
   */
  createFreightTermsVarietyBatch(): Array<Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'>> {
    const freightTerms: FreightTerms[] = ['prepaid', 'collect', 'third_party'];
    
    return freightTerms.map((terms, index) => createMockBillOfLadingData({
      bl_number: `FRT${this.counter++}${terms.toUpperCase().slice(0, 3)}`,
      freight_terms: terms,
      shipping_company_id: this.baseShippingCompanyId,
      cargo_description: `Test cargo with ${terms} freight terms`,
      freight_and_charges_summary: {
        total_freight: 2000 + (index * 500),
        total_charges: 300,
        currency: 'USD',
        prepaid_amount: terms === 'prepaid' ? 2300 + (index * 500) : 0,
        collect_amount: terms === 'collect' ? 2300 + (index * 500) : 0
      }
    }));
  }

  /**
   * Creates BLs for performance testing
   */
  createPerformanceTestBatch(count: number = 100): Array<Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'>> {
    const bls: Array<Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'>> = [];
    const statuses: BLStatus[] = ['issued', 'shipped', 'in_transit', 'delivered'];
    const freightTerms: FreightTerms[] = ['prepaid', 'collect'];

    for (let i = 0; i < count; i++) {
      bls.push(createMockBillOfLadingData({
        bl_number: `PERF${String(i).padStart(4, '0')}`,
        status: statuses[i % statuses.length],
        freight_terms: freightTerms[i % freightTerms.length],
        shipping_company_id: this.baseShippingCompanyId,
        cargo_description: `Performance test cargo ${i + 1}`,
        total_containers: Math.floor(Math.random() * 5) + 1,
        total_packages: (Math.floor(Math.random() * 500) + 50) * Math.ceil((i + 1) / 10),
        tags: ['performance', 'test', `batch-${Math.floor(i / 20)}`],
        metadata: {
          test_bl: true,
          performance_test: true,
          batch_id: Math.floor(i / 20),
          sequence: i
        }
      }));
    }

    return bls;
  }

  /**
   * Creates BLs with associated containers and charges
   */
  createCompleteShipmentBatch(count: number = 5): Array<{
    bl: Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'>;
    containers: Array<Omit<BLContainer, 'id'>>;
    charges: Array<Omit<FreightCharge, 'id'>>;
  }> {
    const shipments: Array<{
      bl: Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'>;
      containers: Array<Omit<BLContainer, 'id'>>;
      charges: Array<Omit<FreightCharge, 'id'>>;
    }> = [];

    for (let i = 0; i < count; i++) {
      const blId = `complete-bl-${this.counter++}`;
      const containerCount = Math.floor(Math.random() * 3) + 1; // 1-3 containers
      
      const bl = createMockBillOfLadingData({
        bl_number: `CMP${String(this.counter).padStart(3, '0')}`,
        shipping_company_id: this.baseShippingCompanyId,
        total_containers: containerCount,
        cargo_description: `Complete shipment ${i + 1} with ${containerCount} containers`
      });

      const containers: Array<Omit<BLContainer, 'id'>> = [];
      for (let j = 0; j < containerCount; j++) {
        containers.push(createMockBLContainerData({
          bill_of_lading_id: blId,
          container_number: `CMPU${this.counter}${j}${Math.random().toString().slice(2, 6)}`,
          cargo_description: `Container ${j + 1} cargo for shipment ${i + 1}`
        }));
      }

      const charges: Array<Omit<FreightCharge, 'id'>> = [
        createMockFreightChargeData({
          bill_of_lading_id: blId,
          charge_type: 'ocean_freight',
          amount: 1500 * containerCount,
          quantity: containerCount
        }),
        createMockFreightChargeData({
          bill_of_lading_id: blId,
          charge_type: 'terminal_handling',
          amount: 150 * containerCount,
          quantity: containerCount,
          description: 'Terminal Handling Charges'
        }),
        createMockFreightChargeData({
          bill_of_lading_id: blId,
          charge_type: 'documentation',
          amount: 75,
          quantity: 1,
          description: 'Documentation Fee'
        })
      ];

      shipments.push({ bl, containers, charges });
    }

    return shipments;
  }

  /**
   * Creates BLs with different routing scenarios
   */
  createRoutingScenariosBatch(): Array<Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'>> {
    const scenarios = [
      {
        name: 'direct_route',
        pol: { code: 'USNYC', name: 'New York', country: 'US' },
        pod: { code: 'DEHAM', name: 'Hamburg', country: 'DE' }
      },
      {
        name: 'transshipment',
        pol: { code: 'USNYC', name: 'New York', country: 'US' },
        pod: { code: 'INBOM', name: 'Mumbai', country: 'IN' }
      },
      {
        name: 'inland_delivery',
        pol: { code: 'CNSHA', name: 'Shanghai', country: 'CN' },
        pod: { code: 'DEHAM', name: 'Hamburg', country: 'DE' }
      }
    ];

    return scenarios.map((scenario, index) => createMockBillOfLadingData({
      bl_number: `RTE${this.counter++}${scenario.name.toUpperCase().slice(0, 3)}`,
      port_of_loading: scenario.pol,
      port_of_discharge: scenario.pod,
      shipping_company_id: this.baseShippingCompanyId,
      cargo_description: `Test cargo for ${scenario.name} routing`,
      metadata: {
        test_bl: true,
        routing_scenario: scenario.name,
        scenario_index: index
      }
    }));
  }

  /**
   * Resets the counter for BL numbers
   */
  resetCounter(): void {
    this.counter = 0;
  }

  /**
   * Sets a new base shipping company ID
   */
  setBaseShippingCompanyId(companyId: string): void {
    this.baseShippingCompanyId = companyId;
  }
}

/**
 * Creates common freight charges for a BL
 */
export function createStandardFreightChargesBatch(blId: string): Array<Omit<FreightCharge, 'id'>> {
  const chargeTypes: ChargeType[] = [
    'ocean_freight',
    'terminal_handling',
    'documentation',
    'chassis_usage',
    'fuel_surcharge'
  ];

  return chargeTypes.map(chargeType => createMockFreightChargeData({
    bill_of_lading_id: blId,
    charge_type: chargeType,
    amount: getStandardChargeAmount(chargeType),
    description: getStandardChargeDescription(chargeType)
  }));
}

/**
 * Helper function to get standard charge amounts
 */
function getStandardChargeAmount(chargeType: ChargeType): number {
  const amounts = {
    ocean_freight: 1500,
    terminal_handling: 200,
    documentation: 75,
    chassis_usage: 150,
    fuel_surcharge: 300,
    customs_exam: 250,
    storage: 100,
    demurrage: 500,
    detention: 300,
    other: 50
  };

  return amounts[chargeType] || 100;
}

/**
 * Helper function to get standard charge descriptions
 */
function getStandardChargeDescription(chargeType: ChargeType): string {
  const descriptions = {
    ocean_freight: 'Ocean Freight Charges',
    terminal_handling: 'Terminal Handling Charges',
    documentation: 'Documentation Fee',
    chassis_usage: 'Chassis Usage Fee',
    fuel_surcharge: 'Bunker Adjustment Factor',
    customs_exam: 'Customs Examination Fee',
    storage: 'Container Storage Charges',
    demurrage: 'Demurrage Charges',
    detention: 'Equipment Detention',
    other: 'Miscellaneous Charges'
  };

  return descriptions[chargeType] || 'Additional Charges';
}

/**
 * Utility functions for BL test data manipulation
 */
export const BillOfLadingTestUtils = {
  /**
   * Creates a complete shipping scenario with all related entities
   */
  createCompleteShippingScenario(): {
    shippingCompany: Omit<ShippingCompany, 'id' | 'created_at' | 'updated_at'>;
    billOfLading: Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'>;
    containers: Array<Omit<BLContainer, 'id'>>;
    charges: Array<Omit<FreightCharge, 'id'>>;
  } {
    const shippingCompany = createMockShippingCompanyData({
      name: 'Complete Scenario Shipping',
      code: 'CSS'
    });

    const blId = 'complete-scenario-bl';
    
    const billOfLading = createMockBillOfLadingData({
      bl_number: 'CSS001',
      shipping_company_id: blId,
      total_containers: 2
    });

    const containers = [
      createMockBLContainerData({
        bill_of_lading_id: blId,
        container_number: 'CSSU1234567',
        container_type: '20GP'
      }),
      createMockBLContainerData({
        bill_of_lading_id: blId,
        container_number: 'CSSU7654321',
        container_type: '40HC'
      })
    ];

    const charges = createStandardFreightChargesBatch(blId);

    return {
      shippingCompany,
      billOfLading,
      containers,
      charges
    };
  },

  /**
   * Creates BLs with realistic date progressions
   */
  createDateProgressionBatch(): Array<Omit<BillOfLading, 'id' | 'created_at' | 'updated_at'>> {
    const baseDate = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    return [
      // Recently issued BL
      createMockBillOfLadingData({
        bl_number: 'DATE001',
        status: 'issued',
        issued_date: new Date(baseDate.getTime() - 1 * dayMs).toISOString(),
        date_of_receipt: new Date(baseDate.getTime() - 2 * dayMs).toISOString()
      }),

      // BL with cargo loaded
      createMockBillOfLadingData({
        bl_number: 'DATE002',
        status: 'shipped',
        issued_date: new Date(baseDate.getTime() - 5 * dayMs).toISOString(),
        date_of_receipt: new Date(baseDate.getTime() - 6 * dayMs).toISOString(),
        shipped_on_board_date: new Date(baseDate.getTime() - 3 * dayMs).toISOString(),
        estimated_departure: new Date(baseDate.getTime() - 2 * dayMs).toISOString()
      }),

      // BL in transit
      createMockBillOfLadingData({
        bl_number: 'DATE003',
        status: 'in_transit',
        issued_date: new Date(baseDate.getTime() - 10 * dayMs).toISOString(),
        shipped_on_board_date: new Date(baseDate.getTime() - 8 * dayMs).toISOString(),
        estimated_departure: new Date(baseDate.getTime() - 7 * dayMs).toISOString(),
        estimated_arrival: new Date(baseDate.getTime() + 5 * dayMs).toISOString()
      })
    ];
  }
};