# import frappe

def get_context(context):
	print(context)
	# do your magic here
	# pass

import frappe
from frappe.utils import random_string
@frappe.whitelist(allow_guest=True)
def create_user_and_supplier():
    pass
    # user = frappe.get_doc({
    #     'doctype': 'User',
    #     'email': "myemail@email.com",
    #     'first_name': "from code"
    # })
    
    # # Set password for the user
    # # user.new_password = random_string(10)
    # user.save(ignore_permissions=True)
    # user.add_roles("Supplier")
    # user.submit()
    # frappe.db.commit()
    # return user
    # Create Supplier
    # supplier = frappe.get_doc({
    #     'doctype': 'Supplier',
    #     'supplier_name': doc.organization_name,
    #     # Add other relevant fields here
    # })
    # supplier.insert()
# Attach the method to the Organization DocType
def setup_hooks():
    frappe.get_doc('Register Organization').before_insert = create_user_and_supplier
