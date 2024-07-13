frappe.ready(function() {
	
frappe.ui.form.on('Register Organization', {
    validate: function(frm) {
        // Generate a new password
        var new_password = generateRandomPassword();

        // Set the password for the user associated with the organization
        frappe.call({
            method: 'aogc_customization/aogc_customization/aogc/web_form/register_organization/register_organization.py',
            args: {
                'user_email': frm.doc.email_address,
                'new_password': new_password
            },
            callback: function(response) {
                frappe.msgprint('Password set successfully!');
            }
        });
    }
});


function generateRandomPassword() {
    // Implement your own password generation logic here
    // Example implementation generating a random alphanumeric password
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var password = '';
    for (var i = 0; i < 10; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}


})