# Bill of Lading JSON Schema Documentation

## Overview
This JSON schema provides a comprehensive representation of a maritime Bill of Lading (BL) document, capturing the complex interactions between shipping companies, cargo, containers, and commercial terms.

## Key Sections

### Identification
- `id`: Unique system identifier
- `bl_number`: Official Bill of Lading number
- `booking_reference`: Optional booking reference
- `export_reference`: Optional export-specific reference
- `service_contract`: Optional service contract details

### Shipping Company
- Includes detailed information about the shipping company
- Captures contact information, identifiers (SCAC code)
- Links shipping company data via `shipping_company_id`

### Party Information
- Structured information for three key parties:
  1. Shipper (`shipper_info`)
  2. Consignee (`consignee_info`)
  3. Optional Notify Party (`notify_party_info`)
- Captures contact details, addresses, tax identifiers

### Transportation Details
- `port_of_loading`: Origin port
- `port_of_discharge`: Destination port
- `place_of_receipt`: Initial cargo receipt location
- `place_of_delivery`: Final delivery location
- Vessel details (name, voyage number, IMO number)

### Commercial Terms
- `freight_terms`: Payment method (prepaid, collect)
- `loading_method`: Cargo loading type (FCL, LCL, RORO)

### Cargo Specification
- Total cargo details: packages, weight, volume
- Declared value information
- Detailed container-level tracking

### Container Details
- Container number and seal information
- Physical specifications
- Loading method
- Arrival and customs tracking

### Status Management
- Comprehensive status tracking
- Lifecycle stages: draft → issued → shipped → discharged → delivered
- Audit trail with creation/update metadata

## Validation Rules

### Required Fields
- Minimum set of fields required for a valid Bill of Lading
- Enforce data integrity and completeness

### Data Types
- Strong typing for all fields
- Format validation (dates, numbers, enums)

### Enumerations
- Predefined lists for status, freight terms, loading methods
- Prevents invalid data entry

## Best Practices
- Use this schema for data validation
- Integrate with database constraints
- Implement server-side and client-side validation

## Extensibility
- Modular design allows future additions
- Optional fields support varied shipping scenarios
- Supports multiple shipping company formats

## Recommended Usage
1. Validate incoming Bill of Lading data
2. Standardize data exchange
3. Enable comprehensive tracking and reporting