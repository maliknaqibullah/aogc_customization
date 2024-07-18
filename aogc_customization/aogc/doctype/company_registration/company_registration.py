# Copyright (c) 2024, AOGC and contributors
# For license information, please see license.txt

import json
import os
import frappe
from frappe.model.document import Document
import random
import string
import traceback  # Import traceback module to get detailed error message

class CompanyRegistration(Document):
	pass


@frappe.whitelist()
def approve_organization(data):
    try:
        data_dict = json.loads(data)
        supplier_name = data_dict.get('organization_name')

        # Create address
        address = create_address(data_dict)

        # Create supplier
        supplier = create_supplier(data_dict, address)

        # Save supplier and attachments
        save_supplier_with_attachments(supplier, supplier_name)

        # Check if user already exists
        existing_user = frappe.get_value('User', {'email': data_dict.get('official_email')})
        if existing_user:
            return f"User already exists for email: {data_dict.get('official_email')}"

        # Create user for the supplier and assign role
        user_password = create_supplier_user(supplier_name, data_dict.get('official_email'))

        return "success" 

    except Exception as e:
        error_message = f"Error approving organization: {str(e)}"
        frappe.log_error(error_message[:140], "Approve Organization")
        return f"Error: {str(e)}"

def create_address(data_dict):
    return frappe.get_doc({
        'doctype': 'Address',
        'address_title': data_dict.get('organization_name'),
        'address_type': "Office",
        'email_id': data_dict.get('official_email'),
        'country': data_dict.get('country'),
        'phone': data_dict.get('organization_phone'),
        'address_line1': data_dict.get('organization_address'),
        'city': data_dict.get('city'),
        'county': data_dict.get('city'),
        'state': data_dict.get('city')
    })

def create_supplier(data_dict, address):
    return frappe.get_doc({
        'doctype': 'Supplier',
        'supplier_name': data_dict.get('organization_name'),
        'supplier_group': data_dict.get('tender_service_type'),
        'country': data_dict.get('country'),
        'supplier_type': data_dict.get('organization_type'),
        'custom_establish_date': data_dict.get('establish_date'),
        'tax_id': data_dict.get('tin_number'),
        'custom_license_number': data_dict.get('license_number'),
        'custom_license_issue_date': data_dict.get('license_issue_date'),
        'custom_license_expiry_date': data_dict.get('license_expiry_date'),
        'supplier_primary_address': address
    })

def save_supplier_with_attachments(supplier, supplier_name):
    try:
        supplier.save(ignore_permissions=True)
        frappe.db.commit()

        company_doc = frappe.get_doc('Company Registration', supplier_name)

        # Process logo attachment
        logo_url = getattr(company_doc, 'logo')
        if logo_url:
            logo_file_doc = create_file_document(supplier_name, 'logo', logo_url)
            link_file_to_supplier(supplier_name, 'image', logo_file_doc)

        # Process license document attachment
        license_url = getattr(company_doc, 'license_document')
        if license_url:
            license_file_doc = create_file_document(supplier_name, 'license_document', license_url)
            link_file_to_supplier(supplier_name, 'custom_license_document', license_file_doc)

        # Process tin document attachment
        tin_url = getattr(company_doc, 'tin_document')
        if tin_url:
            tin_file_doc = create_file_document(supplier_name, 'tin_document', tin_url)
            link_file_to_supplier(supplier_name, 'custom_tax_document', tin_file_doc)

        frappe.db.commit()
    except Exception as e:
        error_message = f"Error saving supplier with attachments: {str(e)}"
        frappe.log_error(error_message[:140], "Save Supplier with Attachments")

def create_file_document(supplier_name, field_name, attachment_url):
    file_name = os.path.basename(attachment_url)

    return frappe.get_doc({
        'doctype': 'File',
        'file_name': f'{supplier_name}_{field_name}_{file_name}',
        'attached_to_doctype': 'Supplier',
        'attached_to_name': supplier_name,
        'file_url': attachment_url
    }).insert(ignore_permissions=True)

def link_file_to_supplier(supplier_name, custom_field_name, file_doc):
    supplier_doc = frappe.get_doc('Supplier', supplier_name)
    supplier_doc.set(custom_field_name, file_doc.file_url)
    supplier_doc.save(ignore_permissions=True)

def create_supplier_user(supplier_name, email):
    try:
        # Check if user already exists
        existing_user = frappe.get_value('User', {'email': email})
        if existing_user:
            return f"User already exists for email: {email}"

        # Generate a random password
        password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

        # Create the User document
        user_doc = frappe.get_doc({
            'doctype': 'User',
            'email': email,
            'first_name': supplier_name,
            'send_welcome_email': True,
            # 'new_password': password,
            'enabled': 1,
            'roles': [{
                'role': 'Supplier'
            }]
        })

        # Save the User document
        user_doc.insert(ignore_permissions=True)
        frappe.db.commit()

        return password  # Return the generated password

    except Exception as e:
        error_message = f"Error creating supplier user: {str(e)}"
        frappe.log_error(error_message[:140], "Create Supplier User")
        raise  # Re-raise the exception to propagate it further


@frappe.whitelist()
def send_rejection_email(company_registration_name, rejection_reason, additional_notes):
    company_registration = frappe.get_doc("Company Registration", company_registration_name)
    if company_registration:
        # Construct email content
        subject = f"Registration Rejected: {company_registration.organization_name}"
        message = f"Dear {company_registration.organization_name},<br><br>\n\nWe regret to inform you that your registration with Afghanistan Oil and Gas Corporation(AOGC) has been rejected for the following reason:<br><br>\n\n{rejection_reason}<br><br> \n\nAdditional Notes: {additional_notes}<br><br> \n\nRegards,<br>\nAfghanistan Oil and Gas Corporation "

        # Send email
        frappe.sendmail(
            recipients=company_registration.official_email,
            subject=subject,
            message=message,
            now=True
        )
        return True
    else:
        return False
    
@frappe.whitelist()
def fetch_comment(code):
    
    comment = frappe.get_doc('Rejection Comment', code)
    return comment
