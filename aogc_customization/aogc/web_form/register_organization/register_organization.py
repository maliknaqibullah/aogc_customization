# import frappe

def get_context(context):
	print(context)
	# do your magic here
	# pass


# your_custom_app/your_custom_app/organization_hooks.py

import frappe
from frappe.utils import random_string

def create_user_and_supplier(doc, method):
    if doc.is_new():
        # Create User
        user = frappe.get_doc({
            'doctype': 'User',
            'email': doc.email_address,
            'first_name': doc.organization_name,
            'send_welcome_email': 0,
            'enabled': 1,
            'user_type': 'System User'
        })
        user.flags.ignore_permissions = True
        user.insert()

        # Set password for the user
        user.new_password = random_string(10)
        user.save(ignore_permissions=True)

        # Create Supplier
        supplier = frappe.get_doc({
            'doctype': 'Supplier',
            'supplier_name': doc.organization_name,
            # Add other relevant fields here
        })
        supplier.insert()

# Attach the method to the Organization DocType
def setup_hooks():
    frappe.get_doc('Register Organization').before_insert = create_user_and_supplier
